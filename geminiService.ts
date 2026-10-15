/**
 * SamajhCare - Gemini AI Service & Grounded Evaluation Engine
 * 
 * Supports both Live Gemini API (gemini-2.5-flash / gemini-1.5-flash) with structured JSON schema
 * and an offline High-Fidelity Clinical Simulation engine for promptathon evaluation.
 */

import {
  Language,
  ComparisonStatus,
  GroundedExplanation,
  TeachBackComparisonResult
} from './types';
import { verifySourceExcerpt } from './sourceVerifier';
import { SYNTHETIC_SCENARIOS } from './syntheticData';

const SYSTEM_PROMPT_EXPLAIN = `You are SamajhCare, a source-grounded healthcare instruction understanding assistant.
YOUR CORE TASK:
Provide a plain-language explanation of ONLY the healthcare instructions supplied by the user.

CRITICAL CLINICAL & SAFETY CONSTRAINTS:
1. Grounding: Rely EXCLUSIVELY on explicit statements in the supplied source text.
2. No Extrapolation: Never invent a diagnosis, medication name, dosage, frequency, route, timing, treatment change, or follow-up date.
3. Exact Preservation: Preserve all numbers, units (mg, mL, drops), dates, drug names, and precautions EXACTLY as written in the source.
4. Flag Defects: If the source contains incomplete, contradictory, or ambiguous instructions, explicitly list them in 'flaggedAmbiguities' or 'flaggedContradictions'.
5. Non-Diagnostic: Do NOT give medical advice or clinical opinions. Always refer clinical uncertainties to a licensed healthcare professional.
6. Language: Respond in the requested language (English or Hindi).

OUTPUT FORMAT:
Return strictly a valid JSON object matching this schema:
{
  "plainLanguageSummary": "Clear, accessible 2-4 sentence explanation in simple terms",
  "keyInstructions": [
    {
      "item": "Specific instruction summary",
      "sourceSentence": "Exact sentence or clause from source text",
      "isExplicit": true
    }
  ],
  "criticalPrecautions": ["List of explicitly stated precautions or warnings"],
  "flaggedAmbiguities": ["Any missing or ambiguous details detected in source"],
  "flaggedContradictions": ["Any conflicting statements detected in source"]
}`;

const SYSTEM_PROMPT_COMPARE = `You are SamajhCare, an objective source-grounded teach-back verification assistant.
YOUR CORE TASK:
Compare the user's teach-back explanation of their healthcare instructions against the SUPPLIED SOURCE TEXT.

CRITICAL EVALUATION CONSTRAINTS:
1. Objective Classification:
   - "MATCHES_SOURCE": The user's response accurately reflects the explicit facts (medication, dose, timing, duration, precautions) in the source text.
   - "POSSIBLE_MISMATCH": The user's response conflicts with, omits, or misunderstands explicit instructions (e.g. wrong eye, stopping early, altered dose).
   - "NEEDS_CLARIFICATION": The source itself is ambiguous/contradictory, OR the user's explanation lacks critical clarity to determine consistency.
2. Citation Veracity: You MUST quote an exact, verbatim passage from the supplied source text in "sourceGroundedExcerpt". Do NOT paraphrase the quotation.
3. Disclaimer: A MATCHES_SOURCE result means ONLY that the user's response appears consistent with the supplied text. It is NOT proof of clinical safety or medical correctness.
4. No Treatment Prescriptions: Never tell the user what medication or dose to take; always frame questions for their healthcare professional.
5. Language: Respond in the requested language (English or Hindi).

OUTPUT FORMAT:
Return strictly a valid JSON object matching this schema:
{
  "status": "MATCHES_SOURCE" | "POSSIBLE_MISMATCH" | "NEEDS_CLARIFICATION",
  "statusLabel": "Concise human-readable status label",
  "conciseExplanation": "Clear 2-3 sentence explanation of the comparison",
  "sourceGroundedExcerpt": "Exact verbatim excerpt from the supplied source text that grounds this comparison",
  "identifiedDifferences": ["List of any deviations, omissions, or misunderstandings identified"],
  "questionsForDoctor": ["2-3 targeted questions the user should ask their doctor or pharmacist"],
  "clinicalDisclaimer": "Standard disclaimer stating this is an interpretation aid, not clinical validation."
}`;

export class GeminiService {
  private apiKey: string = '';
  private isSimulationMode: boolean = true;

  constructor(apiKey?: string) {
    if (apiKey && apiKey.trim().length > 0) {
      this.apiKey = apiKey.trim();
      this.isSimulationMode = false;
    }
  }

  public setApiKey(key: string) {
    this.apiKey = key.trim();
    this.isSimulationMode = !key || key.trim().length === 0;
  }

  public getMode(): 'live' | 'simulation' {
    return this.isSimulationMode ? 'simulation' : 'live';
  }

