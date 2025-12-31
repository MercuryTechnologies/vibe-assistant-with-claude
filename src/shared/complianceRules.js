/**
 * Mercury Copy/Compliance Rules
 * These rules MUST be followed by all agent responses.
 * Based on "Copy that Complies" guidelines.
 */

const COMPLIANCE_RULES = {
  // Core identity rules
  identity: {
    notABank: true,
    description: "Mercury is a fintech company, NOT a bank. Banking services are provided through our partner banks.",
    requiredDisclosure: "Mercury is a fintech company, not a bank. Banking services provided through Choice Financial Group, Column N.A., and Evolve Bank & Trust, Members FDIC.",
  },

  // Words and phrases to NEVER use
  prohibitedPhrases: [
    "Mercury Bank",
    "Mercury is a bank",
    "our bank",
    "the bank",
    "bank account", // Use "Mercury account" instead
    "open a bank account",
    "banking built for", // Use "banking* for" with disclosure
    "we guarantee",
    "guaranteed returns",
    "will definitely",
    "unlimited cards", // There are limits
    "free" // without specifying what's free
  ],

  // Approved alternatives
  approvedAlternatives: {
    "bank account": "Mercury account",
    "open a bank account": "apply for a Mercury account",
    "Mercury Bank": "Mercury",
    "banking built for startups": "banking* for startups", // requires disclosure
    "open an account": "apply for an account",
    "unlimited cards": "multiple cards",
  },

  // Future predictions - NEVER allowed
  futurePredictions: {
    prohibited: true,
    description: "Never predict the future or make guarantees. Only describe existing Mercury product functionality.",
    examples: [
      "Your balance will grow to...",
      "You'll definitely see...",
      "The market will...",
      "Your investment will return...",
      "We predict...",
      "This will happen..."
    ]
  },

  // Required context for trigger words
  triggerWords: {
    "banking": {
      requiresDisclosure: true,
      disclosure: "Mercury is a fintech company, not a bank. Banking services provided through our partner banks."
    },
    "deposit": {
      requiresDisclosure: true,
      note: "Must clarify deposits are through partner banks"
    },
    "checking": {
      requiresDisclosure: true,
      note: "Accounts provided through partner banks"
    },
    "savings": {
      requiresDisclosure: true,
      note: "Accounts provided through partner banks"
    },
    "FDIC": {
      requiresDisclosure: true,
      disclosure: "FDIC insurance applies to deposits held at our partner banks."
    },
    "debit card": {
      note: "Issued by Choice Financial Group and Column N.A., Members FDIC, pursuant to licenses from Mastercard®"
    },
    "IO card": {
      note: "Issued by Patriot Bank, Member FDIC, pursuant to a license from Mastercard®"
    }
  },

  // Subjective language guidelines
  subjectiveLanguage: {
    avoid: ["best", "cheapest", "fastest", "guaranteed", "always", "never", "perfect"],
    note: "Use factual, verifiable claims only"
  },

  // What we CAN say
  approvedStatements: [
    "Mercury is a fintech company",
    "Apply for a Mercury account",
    "Your Mercury account",
    "Banking services through our partner banks",
    "Access your accounts",
    "View your transactions",
    "Send payments",
    "Manage your cards"
  ]
};

// System prompt addition for compliance
const COMPLIANCE_PROMPT = `
CRITICAL COMPLIANCE RULES - YOU MUST FOLLOW THESE:

1. IDENTITY: Mercury is a FINTECH COMPANY, not a bank. 
   - NEVER say "Mercury Bank" or "our bank" or "the bank"
   - NEVER say "bank account" - say "Mercury account" instead
   - If discussing banking services, clarify they're provided through partner banks

2. NO FUTURE PREDICTIONS:
   - NEVER predict future outcomes, returns, or market behavior
   - NEVER guarantee results or make promises about the future
   - Only describe existing Mercury product functionality as it works TODAY
   - Don't say "will definitely", "guaranteed to", "you'll see returns of"

3. APPROVED LANGUAGE:
   - Say "Mercury account" not "bank account"
   - Say "apply for an account" not "open a bank account"
   - Say "Mercury" not "Mercury Bank"
   - Be factual, not subjective ("low fees" not "the lowest fees")

4. WHEN ASKED ABOUT:
   - Investment advice → "I can show you Mercury's features, but for investment advice please consult a financial advisor"
   - Future predictions → "I can't predict future outcomes, but I can show you how [feature] works today"
   - Legal/tax questions → "For specific legal or tax guidance, please consult a qualified professional"
`;

// Function to check if a response contains prohibited content
function checkCompliance(text) {
  const issues = [];
  const lowerText = text.toLowerCase();
  
  // Check prohibited phrases
  for (const phrase of COMPLIANCE_RULES.prohibitedPhrases) {
    if (lowerText.includes(phrase.toLowerCase())) {
      issues.push({
        type: 'prohibited_phrase',
        phrase: phrase,
        suggestion: COMPLIANCE_RULES.approvedAlternatives[phrase] || 'Remove or rephrase'
      });
    }
  }
  
  // Check for future prediction language
  const futurePredictionPatterns = [
    /will definitely/i,
    /guaranteed to/i,
    /you'll see returns/i,
    /we predict/i,
    /the market will/i,
    /your investment will/i,
    /you will earn/i,
    /expect to see/i,
    /will grow to/i
  ];
  
  for (const pattern of futurePredictionPatterns) {
    if (pattern.test(text)) {
      issues.push({
        type: 'future_prediction',
        pattern: pattern.toString(),
        suggestion: 'Describe current functionality only'
      });
    }
  }
  
  return {
    isCompliant: issues.length === 0,
    issues: issues
  };
}

module.exports = {
  COMPLIANCE_RULES,
  COMPLIANCE_PROMPT,
  checkCompliance
};

