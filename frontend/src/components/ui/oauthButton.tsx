import React from "react";
import { FcGoogle } from "react-icons/fc";
import axiosInstance from "../../utils/axiosConfig";



const OAuthButton: React.FC = () => {
  const apiUrl = "https://backend-972397341408.us-central1.run.app"
  const handleGoogleSignUp = async () => {
    try {
      
      const response = await axiosInstance.get('/api/auth/check-refresh');

      if (response.status === 200) {
        const data = response.data;
        if (data.valid) {
          window.location.href = `${apiUrl}/dashboard`;
        } else if (data.token) {
          
          document.cookie = `refreshToken=${data.token}; path=/; HttpOnly`;
          window.location.href = `${apiUrl}/dashboard`;
        } else {
          window.location.href = `${apiUrl}/api/auth/google`;
        }
      } else {
        window.location.href = `${apiUrl}/api/auth/google`;
      }
    } catch (error) {
      window.location.href = `${apiUrl}/api/auth/google`;
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