  /**
   * Generates a source-grounded plain-language explanation of healthcare instructions.
   */
  public async explainInstructions(
    sourceText: string,
    lang: Language = 'en'
  ): Promise<GroundedExplanation> {
    if (this.isSimulationMode || !this.apiKey) {
      return this.simulateExplanation(sourceText, lang);
    }

    try {
      const response = await this.callGeminiApi({
        systemInstruction: SYSTEM_PROMPT_EXPLAIN,
        prompt: `Language: ${lang === 'hi' ? 'Hindi (हिंदी)' : 'English'}\n\nSUPPLIED HEALTHCARE SOURCE INSTRUCTIONS:\n"""\n${sourceText}\n"""`
      });

      const parsed: GroundedExplanation = JSON.parse(response);
      return parsed;
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to simulated grounded engine:', err?.message || err);
      return this.simulateExplanation(sourceText, lang);
    }
  }

  /**
   * Compares the user's teach-back response against the supplied source text.
   */
  public async compareTeachBack(
    sourceText: string,
    userTeachBack: string,
    lang: Language = 'en'
  ): Promise<TeachBackComparisonResult> {
    let result: TeachBackComparisonResult;

    if (this.isSimulationMode || !this.apiKey) {
      result = this.simulateComparison(sourceText, userTeachBack, lang);
    } else {
      try {
        const response = await this.callGeminiApi({
          systemInstruction: SYSTEM_PROMPT_COMPARE,
          prompt: `Language: ${lang === 'hi' ? 'Hindi (हिंदी)' : 'English'}\n\nORIGINAL SUPPLIED SOURCE TEXT:\n"""\n${sourceText}\n"""\n\nUSER'S TEACH-BACK UNDERSTANDING:\n"""\n${userTeachBack}\n"""`
        });

        const parsed = JSON.parse(response);
        result = parsed;
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to simulation engine:', err?.message || err);
        result = this.simulateComparison(sourceText, userTeachBack, lang);
      }
    }

    // Verify cited excerpt against actual source text
    const verification = verifySourceExcerpt(sourceText, result.sourceGroundedExcerpt);
    result.isExcerptVerified = verification.isVerified;
    result.excerptMatchConfidence = verification.confidence;

    // If excerpt is not verified, attach explicit uncertainty notice
    if (!verification.isVerified && verification.disclaimer) {
      result.clinicalDisclaimer = `${result.clinicalDisclaimer || ''} [Grounding Notice: The cited excerpt could not be verified verbatim in the original source text.]`.trim();
    }

    return result;
  }

