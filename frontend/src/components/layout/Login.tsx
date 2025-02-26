import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { doSignInWithGoogle } from "../../firebase/auth";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { FcGoogle } from "react-icons/fc";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleClick = async () => {
    try {
      setIsSigningIn(true);
      const result = await doSignInWithGoogle();
      const idToken = await result.user.getIdToken(); // Get Firebase ID Token

      // Send ID Token to backend
      const response = await axios.post(
        "http://localhost:8000/api/auth/google",
        { idToken }, // Send ID Token
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      // Store JWT token from backend in localStorage
      const { token, user } = response.data;
      console.log(token, user);
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Navigate to dashboard
      navigate("/dashboard/home");
    } catch (error: any) {
      setErrorMessage(error.response?.data?.error || "Authentication failed");
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="hidden md:flex flex-col justify-between bg-black text-white p-8 w-1/3">
        <h1 className="text-lg font-bold">CloudCapture</h1>
        <p className="text-sm">Searce</p>
      </div>

      <div className="flex flex-1 justify-center items-center">
        <Card className="w-full max-w-md p-8 shadow-lg">
          <CardContent>
            <h2 className="text-2xl font-bold text-center mb-2">Welcome to CloudCapture!!</h2>
            <p className="text-gray-500 text-center mb-4">Login using your Google Account</p>

            <Button
              variant="outline"
              className="w-full flex items-center gap-2 mb-2"
              onClick={handleClick}
              disabled={isSigningIn}
            >
              <FcGoogle size={20} /> Sign in with Google
            </Button>

            {errorMessage && <p className="text-red-500 text-center mt-3">{errorMessage}</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
