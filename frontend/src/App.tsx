import { RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { router } from "./routes/Router";

export default function App() {
  return (
    <div className="w-full h-screen flex flex-col">
      <RouterProvider router={router} />
      <Toaster />
    </div>
  );
}
