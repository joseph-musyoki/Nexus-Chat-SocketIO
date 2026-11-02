
// 1. Imports
import {
    MessageCircle,
    Phone,
    Video,
    MoreVertical,
    Users
} from 'lucide-react';

// 2. Avatar Component
const Avatar = ({ user, large = false, group = false }) => {
    const username = user?.username || 'U';

    return (
        <div className={`avatar ${large ? 'large-avatar' : ''}`}>
            {group ? (
                <Users size={large ? 34 : 20} />
            ) : user?.profilePicture ? (
                <img
                    src={user.profilePicture}
                    alt={`${username}'s profile`}
                    className="avatar-image"
                />
            ) : (
                username.charAt(0).toUpperCase()
            )}
        </div>
    );
};

// 3. Chat Window Component
const ChatWindow = ({
    user,
    messages,
    currentUser,
    isGroup = false
}) => {

    // 4. Empty Conversation
    if (!user) {
        return (
            <main className="chat-window empty-chat">
                <div className="empty-chat-icon">
                    <MessageCircle size={42} />
                </div>

                <h2>Your conversations start here</h2>

                <p>Select a contact or group to start chatting.</p>
            </main>
        );
    }

    // 5. Conversation Details
    const chatName = isGroup
        ? user.name
        : user.username;

    const currentUserId =
        currentUser?.id || currentUser?._id;

    // 6. Conversation UI
    return (
        <main className="chat-window">

            <header className="chat-header">
                <Avatar user={user} group={isGroup} />

                <div className="chat-header-info">
                    <h3>{chatName}</h3>

                    {isGroup ? (
                        <span>
                            {user.members?.length || 0} members
                        </span>
                    ) : (
                        <span>
                            <span
                                className={`status-dot ${
                                    user.isOnline ? 'online' : ''
                                }`}
                            />
                            {user.isOnline ? 'Online' : 'Offline'}
                        </span>
                    )}
                </div>

                <div className="chat-actions">
                    <button
                        className="icon-button"
                        title="Voice calls coming later"
                    >
                        <Phone size={19} />
                    </button>

                    <button
                        className="icon-button"
                        title="Video calls coming later"
                    >
                        <Video size={19} />
                    </button>

                    <button
                        className="icon-button"
                        title="More options"
                    >
                        <MoreVertical size={19} />
                    </button>
                </div>
            </header>

            <section className="messages-area">

                <div className="conversation-intro">
                    <Avatar user={user} large group={isGroup} />

                    <h3>{chatName}</h3>

                    {isGroup ? (
                        <p>
                            {user.description ||
                                'This is the beginning of your group conversation.'}
                        </p>
                    ) : (
                        <p>This is the beginning of your conversation.</p>
                    )}
                </div>

                {messages.map((message) => {
                    const senderId =
                        message.sender?._id || message.sender;

                    const isMine =
                        String(senderId) === String(currentUserId);

                    // Find sender details for group messages
                    const groupMember = isGroup
                        ? user.members?.find(
                            member =>
                                String(member._id || member.id) ===
                                String(senderId)
                        )
                        : null;

                    const senderProfile = isMine
                        ? currentUser
                        : (
                            typeof message.sender === 'object'
                                ? message.sender
                                : groupMember || user
                        );

                    return (
                        <div
                            key={message._id}
                            className={`message-row ${
                                isMine ? 'mine' : 'theirs'
                            }`}
                        >
                            {!isMine && (
                                <Avatar user={senderProfile} />
                            )}

                            <div className="message-bubble">

                                {isGroup && (
                                    <span className="message-sender">
                                        {isMine
                                            ? 'You'
                                            : senderProfile?.username || 'Member'}
                                    </span>
                                )}

                                <p>{message.content}</p>

                                <span className="message-time">
                                    {new Date(
                                        message.createdAt
                                    ).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </span>
                            </div>

                            {isMine && (
                                <Avatar user={senderProfile} />
                            )}
                        </div>
                    );
                })}

            </section>

        </main>
    );
};

// 7. Export
export default ChatWindow;
