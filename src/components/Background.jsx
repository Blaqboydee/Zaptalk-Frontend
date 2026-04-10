import React from 'react';

const ZapTalkBackground = () => {
  return (
    <div className="min-h-screen bg-gray-900 relative overflow-hidden">
      {/* Enhanced Background Decorations */}
      <div className="absolute inset-0">
        {/* Primary orange glows */}
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full opacity-20 animate-pulse"
             style={{ 
               background: 'radial-gradient(circle, rgba(255, 107, 53, 0.4), rgba(255, 107, 53, 0.1), transparent)',
               filter: 'blur(2px)'
             }}></div>
        
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full opacity-20 animate-pulse"
             style={{ 
               background: 'radial-gradient(circle, rgba(255, 107, 53, 0.4), rgba(255, 107, 53, 0.1), transparent)', 
               animationDelay: '0.5s',
               filter: 'blur(2px)'
             }}></div>

        {/* Secondary accent glows */}
        <div className="absolute top-20 left-20 w-48 h-48 rounded-full opacity-15 animate-pulse"
             style={{ 
               background: 'radial-gradient(circle, rgba(255, 255, 255, 0.3), rgba(255, 255, 255, 0.1), transparent)', 
               animationDelay: '1s',
               filter: 'blur(1px)'
             }}></div>

        <div className="absolute top-1/2 right-1/3 w-32 h-32 rounded-full opacity-10 animate-pulse"
             style={{ 
               background: 'radial-gradient(circle, rgba(255, 107, 53, 0.5), transparent)', 
               animationDelay: '2s',
               filter: 'blur(3px)'
             }}></div>

        <div className="absolute bottom-1/4 right-20 w-24 h-24 rounded-full opacity-12 animate-pulse"
             style={{ 
               background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4), transparent)', 
               animationDelay: '3s'
             }}></div>

        {/* Enhanced pattern overlay with multiple layers */}
        <div 
          className="absolute inset-0 opacity-4"
          style={{
            backgroundImage: `
              linear-gradient(90deg, rgba(255, 107, 53, 0.15) 1px, transparent 1px),
              linear-gradient(rgba(255, 107, 53, 0.15) 1px, transparent 1px),
              radial-gradient(circle at 25% 25%, rgba(255, 107, 53, 0.2) 1px, transparent 1px),
              radial-gradient(circle at 75% 75%, rgba(255, 255, 255, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px, 40px 40px, 20px 20px, 60px 60px'
          }}
        ></div>

        {/* Additional geometric patterns */}
        <div 
          className="absolute top-10 right-10 w-24 h-24 opacity-5"
          style={{
            background: `
              conic-gradient(
                from 0deg,
                rgba(255, 107, 53, 0.3) 0deg,
                transparent 90deg,
                rgba(255, 107, 53, 0.2) 180deg,
                transparent 270deg
              )
            `
          }}
        ></div>

        <div 
          className="absolute bottom-16 left-16 w-32 h-32 opacity-6"
          style={{
            background: `
              repeating-conic-gradient(
                from 45deg,
                rgba(255, 255, 255, 0.1) 0deg,
                rgba(255, 255, 255, 0.1) 30deg,
                transparent 30deg,
                transparent 60deg
              )
            `
          }}
        ></div>

        {/* Mesh gradient overlay for depth */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: `
              linear-gradient(135deg, 
                rgba(255, 107, 53, 0.05) 0%, 
                transparent 20%, 
                transparent 80%, 
                rgba(255, 107, 53, 0.03) 100%
              )
            `
          }}
        ></div>

        {/* Geometric patterns */}
        <div 
          className="absolute top-1/4 left-1/4 w-20 h-20 opacity-8 animate-pulse"
          style={{
            background: `
              linear-gradient(45deg, rgba(255, 107, 53, 0.3) 25%, transparent 25%),
              linear-gradient(-45deg, rgba(255, 107, 53, 0.3) 25%, transparent 25%),
              linear-gradient(45deg, transparent 75%, rgba(255, 107, 53, 0.3) 75%),
              linear-gradient(-45deg, transparent 75%, rgba(255, 107, 53, 0.3) 75%)
            `,
            backgroundSize: '8px 8px',
            backgroundPosition: '0 0, 0 4px, 4px -4px, -4px 0px',
            animationDelay: '0s',
            animationDuration: '6s'
          }}
        ></div>
        
        <div 
          className="absolute top-3/4 right-1/4 w-16 h-16 opacity-6 animate-pulse"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                rgba(255, 255, 255, 0.2) 0px,
                rgba(255, 255, 255, 0.2) 2px,
                transparent 2px,
                transparent 6px
              )
            `,
            animationDelay: '2s',
            animationDuration: '8s'
          }}
        ></div>
        
        <div 
          className="absolute top-1/2 left-1/6 w-12 h-12 opacity-7 animate-pulse"
          style={{
            background: `
              radial-gradient(circle at center, rgba(255, 107, 53, 0.4) 1px, transparent 1px),
              radial-gradient(circle at center, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '6px 6px, 12px 12px',
            backgroundPosition: '0 0, 3px 3px',
            animationDelay: '4s',
            animationDuration: '7s'
          }}
        ></div>

        {/* Lightning bolt inspired shapes for "Zap" theme */}
        <div className="absolute top-16 right-1/4 opacity-5">
          <svg width="40" height="60" viewBox="0 0 24 24" fill="currentColor" className="text-orange-500 animate-pulse" style={{ animationDelay: '1.5s' }}>
            <path d="M13 0L6 12h5l-1 12 7-12h-5z"/>
          </svg>
        </div>

        <div className="absolute bottom-20 left-1/3 opacity-5">
          <svg width="30" height="45" viewBox="0 0 24 24" fill="currentColor" className="text-white animate-pulse" style={{ animationDelay: '3.5s' }}>
            <path d="M13 0L6 12h5l-1 12 7-12h-5z"/>
          </svg>
        </div>
      </div>

      {/* Demo Content Area */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 max-w-md text-center shadow-2xl">
          <div className="mb-6">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" className="mx-auto text-orange-500">
              <path d="M13 0L6 12h5l-1 12 7-12h-5z" fill="currentColor"/>
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">ZapTalk</h1>
          <p className="text-gray-300 leading-relaxed">
            Lightning-fast conversations with a modern, elegant interface designed for seamless communication.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ZapTalkBackground;