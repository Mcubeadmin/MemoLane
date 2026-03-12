import React, { useState } from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

        .shell-grid-dark {
          background-image:
            linear-gradient(rgba(0,245,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,245,255,0.03) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .shell-grid-light {
          background-image:
            linear-gradient(rgba(0,100,180,0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,100,180,0.05) 1px, transparent 1px);
          background-size: 40px 40px;
        }

        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(0,245,255,0.2); border-radius: 2px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(0,245,255,0.4); }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .blink { animation: blink 1s step-end infinite; }
      `}</style>

      {/* bg-gray-100 = light mode base, dark:bg-gray-950 = dark mode override */}
      <div
        className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950 shell-grid-light dark:shell-grid-dark overflow-hidden transition-colors duration-300"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        <Navbar onToggleSidebar={() => setSidebarCollapsed(p => !p)} />

        <div className="flex flex-1 min-h-0">
          <Sidebar collapsed={sidebarCollapsed} />

          <main className="flex-1 overflow-auto p-6 relative">
            <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500 opacity-[0.02] rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default AppShell;