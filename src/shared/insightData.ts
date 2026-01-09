// =============================================================================
// Insight Detail Data
// =============================================================================
// Rich, detailed mock data for each insight that enables meaningful
// conversations when users click on insights from the /insights page.

import { MOCK_TRANSACTIONS, type Transaction } from './mockData'

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface InsightDetail {
  id: string
  title: string
  category: 'software' | 'credit' | 'revenue'
  
  // Summary for quick context
  summary: string
  
  // Detailed breakdown
  monthlyTrend: MonthlyTrendData[]
  
  // Related transactions
  relatedTransactions: Transaction[]
  
  // Key facts for the AI to share
  keyFacts: string[]
  
  // Recommendations
  recommendations: string[]
  
  // Breakdown by sub-category/merchant
  breakdown: BreakdownItem[]
}

export interface MonthlyTrendData {
  month: string
  amount: number
  percentChange?: number
}

export interface BreakdownItem {
  name: string
  amount: number
  percentage: number
  trend: 'up' | 'down' | 'stable'
}

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

function getMonthName(monthsAgo: number): string {
  const date = new Date()
  date.setMonth(date.getMonth() - monthsAgo)
  return date.toLocaleDateString('en-US', { month: 'long' })
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount))
}

// -----------------------------------------------------------------------------
// Insight 1: Software Spend Spike (Cursor focused)
// -----------------------------------------------------------------------------

function getSoftwareSpendInsight(): InsightDetail {
  const currentMonth = getMonthName(0)
  const lastMonth = getMonthName(1)
  const twoMonthsAgo = getMonthName(2)
  
  // Get all software-related transactions
  const softwareTransactions = MOCK_TRANSACTIONS.filter(
    t => t.category === 'Software & Subscriptions' && t.amount < 0
  )
  
  // Get Cursor-specific transactions
  const cursorTransactions = softwareTransactions.filter(
    t => t.counterparty === 'Cursor'
  )
  
  // Calculate totals by month
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  
  const getCursorSpendForMonth = (startDate: Date) => {
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)
    return cursorTransactions
      .filter(t => {
        const d = new Date(t.date)
        return d >= startDate && d < endDate
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }
  
  const currentMonthCursor = getCursorSpendForMonth(currentMonthStart)
  const lastMonthCursor = getCursorSpendForMonth(lastMonthStart)
  const twoMonthsAgoCursor = getCursorSpendForMonth(twoMonthsAgoStart)
  
  // Calculate software vendor breakdown
  const vendorSpend: Record<string, number> = {}
  const currentMonthEnd = new Date(currentMonthStart)
  currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1)
  
  softwareTransactions
    .filter(t => {
      const d = new Date(t.date)
      return d >= currentMonthStart && d < currentMonthEnd
    })
    .forEach(t => {
      vendorSpend[t.counterparty] = (vendorSpend[t.counterparty] || 0) + Math.abs(t.amount)
    })
  
  const totalSoftwareSpend = Object.values(vendorSpend).reduce((sum, v) => sum + v, 0)
  
  // Sort vendors by spend
  const breakdown: BreakdownItem[] = Object.entries(vendorSpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / totalSoftwareSpend) * 100),
      trend: name === 'Cursor' ? 'up' : 'stable' as const,
    }))
  
  return {
    id: '1',
    title: 'Spike in spend on software',
    category: 'software',
    
    summary: `Your Cursor subscription spend has been growing steadily over the past 3 months, increasing from ${formatCurrency(twoMonthsAgoCursor)} in ${twoMonthsAgo} to ${formatCurrency(currentMonthCursor)} in ${currentMonth}. This represents a 37% increase over the quarter.`,
    
    monthlyTrend: [
      { month: twoMonthsAgo, amount: twoMonthsAgoCursor },
      { month: lastMonth, amount: lastMonthCursor, percentChange: Math.round(((lastMonthCursor - twoMonthsAgoCursor) / twoMonthsAgoCursor) * 100) },
      { month: currentMonth, amount: currentMonthCursor, percentChange: Math.round(((currentMonthCursor - lastMonthCursor) / lastMonthCursor) * 100) },
    ],
    
    relatedTransactions: cursorTransactions.slice(0, 5),
    
    keyFacts: [
      `Cursor is now your #1 software expense at ${formatCurrency(currentMonthCursor)}/month`,
      `You've added approximately ${Math.round((currentMonthCursor - twoMonthsAgoCursor) / 20)} new team seats over 3 months`,
      `Total software spend this month: ${formatCurrency(totalSoftwareSpend)}`,
      `Cursor accounts for ${Math.round((currentMonthCursor / totalSoftwareSpend) * 100)}% of your software budget`,
    ],
    
    recommendations: [
      'Consider negotiating an annual plan discount with Cursor for 10-20% savings',
      'Review seat utilization to identify inactive users',
      'Compare usage patterns to ensure the team is getting value from the tool',
    ],
    
    breakdown,
  }
}

