// =============================================================================
// Development Proxy Setup with Two-Tier Model Routing
// =============================================================================
// Fast router (Haiku) for simple queries, powerful model (Opus) for complex ones

const express = require('express');
const mockData = require('./shared/mockData.js');
const { COMPLIANCE_PROMPT, checkCompliance } = require('./shared/complianceRules.js');

// Model configuration - Claude 4.5 models (latest)
const ROUTER_MODEL = 'claude-sonnet-4-5-20250929';  // Sonnet 4.5: Intelligent router, handles nuance well
const SMART_MODEL = 'claude-opus-4-5-20251101';     // Opus 4.5: Maximum capability for complex tasks

module.exports = function(app) {
  app.use(express.json());
  
  app.post('/api/chat', async (req, res) => {
    try {
      const { message, conversationId, history } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      // SSE headers
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('X-Accel-Buffering', 'no');
      
      const sendEvent = (event, data) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };
      
      const apiKey = process.env.ANTHROPIC_API_KEY;
      
      if (apiKey) {
        try {
          const Anthropic = require('@anthropic-ai/sdk').default;
          const client = new Anthropic({ apiKey });
          
          // Step 1: Fast router classifies the query
          sendEvent('ack', { message: 'Understanding your request...' });
          
          const routerResponse = await classifyQuery(client, message, history);
          
          // Step 2: Handle based on classification
          if (routerResponse.needsSmartModel) {
            // Show handoff message
            sendEvent('ack', { message: `${routerResponse.handoffMessage}` });
            await sleep(300); // Brief pause so user sees the message
            
            // Use smart model for complex query
            await handleWithSmartModel(client, message, history, routerResponse.intent, sendEvent, conversationId);
          } else {
            // Router can handle this directly
            await handleWithRouter(client, message, history, routerResponse, sendEvent, conversationId);
          }
          
          res.end();
          
        } catch (apiError) {
          console.error('API error:', apiError);
          streamMockResponse(message, sendEvent, conversationId);
          res.end();
        }
      } else {
        sendEvent('ack', { message: 'Processing...' });
        streamMockResponse(message, sendEvent, conversationId);
        res.end();
      }
      
    } catch (error) {
      console.error('Chat API error:', error);
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });
};

