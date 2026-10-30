import React from 'react';
import { Outlet } from 'react-router-dom';
import { FloatingNavbar } from './FloatingNavbar';
import { SidebarLeft } from './SidebarLeft';
import { SidebarRight } from './SidebarRight';

interface AppLayoutProps {
  showRightSidebar?: boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ showRightSidebar = true }) => {
  return (
    <div className="bg-atmospheric min-h-screen text-[#0F172A] selection:bg-blue-100 selection:text-[#1877F2]">
      {/* Background Aura Glow Elements */}
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-blue-400/10 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-10 right-1/4 w-[600px] h-[600px] bg-sky-300/10 rounded-full blur-[160px] pointer-events-none -z-10" />

      {/* Floating Top Navbar */}
      <FloatingNavbar />

      {/* Main 3-Column Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Floating Island (Navigation & Profile) */}
          <div className="hidden lg:block lg:col-span-3 sticky top-24">
            <SidebarLeft />
          </div>

          {/* Main Feed Content */}
          <div
            className={`col-span-1 ${
              showRightSidebar ? 'lg:col-span-6' : 'lg:col-span-9'
            } min-w-0`}
          >
            <Outlet />
          </div>

          {/* Right Floating Island (Suggestions & Highlights) */}
          {showRightSidebar && (
            <div className="hidden lg:block lg:col-span-3 sticky top-24">
              <SidebarRight />
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

