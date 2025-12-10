'use client';

import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Asset } from '@/types/asset';
import { useAuth } from '@/contexts/AuthContext';
import { logUserEvent } from '@/lib/eventLogger';

interface AddAssetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssetAdded?: () => void;
}

type View = 'search' | 'create';

export default function AddAssetModal({ isOpen, onClose, onAssetAdded }: AddAssetModalProps) {
  const { user } = useAuth();
  const [currentView, setCurrentView] = useState<View>('search');
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Create form state
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [assetClass, setAssetClass] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isProcessingPdf, setIsProcessingPdf] = useState(false);
  const [aiFilledFields, setAiFilledFields] = useState<Set<string>>(new Set());

  const assetClasses = [
    'CNC Machine',
    'Robot Arm',
    'Conveyor System',
    'Assembly Station',
    'Inspection Equipment',
    'Welding Equipment',
    'Packaging Machine',
    'Material Handling',
    'Press Machine',
    'Lathe',
    'Mill',
    'Sensor',
    'Controller',
    'Other'
  ];

  useEffect(() => {
    if (isOpen && user) {
      fetchAssets();
      resetForm();
    }
  }, [isOpen, user]);

  const resetForm = () => {
    setCurrentView('search');
    setSearchQuery('');
    setSelectedAssetId('');
    setManufacturer('');
    setModel('');
    setAssetClass('');
    setImageFile(null);
    setImagePreview('');
    setPdfFile(null);
    setAiFilledFields(new Set());
  };

  useEffect(() => {
    if (isOpen && user) {
      fetchAssets();
    }
  }, [isOpen, user]);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const assetsRef = collection(db, 'Assets');
      const assetsSnapshot = await getDocs(assetsRef);
      const assets = assetsSnapshot.docs.map(doc => ({
        asset_id: doc.id,
        ...doc.data()
      })) as Asset[];
      setAllAssets(assets);
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfUpload = async (file: File) => {
    setPdfFile(file);
    setIsProcessingPdf(true);
    
    try {
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', file);
      
      // Call our API endpoint
      const response = await fetch('/api/extract-asset', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      // Handle both success and partial success
      if (result.data) {
        const fieldsFilledByAI = new Set<string>();
        
        if (result.data.manufacturer) {
          setManufacturer(result.data.manufacturer);
          fieldsFilledByAI.add('manufacturer');
        }
        
        if (result.data.model) {
          setModel(result.data.model);
          fieldsFilledByAI.add('model');
        }
        
        if (result.data.assetClass) {
          setAssetClass(result.data.assetClass);
          fieldsFilledByAI.add('assetClass');
        }
        
        setAiFilledFields(fieldsFilledByAI);
        
        // Show custom message if provided, otherwise default
        const message = result.message || (
          fieldsFilledByAI.size > 0 
            ? `${fieldsFilledByAI.size} field(s) auto-filled from filename. Please verify and complete the remaining fields.`
            : 'PDF uploaded successfully. Please fill in the details from your datasheet.'
        );
        alert(message);
      } else {
        // Show error but keep PDF attached
        alert(result.error || 'Could not auto-extract data. Please fill in manually.');
      }
    } catch (error) {
      console.error('Error processing PDF:', error);
      alert('PDF uploaded. Please fill in the details manually by referring to the PDF.');
    } finally {
      setIsProcessingPdf(false);
    }
  };

  const handleImageUpload = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddExistingAsset = async () => {
    if (!selectedAssetId || !user) return;

    try {
      setIsLoading(true);
      const selectedAsset = allAssets.find(a => a.asset_id === selectedAssetId);
      const assetName = selectedAsset?.core_identity?.display_name || 'Unknown Asset';
      
      const userRef = doc(db, 'User_Profiles', user.uid);
      await updateDoc(userRef, {
        myAssets: arrayUnion(selectedAssetId)
      });

      await logUserEvent(
        user.uid,
        'asset_added',
        `Added asset: ${assetName}`,
        `Asset ID: ${selectedAssetId}`
      );

      if (onAssetAdded) onAssetAdded();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error adding asset:', error);
      alert('Failed to add asset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNewAsset = async () => {
    if (!user || !manufacturer || !model || !assetClass) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      
      let imageUrl = '';
      if (imageFile) {
        const imageRef = ref(storage, `assets/${user.uid}/${Date.now()}_${imageFile.name}`);
        await uploadBytes(imageRef, imageFile);
        imageUrl = await getDownloadURL(imageRef);
      }

      // Create new asset in Assets collection
      const newAssetRef = await addDoc(collection(db, 'Assets'), {
        core_identity: {
          manufacturer,
          model_number: model,
          display_name: `${manufacturer} ${model}`,
          asset_category: assetClass,
          image_url: imageUrl
        },
        createdBy: user.uid,
        createdAt: new Date().toISOString()
      });

      // Add to user's myAssets
      const userRef = doc(db, 'User_Profiles', user.uid);
      await updateDoc(userRef, {
        myAssets: arrayUnion(newAssetRef.id)
      });

      await logUserEvent(
        user.uid,
        'asset_created',
        `Created new asset: ${manufacturer} ${model}`,
        `Asset ID: ${newAssetRef.id}`
      );

      if (onAssetAdded) onAssetAdded();
      resetForm();
      onClose();
    } catch (error) {
      console.error('Error creating asset:', error);
      alert('Failed to create asset. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const filteredAssets = allAssets.filter(asset => {
    const query = searchQuery.toLowerCase();
    const displayName = asset.core_identity?.display_name?.toLowerCase() || '';
    const manufacturer = asset.core_identity?.manufacturer?.toLowerCase() || '';
    const modelNumber = asset.core_identity?.model_number?.toLowerCase() || '';
    const category = asset.core_identity?.asset_category?.toLowerCase() || '';
    
    return displayName.includes(query) || 
           manufacturer.includes(query) || 
           modelNumber.includes(query) ||
           category.includes(query);
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h2 className="text-2xl font-bold text-slate-100">
              {currentView === 'search' ? 'Add Asset to Your Shop Floor' : 'Create New Asset'}
            </h2>
            <p className="text-slate-400 text-sm mt-1">
              {currentView === 'search' 
                ? 'Search for existing assets or create a new one' 
                : 'Fill in asset details or let AI help you'}
            </p>
          </div>
          <button
            onClick={() => { resetForm(); onClose(); }}
            className="text-slate-400 hover:text-slate-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {currentView === 'search' ? (
            // SEARCH VIEW
            <div>
              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search by manufacturer, model, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Asset Grid or Empty State */}
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-slate-400">Loading assets...</p>
                </div>
              ) : filteredAssets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-slate-200 mb-2">
                    Can't find what you're looking for?
                  </h3>
                  <p className="text-slate-400 mb-6">
                    No assets match your search. Create a new asset entry for your equipment.
                  </p>
                  <button
                    onClick={() => setCurrentView('create')}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Your Own Asset
                  </button>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                    {filteredAssets.map((asset) => (
                      <button
                        key={asset.asset_id}
                        onClick={() => setSelectedAssetId(asset.asset_id)}
                        className={`p-4 rounded-lg border-2 transition-all text-left ${
                          selectedAssetId === asset.asset_id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-slate-700 hover:border-slate-600 bg-slate-700/50'
                        }`}
                      >
                        <div className="w-full aspect-square bg-slate-600 rounded-md overflow-hidden mb-3 relative">
                          {asset.core_identity?.image_url ? (
                            <img
                              src={asset.core_identity.image_url}
                              alt={asset.core_identity.display_name || 'Asset'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-4xl">
                              🏭
                            </div>
                          )}
                          {selectedAssetId === asset.asset_id && (
                            <div className="absolute top-2 right-2">
                              <svg className="w-6 h-6 text-blue-500 bg-white rounded-full" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-slate-100 text-sm mb-1 line-clamp-2">
                          {asset.core_identity?.display_name || 'Unnamed Asset'}
                        </h4>
                        <p className="text-xs text-slate-400 mb-2">
                          {asset.core_identity?.manufacturer || 'Unknown'}
                        </p>
                        <span className="text-xs px-2 py-1 bg-slate-600 text-slate-300 rounded">
                          {asset.core_identity?.asset_category || 'N/A'}
                        </span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Show "Add Your Own" button even when results exist */}
                  <div className="text-center pt-4 border-t border-slate-700">
                    <p className="text-slate-400 text-sm mb-3">Don't see your asset?</p>
                    <button
                      onClick={() => setCurrentView('create')}
                      className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-lg font-medium transition-colors inline-flex items-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Your Own Asset
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            // CREATE VIEW
            <div className="space-y-6">
              {/* AI Copilot Section */}
              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-100 mb-2">
                      AI Copilot - Upload Datasheet
                    </h3>
                    <p className="text-slate-300 text-sm mb-4">
                      Upload a PDF technical datasheet and let AI extract the asset details for you.
                      You can review and edit any field afterwards.
                    </p>
                    
                    {pdfFile ? (
                      <div className="bg-slate-800 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <svg className="w-8 h-8 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="text-slate-200 font-medium">{pdfFile.name}</p>
                            <p className="text-slate-400 text-xs">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                          </div>
                        </div>
                        <button
                          onClick={() => { setPdfFile(null); setAiFilledFields(new Set()); }}
                          className="text-slate-400 hover:text-red-400 transition-colors"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <label className="block">
                        <input
                          type="file"
                          accept=".pdf"
                          onChange={(e) => e.target.files?.[0] && handlePdfUpload(e.target.files[0])}
                          className="hidden"
                          disabled={isProcessingPdf}
                        />
                        <div className="border-2 border-dashed border-blue-500/50 hover:border-blue-500 rounded-lg p-6 text-center cursor-pointer transition-colors">
                          <svg className="w-12 h-12 text-blue-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="text-slate-300 font-medium mb-1">
                            {isProcessingPdf ? 'Processing PDF...' : 'Upload PDF Datasheet'}
                          </p>
                          <p className="text-slate-500 text-xs">Click to browse or drag and drop</p>
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Manual Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-slate-300 mb-2 font-medium">
                    Manufacturer / Brand <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={manufacturer}
                    onChange={(e) => setManufacturer(e.target.value)}
                    placeholder="e.g., Fanuc, ABB, Siemens"
                    className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      aiFilledFields.has('manufacturer') ? 'border-green-500 bg-green-500/5' : 'border-slate-600'
                    }`}
                  />
                  {aiFilledFields.has('manufacturer') && (
                    <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Filled by AI
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">
                    Model <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="e.g., LR Mate 200iD, IRB 6700"
                    className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      aiFilledFields.has('model') ? 'border-green-500 bg-green-500/5' : 'border-slate-600'
                    }`}
                  />
                  {aiFilledFields.has('model') && (
                    <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Filled by AI
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">
                    Asset Class <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={assetClass}
                    onChange={(e) => setAssetClass(e.target.value)}
                    className={`w-full px-4 py-3 bg-slate-700 border rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      aiFilledFields.has('assetClass') ? 'border-green-500 bg-green-500/5' : 'border-slate-600'
                    }`}
                  >
                    <option value="">Select asset class...</option>
                    {assetClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                  {aiFilledFields.has('assetClass') && (
                    <p className="text-green-400 text-xs mt-1 flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Filled by AI
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-slate-300 mb-2 font-medium">
                    Asset Image
                  </label>
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                      <button
                        onClick={() => { setImageFile(null); setImagePreview(''); }}
                        className="absolute top-2 right-2 p-2 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <div className="border-2 border-dashed border-slate-600 hover:border-slate-500 rounded-lg p-8 text-center cursor-pointer transition-colors">
                        <svg className="w-12 h-12 text-slate-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-slate-300 font-medium mb-1">Upload Image</p>
                        <p className="text-slate-500 text-xs">PNG, JPG up to 10MB</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-700 bg-slate-800/50">
          {currentView === 'create' ? (
            <>
              <button
                onClick={() => setCurrentView('search')}
                className="px-6 py-2.5 text-slate-300 hover:text-slate-100 font-medium transition-colors"
              >
                ← Back to Search
              </button>
              <button
                onClick={handleCreateNewAsset}
                disabled={!manufacturer || !model || !assetClass || isLoading}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  manufacturer && model && assetClass && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Creating...' : 'Create & Add to Shop Floor'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { resetForm(); onClose(); }}
                className="px-6 py-2.5 text-slate-300 hover:text-slate-100 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddExistingAsset}
                disabled={!selectedAssetId || isLoading}
                className={`px-6 py-2.5 rounded-lg font-medium transition-all ${
                  selectedAssetId && !isLoading
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isLoading ? 'Adding...' : 'Add to Shop Floor'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}