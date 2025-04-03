import { useAuth } from "../../context/authContext";
import { Link, useNavigate } from "react-router-dom";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Logo from "./Logo";

const Navbar = () => {
  const { userLoggedIn, currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogOut = async () => {
    try {
      await logout();
      navigate("/login"); // Redirect user to login page after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <header className="sticky top-0 z-50">
      <nav className="backdrop-blur-md px-6 py-2.5">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          <Logo />
          <div className="flex items-center gap-4 lg:order-2"> 

            {/* Dashboard / Get Started Button with More Spacing */}
            <Link className="relative flex h-11 w-full items-center justify-center px-6 before:absolute before:inset-0 before:rounded-full before:bg-blue-700 before:transition before:duration-300 hover:before:scale-105 active:duration-75 active:before:scale-95 sm:w-max" to={userLoggedIn ? "/dashboard/home" : "/signup"}>
            <span className="relative text-base font-semibold text-white">
                
                {userLoggedIn ? "Dashboard" : "Get started"}
              </span>
            </Link>
            {!userLoggedIn ? (
              <Link
                to="/login"
                className="text-gray-800 hover:bg-primary-700/10 duration-300 focus:ring-4 focus:ring-primary-700/30 font-medium rounded-full text-sm px-4 lg:px-5 py-2 lg:py-2.5 focus:outline-none"
              >
                Log in
              </Link>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-2 focus:outline-none">
                    {currentUser?.photoURL && (
                      <img 
                        src={`${currentUser?.photoURL}?sz=200`} 
                        alt="User Avatar" 
                        className="w-8 h-8 rounded-full border border-gray-300"
                      />
                    )}
                    <span className="text-lg font-semibold text-gray-800">
                      {currentUser?.displayName || "Guest"}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 text-center">
                  <DropdownMenuItem 
                    onClick={handleLogOut} 
                    className="cursor-pointer justify-center"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
