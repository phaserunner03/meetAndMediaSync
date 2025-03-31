import React from "react";
import { FcGoogle } from "react-icons/fc";
import axiosInstance from "../../utils/axiosConfig";

const OAuthButton: React.FC = () => {
  const handleGoogleSignUp = async () => {
    try {
      const response = await axiosInstance.get('/auth/v1/check-refresh');

      if (response.status === 200) {
        const data = response.data;
        if (data.valid) {
          window.location.href = `${import.meta.env.VITE_API_URL}/dashboard`;
        } else if (data.token) {
          // If a new token is returned, save it in cookies and redirect
          document.cookie = `refreshToken=${data.token}; path=/; HttpOnly`;
          window.location.href = `${import.meta.env.VITE_API_URL}/dashboard`;
        } else {
          window.location.href = `${import.meta.env.VITE_API_URL}/auth/v1/google`;
        }
      } else {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/v1/google`;
      }
    } catch (error) {
      window.location.href = `${import.meta.env.VITE_API_URL}/auth/v1/google`;
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