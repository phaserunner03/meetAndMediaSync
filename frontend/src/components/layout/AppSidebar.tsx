import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  Plus,
  Inbox,
  Calendar,
  LogOut,
  Menu,
  CalendarPlus2,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/authContext";


const Sidebar = () => {
  const { currentUser,logout  } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);
  const navigate = useNavigate();
  const canAddUser = currentUser?.role.permissions.includes("addUser");
  const canAddRole = currentUser?.role.permissions.includes("addRole");
  const menuItems = [
    { title: "Home", url: "/dashboard/home", icon: Home },
    { title: "Meetings", url: "/dashboard/meetings", icon: Inbox },
    { title: "Create", url: "/dashboard/create", icon:CalendarPlus2  },
    { title: "Avaibility", url: "/dashboard/avaibility", icon: Calendar },
    
  ];
  const handleLogOut = async () => {
    try {
      await logout();
      navigate("/login"); // Redirect user to login page after logout
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <>
      {/* Top Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 flex items-center justify-between">
          {/* Sidebar Toggle Button */}
          <button
            onClick={toggleSidebar}
            type="button"
            className="inline-flex items-center p-2 text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo */}
          <NavLink to="/" className="flex items-center ms-2 md:me-24">
            <span className="text-4xl text-blue-700 font-bold">⌘</span>
            <span className="text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white ml-2">
              CloudCapture
            </span>
          </NavLink>

          {/* User Greeting */}
          <div className="flex flex-row items-center space-x-4">
            {currentUser ? (
              <p className="text-lg font-semibold text-gray-800">
                Hi, {currentUser.displayName} 👋
              </p>
            ) : (
              <p className="text-lg text-gray-600">Welcome! Please sign in.</p>
            )}
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-40 w-64 h-screen pt-20 transition-transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } sm:translate-x-0 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700`}
      >
        <div className="h-full px-3 pb-4 overflow-y-auto">
          <ul className="space-y-2 font-medium">
            {menuItems.map(({ title, url, icon: Icon }) => (
              <li key={title}>
                <NavLink
                  to={url}
                  end
                  className={({ isActive }) =>
                    `flex items-center p-2 rounded-lg transition-all ${
                      isActive
                        ? "text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-300"
                        : "text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`
                  }
                >
                  <Icon className="w-5 h-5 text-blue-500 transition duration-75 dark:text-gray-400" />
                  <span className="ms-3">{title}</span>
                </NavLink>
              </li>
            ))}

           
            {currentUser && (
              <li>
                <button
                  onClick={handleLogOut}
                  className="w-full flex items-center p-2 rounded-lg transition-all hover:bg-red-200 dark:bg-red-900 dark:text-red-300 dark:hover:bg-red-800"
                >
                  <LogOut className="w-5 h-5 text-red-500 dark:text-red-400" />
                  <span className="ms-3">Sign Out</span>
                </button>
              </li>
            )}
          </ul>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;