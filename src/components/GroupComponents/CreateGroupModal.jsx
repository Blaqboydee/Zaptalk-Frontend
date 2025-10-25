import React, { useState } from 'react';
import { X, Check, Users } from 'lucide-react';

const CreateGroupModal = ({ friends, onClose, onSubmit }) => {
  const [groupName, setGroupName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);

  const toggleUserSelection = (user) => {
    setSelectedUsers((prev) =>
      prev.find((friend) => friend._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user]
    );
  };

  const handleSubmit = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      onSubmit(groupName.trim(), selectedUsers.map(u => u._id));
      setGroupName('');
      setSelectedUsers([]);
    }
  };

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <div 
        className="rounded-2xl w-full max-w-md shadow-2xl"
        style={{ 
          backgroundColor: '#1A1625',
          border: '1px solid #2D2640'
        }}
      >
        {/* Header */}
        <div 
          className="p-6"
          style={{ borderBottom: '1px solid #2D2640' }}
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div 
                className="p-2 rounded-lg"
                style={{ backgroundColor: '#8B5CF6' }}
              >
                <Users size={20} className="text-white" />
              </div>
              <h2 className="text-xl font-bold text-white">Create New Group</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 rounded-lg transition-all duration-200 hover:scale-110"
              style={{ backgroundColor: '#252032' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
            >
              <X size={20} style={{ color: '#A1A1AA' }} />
            </button>
          </div>
        </div>
        
        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Group Name Input */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: '#FFFFFF' }}
            >
              Group Name <span style={{ color: '#EF4444' }}>*</span>
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-4 py-3 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all duration-200"
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
          </div>

          {/* Friends Selection */}
          <div>
            <label 
              className="block text-sm font-medium mb-2"
              style={{ color: '#FFFFFF' }}
            >
              Add Friends 
              <span 
                className="ml-2 px-2 py-0.5 rounded-full text-xs"
                style={{ 
                  backgroundColor: selectedUsers.length > 0 ? '#8B5CF6' : '#252032',
                  color: '#FFFFFF'
                }}
              >
                {selectedUsers.length} selected
              </span>
            </label>
            <div 
              className="max-h-64 overflow-y-auto rounded-lg custom-scrollbar"
              style={{ 
                backgroundColor: '#252032',
                border: '1px solid #2D2640'
              }}
            >
              {friends.length === 0 ? (
                <div className="p-8 text-center">
                  <Users size={32} className="mx-auto mb-2" style={{ color: '#71717A' }} />
                  <p className="text-sm" style={{ color: '#A1A1AA' }}>
                    No friends available
                  </p>
                  <p className="text-xs mt-1" style={{ color: '#71717A' }}>
                    Add some friends first to create a group
                  </p>
                </div>
              ) : (
                friends.map((userItem, index) => {
                  const isSelected = selectedUsers.find((u) => u._id === userItem._id);
                  return (
                    <div 
                      key={userItem._id}
                      onClick={() => toggleUserSelection(userItem)}
                      className="flex items-center gap-3 p-3 cursor-pointer transition-all duration-200"
                      style={{ 
                        borderBottom: index !== friends.length - 1 ? '1px solid #2D2640' : 'none',
                        backgroundColor: 'transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2D2640';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      {/* Avatar with selection indicator */}
                      <div className="relative flex-shrink-0">
                        {userItem.avatar ? (
                          <img
                            src={userItem.avatar}
                            alt={userItem.name || 'User'}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div 
                            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ backgroundColor: '#8B5CF6' }}
                          >
                            {userItem.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                        )}
                        
                        {/* Selection checkmark */}
                        {isSelected && (
                          <div 
                            className="absolute -top-1 -right-1 rounded-full p-1 animate-fade-in"
                            style={{ backgroundColor: '#10B981' }}
                          >
                            <Check size={12} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <p 
                          className="font-medium truncate"
                          style={{ color: isSelected ? '#22D3EE' : '#FFFFFF' }}
                        >
                          {userItem.name || 'Unknown'}
                        </p>
                        <div className="flex items-center gap-1">
                          <div 
                            className={`w-2 h-2 rounded-full ${
                              userItem.status?.state === 'online' ? 'animate-pulse' : ''
                            }`}
                            style={{ 
                              backgroundColor: userItem.status?.state === 'online' ? '#10B981' : '#71717A'
                            }}
                          />
                          <span 
                            className="text-xs"
                            style={{ 
                              color: userItem.status?.state === 'online' ? '#22D3EE' : '#71717A'
                            }}
                          >
                            {userItem.status?.state === 'online' ? 'Online' : 'Offline'}
                          </span>
                        </div>
                      </div>

                      {/* Selection checkbox */}
                      <div 
                        className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200"
                        style={{ 
                          borderColor: isSelected ? '#8B5CF6' : '#2D2640',
                          backgroundColor: isSelected ? '#8B5CF6' : 'transparent'
                        }}
                      >
                        {isSelected && <Check size={14} className="text-white" strokeWidth={3} />}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div 
          className="p-6 flex justify-end gap-3"
          style={{ borderTop: '1px solid #2D2640' }}
        >
          <button 
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-all duration-200 hover:scale-105"
            style={{ 
              backgroundColor: '#252032',
              border: '1px solid #2D2640',
              color: '#FFFFFF'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#2D2640'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#252032'}
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!groupName.trim() || selectedUsers.length === 0}
            className="px-4 py-2 rounded-lg text-white transition-all duration-200 hover:scale-105 disabled:hover:scale-100 flex items-center gap-2"
            style={{
              backgroundColor: !groupName.trim() || selectedUsers.length === 0 ? '#6D28D9' : '#8B5CF6',
              opacity: !groupName.trim() || selectedUsers.length === 0 ? 0.7 : 1,
              cursor: !groupName.trim() || selectedUsers.length === 0 ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (groupName.trim() && selectedUsers.length > 0) {
                e.currentTarget.style.backgroundColor = '#7C3AED';
              }
            }}
            onMouseLeave={(e) => {
              if (groupName.trim() && selectedUsers.length > 0) {
                e.currentTarget.style.backgroundColor = '#8B5CF6';
              }
            }}
          >
            <Users size={16} />
            Create Group
          </button>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #8B5CF6 #252032;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: #252032;
          border-radius: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #8B5CF6, #7C3AED);
          border-radius: 4px;
          transition: all 0.3s ease;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, #7C3AED, #6D28D9);
        }
      `}</style>
    </div>
  );
};

export default CreateGroupModal;