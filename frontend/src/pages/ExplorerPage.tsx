import React, { useState, useEffect, useRef } from 'react';

// ── Types ────────────────────────────────────────────────────
// TypeScript interfaces = shape of our data objects
interface MonthEntry {
  dir: string;    // "01_January"
  label: string;  // "January"
}
interface YearEntry {
  year: string;         // "2020"
  months: MonthEntry[];
}

// Which node is currently selected in the timeline
interface Selection {
  year: string;
  month: string | null; // null = whole year selected
}

// ── Mock data — replace with real API call later ─────────────
const MOCK_TREE: YearEntry[] = [
  { year: '2020', months: [
    { dir: '01_January', label: 'January' },
    { dir: '02_February', label: 'February' },
    { dir: '06_June', label: 'June' },
  ]},
  { year: '2021', months: [
    { dir: '01_January', label: 'January' },
    { dir: '07_July', label: 'July' },
    { dir: '12_December', label: 'December' },
  ]},
  { year: '2022', months: [
    { dir: '03_March', label: 'March' },
    { dir: '08_August', label: 'August' },
  ]},
  { year: '2023', months: [
    { dir: '02_February', label: 'February' },
    { dir: '05_May', label: 'May' },
    { dir: '09_September', label: 'September' },
    { dir: '11_November', label: 'November' },
  ]},
];

