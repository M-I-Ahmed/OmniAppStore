"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/lib/firebase";
import AppTileConnected from "@/components/AppInfoConnected/AppTileConnected";
import { useRouter } from "next/navigation";

interface App {
  id: string;
  AppName: string;
  Tags: string[];
  Price: number;
  AverageRating: number;
  DeveloperID: string;
  CompatibleAssets: string[];
  // Add other fields as needed
}

// Add this type for the dropdown keys
type DropdownKeys = 'category' | 'developer' | 'compatibleAssets' | 'capability' | 'rating' | 'price';

export default function AllAppsPage() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [apps, setApps] = useState<App[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDeveloper, setSelectedDeveloper] = useState("");
  const [selectedCompatibleAsset, setSelectedCompatibleAsset] = useState("");
  const [selectedCapability, setSelectedCapability] = useState("");
  const [selectedRating, setSelectedRating] = useState("");
  const [selectedPriceRange, setSelectedPriceRange] = useState("");

  // Dropdown open states with proper typing
  const [dropdownOpen, setDropdownOpen] = useState<Record<DropdownKeys, boolean>>({
    category: false,
    developer: false,
    compatibleAssets: false,
    capability: false,
    rating: false,
    price: false
  });

  // Filter options
  const categories = ["CNC", "Robotics", "AI/ML", "Predictive Maintenance", "Quality Control", "Safety", "Automation", "IoT", "Analytics", "Manufacturing"];
  const capabilities = ["Real-time Monitoring", "Data Analysis", "Process Optimization", "Quality Inspection", "Maintenance Prediction", "Safety Compliance"];
  const ratingOptions = ["4+ Stars", "3+ Stars", "2+ Stars", "1+ Stars", "All Ratings"];
  const priceRanges = ["Free", "$1 - $50", "$51 - $100", "$101 - $250", "$251 - $500", "$500+"];

  // Fetch apps from Firebase
  useEffect(() => {
    const fetchApps = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'Apps'));
        const appsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as App));
        setApps(appsData);
      } catch (error) {
        console.error('Error fetching apps:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchApps();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Get unique values from apps
  const developers = [...new Set(apps.map(app => app.DeveloperID))];
  const compatibleAssets = [...new Set(apps.flatMap(app => app.CompatibleAssets || []))];

  // Toggle dropdown with proper typing
  const toggleDropdown = (dropdownName: DropdownKeys) => {
    setDropdownOpen(prev => ({
      ...prev,
      [dropdownName]: !prev[dropdownName]
    }));
  };

  // Filter apps based on all criteria
  const filteredApps = apps.filter(app => {
    const matchesSearch = app.AppName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || app.Tags?.includes(selectedCategory);
    const matchesDeveloper = !selectedDeveloper || app.DeveloperID === selectedDeveloper;
    const matchesCompatibleAsset = !selectedCompatibleAsset || app.CompatibleAssets?.includes(selectedCompatibleAsset);
    const matchesRating = !selectedRating || getRatingMatch(app.AverageRating, selectedRating);
    const matchesPrice = !selectedPriceRange || getPriceMatch(app.Price, selectedPriceRange);
    
    return matchesSearch && matchesCategory && matchesDeveloper && matchesCompatibleAsset && matchesRating && matchesPrice;
  });

  const getRatingMatch = (rating: number, selectedRating: string) => {
    if (selectedRating === "All Ratings") return true;
    const minRating = parseInt(selectedRating.split('+')[0]);
    return rating >= minRating;
  };

  const getPriceMatch = (price: number, priceRange: string) => {
    if (priceRange === "Free") return price === 0;
    if (priceRange === "$500+") return price > 500;
    const [min, max] = priceRange.replace('$', '').split(' - ').map(p => parseInt(p));
    return price >= min && price <= max;
  };

  const headerClasses = `
    relative flex items-center justify-between mb-2 p-6 sticky top-0 z-50 h-20
    transition-all duration-300 ease-in-out
    ${scrolled ? "bg-gray-900/95 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-gray-950/95" : "bg-transparent"}
  `;

  return (
    <div className="flex flex-col min-h-screen text-white relative bg-gradient-to-br from-gray-900 via-black to-dark to-blue-950">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-gray-900 via-black to-dark to-blue-950" />

      <header className={headerClasses}>
        <div className="flex items-center">
          <Image
            src="/Omnifactory_logo.png"
            alt="OMNI Logo"
            width={200}
            height={50}
            className="object-contain h-24 w-[250px] ml-24"
            style={{ marginLeft: "12px" }}
            priority
          />
        </div>

        <div className="flex items-center gap-6">
          <div className="w-12 h-12 bg-gray-700/50 rounded-xl flex items-center justify-center hover:bg-blue-600/70 transition-all duration-300 ease-in-out cursor-pointer shadow-lg hover:shadow-blue-500/50 hover:scale-105">
            <span className="text-white font-bold text-lg">N</span>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Header Section */}
        <div className="container px-8 mx-auto text-center">
          <h1 className="text-6xl md:text-6.5xl font-extrabold text-white mt-16">
            Explore All Apps
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light mt-8">
            Discover all available industrial applications
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-xl mt-10 mx-auto">
            <div className="flex items-center px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-600/50">
              <input
                type="text"
                placeholder="Search applications..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-grow bg-transparent outline-none text-white placeholder-gray-400 text-lg"
              />
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="container mx-auto mt-16 px-4">
          <div className="flex gap-8">
            {/* Left Sidebar - Filters */}
            <div className="w-64 flex-shrink-0">
              <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
                <h3 className="text-xl font-semibold text-white mb-6">Filters</h3>
                
                {/* Category Filter */}
                <div className="mb-6">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('category')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-colors"
                    >
                      <span>{selectedCategory || "Category"}</span>
                      <svg className={`w-4 h-4 transition-transform ${dropdownOpen.category ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {dropdownOpen.category && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                        <button
                          onClick={() => { setSelectedCategory(""); toggleDropdown('category'); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                        >
                          All Categories
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category}
                            onClick={() => { setSelectedCategory(category); toggleDropdown('category'); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                          >
                            {category}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Developer Filter */}
                <div className="mb-6">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('developer')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-colors"
                    >
                      <span>{selectedDeveloper || "Developer"}</span>
                      <svg className={`w-4 h-4 transition-transform ${dropdownOpen.developer ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {dropdownOpen.developer && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                        <button
                          onClick={() => { setSelectedDeveloper(""); toggleDropdown('developer'); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                        >
                          All Developers
                        </button>
                        {developers.map((developer) => (
                          <button
                            key={developer}
                            onClick={() => { setSelectedDeveloper(developer); toggleDropdown('developer'); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                          >
                            {developer}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Compatible Assets Filter */}
                <div className="mb-6">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('compatibleAssets')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-colors"
                    >
                      <span>{selectedCompatibleAsset || "Compatible Assets"}</span>
                      <svg className={`w-4 h-4 transition-transform ${dropdownOpen.compatibleAssets ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {dropdownOpen.compatibleAssets && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                        <button
                          onClick={() => { setSelectedCompatibleAsset(""); toggleDropdown('compatibleAssets'); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                        >
                          All Assets
                        </button>
                        {compatibleAssets.map((asset) => (
                          <button
                            key={asset}
                            onClick={() => { setSelectedCompatibleAsset(asset); toggleDropdown('compatibleAssets'); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                          >
                            {asset}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Capability Filter */}
                <div className="mb-6">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('capability')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-colors"
                    >
                      <span>{selectedCapability || "Capability"}</span>
                      <svg className={`w-4 h-4 transition-transform ${dropdownOpen.capability ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {dropdownOpen.capability && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto">
                        <button
                          onClick={() => { setSelectedCapability(""); toggleDropdown('capability'); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                        >
                          All Capabilities
                        </button>
                        {capabilities.map((capability) => (
                          <button
                            key={capability}
                            onClick={() => { setSelectedCapability(capability); toggleDropdown('capability'); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                          >
                            {capability}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Rating Filter */}
                <div className="mb-6">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('rating')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-colors"
                    >
                      <span>{selectedRating || "Rating"}</span>
                      <svg className={`w-4 h-4 transition-transform ${dropdownOpen.rating ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {dropdownOpen.rating && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
                        {ratingOptions.map((rating) => (
                          <button
                            key={rating}
                            onClick={() => { setSelectedRating(rating); toggleDropdown('rating'); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                          >
                            {rating}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Price Filter */}
                <div className="mb-6">
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown('price')}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-700/50 rounded-lg text-gray-300 hover:bg-gray-600/50 transition-colors"
                    >
                      <span>{selectedPriceRange || "Price Range"}</span>
                      <svg className={`w-4 h-4 transition-transform ${dropdownOpen.price ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {dropdownOpen.price && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50">
                        <button
                          onClick={() => { setSelectedPriceRange(""); toggleDropdown('price'); }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                        >
                          All Prices
                        </button>
                        {priceRanges.map((range) => (
                          <button
                            key={range}
                            onClick={() => { setSelectedPriceRange(range); toggleDropdown('price'); }}
                            className="w-full text-left px-4 py-2 hover:bg-gray-700 text-gray-300"
                          >
                            {range}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Clear Filters */}
                <button
                  onClick={() => {
                    setSelectedCategory("");
                    setSelectedDeveloper("");
                    setSelectedCompatibleAsset("");
                    setSelectedCapability("");
                    setSelectedRating("");
                    setSelectedPriceRange("");
                  }}
                  className="w-full px-4 py-2 bg-red-600/20 text-red-400 border border-red-500/50 rounded-lg hover:bg-red-500/30 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>

            {/* Right Content - Apps Grid */}
            <div className="flex-1">
              {loading ? (
                <div className="text-center text-gray-400 py-20">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
                  <p>Loading applications...</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-white">
                      {filteredApps.length} Applications Found
                    </h2>
                  </div>

                  {/* Apps Grid - 4 per row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredApps.map((app) => (
                      <AppTileConnected 
                        key={app.id} 
                        id={app.id}
                        // Remove the icon prop since it's not needed according to your AppTileConnected component
                      />
                    ))}
                  </div>

                  {filteredApps.length === 0 && (
                    <div className="text-center text-gray-400 py-20">
                      <p className="text-xl">No applications found matching your criteria</p>
                      <p className="mt-2">Try adjusting your filters or search terms</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}