// -----------------------------------------------------------------------------
// Insight 2: Credit Card Spend Increase
// -----------------------------------------------------------------------------

function getCreditSpendInsight(): InsightDetail {
  const currentMonth = getMonthName(0)
  const lastMonth = getMonthName(1)
  const twoMonthsAgo = getMonthName(2)
  
  // Get all card transactions
  const cardTransactions = MOCK_TRANSACTIONS.filter(
    t => t.method === 'card' && t.amount < 0
  )
  
  // Calculate totals by month
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  
  const getCardSpendForMonth = (startDate: Date) => {
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)
    return cardTransactions
      .filter(t => {
        const d = new Date(t.date)
        return d >= startDate && d < endDate
      })
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }
  
  const currentMonthCard = getCardSpendForMonth(currentMonthStart)
  const lastMonthCard = getCardSpendForMonth(lastMonthStart)
  const twoMonthsAgoCard = getCardSpendForMonth(twoMonthsAgoStart)
  
  // Get spend by cardholder
  const cardholderSpend: Record<string, number> = {}
  const currentMonthEnd = new Date(currentMonthStart)
  currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1)
  
  cardTransactions
    .filter(t => {
      const d = new Date(t.date)
      return d >= currentMonthStart && d < currentMonthEnd
    })
    .forEach(t => {
      const holder = t.cardHolder || 'Unknown'
      cardholderSpend[holder] = (cardholderSpend[holder] || 0) + Math.abs(t.amount)
    })
  
  const totalCardSpend = Object.values(cardholderSpend).reduce((sum, v) => sum + v, 0)
  
  // Get spend by category
  const categorySpend: Record<string, number> = {}
  cardTransactions
    .filter(t => {
      const d = new Date(t.date)
      return d >= currentMonthStart && d < currentMonthEnd
    })
    .forEach(t => {
      const cat = t.category || 'Uncategorized'
      categorySpend[cat] = (categorySpend[cat] || 0) + Math.abs(t.amount)
    })
  
  // Sort categories by spend for breakdown
  const breakdown: BreakdownItem[] = Object.entries(categorySpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / totalCardSpend) * 100),
      trend: 'stable' as const,
    }))
  
  // Get top cardholders
  const topCardholders = Object.entries(cardholderSpend)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  
  return {
    id: '2',
    title: 'Increased Credit spend',
    category: 'credit',
    
    summary: `Credit card spend increased 8% from ${formatCurrency(lastMonthCard)} in ${lastMonth} to ${formatCurrency(currentMonthCard)} in ${currentMonth}. The increase is primarily driven by Travel & Transportation and Business Meals categories.`,
    
    monthlyTrend: [
      { month: twoMonthsAgo, amount: twoMonthsAgoCard },
      { month: lastMonth, amount: lastMonthCard, percentChange: lastMonthCard > 0 ? Math.round(((lastMonthCard - twoMonthsAgoCard) / (twoMonthsAgoCard || 1)) * 100) : 0 },
      { month: currentMonth, amount: currentMonthCard, percentChange: lastMonthCard > 0 ? Math.round(((currentMonthCard - lastMonthCard) / (lastMonthCard || 1)) * 100) : 0 },
    ],
    
    relatedTransactions: cardTransactions.slice(0, 10),
    
    keyFacts: [
      `Total card spend this month: ${formatCurrency(currentMonthCard)}`,
      `Top spender: ${topCardholders[0]?.[0] || 'Unknown'} at ${formatCurrency(topCardholders[0]?.[1] || 0)}`,
      `${breakdown[0]?.name || 'Unknown'} is the largest card expense category at ${breakdown[0]?.percentage || 0}%`,
      `Average transaction size: ${formatCurrency(currentMonthCard / Math.max(cardTransactions.filter(t => new Date(t.date) >= currentMonthStart).length, 1))}`,
    ],
    
    recommendations: [
      'Review Travel & Transportation spend - consider setting travel policies',
      'Look into corporate card rewards programs to maximize cashback',
      'Consider setting per-category limits for better budget control',
    ],
    
    breakdown,
  }
}

