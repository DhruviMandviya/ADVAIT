import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { TopAnnouncement } from '../common/TopAnnouncement';
import { WatermarkBg } from '../common/WatermarkBg';
import { X } from 'lucide-react';

export const MainLayout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4F8F6] flex flex-col relative text-[#4B5563]">
      {/* Background Watermark Glyphs */}
      <WatermarkBg />

      {/* Slim Top Announcement Banner on Inner Pages */}
      <TopAnnouncement slim={true} />

      {/* Main Header */}
      <Header onToggleMobileMenu={() => setMobileMenuOpen(true)} />

      {/* Mobile Drawer Backdrop */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-50 lg:hidden backdrop-blur-2xs animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 bg-white h-full shadow-2xl relative flex flex-col z-50 animate-in slide-in-from-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-[#E3EAE6] flex items-center justify-between">
              <span className="text-xs font-bold text-[#14233F] uppercase tracking-wider">
                Portal Menu
              </span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-[#8A94A0] hover:text-[#14233F]"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Layout Content Body: Sidebar + Main Content */}
      <div className="flex-1 flex max-w-[1480px] w-full mx-auto relative z-10">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block flex-shrink-0">
          <Sidebar />
        </div>

        {/* Dynamic Outlet Page Container */}
        <main className="flex-1 min-w-0 p-4 sm:p-5 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

