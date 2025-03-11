import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../context/authContext";

const Unauthorized = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role.name !== "NAU") {
      navigate("/dashboard/home", { replace: true });
    }
  }, [currentUser?.role, navigate]);

  return (
    <section className="bg-white dark:bg-gray-900 h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="mb-4 text-7xl tracking-tight font-extrabold lg:text-9xl text-primary-600 dark:text-primary-500">
          403
        </h1>
        <p className="mb-4 text-3xl tracking-tight font-bold text-gray-900 md:text-4xl dark:text-white">
          Unauthorized access
        </p>
        <p className="mb-4 text-lg font-light text-gray-500 dark:text-gray-400">
          Notify admin to grant you access.
        </p>
        <Button>Send email</Button>
      </div>
    </section>
  );
};

export default Unauthorized;
