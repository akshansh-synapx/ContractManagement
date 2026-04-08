import { useState, useRef, useEffect } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import type { Discussion } from '../types';
import { useApp } from '../context/AppContext';
import { formatDateTime, getInitials } from '../utils/helpers';

interface ChatPanelProps {
  requestId: string;
  versionId?: string;
  disabled?: boolean;
}

export default function ChatPanel({ requestId, versionId, disabled = false }: ChatPanelProps) {
  const { getRequestDiscussions, addDiscussion, currentUser } = useApp();
  const [message, setMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const discussions: Discussion[] = versionId
    ? getRequestDiscussions(requestId, versionId)
    : getRequestDiscussions(requestId).filter((d) => !d.syn_docversionid);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [discussions.length]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    addDiscussion(requestId, message.trim(), versionId);
    setMessage('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-header-title">
          {versionId ? 'Version Discussion' : 'General Discussion'}
        </span>
        <span className="chat-header-count">{discussions.length} messages</span>
      </div>

      {discussions.length === 0 ? (
        <div className="chat-empty">
          <MessageSquare />
          <p>No messages yet. Start the discussion below.</p>
        </div>
      ) : (
        <div className="chat-messages" ref={chatContainerRef}>
          {discussions.map((disc) => (
            <div
              key={disc.syn_discussionid}
              className={`chat-message ${disc.syn_userid === currentUser.id ? 'own' : ''}`}
            >
              <div className="chat-avatar">{getInitials(disc.syn_username)}</div>
              <div className="chat-bubble">
                <div className="chat-bubble-name">{disc.syn_username}</div>
                <div className="chat-bubble-text">{disc.syn_message}</div>
                <div className="chat-bubble-time">{formatDateTime(disc.syn_timestamp)}</div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {!disabled && (
        <div className="chat-input-area">
          <textarea
            className="chat-input"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
          />
          <button
            className="chat-send-btn"
            onClick={handleSend}
            disabled={!message.trim()}
          >
            <Send />
          </button>
        </div>
      )}
    </div>
  );
}
