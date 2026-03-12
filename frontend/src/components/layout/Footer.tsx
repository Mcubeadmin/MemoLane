// Footer.tsx — slim bottom status bar

import React, { useState, useEffect } from 'react';

const Footer: React.FC = () => {
  // Live clock — useEffect runs after render, setInterval updates every second
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      // toLocaleTimeString formats as HH:MM:SS in the user's locale
      setTime(now.toLocaleTimeString('en-GB', { hour12: false }));
    };
    tick();                          // run immediately
    const id = setInterval(tick, 1000); // then every second
    return () => clearInterval(id);  // cleanup on unmount (prevents memory leaks)
  }, []);

  return (
    /*
      h-8       = height: 2rem (32px) — very slim
      shrink-0  = don't compress in the flex column
      border-t  = top border
    */
    <footer className="h-8 shrink-0 flex items-center justify-between px-4 border-t border-cyan-500/10 bg-gray-950/90">

      {/* Left — coordinates / flavour text */}
      <div className="flex items-center gap-4">
        <span className="text-cyan-500/20 text-xs tracking-widest">
          MEMOLANE::SYS
        </span>
        <div className="w-px h-3 bg-cyan-500/10" />
        <span className="text-cyan-500/15 text-xs hidden sm:block">
          12°58'N 77°35'E
        </span>
      </div>

      {/* Center — subtle gradient line decoration */}
      <div className="flex-1 mx-6 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent" />

      {/* Right — live clock */}
      <div className="flex items-center gap-3">
        <span className="text-cyan-500/20 text-xs tracking-widest hidden sm:block">
          LOCAL::
        </span>
        <span className="text-cyan-400/40 text-xs tabular-nums tracking-widest">
          {time}
        </span>
      </div>
    </footer>
  );
};

export default Footer;