// -----------------------------------------------------------------------------
// Insight 3: Revenue Growth
// -----------------------------------------------------------------------------

function getRevenueGrowthInsight(): InsightDetail {
  const currentMonth = getMonthName(0)
  const lastMonth = getMonthName(1)
  const twoMonthsAgo = getMonthName(2)
  
  // Get all revenue transactions (positive amounts or Revenue category)
  const revenueTransactions = MOCK_TRANSACTIONS.filter(
    t => t.amount > 0 && (t.category === 'Revenue' || t.method === 'stripe' || t.method === 'wire' || t.method === 'invoice')
  )
  
  // Calculate totals by month
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const twoMonthsAgoStart = new Date(now.getFullYear(), now.getMonth() - 2, 1)
  
  const getRevenueForMonth = (startDate: Date) => {
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)
    return revenueTransactions
      .filter(t => {
        const d = new Date(t.date)
        return d >= startDate && d < endDate
      })
      .reduce((sum, t) => sum + t.amount, 0)
  }
  
  const currentMonthRevenue = getRevenueForMonth(currentMonthStart)
  const lastMonthRevenue = getRevenueForMonth(lastMonthStart)
  const twoMonthsAgoRevenue = getRevenueForMonth(twoMonthsAgoStart)
  
  // Get revenue by source
  const sourceRevenue: Record<string, number> = {}
  const currentMonthEnd = new Date(currentMonthStart)
  currentMonthEnd.setMonth(currentMonthEnd.getMonth() + 1)
  
  revenueTransactions
    .filter(t => {
      const d = new Date(t.date)
      return d >= currentMonthStart && d < currentMonthEnd
    })
    .forEach(t => {
      // Group by method/source
      let source = t.counterparty
      if (t.method === 'stripe') source = 'Stripe'
      else if (t.method === 'invoice') source = 'Invoices'
      else if (t.method === 'wire') source = 'Wire Transfers'
      
      sourceRevenue[source] = (sourceRevenue[source] || 0) + t.amount
    })
  
  const totalRevenue = Object.values(sourceRevenue).reduce((sum, v) => sum + v, 0)
  
  // Sort sources by revenue for breakdown
  const breakdown: BreakdownItem[] = Object.entries(sourceRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, amount]) => ({
      name,
      amount,
      percentage: totalRevenue > 0 ? Math.round((amount / totalRevenue) * 100) : 0,
      trend: 'up' as const,
    }))
  
  // Get top customers
  const customerRevenue: Record<string, number> = {}
  revenueTransactions
    .filter(t => {
      const d = new Date(t.date)
      return d >= currentMonthStart && d < currentMonthEnd
    })
    .forEach(t => {
      const customer = t.counterparty.replace('Payment from ', '')
      customerRevenue[customer] = (customerRevenue[customer] || 0) + t.amount
    })
  
  const topCustomers = Object.entries(customerRevenue)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
  
  return {
    id: '3',
    title: '12% revenue growth',
    category: 'revenue',
    
    summary: `Revenue grew 12% from ${formatCurrency(lastMonthRevenue)} in ${lastMonth} to ${formatCurrency(currentMonthRevenue)} in ${currentMonth}. Stripe payments continue to be your primary revenue source, with strong contributions from enterprise wire transfers.`,
    
    monthlyTrend: [
      { month: twoMonthsAgo, amount: twoMonthsAgoRevenue },
      { month: lastMonth, amount: lastMonthRevenue, percentChange: twoMonthsAgoRevenue > 0 ? Math.round(((lastMonthRevenue - twoMonthsAgoRevenue) / twoMonthsAgoRevenue) * 100) : 0 },
      { month: currentMonth, amount: currentMonthRevenue, percentChange: lastMonthRevenue > 0 ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0 },
    ],
    
    relatedTransactions: revenueTransactions.slice(0, 10),
    
    keyFacts: [
      `Total revenue this month: ${formatCurrency(currentMonthRevenue)}`,
      `Top revenue source: ${breakdown[0]?.name || 'Unknown'} at ${formatCurrency(breakdown[0]?.amount || 0)}`,
      `Top customer: ${topCustomers[0]?.[0] || 'Unknown'} at ${formatCurrency(topCustomers[0]?.[1] || 0)}`,
      `Revenue is up ${lastMonthRevenue > 0 ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0}% month-over-month`,
    ],
    
    recommendations: [
      'Consider upselling existing customers to increase average revenue',
      'Focus on converting enterprise leads to wire payment customers',
      'Track Stripe fees to optimize payment processing costs',
    ],
    
    breakdown,
  }
}

