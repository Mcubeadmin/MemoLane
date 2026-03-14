import React from 'react';

interface LoadingModalProps {
  isOpen: boolean;
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ 
  isOpen, 
  message = 'PROCESSING DATA'
}) => {
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');

        /* DNA Helix Animation */
        @keyframes dnaRotate {
          0% { transform: rotateY(0deg); }
          100% { transform: rotateY(360deg); }
        }

        @keyframes dnaPulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @keyframes scanlineMove {
          0%, 100% { transform: translateY(-100%); }
          50% { transform: translateY(100%); }
        }

        @keyframes dataStream {
          0% { transform: translateY(-100%); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }

        @keyframes glitchText {
          0%, 100% { transform: translate(0); }
          20% { transform: translate(-2px, 2px); }
          40% { transform: translate(-2px, -2px); }
          60% { transform: translate(2px, 2px); }
          80% { transform: translate(2px, -2px); }
        }

        @keyframes blink { 
          0%, 100% { opacity: 1; } 
          50% { opacity: 0; } 
        }

        .dna-helix {
          animation: dnaRotate 3s linear infinite;
          transform-style: preserve-3d;
        }

        .dna-strand {
          animation: dnaPulse 2s ease-in-out infinite;
        }

        .scanline {
          animation: scanlineMove 2s ease-in-out infinite;
        }

        .data-stream {
          animation: dataStream 3s ease-in-out infinite;
        }

        .glitch {
          animation: glitchText 0.3s ease-in-out infinite;
        }

        .cursor-blink {
          animation: blink 1s step-end infinite;
        }

        /* Grid background */
        .grid-bg {
          background-image: 
            linear-gradient(rgba(0, 245, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 245, 255, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>

      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm grid-bg"
        style={{ fontFamily: "'Share Tech Mono', monospace" }}
      >
        {/* Animated scanline */}
        <div className="scanline absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />

        {/* Modal Container */}
        <div className="relative w-96 border border-cyan-500/30 bg-gray-950/90 backdrop-blur-md p-8">
          
          {/* Corner brackets */}
          <div className="absolute top-0 left-0 w-6 h-6 border-l-2 border-t-2 border-cyan-400/50" />
          <div className="absolute top-0 right-0 w-6 h-6 border-r-2 border-t-2 border-cyan-400/50" />
          <div className="absolute bottom-0 left-0 w-6 h-6 border-l-2 border-b-2 border-cyan-400/50" />
          <div className="absolute bottom-0 right-0 w-6 h-6 border-r-2 border-b-2 border-cyan-400/50" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400/30 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
            <p className="text-cyan-500/60 text-xs tracking-[0.3em] uppercase">
              // SYSTEM STATUS
            </p>
          </div>

          {/* DNA Helix Loader */}
          <div className="relative h-32 flex items-center justify-center mb-8">
            <div className="dna-helix relative w-16 h-24">
              {/* DNA strands */}
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="dna-strand absolute w-3 h-3 rounded-full border-2 border-cyan-400 bg-cyan-400/20"
                  style={{
                    left: `${Math.sin((i / 8) * Math.PI * 2) * 20 + 50}%`,
                    top: `${(i / 8) * 100}%`,
                    animationDelay: `${i * 0.15}s`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  <div className="absolute inset-1 rounded-full bg-cyan-400" />
                </div>
              ))}
              
              {/* Center vertical line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-cyan-400/30 to-transparent transform -translate-x-1/2" />
            </div>

            {/* Data stream particles */}
            {[...Array(3)].map((_, i) => (
              <div
                key={`stream-${i}`}
                className="data-stream absolute w-1 h-8 bg-gradient-to-b from-transparent via-cyan-400/60 to-transparent"
                style={{
                  left: `${30 + i * 20}%`,
                  animationDelay: `${i * 0.8}s`
                }}
              />
            ))}
          </div>

          {/* Loading Message */}
          <div className="text-center space-y-4">
            <p 
              className="text-cyan-300 text-sm tracking-[0.2em] uppercase font-bold"
              style={{ fontFamily: "'Orbitron', monospace" }}
            >
              {message}
              <span className="cursor-blink">_</span>
            </p>

            {/* Progress bar */}
            <div className="relative h-1 bg-cyan-950/50 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" 
                   style={{ 
                     animation: 'dataStream 2s ease-in-out infinite',
                     width: '50%'
                   }} 
              />
            </div>

            {/* Status indicators */}
            <div className="flex justify-center gap-4 text-xs text-cyan-500/40 tracking-wider">
              <span>LATENCY: <span className="text-cyan-400">12ms</span></span>
              <span>•</span>
              <span>NODES: <span className="text-cyan-400">847</span></span>
            </div>
          </div>

          {/* Bottom accent line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-400/20 to-transparent" />
        </div>
      </div>
    </>
  );
};

export default LoadingModal;