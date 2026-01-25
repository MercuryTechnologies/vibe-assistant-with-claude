import { useMemo } from 'react';

interface ChatMessageProps {
  content: string;
  className?: string;
}

/**
 * Simple markdown parser that handles common patterns
 * Supports: **bold**, *italic*, `code`, links, lists, and paragraphs
 */
function parseMarkdown(content: string): React.ReactNode {
  if (!content) return null;
  
  // Split into paragraphs
  const paragraphs = content.split('\n\n');
  
  return paragraphs.map((paragraph, pIdx) => {
    // Check for bullet list
    if (paragraph.match(/^[\-\*]\s/m)) {
      const items = paragraph.split('\n').filter(line => line.match(/^[\-\*]\s/));
      return (
        <ul key={pIdx} className="chat-message-list">
          {items.map((item, iIdx) => (
            <li key={iIdx}>{parseInlineMarkdown(item.replace(/^[\-\*]\s/, ''))}</li>
          ))}
        </ul>
      );
    }
    
    // Check for numbered list
    if (paragraph.match(/^\d+\.\s/m)) {
      const items = paragraph.split('\n').filter(line => line.match(/^\d+\.\s/));
      return (
        <ol key={pIdx} className="chat-message-list">
          {items.map((item, iIdx) => (
            <li key={iIdx}>{parseInlineMarkdown(item.replace(/^\d+\.\s/, ''))}</li>
          ))}
        </ol>
      );
    }
    
    // Regular paragraph
    return (
      <p key={pIdx} className="chat-message-paragraph">
        {parseInlineMarkdown(paragraph)}
      </p>
    );
  });
}

/**
 * Parse inline markdown elements (bold, italic, code, links)
 */
function parseInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;
  
  while (remaining.length > 0) {
    // Bold: **text**
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/);
    if (boldMatch) {
      parts.push(<strong key={key++}>{boldMatch[1]}</strong>);
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }
    
    // Italic: *text*
    const italicMatch = remaining.match(/^\*(.+?)\*/);
    if (italicMatch) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>);
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }
    
    // Inline code: `code`
    const codeMatch = remaining.match(/^`(.+?)`/);
    if (codeMatch) {
      parts.push(<code key={key++} className="chat-message-code">{codeMatch[1]}</code>);
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }
    
    // Link: [text](url)
    const linkMatch = remaining.match(/^\[(.+?)\]\((.+?)\)/);
    if (linkMatch) {
      parts.push(
        <a key={key++} href={linkMatch[2]} className="chat-message-link" target="_blank" rel="noopener noreferrer">
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }
    
    // Plain text until next special character
    const plainMatch = remaining.match(/^[^\*`\[]+/);
    if (plainMatch) {
      parts.push(plainMatch[0]);
      remaining = remaining.slice(plainMatch[0].length);
      continue;
    }
    
    // Single special character that doesn't start a pattern
    parts.push(remaining[0]);
    remaining = remaining.slice(1);
  }
  
  return parts.length === 1 ? parts[0] : parts;
}

/**
 * ChatMessage component renders text with markdown support
 */
export function ChatMessage({ content, className = '' }: ChatMessageProps) {
  const parsedContent = useMemo(() => parseMarkdown(content), [content]);
  
  return (
    <div className={`chat-message ${className}`}>
      {parsedContent}
    </div>
  );
}
