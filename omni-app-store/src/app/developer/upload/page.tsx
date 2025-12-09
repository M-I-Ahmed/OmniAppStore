"use client";

import DeveloperSideNav from '@/components/developer/DeveloperSideNav';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

export default function UploadNewApp() {
  const { user, userProfile, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data
  const [appName, setAppName] = useState('');
  const [appDescription, setAppDescription] = useState('');
  const [appCategory, setAppCategory] = useState('');
  const [appPrice, setAppPrice] = useState('0');
  const [appFile, setAppFile] = useState<File | null>(null);
  const [screenshots, setScreenshots] = useState<File[]>([]);

  useEffect(() => {
    if (!loading && (!user || !userProfile?.isDeveloper || userProfile.developerStatus !== 'verified')) {
      router.push('/');
    }
  }, [user, userProfile, loading, router]);

  const categories = [
    'CNC',
    'Robotics',
    'AI/ML',
    'Predictive Maintenance',
    'Quality Control',
    'Safety',
    'Automation',
    'IoT',
    'Analytics',
    'Manufacturing'
  ];

  const handleNext = () => {
    // Validation for each step
    if (currentStep === 1) {
      if (!appName.trim()) {
        showToast('Please enter an app name', 'error');
        return;
      }
      if (!appDescription.trim()) {
        showToast('Please enter an app description', 'error');
        return;
      }
    }
    
    if (currentStep === 2) {
      if (!appCategory) {
        showToast('Please select a category', 'error');
        return;
      }
    }

    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAppFile(e.target.files[0]);
    }
  };

  const handleScreenshotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).slice(0, 5); // Max 5 screenshots
      setScreenshots(files);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    // Final validation
    if (!appName || !appDescription || !appCategory) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let appFileUrl = '';
      let screenshotUrls: string[] = [];

      // Upload app file if provided
      if (appFile) {
        const appFileRef = ref(storage, `apps/${user.uid}/${Date.now()}_${appFile.name}`);
        await uploadBytes(appFileRef, appFile);
        appFileUrl = await getDownloadURL(appFileRef);
      }

      // Upload screenshots if provided
      if (screenshots.length > 0) {
        for (const screenshot of screenshots) {
          const screenshotRef = ref(storage, `apps/${user.uid}/screenshots/${Date.now()}_${screenshot.name}`);
          await uploadBytes(screenshotRef, screenshot);
          const url = await getDownloadURL(screenshotRef);
          screenshotUrls.push(url);
        }
      }

      // Create app document
      await addDoc(collection(db, 'Apps'), {
        AppName: appName,
        AppDescription: appDescription,
        AppCategory: appCategory,
        AppPrice: parseFloat(appPrice) || 0,
        developerId: user.uid,
        developerName: userProfile?.developerProfile?.companyName || userProfile?.forename || 'Developer',
        appFileUrl,
        screenshots: screenshotUrls,
        status: 'published', // or 'under_review' if you want manual approval
        downloads: 0,
        rating: 0,
        reviews: [],
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      showToast('App uploaded successfully! 🎉', 'success');
      router.push('/developer/apps');
    } catch (error) {
      console.error('Error uploading app:', error);
      showToast('Failed to upload app. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DeveloperSideNav>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DeveloperSideNav>
    );
  }

  if (!user || !userProfile?.isDeveloper) {
    return null;
  }

  return (
    <DeveloperSideNav>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Upload New App
          </h1>
          <p className="text-gray-400">Share your application with the community</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex-1">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    currentStep >= step
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-700 text-slate-400'
                  }`}>
                    {step}
                  </div>
                  {step < 4 && (
                    <div className={`flex-1 h-1 mx-2 transition-all ${
                      currentStep > step ? 'bg-blue-600' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  {step === 1 && 'Basic Info'}
                  {step === 2 && 'Category & Price'}
                  {step === 3 && 'Files & Media'}
                  {step === 4 && 'Review & Submit'}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-cyan-500/20 p-8 shadow-lg min-h-[400px]">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Basic Information</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  App Name *
                </label>
                <input
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="My Awesome App"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={appDescription}
                  onChange={(e) => setAppDescription(e.target.value)}
                  placeholder="Describe what makes your app unique..."
                  rows={6}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <p className="text-xs text-slate-500 mt-1">{appDescription.length}/1000 characters</p>
              </div>
            </div>
          )}

          {/* Step 2: Category & Price */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Category & Pricing</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Category *
                </label>
                <select
                  value={appCategory}
                  onChange={(e) => setAppCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Price (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 text-slate-400">$</span>
                  <input
                    type="number"
                    value={appPrice}
                    onChange={(e) => setAppPrice(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">Set to 0 for free apps</p>
              </div>
            </div>
          )}

          {/* Step 3: Files & Media */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Files & Media</h2>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  App File
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-cyan-500/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="hidden"
                    id="app-file"
                    accept=".zip,.exe,.dmg,.app"
                  />
                  <label htmlFor="app-file" className="cursor-pointer">
                    <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-slate-300 font-medium">Click to upload app file</p>
                    <p className="text-xs text-slate-500 mt-1">ZIP, EXE, DMG, APP (Max 500MB)</p>
                    {appFile && (
                      <p className="text-cyan-400 mt-2 text-sm">{appFile.name}</p>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Screenshots (Max 5)
                </label>
                <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center hover:border-cyan-500/50 transition-colors">
                  <input
                    type="file"
                    onChange={handleScreenshotsChange}
                    className="hidden"
                    id="screenshots"
                    accept="image/*"
                    multiple
                  />
                  <label htmlFor="screenshots" className="cursor-pointer">
                    <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-slate-300 font-medium">Click to upload screenshots</p>
                    <p className="text-xs text-slate-500 mt-1">PNG, JPG (Recommended: 1920x1080)</p>
                    {screenshots.length > 0 && (
                      <p className="text-cyan-400 mt-2 text-sm">{screenshots.length} file(s) selected</p>
                    )}
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Submit */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-white mb-6">Review & Submit</h2>
              
              <div className="space-y-4">
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">App Name</h3>
                  <p className="text-white">{appName}</p>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-slate-400 mb-1">Description</h3>
                  <p className="text-white">{appDescription}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Category</h3>
                    <p className="text-white">{appCategory}</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Price</h3>
                    <p className="text-white">${appPrice}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-1">App File</h3>
                    <p className="text-white">{appFile ? appFile.name : 'Not uploaded'}</p>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-400 mb-1">Screenshots</h3>
                    <p className="text-white">{screenshots.length} file(s)</p>
                  </div>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mt-6">
                  <p className="text-blue-300 text-sm">
                    ✓ Your app will be published immediately. Make sure all information is accurate.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              Back
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg shadow-cyan-500/20"
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-green-500/20"
              >
                {isSubmitting ? 'Uploading...' : 'Publish App'}
              </button>
            )}
          </div>
        </div>
      </div>
    </DeveloperSideNav>
  );
}
