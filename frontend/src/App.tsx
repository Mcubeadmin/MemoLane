import React from 'react';  // ← this was missing! React.ReactElement needs this
import { Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import AppShell from './components/layout/AppShell';
import { useAuth } from './context/AuthContext';
import ExplorerPage from './pages/ExplorerPage';

function ProtectedShellRoute({ children }: { children: React.ReactElement }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  // AppShell renders: Navbar + Sidebar + {children} + Footer
  return <AppShell>{children}</AppShell>;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/timeline" element={<ProtectedShellRoute><PlaceholderPage 
      title="TIMELINE"/></ProtectedShellRoute>} />
      <Route path="/explorer" element={<ProtectedShellRoute><ExplorerPage /></ProtectedShellRoute>} />
      <Route path="/memories" element={<ProtectedShellRoute><PlaceholderPage title="MEMORIES" /></ProtectedShellRoute>} />
      {/* <Route path="*" element={<Navigate to="/timeline" />} /> */}
    </Routes>
  );
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <div className="border border-cyan-500/20 dark:border-cyan-500/20 px-8 py-6 text-center">
        <p
          className="text-cyan-500/80 dark:text-cyan-500/80 text-xs tracking-widest mb-2 uppercase"
          style={{ fontFamily: "'Share Tech Mono', monospace" }}
        >
          // module
        </p>
        <h1
          className="text-gray-900 dark:text-white text-2xl font-black tracking-[0.2em] uppercase"
          style={{ fontFamily: "'Orbitron', monospace" }}
        >
          {title}
        </h1>
        <p className="text-cyan-700/80 dark:text-cyan-500/80 text-xs mt-3 tracking-widest">
          COMING IN NEXT STAGE_
        </p>
      </div>
    </div>
  );
}

export default App;