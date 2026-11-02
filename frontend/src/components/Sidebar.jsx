import { useState } from 'react';
import {
    Search,
    MessageCircle,
    Users,
    LogOut,
    Plus,
    X,
    UsersRound
} from 'lucide-react';

const Avatar = ({ user }) => {
    const username = user?.username || 'U';

    return (
        <div className="avatar">
            {user?.profilePicture ? (
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

const Sidebar = ({
    user,
    users,
    groups = [],
    selectedUser,
    selectedGroup,
    onSelectUser,
    onSelectGroup,
    onCreateGroup,
    onLogout,
    search,
    setSearch
}) => {
    const [showGroupForm, setShowGroupForm] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [creating, setCreating] = useState(false);
    const [formError, setFormError] = useState('');

    const filteredUsers = users.filter((item) =>
        item.username.toLowerCase().includes(search.toLowerCase())
    );

    const toggleMember = (userId) => {
        setSelectedMembers((previous) =>
            previous.includes(userId)
                ? previous.filter((id) => id !== userId)
                : [...previous, userId]
        );
    };

    const handleCreateGroup = async (event) => {
        event.preventDefault();
        setFormError('');

        if (!groupName.trim()) {
            setFormError('Enter a group name.');
            return;
        }

        if (selectedMembers.length === 0) {
            setFormError('Select at least one other member.');
            return;
        }

        try {
            setCreating(true);

            await onCreateGroup({
                name: groupName.trim(),
                description: description.trim(),
                members: selectedMembers
            });

            setGroupName('');
            setDescription('');
            setSelectedMembers([]);
            setShowGroupForm(false);
        } catch {
            setFormError('Unable to create group.');
        } finally {
            setCreating(false);
        }
    };

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
                <Avatar user={user} />

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

            {/* Groups */}
            <div className="sidebar-section-heading">
                <div className="sidebar-section-title">
                    <UsersRound size={17} />
                    <span>GROUPS</span>
                </div>

                <button
                    className="icon-button"
                    onClick={() => setShowGroupForm(true)}
                    title="Create group"
                    aria-label="Create group"
                >
                    <Plus size={18} />
                </button>
            </div>

            <div className="group-list">
                {groups.length > 0 ? (
                    groups.map((group) => (
                        <button
                            key={group._id}
                            className={`user-item ${
                                selectedGroup?._id === group._id ? 'selected' : ''
                            }`}
                            onClick={() => onSelectGroup(group)}
                        >
                            <div className="group-avatar">
                                <Users size={19} />
                            </div>

                            <div className="user-item-info">
                                <strong>{group.name}</strong>
                                <span>
                                    {group.members?.length || 0} members
                                </span>
                            </div>
                        </button>
                    ))
                ) : (
                    <p className="empty-contacts">No groups yet</p>
                )}
            </div>

            {/* Contacts */}
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
                    filteredUsers.map((item) => {
                        const isSelected =
                            String(selectedUser?._id || selectedUser?.id) ===
                            String(item._id || item.id);

                        return (
                            <button
                                key={item._id || item.id}
                                className={`user-item ${isSelected ? 'selected' : ''}`}
                                onClick={() => onSelectUser(item)}
                            >
                                <Avatar user={item} />

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
                        );
                    })
                ) : (
                    <p className="empty-contacts">
                        {search ? 'No matching contacts' : 'No contacts available yet'}
                    </p>
                )}
            </div>

            <div className="sidebar-footer">
                <span className="connection-indicator" />
                <span>Ready to connect</span>
            </div>

            {/* Create Group Modal */}
            {showGroupForm && (
                <div className="group-modal-overlay">
                    <div className="group-modal">

                        <div className="group-modal-header">
                            <h3>Create a group</h3>

                            <button
                                type="button"
                                className="icon-button"
                                onClick={() => setShowGroupForm(false)}
                                aria-label="Close"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateGroup}>
                            <label htmlFor="groupName">Group name</label>

                            <input
                                id="groupName"
                                type="text"
                                value={groupName}
                                onChange={(event) => setGroupName(event.target.value)}
                                placeholder="Enter group name"
                                maxLength={60}
                                required
                            />

                            <label htmlFor="groupDescription">Description</label>

                            <textarea
                                id="groupDescription"
                                value={description}
                                onChange={(event) => setDescription(event.target.value)}
                                placeholder="What is this group about?"
                                maxLength={250}
                            />

                            <label>Select members</label>

                            <div className="member-selection">
                                {users.map((item) => {
                                    const id = item._id || item.id;

                                    return (
                                        <label
                                            key={id}
                                            className="member-option"
                                        >
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(id)}
                                                onChange={() => toggleMember(id)}
                                            />

                                            <Avatar user={item} />

                                            <span>{item.username}</span>
                                        </label>
                                    );
                                })}
                            </div>

                            {formError && (
                                <p className="auth-error">{formError}</p>
                            )}

                            <button
                                type="submit"
                                className="auth-button"
                                disabled={creating}
                            >
                                {creating ? 'Creating...' : 'Create Group'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </aside>
    );
};

export default Sidebar;