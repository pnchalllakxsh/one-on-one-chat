import React, { useState, useEffect, useRef } from 'react';
import io, { Socket } from 'socket.io-client';

interface User {
  id: number;
  name: string;
  created_at: string;
}

interface Message {
  senderName: string;
  receiverName: string;
  message: string;
  timestamp: string;
}

const Chat: React.FC = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [currentUser, setCurrentUser] = useState<string>('');
  const [isJoined, setIsJoined] = useState<boolean>(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [nameInput, setNameInput] = useState<string>('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Listen for user list updates
    newSocket.on('userList', (userList: User[]) => {
      setUsers(userList);
    });

    // Listen for new messages
    newSocket.on('newMessage', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for message sent confirmation
    newSocket.on('messageSent', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for chat history
    newSocket.on('chatHistory', (data: { otherUser: string; messages: Message[] }) => {
      setMessages(data.messages);
    });

    // Listen for join success
    newSocket.on('joinSuccess', (data: { name: string }) => {
      setCurrentUser(data.name);
      setIsJoined(true);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoin = () => {
    if (nameInput.trim() && socket) {
      socket.emit('join', { name: nameInput.trim() });
    }
  };

  const handleUserSelect = (userName: string) => {
    if (userName !== currentUser) {
      setSelectedUser(userName);
      setMessages([]);
      if (socket) {
        socket.emit('getChatHistory', { otherUser: userName });
      }
    }
  };

  const handleSendMessage = () => {
    if (newMessage.trim() && selectedUser && socket) {
      socket.emit('privateMessage', {
        receiverName: selectedUser,
        message: newMessage.trim()
      });
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (!isJoined) {
        handleJoin();
      } else {
        handleSendMessage();
      }
    }
  };

  if (!isJoined) {
    return (
      <div style={styles.container}>
        <div style={styles.joinForm}>
          <h2>Join Chat</h2>
          <input
            type="text"
            placeholder="Enter your name"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            onKeyPress={handleKeyPress}
            style={styles.input}
          />
          <button onClick={handleJoin} style={styles.button}>
            Join
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.chatContainer}>
        {/* User List */}
        <div style={styles.userList}>
          <h3>Online Users</h3>
          <div style={styles.currentUser}>You: {currentUser}</div>
          {users
            .filter(user => user.name !== currentUser)
            .map(user => (
              <div
                key={user.id}
                style={{
                  ...styles.userItem,
                  ...(selectedUser === user.name ? styles.selectedUser : {})
                }}
                onClick={() => handleUserSelect(user.name)}
              >
                {user.name}
              </div>
            ))}
        </div>

        {/* Chat Area */}
        <div style={styles.chatArea}>
          {selectedUser ? (
            <>
              <div style={styles.chatHeader}>
                Chat with {selectedUser}
              </div>
              <div style={styles.messagesContainer}>
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    style={{
                      ...styles.message,
                      ...(msg.senderName === currentUser ? styles.sentMessage : styles.receivedMessage)
                    }}
                  >
                    <div style={styles.messageContent}>{msg.message}</div>
                    <div style={styles.messageTime}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div style={styles.messageInput}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  style={styles.input}
                />
                <button onClick={handleSendMessage} style={styles.button}>
                  Send
                </button>
              </div>
            </>
          ) : (
            <div style={styles.selectUser}>
              Select a user to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    fontFamily: 'Arial, sans-serif'
  },
  joinForm: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    textAlign: 'center' as const
  },
  chatContainer: {
    display: 'flex',
    width: '90%',
    maxWidth: '1200px',
    height: '80vh',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    overflow: 'hidden'
  },
  userList: {
    width: '300px',
    borderRight: '1px solid #ddd',
    padding: '1rem',
    backgroundColor: '#f8f9fa'
  },
  currentUser: {
    padding: '0.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    borderRadius: '4px',
    marginBottom: '1rem',
    textAlign: 'center' as const
  },
  userItem: {
    padding: '0.75rem',
    cursor: 'pointer',
    borderRadius: '4px',
    marginBottom: '0.5rem',
    backgroundColor: 'white',
    border: '1px solid #ddd',
    transition: 'all 0.2s'
  },
  selectedUser: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2196f3'
  },
  chatArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const
  },
  chatHeader: {
    padding: '1rem',
    backgroundColor: '#007bff',
    color: 'white',
    textAlign: 'center' as const,
    fontWeight: 'bold'
  },
  messagesContainer: {
    flex: 1,
    padding: '1rem',
    overflowY: 'auto' as const,
    backgroundColor: '#fafafa'
  },
  message: {
    marginBottom: '1rem',
    maxWidth: '70%'
  },
  sentMessage: {
    marginLeft: 'auto',
    textAlign: 'right' as const
  },
  receivedMessage: {
    marginRight: 'auto',
    textAlign: 'left' as const
  },
  messageContent: {
    padding: '0.75rem',
    borderRadius: '8px',
    backgroundColor: 'white',
    border: '1px solid #ddd'
  },
  messageTime: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: '0.25rem'
  },
  messageInput: {
    display: 'flex',
    padding: '1rem',
    borderTop: '1px solid #ddd',
    backgroundColor: 'white'
  },
  selectUser: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
    color: '#666',
    fontSize: '1.2rem'
  },
  input: {
    flex: 1,
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    marginRight: '0.5rem',
    fontSize: '1rem'
  },
  button: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem'
  }
};

export default Chat;
