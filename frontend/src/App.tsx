import Login from "./components/layout/Login";
import Home from "./components/layout/Home";
import NotFound from "./components/layout/NotFound";
import Dashboard from "./components/layout/Dashboard";
import DashboardHome from "./components/layout/DashboardHome";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import PrivateRoute from "./components/layout/PrivateRoute";

export default function App() {

  const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    {
      path: "/dashboard",
      element: <PrivateRoute Component={Dashboard} />,
      children: [
        { path: "home", element: <DashboardHome /> },
        
      ],
    },
    { path: "*", element: <NotFound /> },
  ]);
  return (

    <div className="w-full h-screen flex flex-col">
      <RouterProvider router={router} />
    </div>
    
  )
}