"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppDetails from "@/components/AppDetails";

interface PageProps {
  params: {
    id: string;
  };
}

export default function AppDetailsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const appName = decodeURIComponent(params.id);
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
      <div className="container px-8">
          {/* Back Navigation */}
          <button
            onClick={() => router.back()}
            className="mb-8 mt-8 px-6 py-3 
                     bg-blue-700/60 backdrop-blur-md 
                     border border-blue-600/50 
                     rounded-xl 
                     text-white text-lg font-semibold 
                     shadow-2xl shadow-blue-500/30 
                     hover:bg-blue-500/80 
                     transition-all duration-300 ease-in-out
                     transform hover:scale-[1.03]
                     flex items-center gap-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back to Apps
          </button>

          <AppDetails appName={appName} />


      </div>
      </main>

      <section className="h-screen bg-transparent flex items-center justify-center">
      
      </section>
    </div>
  );
}