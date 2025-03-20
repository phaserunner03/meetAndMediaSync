import React from "react";
import { Link } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import logo from "../../assets/image.png"
import OAuthButton from "../ui/oauthButton";


const Login: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <img src={logo} alt="CloudCapture" className="h-8" />
          <span className="text-xl font-bold text-blue-600">CloudCapture</span>
        </div>
        <Link to="/">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            Getting started
          </button>
        </Link>
      </nav>

      {/* Login Form */}
      <div className="flex flex-1 justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center">Log in to your account</h2>

          <input
            type="email"
            placeholder="Enter your email"
            className="mt-4 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
            Log In
          </button>

          <div className="my-4 flex items-center">
            <hr className="flex-grow border-gray-300" />
            <span className="px-2 text-gray-500">OR</span>
            <hr className="flex-grow border-gray-300" />
          </div>

          {/* <button className="w-full flex items-center justify-center gap-2 bg-white border p-3 rounded-lg hover:shadow">
            <FcGoogle size={20} /> Continue with Google
          </button> */}
            <OAuthButton />

          <p className="text-center mt-4">
            Don’t have an account?{" "}
            <Link to="/signup" className="text-blue-600 hover:underline">
              Sign Up Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
