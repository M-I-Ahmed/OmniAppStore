"use client";

import { useState } from "react";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(isLogin ? "Login" : "Signup", { email, password, firstName, lastName });
  };

  const handleToggleMode = (loginMode: boolean) => {
    if (isTransitioning) return;
    
    setIsTransitioning(true);
    setIsLogin(loginMode);
    
    // Clear form when switching
    setTimeout(() => {
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setFirstName("");
      setLastName("");
      setIsTransitioning(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-gray-900/95 backdrop-blur-md rounded-3xl w-full max-w-5xl h-[750px] 
                      shadow-2xl shadow-blue-500/25 border border-white/10 overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-30 text-gray-400 hover:text-white 
                     transition-colors bg-white/5 backdrop-blur-md rounded-full p-2
                     hover:bg-white/10 shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex h-full relative overflow-hidden">
          {/* Image Panel - slides left/right */}
          <div className={`
            absolute top-0 w-1/2 h-full z-20
            transform transition-all duration-700 ease-in-out
            ${isLogin ? 'translate-x-0' : 'translate-x-full'}
          `}>
            <div className="relative w-full h-full overflow-hidden rounded-3xl">
              {/* Background Image */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                  backgroundImage: "url('/LoginPopUp.png')"
                }}
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-gray-900/60" />
              
              {/* Animated particles */}
              <div className="absolute inset-0">
                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-xl animate-pulse" />
                <div className="absolute bottom-32 right-8 w-24 h-24 bg-purple-400/10 rounded-full blur-lg animate-bounce" />
                <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-cyan-400/10 rounded-full blur-md animate-ping" />
              </div>
              
              {/* Logo */}
              <div className="absolute top-8 left-8 z-10">
                <div className="text-white text-2xl font-bold drop-shadow-lg">
                  OMNIFACTORY
                </div>
              </div>
            </div>
          </div>

          {/* Form Panel - slides left/right opposite to image */}
          <div className={`
            absolute top-0 w-1/2 h-full z-10 bg-gray-900/95 backdrop-blur-md
            transform transition-all duration-700 ease-in-out
            ${isLogin ? 'translate-x-full' : 'translate-x-0'}
          `}>
            <div className="w-full h-full flex items-center justify-center p-12">
              <div className={`
                w-full max-w-sm
                transition-all duration-500 ease-out
                ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
              `}>
                {/* Back Arrow for Signup */}
                {!isLogin && (
                  <button
                    onClick={() => handleToggleMode(true)}
                    className="flex items-center text-gray-400 mb-6 hover:text-white transition-all duration-300
                               hover:bg-white/5 rounded-lg p-2 -ml-2"
                    disabled={isTransitioning}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                  </button>
                )}

                {/* Header */}
                <h2 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">
                  {isLogin ? "Welcome Back" : "Create an Account"}
                </h2>
                
                <p className="text-gray-400 mb-8">
                  {isLogin ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        onClick={() => handleToggleMode(false)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-all duration-300"
                        disabled={isTransitioning}
                      >
                        Sign up
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button
                        onClick={() => handleToggleMode(true)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-all duration-300"
                        disabled={isTransitioning}
                      >
                        Log in
                      </button>
                    </>
                  )}
                </p>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields (Signup only) */}
                  {!isLogin && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-600 
                                     text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                     focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                          placeholder="John"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-600 
                                     text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                     focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                          placeholder="Doe"
                          required
                        />
                      </div>
                    </div>
                  )}

                  {/* Email Field */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-600 
                                 text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-600 
                                   text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                   focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                                   hover:text-gray-200 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Terms (Signup only) */}
                  {!isLogin && (
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="terms"
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                        required
                      />
                      <label htmlFor="terms" className="ml-2 text-sm text-gray-300">
                        I agree to the{" "}
                        <a href="#" className="text-blue-400 hover:text-blue-300">
                          Terms & Condition
                        </a>
                      </label>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isTransitioning}
                    className="w-full px-6 py-3 bg-blue-600/80 hover:bg-blue-700/90 rounded-lg text-white font-semibold
                               transition-all duration-300 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/60
                               hover:scale-[1.02] border border-blue-500/30 disabled:opacity-50"
                  >
                    {isLogin ? "Log In" : "Create Account"}
                  </button>

                  {/* Forgot Password (Login only) */}
                  {isLogin && (
                    <div className="text-center">
                      <button
                        type="button"
                        className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                      >
                        Forgot your password?
                      </button>
                    </div>
                  )}

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-gray-900 text-gray-400">or</span>
                    </div>
                  </div>

                  {/* Social Buttons */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      disabled={isTransitioning}
                      className="w-full flex items-center justify-center px-4 py-3 bg-gray-800/60 backdrop-blur-md 
                                 border border-gray-600 rounded-lg hover:bg-gray-700/60 transition-all duration-300"
                    >
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      <span className="text-sm font-medium text-gray-300">Continue with Google</span>
                    </button>
                    
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}