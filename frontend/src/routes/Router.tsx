import { createBrowserRouter } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import Home from "../page/Home";
import Login from "../components/auth/Login";
import Signup from "../components/auth/Signup";
import Unauthorized from "../page/error/Unauthorized";
import NotFound from "../page/error/Unauthorized";
import Dashboard from "../page/Dashboard";
import DashboardHome from "../components/layout/Dashboard/Home/DashboardHome";
import Drive from "../components/layout/Dashboard/Drive/Drive";
import Create from "../components/layout/Dashboard/Create/Create";
import Meetings from "../components/layout/Dashboard/Meeting/Meetings";
import AddUsers from "../components/layout/Dashboard/Roles/AddUsers";
import AddNewRole from "../components/layout/Dashboard/Roles/AddNewRole";

export const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },
  { path: "/unauthorized", element: <Unauthorized /> },
  {
    path: "/dashboard",
    element: <PrivateRoute Component={Dashboard} />,
    children: [
      { path: "home", element: <DashboardHome /> },
      { path: "meetings", element: <Meetings /> },
      { path: "create", element: <Create /> },
      { path: "drive", element: <Drive /> },
      { path: "add-users", element: <AddUsers /> },
      { path: "add-role", element: <AddNewRole /> },  // Fixed casing
    ],
  },
  { path: "*", element: <NotFound /> },
]);
