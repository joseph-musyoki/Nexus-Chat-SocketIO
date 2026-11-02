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
    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [messages, setMessages] = useState([]);
    const [search, setSearch] = useState('');
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState('');

    const socketRef = useRef(null);
    const selectedUserRef = useRef(null);
    const selectedGroupRef = useRef(null);

    // 3. Keep Active Conversation Available to Socket Events
    useEffect(() => {
        selectedUserRef.current = selectedUser;
        selectedGroupRef.current = selectedGroup;
    }, [selectedUser, selectedGroup]);

    // 4. Load Contacts and Groups
    const loadContactsAndGroups = useCallback(async () => {
        try {
            const [usersResponse, groupsResponse] = await Promise.all([
                api.get('/users'),
                api.get('/groups')
            ]);

            const loadedUsers = usersResponse.data.users || [];
            const loadedGroups = groupsResponse.data.groups || [];

            setUsers(loadedUsers);
            setGroups(loadedGroups);

            // Join existing group rooms on this socket.
            if (socketRef.current?.connected) {
                loadedGroups.forEach((group) => {
                    socketRef.current.emit('join_group', {
                        groupId: group._id
                    });
                });
            }
        } catch (requestError) {
            console.error('Loading contacts/groups failed:', requestError);

            setError('Unable to load contacts or groups.');
        }
    }, []);

    // 5. Connect Socket and Load Data
    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!user || !token) {
            navigate('/');
            return;
        }

        let active = true;

        const socket = connectSocket(token);
        socketRef.current = socket;

        socket.on('connect', () => {
            if (!active) return;

            setConnected(true);
            setError('');

            // Load groups after connecting so their rooms can be joined.
            loadContactsAndGroups();
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
            const activeGroup = selectedGroupRef.current;

            // Private message delivery
            if (message.messageType === 'private' && activeContact) {
                const senderId = String(
                    message.sender?._id || message.sender
                );

                const receiverId = String(
                    message.receiver?._id || message.receiver
                );

                const activeId = String(
                    activeContact._id || activeContact.id
                );

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

            // Group message delivery
            if (message.messageType === 'group' && activeGroup) {
                const messageGroupId = String(
                    message.groupId?._id || message.groupId
                );

                const activeGroupId = String(activeGroup._id);

                if (messageGroupId === activeGroupId) {
                    setMessages((previous) => {
                        if (previous.some((item) => item._id === message._id)) {
                            return previous;
                        }

                        return [...previous, message];
                    });
                }
            }
        });

        loadContactsAndGroups();

        return () => {
            active = false;

            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.off('new_message');

            disconnectSocket();
            socketRef.current = null;
        };
    }, [user, navigate, loadContactsAndGroups]);

    // 6. Select a Private Conversation
    const loadConversation = useCallback(async (contact) => {
        setSelectedUser(contact);
        setSelectedGroup(null);
        setMessages([]);
        setError('');

        try {
            const response = await api.get(
                `/messages/private/${contact._id || contact.id}`
            );

            setMessages(response.data.messages || []);
        } catch (requestError) {
            console.error('Private conversation error:', requestError);
            setError('Unable to load conversation history.');
        }
    }, []);

    // 7. Select a Group Conversation
    const loadGroupConversation = useCallback(async (group) => {
        setSelectedGroup(group);
        setSelectedUser(null);
        setMessages([]);
        setError('');

        try {
            const response = await api.get(
                `/messages/group/${group._id}`
            );

            setMessages(response.data.messages || []);

            // Ensure this socket has joined the group room.
            if (socketRef.current?.connected) {
                socketRef.current.emit('join_group', {
                    groupId: group._id
                });
            }
        } catch (requestError) {
            console.error('Group conversation error:', requestError);
            setError('Unable to load group conversation history.');
        }
    }, []);

    // 8. Create a Group
    const createGroup = async (groupData) => {
        try {
            setError('');

            const response = await api.post('/groups', groupData);

            const newGroup = response.data.group;

            if (!newGroup?._id) {
                throw new Error('The server did not return the created group.');
            }

            setGroups((previous) => {
                if (previous.some((group) => group._id === newGroup._id)) {
                    return previous;
                }

                return [...previous, newGroup];
            });

            // Join the creator's new group room.
            if (socketRef.current?.connected) {
                socketRef.current.emit('join_group', {
                    groupId: newGroup._id
                });
            }

            await loadGroupConversation(newGroup);
        } catch (requestError) {
            console.error('Group creation error:', requestError);

            setError(
                requestError.response?.data?.message ||
                requestError.message ||
                'Unable to create group.'
            );
        }
    };

    // 9. Send a Message
    const sendMessage = (content) => {
        const socket = socketRef.current;

        if (!socket || !socket.connected) {
            setError('Not connected to the chat server. Your message was not sent.');
            return;
        }

        if (!selectedUser && !selectedGroup) return;

        setError('');

        const messageData = selectedGroup
            ? {
                groupId: selectedGroup._id,
                content,
                messageType: 'group'
            }
            : {
                receiver: selectedUser._id || selectedUser.id,
                content,
                messageType: 'private'
            };

        socket.emit('send_message', messageData, (response) => {
            if (!response?.success) {
                setError(response?.message || 'Failed to send message.');
            }
        });
    };

    // 10. Logout
    const handleLogout = () => {
        disconnectSocket();
        logout();
        navigate('/');
    };

    // 11. Chat UI
    return (
        <div className="chat-layout">

            <Sidebar
                user={user}
                users={users}
                groups={groups}
                selectedUser={selectedUser}
                selectedGroup={selectedGroup}
                onSelectUser={loadConversation}
                onSelectGroup={loadGroupConversation}
                onCreateGroup={createGroup}
                onLogout={handleLogout}
                search={search}
                setSearch={setSearch}
            />

            <div className="chat-main">

                <div className={`connection-banner ${connected ? 'connected' : ''}`}>
                    <span className="status-dot" />
                    {connected
                        ? 'Connected to chat server'
                        : 'Connecting to chat server...'}
                </div>

                {error && (
                    <div className="chat-error">
                        {error}

                        <button
                            onClick={() => setError('')}
                            aria-label="Dismiss error"
                        >
                            ×
                        </button>
                    </div>
                )}

                <ChatWindow
                    user={selectedGroup || selectedUser}
                    messages={messages}
                    currentUser={user}
                    isGroup={Boolean(selectedGroup)}
                />

                {(selectedUser || selectedGroup) && (
                    <MessageInput
                        onSend={sendMessage}
                        disabled={!connected}
                    />
                )}

            </div>
        </div>
    );
};

// 12. Export
export default Chat;