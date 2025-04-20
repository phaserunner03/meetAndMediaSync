import { Link } from "react-router-dom";
import { useAuth } from "../../../context/authContext";
import { TypewriterEffectSmooth } from "../../ui/typewriter-effect"; // Import the TypewriterEffectSmooth component

const Hero = () => {
  const { userLoggedIn } = useAuth();

  const words = [
    {
      text: "Handle your daily meeting and media with",
    },
    {
      text: "CloudCapture",
    },
  ];

  return (
    <section>
      <div className="py-8 px-6 mx-auto max-w-screen-xl text-center lg:py-16 lg:px-12 md:px-10">
        <h1 className="mt-4 lg:mt-8 mb-4 text-5xl font-extrabold tracking-tight leading-tight text-black md:text-6xl lg:text-7xl">
          <div>
            <TypewriterEffectSmooth words={words} />
          </div>
        </h1>
        <p className="mb-8 text-lg font-normal text-gray-700 lg:text-xl sm:px-16 xl:px-48">
          Join community who easily book meetings and monitor it with the #1 scheduling tool.
        </p>
        <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0 sm:space-x-4">
          <Link
            to={`${!userLoggedIn ? "/signup" : "/dashboard/home"}`}
            className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-blue-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
          >
            <span className="relative text-base font-semibold text-white">
              {userLoggedIn ? "Dashboard" : "Get started"}
            </span>
          </Link>
          <Link
            to="#learn-more"
            className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:border before:border-transparent before:bg-slate-200 before:bg-gradient-to-b before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max"
          >
            <span className="relative text-base font-semibold text-primary">
              Learn more
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;