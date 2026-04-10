import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

const SearchChats = ({ 
  searchTerm = '', 
  onSearchChange, 
  placeholder = 'Search chats...' 
}) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const handleClear = () => {
    if (onSearchChange) {
      onSearchChange({ target: { value: '' } });
    }
    setIsSearchOpen(false);
  };

  return (
    <div className="flex items-center gap-3">
      {/* Search Toggle (Mobile) */}
      <button
        className="sm:hidden p-2 rounded-full transition-all duration-200 hover:scale-110"
        style={{ 
          backgroundColor: isSearchOpen ? '#8B5CF6' : '#252032',
          color: isSearchOpen ? '#FFFFFF' : '#A1A1AA'
        }}
        onMouseEnter={(e) => {
          if (!isSearchOpen) {
            e.currentTarget.style.backgroundColor = '#2D2640';
            e.currentTarget.style.color = '#FFFFFF';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSearchOpen) {
            e.currentTarget.style.backgroundColor = '#252032';
            e.currentTarget.style.color = '#A1A1AA';
          }
        }}
        onClick={() => setIsSearchOpen(!isSearchOpen)}
        aria-label="Toggle search"
      >
        <Search size={20} />
      </button>

      {/* Search Input */}
      <div 
        className={`relative ${
          isSearchOpen ? 'block' : 'hidden sm:block'
        } w-full sm:w-auto transition-all duration-300 animate-fade-in`}
      >
        <Search 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors" 
          size={16}
          style={{ color: '#71717A' }}
        />
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={onSearchChange}
          className="w-full sm:w-64 pl-10 pr-10 py-2 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
          style={{
            backgroundColor: '#252032',
            border: '1px solid #2D2640'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8B5CF6';
            e.target.style.boxShadow = '0 0 0 2px rgba(139, 92, 246, 0.1)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#2D2640';
            e.target.style.boxShadow = 'none';
          }}
        />
        
        {/* Clear Button */}
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-200 hover:scale-110 animate-fade-in"
            style={{ 
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#EF4444'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
            }}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchChats;