"use client";

import { useState } from 'react';
import DropDownDescription from './DropDownDescription';

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
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Description Section */}
            <div className="mb-8">
              <h2 className="text-2xl text-cyan-400 mb-4">Description</h2>
              <p className="text-gray-400">Description of the app goes here</p>
            </div>

            {/* Features Dropdown */}
            <DropDownDescription title="Features">
              <ul className="list-disc pl-4 text-gray-400 space-y-2">
                <li>Feature 1</li>
                <li>Feature 2</li>
                <li>Feature 3</li>
              </ul>
            </DropDownDescription>

            {/* Recommended Assets Dropdown */}
            <DropDownDescription title="Recommended Assets">
              <ul className="list-disc pl-4 text-gray-400 space-y-2">
                <li>Asset 1</li>
                <li>Asset 2</li>
                <li>Asset 3</li>
              </ul>
            </DropDownDescription>

            {/* Compatible Assets Dropdown */}
            <DropDownDescription title="Compatible Assets">
              <ul className="list-disc pl-4 text-gray-400 space-y-2">
                <li>Compatible Asset 1</li>
                <li>Compatible Asset 2</li>
                <li>Compatible Asset 3</li>
              </ul>
            </DropDownDescription>
          </div>
        )}
        {activeTab !== 'overview' && tabs.find(tab => tab.id === activeTab)?.content}
      </div>
    </div>
  );
}