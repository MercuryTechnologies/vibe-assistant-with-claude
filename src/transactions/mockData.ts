// =============================================================================
// Transactions Mock Data
// =============================================================================
// This file re-exports from the shared mock data for backward compatibility.
// The single source of truth is src/shared/mockData.ts

// Re-export types
export type { LegacyTransaction as Transaction, AlertType, TransactionAlert } from '../shared/mockData'

// Re-export everything needed from shared
export { 
  getLegacyTransactions,
  toLegacyFormat,
  fromLegacyFormat,
  lineChartData,
  glCodeOptions,
  getSummaryData,
  MOCK_TRANSACTIONS,
} from '../shared/mockData'

// Bar chart data for To/From breakdown
export const barChartData = [
  { name: 'Mercury Savi...', value: 65000 },
  { name: 'AR', value: 58000 },
  { name: 'Jameson Acco...', value: 45000 },
  { name: 'Google', value: 38000 },
  { name: 'Treasury', value: 33000 },
]
