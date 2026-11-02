// 1. Imports
import { useState } from 'react';
import { Send } from 'lucide-react';

// 2. Message Input Component
const MessageInput = ({ onSend, disabled }) => {

    const [content, setContent] = useState('');

    // 3. Submit Message
    const handleSubmit = (event) => {
        event.preventDefault();

        const trimmedContent = content.trim();

        if (!trimmedContent || disabled) {
            return;
        }

        onSend(trimmedContent);
        setContent('');
    };

    // 4. UI
    return (
        <form className="message-input-area" onSubmit={handleSubmit}>

            <input
                type="text"
                placeholder="Write a message..."
                value={content}
                onChange={(event) => setContent(event.target.value)}
                maxLength={5000}
                disabled={disabled}
                aria-label="Message"
            />

            <button
                type="submit"
                className="send-button"
                disabled={disabled || !content.trim()}
                aria-label="Send message"
                title="Send message"
            >
                <Send size={19} />
            </button>

        </form>
    );
};

// 5. Export
export default MessageInput;