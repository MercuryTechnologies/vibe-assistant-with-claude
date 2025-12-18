import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, ChevronDownIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { type Transaction } from './mockData';
import { glCodeOptions } from './mockData';

// ============================================
// Types
// ============================================

interface TimelineEvent {
  id: string;
  label: string;
  timestamp: string;
  type: 'payment' | 'account' | 'status';
  isCompleted?: boolean;
}

interface TransactionsDetailPanelProps {
  /** The transaction to display */
  transaction: Transaction | null;
  /** Whether the panel is open */
  isOpen: boolean;
  /** Callback when panel is closed */
  onClose: () => void;
  /** Callback when category changes */
  onCategoryChange?: (transactionId: string, category: string) => void;
  /** Callback when notes change */
  onNotesChange?: (transactionId: string, notes: string) => void;
}

// ============================================
// Helper Functions
// ============================================

const formatAmount = (amount: number): { dollars: string; cents: string; isNegative: boolean } => {
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  const [dollars, cents] = absAmount.toFixed(2).split('.');
  const formattedDollars = Number(dollars).toLocaleString();
  
  return {
    dollars: `${isNegative ? '–' : ''}$${formattedDollars}`,
    cents,
    isNegative,
  };
};

const formatTimestamp = (dateStr: string): string => {
  // Convert "Dec 8" format to a full timestamp
  const currentYear = new Date().getFullYear();
  const date = new Date(`${dateStr} ${currentYear}`);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  
  return `${dateStr} at ${formattedHours}:${formattedMinutes}${ampm} UTC`;
};

// ============================================
// Subcomponents
// ============================================

// Timeline Event Item
interface TimelineEventItemProps {
  event: TimelineEvent;
  isLast: boolean;
}

const TimelineEventItem: React.FC<TimelineEventItemProps> = ({ event, isLast }) => {
  const getDotStyle = () => {
    if (event.type === 'account') {
      // Green diamond for account events
      return (
        <div className="w-2.5 h-2.5 bg-emerald-500 rotate-45 flex-shrink-0" />
      );
    }
    // Grey circle for payment events
    return (
      <div className="w-2.5 h-2.5 rounded-full bg-gray-400 flex-shrink-0" />
    );
  };

  return (
    <div className="relative flex gap-3">
      {/* Vertical connector line */}
      {!isLast && (
        <div 
          className="absolute left-[5px] top-[14px] w-[1px] h-[calc(100%+4px)] bg-gray-200"
          aria-hidden="true"
        />
      )}
      
      {/* Dot indicator */}
      <div className="relative z-10 mt-1.5">
        {getDotStyle()}
      </div>
      
      {/* Content */}
      <div className="flex-1 pb-4">
        <p className="text-[15px] font-medium text-gray-900 leading-tight">
          {event.label}
        </p>
        <p className="text-[13px] text-gray-500 mt-0.5">
          {event.timestamp}
        </p>
      </div>
    </div>
  );
};

// Timeline Component
interface TimelineProps {
  events: TimelineEvent[];
}

const Timeline: React.FC<TimelineProps> = ({ events }) => {
  return (
    <div className="space-y-0">
      {events.map((event, index) => (
        <TimelineEventItem 
          key={event.id} 
          event={event} 
          isLast={index === events.length - 1}
        />
      ))}
    </div>
  );
};

// Dropdown Select Component
interface DropdownSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const DropdownSelect: React.FC<DropdownSelectProps> = ({ 
  value, 
  onChange, 
  options, 
  placeholder = 'Select...' 
}) => {
  const selectedOption = options.find(opt => opt.value === value || opt.label === value);
  
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 px-4 pr-10 text-[14px] text-gray-900 bg-white border border-gray-200 rounded-lg appearance-none cursor-pointer
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   hover:border-gray-300 transition-colors"
      >
        <option value="">{placeholder}</option>
        {options.filter(opt => opt.value).map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
    </div>
  );
};

// File Upload Area Component
interface FileUploadAreaProps {
  onFilesSelected?: (files: FileList) => void;
}

const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onFilesSelected }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected?.(e.dataTransfer.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected?.(e.target.files);
    }
  };

  return (
    <div
      onClick={handleClick}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        w-full p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors
        flex flex-col items-center justify-center gap-2
        ${isDragging 
          ? 'border-blue-400 bg-blue-50' 
          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={handleFileChange}
        className="hidden"
      />
      
      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
        <ArrowUpTrayIcon className="w-5 h-5 text-gray-500" />
      </div>
      
      <p className="text-[14px] font-medium text-gray-700">
        Drag and drop here or click to upload
      </p>
      <p className="text-[13px] text-gray-500">
        You may upload PDF, PNG, or JPEG files
      </p>
    </div>
  );
};

// Expandable Comment Input
interface CommentInputProps {
  onSubmit?: (comment: string) => void;
}

