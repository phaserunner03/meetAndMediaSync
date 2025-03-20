import { Outlet, Navigate } from "react-router-dom";
import { ReactNode } from "react";
import AppSidebar from "../components/layout/AppSidebar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";
import { useAuth } from "../context/authContext";


interface DashboardProps {
  children?: ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
  const { currentUser } = useAuth();


  if (!currentUser) return <Navigate to="/login" replace />;

  return (
    <SidebarProvider>
      <div className="flex">
        <AppSidebar />
        <main className="flex-1 p-6 transition-all duration-300">
          <SidebarTrigger />
          {children}
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
