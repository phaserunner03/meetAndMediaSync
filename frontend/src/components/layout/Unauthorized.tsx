import React, { useEffect,useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuth } from "../../context/authContext";
import { toast } from "sonner";
import { handleNotification } from "../../utils/notificationHandler";
import { Loader2 } from "lucide-react";


const Unauthorized = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading,setIsLoading]= useState(false)
  

  useEffect(() => {
    if (currentUser?.role.name !== "NAU") {
      navigate("/dashboard/home", { replace: true });
    }
  }, [currentUser?.role, navigate]);

  const sendNotification =async ()=>{
    if (!currentUser){
        toast.error("User not logged in");
    };
    setIsLoading(true)
    toast.loading("Sending email");
    if (!currentUser) {
      toast.error("User not logged in");
      return;
    }
    const result = await handleNotification(currentUser.displayName, currentUser.email);

    setIsLoading(false);
    toast.dismiss();

    if (result.success) {
      toast.success(result.message || "Notification sent successfully!");
    } else {
      toast.error(result.message || "Failed to send notification.");
    }


  }

  return (
    <section className="bg-white dark:bg-gray-900 h-screen flex items-center justify-center">
        {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-black/80 backdrop-blur-md z-50">
          <Loader2 className="w-16 h-16 text-primary-600 dark:text-primary-500 animate-spin" />
        </div>
      )}
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
        <Button onClick={sendNotification} disabled={isLoading}>Send email</Button>
      </div>
    </section>
  );
};

export default Unauthorized;
