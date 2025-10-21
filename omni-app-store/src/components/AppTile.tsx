"use client";

import { useRouter } from "next/navigation";

interface AppTileProps {
  id: string;
  name: string;
  icon: string;
}

export default function AppTile({ id, name, icon }: AppTileProps) {
  const router = useRouter();

  const handleNavigate = () => {
    router.push(`/app/${encodeURIComponent(name)}`);
  };

  return (
    <div className="flex flex-col items-center w-72 h-70 p-6 mx-2 
                    bg-white/5 backdrop-blur-md rounded-xl border border-white/10 
                    hover:border-blue-400/50 transition-all duration-300 
                    hover:shadow-lg hover:shadow-blue-500/25">
      <div className="w-24 h-24 mb-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 
                      flex items-center justify-center">
        <img src={icon} alt={name} className="w-16 h-16" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-4">{name}</h3>
      <div className="mt-4">
        <button
          onClick={handleNavigate}
          className="px-4 py-2 text-sm rounded-lg bg-blue-600/20 text-blue-400 
                    hover:bg-blue-500/30 transition-colors duration-200"
        >
          Find Out More
        </button>
      </div>
    </div>
  );
}