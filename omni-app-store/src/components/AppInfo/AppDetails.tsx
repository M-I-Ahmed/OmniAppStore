"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";

interface AppDetailsProps {
  appName: string;
}

interface AppData {
  AppID: string;
  AppName: string;
  Description: string;
  AverageRating: number;
  ReviewCount: number;
  Price: number;
  DeveloperID: string;
  VersionID: string;
  PublicationDate: any;
  Tags: string[];
  CompatibleAssets: string[];
  RecommendedAssets: string[];
  Dependencies: string[];
  TrustScore: number;
  iconURL: string;
}

interface Review {
  id: string;
  Rating: number;
  ReviewText: string;
  ReviewerID: string;
  CreatedAt: any;
}

export default function AppDetails({ appName }: AppDetailsProps) {
  const [appData, setAppData] = useState<AppData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'dependencies' | 'reviews' | 'pricing' | 'similar apps'>('overview');
  const [expandedSections, setExpandedSections] = useState({
    features: false,
    recommendedAssets: false,
    compatibleAssets: false
  });

  useEffect(() => {
    const fetchAppData = async () => {
      try {
        // Find app by name
        const appsRef = collection(db, 'Apps');
        const querySnapshot = await getDocs(appsRef);
        
        let foundApp = null;
        let appDocId = null;

        querySnapshot.forEach((doc) => {
          const data = doc.data() as AppData;
          
          // Try both exact match and trimmed match
          if (data.AppName === appName || data.AppName?.trim() === appName.trim()) {
            foundApp = data;
            appDocId = doc.id;
          }
        });

        if (foundApp && appDocId) {
          setAppData(foundApp);

          // Fetch reviews for this app
          try {
            const reviewsRef = collection(db, 'Apps', appDocId, 'Reviews');
            const reviewsSnapshot = await getDocs(reviewsRef);
            
            const reviewsData = reviewsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as Review));
            
            setReviews(reviewsData);
          } catch (reviewError) {
            console.error('Error fetching reviews:', reviewError);
            setReviews([]);
          }
        } else {
          setError('App not found');
        }
      } catch (err) {
        console.error('Error fetching app data:', err);
        setError('Error loading app details');
      } finally {
        setLoading(false);
      }
    };

    if (appName) {
      fetchAppData();
    }
  }, [appName]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= rating ? "text-yellow-400" : "text-gray-500"}>
          {i <= rating ? "★" : "☆"}
        </span>
      );
    }
    return stars;
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-400 shadow-lg shadow-blue-500/50"></div>
      </div>
    );
  }

  if (error || !appData) {
    return (
      <div className="text-center py-20">
        <p className="text-red-400 text-xl">{error || 'App not found'}</p>
      </div>
    );
  }

  return (
    <div className="flex gap-8 w-full max-w-7xl mx-auto">
      {/* Main Content Panel */}
      <div className="flex-1">
        <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-8">
          {/* App Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {appData.AppName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">{appData.AppName}</h1>
              <p className="text-gray-400 text-lg">App Tagline</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-8 mb-8 border-b border-gray-700">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-1 ${
                activeTab === 'overview'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('dependencies')}
              className={`pb-3 px-1 ${
                activeTab === 'dependencies'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Dependencies
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-3 px-1 ${
                activeTab === 'reviews'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Reviews
            </button>
            <button
              onClick={() => setActiveTab('similar apps')}
              className={`pb-3 px-1 ${
                activeTab === 'similar apps'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Similar Apps
            </button>
            <button
              onClick={() => setActiveTab('pricing')}
              className={`pb-3 px-1 ${
                activeTab === 'pricing'
                  ? 'text-cyan-400 border-b-2 border-cyan-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pricing
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div>
              {/* Description */}
              <div className="mb-8">
                <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Description</h2>
                <p className="text-gray-300 leading-relaxed">{appData.Description}</p>
              </div>

              {/* Expandable Sections */}
              <div className="space-y-4">
                {/* Features */}
                <div className="bg-gray-700/30 rounded-lg">
                  <button
                    onClick={() => toggleSection('features')}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-white font-medium">Features</span>
                    <svg
                      className={`w-5 h-5 text-cyan-400 transition-transform ${
                        expandedSections.features ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.features && (
                    <div className="px-4 pb-4">
                      <div className="flex flex-wrap gap-2">
                        {appData.Tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Recommended Assets */}
                <div className="bg-gray-700/30 rounded-lg">
                  <button
                    onClick={() => toggleSection('recommendedAssets')}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-white font-medium">Recommended Assets</span>
                    <svg
                      className={`w-5 h-5 text-cyan-400 transition-transform ${
                        expandedSections.recommendedAssets ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.recommendedAssets && (
                    <div className="px-4 pb-4">
                      <ul className="space-y-2 text-gray-300">
                        {appData.RecommendedAssets.map((asset, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                            {asset}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Compatible Assets */}
                <div className="bg-gray-700/30 rounded-lg">
                  <button
                    onClick={() => toggleSection('compatibleAssets')}
                    className="w-full flex items-center justify-between p-4 text-left"
                  >
                    <span className="text-white font-medium">Compatible Assets</span>
                    <svg
                      className={`w-5 h-5 text-cyan-400 transition-transform ${
                        expandedSections.compatibleAssets ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {expandedSections.compatibleAssets && (
                    <div className="px-4 pb-4">
                      <ul className="space-y-2 text-gray-300">
                        {appData.CompatibleAssets.map((asset, index) => (
                          <li key={index} className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                            {asset}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dependencies' && (
            <div>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Dependencies</h2>
              <div className="space-y-3">
                {appData.Dependencies.map((dependency, index) => (
                  <div key={index} className="bg-gray-700/30 rounded-lg p-4">
                    <span className="text-white">{dependency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Reviews</h2>
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-gray-700/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex">{renderStars(review.Rating)}</div>
                      <span className="text-gray-400 text-sm">by {review.ReviewerID}</span>
                      <span className="text-gray-500 text-xs">• {formatDate(review.CreatedAt)}</span>
                    </div>
                    <p className="text-gray-300">{review.ReviewText}</p>
                  </div>
                ))}
                {reviews.length === 0 && (
                  <p className="text-gray-400">No reviews available for this app.</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'similar apps' && (
            <div>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Similar Apps</h2>
              <div className="space-y-3">
                {/* Similar apps would be listed here */}
                <h2>  Example similar apps would be listed here</h2>
              </div>
            </div>
          )}

          {activeTab === 'pricing' && (
            <div>
              <h2 className="text-2xl font-semibold text-cyan-400 mb-4">Pricing</h2>
              <div className="space-y-3">
                {/* Pricing details would be listed here */}
                <h2>  Example pricing details would be listed here</h2>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Side Panel */}
      <div className="w-80">
        <div className="sticky top-32 space-y-6">
          {/* App Preview */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg shadow-blue-500/25">
            <button className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 
                             rounded-xl text-white font-semibold
                             transition-all duration-200 shadow-lg
                             shadow-blue-500/25">
              Get Application
            </button>

            {/* Section for developer info */}
            <div className="mt-6">
                <h2 className=" items-center justify-center text-center font-medium text-gray-300 mb-3">Developed by Omni Digital Solutions.</h2>
            </div>

            <div className="flex flex-row justify-center items-center gap-6 mt-3 p-3">
              <span className="px-4 py-1 bg-green-500/20 text-green-400 text-sm rounded-full max-w-30 text-center shadow-lg shadow-green-500/15 border-green-400/40 border-2">
                Verified Developer
              </span>
              <span className=" flex flex-col px-4 py-1 bg-purple-500/20 text-purple-400 text-sm rounded-full max-w-25 text-center shadow-lg shadow-purple-500/15 border-purple-400/40 border-2">
                ISO Certified
              </span>
            </div>
            <div className="flex flex-row justify-center items-center gap-1 mt-3">
              <h2 className="text-gray-400 text-m text-left w-45">Have a query?</h2>
              <button className="w-50 px-2 py-3 bg-blue-600/20 hover:bg-blue-700 
                             rounded-3xl text-sm
                             transition-all duration-200 shadow-lg
                             shadow-blue-500/25 border-blue-400/60 border-2
                             text-white/70">
                Get Support
              </button>
            </div>
          </div>

          {/* Trust Score Box */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg shadow-blue-500/25">
            <div className="flex justify-center mb-4">
              <span className="px-4 py-2 bg-green-600/20 text-green-400 rounded-full 
                               border border-green-500/30 shadow-lg shadow-green-500/25">
                Trusted
              </span>
            </div>
            <p className="text-center text-gray-400">Trust Score: {appData.TrustScore}/100</p>
          </div>

          {/* App Details Box */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6 shadow-lg shadow-blue-500/25">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Version:</span>
                <span className="text-white">{appData.VersionID}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Price:</span>
                <span className="text-white">{appData.Price === 0 ? 'Free' : `$${appData.Price}`}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Published:</span>
                <span className="text-white">{formatDate(appData.PublicationDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rating:</span>
                <span className="text-white flex items-center gap-1">
                  {appData.AverageRating}/5 
                  <div className="flex ml-1">{renderStars(Math.round(appData.AverageRating))}</div>
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Reviews:</span>
                <span className="text-white">{appData.ReviewCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}