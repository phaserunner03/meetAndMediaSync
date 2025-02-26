import Login from "./components/layout/Login";
import Home from "./components/layout/Home";
import NotFound from "./components/layout/NotFound";
import Dashboard from "./components/layout/Dashboard";
import { createBrowserRouter, RouterProvider } from "react-router-dom";


export default function App() {

  const router = createBrowserRouter([
    { path: "/", element: <Home /> },
    { path: "/login", element: <Login /> },
    {path:"/dashboard", element:<Dashboard />},
    { path: "*", element: <NotFound /> },
  ]);
  return (

    <div className="w-full h-screen flex flex-col">
      <RouterProvider router={router} />
    </div>
    
  )
}