"use client";

import { useState } from 'react';

type Tab = {
  id: string;
  label: string;
  content: React.ReactNode;
};

interface AppTabsProps {
  tabs: Tab[];
}

export default function AppTabs({ tabs }: AppTabsProps) {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div>
      {/* Tab Navigation */}
      <div className="border-b border-white/10">
        <nav className="flex px-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 text-gray-400 border-b-2 transition-all duration-200
                ${activeTab === tab.id 
                  ? 'text-cyan-400 border-cyan-400' 
                  : 'border-transparent hover:text-cyan-400 hover:border-cyan-400'}`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="p-8">
        {tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}