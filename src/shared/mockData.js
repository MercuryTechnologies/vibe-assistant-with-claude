// =============================================================================
// Shared Mock Data
// =============================================================================
// This data is used by both the frontend TransactionsPage and the chat agent
// to ensure consistency across the app.

// Merchants/Counterparties
const merchants = [
  { name: 'AWS', initials: 'AW', category: 'Software & Subscriptions' },
  { name: 'Google Cloud', initials: 'GC', category: 'Software & Subscriptions' },
  { name: 'Stripe', initials: 'S', category: 'Revenue' },
  { name: 'Shopify', initials: 'SH', category: 'Revenue' },
  { name: 'Gusto', initials: 'G', category: 'Payroll' },
  { name: 'Rippling', initials: 'R', category: 'Payroll' },
  { name: 'Slack', initials: 'SL', category: 'Software & Subscriptions' },
  { name: 'Figma', initials: 'FI', category: 'Software & Subscriptions' },
  { name: 'Notion', initials: 'N', category: 'Software & Subscriptions' },
  { name: 'Vercel', initials: 'V', category: 'Software & Subscriptions' },
  { name: 'GitHub', initials: 'GH', category: 'Software & Subscriptions' },
  { name: 'Linear', initials: 'LN', category: 'Software & Subscriptions' },
  { name: 'OpenAI', initials: 'OA', category: 'Software & Subscriptions' },
  { name: 'Anthropic', initials: 'AN', category: 'Software & Subscriptions' },
  { name: 'WeWork', initials: 'WW', category: 'Rent & Utilities' },
  { name: 'PG&E', initials: 'PG', category: 'Rent & Utilities' },
  { name: 'Comcast Business', initials: 'CB', category: 'Rent & Utilities' },
  { name: 'Delta Airlines', initials: 'DA', category: 'Travel & Transportation' },
  { name: 'United Airlines', initials: 'UA', category: 'Travel & Transportation' },
  { name: 'Uber', initials: 'UB', category: 'Travel & Transportation' },
  { name: 'Lyft', initials: 'LY', category: 'Travel & Transportation' },
  { name: 'Blue Bottle Coffee', initials: 'BB', category: 'Business Meals' },
  { name: 'Sweetgreen', initials: 'SG', category: 'Business Meals' },
  { name: "Lily's Eatery", initials: 'LE', category: 'Business Meals' },
  { name: 'Office Depot', initials: 'OD', category: 'Office Supplies & Equipment' },
  { name: 'Apple', initials: 'AP', category: 'Office Supplies & Equipment' },
  { name: 'Best Buy', initials: 'BB', category: 'Office Supplies & Equipment' },
  { name: 'Acme Corp', initials: 'AC', category: 'Revenue' },
  { name: 'TechStart Inc', initials: 'TS', category: 'Revenue' },
  { name: 'GlobalTech Solutions', initials: 'GT', category: 'Revenue' },
  { name: 'Mercury Working Capital', initials: 'M', icon: 'mercury', category: 'Credit & Loan Payments' },
];

const accounts = [
  { id: 'acct-1', name: 'Mercury Checking', balance: 2459832.17, type: 'checking', accountNumber: '****4521' },
  { id: 'acct-2', name: 'Mercury Savings', balance: 500000.00, type: 'savings', accountNumber: '****8834' },
  { id: 'acct-3', name: 'Ops / Payroll', balance: 145000.00, type: 'checking', accountNumber: '****2211' },
  { id: 'acct-4', name: 'Treasury', balance: 1200000.00, type: 'savings', accountNumber: '****9900' },
];

const cards = [
  { id: 'card-1', name: 'Sarah Chen', last4: '4532', status: 'active', limit: 25000, spent: 12450 },
  { id: 'card-2', name: 'John Smith', last4: '7891', status: 'active', limit: 15000, spent: 3200 },
  { id: 'card-3', name: 'Jane Baker', last4: '1234', status: 'active', limit: 10000, spent: 8900 },
  { id: 'card-4', name: 'Mike Johnson', last4: '5555', status: 'frozen', limit: 5000, spent: 0 },
];

// Generate dates for the last 90 days
function getRecentDates(days = 90) {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    dates.push(d.toISOString().split('T')[0]);
  }
  return dates;
}

// Seeded random for consistent data
function seededRandom(seed) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

