import React, { useState, useEffect } from 'react'; //useRef is for future image modal
import LoadingModal from '../components/LoadingModel';
// ── Types ────────────────────────────────────────────────────
// TypeScript interfaces = shape of our data objects
interface MonthEntry {
  dir: string;         // "01_January"
  label: string;       // "January"
  file_count: number;  // Number of files (from initial tree load)
  files?: string[];    // Lazy-loaded files (populated on demand)
}
interface YearEntry {
  year: string;         // "2020"
  months: MonthEntry[];
}

// Which node is currently selected in the timeline
interface Selection {
  year: string;
  month: string | null; // null = whole year selected
  file?: string | null; // null/undefined = no file selected
}

// ── Mock data — replace with real API call later ─────────────
// const MOCK_TREE: YearEntry[] = [
//   { year: '2020', months: [
//     { dir: '01_January', label: 'January', file_count: 2 },
//     { dir: '02_February', label: 'February', file_count: 1 },
//     { dir: '06_June', label: 'June', file_count: 0 },
//   ]},
//   { year: '2021', months: [
//     { dir: '01_January', label: 'January', file_count: 1 },
//     { dir: '07_July', label: 'July', file_count: 3 },
//     { dir: '12_December', label: 'December', file_count: 1 },
//   ]},
// ];

