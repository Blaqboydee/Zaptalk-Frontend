// components/CreateGroupModal.jsx
import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const CreateGroupModal = ({ friends, onClose, onSubmit }) => {
  console.log(friends);
  
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
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-md border border-gray-700 shadow-2xl">
        <div className="p-6 border-b border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Create New Group</h2>
            <button 
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded transition-colors duration-200"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Group Name *
            </label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="Enter group name"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Add Friends ({selectedUsers.length} selected)
            </label>
            <div className="max-h-48 overflow-y-auto border border-gray-600 rounded-lg bg-gray-800 custom-scrollbar">
              {friends.map((userItem) => (
                <div 
                  key={userItem._id}
                  onClick={() => toggleUserSelection(userItem)}
                  className="flex items-center gap-3 p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700 last:border-b-0 transition-colors"
                >
                  <div className="relative">
                    {userItem.avatar?(
                      <img
                        src={userItem.avatar}
                        alt={userItem.name || userItem._id || 'User Avatar'}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ): <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white bg-gradient-to-br from-orange-400 to-orange-600">
                      {userItem.name?.[0]}
                    </div>}
                   
                    {selectedUsers.find((u) => u._id === userItem._id) && (
                      <div className="absolute -top-1 -right-1 bg-green-500 rounded-full p-1">
                        <Check size={10} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{userItem.name || userItem._id || 'Unknown'}</p>
                    <div className="flex items-center gap-1">
                      <div className={`w-2 h-2 rounded-full ${userItem.status.state == 'online' ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                      <span className="text-xs text-gray-400">
                        {userItem.status.state == 'online'  ? 'Online' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-700 transition-colors duration-200"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!groupName.trim() || selectedUsers.length === 0}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;