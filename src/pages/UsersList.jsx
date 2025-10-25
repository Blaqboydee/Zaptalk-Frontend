import { useState, useEffect, useContext } from "react";
import { useUsers } from "../context/UsersContext";
import { AuthContext } from "../context/AuthContext";
import { useFriends } from "../hooks/useFriends.js";
import { 
  Search, 
  UserPlus, 
  Users as UsersIcon, 
  Check, 
  X, 
  Clock,
  Zap
} from "lucide-react";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function UsersList() {
  const { users, loading } = useUsers();
  const { user } = useContext(AuthContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [addingFriendId, setAddingFriendId] = useState(null);
  const [cancelingFriendId, setCancelingFriendId] = useState(null);

  const {
    friends,
    requests,
    sentRequests,
    addFriend,
    acceptFriendRequest,
    rejectFriendRequest,
    cancelFriendRequest,
    refetchAll,
    error
  } = useFriends();

  const filteredUsers = users.filter(
    (u) =>
      u._id !== user?.id &&
      (u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddFriend = async (targetUser) => {
    setAddingFriendId(targetUser._id);
    try {
      await addFriend(targetUser, user.id);
      await refetchAll();
    } catch (error) {
      console.error("Failed to add friend:", error);
    } finally {
      setAddingFriendId(null);
    }
  };

  const handleCancelRequest = async (friendId) => {
    setCancelingFriendId(friendId);
    try {
      await cancelFriendRequest(friendId);
      await refetchAll();
    } catch (error) {
      console.error("Failed to cancel friend request:", error);
    } finally {
      setCancelingFriendId(null);
    }
  };

  if (loading) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ backgroundColor: '#0F0F1A' }}
      >
        <div className="text-center animate-fade-in">
          <div className="relative mb-6">
            <div 
              className="w-16 h-16 rounded-full animate-spin mx-auto"
              style={{ 
                border: '4px solid #2D2640',
                borderTopColor: '#8B5CF6'
              }}
            />
            <Zap 
              size={24} 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ color: '#22D3EE' }}
            />
          </div>
          <p className="text-white text-lg animate-pulse mb-2">Loading users...</p>
          <p className="text-sm" style={{ color: '#A1A1AA' }}>
            Discovering amazing people
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0F0F1A' }}>
      {/* Fixed Header with Search */}
      <div 
        className="fixed top-0 left-0 right-0 z-40 backdrop-blur-xl"
        style={{ 
          backgroundColor: 'rgba(15, 15, 26, 0.95)',
          borderBottom: '1px solid #2D2640'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Header Info */}
          <div className="mb-4 animate-fade-in">
            <div className="flex items-center justify-center gap-2 mb-2">
              <UsersIcon size={24} style={{ color: '#22D3EE' }} />
              <h1 className="text-xl lg:text-3xl font-bold text-white text-center">
                Discover People
              </h1>
            </div>
            <p className="text-sm lg:text-base text-center" style={{ color: '#A1A1AA' }}>
              {filteredUsers.length} {filteredUsers.length === 1 ? 'person' : 'people'} available
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search 
                size={20} 
                className="transition-colors"
                style={{ color: '#71717A' }}
              />
            </div>
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-12 py-3.5 rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all"
              style={{ 
                backgroundColor: '#1A1625',
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
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-0 pr-4 flex items-center transition-all duration-200 hover:scale-110"
                style={{ color: '#A1A1AA' }}
                onMouseEnter={(e) => e.currentTarget.style.color = '#FFFFFF'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#A1A1AA'}
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Accent line */}
        <div 
          className="h-px"
          style={{ 
            background: 'linear-gradient(to right, transparent, rgba(139, 92, 246, 0.3), transparent)'
          }}
        />
      </div>

      {/* Content Area */}
      <div className="pt-40 px-4 sm:px-6 lg:px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {filteredUsers.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <>
              {/* MOBILE: List View */}
              <div className="md:hidden">
                <div className="flex flex-col gap-3 pb-4" role="list">
                  {filteredUsers.map((u, index) => (
                    <MobileUserCard
                      key={u._id}
                      user={u}
                      isFriend={friends?.some((f) => f._id === u._id)}
                      hasSentRequest={sentRequests?.some((r) => r.to._id === u._id)}
                      isAdding={addingFriendId === u._id}
                      isCanceling={cancelingFriendId === u._id}
                      onAddFriend={handleAddFriend}
                      onCancelRequest={handleCancelRequest}
                      index={index}
                    />
                  ))}
                </div>
              </div>

              {/* DESKTOP/TABLET: Grid View */}
              <div className="hidden md:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredUsers.map((u, index) => (
                  <DesktopUserCard
                    key={u._id}
                    user={u}
                    isFriend={friends?.some((f) => f._id === u._id)}
                    hasSentRequest={sentRequests?.some((r) => r.to._id === u._id)}
                    isAdding={addingFriendId === u._id}
                    isCanceling={cancelingFriendId === u._id}
                    onAddFriend={handleAddFriend}
                    onCancelRequest={handleCancelRequest}
                    index={index}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Empty State Component
const EmptyState = ({ searchTerm }) => (
  <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
    <div 
      className="w-24 h-24 rounded-2xl flex items-center justify-center mb-6"
      style={{ backgroundColor: '#1A1625' }}
    >
      <Search size={48} style={{ color: '#71717A' }} />
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">No users found</h3>
    <p style={{ color: '#A1A1AA' }}>
      {searchTerm ? 'Try adjusting your search terms' : 'No users available at the moment'}
    </p>
  </div>
);

// Mobile User Card Component
const MobileUserCard = ({ 
  user, 
  isFriend, 
  hasSentRequest, 
  isAdding, 
  isCanceling, 
  onAddFriend, 
  onCancelRequest,
  index 
}) => (
  <div
    className="p-4 rounded-xl transition-all duration-200 hover:scale-[1.01] animate-fade-in"
    style={{ 
      backgroundColor: '#1A1625',
      border: '1px solid #2D2640',
      animationDelay: `${index * 50}ms`
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8B5CF6'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2D2640'}
    role="listitem"
  >
    <div className="flex items-center space-x-3">
      <div className="relative flex-shrink-0">
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden"
          style={{ 
            backgroundColor: '#8B5CF6',
            border: '2px solid #2D2640'
          }}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span>{user.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        {(isFriend || hasSentRequest) && (
          <div
            className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-white"
            style={{
              backgroundColor: isFriend ? '#10B981' : '#F59E0B'
            }}
          >
            {isFriend ? (
              <Check size={12} strokeWidth={3} />
            ) : (
              <Clock size={12} strokeWidth={3} />
            )}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm lg:text-base text-white font-semibold truncate">
          {user.name}
        </p>
        <p className="text-xs lg:text-sm truncate" style={{ color: '#A1A1AA' }}>
          {user.email}
        </p>
      </div>

      <div className="flex-shrink-0">
        <ActionButton
          isFriend={isFriend}
          hasSentRequest={hasSentRequest}
          isLoading={isAdding || isCanceling}
          onClick={() => hasSentRequest ? onCancelRequest(user._id) : onAddFriend(user)}
          compact
        />
      </div>
    </div>
  </div>
);

// Desktop User Card Component
const DesktopUserCard = ({ 
  user, 
  isFriend, 
  hasSentRequest, 
  isAdding, 
  isCanceling, 
  onAddFriend, 
  onCancelRequest,
  index 
}) => (
  <div
    className="rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] animate-fade-in"
    style={{ 
      backgroundColor: '#1A1625',
      border: '1px solid #2D2640',
      animationDelay: `${index * 50}ms`
    }}
    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#8B5CF6'}
    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#2D2640'}
  >
    <div className="relative p-6 flex items-center justify-center" style={{ backgroundColor: '#252032' }}>
      <div className="relative">
        <div 
          className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden"
          style={{ 
            backgroundColor: '#8B5CF6',
            border: '3px solid #1A1625'
          }}
        >
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            <span>{user.name.charAt(0).toUpperCase()}</span>
          )}
        </div>

        {(isFriend || hasSentRequest) && (
          <div
            className="absolute -top-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-white"
            style={{
              backgroundColor: isFriend ? '#10B981' : '#F59E0B'
            }}
          >
            {isFriend ? (
              <Check size={16} strokeWidth={3} />
            ) : (
              <Clock size={16} strokeWidth={3} />
            )}
          </div>
        )}
      </div>
    </div>

    <div className="p-4">
      <h3 className="text-white font-semibold text-lg mb-1 truncate">
        {user.name}
      </h3>
      <p className="text-sm truncate mb-4" style={{ color: '#A1A1AA' }}>
        {user.email}
      </p>

      <ActionButton
        isFriend={isFriend}
        hasSentRequest={hasSentRequest}
        isLoading={isAdding || isCanceling}
        onClick={() => hasSentRequest ? onCancelRequest(user._id) : onAddFriend(user)}
      />
    </div>
  </div>
);

// Action Button Component
const ActionButton = ({ isFriend, hasSentRequest, isLoading, onClick, compact = false }) => {
  if (isFriend) {
    return (
      <div 
        className={`flex items-center justify-center space-x-2 ${compact ? 'px-3 py-1' : 'w-full py-2.5'} rounded-lg font-medium text-sm`}
        style={{ 
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.5)',
          color: '#10B981'
        }}
      >
        <Check size={16} />
        {!compact && <span>Friends</span>}
      </div>
    );
  }

  if (hasSentRequest) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClick();
        }}
        disabled={isLoading}
        className={`flex items-center justify-center space-x-2 ${compact ? 'px-3 py-1' : 'w-full py-2.5'} rounded-lg font-medium text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{ 
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.5)',
          color: '#F59E0B'
        }}
        onMouseEnter={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
            e.currentTarget.style.borderColor = '#F59E0B';
          }
        }}
        onMouseLeave={(e) => {
          if (!isLoading) {
            e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
            e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.5)';
          }
        }}
      >
        {isLoading ? (
          <>
            <div 
              className="w-4 h-4 rounded-full animate-spin"
              style={{ 
                border: '2px solid #F59E0B',
                borderTopColor: 'transparent'
              }}
            />
            {!compact && <span>Canceling...</span>}
          </>
        ) : (
          <>
            <X size={16} />
            {!compact && <span>Cancel</span>}
          </>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={isLoading}
      className={`flex items-center justify-center space-x-2 ${compact ? 'px-3 py-1' : 'w-full py-2.5'} rounded-lg text-white font-medium text-sm transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed`}
      style={{ backgroundColor: '#8B5CF6' }}
      onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#7C3AED')}
      onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#8B5CF6')}
    >
      {isLoading ? (
        <>
          <div 
            className="w-4 h-4 rounded-full animate-spin"
            style={{ 
              border: '2px solid #FFFFFF',
              borderTopColor: 'transparent'
            }}
          />
          {!compact && <span>Adding...</span>}
        </>
      ) : (
        <>
          <UserPlus size={16} />
          {!compact && <span>Add Friend</span>}
        </>
      )}
    </button>
  );
};