import AppTile from './AppTile';

const ESSENTIAL_APPS = [
  { id: '1', name: 'Demo App 4', icon: '/vercel.svg' },
  { id: '2', name: 'Work Instruction', icon: '/vercel.svg' },
  { id: '3', name: 'Digital Timesheet', icon: '/vercel.svg' },
  { id: '4', name: 'Safety Report', icon: '/vercel.svg' },
  { id: '5', name: 'Rework Alerter', icon: '/vercel.svg' },
  { id: '6', name: 'Smart Drill', icon: '/vercel.svg' },
  { id: '7', name: 'Tool Tracker', icon: '/vercel.svg' },
];

export default function EssentialApps() {
  return (
    <div className="w-full mt-16">
      <h2 className="text-2xl font-semibold text-white mb-6 px-8">Essential Apps</h2>
      <div className="relative">
        <div className="overflow-x-scroll scroll-hide scrollbar-hide">
          <div className="flex pb-6 px-8" style={{ width: 'max-content' }}>
            {ESSENTIAL_APPS.map((app) => (
              <AppTile key={app.id} id={app.id} name={app.name} icon={app.icon} />
            ))}
          </div>
        </div>
        {/* Gradient fades at the edges */}
        <div className="absolute top-0 right-0 h-full w-24 
                      bg-gradient-to-l from-blue-900/20 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-0 h-full w-24 
                      bg-gradient-to-r from-black/20 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}