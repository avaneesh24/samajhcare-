# SamajhCare — Source-Grounded Healthcare Instruction Understanding Assistant

[![Promptathon](https://img.shields.io/badge/Healthcare_AI-Promptathon_2026-blue.svg)](https://github.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Zero-Data-Retention](https://img.shields.io/badge/Privacy-Zero_PHI_Retention-success.svg)](https://github.com)
[![Emergency Protocol](https://img.shields.io/badge/Safety_Bypass-Dial_112_India-red.svg)](https://github.com)
[![Status](https://img.shields.io/badge/Test_Suite-12%2F12_Passed-brightgreen.svg)](tests/scenarios.md)

> **SamajhCare (समझकेयर)** is an open-source, source-grounded healthcare assistant that helps patients and caregivers understand complex medical instructions and identify misunderstandings through a structured **clinical teach-back interaction**.

---

## 1. The Clinical Problem & Target Users

### The Problem
- **Information Attrition:** Clinical studies published by the Agency for Healthcare Research and Quality (AHRQ) demonstrate that **40% to 80% of medical information** provided by healthcare providers is forgotten immediately, and nearly half of the information remembered is incorrect.
- **Health Literacy & Jargon:** Patients leaving hospitals with dense discharge papers, complex medication schedules, and post-operative warnings often misinterpret crucial directives (e.g. stopping antibiotics when fever subsides, taking blood thinners with contradictory timing, or putting eye drops in the wrong eye).
- **The Teach-Back Solution:** The **"Teach-Back" method** is an evidence-based clinical communication technique endorsed by the American Medical Association (AMA) and WHO. In teach-back, a patient is asked to explain in their own words what they need to know or do. However, in high-volume hospitals and outpatient clinics across India and globally, doctors rarely have the 10–15 minutes required to conduct thorough teach-backs with every patient.

### Target Users
1. **Discharged Patients & Family Caregivers:** Individuals trying to manage post-operative care, wound dressings, and multi-drug prescriptions safely at home.
2. **Community Health Workers (e.g., ASHAs in India):** Frontline health workers verifying that a rural patient correctly understood their tuberculosis, prenatal, or antibiotic regimen.
3. **Patients with Low Health Literacy:** Users who benefit from plain-language conversion and native Hindi (हिंदी) / English bilingual explanations.

---

## 2. Key Features

- **Grounded Plain-Language Explanation:** Breaks down dense medical orders into simple, accessible language. Crucially, every claim is tagged as **Explicitly Stated in Source** or flagged as missing/inferred.
- **Persistent Source Visibility:** The original source text remains **constantly visible** on the screen during the entire interaction. It is never silently replaced or obscured.
- **Teach-Back Comprehension Verification:** The user explains their understanding in their own words. The engine analyzes this response against the explicit source text.
- **Three Objective Comparison Classifications:**
  1. `MATCHES_SOURCE` (Consistent with Supplied Source): The user's response accurately reflects the explicit source text. *(Note: Clearly marked as an interpretation check, not clinical safety proof).*
  2. `POSSIBLE_MISMATCH` (Possible Misunderstanding): Identifies specific misinterpretations (e.g. wrong eye, as-needed use instead of scheduled, stopping early).
  3. `NEEDS_CLARIFICATION` (Ambiguous / Contradictory Source): Flags incomplete or conflicting instructions (e.g. missing pediatric dosage/interval, contradictory morning vs. bedtime orders).
- **Exact Source-Excerpt Verification Engine:** Quoted citations from the source text are algorithmically verified before presentation. Verified quotes are highlighted directly in the source text view with character-level accuracy; unverified quotes display an explicit warning badge.
- **Questions for the Healthcare Professional:** Generates 2–4 targeted, actionable questions for the patient to ask their doctor or pharmacist.
- **Deterministic Emergency Bypass:** Application code (independent of the AI model) monitors for critical emergency red flags (severe breathlessness, chest pain, loss of consciousness, stroke signs, severe bleeding, anaphylaxis). When detected, the AI flow is immediately halted, and a fixed emergency alert directs the user in India to **dial 112**.
- **Full Bilingual Support (English & Hindi):** Native UI labels, explanations, teach-back prompts, and Devanagari Hindi processing.
- **Copy Summary & Session Reset:** One-click copying of a formatted summary report to clipboard.
- **Zero Protected Health Information (PHI) Retention:** No database, no cookies, no localStorage of health text, and session-only memory handling.

---

## 3. Technology & Architecture

### Architectural Decision
Per prompt specification section 2 (*"If any preferred component is incompatible with the available environment, choose the simplest reasonable alternative and document the decision"*), SamajhCare is built as a **zero-dependency, high-fidelity standalone browser application**:

```
┌─────────────────────────────────────────────────────────────┐
│                      SAMAJHCARE APP                         │
│   (React 18 + Tailwind CSS + Lucide Icons + Hind/Inter)     │
└──────────────────────────────┬──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│   DETERMINISTIC SAFETY       │        │   GROUNDED EXCERPT VERIFIER  │
│   Emergency Triage Engine    │        │   Exact Substring & Token    │
│   • Checkbox & Regex Scan    │        │   Confidence Verification    │
│   • Immediate 112 Bypass     │        │   • Verified Highlight       │
│   • Hardcoded Alert          │        │   • Hallucination Rejection  │
└──────────────────────────────┘        └──────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│   OFFLINE SIMULATION ENGINE  │        │   LIVE GEMINI API PROXY      │
│   • Instant Zero-Setup Demo  │        │   • Google Gemini 2.5 Flash  │
│   • 12 Synthetic Clinical    │        │   • Strict JSON Schema       │
│     Edge Case Scenarios      │        │   • Session-Only API Key     │
│   • Deterministic Paraphrase │        │   • Temperature 0.1 Grounding│
└──────────────────────────────┘        └──────────────────────────────┘
```

- **Frontend:** React 18, Tailwind CSS, clean SVG icons, and Google Fonts (Inter and Hind for Hindi Devanagari).
- **AI Engine:** Google Gemini REST API (`gemini-2.5-flash` / `gemini-1.5-flash`) with structured JSON schema and low temperature (`0.1`) for reproducible factual grounding.
- **Dual-Mode Flexibility:**
  - **Offline High-Fidelity Simulation Mode:** Evaluators can immediately test all 6 clinical scenarios and 12 automated unit tests without requiring an API key.
  - **Live Gemini API Mode:** Users can enter their Gemini API key in an in-memory session dialog to run live model requests.
- **Repository Size:** Less than 2 MB (well under the 10 MB promptathon limit).

---

## 4. Safety & Privacy Implementation

1. **Deterministic Emergency Gatekeeper:**
   - Evaluates warning signs in client-side code *before* any network or model call.
   - Triggers on: Severe difficulty breathing, crushing chest pain, loss of consciousness, stroke signs (facial drooping/slurred speech), uncontrolled bleeding, or severe allergic reaction.
   - **Action:** Halts AI flow immediately. Fixed message directs user in India to **dial 112** (or 102/108 ambulance). The AI cannot override this branch.
2. **Strict Grounding Guardrails:**
   - System prompts forbid extrapolation, diagnosing, or prescribing new treatments.
   - Numbers, units (mg, mL, drops), dates, and medicine names are preserved verbatim.
3. **Zero Data Retention:**
   - No external database.
   - No localStorage or cookies for health instructions or teach-back responses.
   - No logging of patient text to server consoles.
4. **Input Boundary Protection:**
   - Instructions are limited to 1–5,000 characters to prevent buffer exploits and denial of service.

---

## 5. Quick Start & Local Execution

### Option A: Direct Browser Execution (Zero Setup)
Simply open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge):
```bash
# On Windows
start index.html

# On macOS
open index.html

# On Linux
xdg-open index.html
```

### Option B: Local Static Server
If you prefer running via a local HTTP server:
```bash
# Using Python 3
python -m http.server 8000
# Open http://localhost:8000

# Or using Node.js npx serve
npx serve .
```

---

## 6. Testing & Scenario Matrix

SamajhCare includes a built-in automated test suite running **12 synthetic clinical test cases**. To run the tests:
1. Open the app in your browser.
2. Click the **"Test Suite (12)"** button on the top navigation bar.
3. Observe real-time execution of the 12 assertions with duration and status details.

### Test Scenarios Covered (See [tests/scenarios.md](tests/scenarios.md)):
1. **TC-01:** Faithful paraphrase of oral antibiotic course (`MATCHES_SOURCE`).
2. **TC-02:** Incorrect eye drop application and tap water violation (`POSSIBLE_MISMATCH`).
3. **TC-03:** Pediatric paracetamol missing weight-based dosage and hourly safety interval (`NEEDS_CLARIFICATION`).
4. **TC-04:** Contradictory morning vs. bedtime Warfarin instructions (`NEEDS_CLARIFICATION`).
5. **TC-05:** Non-absorbable surgical suture removal misunderstanding (`POSSIBLE_MISMATCH`).
6. **TC-06:** Deterministic emergency checkbox bypass (Directs to 112).
7. **TC-07:** Automated regex emergency keyword detection on input text (Directs to 112).
8. **TC-08:** Hindi-language Devanagari antibiotic course grounding (`MATCHES_SOURCE`).
9. **TC-09:** Verbatim source-excerpt verification and exact quotation highlight.
10. **TC-10:** Hallucinated quote rejection and uncertainty notice.
11. **TC-11:** Input sanitization (empty string and 5,000 character limit enforcement).
12. **TC-12:** Prompt-injection safety and clinical guardrail preservation.

---

## 7. Public Deployment Guide

SamajhCare can be deployed to any static hosting provider in seconds:

### Deploying to GitHub Pages
1. Push this repository to a public GitHub repository.
2. Go to **Settings > Pages**.
3. Under **Branch**, select `main` (root) and click **Save**.
4. Your application will be live at `https://<username>.github.io/<repo-name>/`.

### Deploying to Vercel / Netlify
- **Vercel:** Run `vercel` in the project root or import the repository in the Vercel dashboard with zero configuration.
- **Netlify:** Drag and drop the folder into Netlify Drop, or connect via GitHub.

---

## 8. Limitations & Clinical Disclaimer

- **Educational Tool Only:** SamajhCare is designed strictly as a reading comprehension and teach-back verification aid. It is **NOT** a medical diagnostic device, clinical decision support system, or substitute for a licensed physician, pharmacist, or nurse.
- **No Treatment Changes:** The app never suggests changing a dosage, stopping medication, or initiating new treatments.
- **Emergency Situations:** The absence of selected warning signs does not guarantee that no emergency exists. In an emergency in India, call **112** immediately.
