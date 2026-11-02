// 1. Imports
import { Search, MessageCircle, Users, LogOut } from 'lucide-react';

// 2. Sidebar Component
const Sidebar = ({
    user,
    users,
    selectedUser,
    onSelectUser,
    onLogout,
    search,
    setSearch
}) => {

    // 3. Filter Users
    const filteredUsers = users.filter((item) =>
        item.username.toLowerCase().includes(search.toLowerCase())
    );

    // 4. UI
    return (
        <aside className="sidebar">

            <div className="sidebar-header">
                <div className="brand-icon">
                    <MessageCircle size={25} />
                </div>

                <div>
                    <h2>Nexus Chat</h2>
                    <span>Let's connect</span>
                </div>
            </div>

            <div className="current-user">
                <div className="avatar">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>

                <div className="current-user-info">
                    <strong>{user?.username}</strong>
                    <span>My account</span>
                </div>

                <button
                    className="icon-button logout-button"
                    onClick={onLogout}
                    title="Sign out"
                    aria-label="Sign out"
                >
                    <LogOut size={18} />
                </button>
            </div>

            <div className="sidebar-section-title">
                <Users size={17} />
                <span>CONTACTS</span>
            </div>

            <div className="search-box">
                <Search size={18} />

                <input
                    type="text"
                    placeholder="Search people..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                />
            </div>

            <div className="user-list">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((item) => (
                        <button
                            key={item._id || item.id}
                            className={`user-item ${
                                selectedUser?._id === item._id
                                    ? 'selected'
                                    : ''
                            }`}
                            onClick={() => onSelectUser(item)}
                        >
                            <div className="avatar">
                                {item.username.charAt(0).toUpperCase()}
                            </div>

                            <div className="user-item-info">
                                <strong>{item.username}</strong>
                                <span>
                                    {item.isOnline ? 'Online' : 'Contact'}
                                </span>
                            </div>

                            <span
                                className={`status-dot ${
                                    item.isOnline ? 'online' : ''
                                }`}
                            />
                        </button>
                    ))
                ) : (
                    <p className="empty-contacts">
                        {search
                            ? 'No matching contacts'
                            : 'No contacts available yet'}
                    </p>
                )}
            </div>

            <div className="sidebar-footer">
                <span className="connection-indicator" />
                <span>Ready to connect</span>
            </div>

        </aside>
    );
};

// 5. Export
export default Sidebar;