// Generate consistent transactions
function generateTransactions() {
  const transactions = [];
  const dates = getRecentDates(90);
  let seed = 12345; // Fixed seed for consistency
  
  // Recurring transactions (predictable)
  const recurring = [
    { merchant: 'AWS', amount: -2847.32, day: 1, account: 'Mercury Checking', method: 'ach' },
    { merchant: 'Google Cloud', amount: -1243.50, day: 1, account: 'Mercury Checking', method: 'ach' },
    { merchant: 'Slack', amount: -1250.00, day: 1, account: 'Mercury Checking', method: 'card', cardHolder: 'Sarah Chen', cardLast4: '4532' },
    { merchant: 'Gusto', amount: -89500.00, day: 15, account: 'Ops / Payroll', method: 'ach', description: 'Payroll' },
    { merchant: 'Gusto', amount: -89500.00, day: 30, account: 'Ops / Payroll', method: 'ach', description: 'Payroll' },
    { merchant: 'WeWork', amount: -15000.00, day: 1, account: 'Mercury Checking', method: 'ach', description: 'Office rent' },
    { merchant: 'Figma', amount: -450.00, day: 5, account: 'Mercury Checking', method: 'card', cardHolder: 'Sarah Chen', cardLast4: '4532' },
    { merchant: 'GitHub', amount: -525.00, day: 7, account: 'Mercury Checking', method: 'card', cardHolder: 'John Smith', cardLast4: '7891' },
    { merchant: 'Notion', amount: -960.00, day: 10, account: 'Mercury Checking', method: 'card', cardHolder: 'Sarah Chen', cardLast4: '4532' },
    { merchant: 'OpenAI', amount: -2100.00, day: 12, account: 'Mercury Checking', method: 'card', cardHolder: 'Sarah Chen', cardLast4: '4532' },
    { merchant: 'Vercel', amount: -320.00, day: 15, account: 'Mercury Checking', method: 'card', cardHolder: 'John Smith', cardLast4: '7891' },
  ];
  
  // Add recurring transactions for each month
  let txnId = 1;
  for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
    for (const r of recurring) {
      const date = new Date();
      date.setMonth(date.getMonth() - monthOffset);
      date.setDate(Math.min(r.day, 28)); // Avoid invalid dates
      
      if (date <= new Date()) {
        const merchantData = merchants.find(m => m.name === r.merchant) || { name: r.merchant, initials: r.merchant[0] };
        transactions.push({
          id: `txn-${txnId++}`,
          date: date.toISOString().split('T')[0],
          counterparty: merchantData.name,
          counterpartyInitials: merchantData.initials,
          amount: r.amount,
          account: r.account,
          method: r.method,
          cardHolder: r.cardHolder,
          cardLast4: r.cardLast4,
          category: merchantData.category,
          description: r.description || null,
          status: 'completed',
        });
      }
    }
  }
  
  // Add revenue transactions (incoming)
  const revenueClients = ['Stripe', 'Acme Corp', 'TechStart Inc', 'GlobalTech Solutions', 'Shopify'];
  for (let i = 0; i < 25; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(seededRandom(seed++) * 60));
    const client = revenueClients[Math.floor(seededRandom(seed++) * revenueClients.length)];
    const merchantData = merchants.find(m => m.name === client);
    const amount = Math.round((5000 + seededRandom(seed++) * 45000) * 100) / 100;
    
    transactions.push({
      id: `txn-${txnId++}`,
      date: date.toISOString().split('T')[0],
      counterparty: client,
      counterpartyInitials: merchantData?.initials || client[0],
      amount: amount, // Positive = incoming
      account: 'Mercury Checking',
      method: client === 'Stripe' ? 'stripe' : 'wire',
      category: 'Revenue',
      description: client === 'Stripe' ? 'Stripe payout' : `Payment from ${client}`,
      status: 'completed',
    });
  }
  
  // Add miscellaneous card transactions
  const miscMerchants = ['Blue Bottle Coffee', 'Sweetgreen', "Lily's Eatery", 'Uber', 'Lyft', 'Office Depot', 'Apple', 'Best Buy'];
  for (let i = 0; i < 40; i++) {
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(seededRandom(seed++) * 45));
    const merchant = miscMerchants[Math.floor(seededRandom(seed++) * miscMerchants.length)];
    const merchantData = merchants.find(m => m.name === merchant);
    const cardIndex = Math.floor(seededRandom(seed++) * 3); // First 3 cards are active
    const card = cards[cardIndex];
    const amount = -Math.round((10 + seededRandom(seed++) * 500) * 100) / 100;
    
    transactions.push({
      id: `txn-${txnId++}`,
      date: date.toISOString().split('T')[0],
      counterparty: merchant,
      counterpartyInitials: merchantData?.initials || merchant[0],
      amount: amount,
      account: 'Mercury Checking',
      method: 'card',
      cardHolder: card.name,
      cardLast4: card.last4,
      category: merchantData?.category,
      status: 'completed',
    });
  }
  
  // Add a few recent specific transactions for demo purposes
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  
  transactions.push({
    id: `txn-${txnId++}`,
    date: yesterday.toISOString().split('T')[0],
    counterparty: 'AWS',
    counterpartyInitials: 'AW',
    amount: -3421.89,
    account: 'Mercury Checking',
    method: 'ach',
    category: 'Software & Subscriptions',
    description: 'AWS usage charges - December',
    status: 'completed',
  });
  
  transactions.push({
    id: `txn-${txnId++}`,
    date: today.toISOString().split('T')[0],
    counterparty: 'Stripe',
    counterpartyInitials: 'S',
    amount: 28450.00,
    account: 'Mercury Checking',
    method: 'stripe',
    category: 'Revenue',
    description: 'Stripe payout - Weekly',
    status: 'completed',
  });
  
  transactions.push({
    id: `txn-${txnId++}`,
    date: twoDaysAgo.toISOString().split('T')[0],
    counterparty: 'Delta Airlines',
    counterpartyInitials: 'DA',
    amount: -1847.50,
    account: 'Mercury Checking',
    method: 'card',
    cardHolder: 'Sarah Chen',
    cardLast4: '4532',
    category: 'Travel & Transportation',
    description: 'Flight to NYC - Team offsite',
    status: 'completed',
  });
  
  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  return transactions;
}

