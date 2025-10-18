import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="flex items-center justify-between mx-4 mb-2 p-6 bg-gray-800/80 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-50 shadow-xl rounded-2xl"> {/* Applied exact same structure as your working code */}
        {/* Logo container */}
        <div className="flex items-center">
          {/* Spacer div to push logo away from edge */}
          <div className="w-16 h-4 bg-transparent">&nbsp;</div>
          <Image
            src="/Omnifactory_logo.png"
            alt="OMNI Logo"
            width={240} // Fixed width
            height={60} // Fixed height
            className="object-contain w-[240px] h-[60px]" // Fixed dimensions
            priority
          />
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