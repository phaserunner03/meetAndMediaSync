import React from "react";
import SignupForm from "./signupForm";
import logo from "../../assets/image.png"

const SignUp: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar */}
      <nav className="flex justify-between items-center p-4 shadow-md">
        <div className="text-xl font-bold flex items-center">
          <img src={logo} alt="CloudCapture Logo" className="h-8 mr-2" />
          <span className="text-blue-600">CloudCapture</span>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          Log In
        </button>
      </nav>

      {/* Content */}
      <div className="flex flex-col md:flex-row flex-1">
        {/* Left Section */}
        <div className="flex-1 bg-gray-100 p-10 flex flex-col justify-center">
          <h1 className="text-3xl font-bold text-gray-800">Create your free account</h1>
          <p className="text-gray-600 mt-2">
            Meet, capture, and store – all in one place with CloudCapture.
          </p>

          <div className="mt-6 space-y-3 text-gray-700">
            <p>✅ Easy meeting scheduling – Organizers can set up and manage meetings.</p>
            <p>✅ Media capture – Screenshots and recordings saved instantly.</p>
            <p>✅ Cloud storage integration – Files stored in Google Drive & GCP.</p>
            <p>✅ Structured media storage – Media are organized automatically.</p>
          </div>
        </div>

        {/* Right Section (Signup Form) */}
        <SignupForm />
      </div>
    </div>
  );
};

export default SignUp;
