import Login from "./components/layout/Login";
import Home from "./components/layout/Home";
import NotFound from "./components/layout/NotFound";
import Dashboard from "./components/layout/Dashboard";
import DashboardHome from "./components/layout/Dashboard/DashboardHome";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PrivateRoute from "./components/layout/PrivateRoute";
import Avaibility from "./components/layout/Dashboard/Avaibility";
import Create from "./components/layout/Dashboard/Create";
import Meetings from "./components/layout/Dashboard/Meetings";
import Signup from "./components/layout/Signup";
import { Toaster } from "./components/ui/sonner";
import AddUsers from "./components/layout/Dashboard/AddUsers";
import AddNewRole from "./components/layout/Dashboard/AddNewRole";
import Unauthorized from "./components/layout/Unauthorized"

export default function App() {
  const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    { path: "/signup", element: <Signup /> },
    {path:"/unauthorized", element:<Unauthorized/>},
    {
      path: "/dashboard",
      element: <PrivateRoute Component={Dashboard} />,
      children: [
        { path: "home", element: <DashboardHome /> },
        { path: "meetings", element: <Meetings /> },
        { path: "create", element: <Create /> },
        { path: "avaibility", element: <Avaibility /> },
        { path: "add-users", element: <AddUsers /> }, 
        { path: "add-Role",element: <AddNewRole /> },
      ],
    },
    { path: "*", element: <NotFound /> },
  ]);
  return (
    <div className="w-full h-screen flex flex-col">
      <RouterProvider router={router} />
      <Toaster/>
    </div>

  );
}