const CommentInput: React.FC<CommentInputProps> = ({ onSubmit }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [comment, setComment] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isExpanded && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isExpanded]);

  const handleSubmit = () => {
    if (comment.trim()) {
      onSubmit?.(comment);
      setComment('');
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full h-11 px-4 text-left text-[14px] text-gray-400 bg-white border border-gray-200 rounded-lg
                   hover:border-gray-300 hover:text-gray-500 transition-colors"
      >
        Add a comment
      </button>
    );
  }

  return (
    <div className="space-y-3">
      <textarea
        ref={textareaRef}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Write your comment..."
        className="w-full h-24 px-4 py-3 text-[14px] text-gray-900 bg-white border border-gray-200 rounded-lg resize-none
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                   placeholder:text-gray-400"
      />
      <div className="flex justify-end gap-2">
        <button
          onClick={() => {
            setIsExpanded(false);
            setComment('');
          }}
          className="px-3 py-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-800 transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!comment.trim()}
          className="px-4 py-1.5 text-[13px] font-medium text-white bg-blue-600 rounded-md
                     hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Comment
        </button>
      </div>
    </div>
  );
};

// ============================================
// Main Component
// ============================================

const TransactionsDetailPanel: React.FC<TransactionsDetailPanelProps> = ({
  transaction,
  isOpen,
  onClose,
  onCategoryChange,
  onNotesChange,
}) => {
  const [category, setCategory] = useState('');
  const [notes, setNotes] = useState('');
  const [bankDescription, setBankDescription] = useState('');
  const panelRef = useRef<HTMLDivElement>(null);

  // Reset form when transaction changes
  useEffect(() => {
    if (transaction) {
      setCategory(transaction.glCode || '');
      setNotes('');
      setBankDescription('');
    }
  }, [transaction]);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!transaction) return null;

  const amount = formatAmount(transaction.amount);

  // Build timeline events from transaction data
  const timelineEvents: TimelineEvent[] = [
    {
      id: '1',
      label: transaction.toFrom.name,
      timestamp: formatTimestamp(transaction.date),
      type: 'payment',
    },
    {
      id: '2',
      label: transaction.account,
      timestamp: formatTimestamp(transaction.date),
      type: 'account',
      isCompleted: true,
    },
  ];

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    onCategoryChange?.(transaction.id, value);
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    onNotesChange?.(transaction.id, e.target.value);
  };

  return (
    <>
      {/* Panel */}
      <div
        ref={panelRef}
        className={`
          fixed right-4 top-4 bottom-4 w-[420px] max-w-[calc(100vw-32px)]
          bg-white shadow-xl border border-gray-200 rounded-xl
          transform transition-transform duration-300 ease-out z-50
          ${isOpen ? 'translate-x-0' : 'translate-x-[calc(100%+16px)]'}
        `}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
      >
        {/* Scrollable content container */}
        <div className="h-full overflow-y-auto rounded-xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-5 flex items-start justify-between rounded-t-xl">
            <h2 
              id="panel-title" 
              className="text-[18px] font-medium text-gray-900 leading-tight tracking-[-0.01em]"
            >
              {transaction.toFrom.name}
            </h2>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors -mt-1 -mr-2"
              aria-label="Close panel"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Amount */}
            <div>
              <span className="text-[32px] font-bold text-gray-900 leading-none tracking-[-0.01em]">
                {amount.dollars}
              </span>
              <span className="text-[20px] font-medium text-gray-500 tracking-[-0.01em]">
                .{amount.cents}
              </span>
            </div>

            {/* Timeline */}
            <div className="pt-2">
              <Timeline events={timelineEvents} />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Category Field */}
            <div className="space-y-2">
              <label className="block text-[14px] font-medium text-gray-700">
                Category
              </label>
              <DropdownSelect
                value={category}
                onChange={handleCategoryChange}
                options={glCodeOptions}
                placeholder=""
              />
              <a 
                href="#" 
                className="inline-block text-[14px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
                onClick={(e) => e.preventDefault()}
              >
                Manage categories
              </a>
            </div>

            {/* Notes Field */}
            <div className="space-y-2">
              <label className="block text-[14px] font-medium text-gray-700">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={handleNotesChange}
                placeholder=""
                className="w-full h-[120px] px-4 py-3 text-[14px] text-gray-900 bg-white border border-gray-200 rounded-lg resize-none
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder:text-gray-400"
              />
            </div>

            {/* Attachments */}
            <div className="space-y-2">
              <label className="block text-[14px] font-medium text-gray-700">
                Attachments
              </label>
              <FileUploadArea />
            </div>

            {/* Bank Description */}
            <div className="space-y-2">
              <label className="block text-[14px] font-medium text-gray-700">
                Bank description
              </label>
              <input
                type="text"
                value={bankDescription}
                onChange={(e) => setBankDescription(e.target.value)}
                className="w-full h-11 px-4 text-[14px] text-gray-900 bg-white border border-gray-200 rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           placeholder:text-gray-400"
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* Comments Section */}
            <div className="space-y-2">
              <CommentInput />
            </div>
          </div>

          {/* Bottom padding for scroll */}
          <div className="h-8" />
        </div>
      </div>
    </>
  );
};

export default TransactionsDetailPanel;
