import React from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarProps {
  collapsed: boolean;
}

interface NavItem {
  label: string;
  path: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'TIMELINE', path: '/timeline', icon: 'M4 6h16M4 10h16M4 14h8' },
  { label: 'EXPLORER', path: '/explorer', icon: 'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' },
  { label: 'MEMORIES', path: '/memories', icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z' },
];

const Sidebar: React.FC<SidebarProps> = ({ collapsed }) => {
  return (
    // bg-white/60 light, dark:bg-gray-950/60 dark
    <aside className={`
      shrink-0 flex flex-col transition-all duration-300 ease-in-out
      ${collapsed ? 'w-12' : 'w-48'}
      border-r border-gray-200 dark:border-cyan-500/10
      bg-white/60 dark:bg-gray-950/60
      backdrop-blur-sm overflow-hidden
    `}>

      {!collapsed && (
        <div className="px-4 pt-5 pb-3">
          <span className="text-gray-400 dark:text-cyan-500/60 text-xs tracking-[0.2em] uppercase transition-colors duration-300">
            // nav
          </span>
        </div>
      )}

      <nav className="flex flex-col gap-1 px-2 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-2 py-2.5 text-xs tracking-widest uppercase
              transition-all duration-200 group relative
              ${isActive
                ? 'text-cyan-500 dark:text-cyan-300 border-l-2 border-cyan-500 dark:border-cyan-400 pl-[6px] bg-cyan-500/5'
                : 'text-gray-400 dark:text-cyan-500/80 hover:text-cyan-500 dark:hover:text-cyan-300 border-l-2 border-transparent hover:border-cyan-500/30 hover:bg-cyan-500/5'
              }
            `}
          >
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
            </svg>
            <span className={`whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
              {item.label}
            </span>
          </NavLink>
        ))}
      </nav>

      {!collapsed && (
        <div className="px-4 py-4 border-t border-gray-200 dark:border-cyan-500/10 transition-colors duration-300">
          <span className="text-gray-300 dark:text-cyan-500/60 text-xs">v0.0.1</span>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;