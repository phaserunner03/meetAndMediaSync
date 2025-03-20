import { Button } from "../../components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowBigLeft } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <section className="flex items-center justify-center min-h-screen px-6 bg-white dark:bg-gray-900">
      <div className="text-center max-w-md">
        <h1 className="mb-4 text-7xl font-extrabold tracking-tight text-primary-600 dark:text-primary-500 lg:text-9xl">
          404
        </h1>
        <p className="mb-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white md:text-4xl">
          Something's missing.
        </p>
        <p className="mb-6 text-lg font-light text-gray-500 dark:text-gray-400">
          Sorry, we can't find that page. You'll find lots to explore on the home page.
        </p>
        <Button onClick={() => navigate("/")} variant="default">
          <ArrowBigLeft className="mr-2" size={20} />
          Back to Home
        </Button>
      </div>
    </section>
  );
};

export default NotFound;
