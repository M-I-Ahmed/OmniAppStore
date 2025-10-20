import AppTile from './AppTile';

const FEATURED_APPS = [
  { id: 1, name: 'Robot Path Planner', icon: '/vercel.svg' },
  { id: 2, name: 'Quality Inspector AI', icon: '/vercel.svg' },
  { id: 3, name: 'Maintenance Predictor', icon: '/vercel.svg' },
  { id: 4, name: 'CNC Optimizer', icon: '/vercel.svg' },
  { id: 5, name: 'Sensor Dashboard', icon: '/vercel.svg' },
  { id: 6, name: 'Process Monitor', icon: '/vercel.svg' },
];

export default function FeaturedApps() {
  return (
    <div className="w-full mt-16">
      <h2 className="text-2xl font-semibold text-white mb-6 px-8">Featured Applications</h2>
      <div className="relative">
        <div className="overflow-x-scroll scrollbar-hide">
          <div className="flex pb-6 px-8" style={{ width: 'max-content' }}>
            {FEATURED_APPS.map((app) => (
              <AppTile key={app.id} name={app.name} icon={app.icon} />
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