// -----------------------------------------------------------------------------
// Main Export Functions
// -----------------------------------------------------------------------------

/**
 * Get insight detail by ID
 */
export function getInsightById(id: string): InsightDetail | null {
  switch (id) {
    case '1':
      return getSoftwareSpendInsight()
    case '2':
      return getCreditSpendInsight()
    case '3':
      return getRevenueGrowthInsight()
    default:
      return null
  }
}

/**
 * Get insight detail by title (fuzzy match)
 */
export function getInsightByTitle(title: string): InsightDetail | null {
  const normalizedTitle = title.toLowerCase()
  
  if (normalizedTitle.includes('software') || normalizedTitle.includes('cursor')) {
    return getSoftwareSpendInsight()
  }
  if (normalizedTitle.includes('credit') || normalizedTitle.includes('card')) {
    return getCreditSpendInsight()
  }
  if (normalizedTitle.includes('revenue') || normalizedTitle.includes('growth')) {
    return getRevenueGrowthInsight()
  }
  
  return null
}

/**
 * Get all insight details
 */
export function getAllInsights(): InsightDetail[] {
  return [
    getSoftwareSpendInsight(),
    getCreditSpendInsight(),
    getRevenueGrowthInsight(),
  ]
}

/**
 * Format insight for chat context (provides rich data for Claude to use)
 */
export function formatInsightForChat(insight: InsightDetail): string {
  const transactionList = insight.relatedTransactions
    .slice(0, 5)
    .map(t => `  - ${t.date}: ${t.counterparty} - ${t.amount < 0 ? '-' : '+'}${formatCurrency(t.amount)}`)
    .join('\n')
  
  const trendInfo = insight.monthlyTrend
    .map(m => `  - ${m.month}: ${formatCurrency(m.amount)}${m.percentChange !== undefined ? ` (${m.percentChange > 0 ? '+' : ''}${m.percentChange}%)` : ''}`)
    .join('\n')
  
  const breakdownInfo = insight.breakdown
    .map(b => `  - ${b.name}: ${formatCurrency(b.amount)} (${b.percentage}%)`)
    .join('\n')
  
  return `
## ${insight.title}

### Summary
${insight.summary}

### Monthly Trend
${trendInfo}

### Key Facts
${insight.keyFacts.map(f => `- ${f}`).join('\n')}

### Breakdown
${breakdownInfo}

### Recent Transactions
${transactionList}

### Recommendations
${insight.recommendations.map(r => `- ${r}`).join('\n')}
`.trim()
}

