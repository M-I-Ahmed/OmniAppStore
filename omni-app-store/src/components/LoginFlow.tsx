"use client";

import { useState, useEffect } from "react";
import { registerWithEmail, loginWithEmail, signInWithGoogle } from "@/lib/auth";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [organisation, setOrganisation] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { setUserProfile } = useAuth();
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isLogin) {
        const { user, userProfile } = await loginWithEmail(email, password);
        setUserProfile(userProfile);
        showToast(`Welcome back, ${userProfile?.forename || 'User'}! 🎉`, 'success');
        console.log("Login successful:", user.uid);
      } else {
        const { user, userProfile } = await registerWithEmail(email, password, {
          forename: firstName,
          surname: lastName,
          organisation: organisation || "Individual"
        });
        setUserProfile(userProfile);
        showToast(`Account created successfully! Welcome ${firstName}! 🚀`, 'success');
        console.log("Registration successful:", user.uid);
      }
      
      // Close modal on success
      onClose();
    } catch (error: any) {
      console.error("Authentication error:", error);
      
      let errorMessage = "An error occurred. Please try again.";
      
      if (error.message.includes("user-not-found")) {
        errorMessage = "No account found with this email. Please sign up or try Google sign-in.";
      } else if (error.message.includes("wrong-password")) {
        errorMessage = "Incorrect password. If you signed up with Google, please use Google sign-in.";
      } else if (error.message.includes("invalid-credential")) {
        errorMessage = "Invalid email or password. If you signed up with Google, please use Google sign-in.";
      } else if (error.message.includes("email-already-in-use")) {
        errorMessage = "An account with this email already exists. Please log in instead.";
      } else if (error.message.includes("weak-password")) {
        errorMessage = "Password should be at least 6 characters long.";
      } else if (error.message.includes("invalid-email")) {
        errorMessage = "Please enter a valid email address.";
      } else {
        errorMessage = error.message || "An error occurred. Please try again.";
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError("");

    try {
      const { user, userProfile } = await signInWithGoogle();
      setUserProfile(userProfile);
      showToast(`Welcome ${userProfile?.forename || 'User'}! Signed in with Google 🌟`, 'success');
      console.log("Google sign in successful:", user.uid);
      onClose();
    } catch (error: any) {
      console.error("Google sign in error:", error);
      
      let errorMessage = "Google sign in failed. Please try again.";
      
      if (error.message.includes("popup-closed-by-user")) {
        errorMessage = "Sign in was cancelled. Please try again.";
      } else if (error.message.includes("popup-blocked")) {
        errorMessage = "Popup was blocked. Please allow popups and try again.";
      } else if (error.message.includes("unauthorized-domain")) {
        errorMessage = "This domain is not authorized for Google sign-in.";
      }
      
      setError(errorMessage);
      showToast(errorMessage, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleMode = (loginMode: boolean) => {
    if (isTransitioning || isLoading) return;
    
    setIsTransitioning(true);
    setIsLogin(loginMode);
    setError("");
    
    setTimeout(() => {
      setEmail("");
      setPassword("");
      setFirstName("");
      setLastName("");
      setOrganisation("");
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
                style={{ backgroundImage: "url('/LoginPopUp.png')" }}
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
            <div className="w-full h-full flex items-center justify-center p-8">
              <div className={`
                w-full max-w-sm
                transition-all duration-500 ease-out
                ${isTransitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}
              `}>
                {/* Back Arrow for Signup */}
                {!isLogin && (
                  <button
                    onClick={() => handleToggleMode(true)}
                    className="flex items-center text-gray-400 mb-4 hover:text-white transition-all duration-300
                               hover:bg-white/5 rounded-lg p-2 -ml-2"
                    disabled={isTransitioning || isLoading}
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
                
                <p className="text-gray-400 mb-6">
                  {isLogin ? (
                    <>
                      Don't have an account?{" "}
                      <button
                        onClick={() => handleToggleMode(false)}
                        className="text-blue-400 hover:text-blue-300 font-medium transition-all duration-300"
                        disabled={isTransitioning || isLoading}
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
                        disabled={isTransitioning || isLoading}
                      >
                        Log in
                      </button>
                    </>
                  )}
                </p>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}

                {/* Google Sign-in First */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading || isTransitioning}
                  className="w-full flex items-center justify-center px-4 py-3 bg-white hover:bg-gray-100 
                             border border-gray-300 rounded-lg transition-all duration-300 mb-4
                             disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-medium"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm">Continue with Google</span>
                </button>

                {/* Divider */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-gray-900 text-gray-400">or</span>
                  </div>
                </div>

                {/* Email/Password Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Fields (Signup only) */}
                  {!isLogin && (
                    <>
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
                            disabled={isLoading}
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
                            disabled={isLoading}
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-gray-300 text-sm font-medium mb-2">
                          Organisation (Optional)
                        </label>
                        <input
                          type="text"
                          value={organisation}
                          onChange={(e) => setOrganisation(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-600 
                                     text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                     focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                          placeholder="Company or Organization"
                          disabled={isLoading}
                        />
                      </div>
                    </>
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
                      disabled={isLoading}
                    />
                  </div>

                  {/* Password Field */}
                  <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/80 backdrop-blur-md rounded-lg border border-gray-600 
                                 text-white placeholder-gray-400 focus:outline-none focus:ring-2 
                                 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
                      placeholder="Enter your password"
                      required
                      minLength={6}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading || isTransitioning}
                    className="w-full px-6 py-3 bg-blue-600/80 hover:bg-blue-700/90 rounded-lg text-white font-semibold
                               transition-all duration-300 shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/60
                               hover:scale-[1.02] border border-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed
                               disabled:hover:scale-100 flex items-center justify-center"
                  >
                    {isLoading ? (
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : null}
                    {isLogin ? "Log In" : "Create Account"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}