import React from 'react';
import MessageItem from './MessageItem';

const ChatMessagesArea = ({ 
  messages, 
  isLoadingMessages, 
  messagesEndRef, 
  user, 
  formatTime 
}) => {
  if (isLoadingMessages) {
    return <p className="text-gray-400 text-center">Loading messages...</p>;
  }

  if (messages.length === 0) {
    return <p className="text-gray-400 text-center">No messages yet</p>;
  }

  return (
    <>
      {messages.map((message) => (
        <MessageItem
          key={message._id}
          message={message}
          user={user}
          formatTime={formatTime}
        />
      ))}
      <div ref={messagesEndRef} />
    </>
  );
};

export default ChatMessagesArea;