// Classify query with Sonnet 4.5 (intelligent router)
async function classifyQuery(client, message, history) {
  const classificationPrompt = `You are Mercury Assistant, a friendly and helpful assistant for Mercury.

CRITICAL COMPLIANCE (MUST FOLLOW):
- Mercury is a FINTECH COMPANY, not a bank. NEVER say "Mercury Bank" or refer to Mercury as a bank.
- Say "Mercury account" NOT "bank account"
- NEVER predict the future or make guarantees about returns, markets, or outcomes
- Only describe Mercury's existing product features as they work today

MESSAGE: "${message}"

INTENTS:
- CASHFLOW_QUESTION: User asks about cashflow, money in/out, financial health, spending trends
- WIRE_TRANSACTIONS: User specifically asks about wire transfers or wire transactions
- NAVIGATE: User wants to go to a page (payments, transactions, cards, accounts, etc.)
- BALANCE: User asks about account balances
- TRANSACTION_SEARCH: User asks about specific transactions or spending (e.g., "What did I spend on AWS?")
- CARD_ACTION: User wants to freeze/manage cards
- SUPPORT: User explicitly asks for human support or has a complex account issue
- COMPLEX_QUESTION: User asks something requiring deep analysis
- SIMPLE_QUESTION: General product questions you can answer directly
- CHITCHAT: Casual conversation, jokes, off-topic questions (meaning of life, etc.)

RESPONSE GUIDELINES:
- Be warm and friendly! Use a conversational tone.
- For CASHFLOW_QUESTION: User wants to understand their financial picture - navigate to insights and answer
- For WIRE_TRANSACTIONS: User wants to see wire transfers - navigate to transactions with wire filter
- For CHITCHAT: Give a fun, friendly response then gently redirect to how you can help with Mercury
- For SIMPLE_QUESTION: Provide a helpful answer about Mercury's features
- For predictions/guarantees: Politely explain you can't predict the future but can show current features
- Don't send to SUPPORT unless they explicitly ask for human help

Respond with JSON:
{"intent":"...", "needsSmartModel":true/false, "handoffMessage":"...", "quickResponse":"...", "navigationTarget":"..."}

Examples:
- "What's my cashflow?" → CASHFLOW_QUESTION
- "What's my cashflow looking like?" → CASHFLOW_QUESTION
- "How's my spending?" → CASHFLOW_QUESTION
- "Show me my recent wire transactions" → WIRE_TRANSACTIONS
- "Recent wires" → WIRE_TRANSACTIONS
- "What's the meaning of life?" → CHITCHAT, quickResponse: "Ha! The big questions! 🤔 Philosophers have debated that for millennia. I'm more of a fintech assistant myself—I can help you navigate your Mercury account, check transactions, or send payments. What can I help you with?"
- "Will my money grow?" → CHITCHAT, quickResponse: "I can't predict the future or give investment advice, but I can show you Mercury's features like Treasury for managing your cash. Would you like to learn more about that?"
- "Show me my balance" → BALANCE
- "What did I spend on AWS?" → TRANSACTION_SEARCH, handoffMessage: "Searching your transactions..."
- "Go to payments" → NAVIGATE, navigationTarget: "payments"

needsSmartModel=true only for TRANSACTION_SEARCH and COMPLEX_QUESTION.`;

  const response = await client.messages.create({
    model: ROUTER_MODEL,
    max_tokens: 256,
    temperature: 0.3, // Low temperature for consistent classification
    messages: [{ role: 'user', content: classificationPrompt }],
  });
  
  // Handle refusal (new in Claude 4.5)
  if (response.stop_reason === 'refusal') {
    console.log('Router refused to classify, defaulting to smart model');
    return {
      intent: 'COMPLEX_QUESTION',
      needsSmartModel: true,
      handoffMessage: 'Let me look into that...'
    };
  }
  
  try {
    const text = response.content[0]?.text || '';
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Failed to parse router response:', e);
  }
  
  // Default: use smart model
  return {
    intent: 'COMPLEX_QUESTION',
    needsSmartModel: true,
    handoffMessage: 'Let me think about that...'
  };
}

