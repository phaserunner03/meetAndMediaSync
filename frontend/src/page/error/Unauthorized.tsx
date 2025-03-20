import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../context/authContext";
import { toast } from "sonner";
import { handleNotification } from "../../utils/notificationHandler";
import Loader from "../../components/common/Loader"


const Unauthorized = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (currentUser?.role.name !== "NAU") {
      navigate("/dashboard/home", { replace: true });
    }
  }, [currentUser, navigate]);

  const sendNotification = async () => {

    setIsLoading(true)
    toast.loading("Sending email");
    if (!currentUser) {
      toast.error("User not logged in");
      return;
    }

    try {
      const result = await handleNotification(currentUser.displayName, currentUser.email);
      toast.dismiss();

      if (result.success) {
        toast.success(result.message || "Notification sent successfully!");
      } else {
        toast.error(result.message || "Failed to send notification.");
      }
    } catch (error) {
      toast.dismiss();
      toast.error("An error occurred while sending the notification.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="bg-white dark:bg-gray-900 h-screen flex items-center justify-center">
      {isLoading && (
        <Loader />
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
        <Button onClick={sendNotification} disabled={isLoading}>{isLoading ? "Sending..." : "Send email"}</Button>
      </div>
    </section>
  );
};

export default Unauthorized;


