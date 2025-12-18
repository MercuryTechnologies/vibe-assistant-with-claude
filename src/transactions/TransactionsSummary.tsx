import React, { useMemo } from 'react';
import { type Transaction } from './mockData';

const formatCurrency = (value: number, showSign = false): string => {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(value));
  
  if (showSign && value < 0) {
    return `–${formatted}`;
  }
  return formatted;
};

interface TransactionsSummaryProps {
  collapsed?: boolean;
  transactions: Transaction[];
  /** Optional override values from line chart hover */
  hoverData?: {
    moneyIn: number;
    moneyOut: number;
  } | null;
}

const TransactionsSummary: React.FC<TransactionsSummaryProps> = ({ collapsed = false, transactions, hoverData }) => {
  // Calculate summary from actual transaction data
  const calculatedValues = useMemo(() => {
    let totalIn = 0;
    let totalOut = 0;
    
    transactions.forEach(t => {
      // Skip failed transactions
      if (t.status === 'failed') return;
      
      if (t.amount >= 0) {
        totalIn += t.amount;
      } else {
        totalOut += Math.abs(t.amount);
      }
    });
    
    return {
      moneyIn: totalIn,
      moneyOut: totalOut,
      netChange: totalIn - totalOut,
    };
  }, [transactions]);

  // Use hover data if available, otherwise use calculated values
  const moneyIn = hoverData?.moneyIn ?? calculatedValues.moneyIn;
  const moneyOut = hoverData?.moneyOut ?? calculatedValues.moneyOut;
  const netChange = moneyIn - moneyOut;
  const isPositive = netChange >= 0;
  const isHovering = hoverData != null;

  // Collapsed layout - all on one line, left-aligned
  if (collapsed) {
    return (
      <div className="flex items-center justify-start gap-10">
        {/* Net Change */}
        <div className="flex flex-col items-start">
          <span className="text-[12px] text-gray-500 mb-0.5">
            {isHovering ? 'Cumulative net' : 'Net change this month'}
          </span>
          <span className="text-[20px] font-semibold text-gray-900 tracking-[-0.01em]">
            {isPositive ? '' : '–'}{formatCurrency(netChange)}
          </span>
        </div>

        {/* Money In */}
        <div className="flex items-center gap-3">
          <div 
            className="w-[1.5px] h-[32px] rounded-full transition-all duration-150" 
            style={{ backgroundColor: '#0a5736' }}
          />
          <div className="flex flex-col items-start">
            <span className="text-[12px] text-gray-500 mb-0.5">{isHovering ? 'Cumulative in' : 'Money in'}</span>
            <span className="text-[16px] font-medium transition-all duration-150 tracking-[-0.01em]" style={{ color: '#0a5736' }}>
              {formatCurrency(moneyIn)}
            </span>
          </div>
        </div>

        {/* Money Out */}
        <div className="flex items-center gap-3">
          <div 
            className="w-[1.5px] h-[32px] rounded-full transition-all duration-150" 
            style={{ backgroundColor: '#d03275' }}
          />
          <div className="flex flex-col items-start">
            <span className="text-[12px] text-gray-500 mb-0.5">{isHovering ? 'Cumulative out' : 'Money out'}</span>
            <span className="text-[16px] font-medium transition-all duration-150 tracking-[-0.01em]" style={{ color: '#d03275' }}>
              –{formatCurrency(moneyOut)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Expanded layout - stacked
  return (
    <div className="flex flex-col justify-between h-full">
      {/* Net Change */}
      <div className="flex flex-col">
        <span className="text-[12px] text-gray-500 mb-1">
          {isHovering ? 'Cumulative net' : 'Net change this month'}
        </span>
        <span className="text-[24px] font-semibold text-gray-900 tracking-[-0.01em]">
          {isPositive ? '' : '–'}{formatCurrency(netChange)}
        </span>
      </div>

      {/* Money In & Money Out */}
      <div className="flex items-center gap-6">
        {/* Money In */}
        <div className="flex items-center gap-3">
          <div 
            className="w-[1.5px] h-[32px] rounded-full transition-all duration-150" 
            style={{ backgroundColor: '#0a5736' }}
          />
          <div className="flex flex-col">
            <span className="text-[12px] text-gray-500 mb-0.5">{isHovering ? 'Cumulative in' : 'Money in'}</span>
            <span className="text-[16px] font-medium transition-all duration-150 tracking-[-0.01em]" style={{ color: '#0a5736' }}>
              {formatCurrency(moneyIn)}
            </span>
          </div>
        </div>

        {/* Money Out */}
        <div className="flex items-center gap-3">
          <div 
            className="w-[1.5px] h-[32px] rounded-full transition-all duration-150" 
            style={{ backgroundColor: '#d03275' }}
          />
          <div className="flex flex-col">
            <span className="text-[12px] text-gray-500 mb-0.5">{isHovering ? 'Cumulative out' : 'Money out'}</span>
            <span className="text-[16px] font-medium transition-all duration-150 tracking-[-0.01em]" style={{ color: '#d03275' }}>
              –{formatCurrency(moneyOut)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsSummary;