// Handle with fast router model (simple queries)
async function handleWithRouter(client, message, history, classification, sendEvent, conversationId) {
  let responseText = '';
  let metadata = undefined;
  
  switch (classification.intent) {
    case 'CASHFLOW_QUESTION': {
      // Get insights data to answer after navigation
      const insights = mockData.getInsightsData();
      const netChange = insights.cashflow.netChange;
      const trendEmoji = netChange > 0 ? '📈' : netChange < -10000 ? '📉' : '➡️';
      const trendWord = netChange > 0 ? 'positive' : netChange < -10000 ? 'negative' : 'neutral';
      
      responseText = `Great question! Let me take you to your Insights page where you can see your full cashflow picture. ${trendEmoji}`;
      metadata = {
        navigation: {
          target: 'Insights',
          url: '/insights',
          countdown: true,
          followUpAction: 'answer_with_page_data',
          pageData: {
            totalBalance: insights.totalBalance,
            moneyIn: insights.cashflow.moneyIn,
            moneyOut: insights.cashflow.moneyOut,
            netChange: netChange,
            trend: trendWord,
            topCategories: insights.topSpendingCategories,
            transactionCount: insights.transactionCount,
          }
        }
      };
      break;
    }
    
    case 'WIRE_TRANSACTIONS': {
      // Get wire transactions
      const wireTransactions = mockData.getWireTransactions(10);
      const wireCount = wireTransactions.length;
      const totalAmount = wireTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      responseText = `I'll take you to your Transactions page filtered to show your wire transfers. You have ${wireCount} recent wire transactions.`;
      metadata = {
        navigation: {
          target: 'Transactions',
          url: '/transactions?filter=wire',
          countdown: true,
          followUpAction: 'apply_filters',
          filters: {
            types: ['wire'],
          },
          pageData: {
            wireCount,
            totalAmount,
            recentWires: wireTransactions.slice(0, 5).map(t => ({
              id: t.id,
              date: t.date,
              counterparty: t.counterparty,
              amount: t.amount,
            }))
          }
        }
      };
      break;
    }
    
    case 'NAVIGATE': {
      const page = classification.navigationTarget || 'home';
      const pageUrls = {
        home: '/home', transactions: '/transactions', accounts: '/accounts',
        cards: '/cards', payments: '/payments', recipients: '/recipients',
        settings: '/settings', credit: '/credit', insights: '/insights'
      };
      const pageNames = {
        home: 'Home', transactions: 'Transactions', accounts: 'Accounts',
        cards: 'Cards', payments: 'Payments', recipients: 'Recipients',
        settings: 'Settings', credit: 'Credit', insights: 'Insights'
      };
      responseText = `Sure! Taking you to ${pageNames[page] || page}. 🚀`;
      metadata = {
        navigation: {
          target: pageNames[page] || page.charAt(0).toUpperCase() + page.slice(1),
          url: pageUrls[page] || '/home',
          countdown: true
        }
      };
      break;
    }
    
    case 'BALANCE': {
      const accounts = mockData.accounts;
      const list = accounts.map(a => `• **${a.name}**: $${a.balance.toLocaleString()}`).join('\n');
      const total = accounts.reduce((sum, a) => sum + a.balance, 0);
      responseText = `Here are your account balances:\n\n${list}\n\n**Total across all accounts**: $${total.toLocaleString()} 💰`;
      break;
    }
    
    case 'CARD_ACTION': {
      const cards = mockData.cards;
      const activeCards = cards.filter(c => c.status === 'active');
      
      if (message.toLowerCase().includes('freeze')) {
        const cardMatch = activeCards.find(c => 
          message.toLowerCase().includes(c.name.toLowerCase().split(' ')[0]) ||
          message.includes(c.last4)
        );
        
        if (cardMatch) {
          responseText = `Done! I've frozen ${cardMatch.name}'s card ending in ${cardMatch.last4}. 🔒 You can unfreeze it anytime.`;
          metadata = {
            action: {
              actionType: 'freeze_card',
              targetId: cardMatch.id,
              completed: true,
              undoAvailable: true,
              cardName: `${cardMatch.name} (${cardMatch.last4})`
            }
          };
        } else {
          responseText = `Sure, I can freeze a card for you! Which one?\n\n${activeCards.map(c => `• **${c.name}** — ending in ${c.last4}`).join('\n')}`;
        }
      } else {
        const cardList = cards.map(c => {
          const status = c.status === 'active' ? '✅ Active' : c.status === 'frozen' ? '🔒 Frozen' : c.status;
          return `• **${c.name}** (${c.last4}) — ${status}`;
        }).join('\n');
        responseText = `Here are your cards:\n\n${cardList}\n\nNeed to freeze or manage a card? Just ask!`;
      }
      break;
    }
    
    case 'SUPPORT': {
      const ticketId = 'TICKET-' + Math.floor(Math.random() * 10000);
      responseText = "I understand you'd like to speak with our support team. I'm connecting you now—they'll be able to help with more complex account matters. 🙏";
      metadata = {
        supportHandoff: {
          reason: message,
          ticketId
        }
      };
      break;
    }
    
    case 'CHITCHAT': {
      responseText = classification.quickResponse || "Ha! I appreciate the philosophical question. 😊 I'm Mercury Assistant though, so I'm best at helping with your banking needs—accounts, transactions, payments, and cards. What can I help you with today?";
      break;
    }
    
    case 'SIMPLE_QUESTION':
    default: {
      responseText = classification.quickResponse || "Hey there! I'm Mercury Assistant. I can help you check your accounts, find transactions, send payments, or manage your cards. What would you like to do?";
      break;
    }
  }
  
  // Stream the response
  for (let i = 0; i < responseText.length; i += 3) {
    sendEvent('chunk', { text: responseText.slice(i, i + 3) });
    await sleep(15);
  }
  
  sendEvent('done', { metadata, conversationId: conversationId || 'conv-' + Date.now() });
}