const ExplorerPage: React.FC = () => {
  const [tree, setTree] = useState<YearEntry[]>([]);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  // NEW: Track which months are expanded to show files
  const [expandedMonths, setExpandedMonths] = useState<Set<string>>(new Set());
  // NEW: Track which months are currently loading files
  const [loadingMonths, setLoadingMonths] = useState<Set<string>>(new Set());
  const [selection, setSelection] = useState<Selection | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch directory tree from backend
  useEffect(() => {
    const fetchTree = async () => {
      const apiUrl = import.meta.env.VITE_API_BASE_URL + '/api/media/tree';
      console.log('Fetching from:', apiUrl);
      setIsLoading(true);
      try {
        const response = await fetch(apiUrl, {
          credentials: 'include',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers.get('content-type'));
        
        if (!response.ok) {
          const text = await response.text();
          console.error('Error response body:', text.substring(0, 500));
          throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
        }
        
        const data = await response.json();
        console.log('Successfully loaded tree:', data);
        setTree(data);
        
        // Auto-expand the most recent year
        if (data.length > 0) {
          setExpandedYears(new Set([data[data.length - 1].year]));
        }
      } catch (err) {
        console.error('Failed to load media tree:', err);
        if (err instanceof Error) {
          console.error('Error details:', {
            message: err.message,
            name: err.name,
            stack: err.stack
          });
        }
        // Fallback to mock data for development
        // console.log('Falling back to mock data');
        // setTree(MOCK_TREE);
        // if (MOCK_TREE.length > 0) {
        //   setExpandedYears(new Set([MOCK_TREE[MOCK_TREE.length - 1].year]));
        // }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTree();
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

  // NEW: Toggle month expansion and lazy-load files if needed
  const toggleMonth = async (year: string, month: MonthEntry) => {
    const monthKey = `${year}-${month.dir}`; // Unique key: "2026-01_January"
    
    const wasExpanded = expandedMonths.has(monthKey);
    
    // PERFORMANCE: Close all other months when opening a new one
    if (!wasExpanded) {
      // Close all other months
      setExpandedMonths(new Set([monthKey]));
      
      // Clear file data from other months to free memory
      setTree(prevTree => 
        prevTree.map(yearEntry => ({
          ...yearEntry,
          months: yearEntry.months.map(m => {
            // Keep files only for the month we're opening
            const isTargetMonth = yearEntry.year === year && m.dir === month.dir;
            return isTargetMonth ? m : { ...m, files: undefined };
          })
        }))
      );
    } else {
      // Collapsing the currently open month
      setExpandedMonths(new Set());
    }
    
    setSelection({ year, month: month.dir });
    
    // If expanding and files haven't been loaded yet, fetch them
    if (!wasExpanded && !month.files) {
      setLoadingMonths(prev => new Set(prev).add(monthKey));
      setIsLoading(true);
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/media/files/${year}/${month.dir}`,
          {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        
        // Update the tree with the loaded files
        setTree(prevTree => 
          prevTree.map(yearEntry => 
            yearEntry.year === year
              ? {
                  ...yearEntry,
                  months: yearEntry.months.map(m =>
                    m.dir === month.dir
                      ? { ...m, files: data.files }
                      : m
                  )
                }
              : yearEntry
          )
        );
      } catch (err) {
        console.error(`Failed to load files for ${year}/${month.dir}`, err);
      } finally {
        setLoadingMonths(prev => {
          const next = new Set(prev);
          next.delete(monthKey);
          setIsLoading(false);
          return next;
        });
      }
    }
  };

  const [currentFile, setCurrentFile] = useState<{
    filename: string;
    type: 'image' | 'video';
    url: string;
  } | null>(null);

  // NEW: Select individual file and load its metadata
  const selectFile = async (year: string, month: MonthEntry, filename: string) => {
  setSelection({ year, month: month.dir, file: filename });
  
  const isVideo = filename.match(/\.(mp4|mov|avi|mkv|webm)$/i);
  // const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp)$/i);
  
  // Fetch file with auth headers
  try {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/media/${year}/${month.dir}/${filename}`,
      {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`,
        },
      }
    );
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    setCurrentFile({
      filename,
      type: isVideo ? 'video' : 'image',
      url: blobUrl  // Use blob URL instead of direct URL
    });
  } catch (error) {
    console.error('Failed to load file:', error);
    setCurrentFile(null);
    }
  };
 
  // NEW: Keyboard navigation for file browsing
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!selection?.file || !selection.month) return;
 
      // Find current month's files
      const yearEntry = tree.find(y => y.year === selection.year);
      const monthEntry = yearEntry?.months.find(m => m.dir === selection.month);
      const files = monthEntry?.files;
 
      if (!files || files.length === 0) return;
 
      const currentIndex = files.indexOf(selection.file);
      if (currentIndex === -1) return;
 
      let newIndex = currentIndex;
 
      switch (e.key) {
        case 'ArrowRight': // Next file
        case 'ArrowDown':
          newIndex = (currentIndex + 1) % files.length;
          break;
        case 'ArrowLeft': // Previous file
        case 'ArrowUp':
          newIndex = (currentIndex - 1 + files.length) % files.length;
          break;
        case 'Escape': // Close preview
          setSelection({ year: selection.year, month: selection.month });
          setCurrentFile(null);
          return;
        default:
          return;
      }
 
      if (newIndex !== currentIndex && monthEntry) {
        selectFile(selection.year, monthEntry, files[newIndex]);
      }
    };
 
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [selection, tree]);
 

  return (
    <>
      {/* <LoadingModal isOpen={isLoading} message="LOADING DATA" /> */}
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
                      ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}
                    `}>
                      <div className="ml-4 pl-3 border-l border-cyan-500/15 dark:border-cyan-500/15 border-gray-200 space-y-0.5 py-1">
                        {yearEntry.months.map((month, monthIdx) => {
                          const monthKey = `${yearEntry.year}-${month.dir}`;
                          const isMonthExpanded = expandedMonths.has(monthKey);
                          const isMonthSelected = selection?.year === yearEntry.year && selection?.month === month.dir && !selection?.file;
                          const isLoading = loadingMonths.has(monthKey);
                          const fileCount = month.file_count; // From initial tree load
                          const filesLoaded = month.files !== undefined; // Have files been lazy-loaded?

                          return (
                            <div key={month.dir}>
                              {/* ── MONTH BUTTON ── */}
                              <button
                                onClick={() => toggleMonth(yearEntry.year, month)}
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
                                <span className="flex-1">{month.label}</span>
                                
                                {/* File count badge OR loading spinner */}
                                {isLoading ? (
                                  <svg className="w-3 h-3 animate-spin text-cyan-400" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                                  </svg>
                                ) : fileCount > 0 ? (
                                  <span className="text-[10px] text-cyan-500/50 dark:text-cyan-500/50">
                                    {fileCount}
                                  </span>
                                ) : null}
                                
                                {/* Expand chevron for files */}
                                {fileCount > 0 && (
                                  <svg
                                    className={`w-2 h-2 transition-transform duration-300 ${isMonthExpanded ? 'rotate-180' : ''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                  </svg>
                                )}
                              </button>

                              {/* ── FILE NODES — shown when month is expanded AND files are loaded ── */}
                              {fileCount > 0 && filesLoaded && (
                                <div className={`
                                  overflow-hidden transition-all duration-300 ease-in-out
                                  ${isMonthExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}
                                `}>
                                  <div className="ml-4 pl-3 border-l border-cyan-500/10 dark:border-cyan-500/10 space-y-0.5 py-1">
                                    {month.files!.map((filename, fileIdx) => {
                                      const isFileSelected = selection?.year === yearEntry.year && 
                                                            selection?.month === month.dir && 
                                                            selection?.file === filename;
                                      
                                      // Determine file type icon
                                      const isVideo = filename.match(/\.(mp4|mov|avi|mkv)$/i);
                                      const isImage = filename.match(/\.(jpg|jpeg|png|gif|webp)$/i);

                                      return (
                                        <button
                                          key={filename}
                                          onClick={() => selectFile(yearEntry.year, month, filename)}
                                          className={`
                                            w-full flex items-center gap-1.5 px-2 py-1 text-left
                                            transition-all duration-200 group
                                            ${isFileSelected
                                              ? 'text-cyan-300 dark:text-cyan-200 bg-cyan-500/15'
                                              : 'text-gray-400 dark:text-cyan-500/60 hover:text-cyan-400 dark:hover:text-cyan-300 hover:bg-cyan-500/5'
                                            }
                                          `}
                                          style={{ animationDelay: `${fileIdx * 0.02}s` }}
                                        >
                                          {/* Tiny file dot */}
                                          <div className={`
                                            shrink-0 w-1 h-1 rounded-full transition-all duration-200
                                            ${isFileSelected
                                              ? 'bg-cyan-300'
                                              : 'bg-cyan-500/15 dark:bg-cyan-500/15 group-hover:bg-cyan-400/40'
                                            }
                                          `} />
                                          
                                          {/* File type icon */}
                                          <span className="text-[10px]">
                                            {isVideo ? '▶' : isImage ? '◼' : '○'}
                                          </span>
                                          
                                          {/* Filename (truncated) */}
                                          <span className="text-[10px] truncate flex-1" title={filename}>
                                            {filename}
                                          </span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
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
            <span className="text-cyan-500/20 dark:text-cyan-500/20 text-gray-300 text-xs truncate block">
              {selection
                ? `${selection.year}${selection.month ? ' :: ' + selection.month.split('_')[1].toUpperCase() : ''}${selection.file ? ' :: ' + selection.file : ''}`
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
                  {selection.file && ` :: ${selection.file}`}
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
 
            ) : selection.file && currentFile ? (
 
              /* Single file preview - Image or Video */
              <div className="w-full h-full p-5">
                <div className="w-full h-full border border-cyan-500/15 dark:border-cyan-500/15 bg-black/20 flex items-center justify-center relative overflow-hidden">
                  
                  {/* Corner brackets for frame */}
                  <div className="absolute top-0 left-0 w-8 h-8 border-l-2 border-t-2 border-cyan-400/30" />
                  <div className="absolute top-0 right-0 w-8 h-8 border-r-2 border-t-2 border-cyan-400/30" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 border-l-2 border-b-2 border-cyan-400/30" />
                  <div className="absolute bottom-0 right-0 w-8 h-8 border-r-2 border-b-2 border-cyan-400/30" />
                  
                  {/* File info overlay - top */}
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-cyan-400 dark:text-cyan-300 text-xs tracking-widest font-mono">
                          {currentFile.type.toUpperCase()} FILE
                        </p>
                        <p className="text-cyan-500/60 dark:text-cyan-500/60 text-[10px] tracking-wider mt-1">
                          {currentFile.filename}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setSelection({ year: selection.year, month: selection.month });
                          setCurrentFile(null);
                        }}
                        className="text-cyan-500/60 hover:text-cyan-400 transition-colors"
                        title="Close preview (ESC)"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
 
                  {/* Navigation buttons - Previous */}
                  {(() => {
                    const yearEntry = tree.find(y => y.year === selection.year);
                    const monthEntry = yearEntry?.months.find(m => m.dir === selection.month);
                    const files = monthEntry?.files || [];
                    const currentIndex = files.indexOf(selection.file!);
                    const hasPrev = currentIndex > 0;
                    const hasNext = currentIndex < files.length - 1;
 
                    return (
                      <>
                        {hasPrev && (
                          <button
                            onClick={() => monthEntry && selectFile(selection.year, monthEntry, files[currentIndex - 1])}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all z-10"
                            title="Previous file (←)"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        )}
                        
                        {hasNext && (
                          <button
                            onClick={() => monthEntry && selectFile(selection.year, monthEntry, files[currentIndex + 1])}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 flex items-center justify-center bg-black/50 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 hover:border-cyan-400 transition-all z-10"
                            title="Next file (→)"
                          >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </>
                    );
                  })()}
 
                  {/* Media content */}
                  <div className="w-full h-full flex items-center justify-center p-12">
                    {currentFile.type === 'image' ? (
                      <img
                        src={currentFile.url}
                        alt={currentFile.filename}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          // Fallback on image load error
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="text-center">
                              <div class="text-cyan-500/30 text-6xl mb-4">◼</div>
                              <p class="text-cyan-500/60 text-sm">Failed to load image</p>
                              <p class="text-cyan-500/30 text-xs mt-2">${currentFile.filename}</p>
                            </div>
                          `;
                        }}
                      />
                    ) : (
                      <video
                        src={currentFile.url}
                        controls
                        className="max-w-full max-h-full"
                        onError={(e) => {
                          // Fallback on video load error
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.parentElement!.innerHTML = `
                            <div class="text-center">
                              <div class="text-cyan-500/30 text-6xl mb-4">▶</div>
                              <p class="text-cyan-500/60 text-sm">Failed to load video</p>
                              <p class="text-cyan-500/30 text-xs mt-2">${currentFile.filename}</p>
                            </div>
                          `;
                        }}
                      >
                        Your browser does not support video playback.
                      </video>
                    )}
                  </div>
 
                  {/* File info overlay - bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between text-[10px] text-cyan-500/40 tracking-wider">
                      <span>
                        {selection.year} :: {selection.month?.split('_')[1]?.toUpperCase()}
                      </span>
                      <span>
                        {currentFile.type.toUpperCase()} PREVIEW
                      </span>
                    </div>
                  </div>
                </div>
              </div>
 
            ) : selection.file ? (
 
              /* Loading state for file */
              <div className="w-full h-full p-5">
                <div className="w-full h-full border border-cyan-500/15 dark:border-cyan-500/15 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-cyan-400 dark:text-cyan-300 text-6xl mb-4 animate-pulse">
                      ◼
                    </div>
                    <p className="text-cyan-500/60 dark:text-cyan-500/60 text-sm tracking-widest">
                      LOADING FILE
                    </p>
                  </div>
                </div>
              </div>
 
            ) : (
 
              /* Month collage grid — Stage 3 will fill this with real images */
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
 
      {/* Loading Modal - shows during initial tree fetch */}
      <LoadingModal 
        isOpen={isLoading} 
        message="INITIALIZING TIMELINE"
      />
    </>
  );
};

export default ExplorerPage;