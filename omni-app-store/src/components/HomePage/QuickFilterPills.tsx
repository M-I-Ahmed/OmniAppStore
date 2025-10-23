import React from "react";

const pillData = [
  { label: "Robotics", icon: (
      <svg className="ml-3 h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-6a2 2 0 012-2h2a2 2 0 012 2v6m-6 0h6" /></svg>
    ) },
  { label: "Quality Control", icon: (
      <svg className="ml-3 h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
    ) },
  { label: "AI/ML", icon: (
      <svg className="ml-3 h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth={2} /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8l4-4m-4 0l4 4M8 16l-4 4m4 0l-4-4" /></svg>
    ) },
  { label: "Sensing", icon: (
      <svg className="ml-3 h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
    ) },
  { label: "CNC", icon: (
      <svg className="ml-3 h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth={2} /></svg>
    ) },
  { label: "Planning", icon: (
      <svg className="ml-3 h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10m-10 4h6" /></svg>
    ) },
  { label: "Predictive Maintenance", icon: (
      <svg className="ml-3 h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" /><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={2} /></svg>
    ) },
];

export default function QuickFilterPills() {
  return (
    <div className="flex flex-col flex-wrap items-center justify-center space-y-4">
      <div className="flex flex-wrap justify-center gap-4">
        {pillData.slice(0, 4).map((pill) => (
          <button key={pill.label} className="flex items-center justify-center px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-md text-white text-lg font-medium transition-all hover:bg-blue-700/40 hover:scale-105">
            {pill.label}
            {pill.icon}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap justify-center gap-4">
        {pillData.slice(4).map((pill) => (
          <button key={pill.label} className="flex items-center justify-between px-6 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-md text-white text-lg font-medium transition-all hover:bg-blue-700/40 hover:scale-105">
            {pill.label}
            {pill.icon}
          </button>
        ))}
      </div>
    </div>
  );
}