import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { analyzeOfferLocally } from './src/utils/localAnalyzer';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));

// Lazy/safe initialization helper for Gemini
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is missing. Please configure it in your Settings > Secrets.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
  });
});

// Primary Offer & Phishing Analysis Endpoint
app.post('/api/analyze-offer', async (req, res) => {
  try {
    const { text, offerTypeHint, senderDomainOrUrl, fileData } = req.body;

    if ((!text || typeof text !== 'string' || text.trim().length < 15) && !fileData?.base64) {
      return res.status(400).json({
        error: 'Please provide at least 15 characters of offer letter, contract, or message text, or upload a document to analyze.',
      });
    }

    const ai = getGeminiClient();

    const systemInstruction = `You are ScamShield AI, an elite cybersecurity, anti-phishing, and fraud prevention intelligence analyst specializing in detecting fake employment offers, fraudulent rental leases, deceptive bank/financial notifications, phishing schemes, and social engineering attacks.

Analyze the user's provided offer letter, contract, email alert, or SMS communication thoroughly.

EVALUATE AGAINST KNOWN FRAUD METHODOLOGIES:
1. Advance-fee check scams (sending a fake cashier's check to buy "home office equipment" or "merchandise" from a specified vendor via Zelle, CashApp, Bitcoin, or wire).
2. Rental deposit fraud (absentee landlords claiming missionary/military relocations, claiming keys will be mailed or given via lockbox after upfront deposit).
3. Urgency and psychological coercion (artificial 12-24hr deadlines, threat of account suspension, high pressure).
4. Sensitive identity theft harvesting (requesting SSN, banking passwords, PINs, OTP codes, photo ID scans, direct deposit voided checks prior to official onboarding).
5. Unofficial or spoofed communication channels (Telegram, WhatsApp, Signal interviews, generic free webmail like @gmail.com/@outlook.com for major corporate or banking brands).
6. Unrealistic compensation (e.g. $55/hr for basic data entry with 0 experience).
7. Lookalike domains, deceptive URLs, or task optimization portals.
8. Sender domain / email verification: Evaluate whether the sender's email address or company website matches the official enterprise or is an impersonation tactic.

SPECIALIZED CRITERIA: DISTINGUISHING LEGITIMATE AUTOMATED BANK NOTIFICATIONS VS. ACTUAL PHISHING SCAMS:
You MUST carefully distinguish between authentic automated banking alerts and deceptive financial phishing attacks:

A. LEGITIMATE AUTOMATED BANK NOTIFICATIONS (Score: 0% to 15% | Level: SAFE):
- Masked Account/Card Identifiers: The notification references ONLY masked numbers (e.g., "card ending in 4921", "account ending in ...8812"). It NEVER demands that the customer verify or provide their full 16-digit card number, CVV, or PIN.
- Closed-Loop Non-Harvesting Confirmation: Typical verification requests are simple replies (e.g., "Did you attempt a charge of $42.50 at Target? Reply YES to confirm or NO if unauthorized") or instruction to log into the official mobile banking app.
- Explicit Anti-Phishing Security Safeguards: Legitimate bank messages frequently remind the user: "Do NOT share this code with anyone. A bank representative will NEVER call or text asking for your password, PIN, or one-time passcode (OTP)."
- Verified Official Channels & Root Domains: Any web links direct strictly to the exact official corporate root domain (e.g., chase.com, wellsfargo.com, bankofamerica.com, citi.com, capitalone.com, usbank.com, fidelity.com) or prompt users to open their pre-installed mobile app. Automated SMS messages originate from registered 5-6 digit shortcodes (e.g., 24273, 93557, 26266) or signed corporate email addresses (e.g., alerts@notify.wellsfargo.com, no-reply@chase.com).
- No Coercive Money Movement: Real banks NEVER tell customers to transfer money to a "safe government account", "secure fraud ledger", or move money via Zelle, Wire, or Bitcoin to protect their funds.
- No Remote Access Requests: Real banks NEVER ask users to download AnyDesk, TeamViewer, or screen-sharing tools to reverse a charge.

B. ACTUAL BANKING PHISHING SCAMS (Score: 75% to 100% | Level: CRITICAL / HIGH RISK):
- Panic-Driven Account Suspension Threats: "Your debit card/account has been permanently locked due to suspicious activity. Verify immediately within 1 hour or account will be closed."
- Reverse-Billing / Fake Fraud Call Center Numbers: "A charge of $1,849.00 for iPhone 16 was approved. If you did not make this purchase, call our fraud department immediately at +1-888-XXX-XXXX." (When the victim calls, scammers impersonate fraud officers to extract 2FA codes or initiate wire transfers).
- Deceptive Lookalike Domains & Shorteners: Links pointing to unverified subdomains, URL shorteners (bit.ly, tinyurl), or typo-squatted domains (e.g., chase-security-alert.net, wellsfargo-verify-login.org, bofa-online-auth.com, bank-secure-update.cc).
- Credential & One-Time Passcode (OTP) Harvesting: Directing the user to a webpage or asking them to reply with online banking usernames, passwords, ATM PINs, CVV codes, Social Security Numbers, or one-time verification codes (OTP/2FA).
- "Safe Account" Fund Movement Demands: Directing the victim to send funds via Zelle, Wire, or crypto ATM to a "secure intermediary account" to protect their savings.
- Unofficial Sender Identity: Emails sent from free public email providers (@gmail.com, @hotmail.com, @yahoo.com) purporting to be major financial institutions, or SMS from standard 10-digit mobile numbers or international country codes.

Calculate an accurate Scam Threat Index from 0 to 100%:
- 0 to 20%: SAFE / Clean corporate document or legitimate automated bank alert with standard security protocols, masked numbers, no harvesting, and verified channels.
- 21 to 50%: CAUTION / Unusual quirks, mild urgency, or informal communication requiring independent verification.
- 51 to 75%: HIGH RISK / Strong fraud indicators present (e.g. free email for large bank/company, suspicious link, pre-onboarding ID request).
- 76 to 100%: CRITICAL SCAM / Blatant advance-fee scam, equipment check demand, crypto task deposit, absentee landlord deposit, or banking phishing credential harvesting.

Provide objective quotes, clear explanations of WHY each detected item is hazardous or legitimate, and step-by-step verification advice.`;

    let prompt = `Analyze this document for scams, phishing, and fraudulent manipulation.
Document Hint: ${offerTypeHint || 'Auto-detect'}
`;

    if (senderDomainOrUrl && typeof senderDomainOrUrl === 'string' && senderDomainOrUrl.trim()) {
      prompt += `
--- SENDER EMAIL DOMAIN / COMPANY URL UNDER SCRUTINY ---
${senderDomainOrUrl.trim()}
NOTE: Cross-examine this sender domain or website link against the claimed company name in the document. Explicitly flag if it is a free webmail account (e.g. @gmail.com claiming to be a corporation), a typo-squatted lookalike, an unverified high-risk TLD, or an authentic corporate domain.
`;
    }

    if (text && text.trim()) {
      prompt += `
--- DOCUMENT CONTENT ---
${text.trim()}
--- END DOCUMENT CONTENT ---`;
    }

    const contents: any[] = [prompt];
    if (fileData && fileData.base64 && fileData.mimeType) {
      contents.push({
        inlineData: {
          mimeType: fileData.mimeType,
          data: fileData.base64,
        },
      });
    }

    const candidateModels = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-flash-latest'];
    let response: any = null;
    let lastError: any = null;

    for (const model of candidateModels) {
      try {
        console.log(`[ScamShield] Attempting analysis with model: ${model}`);
        response = await ai.models.generateContent({
          model,
          contents,
          config: {
            temperature: 0.1,
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                overallThreatScore: {
                  type: Type.INTEGER,
                  description: 'Overall Scam Threat Index from 0 (completely safe) to 100 (critical scam)',
                },
                threatLevel: {
                  type: Type.STRING,
                  description: 'One of: SAFE, CAUTION, HIGH, CRITICAL',
                },
                verdict: {
                  type: Type.STRING,
                  description: 'Short authoritative verdict headline, e.g. "Critical Fake Check & Advance Equipment Scam"',
                },
                offerType: {
                  type: Type.STRING,
                  description: 'Type of communication detected: Job Offer, Rental Offer, Bank / Financial Alert, Phishing Scam, Task/Crypto Gig, or Other',
                },
                summary: {
                  type: Type.STRING,
                  description: '2-3 sentence executive summary explaining the legitimacy or fraudulent nature of the document',
                },
                confidenceScore: {
                  type: Type.INTEGER,
                  description: 'Confidence in analysis from 0 to 100',
                },
                breakdown: {
                  type: Type.OBJECT,
                  properties: {
                    suspiciousLanguage: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        level: { type: Type.STRING },
                        summary: { type: Type.STRING },
                      },
                      required: ['score', 'level', 'summary'],
                    },
                    paymentOrDepositDemands: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        level: { type: Type.STRING },
                        summary: { type: Type.STRING },
                      },
                      required: ['score', 'level', 'summary'],
                    },
                    urgencyTactics: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        level: { type: Type.STRING },
                        summary: { type: Type.STRING },
                      },
                      required: ['score', 'level', 'summary'],
                    },
                    sensitiveInfoRequests: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        level: { type: Type.STRING },
                        summary: { type: Type.STRING },
                      },
                      required: ['score', 'level', 'summary'],
                    },
                    identityOrDomainAnomalies: {
                      type: Type.OBJECT,
                      properties: {
                        score: { type: Type.INTEGER },
                        level: { type: Type.STRING },
                        summary: { type: Type.STRING },
                      },
                      required: ['score', 'level', 'summary'],
                    },
                  },
                  required: [
                    'suspiciousLanguage',
                    'paymentOrDepositDemands',
                    'urgencyTactics',
                    'sensitiveInfoRequests',
                    'identityOrDomainAnomalies',
                  ],
                },
                redFlags: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      category: {
                        type: Type.STRING,
                        description: 'One of: payment_demand, urgency, sensitive_info, suspicious_language, unverified_contact, unrealistic_terms',
                      },
                      title: { type: Type.STRING },
                      severity: {
                        type: Type.STRING,
                        description: 'One of: LOW, MEDIUM, HIGH, CRITICAL',
                      },
                      quote: {
                        type: Type.STRING,
                        description: 'Specific quotation or snippet from the user text demonstrating this red flag',
                      },
                      explanation: {
                        type: Type.STRING,
                        description: 'Clear explanation of why this is dangerous and what scam vector it represents',
                      },
                      verificationAdvice: {
                        type: Type.STRING,
                        description: 'Practical, actionable step the user can take right now to verify or defend themselves',
                      },
                    },
                    required: ['id', 'category', 'title', 'severity', 'quote', 'explanation', 'verificationAdvice'],
                  },
                },
                positiveIndicators: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Legitimate or reassuring indicators found in the document (if any)',
                },
                detectedEntities: {
                  type: Type.OBJECT,
                  properties: {
                    claimedOrganization: { type: Type.STRING },
                    claimedSender: { type: Type.STRING },
                    contactChannels: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    financialTerms: { type: Type.STRING },
                    paymentMethodsMentioned: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                },
                extractedLinks: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Any URLs, domains, or emails discovered in the offer',
                },
                recommendedActions: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Immediate defensive action checklist for the user',
                },
              },
              required: [
                'overallThreatScore',
                'threatLevel',
                'verdict',
                'offerType',
                'summary',
                'breakdown',
                'redFlags',
                'positiveIndicators',
                'recommendedActions',
              ],
            },
          },
        });

        if (response && response.text) {
          break; // Succeeded
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        console.warn(`[ScamShield] Model ${model} encountered error:`, errorMsg);
        lastError = err;
      }
    }

    if (!response || !response.text) {
      console.warn('[ScamShield] Gemini cloud models unavailable (quota or 503). Activating ScamShield Local Heuristic Fallback Engine.');
      const localResult = analyzeOfferLocally(text || '', offerTypeHint, senderDomainOrUrl);
      return res.json({
        ...localResult,
        isFallbackRuleEngine: true,
        fallbackReason: 'AI cloud rate limits reached. Analysis completed using ScamShield Local Threat Heuristics Engine.',
      });
    }

    const rawJson = response.text?.trim() || '{}';
    const parsedData = JSON.parse(rawJson);

    // Normalize and add metadata
    const result = {
      ...parsedData,
      analyzedAt: new Date().toISOString(),
      isFallbackRuleEngine: false,
    };

    return res.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Scam analysis error, activating local heuristic engine:', errorMsg);
    try {
      const { text, offerTypeHint, senderDomainOrUrl } = req.body || {};
      const localResult = analyzeOfferLocally(text || '', offerTypeHint, senderDomainOrUrl);
      return res.json({
        ...localResult,
        isFallbackRuleEngine: true,
        fallbackReason: errorMsg || 'AI cloud service temporarily unavailable. Analysis completed using ScamShield Local Threat Heuristics Engine.',
      });
    } catch {
      return res.status(500).json({
        error: errorMsg || 'An error occurred during AI analysis. Please verify your API key and input text.',
      });
    }
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ScamShield] Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
