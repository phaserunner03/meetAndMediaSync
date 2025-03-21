import AuthNavbar from "../common/AuthNavbar";
import { useState } from "react";
import Divider from "../auth/Divider";
import OAuthButton from "../ui/oauthButton";
import { Link } from "react-router-dom";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");

  return (
    <div className="flex flex-col min-h-screen">
      <AuthNavbar buttonText="Getting Started" buttonLink="/" />

      <div className="flex flex-1 justify-center items-center p-6">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center">Log in to your account</h2>

          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-4 w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <button className="mt-4 w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700">
            Log In
          </button>

          <Divider />

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
