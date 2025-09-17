import React from 'react'

const SearchChats = () => {
  return (
    <>
          <div className="flex items-center gap-3">
            {/* Search Toggle (Mobile) */}
            <button
              className="sm:hidden p-2 rounded-full hover:bg-gray-700/50 text-gray-400 hover:text-gray-300 transition-all duration-200"
              onClick={() => setIsSearchOpen(!isSearchOpen)}
            >
              <Search size={20} />
            </button>

            {/* Search Input */}
            <div className={`relative ${isSearchOpen ? 'block' : 'hidden sm:block'} w-full sm:w-auto`}>
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border border-gray-600 bg-gray-700/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 transition-all duration-200"
              />
            </div>
          </div>
    </>
    
  )
}

export default SearchChats