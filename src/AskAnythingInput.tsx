// =============================================================================
// Ask Anything Input Component
// =============================================================================
// A floating action bar for starting chat conversations. Shows quick suggestions
// when focused and captures keyboard input globally.

import React, { useState, useRef, useEffect } from 'react';

// Keyboard Key Component for shortcuts
interface KeyboardKeyProps {
  children: React.ReactNode;
  className?: string;
}

function KeyboardKey({ children, className = '' }: KeyboardKeyProps) {
  return (
    <div className={`inline-flex items-center justify-center px-[6px] py-0 bg-white border border-[rgba(0,0,0,0.12)] rounded-[6px] text-[12px] font-[440] text-[#70707d] leading-[18px] ${className}`}>
      {children}
    </div>
  );
}

// Search Result Item Component
interface SearchResultItemProps {
  icon?: 'square' | 'rounded';
  title: string;
  subtitle: string;
  onClick?: () => void;
}

function SearchResultItem({ icon = 'square', title, subtitle, onClick }: SearchResultItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex gap-[10px] items-center px-[12px] py-[12px] rounded-[8px] hover:bg-[rgba(112,115,147,0.05)] cursor-pointer transition-colors w-full text-left"
    >
      <div 
        className={`w-[24px] h-[24px] bg-[rgba(112,115,147,0.16)] shrink-0 ${
          icon === 'rounded' ? 'rounded-[12px]' : 'rounded-[4px]'
        }`} 
      />
      <div className="flex gap-[8px] items-baseline min-w-0 flex-1">
        <p className="text-[17px] leading-[28px] text-[#363644] font-normal whitespace-nowrap">
          {title}
        </p>
        <p className="text-[15px] leading-[24px] text-[#535461] font-normal whitespace-nowrap">
          {subtitle}
        </p>
      </div>
    </button>
  );
}

// Quick suggestion type
export interface QuickSuggestion {
  icon: 'square' | 'rounded';
  title: string;
  subtitle: string;
  initialMessage: string;
}

// Default quick suggestions
export const defaultQuickSuggestions: QuickSuggestion[] = [
  { 
    icon: 'square', 
    title: "What's my cash flow?", 
    subtitle: 'View your financial insights', 
    initialMessage: "What's my cash flow looking like?" 
  },
  { 
    icon: 'square', 
    title: 'How can I increase my payment limits?', 
    subtitle: 'Mercury Help Center', 
    initialMessage: 'How can I increase my payment limits?' 
  },
  { 
    icon: 'square', 
    title: "What is my EIN?", 
    subtitle: 'Account information', 
    initialMessage: 'What is my EIN?' 
  },
  { 
    icon: 'rounded', 
    title: 'Are there any transactions I should investigate?', 
    subtitle: 'Review flagged transactions', 
    initialMessage: 'Are there any transactions I should investigate?' 
  },
  { 
    icon: 'rounded', 
    title: 'Use agent mode to setup Payroll', 
    subtitle: 'Guided workflow', 
    initialMessage: 'how do we achieve world peace?' 
  },
];

// Ask Anything Input Component
export interface AskAnythingInputProps {
  isFocused?: boolean;
  onStartChat: (initialMessage: string) => void;
  suggestions?: QuickSuggestion[];
}

