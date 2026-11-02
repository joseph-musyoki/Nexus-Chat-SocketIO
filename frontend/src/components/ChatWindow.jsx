// 1. Imports
import { MessageCircle, Phone, Video, MoreVertical } from 'lucide-react';

// 2. Chat Window Component
const ChatWindow = ({ user, messages, currentUser }) => {

    // 3. Empty Conversation
    if (!user) {
        return (
            <main className="chat-window empty-chat">
                <div className="empty-chat-icon">
                    <MessageCircle size={42} />
                </div>

                <h2>Your conversations start here</h2>

                <p>Select a contact to start chatting with them.</p>
            </main>
        );
    }

    // 4. Conversation UI
    return (
        <main className="chat-window">

            <header className="chat-header">
                <div className="avatar">
                    {user.username.charAt(0).toUpperCase()}
                </div>

                <div className="chat-header-info">
                    <h3>{user.username}</h3>

                    <span>
                        <span className={`status-dot ${user.isOnline ? 'online' : ''}`} />
                        {user.isOnline ? 'Online' : 'Offline'}
                    </span>
                </div>

                <div className="chat-actions">
                    <button className="icon-button" title="Voice calls coming later">
                        <Phone size={19} />
                    </button>

                    <button className="icon-button" title="Video calls coming later">
                        <Video size={19} />
                    </button>

                    <button className="icon-button" title="More options">
                        <MoreVertical size={19} />
                    </button>
                </div>
            </header>

            <section className="messages-area">
                <div className="conversation-intro">
                    <div className="avatar large-avatar">
                        {user.username.charAt(0).toUpperCase()}
                    </div>

                    <h3>{user.username}</h3>
                    <p>This is the beginning of your conversation.</p>
                </div>

                {messages.map((message) => {
                    const senderId =
                        message.sender?._id || message.sender;

                    const isMine =
                        String(senderId) === String(currentUser?.id || currentUser?._id);

                    return (
                        <div
                            key={message._id}
                            className={`message-row ${isMine ? 'mine' : 'theirs'}`}
                        >
                            <div className="message-bubble">
                                <p>{message.content}</p>

                                <span className="message-time">
                                    {new Date(message.createdAt).toLocaleTimeString(
                                        [],
                                        {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        }
                                    )}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </section>

        </main>
    );
};

// 5. Export
export default ChatWindow;