// Handle with smart model (complex queries)
async function handleWithSmartModel(client, message, history, intent, sendEvent, conversationId) {
  const summary = mockData.getTransactionsSummary();
  const recentTxns = mockData.searchTransactions('', 10);
  
  const systemPrompt = `You are Mercury Assistant, a friendly and knowledgeable assistant for Mercury. Be warm, helpful, and conversational.

CRITICAL COMPLIANCE RULES (MUST FOLLOW):
1. Mercury is a FINTECH COMPANY, not a bank.
   - NEVER say "Mercury Bank", "our bank", or "the bank"
   - Say "Mercury account" NOT "bank account"
   - If discussing banking services: "provided through our partner banks"

2. NO FUTURE PREDICTIONS:
   - NEVER predict future outcomes, returns, or market behavior
   - NEVER guarantee results ("will definitely", "guaranteed to")
   - Only describe existing Mercury features as they work TODAY

3. NO INVESTMENT/TAX/LEGAL ADVICE:
   - For such questions: "For specific guidance, please consult a qualified professional"

PERSONALITY:
- Warm and approachable (occasional emojis are fine 😊)
- Confident about Mercury's features
- Helpful and proactive
- Brief but friendly—2-3 sentences is ideal

AVAILABLE DATA:
Accounts: ${mockData.accounts.map(a => `${a.name}: $${a.balance.toLocaleString()}`).join(', ')}

Cards: ${mockData.cards.map(c => `${c.name} (${c.last4}): ${c.status}`).join(', ')}

Recent Transactions:
${recentTxns.map(t => `- ${t.date}: ${t.counterparty} ${t.amount > 0 ? '+' : ''}$${t.amount.toLocaleString()} [${t.id}]`).join('\n')}

Last 30 Days: In $${summary.last30Days.moneyIn.toLocaleString()}, Out $${summary.last30Days.moneyOut.toLocaleString()}

TOOLS:
- search_transactions: Search by merchant, category, or description
- navigate_to_page: Go to a page

FORMAT:
- Include markdown links for transactions: [View transaction](/transactions?highlight=txn-id)
- Use **bold** for amounts and key info
- Keep responses warm but concise`;

  const tools = [
    {
      name: 'search_transactions',
      description: 'Search transactions by merchant, category, description, or cardholder.',
      input_schema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Search term' },
          limit: { type: 'number', description: 'Max results (default 5)' }
        },
        required: ['query']
      }
    },
    {
      name: 'navigate_to_page',
      description: 'Navigate to a page.',
      input_schema: {
        type: 'object',
        properties: {
          page: { type: 'string', enum: ['home', 'transactions', 'accounts', 'cards', 'payments', 'recipients', 'settings', 'credit'] }
        },
        required: ['page']
      }
    }
  ];

  const messages = [];
  if (history && Array.isArray(history)) {
    for (const h of history) {
      messages.push({ role: h.role, content: h.content });
    }
  }
  messages.push({ role: 'user', content: message });

  // First call to Sonnet 4.5 (most intelligent model)
  const response = await client.messages.create({
    model: SMART_MODEL,
    max_tokens: 512,
    temperature: 0.7, // Claude 4.5: use temperature OR top_p, not both
    system: systemPrompt,
    tools,
    messages,
  });

  // Handle refusal (new in Claude 4.5)
  if (response.stop_reason === 'refusal') {
    const refusalText = "I can't help with that request. Is there something else I can assist you with?";
    for (let i = 0; i < refusalText.length; i += 3) {
      sendEvent('chunk', { text: refusalText.slice(i, i + 3) });
      await sleep(15);
    }
    sendEvent('done', { conversationId: conversationId || 'conv-' + Date.now() });
    return;
  }

  let responseText = '';
  let metadata = undefined;
  let toolUseBlocks = [];

  for (const block of response.content) {
    if (block.type === 'text') {
      responseText += block.text;
    } else if (block.type === 'tool_use') {
      toolUseBlocks.push(block);
    }
  }

  // Execute tools if needed
  if (toolUseBlocks.length > 0) {
    const toolResults = [];
    
    for (const block of toolUseBlocks) {
      const result = executeToolLocally(block.name, block.input);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: block.id,
        content: JSON.stringify(result.data)
      });
      if (result.metadata) {
        metadata = result.metadata;
      }
    }

    // Continue conversation with tool results
    const continueMessages = [...messages];
    continueMessages.push({ role: 'assistant', content: response.content });
    continueMessages.push({ role: 'user', content: toolResults });

    const followUp = await client.messages.create({
      model: SMART_MODEL,
      max_tokens: 256,
      temperature: 0.7,
      system: systemPrompt,
      tools,
      messages: continueMessages,
    });

    // Handle refusal in follow-up
    if (followUp.stop_reason === 'refusal') {
      responseText = "I found the information but can't display it. Please check the transactions page directly.";
    } else {
      responseText = '';
      for (const block of followUp.content) {
        if (block.type === 'text') {
          responseText += block.text;
        }
      }
    }
  }

  // Stream response
  if (responseText) {
    for (let i = 0; i < responseText.length; i += 3) {
      sendEvent('chunk', { text: responseText.slice(i, i + 3) });
      await sleep(15);
    }
  }

  sendEvent('done', { metadata, conversationId: conversationId || 'conv-' + Date.now() });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Execute tool with mock data
function executeToolLocally(toolName, input) {
  switch (toolName) {
    case 'navigate_to_page': {
      const pageUrls = {
        home: '/home', transactions: '/transactions', accounts: '/accounts',
        cards: '/cards', payments: '/payments', recipients: '/recipients',
        settings: '/settings', credit: '/credit'
      };
      return {
        data: { success: true, page: input.page },
        metadata: {
          navigation: {
            target: input.page.charAt(0).toUpperCase() + input.page.slice(1),
            url: pageUrls[input.page] || '/home',
            countdown: true
          }
        }
      };
    }

    case 'search_transactions': {
      const results = mockData.searchTransactions(input.query, input.limit || 5);
      return {
        data: {
          query: input.query,
          count: results.length,
          transactions: results.map(t => ({
            id: t.id,
            date: t.date,
            counterparty: t.counterparty,
            amount: t.amount,
            category: t.category,
            description: t.description,
            viewUrl: `/transactions?highlight=${t.id}`
          }))
        }
      };
    }

    default:
      return { data: { error: 'Unknown tool' } };
  }
}

// Mock responses (fallback)
async function streamMockResponse(message, sendEvent, conversationId) {
  const lowerMessage = message.toLowerCase();
  let response = { message: "I can help with accounts, transactions, payments, and cards." };
  let metadata = undefined;
  
  if (lowerMessage.includes('aws')) {
    const txns = mockData.searchTransactions('AWS', 1);
    if (txns.length > 0) {
      const t = txns[0];
      response.message = `Found AWS charge: **$${Math.abs(t.amount).toLocaleString()}** on ${t.date}.`;
      metadata = { link: { url: `/transactions?highlight=${t.id}`, label: 'View transaction' } };
    }
  } else if (lowerMessage.includes('balance')) {
    const accounts = mockData.accounts;
    const list = accounts.map(a => `**${a.name}**: $${a.balance.toLocaleString()}`).join('\n');
    response.message = list;
  } else if (lowerMessage.includes('transaction')) {
    const txns = mockData.searchTransactions('', 3);
    response.message = 'Recent:\n' + txns.map(t => `• ${t.counterparty}: $${t.amount.toLocaleString()}`).join('\n');
  }
  
  const text = response.message;
  for (let i = 0; i < text.length; i += 3) {
    sendEvent('chunk', { text: text.slice(i, i + 3) });
    await sleep(20);
  }
  
  sendEvent('done', { metadata, conversationId: conversationId || 'conv-' + Date.now() });
}
