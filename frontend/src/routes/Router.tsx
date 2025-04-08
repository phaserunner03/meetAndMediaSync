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
import DummyReport from "../components/layout/Dashboard/Report/DummyReport";
import AddNewRole from "../components/layout/Dashboard/Roles/AddNewRole";
import { ROUTES } from "../constants";

export const router = createBrowserRouter([
  { path: ROUTES.HOME, element: <Home /> },
  { path: ROUTES.LOGIN, element: <Login /> },
  { path: ROUTES.SIGNUP, element: <Signup /> },
  { path: ROUTES.UNAUTHORIZED, element: <Unauthorized /> },
  {
    path: ROUTES.DASHBOARD,
    element: <PrivateRoute Component={Dashboard} />,
    children: [
      { path: ROUTES.DASHBOARD_HOME, element: <DashboardHome /> },
      { path: ROUTES.MEETINGS, element: <Meetings /> },
      { path: ROUTES.CREATE_MEETING, element: <Create /> },
      { path: ROUTES.DRIVE, element: <Drive /> },
      { path: ROUTES.REPORT, element: <DummyReport /> },
      { path: ROUTES.ADD_USERS, element: <AddUsers /> },
      { path: ROUTES.ADD_ROLE, element: <AddNewRole /> },  // Fixed casing
    ],
  },
  { path: ROUTES.NOT_FOUND, element: <NotFound /> },
]);