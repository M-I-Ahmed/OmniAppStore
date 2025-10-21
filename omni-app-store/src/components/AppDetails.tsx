"use client";

import Image from "next/image";
import AppTabs from "./AppDetailTabs";
import DropDownDescription from "./DropDownDescription";

interface AppDetailsProps {
  appName: string;
  tagline?: string;
}

export default function AppDetails({ appName, tagline = "App Tagline" }: AppDetailsProps) {
  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      content: null // Content is handled directly in AppTabs
    },
    {
      id: 'dependencies',
      label: 'Dependencies',
      content: (
        <div className="space-y-4">
          <ul className="list-disc pl-4 text-gray-400">
            <li>Dependency 1</li>
            <li>Dependency 2</li>
            <li>Dependency 3</li>
          </ul>
        </div>
      )
    },
    {
        id: 'reviews',
        label: 'Reviews',
        content: (
          <div className="space-y-4">
            <p className="text-gray-400">User reviews will be displayed here.</p>
          </div>
        )
    }
  ];

  return (
    <div className="flex gap-8 w-full max-w-7xl mx-auto">
      {/* Main Content Panel */}
      <div className="flex-1">
        <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-lg shadow-blue-500/25">
          {/* Top Section with App Info */}
          <div className="p-8 border-b border-white/10 ">
            <div className="flex items-start gap-8">
              {/* Left: App Icon/Image */}
              <div className="w-32 h-32 relative rounded-xl overflow-hidden bg-white/5">
                <Image
                  src="/gallery-icon.png"
                  alt={appName}
                  width={128}
                  height={128}
                  className="object-cover"
                />
              </div>
              
              {/* Right: App Info */}
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-white mb-2">{appName}</h1>
                <p className="text-gray-400 text-lg">{tagline}</p>
              </div>
            </div>
          </div>

          {/* Tabs Section */}
          <AppTabs tabs={tabs} />
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
              Install Application
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



          </div>

          {/* Developer Info */}
          <div className="bg-white/5 backdrop-blur-md rounded-xl border border-white/10 p-6">
            <h3 className="text-lg font-medium text-white mb-3"></h3>
            <div className="flex items-center gap-2 mb-4">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-sm rounded-full shadow-lg shadow-green-500/15 border-green-400/40 border-2">
                Trusted
              </span>
            </div>
            <p className="text-gray-400 text-sm">Trust Badges here</p>
          </div>
        </div>
      </div>
    </div>
  );
}