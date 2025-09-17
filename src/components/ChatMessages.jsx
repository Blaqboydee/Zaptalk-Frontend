import React from 'react';
import { formatTime } from '../utils/formatTime';

const ChatMessages = ({ messages, user, otherUser, isLoadingMessages, messagesEndRef, isMobile }) => (
  <div className={`overflow-y-auto  p-4 space-y-6 scrollbar-hidden ${isMobile ? 'h-[calc(100vh-120px)]' : 'h-[calc(78vh-120px)]'}`}>
    {isLoadingMessages ? (
      <div className="text-gray-400 text-center">Loading messages...</div>
    ) : messages.length === 0 ? (
      <div className="text-gray-400 text-center">No messages yet</div>
    ) : (
      messages.map((message) => {
        const isOwnMessage = message.senderId?._id === user.id || message.senderId === user.id;
        const senderName = typeof message.senderId === 'object' 
          ? message.senderId?.name 
          : (isOwnMessage ? user.name : otherUser?.name);

        return (
          <div key={message._id} className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-1  w-[85%]  ${isOwnMessage ? 'text-right' : ''}`}>
              <div 
                className={`
                  relative inline-block max-w-[75%] min-w-[120px]
                  ${isOwnMessage ? 'ml-auto' : 'mr-auto'}
                `}
              >
                {/* Main balloon body */}
                <div 
                  className={`
                    px-5 py-2 relative
                    ${isOwnMessage 
                      ? 'bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600' 
                      : 'bg-gradient-to-br from-gray-600 via-gray-700 to-gray-800'
                    }
                    shadow-xl transform transition-all duration-200 hover:scale-[1.02]
                  `}
                  style={{
                    borderRadius: isOwnMessage 
                      ? '25px 25px 8px 25px' 
                      : '25px 25px 25px 8px',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.3))',
                    background: isOwnMessage
                      ? 'linear-gradient(135deg, #fb923c 0%, #ea580c 50%, #c2410c 100%)'
                      : 'linear-gradient(135deg, #4b5563 0%, #374151 50%, #1f2937 100%)'
                  }}
                >
                  {/* Highlight effect */}
                  <div 
                    className="absolute top-2 left-3 w-6 h-6 bg-white opacity-20 rounded-full blur-sm"
                    style={{
                      background: 'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)'
                    }}
                  />
                  
                  {/* Message content */}
                  <p className="text-white text-[13px] leading-relaxed whitespace-pre-wrap mb-1 relative z-10">
                    {message.content}
                  </p>
                  
                  {/* Timestamp */}
                  <div className={`flex  ${isOwnMessage ? 'justify-end' : 'justify-start'} mt-2`}>
                    <span className="text-[10px] text-white opacity-70 relative z-10">
                      {message.createdAt ? formatTime(message.createdAt) : ""}
                    </span>
                  </div>
                </div>
                
       
                {/* Extra bubble shine effect */}
                <div 
                  className={`
                    absolute top-1 opacity-30 rounded-full bg-white blur-[1px]
                    ${isOwnMessage ? 'right-4' : 'left-4'}
                  `}
                  style={{
                    width: '12px',
                    height: '8px',
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.6), transparent)'
                  }}
                />
              </div>
            </div>
          </div>
        );
      })
    )}
    <div ref={messagesEndRef} />
  </div>
);

export default ChatMessages;