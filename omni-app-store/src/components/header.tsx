"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { logOut } from "@/lib/auth";
import LoginFlow from "./LoginFlow";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { user, userProfile, loading } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await logOut();
      showToast("Successfully logged out! 👋", "info");
      setIsUserMenuOpen(false);
    } catch (error) {
      showToast("Error logging out. Please try again.", "error");
    }
  };

  const handleProfileClick = () => {
    if (user?.uid) {
      router.push(`/ProfilePage/${user.uid}`);
      setIsUserMenuOpen(false);
    }
  };

  const headerClasses = `
    relative flex items-center justify-between mb-2 p-6 sticky top-0 z-50 h-20
    transition-all duration-300 ease-in-out
    ${scrolled
      ? "bg-gray-900/95 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-gray-950/95"
      : "bg-transparent"}
  `;

  return (
    <>
      <header className={headerClasses}>
        <div className="flex items-center">
          <button onClick={() => router.push('/')} className="flex items-center">
            <Image
              src="/Omnifactory_logo.png"
              alt="OMNI Logo"
              width={200}
              height={50}
              className="object-contain h-24 w-[250px] ml-24"
              style={{ marginLeft: "12px" }}
              priority
            />
          </button>
        </div>

        <div className="flex items-center gap-6">
          {loading ? (
            // Loading spinner while checking auth state
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          ) : user ? (
            // User is logged in - show user menu with avatar and name
            <div className="user-menu-container relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="
                  flex items-center gap-3 px-4 py-2
                  bg-gray-700/50 hover:bg-blue-600/70
                  rounded-xl transition-all duration-300 ease-in-out
                  shadow-lg hover:shadow-blue-500/50 hover:scale-105
                  text-white font-medium text-sm
                "
              >
                {/* User Avatar */}
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {userProfile?.forename?.charAt(0) || user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                
                {/* User Name */}
                <span className="hidden sm:block">
                  {userProfile?.forename || user.displayName?.split(' ')[0] || 'User'}
                </span>
                
                {/* Dropdown Arrow */}
                <svg 
                  className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-gray-800/95 backdrop-blur-md rounded-xl shadow-2xl border border-gray-700/50 py-2 z-50">
                  {/* User Info Section */}
                  <div className="px-4 py-3 border-b border-gray-700/50">
                    <p className="text-sm font-medium text-white">
                      {userProfile?.forename} {userProfile?.surname}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    {userProfile?.organisation && (
                      <p className="text-xs text-gray-500 mt-1">{userProfile.organisation}</p>
                    )}
                  </div>
                  
                  {/* Consumer Menu Items */}
                  <div className="py-1">
                    <button 
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      My Profile
                    </button>
                    <button 
                      onClick={() => { router.push('/AllApps'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Browse Apps
                    </button>
                    <button 
                      onClick={() => { router.push('/my-assets'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                      My Assets
                    </button>
                  </div>
                  
                  {/* Developer Section - Progressive Disclosure */}
                  {!userProfile?.isDeveloper ? (
                    <div className="border-t border-gray-700/50">
                      <button 
                        onClick={() => { 
                          router.push(`/ProfilePage/${user.uid}?openDeveloper=true`); 
                          setIsUserMenuOpen(false); 
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                        Become a Developer
                      </button>
                    </div>
                  ) : userProfile.developerStatus === 'verified' ? (
                    <div className="border-t border-gray-700/50 py-1">
                      <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Developer
                      </div>
                      <button 
                        onClick={() => { router.push('/developer/dashboard'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Dashboard
                      </button>
                      <button 
                        onClick={() => { router.push('/developer/apps'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        My Published Apps
                      </button>
                      <button 
                        onClick={() => { router.push('/developer/upload'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Upload App
                      </button>
                      <button 
                        onClick={() => { router.push('/developer/analytics'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Analytics
                      </button>
                      <button 
                        onClick={() => { router.push('/developer/earnings'); setIsUserMenuOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Earnings
                      </button>
                    </div>
                  ) : userProfile.developerStatus === 'pending' ? (
                    <div className="border-t border-gray-700/50">
                      <div className="px-4 py-3 text-sm text-yellow-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Developer Application Pending
                      </div>
                    </div>
                  ) : null}
                  
                  {/* Account Settings Section */}
                  <div className="border-t border-gray-700/50 py-1">
                    <button 
                      onClick={() => { router.push('/settings'); setIsUserMenuOpen(false); }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Settings
                    </button>
                  </div>
                  
                  {/* Logout Section */}
                  <div className="border-t border-gray-700/50 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
                    >
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // User is not logged in - show login button
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="
                px-4 py-2
                bg-gray-700/50 
                rounded-xl 
                flex items-center justify-center 
                hover:bg-blue-600/70 
                transition-all duration-300 ease-in-out 
                cursor-pointer 
                shadow-lg 
                hover:shadow-blue-500/50
                hover:scale-105
                text-white font-medium text-sm
              "
            >
              Login
            </button>
          )}
        </div>
      </header>

      {/* Login Modal */}
      <LoginFlow 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Scrolled gradient effect */}
      {scrolled && (
        <div
          className="pointer-events-none absolute left-0 bottom-0 w-full h-24 rounded-b-2xl transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to bottom, rgba(31,41,55,0.0) 0%, rgba(31,41,55,0.7) 100%)",
          }}
        />
      )}
    </>
  );
}