import { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';

const ChatModal = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);

  const chatList = [
    {
      id: 1,
      name: 'Sarah Connor',
      avatar: 'SC',
      lastMessage: 'Hey! How are you doing?',
      time: '2:30 PM',
      messages: [
        { id: 1, text: 'Hey! How are you doing?', sent: false },
        { id: 2, text: "I'm doing great, thanks! How about you?", sent: true },
        { id: 3, text: 'Pretty good! Just working on some projects', sent: false },
        { id: 4, text: 'That sounds exciting! What kind of projects?', sent: true }
      ]
    },
    {
      id: 2,
      name: 'John Doe',
      avatar: 'JD',
      lastMessage: 'See you tomorrow!',
      time: '1:15 PM',
      messages: [
        { id: 1, text: 'Are we still on for tomorrow?', sent: false },
        { id: 2, text: 'Absolutely! What time works for you?', sent: true },
        { id: 3, text: 'How about 3 PM?', sent: false },
        { id: 4, text: 'Perfect! See you then 👍', sent: true }
      ]
    },
    {
      id: 3,
      name: 'Emma Wilson',
      avatar: 'EW',
      lastMessage: 'Thanks for the help 👍',
      time: '12:45 PM',
      messages: [
        { id: 1, text: 'Did you get the files I sent?', sent: true },
        { id: 2, text: 'Yes! They were super helpful', sent: false },
        { id: 3, text: 'Thanks for the help 👍', sent: false },
        { id: 4, text: "You're welcome! Anytime 😊", sent: true }
      ]
    },
    {
      id: 4,
      name: 'Mike Johnson',
      avatar: 'MJ',
      lastMessage: "Let's grab coffee sometime",
      time: '11:20 AM',
      messages: [
        { id: 1, text: "Let's grab coffee sometime", sent: false },
        { id: 2, text: "I'd love that! When are you free?", sent: true },
        { id: 3, text: 'How about this weekend?', sent: false },
        { id: 4, text: 'Saturday morning sounds perfect!', sent: true }
      ]
    }
  ];

  const openModal = (user) => {
    setCurrentUser(user);
    setMessages([...user.messages]);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentUser(null);
    setMessageInput('');
    document.body.style.overflow = 'auto';
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      const newMessage = {
        id: Date.now(),
        text: messageInput,
        sent: true
      };
      
      setMessages(prev => [...prev, newMessage]);
      setMessageInput('');
      
      // Simulate response after 1.5 seconds
      setTimeout(() => {
        const responses = [
          "That's interesting!",
          "I see what you mean",
          "Thanks for sharing that",
          "Tell me more about it",
          "That sounds great!",
          "I agree with you",
          "Really? That's cool!",
          "Nice! 👍"
        ];
        
        const response = {
          id: Date.now() + 1,
          text: responses[Math.floor(Math.random() * responses.length)],
          sent: false
        };
        
        setMessages(prev => [...prev, response]);
      }, 1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
      {/* Chat List */}
      <div className="p-5 max-w-lg mx-auto">
        {chatList.map((chat) => (
          <div
            key={chat.id}
            onClick={() => openModal(chat)}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-4 mb-3 border border-white/20 cursor-pointer transition-all duration-300 hover:bg-white/15 hover:-translate-y-0.5 flex items-center gap-3"
          >
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-400 to-yellow-400 flex items-center justify-center text-white font-bold text-lg">
              {chat.avatar}
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-base mb-1">
                {chat.name}
              </div>
              <div className="text-white/70 text-sm">
                {chat.lastMessage}
              </div>
            </div>
            <div className="text-white/50 text-xs">
              {chat.time}
            </div>
          </div>
        ))}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div
          className={`fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-5 transition-all duration-300 ${
            isModalOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
          }`}
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <div
            className={`w-full max-w-sm h-[70vh] max-h-[600px] bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ${
              isModalOpen ? 'scale-100 translate-y-0' : 'scale-75 translate-y-10'
            }`}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-400 to-yellow-400 flex items-center justify-center text-white font-bold">
                  {currentUser?.avatar}
                </div>
                <div className="text-white font-semibold text-lg">
                  {currentUser?.name}
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-200 hover:scale-110 flex items-center justify-center text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-white/20">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed animate-in slide-in-from-bottom-5 duration-300 ${
                    message.sent
                      ? 'ml-auto bg-white/20 text-white'
                      : 'mr-auto bg-white/10 text-white/90'
                  }`}
                >
                  {message.text}
                </div>
              ))}
            </div>
          </div>

          {/* Floating Input */}
          <div
            className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-full max-w-sm px-5 pb-5 transition-all duration-500 delay-200 ${
              isModalOpen ? 'translate-y-0' : 'translate-y-16'
            }`}
          >
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-xl rounded-3xl px-5 py-3 border border-white/20 shadow-lg">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none outline-none text-white placeholder-white/60 text-base"
                autoFocus
              />
              <button
                onClick={sendMessage}
                className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 hover:scale-110 hover:shadow-lg hover:shadow-indigo-500/40 transition-all duration-200 flex items-center justify-center text-white"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatModal;