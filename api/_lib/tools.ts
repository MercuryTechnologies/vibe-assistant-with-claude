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
          enum: ['wire', 'domesticWire', 'internationalWire', 'externalTransfer', 'debitCardTransaction', 'creditCardTransaction', 'ach'],
          description: 'Filter by transaction type. Use "wire" to get both domestic and international wire transfers.'
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
  {
    name: 'get_insights_data',
    description: 'Get cashflow insights and financial summary for a time period. Returns money in, money out, net change, trend direction, and spending breakdown by category. Use this when users ask about their cashflow, spending patterns, or financial overview.',
    input_schema: {
      type: 'object',
      properties: {
        period: {
          type: 'string',
          enum: ['current_month', 'last_month', 'last_30_days', 'last_90_days', 'ytd'],
          description: 'Time period for the insights data (default: current_month)'
        }
      },
      required: []
    }
  },
  {
    name: 'get_top_transactions',
    description: 'Get the top/biggest transactions by amount. Use this when users ask about their biggest expenses, largest payments, or top transactions. Returns a formatted table of transactions.',
    input_schema: {
      type: 'object',
      properties: {
        direction: {
          type: 'string',
          enum: ['out', 'in', 'all'],
          description: 'Filter by money direction: "out" for expenses/payments, "in" for income/deposits, "all" for both. Default is "out" for expense queries.'
        },
        limit: {
          type: 'number',
          description: 'Number of transactions to return (default: 5, max: 10)'
        },
        period: {
          type: 'string',
          enum: ['last_7_days', 'last_30_days', 'last_month', 'last_90_days'],
          description: 'Time period to search within (default: last_30_days)'
        }
      },
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
  },

  // -------------------------------------------------------------------------
  // Agentic Card Issuance Tools
  // -------------------------------------------------------------------------
  {
    name: 'get_employees',
    description: 'Get all employees in the organization with their names, emails, departments, and salaries. Use this when the user wants to issue cards to employees or see employee information.',
    input_schema: {
      type: 'object',
      properties: {
        department: {
          type: 'string',
          description: 'Optional: filter by department name'
        },
        has_card: {
          type: 'boolean',
          description: 'Optional: filter by whether employee already has a card'
        }
      },
      required: []
    }
  },
  {
    name: 'search_employees',
    description: 'Search for employees by name. Returns matching employees. If multiple employees match, you may need to ask for clarification.',
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
    name: 'request_clarification',
    description: 'Request clarification from the user when there is ambiguity, such as multiple employees matching a name. This pauses the agent and waits for user selection.',
    input_schema: {
      type: 'object',
      properties: {
        question: {
          type: 'string',
          description: 'The question to ask the user'
        },
        options: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: {
                type: 'string',
                description: 'Unique identifier for this option'
              },
              label: {
                type: 'string',
                description: 'Display label for the option'
              },
              subtitle: {
                type: 'string',
                description: 'Optional subtitle with additional context'
              }
            },
            required: ['id', 'label']
          },
          description: 'Array of options for the user to choose from'
        }
      },
      required: ['question', 'options']
    }
  },
  {
    name: 'create_card_drafts',
    description: 'Create draft card proposals for employees. These are not issued until confirmed. Use dry_run=true to preview without committing.',
    input_schema: {
      type: 'object',
      properties: {
        employee_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of employee IDs to create cards for'
        },
        card_type: {
          type: 'string',
          enum: ['virtual', 'physical'],
          description: 'Type of card to issue (default: virtual)'
        },
        spending_limit: {
          type: 'number',
          description: 'Monthly spending limit for the cards (default: based on salary)'
        },
        dry_run: {
          type: 'boolean',
          description: 'If true, returns draft proposals without creating. Always use true first to show user what will be created.'
        }
      },
      required: ['employee_ids']
    }
  },
  {
    name: 'commit_card_drafts',
    description: 'Confirm and issue the previously created card drafts. This finalizes the card issuance.',
    input_schema: {
      type: 'object',
      properties: {
        draft_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of draft IDs to confirm and issue'
        }
      },
      required: ['draft_ids']
    }
  },
  {
    name: 'cancel_card_drafts',
    description: 'Cancel/void previously created card drafts. Use this when the user wants to cancel the card issuance.',
    input_schema: {
      type: 'object',
      properties: {
        draft_ids: {
          type: 'array',
          items: { type: 'string' },
          description: 'Array of draft IDs to cancel'
        }
      },
      required: ['draft_ids']
    }
  }
]

