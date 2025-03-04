import React from "react";
import { FcGoogle } from "react-icons/fc";

const OAuthButton: React.FC = () => {
  const handleGoogleSignUp = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
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