// Generate the data once
const MOCK_TRANSACTIONS = generateTransactions();

// Search transactions
function searchTransactions(query, limit = 10) {
  const q = (query || '').toLowerCase();
  
  let results = MOCK_TRANSACTIONS;
  
  if (q) {
    results = MOCK_TRANSACTIONS.filter(txn => {
      return (
        txn.counterparty.toLowerCase().includes(q) ||
        (txn.description && txn.description.toLowerCase().includes(q)) ||
        (txn.category && txn.category.toLowerCase().includes(q)) ||
        (txn.cardHolder && txn.cardHolder.toLowerCase().includes(q))
      );
    });
  }
  
  return results.slice(0, limit);
}

// Get transaction by ID
function getTransactionById(id) {
  return MOCK_TRANSACTIONS.find(txn => txn.id === id);
}

// Get transactions summary
function getTransactionsSummary() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const recentTxns = MOCK_TRANSACTIONS.filter(txn => new Date(txn.date) >= thirtyDaysAgo);
  
  const moneyIn = recentTxns.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const moneyOut = recentTxns.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  return {
    last30Days: {
      moneyIn,
      moneyOut,
      netChange: moneyIn - moneyOut,
      transactionCount: recentTxns.length,
    }
  };
}

// Get insights page data (cashflow, balances, trends)
function getInsightsData() {
  const summary = getTransactionsSummary();
  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);
  
  // Calculate category breakdown for last 30 days
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const recentTxns = MOCK_TRANSACTIONS.filter(txn => new Date(txn.date) >= thirtyDaysAgo);
  
  const categoryBreakdown = {};
  recentTxns.filter(t => t.amount < 0).forEach(t => {
    const cat = t.category || 'Uncategorized';
    categoryBreakdown[cat] = (categoryBreakdown[cat] || 0) + Math.abs(t.amount);
  });
  
  // Sort by amount descending
  const topCategories = Object.entries(categoryBreakdown)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, amount]) => ({ category, amount }));
  
  // Calculate net cashflow trend (positive = more money in than out)
  const netCashflow = summary.last30Days.moneyIn - summary.last30Days.moneyOut;
  const cashflowTrend = netCashflow > 0 ? 'positive' : netCashflow < -10000 ? 'negative' : 'neutral';
  
  return {
    totalBalance,
    cashflow: {
      moneyIn: summary.last30Days.moneyIn,
      moneyOut: summary.last30Days.moneyOut,
      netChange: netCashflow,
      trend: cashflowTrend,
      period: 'last 30 days',
    },
    accounts: accounts.map(a => ({ name: a.name, balance: a.balance, type: a.type })),
    topSpendingCategories: topCategories,
    transactionCount: summary.last30Days.transactionCount,
  };
}

// Get wire transactions
function getWireTransactions(limit = 20) {
  return MOCK_TRANSACTIONS
    .filter(txn => txn.method === 'wire')
    .slice(0, limit);
}

// Filter transactions by type
function filterTransactionsByType(type, limit = 50) {
  const typeMapping = {
    'wire': ['wire'],
    'ach': ['ach'],
    'card': ['card'],
    'stripe': ['stripe'],
  };
  
  const methods = typeMapping[type.toLowerCase()] || [type.toLowerCase()];
  
  return MOCK_TRANSACTIONS
    .filter(txn => methods.includes(txn.method))
    .slice(0, limit);
}

// Export for CommonJS (setupProxy.js)
module.exports = {
  merchants,
  accounts,
  cards,
  MOCK_TRANSACTIONS,
  searchTransactions,
  getTransactionById,
  getTransactionsSummary,
  getInsightsData,
  getWireTransactions,
  filterTransactionsByType,
};

