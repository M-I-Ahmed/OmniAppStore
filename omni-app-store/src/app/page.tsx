export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Simple Header */}
      <header className="bg-gray-900 border-b border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">O</span>
              </div>
              <span className="text-2xl font-bold text-white">
                OMNIFACTORY
              </span>
            </div>

            {/* User Icon */}
            <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center hover:bg-gray-500 transition-colors">
              <span className="text-white font-bold text-lg">N</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)]">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Welcome to OMNIFACTORY
          </h1>
          <p className="text-gray-300">
            Your industrial application store
          </p>
        </div>
      </main>
    </div>
  );
}
