// =============================================================================
// Chat Message Component
// =============================================================================
// Renders individual user and assistant message bubbles with markdown support

import React from 'react'
import { ChatMessage as ChatMessageType, MessageMetadata } from './types'
import ActionCard from './ActionCard'
import TransactionTable from './TransactionTable'
import { useChatStore } from './useChatStore'

interface ChatMessageProps {
  message: ChatMessageType
  onNavigate?: (url: string, navigationMeta?: MessageMetadata['navigation']) => void
  onUndo?: (actionType: string, targetId: string) => void
}

/**
 * Check if a paragraph is a markdown table
 */
function isMarkdownTable(paragraph: string): boolean {
  const lines = paragraph.split('\n').filter(l => l.trim())
  if (lines.length < 2) return false
  
  // Check if lines start and contain pipes
  const hasPipes = lines.every(line => line.includes('|'))
  // Check for separator row (|---|---|)
  const hasSeparator = lines.some(line => /^\|?[\s-:|]+\|?$/.test(line.trim()))
  
  return hasPipes && hasSeparator
}

/**
 * Parse a markdown table into a React table element
 */
function parseMarkdownTable(paragraph: string, key: number): React.ReactNode {
  const lines = paragraph.split('\n').filter(l => l.trim())
  
  // Filter out separator row and parse cells
  const dataRows = lines.filter(line => !/^\|?[\s-:|]+\|?$/.test(line.trim()))
  
  if (dataRows.length === 0) return null
  
  const parseRow = (line: string): string[] => {
    return line
      .split('|')
      .map(cell => cell.trim())
      .filter((cell, idx, arr) => idx > 0 && idx < arr.length - 1 || cell) // Handle edge pipes
  }
  
  const headerCells = parseRow(dataRows[0])
  const bodyRows = dataRows.slice(1).map(parseRow)
  
  return (
    <div key={key} className="my-3 overflow-hidden rounded-lg border border-[rgba(112,115,147,0.16)] bg-white">
      <div className="overflow-x-auto">
        <table className="w-full text-[14px]">
          <thead>
            <tr className="border-b border-[rgba(112,115,147,0.12)] bg-[#fafafc]">
              {headerCells.map((cell, idx) => (
                <th key={idx} className="px-3 py-2 text-left font-medium text-[#6e6e80] text-[12px] uppercase tracking-wide">
                  {cell}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-[rgba(112,115,147,0.06)] last:border-b-0 hover:bg-[#f8f8fa]">
                {row.map((cell, cellIdx) => (
                  <td key={cellIdx} className="px-3 py-2.5 text-[#1e1e2a]">
                    {parseInlineFormatting(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/**
 * Parse simple markdown-like formatting into React elements
 */
function parseMarkdown(text: string): React.ReactNode {
  if (!text) return null
  
  // Split into paragraphs
  const paragraphs = text.split(/\n\n+/)
  
  return paragraphs.map((paragraph, pIdx) => {
    // Check if this is a markdown table
    if (isMarkdownTable(paragraph)) {
      return parseMarkdownTable(paragraph, pIdx)
    }
    
    // Check if this is a list
    const lines = paragraph.split('\n')
    const isUnorderedList = lines.every(line => /^[-•*]\s/.test(line.trim()) || line.trim() === '')
    const isOrderedList = lines.every(line => /^\d+\.\s/.test(line.trim()) || line.trim() === '')
    
    if (isUnorderedList && lines.some(l => l.trim())) {
      return (
        <ul key={pIdx} className="list-disc list-inside space-y-1 my-2">
          {lines
            .filter(line => line.trim())
            .map((line, lIdx) => (
              <li key={lIdx} className="text-[15px]">
                {parseInlineFormatting(line.replace(/^[-•*]\s*/, ''))}
              </li>
            ))}
        </ul>
      )
    }
    
    if (isOrderedList && lines.some(l => l.trim())) {
      return (
        <ol key={pIdx} className="list-decimal list-inside space-y-1 my-2">
          {lines
            .filter(line => line.trim())
            .map((line, lIdx) => (
              <li key={lIdx} className="text-[15px]">
                {parseInlineFormatting(line.replace(/^\d+\.\s*/, ''))}
              </li>
            ))}
        </ol>
      )
    }
    
    // Regular paragraph - handle single line breaks
    return (
      <p key={pIdx} className="my-2 first:mt-0 last:mb-0">
        {lines.map((line, lIdx) => (
          <React.Fragment key={lIdx}>
            {parseInlineFormatting(line)}
            {lIdx < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    )
  })
}

/**
 * Parse inline formatting like **bold** and *italic*
 */
function parseInlineFormatting(text: string): React.ReactNode {
  if (!text) return null
  
  // Match **bold**, *italic*, and regular text
  const parts: React.ReactNode[] = []
  let remaining = text
  let key = 0
  
  while (remaining.length > 0) {
    // Check for bold (**text**)
    const boldMatch = remaining.match(/^\*\*(.+?)\*\*/)
    if (boldMatch) {
      parts.push(<strong key={key++} className="font-semibold">{boldMatch[1]}</strong>)
      remaining = remaining.slice(boldMatch[0].length)
      continue
    }
    
    // Check for italic (*text*)
    const italicMatch = remaining.match(/^\*(.+?)\*/)
    if (italicMatch) {
      parts.push(<em key={key++}>{italicMatch[1]}</em>)
      remaining = remaining.slice(italicMatch[0].length)
      continue
    }
    
    // Check for inline code (`code`)
    const codeMatch = remaining.match(/^`(.+?)`/)
    if (codeMatch) {
      parts.push(
        <code key={key++} className="bg-[#f2f2f7] px-1.5 py-0.5 rounded text-[13px] font-mono">
          {codeMatch[1]}
        </code>
      )
      remaining = remaining.slice(codeMatch[0].length)
      continue
    }
    
    // Find the next special character or end of string
    const nextSpecial = remaining.search(/\*|`/)
    if (nextSpecial === -1) {
      parts.push(remaining)
      break
    } else if (nextSpecial === 0) {
      // Special char at start but not matched - just add it
      parts.push(remaining[0])
      remaining = remaining.slice(1)
    } else {
      parts.push(remaining.slice(0, nextSpecial))
      remaining = remaining.slice(nextSpecial)
    }
  }
  
  return parts.length === 1 ? parts[0] : <>{parts}</>
}

export default function ChatMessage({ message, onNavigate, onUndo }: ChatMessageProps) {
  const isUser = message.role === 'user'
  const isNavigationComplete = useChatStore((state) => state.isNavigationComplete)
  const markNavigationComplete = useChatStore((state) => state.markNavigationComplete)
  
  const handleViewTransaction = (url: string) => {
    onNavigate?.(url)
  }
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[85%] ${
          isUser
            ? 'bg-[#f2f2f7] rounded-[20px] rounded-br-[4px]'
            : 'bg-[#fafafc] border border-[rgba(112,115,147,0.12)] rounded-[20px] rounded-bl-[4px]'
        }`}
      >
        {/* Message content */}
        <div
          className={`px-4 py-3 text-[15px] leading-[22px] ${
            isUser
              ? 'text-[#1e1e2a]'
              : 'text-[#363644]'
          }`}
        >
          {isUser ? (
            <span>{message.content}</span>
          ) : (
            // Assistant message with markdown formatting
            <div className="space-y-1">
              {parseMarkdown(message.content)}
            </div>
          )}
        </div>
        
        {/* Transaction table for assistant messages */}
        {!isUser && message.metadata?.transactionTable && (
          <div className="px-3 pb-2">
            <TransactionTable
              data={message.metadata.transactionTable}
              onViewTransaction={handleViewTransaction}
            />
          </div>
        )}
        
        {/* Action card for assistant messages with metadata */}
        {!isUser && message.metadata && (message.metadata.navigation || message.metadata.action || message.metadata.formPrefill || message.metadata.supportHandoff || message.metadata.link) && (
          <div className="px-4 pb-3">
            <ActionCard
              messageId={message.id}
              metadata={message.metadata}
              onNavigate={onNavigate}
              onUndo={onUndo}
              isNavigationComplete={isNavigationComplete(message.id)}
              onNavigationComplete={() => markNavigationComplete(message.id, message.metadata?.navigation)}
            />
          </div>
        )}
      </div>
    </div>
  )
}
