import { useState, useEffect } from "react";
import { useAuth } from "../../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import { handleScrollToSection } from "./handleScrollToSection";

const Navbar = () => {
  
  const { userLoggedIn,logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("");

const navigate = useNavigate();

const handleLogin = async () => {
  try {
      navigate("/login");
  } catch (error) {
      console.error("Login Error:", error);
  }
};

const handleLogOut = async () => {
  try {
    await logout();
    navigate("/login"); // Redirect user to login page after logout
  } catch (error) {
    console.error("Logout Error:", error);
  }
};

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);

      const sections = ["meditate", "journal", "contact"];
      let currentSection = "";

      sections.forEach((id) => {
        const section = document.getElementById(id);
        if (section) {
          const rect = section.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            currentSection = id;
          }
        }
      });
      setActiveSection(currentSection);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-20 top-0 transition-all duration-300 ${isScrolled ? "bg-white shadow-lg" : ""}`}>
      <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
        <span className="text-4xl text-blue-700 font-bold">⌘ CloudCapture</span>
        <div className="flex md:order-2 space-x-3">
          {userLoggedIn && <Link to='/dashboard/home' className="text-white bg-blue-600 hover:bg-blue-700 font-semibold rounded-full px-6 py-3 transition-all"> Go to Dashboard
          </Link>}
          {userLoggedIn ? (
            <button
              onClick={handleLogOut}
              className="text-white bg-red-600 hover:bg-red-700 font-semibold rounded-full px-6 py-3 transition-all"
            >
              Logout
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="text-white bg-blue-700 hover:bg-blue-800 font-semibold rounded-full px-6 py-3 transition-all"
            >
              Login
            </button>
          )}
        </div>
        <div className="flex space-x-8">
          <button
            onClick={() => handleScrollToSection("journal")}
            className={`py-2 px-3 rounded-sm transition-all hover:text-blue-700 hover:scale-[1.05] 
    ${activeSection === "journal" ? "text-blue-700" : isScrolled ? "text-black" : "text-white"}`}
          >
            Meet
          </button>
          <button
            onClick={() => handleScrollToSection("meditate")}
            className={`py-2 px-3 rounded-sm transition-all hover:text-blue-700 hover:scale-[1.05] ${activeSection === "meditate" ? "text-blue-700" : isScrolled ? "text-black" : "text-white"}`}
          >
          Events
        </button>

      </div>
    </div>
    </nav >
  );
};

export default Navbar;