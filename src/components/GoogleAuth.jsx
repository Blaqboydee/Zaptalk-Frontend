import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import axios from "axios";
import api from "../api/api";

export default function GoogleSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSuccess = async (credentialResponse) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/googleLogin", {
        token: credentialResponse.credential
      });

      const { token } = response.data;

      // Store the JWT token (e.g., in localStorage)
      localStorage.setItem('token', token);

      // Add a small delay for better UX
      setTimeout(() => {
        window.location.href = '/allchats';
      }, 500);

    } catch (error) {
      console.error("Google Sign-In backend error:", error);
      setError("Failed to sign in with Google. Please try again.");
      setIsLoading(false);
    }
  };

  const handleError = () => {
    console.log("Google Sign-In failed");
    setError("Google Sign-In was cancelled or failed. Please try again.");
  };

  return (
    <div className="w-full">
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-900/20 border border-red-700/30 text-red-300 text-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Custom Styled Google Login */}
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 bg-gray-800/60 backdrop-blur-sm rounded-xl flex items-center justify-center z-10">
            <div className="flex items-center space-x-3 text-white">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-medium">Signing you in...</span>
            </div>
          </div>
        )}
        
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          size="large"
          width="100%"
          theme="filled_black"
          shape="rectangular"
          text="continue_with"
          logo_alignment="left"
          render={({ onClick, disabled }) => (
            <button
              onClick={onClick}
              disabled={disabled || isLoading}
              className={`w-full flex items-center justify-center px-6 py-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl shadow-sm transition-all duration-200 transform group ${
                disabled || isLoading 
                  ? "cursor-not-allowed opacity-70" 
                  : "hover:scale-[1.02] active:scale-[0.98] hover:shadow-md focus:ring-2 focus:ring-orange-400/30 focus:outline-none"
              }`}
            >
              {/* Google Icon */}
              <svg className="w-5 h-5 mr-3 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              
              {/* Text */}
              <span className="text-gray-700 font-medium text-base group-hover:text-gray-800 transition-colors duration-200">
                Continue with Google
              </span>
              
              {/* Arrow Icon */}
              <svg className="w-4 h-4 ml-2 text-gray-500 group-hover:text-gray-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          )}
        />
      </div>

      {/* Alternative: If the render prop doesn't work, use this styled wrapper */}
      <div className="hidden google-login-wrapper">
        <style jsx>{`
          .google-login-wrapper :global(.google-login-button) {
            width: 100% !important;
            height: 56px !important;
            border-radius: 12px !important;
            font-family: inherit !important;
            font-size: 16px !important;
            font-weight: 500 !important;
            transition: all 0.2s ease !important;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06) !important;
          }
          
          .google-login-wrapper :global(.google-login-button:hover) {
            transform: scale(1.02) !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
          }
          
          .google-login-wrapper :global(.google-login-button:active) {
            transform: scale(0.98) !important;
          }
          
          .google-login-wrapper :global(.google-login-button:focus) {
            outline: none !important;
            box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.3) !important;
          }
        `}</style>
        
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          size="large"
          width="100%"
          theme="filled_black"
          shape="rectangular"
          text="continue_with"
          logo_alignment="left"
        />
      </div>

      {/* Success Feedback */}
      {isLoading && (
        <div className="mt-3 p-3 rounded-xl bg-green-900/20 border border-green-700/30 text-green-300 text-sm">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-green-400 flex-shrink-0 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Google sign-in successful! Redirecting to your chats...</span>
          </div>
        </div>
      )}
    </div>
  );
}