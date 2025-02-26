// import AppSidebar from "./AppSidebar";
// import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";
import { Outlet } from "react-router-dom";
import { ReactNode } from "react";
import AppSidebar from "./AppSidebar";
import { SidebarProvider, SidebarTrigger } from "../ui/sidebar";

interface DashboardProps {
  children: ReactNode;
}

const Dashboard = ({ children }: DashboardProps) => {
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
  )
}

export default Dashboard
