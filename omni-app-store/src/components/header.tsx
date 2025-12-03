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
                  
                  {/* Menu Items */}
                  <div className="py-1">
                    <button 
                      onClick={handleProfileClick}
                      className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                    >
                      My Profile
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors">
                      My Apps
                    </button>
                    <button className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors">
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