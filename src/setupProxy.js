// =============================================================================
// Development Proxy Setup with Two-Tier Model Routing
// =============================================================================
// Fast router (Haiku) for simple queries, powerful model (Opus) for complex ones

const express = require('express');
const mockData = require('./shared/mockData.js');
const insightData = require('./shared/insightData.js');
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
          
          // Fast-path: Check if this is an insight query before router
          if (isInsightQuery(message)) {
            sendEvent('ack', { message: 'Analyzing this insight...' });
            const insightId = detectInsightFromMessage(message);
            const fastRouterResponse = {
              intent: 'INSIGHT_DETAIL',
              needsSmartModel: false,
              insightId: insightId,
            };
            await handleWithRouter(client, message, history, fastRouterResponse, sendEvent, conversationId);
            res.end();
            return;
          }
          
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
          await streamMockResponse(message, sendEvent, conversationId);
          res.end();
        }
      } else {
        sendEvent('ack', { message: 'Processing...' });
        await streamMockResponse(message, sendEvent, conversationId);
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
  // Format recent conversation history for context (last 4 messages)
  const recentHistory = (history || []).slice(-4);
  const historyContext = recentHistory.length > 0
    ? `RECENT CONVERSATION (for context):
${recentHistory.map(m => `${m.role.toUpperCase()}: ${m.content.substring(0, 300)}${m.content.length > 300 ? '...' : ''}`).join('\n')}

`
    : '';
  
  const classificationPrompt = `You are Mercury Assistant, a friendly and helpful assistant for Mercury.

CRITICAL COMPLIANCE (MUST FOLLOW):
- Mercury is a FINTECH COMPANY, not a bank. NEVER say "Mercury Bank" or refer to Mercury as a bank.
- Say "Mercury account" NOT "bank account"
- NEVER predict the future or make guarantees about returns, markets, or outcomes
- Only describe Mercury's existing product features as they work today

${historyContext}CURRENT MESSAGE: "${message}"

INTENTS (choose one):
- FLAGGED_TRANSACTIONS: User asks about suspicious, flagged, or unusual transactions. Questions like "any transactions to review?", "suspicious activity?", "flagged transactions?", "anything unusual?", "duplicates?", "alerts?". Answer INLINE with list of flagged transactions.
- ALERT_EXPLANATION: User asks about why a specific transaction is flagged. Questions like "why is Slack flagged?", "tell me about the duplicate", "what's wrong with the AWS charge?", "explain the alert". Extract the merchant name from the question.
- PAYMENT_LIMITS: User asks about increasing payment limits, wire limits, ACH limits, or transfer limits. Questions like "how can I increase my payment limits?", "raise my wire limit", "what are my transfer limits?". Answer INLINE with helpful guidance.
- EIN_QUERY: User asks about their EIN (Employer Identification Number). Questions like "what is my EIN?", "show me my EIN", "company EIN". Answer INLINE with the company's EIN.
- INSIGHT_FOLLOWUP: User is asking a follow-up question about an insight that was JUST discussed in the conversation history. Look for short questions like "is this too much?", "what should I do?", "how can I reduce this?", "show me the transactions", "why?", "tell me more", etc. that refer back to a previous insight discussion. Extract the insightId from the previous [INSIGHT:X] message in history.
- INSIGHT_DETAIL: User clicked an insight from the insights page and wants details. Look for "[INSIGHT:" prefix (e.g., "[INSIGHT:1]") or "Tell me more about this:" prefix or references to "Cursor spend", "software spend", "credit spend", "revenue growth". Extract the insight ID from [INSIGHT:X] and include it in insightId.
- CASHFLOW_QUESTION: User asks about overall cashflow, money in/out, financial health → NAVIGATE to insights page
- WIRE_TRANSACTIONS: User wants to see wire transfers → NAVIGATE to transactions with filter
- TOP_MERCHANT: User asks "what's my top merchant?" or "who do I spend the most with?" → Answer INLINE (no navigation)
- SPENDING_CATEGORY: User asks "what do I spend the most on?" or category questions → Answer INLINE
- NAVIGATE: User explicitly wants to go to a page (payments, transactions, cards, etc.)
- BALANCE: User asks about account balances → Answer INLINE
- TRANSACTION_SEARCH: User asks about specific transactions or spending (e.g., "What did I spend on AWS?")
- CARD_ACTION: User wants to freeze/manage cards
- SUPPORT: User explicitly asks for human support or has a complex account issue
- COMPLEX_QUESTION: User asks something requiring deep analysis
- SIMPLE_QUESTION: General product questions you can answer directly
- CHITCHAT: Casual conversation, jokes, off-topic questions

CRITICAL: INSIGHT FOLLOW-UPS
When the conversation history shows a recent insight discussion (look for [INSIGHT:X] tags or discussions about software/credit/revenue), and the current message is a short follow-up question, classify as INSIGHT_FOLLOWUP and include:
- insightId: the ID from the previous insight discussion
- followUpType: one of "assessment" (is this good/bad/too much), "action" (what should I do), "details" (tell me more/why), "transactions" (show me the transactions)

CRITICAL: INLINE vs NAVIGATION
Questions that should be answered INLINE (no navigation):
- "What's my top merchant?" → INLINE answer
- "Who do I spend the most with?" → INLINE answer
- "What's my biggest expense?" → INLINE answer
- "What did I spend on [specific merchant]?" → INLINE answer (TRANSACTION_SEARCH)
- "What's my balance?" → INLINE answer

Questions that should NAVIGATE:
- "What's my cashflow?" → Navigate to /insights
- "Show me my spending trends" → Navigate to /insights
- "Recent wire transactions" → Navigate to /transactions with filter
- "Show me transactions" → Navigate to /transactions

Respond with JSON:
{"intent":"...", "needsSmartModel":true/false, "handoffMessage":"...", "quickResponse":"...", "navigationTarget":"...", "insightId":"...", "followUpType":"...", "merchant":"..."}

Examples:
- History has "[INSIGHT:1] Tell me about software spend" → User asks "is this too much?" → INSIGHT_FOLLOWUP, insightId: "1", followUpType: "assessment"
- History has "[INSIGHT:2] Tell me about credit spend" → User asks "what should I do?" → INSIGHT_FOLLOWUP, insightId: "2", followUpType: "action"
- History has "[INSIGHT:1] software spend discussion" → User asks "show me the transactions" → INSIGHT_FOLLOWUP, insightId: "1", followUpType: "transactions"
- "[INSIGHT:1] Tell me more about this: 'Spike in spend on software'..." → INSIGHT_DETAIL, insightId: "1", needsSmartModel: false
- "[INSIGHT:2] Tell me more about this: 'Increased Credit spend'..." → INSIGHT_DETAIL, insightId: "2", needsSmartModel: false
- "[INSIGHT:3] Tell me more about this: '12% revenue growth'..." → INSIGHT_DETAIL, insightId: "3", needsSmartModel: false
- "Tell me more about the software spend" → INSIGHT_DETAIL, insightId: "1", needsSmartModel: false
- "Tell me about the credit card increase" → INSIGHT_DETAIL, insightId: "2", needsSmartModel: false
- "What's my top merchant?" → TOP_MERCHANT (inline answer, no navigation)
- "Who do I spend the most with?" → TOP_MERCHANT (inline answer)
- "What's my biggest expense category?" → SPENDING_CATEGORY (inline answer)
- "What's my cashflow?" → CASHFLOW_QUESTION (navigate to insights)
- "Show me my spending trends" → CASHFLOW_QUESTION (navigate to insights)
- "Show me my recent wire transactions" → WIRE_TRANSACTIONS (navigate)
- "What's my balance" → BALANCE (inline answer)
- "What did I spend on AWS?" → TRANSACTION_SEARCH (inline answer with data)
- "Go to payments" → NAVIGATE, navigationTarget: "payments"
- "Any transactions I should review?" → FLAGGED_TRANSACTIONS
- "Anything suspicious?" → FLAGGED_TRANSACTIONS
- "Any flagged transactions?" → FLAGGED_TRANSACTIONS
- "Any duplicates?" → FLAGGED_TRANSACTIONS
- "Why is Slack flagged?" → ALERT_EXPLANATION, merchant: "Slack"
- "Tell me about the AWS duplicate" → ALERT_EXPLANATION, merchant: "AWS"
- "What's the issue with OpenAI?" → ALERT_EXPLANATION, merchant: "OpenAI"
- "How can I increase my payment limits?" → PAYMENT_LIMITS
- "What are my wire limits?" → PAYMENT_LIMITS
- "How do I raise my transfer limit?" → PAYMENT_LIMITS
- "What is my EIN?" → EIN_QUERY
- "Show me my company EIN" → EIN_QUERY

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

// Detect which insight is being asked about from the message
function detectInsightFromMessage(message) {
  // First check for explicit [INSIGHT:X] tag
  const tagMatch = message.match(/\[INSIGHT:(\d+)\]/);
  if (tagMatch) {
    return tagMatch[1];
  }
  
  const lowerMessage = message.toLowerCase();
  
  // Check for software/Cursor insight
  if (lowerMessage.includes('software') || lowerMessage.includes('cursor') || 
      lowerMessage.includes('spike') || lowerMessage.includes('subscription')) {
    return '1';
  }
  
  // Check for credit card insight
  if (lowerMessage.includes('credit') || lowerMessage.includes('card spend') || 
      lowerMessage.includes('card increase')) {
    return '2';
  }
  
  // Check for revenue insight
  if (lowerMessage.includes('revenue') || lowerMessage.includes('growth') || 
      lowerMessage.includes('income')) {
    return '3';
  }
  
  return null;
}

// Check if message is an insight query (fast check before router)
function isInsightQuery(message) {
  return message.includes('[INSIGHT:') || 
         (message.toLowerCase().includes('tell me more about') && 
          (message.toLowerCase().includes('software') || 
           message.toLowerCase().includes('credit') || 
           message.toLowerCase().includes('revenue')));
}

// Detect which insight was discussed in conversation history
function detectInsightFromHistory(history) {
  if (!history || history.length === 0) return null;
  
  // Look through recent history for insight references
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg.content) {
      // Check for explicit [INSIGHT:X] tag
      const tagMatch = msg.content.match(/\[INSIGHT:(\d+)\]/);
      if (tagMatch) {
        return tagMatch[1];
      }
      
      // Check for insight keywords
      const lower = msg.content.toLowerCase();
      if (lower.includes('software') || lower.includes('cursor') || lower.includes('subscription')) {
        return '1';
      }
      if (lower.includes('credit') || lower.includes('card spend')) {
        return '2';
      }
      if (lower.includes('revenue') || lower.includes('growth') || lower.includes('income')) {
        return '3';
      }
    }
  }
  
  return null;
}

// Handle with fast router model (simple queries)
async function handleWithRouter(client, message, history, classification, sendEvent, conversationId) {
  let responseText = '';
  let metadata = undefined;
  
  switch (classification.intent) {
    case 'INSIGHT_DETAIL': {
      // Get the insight details
      const insightId = classification.insightId || detectInsightFromMessage(message);
      const insight = insightData.getInsightById(insightId);
      
      if (insight) {
        // Format a rich response with the insight data
        const trend = insight.monthlyTrend;
        const latestChange = trend[trend.length - 1]?.percentChange || 0;
        const changeDirection = latestChange > 0 ? 'increase' : latestChange < 0 ? 'decrease' : 'stable';
        
        // Build the response
        responseText = `${insight.summary}\n\n`;
        responseText += `**Monthly Trend:**\n`;
        insight.monthlyTrend.forEach(m => {
          const pct = m.percentChange !== undefined ? ` (${m.percentChange > 0 ? '+' : ''}${m.percentChange}%)` : '';
          responseText += `• ${m.month}: $${m.amount.toLocaleString()}${pct}\n`;
        });
        
        responseText += `\n**Key Insights:**\n`;
        insight.keyFacts.slice(0, 3).forEach(f => {
          responseText += `• ${f}\n`;
        });
        
        if (insight.breakdown.length > 0) {
          responseText += `\n**Breakdown:**\n`;
          insight.breakdown.slice(0, 4).forEach(b => {
            responseText += `• ${b.name}: $${b.amount.toLocaleString()} (${b.percentage}%)\n`;
          });
        }
        
        responseText += `\n**Recommendations:**\n`;
        insight.recommendations.slice(0, 2).forEach(r => {
          responseText += `• ${r}\n`;
        });
      } else {
        responseText = "I'd be happy to tell you more about that insight! Could you specify which one you're interested in? I can help with software spend, credit card spend, or revenue trends.";
      }
      break;
    }
    
    case 'INSIGHT_FOLLOWUP': {
      // Handle follow-up questions about a recently discussed insight
      const insightId = classification.insightId || detectInsightFromHistory(history);
      const insight = insightData.getInsightById(insightId);
      const followUpType = classification.followUpType || 'details';
      
      if (insight) {
        const latestAmount = insight.monthlyTrend[insight.monthlyTrend.length - 1]?.amount || 0;
        const percentChange = insight.monthlyTrend[insight.monthlyTrend.length - 1]?.percentChange || 0;
        
        switch (followUpType) {
          case 'assessment':
            // "Is this too much?", "Is this normal?", "Should I be worried?"
            if (insight.category === 'software') {
              if (percentChange > 20) {
                responseText = `A ${percentChange}% month-over-month increase is significant and worth attention. Your Cursor spend at $${latestAmount.toLocaleString()}/month is growing faster than typical for development tools.\n\n`;
                responseText += `**Context:** For a company your size, software spend typically grows 5-10% monthly during scaling phases. A 15%+ jump often indicates either rapid hiring or underutilized licenses.\n\n`;
                responseText += `**My take:** Review your seat utilization—if all licenses are actively used, this growth is healthy. If some are idle, there's savings opportunity.`;
              } else {
                responseText = `This level of spend ($${latestAmount.toLocaleString()}/month) is reasonable for an active development team. The ${percentChange > 0 ? '+' : ''}${percentChange}% change is within normal growth patterns.\n\n`;
                responseText += `Cursor is clearly a core tool for your team. As long as the team is getting value from it, this investment makes sense.`;
              }
            } else if (insight.category === 'credit') {
              responseText = `Your credit card spend of $${latestAmount.toLocaleString()} this month is ${percentChange > 10 ? 'elevated' : 'within normal range'}.\n\n`;
              responseText += `**Key factors:**\n`;
              responseText += `• ${insight.breakdown[0]?.name || 'Top category'} accounts for ${insight.breakdown[0]?.percentage || 0}% of card spend\n`;
              responseText += `• Average transaction size is typical for business expenses\n\n`;
              responseText += percentChange > 10 
                ? `The ${percentChange}% increase suggests higher operational activity. Worth reviewing if this aligns with business growth.`
                : `This looks healthy—your card spend is tracking with typical business operations.`;
            } else if (insight.category === 'revenue') {
              responseText = `A ${percentChange}% revenue increase to $${latestAmount.toLocaleString()} is excellent! 📈\n\n`;
              responseText += `**This is a positive signal.** Your revenue growth is outpacing typical SaaS benchmarks of 8-10% MoM for companies at your stage.\n\n`;
              responseText += `Keep an eye on whether your expenses are scaling proportionally—healthy growth means revenue growing faster than costs.`;
            }
            break;
            
          case 'action':
            // "What should I do?", "How can I reduce this?", "Any recommendations?"
            responseText = `Here's what I'd recommend based on your ${insight.title.toLowerCase()}:\n\n`;
            insight.recommendations.forEach((r, i) => {
              responseText += `${i + 1}. ${r}\n`;
            });
            responseText += `\nWant me to help you take action on any of these? I can navigate you to the relevant pages or pull up specific transaction details.`;
            break;
            
          case 'transactions':
            // "Show me the transactions", "What are the specific charges?"
            responseText = `Here are the recent transactions related to this insight:\n\n`;
            insight.relatedTransactions.slice(0, 5).forEach(t => {
              const amount = t.amount < 0 ? `-$${Math.abs(t.amount).toLocaleString()}` : `+$${t.amount.toLocaleString()}`;
              responseText += `• **${t.counterparty}** — ${amount} on ${t.date}\n`;
            });
            if (insight.relatedTransactions.length > 5) {
              responseText += `\n...and ${insight.relatedTransactions.length - 5} more. Want me to take you to the Transactions page to see the full list?`;
            }
            break;
            
          case 'details':
          default:
            // "Tell me more", "Why?", "Explain"
            responseText = `${insight.summary}\n\n`;
            responseText += `**Key facts:**\n`;
            insight.keyFacts.forEach(f => {
              responseText += `• ${f}\n`;
            });
            responseText += `\nAnything specific you'd like me to dig into?`;
            break;
        }
      } else {
        // Fallback if we can't determine which insight
        responseText = "I want to make sure I give you the right information! Are you asking about:\n\n";
        responseText += "• **Software spend** (Cursor and other subscriptions)\n";
        responseText += "• **Credit card spend** (team card usage)\n";
        responseText += "• **Revenue growth** (income trends)\n\n";
        responseText += "Just let me know which one!";
      }
      break;
    }
    
    case 'FLAGGED_TRANSACTIONS': {
      // Get all flagged transactions
      const flagged = mockData.getFlaggedTransactions();
      
      if (flagged.length > 0) {
        responseText = `⚠️ I found **${flagged.length} transactions** that need your attention:\n\n`;
        
        flagged.forEach((t, i) => {
          const amount = t.amount < 0 ? `-$${Math.abs(t.amount).toLocaleString()}` : `+$${t.amount.toLocaleString()}`;
          const alertLabels = {
            'possible-duplicate': '🔄 Possible Duplicate',
            'subscription-increase': '📈 Subscription Increase',
            'new-vendor': '🆕 New Vendor',
          };
          const label = alertLabels[t.alert.type] || 'Flagged';
          responseText += `${i + 1}. **${t.counterparty}** — ${amount}\n`;
          responseText += `   ${label}\n\n`;
        });
        
        responseText += `Would you like me to explain why any of these are flagged? Just ask about a specific one (e.g., "Why is Slack flagged?")`;
      } else {
        responseText = `✅ Good news! I don't see any transactions that need your attention right now. Everything looks normal.`;
      }
      break;
    }
    
    case 'ALERT_EXPLANATION': {
      // Explain why a specific transaction is flagged
      const merchantName = classification.merchant || '';
      const flagged = mockData.getFlaggedTransactions();
      
      // Find the transaction by merchant name (fuzzy match)
      const matchedTxn = flagged.find(t => 
        t.counterparty.toLowerCase().includes(merchantName.toLowerCase()) ||
        merchantName.toLowerCase().includes(t.counterparty.toLowerCase())
      );
      
      if (matchedTxn && matchedTxn.alert) {
        const amount = matchedTxn.amount < 0 ? `-$${Math.abs(matchedTxn.amount).toLocaleString()}` : `+$${matchedTxn.amount.toLocaleString()}`;
        const alertTitles = {
          'possible-duplicate': '🔄 Possible Duplicate',
          'subscription-increase': '📈 Subscription Increase',
          'new-vendor': '🆕 New Vendor',
        };
        const title = alertTitles[matchedTxn.alert.type] || 'Alert';
        
        responseText = `**${matchedTxn.counterparty}** — ${amount}\n`;
        responseText += `**${title}**\n\n`;
        responseText += `${matchedTxn.alert.reason}\n\n`;
        
        // Add contextual follow-up based on alert type
        if (matchedTxn.alert.type === 'possible-duplicate') {
          responseText += `**Next steps:** Check your ${matchedTxn.counterparty} dashboard or billing history to confirm if this is a duplicate. If so, you may want to request a refund.`;
        } else if (matchedTxn.alert.type === 'subscription-increase') {
          responseText += `**Next steps:** Review your ${matchedTxn.counterparty} account to confirm the seat/usage increase is expected. You may want to audit inactive users.`;
        } else if (matchedTxn.alert.type === 'new-vendor') {
          responseText += `**Next steps:** No action needed if this purchase was expected. Consider setting a budget or approval workflow for new vendors.`;
        }
      } else if (merchantName) {
        // Check if it's a transaction that exists but isn't flagged
        const allTxns = mockData.searchTransactions(merchantName, 5);
        if (allTxns.length > 0) {
          responseText = `The **${merchantName}** transaction isn't flagged—it looks normal! 👍\n\n`;
          responseText += `Is there something specific about it that concerns you?`;
        } else {
          responseText = `I couldn't find a transaction matching "${merchantName}". Can you give me more details about which transaction you're asking about?`;
        }
      } else {
        // List available flagged transactions
        const flaggedList = flagged.map(t => t.counterparty).join(', ');
        responseText = `Which transaction would you like me to explain? The flagged ones are: **${flaggedList}**`;
      }
      break;
    }
    
    case 'PAYMENT_LIMITS': {
      // Answer with information about payment limits from Mercury Help Center
      responseText = `Great question! Here's how to increase your payment limits on Mercury:\n\n`;
      responseText += `**Current Default Limits:**\n`;
      responseText += `- ACH transfers: Up to $500,000 per transfer\n`;
      responseText += `- Wire transfers: Up to $1,000,000 per transfer\n\n`;
      responseText += `**To Request Higher Limits:**\n\n`;
      responseText += `1. **Go to Settings** → Click on your profile in the top right\n`;
      responseText += `2. **Select "Payment Limits"** from the menu\n`;
      responseText += `3. **Submit a limit increase request** with:\n`;
      responseText += `   - The new limit amount you need\n`;
      responseText += `   - Business justification (e.g., "Large vendor payments")\n`;
      responseText += `   - How often you'll need this limit\n\n`;
      responseText += `Mercury's team typically reviews requests within 1-2 business days. Higher limits may require additional documentation.\n\n`;
      responseText += `📖 **Learn more:** [Requesting higher payment limits](https://support.mercury.com/hc/en-us/articles/28772859696148-Requesting-higher-payment-limits)`;
      break;
    }
    
    case 'EIN_QUERY': {
      // Return the company's EIN based on mock data
      // Using Maker Inc. as the demo company
      responseText = `Your company's **Employer Identification Number (EIN)** is:\n\n`;
      responseText += `**82-4506327**\n\n`;
      responseText += `This is for **Maker Inc.** — the business registered with your Mercury account.\n\n`;
      responseText += `You can also find this in **Settings → Business Details** if you need it for tax filings, vendor forms, or other official documents.`;
      break;
    }
    
    case 'TOP_MERCHANT': {
      // Answer inline - no navigation
      const topTxns = mockData.getTopTransactions('out', 5);
      const merchantSpend = {};
      topTxns.forEach(t => {
        if (t.counterparty) {
          merchantSpend[t.counterparty] = (merchantSpend[t.counterparty] || 0) + Math.abs(t.amount);
        }
      });
      
      // Get all transactions to calculate accurate merchant totals
      const allTxns = mockData.searchTransactions('', 100);
      const now = new Date();
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentSpend = {};
      allTxns.filter(t => t.amount < 0 && new Date(t.date) >= thirtyDaysAgo).forEach(t => {
        const name = t.counterparty;
        recentSpend[name] = (recentSpend[name] || 0) + Math.abs(t.amount);
      });
      
      const sortedMerchants = Object.entries(recentSpend)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      if (sortedMerchants.length > 0) {
        responseText = `Your top merchants by spend this month:\n\n`;
        sortedMerchants.forEach(([merchant, amount], i) => {
          const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
          responseText += `${emoji} **${merchant}**: $${amount.toLocaleString()}\n`;
        });
        responseText += `\nWant me to dig into any of these?`;
      } else {
        responseText = "I couldn't find enough transaction data to determine your top merchants. Would you like me to navigate to your transactions page?";
      }
      break;
    }
    
    case 'SPENDING_CATEGORY': {
      // Answer inline - no navigation
      const insights = mockData.getInsightsData();
      const topCategories = insights.topSpendingCategories.slice(0, 5);
      
      if (topCategories.length > 0) {
        responseText = `Your top spending categories this month:\n\n`;
        topCategories.forEach((cat, i) => {
          const emoji = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '•';
          responseText += `${emoji} **${cat.category}**: $${cat.amount.toLocaleString()}\n`;
        });
        responseText += `\nWant me to show you specific transactions in any category?`;
      } else {
        responseText = "I couldn't find enough transaction data to determine your spending categories.";
      }
      break;
    }
    
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
