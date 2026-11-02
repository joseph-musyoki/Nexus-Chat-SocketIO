// 1. Imports
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import { connectSocket, disconnectSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';

import Sidebar from '../components/Sidebar';
import ChatWindow from '../components/ChatWindow';
import MessageInput from '../components/MessageInput';

// 2. Chat Component
const Chat = () => {

    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [search, setSearch] = useState('');
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState('');

    const socketRef = useRef(null);
    const selectedUserRef = useRef(null);

    // 3. Keep Selected Contact Available to Socket Events
    useEffect(() => {
        selectedUserRef.current = selectedUser;
    }, [selectedUser]);

    // 4. Load Contacts and Connect Socket
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!user || !token) {
            navigate('/');
            return;
        }

        let active = true;

        const loadUsers = async () => {
            try {
                const response = await api.get('/users');

                if (active) {
                    setUsers(response.data.users);
                }
            } catch {
                if (active) {
                    setError('Unable to load contacts. Check your backend connection.');
                }
            }
        };

        loadUsers();

        const socket = connectSocket(token);
        socketRef.current = socket;

        socket.on('connect', () => {
            setConnected(true);
            setError('');
        });

        socket.on('disconnect', () => {
            setConnected(false);
        });

        socket.on('connect_error', () => {
            setConnected(false);
            setError('Unable to connect to the chat server.');
        });

        socket.on('new_message', (message) => {
            const activeContact = selectedUserRef.current;

            if (message.messageType === 'private' && activeContact) {
                const senderId = String(
                    message.sender?._id || message.sender
                );

                const receiverId = String(
                    message.receiver?._id || message.receiver
                );

                const activeId = String(activeContact._id || activeContact.id);
                const currentId = String(user.id || user._id);

                const belongsToConversation =
                    (senderId === currentId && receiverId === activeId) ||
                    (senderId === activeId && receiverId === currentId);

                if (belongsToConversation) {
                    setMessages((previous) => {
                        if (previous.some((item) => item._id === message._id)) {
                            return previous;
                        }

                        return [...previous, message];
                    });
                }
            }
        });

        return () => {
            active = false;
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.off('new_message');
            disconnectSocket();
        };
    }, [user, navigate]);

    // 5. Load Selected Conversation
    const loadConversation = useCallback(async (contact) => {
        setSelectedUser(contact);
        setMessages([]);
        setError('');

        try {
            const response = await api.get(
                `/messages/private/${contact._id || contact.id}`
            );

            setMessages(response.data.messages);
        } catch {
            setError('Unable to load conversation history.');
        }
    }, []);

    // 6. Send Message
    const sendMessage = (content) => {
        const socket = socketRef.current;

        if (!socket || !socket.connected) {
            setError('Not connected to the chat server. Your message was not sent.');
            return;
        }

        if (!selectedUser) {
            return;
        }

        setError('');

        socket.emit('send_message', {
            receiver: selectedUser._id || selectedUser.id,
            content,
            messageType: 'private'
        }, (response) => {
            if (!response?.success) {
                setError(response?.message || 'Failed to send message.');
            }
        });
    };

    // 7. Logout
    const handleLogout = () => {
        disconnectSocket();
        logout();
        navigate('/');
    };

    // 8. Chat UI
    return (
        <div className="chat-layout">

            <Sidebar
                user={user}
                users={users}
                selectedUser={selectedUser}
                onSelectUser={loadConversation}
                onLogout={handleLogout}
                search={search}
                setSearch={setSearch}
            />

            <div className="chat-main">

                <div className={`connection-banner ${connected ? 'connected' : ''}`}>
                    <span className="status-dot" />
                    {connected ? 'Connected to chat server' : 'Connecting to chat server...'}
                </div>

                {error && (
                    <div className="chat-error">
                        {error}
                        <button onClick={() => setError('')} aria-label="Dismiss error">
                            ×
                        </button>
                    </div>
                )}

                <ChatWindow
                    user={selectedUser}
                    messages={messages}
                    currentUser={user}
                />

                {selectedUser && (
                    <MessageInput
                        onSend={sendMessage}
                        disabled={!connected}
                    />
                )}

            </div>
        </div>
    );
};

// 9. Export
export default Chat;