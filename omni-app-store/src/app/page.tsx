import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      {/* Background elements for blur effect */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
      
      <header
        className="flex items-center justify-between mx-2 mb-2 mt-2 p-6 sticky top-0 z-50 rounded-2xl h-20 bg-transparent bg-gray-900/80 border-gray-800 border-0 shadow-xl backdrop-blur-lg"
      >
        {/* Left side with logo and spacing */}
        <div className="flex items-center">
          <Image
            src="/Omnifactory_logo.png"
            alt="OMNI Logo"
            width={200}
            height={50}
            className="object-contain h-24 w-[250px] ml-24"
            style={{ marginLeft: '12px' }}
            priority
          />
        </div>

        {/* Center title - absolutely positioned */}
        <div className="absolute left-1/2 transform -translate-x-1/2">
          <h1 className="text-3xl font-semibold tracking-wide text-gray-400 ">
            Omni App Store
          </h1>
        </div>

        {/* Right side container */}
        <div className="flex items-center gap-6"> {/* Using gap-6 like your working code */}
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

      {/* Main content with flex */}
      <main className="flex-grow flex items-center justify-center">
        <div className="container px-8">
          <div className="flex flex-col items-center justify-center space-y-6">
            <h1 className="text-6xl md:text-7xl font-extrabold text-white text-center">
              Welcome to OMNIFACTORY
            </h1>
            <p className="text-xl md:text-2xl text-gray-400 font-light text-center">
              Your industrial application store
            </p>
            
            {/* Example of a Glassmorphism button/card styling for the future */}
            <button className="
                mt-10 px-8 py-3 
                bg-blue-700/60 backdrop-blur-md 
                border border-blue-600/50 
                rounded-xl 
                text-white text-lg font-semibold 
                shadow-2xl shadow-blue-500/30 
                hover:bg-blue-500/80 
                transition-all duration-300 ease-in-out
                transform hover:scale-[1.03]
            ">
              Explore Applications
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}