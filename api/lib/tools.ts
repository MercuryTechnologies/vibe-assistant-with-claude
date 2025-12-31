// =============================================================================
// Mercury Agent Tools
// =============================================================================
// Tool definitions for Claude to use when processing user requests

/**
 * All tools available to the Mercury Agent
 * These follow the Anthropic tool schema format
 */
export const MERCURY_TOOLS = [
  // -------------------------------------------------------------------------
  // Data Query Tools
  // -------------------------------------------------------------------------
  {
    name: 'get_accounts',
    description: 'Get all bank accounts for the organization. Returns checking and savings accounts with balances.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_account_details',
    description: 'Get details for a specific bank account by ID.',
    input_schema: {
      type: 'object',
      properties: {
        account_id: {
          type: 'string',
          description: 'The UUID of the account to retrieve'
        }
      },
      required: ['account_id']
    }
  },
  {
    name: 'search_transactions',
    description: 'Search and filter transactions. Can filter by counterparty name, amount range, status, type, and date range.',
    input_schema: {
      type: 'object',
      properties: {
        counterparty_name: {
          type: 'string',
          description: 'Filter by counterparty name (partial match)'
        },
        min_amount: {
          type: 'number',
          description: 'Minimum absolute amount'
        },
        max_amount: {
          type: 'number',
          description: 'Maximum absolute amount'
        },
        status: {
          type: 'string',
          enum: ['pending', 'sent', 'cancelled', 'failed'],
          description: 'Filter by transaction status'
        },
        kind: {
          type: 'string',
          description: 'Filter by transaction type (e.g., externalTransfer, debitCardTransaction)'
        },
        start_date: {
          type: 'string',
          description: 'Start date for date range filter (ISO 8601)'
        },
        end_date: {
          type: 'string',
          description: 'End date for date range filter (ISO 8601)'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default 20)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_transaction_details',
    description: 'Get full details for a specific transaction by ID.',
    input_schema: {
      type: 'object',
      properties: {
        transaction_id: {
          type: 'string',
          description: 'The UUID of the transaction'
        }
      },
      required: ['transaction_id']
    }
  },
  {
    name: 'get_recipients',
    description: 'Get all payment recipients. Can optionally filter by status.',
    input_schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          enum: ['active', 'inactive'],
          description: 'Filter by recipient status'
        }
      },
      required: []
    }
  },
  {
    name: 'search_recipients',
    description: 'Search for recipients by name.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Name to search for (partial match)'
        }
      },
      required: ['name']
    }
  },
  {
    name: 'get_cards',
    description: 'Get all debit/credit cards for the organization.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_organization',
    description: 'Get organization details including legal name and EIN.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'get_categories',
    description: 'Get all expense categories for categorizing transactions.',
    input_schema: {
      type: 'object',
      properties: {},
      required: []
    }
  },

  // -------------------------------------------------------------------------
  // Navigation Tools
  // -------------------------------------------------------------------------
  {
    name: 'navigate_to_page',
    description: 'Navigate the user to a specific page in the Mercury dashboard. Use this when the user wants to go to a specific section.',
    input_schema: {
      type: 'object',
      properties: {
        page: {
          type: 'string',
          enum: ['home', 'dashboard', 'accounts', 'transactions', 'insights', 'cards', 'payments', 'send-money', 'tasks', 'bill-pay', 'invoicing', 'accounting'],
          description: 'The page to navigate to'
        },
        account_id: {
          type: 'string',
          description: 'Optional: specific account ID to navigate to'
        },
        transaction_id: {
          type: 'string',
          description: 'Optional: specific transaction ID to navigate to'
        }
      },
      required: ['page']
    }
  },

  // -------------------------------------------------------------------------
  // Form Pre-fill Tools
  // -------------------------------------------------------------------------
  {
    name: 'prefill_payment_form',
    description: 'Pre-fill the payment form with recipient and amount information, then navigate the user to complete the payment.',
    input_schema: {
      type: 'object',
      properties: {
        recipient_id: {
          type: 'string',
          description: 'UUID of the recipient'
        },
        recipient_name: {
          type: 'string',
          description: 'Name of recipient to search for (used if recipient_id not provided)'
        },
        amount: {
          type: 'number',
          description: 'Payment amount in dollars'
        },
        memo: {
          type: 'string',
          description: 'Payment memo/description'
        },
        payment_method: {
          type: 'string',
          enum: ['ach', 'wire', 'check'],
          description: 'Payment method'
        }
      },
      required: []
    }
  },
  {
    name: 'prefill_card_form',
    description: 'Pre-fill the new card request form.',
    input_schema: {
      type: 'object',
      properties: {
        cardholder_name: {
          type: 'string',
          description: 'Name of the cardholder'
        },
        card_type: {
          type: 'string',
          enum: ['physical', 'virtual'],
          description: 'Type of card'
        },
        spending_limit: {
          type: 'number',
          description: 'Monthly spending limit'
        }
      },
      required: []
    }
  },
  {
    name: 'prefill_user_invite',
    description: 'Pre-fill the user invitation form.',
    input_schema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address of the user to invite'
        },
        role: {
          type: 'string',
          enum: ['admin', 'member', 'viewer'],
          description: 'Role to assign to the user'
        },
        name: {
          type: 'string',
          description: 'Name of the user'
        }
      },
      required: []
    }
  },
  {
    name: 'prefill_recipient_form',
    description: 'Pre-fill the new recipient form.',
    input_schema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Recipient name'
        },
        email: {
          type: 'string',
          description: 'Recipient email'
        },
        payment_method: {
          type: 'string',
          enum: ['ach', 'wire', 'check'],
          description: 'Default payment method'
        },
        account_number: {
          type: 'string',
          description: 'Bank account number'
        },
        routing_number: {
          type: 'string',
          description: 'Bank routing number'
        }
      },
      required: []
    }
  },

  // -------------------------------------------------------------------------
  // Action Tools
  // -------------------------------------------------------------------------
  {
    name: 'freeze_card',
    description: 'Freeze a card to temporarily disable it. The user can unfreeze it later.',
    input_schema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'UUID of the card to freeze'
        },
        card_last_four: {
          type: 'string',
          description: 'Last 4 digits of the card (used if card_id not provided)'
        },
        cardholder_name: {
          type: 'string',
          description: 'Name on the card (used if card_id not provided)'
        }
      },
      required: []
    }
  },
  {
    name: 'unfreeze_card',
    description: 'Unfreeze a previously frozen card to re-enable it.',
    input_schema: {
      type: 'object',
      properties: {
        card_id: {
          type: 'string',
          description: 'UUID of the card to unfreeze'
        },
        card_last_four: {
          type: 'string',
          description: 'Last 4 digits of the card (used if card_id not provided)'
        }
      },
      required: []
    }
  },
  {
    name: 'update_transaction_note',
    description: 'Update the note/memo on a transaction.',
    input_schema: {
      type: 'object',
      properties: {
        transaction_id: {
          type: 'string',
          description: 'UUID of the transaction'
        },
        note: {
          type: 'string',
          description: 'New note text'
        }
      },
      required: ['transaction_id', 'note']
    }
  },
  {
    name: 'update_transaction_category',
    description: 'Update the category of a transaction.',
    input_schema: {
      type: 'object',
      properties: {
        transaction_id: {
          type: 'string',
          description: 'UUID of the transaction'
        },
        category_id: {
          type: 'string',
          description: 'UUID of the category'
        },
        category_name: {
          type: 'string',
          description: 'Name of the category (used if category_id not provided)'
        }
      },
      required: ['transaction_id']
    }
  },

  // -------------------------------------------------------------------------
  // Support Handoff
  // -------------------------------------------------------------------------
  {
    name: 'handoff_to_support',
    description: 'Transfer the conversation to human support. Use this when the user has a complaint, dispute, compliance question, or explicitly asks for human help.',
    input_schema: {
      type: 'object',
      properties: {
        reason: {
          type: 'string',
          description: 'Reason for the handoff'
        },
        category: {
          type: 'string',
          enum: ['complaint', 'dispute', 'compliance', 'technical', 'other'],
          description: 'Category of the support request'
        },
        urgency: {
          type: 'string',
          enum: ['low', 'medium', 'high'],
          description: 'Urgency level'
        }
      },
      required: ['reason']
    }
  }
]

