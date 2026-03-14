import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; //useSearchParams is imported but not used, can be removed
import { useAuth } from '../../context/AuthContext';
import ThemeToggle from '../../assets/ThemeToggle';

interface NavbarProps {
  onToggleSidebar: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isOnline, setIsOnline] = useState<boolean>(false);
  useEffect(() => {
    let intervalId: number;

    const checkServerStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/status`);
        if (response.ok) {
          setIsOnline(true);
        } else {
          setIsOnline(false);
        }
      } catch (error) {
        console.error('Error checking server status:', error);
        setIsOnline(false);
      }
    };

    checkServerStatus();
    intervalId = setInterval(checkServerStatus, 5 * 60000); // every 5 minute

    return () => clearInterval(intervalId);
  }, []);


  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    // bg-white/90 light, dark:bg-gray-950/90 dark
    <header className="h-12 shrink-0 flex items-center px-4 gap-4 border-b border-gray-200 dark:border-cyan-500/10 bg-white/90 dark:bg-gray-950/90 backdrop-blur-sm z-40 transition-colors duration-300">

      {/* Hamburger */}
      <button
        onClick={onToggleSidebar}
        className="flex flex-col gap-1 p-1.5 hover:opacity-60 transition-opacity group"
        aria-label="Toggle sidebar"
      >
        <div className="w-4 h-px bg-gray-400 dark:bg-cyan-500/60 group-hover:bg-cyan-400 transition-colors" />
        <div className="w-3 h-px bg-gray-400 dark:bg-cyan-500/60 group-hover:bg-cyan-400 transition-colors" />
        <div className="w-4 h-px bg-gray-400 dark:bg-cyan-500/60 group-hover:bg-cyan-400 transition-colors" />
      </button>

      {/* Brand */}
      <div className="flex items-center gap-2">
        <span
          className="text-gray-900 dark:text-white text-sm font-black tracking-[0.2em] uppercase transition-colors duration-300"
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          MEMO<span className="text-cyan-500 dark:text-cyan-400">LANE</span>
        </span>
        <span className="text-cyan-500 text-xs blink">_</span>
      </div>

      {/* Divider */}
      <div className="flex-1 h-px bg-gradient-to-r from-gray-200 dark:from-cyan-500/20 to-transparent transition-colors duration-300" />

      {/* Right controls */}
      <div className="flex items-center gap-3">
        <div
          className={`hidden sm:flex items-center gap-1.5 text-xs tracking-widest transition-colors duration-300 ${
        isOnline
          ? 'text-gray-700 dark:text-cyan-300'
          : 'text-red-500 dark:text-red-400'
          }`}
        >
          <div
        className={`w-1.5 h-1.5 rounded-full ${
          isOnline
            ? 'bg-cyan-400 animate-pulse'
            : 'bg-red-500 animate-pulse'
        }`}
          />
          SYS:{isOnline ? 'ONLINE' : 'OFFLINE'}
        </div>

        <div className="w-px h-4 bg-gray-200 dark:bg-cyan-500/20" />
        <ThemeToggle />
        <div className="w-px h-4 bg-gray-200 dark:bg-cyan-500/20" />

        <button
          onClick={handleLogout}
          className="text-xs tracking-widest text-gray-400 dark:text-cyan-500 hover:text-red-400 transition-colors duration-300 uppercase border border-transparent hover:border-red-500/30 px-2 py-1"
        >
          [ EXIT ]
        </button>
      </div>
    </header>
  );
};

export default Navbar;