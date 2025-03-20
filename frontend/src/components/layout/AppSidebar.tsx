import { useState, useMemo, useCallback } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../../assets/image.png";
import {
  Home,
  Inbox,
  HardDriveUpload,
  LogOut,
  Menu,
  CalendarPlus2,
  User,
  BadgeInfo,
  X
} from "lucide-react";
import { useAuth } from "../../context/authContext";

const Sidebar = () => {
  const { currentUser, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // Memoize role-based menu items
  const menuItems = useMemo(() => {
    const baseMenu = [
      { title: "Home", url: "/dashboard/home", icon: Home },
      { title: "Meetings", url: "/dashboard/meetings", icon: Inbox },
      { title: "Create", url: "/dashboard/create", icon: CalendarPlus2 },
      { title: "Drive", url: "/dashboard/drive", icon: HardDriveUpload },
    ];

    if (currentUser?.role.permissions?.includes("viewAllUsers")) {
      baseMenu.push({ title: "Users", url: "/dashboard/add-users", icon: User });
    }
    if (currentUser?.role.permissions?.includes("addRole")) {
      baseMenu.push({ title: "Role", url: "/dashboard/add-role", icon: BadgeInfo });
    }
    
    return baseMenu;
  }, [currentUser]);

  // Handle Logout
  const handleLogOut = useCallback(async () => {
    try {
      await logout();
      navigate("/login"); // Redirect to login
    } catch (error) {
      console.error("Logout Error:", error);
    }
  }, [logout, navigate]);

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 z-50 w-full bg-white border-b border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="px-3 py-3 lg:px-5 lg:pl-3 flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            type="button"
            aria-label="Toggle sidebar"
            className="inline-flex items-center p-2 rounded-lg sm:hidden hover:bg-gray-100 dark:hover:bg-gray-700 focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-600"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <NavLink to="/" className="flex items-center ms-2 md:me-24">
            <img src={logo} alt="CloudCapture Logo" className="h-8 mr-2" />
            <span className="text-xl font-semibold sm:text-2xl whitespace-nowrap dark:text-white ml-2">
              CloudCapture
            </span>
          </NavLink>

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
                  <Icon className="w-5 h-5 text-blue-500 dark:text-gray-400" />
                  <span className="ms-3">{title}</span>
                </NavLink>
              </li>
            ))}

            {currentUser && (
              <li>
                <button
                  onClick={handleLogOut}
                  className="w-full flex items-center p-2 rounded-lg transition-all hover:bg-red-200 dark:hover:bg-red-800"
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