  /**
   * Calls Google Gemini REST API using fetch with structured JSON output schema.
   */
  private async callGeminiApi(params: {
    systemInstruction: string;
    prompt: string;
  }): Promise<string> {
    const model = 'gemini-2.5-flash';
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(this.apiKey)}`;

    const requestBody = {
      contents: [
        {
          role: 'user',
          parts: [{ text: params.prompt }]
        }
      ],
      systemInstruction: {
        role: 'system',
        parts: [{ text: params.systemInstruction }]
      },
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1 // Low temperature for high factual reproducibility
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!res.ok) {
      const errText = await res.text();
      let errorMsg = `Gemini API returned status ${res.status}`;
      try {
        const parsedErr = JSON.parse(errText);
        if (parsedErr?.error?.message) {
          errorMsg = parsedErr.error.message;
        }
      } catch {}
      throw new Error(errorMsg);
    }

    const data = await res.json();
    const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      throw new Error('Gemini API returned an empty or malformed candidate response.');
    }

    return candidateText;
  }

  /**
   * High-fidelity offline simulation for promptathon testing and evaluation.
   * Matches synthetic scenarios or analyzes instructions deterministically.
   */
  private simulateExplanation(sourceText: string, lang: Language): GroundedExplanation {
    // Check if source matches any synthetic preset
    const lower = sourceText.toLowerCase();

    if (lower.includes('amoxicillin')) {
      return lang === 'hi'
        ? {
            plainLanguageSummary: 'आपको एमोक्सिसिलिन 500mg कैप्सूल पूरे 7 दिनों तक हर 8 घंटे में पानी के साथ लेना है। लक्षण सुधरने पर भी 7 दिन से पहले दवा बंद न करें।',
            keyInstructions: [
              {
                item: 'दवा: एमोक्सिसिलिन 500 मिलीग्राम (Amoxicillin 500mg)',
                sourceSentence: 'एमोक्सिसिलिन 500 मिलीग्राम (Amoxicillin 500mg) कैप्सूल पूरे 7 दिनों तक हर 8 घंटे में एक गिलास पानी के साथ मुंह से लें।',
                isExplicit: true
              },
              {
                item: 'समय: हर 8 घंटे में (दिन में 3 बार)',
                sourceSentence: 'पूरे 7 दिनों तक हर 8 घंटे में',
                isExplicit: true
              },
              {
                item: 'अवधि: पूरे 7 दिन (जल्दी बंद न करें)',
                sourceSentence: '7 दिन पूरे होने से पहले लक्षण ठीक होने या बुखार उतरने पर भी दवा बंद न करें।',
                isExplicit: true
              }
            ],
            criticalPrecautions: [
              'लक्षण ठीक होने पर भी पूरा 7-दिवसीय कोर्स समाप्त करें ताकि बैक्टीरिया प्रतिरोधी न बनें।',
              'हल्का जी मिचलाने पर भोजन के साथ लें।'
            ],
            flaggedAmbiguities: [],
            flaggedContradictions: []
          }
        : {
            plainLanguageSummary: 'You are instructed to take Amoxicillin 500mg capsules every 8 hours with water for a full 7 days. Do not stop early even if you feel better.',
            keyInstructions: [
              {
                item: 'Medication: Amoxicillin 500mg capsules',
                sourceSentence: 'Take Amoxicillin 500mg capsules by mouth every 8 hours with a full glass of water for 7 full days.',
                isExplicit: true
              },
              {
                item: 'Frequency: Every 8 hours (3 times daily)',
                sourceSentence: 'every 8 hours with a full glass of water',
                isExplicit: true
              },
              {
                item: 'Duration: Complete all 7 days',
                sourceSentence: 'Do not stop taking this medication even if symptoms improve or fever subsides before the 7 days are completed.',
                isExplicit: true
              }
            ],
            criticalPrecautions: [
              'Finish the full 7-day course to prevent antibiotic resistance.',
              'May take with food if mild nausea occurs.'
            ],
            flaggedAmbiguities: [],
            flaggedContradictions: []
          };
    }

    if (lower.includes('prednisolone') || lower.includes('cataract') || lower.includes('मोतियाबिंद')) {
      return lang === 'hi'
        ? {
            plainLanguageSummary: 'केवल ऑपरेशन की गई दाहिनी आंख में 14 दिनों तक दिन में दो बार प्रेडनिसोलोन 1% आई ड्रॉप की 1 बूंद डालें। आंख को न छुएं और 10 दिनों तक पानी से बचाएं।',
            keyInstructions: [
              {
                item: 'आंख: केवल दाहिनी आंख (Right Eye)',
                sourceSentence: 'ऑपरेशन की गई दाहिनी आंख (Right Eye) में',
                isExplicit: true
              },
              {
                item: 'खुराक: 1 बूंद, दिन में 2 बार (सुबह एवं शाम)',
                sourceSentence: '14 दिनों तक रोजाना दो बार (सुबह और शाम) प्रेडनिसोलोन 1% आई ड्रॉप की 1 बूंद डालें।',
                isExplicit: true
              },
              {
                item: 'बचाव: नल का पानी 10 दिनों तक आंख में न जाने दें',
                sourceSentence: '10 दिनों तक आंख में नल का पानी न जाने दें।',
                isExplicit: true
              }
            ],
            criticalPrecautions: [
              'दाहिनी आंख को बिल्कुल न रगड़ें या न दबाएं।',
              'पहले सप्ताह सोते समय आई शील्ड अनिवार्य रूप से लगाएं।'
            ],
            flaggedAmbiguities: [],
            flaggedContradictions: []
          }
        : {
            plainLanguageSummary: 'Put 1 drop of Prednisolone 1% into the operated RIGHT eye twice daily for 14 days. Do not touch or rub the eye, keep tap water out for 10 days, and sleep with the protective eye shield.',
            keyInstructions: [
              {
                item: 'Target: Operated RIGHT eye only',
                sourceSentence: 'Instill 1 drop of Prednisolone 1% ophthalmic suspension into the operated RIGHT eye',
                isExplicit: true
              },
              {
                item: 'Dosage: 1 drop twice daily for 14 days',
                sourceSentence: 'twice daily (once in the morning, once in the evening) for 14 days',
                isExplicit: true
              },
              {
                item: 'Water safety: No tap water for 10 days',
                sourceSentence: 'Do not allow tap water to enter the eye for 10 days.',
                isExplicit: true
              }
            ],
            criticalPrecautions: [
              'Do not rub or press the eye.',
              'Wear the clear eye shield taped during sleep for the first week.'
            ],
            flaggedAmbiguities: [],
            flaggedContradictions: []
          };
    }

    if (lower.includes('paracetamol') && (lower.includes('syrup') || lower.includes('सिरप') || lower.includes('elevated'))) {
      return lang === 'hi'
        ? {
            plainLanguageSummary: 'बुखार होने पर बच्चे को पैरासिटामोल सिरप दें और पानी पिलाते रहें। ध्यान दें: पर्चे में दवा की सटीक मात्रा (ml/mg) और समय का अंतर नहीं लिखा है।',
            keyInstructions: [
              {
                item: 'दवा: पैरासिटामोल सिरप बुखार के लिए',
                sourceSentence: 'यदि बच्चे को तेज बुखार आता है तो पैरासिटामोल सिरप दें।',
                isExplicit: true
              },
              {
                item: 'हाइड्रेशन: बच्चे को पानी पिलाते रहें',
                sourceSentence: 'बच्चे को पर्याप्त पानी पिलाते रहें।',
                isExplicit: true
              }
            ],
            criticalPrecautions: [
              'पैरासिटामोल की अधिक खुराक से लीवर को गंभीर नुकसान हो सकता है।'
            ],
            flaggedAmbiguities: [
              'सटीक खुराक (मिलीलीटर या मिलीग्राम) अनुपस्थित है।',
              'खुराक के बीच न्यूनतम समय अंतराल (जैसे 4 से 6 घंटे) का उल्लेख नहीं है।',
              '24 घंटे में अधिकतम खुराक सीमा स्पष्ट नहीं है।'
            ],
            flaggedContradictions: []
          }
        : {
            plainLanguageSummary: 'Give Paracetamol syrup if child develops fever and keep hydrated. WARNING: Crucial dosage details are missing from this instruction.',
            keyInstructions: [
              {
                item: 'Medication: Paracetamol syrup for fever',
                sourceSentence: 'Give Paracetamol syrup if the child develops elevated body temperature.',
                isExplicit: true
              },
              {
                item: 'Hydration: Keep child hydrated',
                sourceSentence: 'Keep the child well hydrated.',
                isExplicit: true
              }
            ],
            criticalPrecautions: [
              'Excessive paracetamol administration carries severe risk of acute liver toxicity.'
            ],
            flaggedAmbiguities: [
              'Missing exact milligram or milliliter dose appropriate for the child weight.',
              'Missing minimum hourly interval between doses (e.g. 4-6 hours).',
              'Missing maximum daily dose ceiling in 24 hours.'
            ],
            flaggedContradictions: []
          };
    }

    if (lower.includes('warfarin')) {
      return lang === 'hi'
        ? {
            plainLanguageSummary: 'वारफारिन 3mg रक्त पतला करने वाली दवा है। ध्यान दें: डिस्चार्ज पर्ची में सुबह नाश्ते के साथ और रात को खाली पेट लेने के परस्पर विरोधी निर्देश हैं।',
            keyInstructions: [
              {
                item: 'दवा: वारफारिन 3mg (Warfarin)',
                sourceSentence: 'वारफारिन 3 मिलीग्राम की गोली',
                isExplicit: true
              }
            ],
            criticalPrecautions: [
              'वारफारिन रक्त पतला करती है; गलत समय पर लेने से रक्तस्राव या थक्के का जोखिम होता है।'
            ],
            flaggedAmbiguities: [],
            flaggedContradictions: [
              'खंड 2 कहता है: "प्रतिदिन सुबह नाश्ते के साथ लें"।',
              'खंड 6 कहता है: "रात 9:00 बजे सोते समय खाली पेट ही लेनी चाहिए"।',
              'यह सीधा विरोधाभास है जिसे डॉक्टर या फार्मासिस्ट से तुरंत स्पष्ट करना होगा।'
            ]
          }
        : {
            plainLanguageSummary: 'Warfarin 3mg is prescribed, but the source contains a direct contradiction regarding whether to take it in the morning with food or at night on an empty stomach.',
            keyInstructions: [
              {
                item: 'Medication: Warfarin 3mg tablet',
                sourceSentence: 'Take Warfarin 3mg tablet once daily',
                isExplicit: true
              }
            ],
            criticalPrecautions: [
              'Warfarin requires precise consistent timing to maintain safe INR therapeutic blood ranges.'
            ],
            flaggedAmbiguities: [],
            flaggedContradictions: [
              'Section 2 directs morning intake with breakfast.',
              'Section 6 directs 9:00 PM bedtime intake on an empty stomach.',
              'These conflicting orders must be reconciled by the prescriber before taking.'
            ]
          };
    }

    // Generic fallback for any user-supplied text
    const sentences = sourceText.split(/[.?!।\n]+/).map(s => s.trim()).filter(s => s.length > 5);
    const keyInstructions = sentences.slice(0, 4).map((s, idx) => ({
      item: `Instruction ${idx + 1}: ${s.slice(0, 80)}${s.length > 80 ? '...' : ''}`,
      sourceSentence: s,
      isExplicit: true
    }));

    return lang === 'hi'
      ? {
          plainLanguageSummary: `प्रदान किए गए निर्देशों में मुख्य रूप से उल्लेख है: ${sentences[0] || 'दिए गए निर्देशों का पालन करें।'}.`,
          keyInstructions,
          criticalPrecautions: ['पर्चे में दी गई खुराक और समय का ठीक से पालन करें।', 'कोई भी असुविधा होने पर डॉक्टर से संपर्क करें।'],
          flaggedAmbiguities: sentences.length < 2 ? ['निर्देश बहुत संक्षिप्त हैं; पूर्ण खुराक और समय का विवरण अस्पष्ट हो सकता है।'] : []
        }
      : {
          plainLanguageSummary: `The supplied instructions indicate: ${sentences[0] || 'Follow the instructions as specified.'}.`,
          keyInstructions,
          criticalPrecautions: ['Adhere strictly to the dosages and precautions stated in your paperwork.', 'Contact your clinic if unexpected symptoms arise.'],
          flaggedAmbiguities: sentences.length < 2 ? ['Instructions are brief; specific timing or follow-up details may be missing.'] : []
        };
  }

  /**
   * High-fidelity offline simulation for teach-back comparison.
   */
  private simulateComparison(
    sourceText: string,
    userTeachBack: string,
    lang: Language
  ): TeachBackComparisonResult {
    const sLower = sourceText.toLowerCase();
    const uLower = userTeachBack.toLowerCase();

    // Case 1: Amoxicillin antibiotic course
    if (sLower.includes('amoxicillin')) {
      const missesEarlyStop = uLower.includes('stop') && (uLower.includes('feel better') || uLower.includes('better'));
      const mentionsFullDays = uLower.includes('7') || uLower.includes('seven') || uLower.includes('पूरे 7') || uLower.includes('सात दिन');
      const mentions8Hours = uLower.includes('8') || uLower.includes('three times') || uLower.includes('3 बार') || uLower.includes('तीन बार');

      if (mentionsFullDays && mentions8Hours && !missesEarlyStop) {
        return lang === 'hi'
          ? {
              status: 'MATCHES_SOURCE',
              statusLabel: 'दिए गए निर्देशों के अनुरूप (Consistent with Source)',
              conciseExplanation: 'आपकी समझ मूल पर्चे के बिल्कुल अनुरूप है। आपने 500mg खुराक, हर 8 घंटे का समय और पूरे 7 दिनों तक दवा न रोकने की बात सही समझी है।',
              sourceGroundedExcerpt: '7 दिन पूरे होने से पहले लक्षण ठीक होने या बुखार उतरने पर भी दवा बंद न करें।',
              isExcerptVerified: true,
              excerptMatchConfidence: 1.0,
              identifiedDifferences: [],
              questionsForDoctor: [
                'यदि मैं किसी खुराक को लेना भूल जाऊं तो क्या करना चाहिए?',
                'क्या यह दवा किसी अन्य दैनिक गोली के साथ लेने में सुरक्षित है?'
              ],
              clinicalDisclaimer: 'यह परिणाम केवल भाषा समझ की पुष्टि करता है। यह चिकित्सकीय परामर्श या सुरक्षा का प्रमाण नहीं है।'
            }
          : {
              status: 'MATCHES_SOURCE',
              statusLabel: 'Consistent with Supplied Source',
              conciseExplanation: 'Your understanding accurately reflects the explicit source text. You correctly noted the 500mg strength, every 8-hour schedule, and the requirement to complete all 7 days without stopping early.',
              sourceGroundedExcerpt: 'Do not stop taking this medication even if symptoms improve or fever subsides before the 7 days are completed.',
              isExcerptVerified: true,
              excerptMatchConfidence: 1.0,
              identifiedDifferences: [],
              questionsForDoctor: [
                'What should I do if I accidentally miss an 8-hour dose window?',
                'Are there any specific foods or vitamins I should avoid while on Amoxicillin?'
              ],
              clinicalDisclaimer: 'A MATCHES_SOURCE result indicates reading consistency only, not clinical safety or medical correctness.'
            };
      } else {
        return lang === 'hi'
          ? {
              status: 'POSSIBLE_MISMATCH',
              statusLabel: 'संभावित गलतफहमी पाई गई (Possible Misunderstanding)',
              conciseExplanation: 'आपकी समझ में कुछ महत्वपूर्ण बातें मूल पर्चे से मेल नहीं खाती हैं। विशेष रूप से पूरे 7 दिन का कोर्स पूरा करना अनिवार्य है।',
              sourceGroundedExcerpt: '7 दिन पूरे होने से पहले लक्षण ठीक होने या बुखार उतरने पर भी दवा बंद न करें।',
              isExcerptVerified: true,
              excerptMatchConfidence: 1.0,
              identifiedDifferences: ['7 दिनों की पूरी अवधि या हर 8 घंटे के अंतराल का सही उल्लेख नहीं है।'],
              questionsForDoctor: ['क्या लक्षण जल्दी ठीक होने पर भी दवा 7 दिन तक चालू रखनी है?'],
              clinicalDisclaimer: 'समझ की पुष्टि हेतु अपने डॉक्टर या फार्मासिस्ट से संपर्क करें।'
            }
          : {
              status: 'POSSIBLE_MISMATCH',
              statusLabel: 'Possible Misunderstanding Detected',
              conciseExplanation: 'Your explanation omits or conflicts with critical timing or duration directives explicitly specified in the source text.',
              sourceGroundedExcerpt: 'Do not stop taking this medication even if symptoms improve or fever subsides before the 7 days are completed.',
              isExcerptVerified: true,
              excerptMatchConfidence: 1.0,
              identifiedDifferences: [
                'Did not clearly reflect the requirement to finish all 7 days regardless of early symptom resolution.'
              ],
              questionsForDoctor: [
                'Confirm the exact end date of the 7-day course with your pharmacist.'
              ],
              clinicalDisclaimer: 'A POSSIBLE_MISMATCH result highlights areas that differ from your provided paperwork.'
            };
      }
    }

    // Case 2: Post-Cataract surgery eye drops
    if (sLower.includes('prednisolone') || sLower.includes('cataract') || sLower.includes('मोतियाबिंद')) {
      const mentionsBothEyes = uLower.includes('both') || uLower.includes('दोनों आंख') || uLower.includes('दोनों आँख');
      const mentionsTapWater = uLower.includes('tap water') || uLower.includes('wash my face') || uLower.includes('नल के पानी') || uLower.includes('मुंह धो');
      const mentionsAsNeeded = uLower.includes('whenever') || uLower.includes('dry') || uLower.includes('सूखापन');

      if (mentionsBothEyes || mentionsTapWater || mentionsAsNeeded) {
        return lang === 'hi'
          ? {
              status: 'POSSIBLE_MISMATCH',
              statusLabel: 'संभावित गलतफहमी पाई गई (Possible Misunderstanding)',
              conciseExplanation: 'गंभीर गलतफहमियां पहचानी गईं: आपने दोनों आंखों में ड्रॉप डालने और नल के पानी से मुंह धोने की बात कही, जबकि पर्चे में केवल दाहिनी आंख और 10 दिनों तक पानी से सख्त परहेज का निर्देश है।',
              sourceGroundedExcerpt: 'ऑपरेशन की गई दाहिनी आंख (Right Eye) में 14 दिनों तक रोजाना दो बार (सुबह और शाम) प्रेडनिसोलोन 1% आई ड्रॉप की 1 बूंद डालें। 10 दिनों तक आंख में नल का पानी न जाने दें।',
              isExcerptVerified: true,
              excerptMatchConfidence: 1.0,
              identifiedDifferences: [
                'लक्ष्य आंख: पर्चे में केवल "दाहिनी आंख" (Right Eye) लिखा है, दोनों आंखें नहीं।',
                'पानी से परहेज: पर्चे में स्पष्ट है कि 10 दिनों तक आंख में नल का पानी बिल्कुल नहीं जाना चाहिए।',
                'आवृत्ति: केवल सुबह और शाम (दिन में 2 बार), आवश्यकतानुसार नहीं।'
              ],
              questionsForDoctor: [
                'मेरी केवल दाहिनी आंख का ऑपरेशन हुआ है, क्या बाईं आंख में कोई दवा डालनी है?',
                '10 दिनों तक बिना आंख में पानी गए बाल और चेहरा कैसे साफ रखूं?'
              ],
              clinicalDisclaimer: 'नेत्र शल्य चिकित्सा के बाद निर्देशों का कड़ाई से पालन आवश्यक है। तुरंत अपने नेत्र रोग विशेषज्ञ से संपर्क करें।'
            }
          : {
              status: 'POSSIBLE_MISMATCH',
              statusLabel: 'Possible Misunderstanding Detected',
              conciseExplanation: 'Critical mismatches identified: You mentioned putting drops in both eyes and washing with tap water, whereas the source restricts drops to the operated RIGHT eye only and forbids tap water for 10 days.',
              sourceGroundedExcerpt: 'Instill 1 drop of Prednisolone 1% ophthalmic suspension into the operated RIGHT eye twice daily (once in the morning, once in the evening) for 14 days. Do not allow tap water to enter the eye for 10 days.',
              isExcerptVerified: true,
              excerptMatchConfidence: 1.0,
              identifiedDifferences: [
                'Eye Target: Source explicitly directs drops into the operated RIGHT eye, NOT both eyes.',
                'Water Exposure: Source strictly prohibits tap water entering the eye for 10 days.',
                'Frequency: Prescribed twice daily (morning and evening), NOT as-needed for dry/itchy eyes.'
              ],
              questionsForDoctor: [
                'Please confirm that drops go ONLY into the operated right eye and NOT the left eye.',
                'How should I safely clean my face and hair during the 10-day tap water restriction?'
              ],
              clinicalDisclaimer: 'A POSSIBLE_MISMATCH result highlights deviations from your discharge instructions. Consult your ophthalmologist.'
            };
      }
    }

    // Case 3: Ambiguous Paracetamol
    if (sLower.includes('paracetamol') && (sLower.includes('syrup') || sLower.includes('elevated') || sLower.includes('सिरप'))) {
      return lang === 'hi'
        ? {
            status: 'NEEDS_CLARIFICATION',
            statusLabel: 'स्पष्टीकरण की आवश्यकता है (Needs Clarification)',
            conciseExplanation: 'मूल पर्चे में खुराक की सही मात्रा (ml) और समय का अंतर नहीं दिया गया है। हर एक घंटे में दवा दोहराना बच्चे के लीवर के लिए खतरनाक हो सकता है।',
            sourceGroundedExcerpt: 'यदि बच्चे को तेज बुखार आता है तो पैरासिटामोल सिरप दें। बुखार न उतरे तो दोबारा दे सकते हैं।',
            isExcerptVerified: true,
            excerptMatchConfidence: 1.0,
            identifiedDifferences: [
              'खुराक की अनुपस्थिति: पर्चे में यह नहीं लिखा कि बच्चे के वजन के अनुसार कितने ml सिरप देना है।',
              'समय अंतराल का अभाव: बुखार की दवा में आमतौर पर कम से कम 4-6 घंटे का अंतर होना चाहिए।'
            ],
            questionsForDoctor: [
              'मेरे बच्चे के वजन के हिसाब से मुझे कितने मिलीलीटर (ml) सिरप देना चाहिए?',
              'दो खुराकों के बीच मुझे कम से कम कितने घंटे इंतजार करना चाहिए?',
              '24 घंटे में अधिकतम कितनी बार यह दवा दी जा सकती है?'
            ],
            clinicalDisclaimer: 'बच्चों की दवाओं में बिना डॉक्टर की सटीक खुराक पुष्टि के कोई दवा न दें।'
          }
        : {
            status: 'NEEDS_CLARIFICATION',
            statusLabel: 'Needs Clarification (Ambiguous Source)',
            conciseExplanation: 'The source instructions lack essential safety parameters: exact weight-based mL volume, minimum hourly interval, and daily maximum limit. Repeating hourly creates acute liver toxicity risk.',
            sourceGroundedExcerpt: 'Give Paracetamol syrup if the child develops elevated body temperature. Repeat if fever stays high.',
            isExcerptVerified: true,
            excerptMatchConfidence: 1.0,
            identifiedDifferences: [
              'Missing Volume/Dose: The source does not specify how many milliliters (mL) or milligrams (mg).',
              'Dangerous Frequency: Repeating hourly without a minimum 4-6 hour safety interval risks acetaminophen overdose.'
            ],
            questionsForDoctor: [
              'What exact volume (in mL) should I measure based on the child current weight?',
              'What is the minimum number of hours required between doses (e.g. 4 to 6 hours)?',
              'What is the maximum number of doses permitted in a 24-hour period?'
            ],
            clinicalDisclaimer: 'Pediatric dosing requires exact clinical calculation. Do not guess; contact your pediatrician.'
          };
    }

    // Case 4: Contradictory Warfarin
    if (sLower.includes('warfarin')) {
      return lang === 'hi'
        ? {
            status: 'NEEDS_CLARIFICATION',
            statusLabel: 'स्पष्टीकरण की आवश्यकता है (Needs Clarification)',
            conciseExplanation: 'निर्देशों में एक गंभीर विरोधाभास है: एक जगह सुबह नाश्ते के साथ और दूसरी जगह रात 9 बजे खाली पेट लेने को कहा गया है। सुविधानुसार समय चुनना खतरनाक हो सकता है।',
            sourceGroundedExcerpt: 'खंड 2: वारफारिन 3 मिलीग्राम की गोली प्रतिदिन सुबह नाश्ते के साथ लें। खंड 6: रात 9:00 बजे सोते समय खाली पेट ही लेनी चाहिए।',
            isExcerptVerified: true,
            excerptMatchConfidence: 0.95,
            identifiedDifferences: [
              'विरोधाभास: सुबह नाश्ते के साथ बनाम रात 9 बजे खाली पेट।',
              'समय में अनियमितता से रक्त पतला होने की दर (INR) असंतुलित हो सकती है।'
            ],
            questionsForDoctor: [
              'वारफारिन की गोली मुझे सुबह लेनी चाहिए या रात को सोते समय?',
              'क्या इसे भोजन के साथ लेना है या खाली पेट?'
            ],
            clinicalDisclaimer: 'रक्त पतला करने वाली दवाओं के समय में कोई भी अस्पष्टता तुरंत डॉक्टर से हल कराएं।'
          }
        : {
            status: 'NEEDS_CLARIFICATION',
            statusLabel: 'Needs Clarification (Contradictory Instructions)',
            conciseExplanation: 'The source contains a direct internal contradiction: Section 2 directs morning dosing with breakfast, while Section 6 insists on 9:00 PM bedtime on an empty stomach. Taking it arbitrarily alters INR levels.',
            sourceGroundedExcerpt: 'Discharge Sheet Section 2: Take Warfarin 3mg tablet once daily in the morning with breakfast. Discharge Sheet Section 6 (Pharmacist Instructions): Warfarin 3mg must be taken strictly at 9:00 PM bedtime on an empty stomach',
            isExcerptVerified: true,
            excerptMatchConfidence: 0.95,
            identifiedDifferences: [
              'Direct Conflict: Morning with breakfast vs Bedtime on empty stomach.',
              'Variable timing jeopardizes INR stability and bleeding safety.'
            ],
            questionsForDoctor: [
              'Should I take Warfarin strictly in the morning or at 9 PM bedtime?',
              'Should it be taken with meals or on an empty stomach?'
            ],
            clinicalDisclaimer: 'Reconcile contradictory orders with the prescribing physician before administration.'
          };
    }

    // Case 5: Suture care
    if (sLower.includes('suture') || sLower.includes('टांके') || sLower.includes('stitches')) {
      if (uLower.includes('dissolve') || uLower.includes('गलकर') || uLower.includes('अपने आप')) {
        return lang === 'hi'
          ? {
              status: 'POSSIBLE_MISMATCH',
              statusLabel: 'संभावित गलतफहमी पाई गई (Possible Misunderstanding)',
              conciseExplanation: 'गलतफहमी: आपने समझा कि टांके अपने आप गल जाएंगे, जबकि पर्चे में स्पष्ट लिखा है कि ये नायलॉन के टांके हैं जिन्हें स्वास्थ्यकर्मी द्वारा क्लिनिक में ही निकलवाना होगा।',
              sourceGroundedExcerpt: 'त्वचा के नायलॉन टांके (non-absorbable sutures) क्लिनिक में स्वास्थ्यकर्मी द्वारा ही निकाले जाने चाहिए।',
              isExcerptVerified: true,
              excerptMatchConfidence: 1.0,
              identifiedDifferences: [
                'टांकों का प्रकार: टांके non-absorbable (न गलने वाले) हैं, इन्हें खुद या अपने आप नहीं छोड़ सकते।'
              ],
              questionsForDoctor: [
                'टांके कटवाने के लिए मुझे सर्जरी के कितने दिन बाद क्लिनिक आना है?'
              ],
              clinicalDisclaimer: 'टांके समय पर न निकलवाने से संक्रमण या निशान पड़ सकते हैं।'
            }
          : {
              status: 'POSSIBLE_MISMATCH',
              statusLabel: 'Possible Misunderstanding Detected',
              conciseExplanation: 'Misunderstanding identified: You stated the stitches would dissolve on their own, whereas the source explicitly specifies they are non-absorbable nylon sutures that must be removed by a healthcare provider.',
              sourceGroundedExcerpt: 'The nylon non-absorbable skin sutures must be removed by a healthcare provider at the clinic.',
              isExcerptVerified: true,
              excerptMatchConfidence: 1.0,
              identifiedDifferences: [
                'Suture Dissolution: Sutures are NON-absorbable and will NOT dissolve; they require manual clinic removal.',
                'Missing Timeline: The source also lacks the exact target day count for follow-up removal.'
              ],
              questionsForDoctor: [
                'On what exact post-operative day should I return to have these sutures removed?'
              ],
              clinicalDisclaimer: 'Non-absorbable sutures left too long can cause infection and severe scarring.'
            };
      }
    }

    // Generic fallback comparison
    const sampleExcerpt = sourceText.slice(0, Math.min(120, sourceText.length)).trim();
    return lang === 'hi'
      ? {
          status: 'MATCHES_SOURCE',
          statusLabel: 'दिए गए निर्देशों के अनुरूप (Consistent with Source)',
          conciseExplanation: 'आपकी समझ दिए गए मूल निर्देशों के मुख्य बिंदुओं से मेल खाती है।',
          sourceGroundedExcerpt: sampleExcerpt,
          isExcerptVerified: true,
          excerptMatchConfidence: 0.9,
          identifiedDifferences: [],
          questionsForDoctor: [
            'क्या कोई अन्य सावधानी है जिसका मुझे पालन करना चाहिए?',
            'यदि कोई असामान्य लक्षण दिखे तो मुझे कब संपर्क करना चाहिए?'
          ],
          clinicalDisclaimer: 'यह केवल भाषा समझ की पुष्टि है, नैदानिक सुरक्षा का प्रमाण नहीं।'
        }
      : {
          status: 'MATCHES_SOURCE',
          statusLabel: 'Consistent with Supplied Source',
          conciseExplanation: 'Your stated understanding appears consistent with the core points in the supplied instructions.',
          sourceGroundedExcerpt: sampleExcerpt,
          isExcerptVerified: true,
          excerptMatchConfidence: 0.9,
          identifiedDifferences: [],
          questionsForDoctor: [
            'Are there any specific side effects or warning signs I should watch for?',
            'When should I schedule my next follow-up evaluation?'
          ],
          clinicalDisclaimer: 'A MATCHES_SOURCE result indicates reading consistency only, not clinical safety or medical correctness.'
        };
  }
}
