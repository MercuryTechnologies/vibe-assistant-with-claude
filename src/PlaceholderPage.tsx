// =============================================================================
// Placeholder Page
// =============================================================================
// A simple placeholder for pages that aren't implemented in this demo.

import React from 'react';

export default function PlaceholderPage() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="mb-6">
          <svg 
            className="w-16 h-16 mx-auto text-[#c4c6d0]" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor" 
            strokeWidth={1}
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
        </div>
        <p className="text-[#707393] text-lg font-medium">
          This is just a vibe coder demo and doesn't work.
        </p>
        <p className="text-[#9a9cac] mt-2 text-[15px]">
          Check transactions and insights pages for more.
        </p>
      </div>
    </div>
  );
}

