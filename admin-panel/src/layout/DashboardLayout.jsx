import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <div className="flex min-h-screen bg-[#f5f7fa] overflow-x-hidden">
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <div className={`flex-1 min-w-0 transition-all duration-300 ${isOpen ? "lg:ml-64" : ""}`}>
        <Header toggleSidebar={toggleSidebar} isSidebarOpen={isOpen} />
        <main className="p-4 overflow-x-auto">
          {children}
        </main>
      </div>
    </div>
  );
}