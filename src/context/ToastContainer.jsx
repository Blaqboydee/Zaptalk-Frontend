import React, { useState, useEffect, createContext, useContext } from 'react';

// Toast Context
const ToastContext = createContext();

// Toast types with ZapTalk styling
const toastTypes = {
  success: {
    bg: 'from-green-600 to-green-700',
    icon: '✓',
    borderColor: 'border-green-500',
    iconBg: 'bg-green-500'
  },
  error: {
    bg: 'from-red-600 to-red-700',
    icon: '✕',
    borderColor: 'border-red-500',
    iconBg: 'bg-red-500'
  },
  warning: {
    bg: 'from-yellow-600 to-yellow-700',
    icon: '⚠',
    borderColor: 'border-yellow-500',
    iconBg: 'bg-yellow-500'
  },
  info: {
    bg: 'from-blue-600 to-blue-700',
    icon: 'ℹ',
    borderColor: 'border-blue-500',
    iconBg: 'bg-blue-500'
  },
  message: {
    bg: 'from-orange-600 to-orange-700',
    icon: '💬',
    borderColor: 'border-orange-500',
    iconBg: 'bg-orange-500'
  },
  friendRequest: {
    bg: 'from-purple-600 to-purple-700',
    icon: '👥',
    borderColor: 'border-purple-500',
    iconBg: 'bg-purple-500'
  },
  zap: {
    bg: 'from-orange-500 to-orange-600',
    icon: '⚡',
    borderColor: 'border-orange-400',
    iconBg: 'bg-orange-500'
  }
};

