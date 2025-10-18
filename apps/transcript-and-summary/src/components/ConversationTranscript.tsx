import React, { useMemo } from 'react';
import { useThemeStyles } from '@shared/services/theme';
import './ConversationTranscript.css';

export interface ConversationMessage {
  speaker: 'customer' | 'agent';
  text: string;
  timestamp?: string;
}

export interface ConversationTranscriptProps {
  transcript: string;
  searchQuery?: string;
}

export const ConversationTranscript: React.FC<ConversationTranscriptProps> = ({
  transcript,
  searchQuery = ''
}) => {
  const { getThemeClass } = useThemeStyles();

  // Parse transcript into conversation messages
  const messages = useMemo(() => {
    const lines = transcript.split('\n').filter(line => line.trim());
    const parsedMessages: ConversationMessage[] = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return;

      // Try to identify speaker patterns
      let speaker: 'customer' | 'agent' = 'customer';
      let text = trimmedLine;

      // Common patterns for identifying speakers
      if (trimmedLine.toLowerCase().includes('agent:') || 
          trimmedLine.toLowerCase().includes('representative:') ||
          trimmedLine.toLowerCase().includes('support:')) {
        speaker = 'agent';
        text = trimmedLine.replace(/^(agent|representative|support):\s*/i, '');
      } else if (trimmedLine.toLowerCase().includes('customer:') ||
                 trimmedLine.toLowerCase().includes('caller:') ||
                 trimmedLine.toLowerCase().includes('user:')) {
        speaker = 'customer';
        text = trimmedLine.replace(/^(customer|caller|user):\s*/i, '');
      } else {
        // If no clear speaker indicator, alternate based on previous message
        const lastMessage = parsedMessages[parsedMessages.length - 1];
        speaker = lastMessage ? (lastMessage.speaker === 'customer' ? 'agent' : 'customer') : 'customer';
      }

      // Don't add empty messages
      if (text.trim()) {
        parsedMessages.push({
          speaker,
          text: text.trim()
        });
      }
    });

    return parsedMessages;
  }, [transcript]);

  // Highlight search terms
  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark key={index} className={getThemeClass('search-highlight')}>
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  return (
    <div className={getThemeClass('conversation-transcript')}>
      <div className="conversation-container">
        {messages.map((message, index) => (
          <div
            key={index}
            className={getThemeClass(`message message--${message.speaker}`)}
          >
            <div className="message-avatar">
              <span className="avatar-icon">
                {message.speaker === 'customer' ? '👤' : '🎧'}
              </span>
            </div>
            <div className="message-content">
              <div className="message-header">
                <span className="speaker-name">
                  {message.speaker === 'customer' ? 'Customer' : 'Agent'}
                </span>
                {message.timestamp && (
                  <span className="message-time">{message.timestamp}</span>
                )}
              </div>
              <div className="message-text">
                {highlightText(message.text, searchQuery)}
              </div>
            </div>
          </div>
        ))}
        
        {messages.length === 0 && (
          <div className={getThemeClass('no-messages')}>
            <p>No conversation data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};
