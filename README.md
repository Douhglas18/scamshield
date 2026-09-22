# 🛡️ ScamShield — AI-Powered Phishing & Fake Offer Inspector

[![Framework: React (Vite)](https://img.shields.io/badge/Framework-React_(Vite)-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![AI Engine: Google Gemini](https://img.shields.io/badge/AI_Engine-Google_Gemini-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)
[![Accessibility: WCAG 2.1 AA](https://img.shields.io/badge/Accessibility-WCAG_2.1_AA-success?style=flat-square)](https://www.w3.org/WAI/standards-guidelines/wcag/)

> **Submission for:** PromptWars Hackathon by **Hack2Skill** × **Google for Developers**.  
> **Live Web App:** [https://scamshield-iota-ten.vercel.app/](https://scamshield-iota-ten.vercel.app/)  
> **GitHub Repo:** [https://github.com/Douhglas18/scamshield](https://github.com/Douhglas18/scamshield)

---

## 📌 Executive Summary (What is ScamShield?)

Online fraud is evolving rapidly. Every day, thousands of job seekers, students, and consumers receive convincing fake offer letters, fraudulent apartment rental agreements, and deceptive phishing links designed to steal money or private identities. 

**ScamShield** acts as a personal AI security assistant. Users simply paste a suspicious email, text message, offer letter, or website link into ScamShield. Powered by **Google Gemini AI**, the application instantly analyzes the document, highlights hidden red flags in plain English, and provides a clear risk score (0–100%) so anyone can immediately know whether to trust the message.

---

## 🚨 The Problem vs. 💡 The ScamShield Solution

| The Problem | How ScamShield Solves It |
| :--- | :--- |
| **Sophisticated Scams:** Attackers use professional logos, urgent deadlines, and formal corporate tone to mislead victims. | **Deep Context AI Analysis:** Gemini looks past slick formatting to detect subtle tactics like advance-fee requests, pressure tactics, and lookalike domains. |
| **Confusing Technical Jargon:** Traditional security tools output complex technical logs that ordinary users cannot understand. | **Plain-English Explanations:** Threat reports explain *why* something is dangerous in simple, everyday language with immediate action steps. |
| **Inaccessible Interfaces:** Many digital tools ignore users with visual impairments or color blindness. | **Inclusive Universal Design:** Built with full WCAG 2.1 AA accessibility, offering high-contrast modes, sensory pattern overlays, and color-blind modes. |

---

## 🔥 Key Features

### 1. 🎯 Dynamic Scam Threat Index (0–100%)
* **0–30% (Safe):** Clear, verifiable communication.
* **31–70% (Suspicious):** Caution advised; potential irregularities in domain, tone, or payment terms.
* **71–100% (Critical Threat):** Explicit fraud indicators detected (e.g., upfront payment demands, unofficial email domains, fake hotline numbers).

### 2. 📊 Visual Threat Radar
Breakdown of danger vectors categorized into visual risk categories:
* **Financial Risk:** Requests for processing fees, security deposits, or gift cards.
* **Identity Risk:** Excessive requests for sensitive personal details (SSN, Aadhaar, passport numbers).
* **Domain & Urgency Risk:** Pressure tactics combined with fake or slightly altered web addresses.

### 3. 🎨 Inclusive Accessibility Modes (WCAG 2.1 AA)
* **Color-Blind Support:** Specialized visual palettes for *Deuteranopia*, *Protanopia*, and *Tritanopia*.
* **Sensory Pattern Overlays:** Uses visual textures (stripes, dots, grids) alongside colors so risk levels remain clear regardless of vision conditions.
* **High-Contrast Toggle & Screen-Reader Optimized:** Fully navigable via keyboard and screen readers.

### 4. ⚡ Offline Heuristic Fallback
If the user loses internet connection, ScamShield switches to a local pattern-matching engine to deliver baseline security warnings without failing completely.

---

## 🧠 Google Gemini Prompt Strategy

ScamShield uses **Google Gemini** with structured response engineering to guarantee accurate, consistent security evaluations.

### System Prompt Logic:
1. **Context Analysis:** Reads incoming message text or extracted document contents.
2. **Signal Detection:** Scans for psychological triggers (fear, rush, free money), structural anomalies, and domain spoofing.
3. **Structured JSON Output:** Formats findings into a clean JSON schema:

```json
{
  "threatScore": 92,
  "verdict": "CRITICAL_THREAT",
  "summary": "This job offer demands a mandatory security deposit for laptop training before onboarding.",
  "redFlags": [
    " Demands upfront money via non-refundable transfer methods",
    " Uses an unofficial Gmail address instead of an official company domain",
    " Creates artificial urgency by giving a 2-hour decision deadline"
  ],
  "recommendedAction": "Do not pay any money or share government ID. Block sender immediately."
}
