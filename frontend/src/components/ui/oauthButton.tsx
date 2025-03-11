import React from "react";
import { FcGoogle } from "react-icons/fc";
import { refreshToken, isTokenExpired } from "../../utils/auth";

const OAuthButton: React.FC = () => {
  const handleGoogleSignUp = async () => {
    const token = document.cookie.split('; ').find(row => row.startsWith('refreshToken='));
    const tokenValue = token ? token.split('=')[1] : null;
    console.log(tokenValue);
    
    
    if (tokenValue && !isTokenExpired(tokenValue)) {
      window.location.href = `${import.meta.env.VITE_API_URL}/dashboard`;
    } else {
      try {
        const newToken = await refreshToken();
        if (newToken) {
          window.location.href = `${import.meta.env.VITE_API_URL}/dashboard`;
        } else {
          window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
        }
      } catch (error) {
        window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
      }
    }
  };

  return (
    <button
      onClick={handleGoogleSignUp}
      className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 py-2 rounded-lg shadow-sm hover:bg-gray-100"
    >
      <FcGoogle size={20} />
      Sign up with Google
    </button>
  );
};

export default OAuthButton;