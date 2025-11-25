"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import QuickFilterPills from "@/components/HomePage/QuickFilterPills";
import FeaturedApps from "@/components/HomePage/FeaturedApps";
import RecentlyAddedApps from "@/components/HomePage/RecentlyAdded";
import RecommendedApps from "@/components/HomePage/RecommendedApps";
import EssentialApps from "@/components/HomePage/EssentialApps";
import AppTileConnected from "@/components/AppInfoConnected/AppTileConnected";
import { APP_IDS } from '@/config/appIds';

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const headerClasses = `
    relative flex items-center justify-between mb-2 p-6 sticky top-0 z-50 h-20
    transition-all duration-300 ease-in-out
    ${scrolled
      ? "bg-gray-900/95 backdrop-blur-xl border-gray-700/50 shadow-2xl shadow-gray-950/95"
      : "bg-transparent"}
  `;

  const handleExploreApps = () => {
    router.push('/AllApps');
  };

  return (
    <div className="flex flex-col min-h-screen text-white relative ">
      {/* background gradient */}
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
          <div className="
            w-12 h-12
            bg-gray-700/50 
            rounded-xl 
            flex items-center justify-center 
            hover:bg-blue-600/70 
            transition-all duration-300 ease-in-out 
            cursor-pointer 
            shadow-lg 
            hover:shadow-blue-500/50
            hover:scale-105
          ">
            <span className="text-white font-bold text-lg">
              N
            </span>
          </div>
        </div>
      </header>

      {scrolled && (
        <div
          className="pointer-events-none absolute left-0 bottom-0 w-full h-24 rounded-b-2xl transition-opacity duration-300"
          style={{
            background:
              "linear-gradient(to bottom, rgba(31,41,55,0.0) 0%, rgba(31,41,55,0.7) 100%)",
            // The color above matches bg-gray-900, adjust opacity as needed
          }}
        />
      )}

      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="container px-8 flex flex-col items-center">
          <h1 className="text-6xl md:text-6.5xl font-extrabold text-white text-center mt-35">
            Welcome to the Omni App Store
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 font-light text-center mt-8">
            Your industrial application store
          </p>

          {/* Search Bar */}
          <div className="w-full max-w-xl mt-10">
            <div className="flex items-center px-2 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-lg transition-all">
              <input
                type="text"
                placeholder="Unlock new capabilities..."
                className="flex-grow bg-transparent outline-none text-white placeholder-gray-300 text-lg px-2 py-2 "
              />
              {/* Search icon (Heroicons or SVG) */}
              <button
                type="button"
                className="
                  ml-2 flex items-center justify-center
                  h-10 w-10
                  bg-white/10
                  rounded-xl
                  shadow-2xl shadow-blue-500/30
                  hover:bg-blue-500/80
                  transition-all duration-300 ease-in-out
                  hover:scale-105
                  focus:outline-none
                "
                tabIndex={0}
                aria-label="Search"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Pills Container */}
          <div className="w-full mt-8">
            <QuickFilterPills />
          </div>

          <button 
            onClick={handleExploreApps}
            className="
              mt-10 px-8 py-3 
              bg-blue-700/60 backdrop-blur-md 
              border border-blue-600/50 
              rounded-xl 
              text-white text-lg font-semibold 
              shadow-2xl shadow-blue-500/30 
              hover:bg-blue-500/80 
              transition-all duration-300 ease-in-out
              transform hover:scale-[1.03]
            "
          >
            Explore Applications
          </button>

          <FeaturedApps />

          <RecommendedApps />

          <EssentialApps />

          <RecentlyAddedApps />

          {APP_IDS[process.env.NODE_ENV === 'production' ? 'production' : 'development'].featuredApps.map((id) => (
            <AppTileConnected key={id} id={id} />
          ))}
        </div>
      </main>

      {/* <section className="h-screen bg-transparent flex items-center justify-center">
      
      </section> */}
    </div>
  );
}