const ExplorerPage: React.FC = () => {
  const [tree, setTree] = useState<YearEntry[]>([]);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<Selection | null>(null);
  const [mounted, setMounted] = useState(false);

  // Fetch directory tree from backend
  useEffect(() => {
    setMounted(true);
    // ── Real API call (uncomment when backend is ready) ──────
    // fetch('/api/media/tree')
    //   .then(r => r.json())
    //   .then(data => setTree(data))
    //   .catch(err => console.error('Failed to load media tree', err));

    // Using mock data for now
    setTree(MOCK_TREE);

    // Auto-expand the most recent year
    if (MOCK_TREE.length > 0) {
      setExpandedYears(new Set([MOCK_TREE[MOCK_TREE.length - 1].year]));
    }
  }, []);

  const toggleYear = (year: string) => {
    // Set = like an array but with unique values and fast lookup
    setExpandedYears(prev => {
      const next = new Set(prev);
      next.has(year) ? next.delete(year) : next.add(year);
      return next;
    });
    setSelection({ year, month: null });
  };

  const selectMonth = (year: string, month: MonthEntry) => {
    setSelection({ year, month: month.dir });
    // Stage 3: fetch images for this year/month from backend here
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

        /* DNA helix strand — the vertical timeline line */
        .timeline-strand {
          position: relative;
        }
        .timeline-strand::before {
          content: '';
          position: absolute;
          left: 0%;
          top: 0; bottom: 0;
          width: 1px;
          background: linear-gradient(
            180deg,
            transparent,
            rgba(0,245,255,0.3) 10%,
            rgba(0,245,255,0.3) 90%,
            transparent
          );
          transform: translateX(-50%);
        }

        /* Pulse animation on selected node */
        @keyframes nodePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(0,245,255,0.8); }
          50%       { box-shadow: 0 0 0 6px rgba(0,245,255,0); }
        }
        .node-pulse { animation: nodePulse 2s ease-in-out infinite; }

        /* Fade-in for timeline items */
        @keyframes fadeInLeft {
          from { opacity: 0; transform: translateX(-12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .fade-in-left { animation: fadeInLeft 0.3s ease forwards; }

        /* Scan line on viewing panel */
        @keyframes scanDown {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          10%       { opacity: 1; }
          90%       { opacity: 1; }
          100%      { transform: translateY(400%); opacity: 0; }
        }
        .scan-line {
          position: absolute;
          left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(0,245,255,0.4), transparent);
          animation: scanDown 6s ease-in-out infinite;
          pointer-events: none;
        }

        /* Viewing panel corner brackets */
        .view-panel {
          position: relative;
        }
        .view-panel::before,
        .view-panel::after {
          content: '';
          position: absolute;
          width: 20px; height: 20px;
          border-color: rgba(0,245,255,0.3);
          border-style: solid;
        }
        .view-panel::before { top: 0; left: 0; border-width: 2px 0 0 2px; }
        .view-panel::after  { bottom: 0; right: 0; border-width: 0 2px 2px 0; }

        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        .blink { animation: blink 1s step-end infinite; }
      `}</style>

      {/*
        h-full      = fills the <main> area from AppShell
        flex gap-4  = side-by-side panels with gap
      */}
      <div className="h-full flex gap-4" style={{ fontFamily: "'Share Tech Mono', monospace" }}>

        {/* ══════════════════════════════════════════
            LEFT — TIMELINE PANEL
            w-56      = fixed width: 14rem
            flex-col  = stack header + scrollable list
        ══════════════════════════════════════════ */}
        <div className="w-56 shrink-0 flex flex-col border border-cyan-500/15 dark:border-cyan-500/15 border-gray-200 bg-white/40 dark:bg-gray-950/60 backdrop-blur-sm">

          {/* Panel header */}
          <div className="px-4 py-3 border-b border-cyan-500/10 dark:border-cyan-500/10 border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-cyan-500/60 dark:text-cyan-500/90 text-gray-500 text-xs tracking-[0.2em] uppercase">
                // timeline
              </span>
              {/* Animated dots — status indicator */}
              <div className="flex gap-1">
                <div className="w-1 h-1 rounded-full bg-cyan-400 animate-pulse" />
                <div className="w-1 h-1 rounded-full bg-cyan-400/50 animate-pulse" style={{ animationDelay: '0.3s' }} />
                <div className="w-1 h-1 rounded-full bg-cyan-400/20 animate-pulse" style={{ animationDelay: '0.6s' }} />
              </div>
            </div>
            <p className="text-cyan-500/90 text-xs mt-1">
              {tree.length} EPOCHS FOUND<span className="blink">_</span>
            </p>
          </div>

          {/* Scrollable timeline — overflow-y-auto lets THIS div scroll */}
          <div className="flex-1 overflow-y-auto py-4 px-3">
            <div className="timeline-strand space-y-1">
              {tree.map((yearEntry, yearIdx) => {
                const isExpanded = expandedYears.has(yearEntry.year);
                const isYearSelected = selection?.year === yearEntry.year && !selection?.month;

                return (
                  <div key={yearEntry.year} className="fade-in-left" style={{ animationDelay: `${yearIdx * 0.05}s` }}>

                    {/* ── YEAR NODE ── */}
                    <button
                      onClick={() => toggleYear(yearEntry.year)}
                      className={`
                        w-full flex items-center gap-2 px-2 py-1.5 text-left
                        transition-all duration-200 group
                        ${isYearSelected
                          ? 'text-cyan-300 dark:text-cyan-300'
                          : 'text-gray-500 dark:text-cyan-500/80 hover:text-cyan-400 dark:hover:text-cyan-300'
                        }
                      `}
                    >
                      {/* DNA node dot — the circle on the strand */}
                      <div className={`
                        relative shrink-0 w-3 h-3 rounded-full border transition-all duration-300
                        ${isYearSelected
                          ? 'border-cyan-400 bg-cyan-400/30 node-pulse'
                          : 'border-cyan-500/40 dark:border-cyan-500/40 border-gray-300 bg-transparent group-hover:border-cyan-400 group-hover:bg-cyan-400/10'
                        }
                      `}>
                        {/* Inner dot when selected */}
                        {isYearSelected && (
                          <div className="absolute inset-[3px] rounded-full bg-cyan-400" />
                        )}
                      </div>

                      {/* Year label */}
                      <span
                        className="text-sm font-black tracking-widest"
                        style={{ fontFamily: "'Orbitron', monospace" }}
                      >
                        {yearEntry.year}
                      </span>

                      {/* Expand chevron — rotates when open */}
                      <svg
                        className={`w-3 h-3 ml-auto transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {/* ── MONTH NODES — shown when year is expanded ── */}
                    {/* max-h-0 collapsed, max-h-96 expanded — CSS height animation */}
                    <div className={`
                      overflow-hidden transition-all duration-300 ease-in-out
                      ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
                    `}>
                      <div className="ml-4 pl-3 border-l border-cyan-500/15 dark:border-cyan-500/15 border-gray-200 space-y-0.5 py-1">
                        {yearEntry.months.map((month, monthIdx) => {
                          const isMonthSelected = selection?.year === yearEntry.year && selection?.month === month.dir;

                          return (
                            <button
                              key={month.dir}
                              onClick={() => selectMonth(yearEntry.year, month)}
                              className={`
                                w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs
                                tracking-widest uppercase transition-all duration-200 group
                                ${isMonthSelected
                                  ? 'text-gray-400 dark:text-cyan-300 bg-cyan-500/10'
                                  : 'text-gray-400 dark:text-cyan-500/80 hover:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-500/5'
                                }
                              `}
                              style={{ animationDelay: `${monthIdx * 0.03}s` }}
                            >
                              {/* Small month node */}
                              <div className={`
                                shrink-0 w-1.5 h-1.5 rounded-full transition-all duration-200
                                ${isMonthSelected
                                  ? 'bg-cyan-400'
                                  : 'bg-cyan-500/20 dark:bg-cyan-500/20 bg-gray-300 group-hover:bg-cyan-400/60'
                                }
                              `} />
                              {month.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>

          {/* Panel footer */}
          <div className="px-4 py-2 border-t border-cyan-500/10 dark:border-cyan-500/10 border-gray-100">
            <span className="text-cyan-500/20 dark:text-cyan-500/20 text-gray-300 text-xs">
              {selection
                ? `${selection.year}${selection.month ? ' :: ' + selection.month.split('_')[1].toUpperCase() : ''}`
                : 'NO SELECTION_'
              }
            </span>
          </div>
        </div>

        {/* ══════════════════════════════════════════
            RIGHT — VIEWING PANEL
            flex-1 = takes all remaining width
        ══════════════════════════════════════════ */}
        <div className="flex-1 view-panel border border-cyan-500/15 dark:border-cyan-500/15 border-gray-200 bg-white/40 dark:bg-gray-950/60 backdrop-blur-sm overflow-hidden">

          {/* Scan line effect */}
          <div className="scan-line" />

          {/* Panel header */}
          <div className="px-5 py-3 border-b border-cyan-500/10 dark:border-cyan-500/10 border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-gray-500/90 dark:text-cyan-500/90 text-gray-500 text-xs tracking-[0.2em] uppercase">
                // viewer
              </span>
              {selection && (
                <span className="ml-3 text-cyan-400 dark:text-cyan-300 text-cyan-600 text-xs tracking-widest"
                      style={{ fontFamily: "'Orbitron', monospace" }}>
                  {selection.year}
                  {selection.month && ` :: ${selection.month.split('_')[1].toUpperCase()}`}
                </span>
              )}
            </div>
            {/* View mode buttons — for future 3D toggle */}
            <div className="flex gap-1">
              {['GRID', '3D'].map(mode => (
                <button key={mode}
                  className="px-2 py-0.5 text-xs tracking-widest border border-cyan-500/20 dark:border-cyan-500/20 border-gray-200 text-cyan-500/40 dark:text-cyan-500/40 text-gray-400 hover:border-cyan-400/50 hover:text-cyan-400 transition-all duration-200"
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Main viewing area */}
          <div className="h-[calc(100%-48px)] flex items-center justify-center relative">
            {!selection ? (

              /* Empty state */
              <div className="text-center">
                <div className="w-16 h-16 border border-cyan-500/20 dark:border-cyan-500/20 border-gray-200 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-cyan-500/30 dark:text-cyan-500/30 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-gray-400 dark:text-cyan-500/30 text-xs tracking-[0.2em] uppercase">
                  SELECT A MONTH TO VIEW MEMORIES
                </p>
                <p className="text-gray-300 dark:text-cyan-500/15 text-xs mt-1">
                  ← CHOOSE FROM TIMELINE
                </p>
              </div>

            ) : (

              /* Placeholder collage grid — Stage 3 will fill this with real images */
              <div className="w-full h-full p-5">
                <div className="w-full h-full border border-dashed border-cyan-500/15 dark:border-cyan-500/15 border-gray-200 flex flex-col items-center justify-center gap-3">

                  {/* Placeholder grid skeleton */}
                  <div className="grid grid-cols-4 gap-2 w-full max-w-lg px-8">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div
                        key={i}
                        className="aspect-square bg-cyan-500/5 dark:bg-cyan-500/5 bg-gray-100 border border-cyan-500/10 dark:border-cyan-500/10 border-gray-200 animate-pulse"
                        style={{ animationDelay: `${i * 0.1}s` }}
                      />
                    ))}
                  </div>

                  <p className="text-cyan-500/25 dark:text-cyan-500/25 text-gray-400 text-xs tracking-widest mt-2">
                    LOADING MEMORIES :: {selection.year}
                    {selection.month && ` / ${selection.month.split('_')[1].toUpperCase()}`}
                    <span className="blink">_</span>
                  </p>
                  <p className="text-cyan-500/15 dark:text-cyan-500/15 text-gray-300 text-xs tracking-widest">
                    IMAGE COLLAGE — STAGE 3
                  </p>
                </div>
              </div>

            )}
          </div>
        </div>

      </div>
    </>
  );
};

export default ExplorerPage;