// Individual Toast Component
const Toast = ({ toast, onRemove }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);
  const typeConfig = toastTypes[toast.type] || toastTypes.info;

  useEffect(() => {
    // Entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (toast.duration !== 0) {
      const timer = setTimeout(() => {
        handleRemove();
      }, toast.duration || 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.duration]);

  const handleRemove = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 300);
  };

  return (
    <div
      className={`transform transition-all duration-300 ease-out ${
        isVisible && !isLeaving
          ? 'translate-x-0 opacity-100 scale-100'
          : isLeaving
          ? 'translate-x-full opacity-0 scale-95'
          : 'translate-x-full opacity-0 scale-95'
      }`}
    >
      <div className={`
        relative max-w-sm w-full bg-gradient-to-r ${typeConfig.bg} 
        shadow-2xl rounded-xl border-l-4 ${typeConfig.borderColor}
        backdrop-blur-sm overflow-hidden group cursor-pointer
        hover:shadow-orange-500/20 transition-all duration-300
      `}>
        {/* Animated background glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 
                        transform translate-x-[-100%] group-hover:translate-x-[100%] 
                        transition-transform duration-700"></div>
        
        {/* Content */}
        <div className="relative z-10 p-4 pr-12">
          <div className="flex items-start space-x-3">
            {/* Icon */}
            <div className={`
              flex-shrink-0 w-8 h-8 ${typeConfig.iconBg} rounded-full 
              flex items-center justify-center text-white font-bold text-sm
              shadow-lg ring-2 ring-white/20
            `}>
              {typeConfig.icon}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h3 className="text-white font-semibold text-sm mb-1 leading-tight">
                  {toast.title}
                </h3>
              )}
              <p className="text-white/90 text-sm leading-tight">
                {toast.message}
              </p>
              {toast.subtitle && (
                <p className="text-white/70 text-xs mt-1">
                  {toast.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={handleRemove}
          className="absolute top-2 right-2 text-white/60 hover:text-white 
                     hover:bg-white/10 rounded-full p-1 transition-all duration-200
                     transform hover:scale-110"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Progress bar for timed toasts */}
        {toast.duration !== 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div 
              className="h-full bg-white/60 transition-all ease-linear"
              style={{
                animation: `shrink ${toast.duration || 4000}ms linear forwards`
              }}
            ></div>
          </div>
        )}

        {/* ZapTalk accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-white/10 to-transparent rounded-bl-full"></div>
      </div>
    </div>
  );
};

// Toast Container
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// Toast Provider Component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = (toast) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      type: 'info',
      duration: 4000,
      ...toast
    };
    
    setToasts(prev => [...prev, newToast]);
    return id;
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearAllToasts = () => {
    setToasts([]);
  };

  // Predefined toast methods for common ZapTalk scenarios
  const toast = {
    success: (message, options = {}) => addToast({ type: 'success', message, ...options }),
    error: (message, options = {}) => addToast({ type: 'error', message, ...options }),
    warning: (message, options = {}) => addToast({ type: 'warning', message, ...options }),
    info: (message, options = {}) => addToast({ type: 'info', message, ...options }),
    
    // ZapTalk specific toasts
    message: (title, message, options = {}) => addToast({ 
      type: 'message', 
      title, 
      message, 
      subtitle: 'New message',
      ...options 
    }),
    
    friendRequest: (name, options = {}) => addToast({ 
      type: 'friendRequest', 
      title: 'Friend Request', 
      message: `${name} wants to be your friend`,
      subtitle: 'Tap to view',
      ...options 
    }),
    
    friendRequestSent: (name, options = {}) => addToast({ 
      type: 'zap', 
      title: 'Request Sent', 
      message: `Friend request sent to ${name}`,
      subtitle: 'They will be notified',
      ...options 
    }),
    
    friendAccepted: (name, options = {}) => addToast({ 
      type: 'success', 
      title: 'New Friend!', 
      message: `${name} accepted your friend request`,
      subtitle: 'Start chatting now',
      ...options 
    }),
    
    zap: (message, options = {}) => addToast({ 
      type: 'zap', 
      title: 'ZapTalk', 
      message, 
      ...options 
    })
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast, clearAllToasts }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// Hook to use toast
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

// Demo Component
const ZapTalkToastDemo = () => {
  const { toast } = useToast();

  const demoToasts = [
    () => toast.message('John Doe', 'Hey! How are you doing?'),
    () => toast.friendRequest('Sarah Wilson'),
    () => toast.friendRequestSent('Mike Johnson'),
    () => toast.friendAccepted('Emma Davis'),
    () => toast.success('Profile updated successfully!'),
    () => toast.error('Failed to send message. Please try again.'),
    () => toast.warning('Your session will expire in 5 minutes'),
    () => toast.zap('Welcome to ZapTalk! 🚀'),
    () => toast.info('New features available in settings', { duration: 6000 })
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 mb-4">
            ZapTalk Toast System
          </h1>
          <p className="text-gray-300 text-lg mb-8">
            Custom notifications designed for your chat app
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: '💬 New Message', action: demoToasts[0] },
            { label: '👥 Friend Request', action: demoToasts[1] },
            { label: '📤 Request Sent', action: demoToasts[2] },
            { label: '✅ Friend Accepted', action: demoToasts[3] },
            { label: '✓ Success Toast', action: demoToasts[4] },
            { label: '❌ Error Toast', action: demoToasts[5] },
            { label: '⚠️ Warning Toast', action: demoToasts[6] },
            { label: '⚡ ZapTalk Special', action: demoToasts[7] },
            { label: 'ℹ️ Info Toast', action: demoToasts[8] }
          ].map((demo, index) => (
            <button
              key={index}
              onClick={demo.action}
              className="p-4 bg-gray-800 hover:bg-gray-700 rounded-xl border border-gray-600 
                         text-white font-medium transition-all duration-200 hover:scale-105
                         hover:border-orange-500/50 hover:shadow-lg hover:shadow-orange-500/20"
            >
              {demo.label}
            </button>
          ))}
        </div>

        <div className="mt-8 p-6 bg-gray-800/50 rounded-xl border border-gray-600">
          <h3 className="text-white font-semibold mb-4">Usage Example:</h3>
          <pre className="text-gray-300 text-sm overflow-x-auto">
{`// In your component
const { toast } = useToast();

// Show different types of notifications
toast.message('John', 'Hello there!');
toast.friendRequest('Sarah Wilson');
toast.friendRequestSent('Mike Johnson');
toast.success('Action completed!');
toast.error('Something went wrong');
toast.zap('Welcome to ZapTalk!');`}
          </pre>
        </div>
      </div>
    </div>
  );
};

// Main App Component with Provider
const App = () => {
  return (
    <ToastProvider>
      <ZapTalkToastDemo />
    </ToastProvider>
  );
};

export default App;



// ZapTalk specific
// toast.message('John', 'Hey there!');
// toast.friendRequest('Sarah');
// toast.friendRequestSent('Mike');
// toast.friendAccepted('Emma');
// toast.zap('Welcome to ZapTalk!');

// // General purpose
// toast.success('Action completed!');
// toast.error('Something went wrong');
// toast.warning('Session expiring soon');
// toast.info('New feature available');

// New message notifications
// Friend request alerts
// Connection status updates
// Success/error feedback
// App-wide announcements

// The system is fully customizable, matches your brand colors, and provides a smooth user experience that feels native to ZapTalk!