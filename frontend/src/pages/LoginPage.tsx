import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────
// WHY THIS APPROACH?
// ─────────────────────────────────────────────
// Your problem: Tailwind utility classes were
// conflicting with custom CSS classes. The card
// wasn't centering because the outer div needs
// BOTH height AND flex to center — Tailwind's
// min-h-screen doesn't always work if the parent
// <body> or <html> has no height set.
//
// Solution: Use inline styles + a single <style>
// block. 100% predictable, zero conflicts.
// ─────────────────────────────────────────────

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError]       = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDark, setIsDark]     = useState<boolean>(true);   // dark by default
  const [mounted, setMounted]   = useState<boolean>(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await login(username, password);
      navigate('/timeline');
    } catch {
      setError('ACCESS DENIED — Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  // ── DESIGN TOKENS ──────────────────────────
  // These change based on isDark. This is how
  // theme toggling works without Tailwind dark:.
  // Think of it like CSS variables that update
  // instantly when you call setIsDark().
  const theme = {
    pageBg:      isDark ? '#05070f'      : '#f0f4f8',
    cardBg:      isDark ? '#0d1117'      : '#ffffff',
    cardBorder:  isDark ? 'rgba(0,245,255,0.15)' : 'rgba(0,120,200,0.2)',
    text:        isDark ? '#cdd9e5'      : '#1a2332',
    textMuted:   isDark ? 'rgba(0,245,255,0.4)'  : 'rgba(0,100,180,0.5)',
    accent:      isDark ? '#00f5ff'      : '#0078c8',
    accentDim:   isDark ? 'rgba(0,245,255,0.08)' : 'rgba(0,120,200,0.08)',
    inputBorder: isDark ? 'rgba(0,245,255,0.2)'  : 'rgba(0,120,200,0.3)',
    inputText:   isDark ? '#a8d8e8'      : '#1a2332',
    gridColor:   isDark ? 'rgba(0,245,255,0.03)' : 'rgba(0,100,180,0.04)',
    toggleBg:    isDark ? 'rgba(0,245,255,0.08)' : 'rgba(0,120,200,0.08)',
    toggleBorder:isDark ? 'rgba(0,245,255,0.25)' : 'rgba(0,120,200,0.3)',
    toggleText:  isDark ? '#00f5ff'      : '#0078c8',
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap');

        /* Reset — ensures body/html fill full viewport height */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root {
          height: 100%;          /* ← THIS is why centering fails without it */
          width: 100%;
        }

        /* Scrolling grid background */
        @keyframes gridScroll {
          from { background-position: 0 0; }
          to   { background-position: 40px 40px; }
        }

        /* Scan line sweeping up the card */
        @keyframes scan {
          0%, 100% { transform: translateY(-100%); opacity: 0; }
          20%       { opacity: 1; }
          80%       { opacity: 1; }
          50%       { transform: translateY(100%); }
        }

        /* Blinking cursor */
        @keyframes blink { 0%,100% { opacity:1 } 50% { opacity:0 } }
        .blink { animation: blink 1.2s step-end infinite; }

        /* Card entrance */
        @keyframes riseUp {
          from { opacity: 0; transform: translateY(32px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Staggered field reveals */
        .field-0 { animation: riseUp 0.5s ease 0.15s both; }
        .field-1 { animation: riseUp 0.5s ease 0.28s both; }
        .field-2 { animation: riseUp 0.5s ease 0.41s both; }
        .field-3 { animation: riseUp 0.5s ease 0.54s both; }
        .field-4 { animation: riseUp 0.5s ease 0.67s both; }

        /* Input focus glow */
        .cyber-input:focus {
          outline: none;
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 1px var(--accent), 0 0 18px rgba(0,245,255,0.15);
        }

        /* Button shimmer sweep on hover */
        .cyber-btn { position: relative; overflow: hidden; cursor: pointer; }
        .cyber-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.07) 50%, transparent 100%);
          transform: translateX(-100%);
          transition: transform 0.45s ease;
        }
        .cyber-btn:hover::after { transform: translateX(100%); }
        .cyber-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .cyber-btn:disabled::after { display: none; }

        /* Corner bracket decorators on card */
        .bracket::before, .bracket::after {
          content: '';
          position: absolute;
          width: 14px; height: 14px;
          border-color: var(--accent);
          border-style: solid;
          opacity: 0.5;
        }
        .bracket::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .bracket::after  { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

        /* Scanline sweep overlay on card */
        .scanline { position: relative; overflow: hidden; }
        .scanline::before {
          content: '';
          position: absolute;
          left: 0; right: 0;
          height: 40%;
          background: linear-gradient(180deg, transparent, rgba(0,245,255,0.025), transparent);
          animation: scan 5s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
        }

        /* Toggle hover */
        .theme-toggle:hover { opacity: 0.85; }
      `}</style>

      {/*
        ── PAGE WRAPPER ──────────────────────────────
        display: flex + place-items: center = perfect
        centering in BOTH axes.

        Using inline style (not Tailwind) so there's
        zero chance of a class conflict or specificity
        issue from other stylesheets in your project.
      */}
      <div style={{
        display:         'grid',
        placeItems:      'center',   // centers child both horizontally + vertically
        minHeight:       '100vh',    // full viewport height
        width:           '100%',
        backgroundColor: theme.pageBg,
        backgroundImage: `
          linear-gradient(${theme.gridColor} 1px, transparent 1px),
          linear-gradient(90deg, ${theme.gridColor} 1px, transparent 1px)
        `,
        backgroundSize:  '40px 40px',
        animation:       'gridScroll 20s linear infinite',
        transition:      'background-color 0.4s ease',
        fontFamily:      "'Share Tech Mono', monospace",
        padding:         '24px',     // so card doesn't touch edges on mobile
        position:        'relative',
      }}>

        {/* Atmospheric glow blob — top center */}
        <div style={{
          position:   'absolute', top: 0, left: '50%',
          transform:  'translateX(-50%)',
          width:      '500px', height: '250px',
          background: theme.accent,
          opacity:    0.04,
          borderRadius: '50%',
          filter:     'blur(80px)',
          pointerEvents: 'none',
        }} />

        {/* ── DARK / LIGHT TOGGLE — top right corner ── */}
        <button
          className="theme-toggle"
          onClick={() => setIsDark(d => !d)}
          style={{
            position:    'fixed',   // fixed = always in corner even if page scrolls
            top:         '16px',
            right:       '16px',
            zIndex:      100,
            background:  theme.toggleBg,
            border:      `1px solid ${theme.toggleBorder}`,
            color:       theme.toggleText,
            fontFamily:  "'Share Tech Mono', monospace",
            fontSize:    '11px',
            letterSpacing: '0.15em',
            padding:     '7px 14px',
            cursor:      'pointer',
            transition:  'all 0.3s ease',
            borderRadius: '2px',
          }}
        >
          {isDark ? '[ ☀ LIGHT ]' : '[ ◑ DARK ]'}
        </button>

        {/*
          ── LOGIN CARD ────────────────────────────────
          width: '100%' + maxWidth: '400px' is the key
          pattern for a "fixed max-width, centered" card.

          The parent's display:grid + placeItems:center
          handles the centering. The card just needs its
          own width constraints.
        */}
        <div
          className="bracket scanline"
          style={{
            width:           '100%',
            maxWidth:        '400px',  // ← never wider than 400px
            backgroundColor: theme.cardBg,
            border:          `1px solid ${theme.cardBorder}`,
            padding:         '36px',
            position:        'relative',
            transition:      'background-color 0.4s ease, border-color 0.4s ease',
            animation:       mounted ? 'riseUp 0.55s ease 0.05s both' : 'none',
            // CSS variable for .bracket and .cyber-input pseudo-elements
            ['--accent' as string]: theme.accent,
          }}
        >
          {/* Status bar */}
          <div className="field-0" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'28px' }}>
            <span style={{ color: theme.textMuted, fontSize:'11px', letterSpacing:'0.2em', textTransform:'uppercase' }}>
              sys.auth
            </span>
            <div style={{ display:'flex', gap:'6px' }}>
              {[0.7, 0.25, 0.25].map((op, i) => (
                <div key={i} style={{ width:'6px', height:'6px', borderRadius:'50%', background: theme.accent, opacity: op }} />
              ))}
            </div>
          </div>

          {/* Brand */}
          <div className="field-1" style={{ marginBottom:'28px' }}>
            <h1 style={{
              fontFamily:    "'Orbitron', monospace",
              fontSize:      '26px',
              fontWeight:    900,
              letterSpacing: '0.22em',
              color:         '#ffffff',
              textTransform: 'uppercase',
              // In light mode, use darker color for contrast
              ...(isDark ? {} : { color: '#0a1628' }),
            }}>
              MEMO<span style={{ color: theme.accent }}>LANE</span>
            </h1>
            <p style={{ color: theme.textMuted, fontSize:'10px', marginTop:'6px', letterSpacing:'0.18em' }}>
              INITIALIZING SECURE SESSION<span className="blink">_</span>
            </p>
          </div>

          {/* Divider */}
          <div style={{
            height:'1px',
            background: `linear-gradient(to right, transparent, ${theme.accent}33, transparent)`,
            marginBottom:'28px',
          }} />

          {/* Error */}
          {error && (
            <div style={{
              marginBottom:'18px', padding:'10px 12px',
              border:'1px solid rgba(239,68,68,0.3)',
              background:'rgba(239,68,68,0.08)',
              color:'#f87171', fontSize:'11px', letterSpacing:'0.1em',
            }}>
              ⚠ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

            {/* Username */}
            <div className="field-2">
              <label htmlFor="username" style={{ display:'block', color: theme.textMuted, fontSize:'10px', letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:'8px' }}>
                // USER_ID
              </label>
              <input
                className="cyber-input"
                type="text"
                id="username"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                placeholder="enter_username"
                style={{
                  width:           '100%',
                  background:      'transparent',
                  border:          'none',
                  borderBottom:    `1px solid ${theme.inputBorder}`,
                  color:           theme.inputText,
                  fontFamily:      "'Share Tech Mono', monospace",
                  fontSize:        '13px',
                  letterSpacing:   '0.12em',
                  padding:         '8px 0',
                  transition:      'border-color 0.3s, box-shadow 0.3s',
                  // CSS var used by .cyber-input:focus in <style>
                  ['--accent' as string]: theme.accent,
                }}
              />
            </div>

            {/* Password */}
            <div className="field-3">
              <label htmlFor="password" style={{ display:'block', color: theme.textMuted, fontSize:'10px', letterSpacing:'0.22em', textTransform:'uppercase', marginBottom:'8px' }}>
                // PASS_KEY
              </label>
              <input
                className="cyber-input"
                type="password"
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                placeholder="••••••••••••"
                style={{
                  width:         '100%',
                  background:    'transparent',
                  border:        'none',
                  borderBottom:  `1px solid ${theme.inputBorder}`,
                  color:         theme.inputText,
                  fontFamily:    "'Share Tech Mono', monospace",
                  fontSize:      '13px',
                  letterSpacing: '0.12em',
                  padding:       '8px 0',
                  transition:    'border-color 0.3s, box-shadow 0.3s',
                  ['--accent' as string]: theme.accent,
                }}
              />
            </div>

            {/* Submit */}
            <div className="field-4" style={{ paddingTop:'8px' }}>
              <button
                type="submit"
                disabled={isLoading}
                className="cyber-btn"
                style={{
                  width:         '100%',
                  background:    theme.accentDim,
                  border:        `1px solid ${theme.accent}55`,
                  color:         theme.accent,
                  fontFamily:    "'Orbitron', monospace",
                  fontSize:      '11px',
                  fontWeight:    700,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  padding:       '13px 16px',
                  transition:    'background 0.3s, border-color 0.3s, color 0.3s',
                }}
              >
                {isLoading ? (
                  <span style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:'10px' }}>
                    <svg style={{ width:'14px', height:'14px', animation:'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
                      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity:0.25 }}/>
                      <path fill="currentColor" d="M4 12a8 8 0 018-8v8z" style={{ opacity:0.75 }}/>
                    </svg>
                    AUTHENTICATING...
                  </span>
                ) : '[ AUTHENTICATE ]'}
              </button>
            </div>
          </form>

          {/* Footer */}
          <div style={{ marginTop:'28px', paddingTop:'20px', borderTop:`1px solid ${theme.cardBorder}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <span style={{ color: theme.textMuted, fontSize:'10px', opacity:0.5 }}>v2.4.1</span>
            <span style={{ color: theme.textMuted, fontSize:'10px', letterSpacing:'0.15em', cursor:'pointer' }}>
              REQUEST_ACCESS
            </span>
          </div>
        </div>
      </div>
    </>
  );
};

export default LoginPage;