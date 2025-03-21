import React, { useState } from "react";
import OAuthButton from "../ui/oauthButton";
import { Link } from "react-router-dom";

const SignupForm: React.FC = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="flex-1 flex justify-center items-center p-10">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-2">Sign up for your account</h2>
        <p className="text-gray-500 text-center mb-4">Always free! No credit card required.</p>

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        
        <button className="mt-4 w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Sign up
        </button>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-300"></div>
          <span className="mx-2 text-gray-500">OR</span>
          <div className="flex-grow border-t border-gray-300"></div>
        </div>

        {/* Google Signup Button */}
        <OAuthButton />

        {/* Login Link */}
        <Link to="/login" >
        <p className="text-center mt-4 text-sm text-blue-600 cursor-pointer hover:underline">Log In</p>
        </Link>

      </div>
    </div>
  );
};

export default SignupForm;