export default function AskAnythingInput({ 
  isFocused: controlledFocused, 
  onStartChat,
  suggestions = defaultQuickSuggestions 
}: AskAnythingInputProps) {
  const [isFocused, setIsFocused] = useState(controlledFocused ?? false);
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Handle selecting a prefill option
  const handleSelectOption = (initialMessage: string) => {
    setIsFocused(false);
    onStartChat(initialMessage);
  };

  // Handle submitting custom input
  const handleSubmit = () => {
    if (inputValue.trim()) {
      setIsFocused(false);
      onStartChat(inputValue.trim());
      setInputValue('');
    }
  };

  // Focus input when expanded
  useEffect(() => {
    if (isFocused && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isFocused]);
  
  // Global keyboard listener - focus input when user starts typing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if already focused or if user is in another input
      if (isFocused) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      
      // Expand and focus the input for printable characters
      if (e.key.length === 1) {
        setIsFocused(true);
        // Small delay to ensure the input is rendered and focused
        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  return (
    <>
      {/* Progressive blur overlay when focused - extended coverage for better background obscuring */}
      <div 
        className={`fixed inset-0 z-40 transition-opacity duration-300 ease-out ${
          isFocused ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsFocused(false)}
      >
        {/* Solid white overlay - starts higher for better text readability */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[70%] pointer-events-none"
          style={{
            background: 'linear-gradient(to bottom, rgba(251,252,253,0) 0%, rgba(251,252,253,0.5) 10%, rgba(251,252,253,0.85) 35%, rgba(251,252,253,0.95) 60%, rgba(251,252,253,1) 100%)',
          }}
        />
        {/* Layer 1 - extended lightest blur */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[65%]"
          style={{
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.5) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.5) 100%)',
          }}
        />
        {/* Layer 2 - medium blur */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[55%]"
          style={{
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.7) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.7) 100%)',
          }}
        />
        {/* Layer 3 - stronger blur */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[45%]"
          style={{
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.9) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0.9) 100%)',
          }}
        />
        {/* Layer 4 - maximum blur at bottom */}
        <div 
          className="absolute inset-x-0 bottom-0 h-[35%]"
          style={{
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            maskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,1) 50%, rgba(0,0,0,1) 100%)',
          }}
        />
      </div>
      
      <div 
        className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ease-out ${
          isFocused ? 'w-screen' : ''
        }`}
      >
        {/* Centered container */}
        <div className={`mx-auto transition-all duration-300 ease-out ${isFocused ? 'w-full' : 'w-auto'}`}>
          {/* Main Container */}
          <div 
            className={`mx-auto overflow-hidden transition-all duration-300 ease-out ${
              isFocused 
                ? 'rounded-none' 
                : 'rounded-[44px] bg-white shadow-[0px_0px_2.5px_0px_rgba(175,178,206,0.65),0px_0px_3.75px_0px_rgba(0,0,0,0.09),0px_15px_20px_0px_rgba(0,0,0,0.01),0px_27.5px_35px_0px_rgba(0,0,0,0.04)] hover:shadow-[0px_0px_4px_0px_rgba(175,178,206,0.8),0px_0px_6px_0px_rgba(0,0,0,0.12),0px_18px_24px_0px_rgba(0,0,0,0.03),0px_30px_40px_0px_rgba(0,0,0,0.06)] w-[350px]'
            }`}
          >
            {/* Results Section - only visible when focused */}
            <div 
              className={`overflow-hidden transition-all duration-300 ease-out ${
                isFocused ? 'max-h-[400px] opacity-100' : 'max-h-0 opacity-0'
              }`}
            >
              <div className="flex justify-center">
                <div className="w-[600px] pt-[24px]">
                  <div className="px-[4px]">
                    {suggestions.map((result, index) => (
                      <SearchResultItem
                        key={index}
                        icon={result.icon}
                        title={result.title}
                        subtitle={result.subtitle}
                        onClick={() => handleSelectOption(result.initialMessage)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Composer Section */}
            <div className={`transition-all duration-300 ease-out ${isFocused ? 'py-[24px]' : 'p-0'}`}>
              <div className={`mx-auto transition-all duration-300 ease-out ${isFocused ? 'w-[600px]' : 'w-auto'}`}>
                <div 
                  className={`bg-white overflow-hidden transition-all duration-300 ease-out ${
                    isFocused 
                      ? 'rounded-[24px] shadow-[0px_0px_2.5px_0px_rgba(175,178,206,0.65),0px_0px_3.75px_0px_rgba(0,0,0,0.09),0px_15px_20px_0px_rgba(0,0,0,0.01),0px_27.5px_35px_0px_rgba(0,0,0,0.04)]' 
                      : 'rounded-[44px]'
                  }`}
                >
                  <div className={`flex transition-all duration-300 ease-out ${
                    isFocused ? 'p-[12px] flex-col gap-[12px]' : 'p-[6px] pl-[16px] flex-row items-center justify-between'
                  }`}>
                    {/* Input Row */}
                    <div className={`flex items-center transition-all duration-300 ease-out ${isFocused ? 'pr-[8px]' : ''}`}>
                      <div className={`flex items-center h-[30px] transition-all duration-300 ease-out ${isFocused ? 'flex-1 pl-[8px]' : 'flex-1'}`}>
                        {/* Typing cursor indicator - only in focused state */}
                        {isFocused && inputValue === '' && (
                          <div className="w-[1px] h-[20px] bg-[#5266eb] animate-pulse mr-[2px]" />
                        )}
                        <input
                          ref={inputRef}
                          type="text"
                          placeholder="Ask anything"
                          value={inputValue}
                          onChange={(e) => setInputValue(e.target.value)}
                          onFocus={() => setIsFocused(true)}
                          onBlur={() => {
                            // Small delay to allow clicking on results
                            setTimeout(() => setIsFocused(false), 150);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && inputValue.trim()) {
                              e.preventDefault();
                              handleSubmit();
                            }
                          }}
                          className={`text-[18.75px] leading-[30px] text-[#363644] placeholder-[#9d9da8] outline-none bg-transparent transition-all duration-300 ease-out ${
                            isFocused ? 'flex-1 w-full' : 'flex-1'
                          }`}
                        />
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="flex items-center justify-end">
                      {/* Right Side Actions */}
                      <div className="flex items-center gap-[24px]">
                        {/* Agent Mode Toggle - only visible when focused */}
                        <div className={`flex items-center gap-[4px] transition-all duration-300 ease-out ${
                          isFocused ? 'opacity-100 max-w-[200px]' : 'opacity-0 max-w-0 overflow-hidden'
                        }`}>
                          <span className="text-[14px] leading-[20px] text-[#535461] font-normal whitespace-nowrap">
                            Agent Mode
                          </span>
                          <KeyboardKey>Tab</KeyboardKey>
                        </div>

                        {/* Send Button */}
                        <button
                          type="button"
                          onClick={handleSubmit}
                          disabled={!inputValue.trim()}
                          className="w-[40px] h-[40px] rounded-full bg-[#5266eb] flex items-center justify-center text-white hover:bg-[#4255d9] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          aria-label="Send"
                        >
                          <svg className="w-[16px] h-[16px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Keyboard Shortcuts Bar - inside the input card, only visible when focused */}
                  {isFocused && (
                  <div 
                    className="flex items-center justify-between px-[16px] py-[8px] border-t border-[rgba(112,115,147,0.1)] transition-all duration-300 ease-out"
                  >
                    {/* Left Side - Keyboard Shortcuts */}
                    <div className="flex items-center gap-[12px]">
                      {/* Filter */}
                      <div className="flex items-center gap-[4px]">
                        <KeyboardKey>/</KeyboardKey>
                        <span className="text-[12px] leading-[20px] text-[#535461] tracking-[0.2px]">
                          Filter
                        </span>
                      </div>

                      {/* Navigate */}
                      <div className="flex items-center gap-[4px]">
                        <KeyboardKey>↑</KeyboardKey>
                        <KeyboardKey>↓</KeyboardKey>
                        <span className="text-[12px] leading-[20px] text-[#535461] tracking-[0.2px]">
                          Navigate
                        </span>
                      </div>

                      {/* Select */}
                      <div className="flex items-center gap-[4px]">
                        <KeyboardKey>↵</KeyboardKey>
                        <span className="text-[12px] leading-[20px] text-[#535461] tracking-[0.2px]">
                          Select
                        </span>
                      </div>
                    </div>

                    {/* Right Side - Help Link */}
                    <div className="flex items-center gap-[3px] text-[12px] tracking-[0.2px]">
                      <span className="text-[#535461] leading-[20px]">
                        Not what you're looking for?
                      </span>
                      <span className="text-[#535461] leading-[20px]">
                        Try the
                      </span>
                      <button 
                        type="button" 
                        className="text-[#5266eb] leading-[20px] hover:underline"
                      >
                        Help Center
                      </button>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

