"use client";

import { useState } from "react";

interface DropDownProps {
  title: string;
  children: React.ReactNode;
}

export default function DropDownDescription({ title, children }: DropDownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 text-left 
                   bg-white/5 hover:bg-white/10 backdrop-blur-md
                   rounded-lg transition-all duration-200"
      >
        <span className="text-xl text-gray-200/80 font-medium">{title}</span>
        <svg
          className={`w-4 h-4 text-cyan-400 transition-transform duration-200 
                    ${isOpen ? 'transform rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      
      {isOpen && (
        <div className="mt-2 px-4 py-3 bg-white/5 backdrop-blur-sm rounded-lg">
          {children}
        </div>
      )}
    </div>
  );
}
