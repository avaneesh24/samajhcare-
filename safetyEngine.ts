/**
 * SamajhCare - Deterministic Safety Engine
 * 
 * Handles emergency triage completely outside the AI model loop.
 * Evaluates both user-selected warning checkboxes and regex/keyword heuristics
 * on input text to immediately divert any critical medical emergency to
 * emergency medical services (112 in India).
 */

import { EmergencyCheckResult, Language } from './types';

export interface EmergencyWarningSign {
  id: string;
  labelEn: string;
  labelHi: string;
  keywords: string[];
}

export const EMERGENCY_WARNING_SIGNS: EmergencyWarningSign[] = [
  {
    id: 'severe_difficulty_breathing',
    labelEn: 'Severe difficulty breathing or gasping for air',
    labelHi: 'सांस लेने में अत्यधिक कठिनाई या दम घुटना',
    keywords: [
      'difficulty breathing', 'shortness of breath', 'gasping', 'choking',
      'breathless', 'cannot breathe', 'unable to breathe', 'severe dyspnea',
      'सांस फूलना', 'दम घुटना', 'सांस नहीं ले पा रहा', 'सांस लेने में तकलीफ'
    ]
  },
  {
    id: 'severe_chest_pain',
    labelEn: 'Severe chest pain, crushing pressure, or radiating pain',
    labelHi: 'सीने में असहनीय दर्द, भारी दबाव, या दर्द का कंधे/जबड़े तक फैलना',
    keywords: [
      'chest pain', 'chest pressure', 'heart attack', 'crushing chest',
      'angina', 'pain in left arm', 'chest tightness',
      'सीने में दर्द', 'छाती में दर्द', 'दौरा', 'दिल का दौरा'
    ]
  },
  {
    id: 'loss_of_consciousness',
    labelEn: 'Loss of consciousness, fainting, or sudden unresponsiveness',
    labelHi: 'बेहोशी, अचेत होना, या अचानक प्रतिक्रिया न देना',
    keywords: [
      'loss of consciousness', 'fainted', 'unconscious', 'passed out',
      'unresponsive', 'blackout', 'syncope',
      'बेहोश', 'बेहोशी', 'अचेत', 'चक्कर खाकर गिरना'
    ]
  },
  {
    id: 'sudden_weakness_speech',
    labelEn: 'Sudden one-sided weakness, facial drooping, or difficulty speaking',
    labelHi: 'शरीर के एक तरफ अचानक कमजोरी, चेहरे का लटकना, या बोलने में लड़खड़ाहट (स्ट्रोक के लक्षण)',
    keywords: [
      'stroke', 'facial droop', 'one-sided weakness', 'slurred speech',
      'numbness one side', 'loss of speech', 'paralysis',
      'स्ट्रोक', 'लकवा', 'बोलने में असमर्थ', 'चेहरे का टेढ़ापन'
    ]
  },
  {
    id: 'uncontrolled_bleeding',
    labelEn: 'Uncontrolled serious bleeding that does not stop with pressure',
    labelHi: 'गंभीर रक्तस्राव जो दबाव देने पर भी नहीं रुक रहा है',
    keywords: [
      'uncontrolled bleeding', 'profuse bleeding', 'heavy bleeding',
      'spurting blood', 'hemorrhage', 'blood not stopping',
      'खून बहना', 'अत्यधिक खून', 'रक्तस्राव'
    ]
  },
  {
    id: 'severe_allergic_reaction',
    labelEn: 'Severe allergic reaction (swelling of face/lips/throat, hives, wheezing)',
    labelHi: 'गंभीर एलर्जी (चेहरे, होंठ, या गले में सूजन, सांस की नली में रुकावट)',
    keywords: [
      'anaphylaxis', 'allergic reaction', 'swollen tongue', 'swollen throat',
      'throat swelling', 'unable to swallow', 'swollen lips',
      'एलर्जी', 'गले में सूजन', 'होंठ में सूजन', 'चेहरे पर सूजन'
    ]
  }
];

export const EMERGENCY_ALERT_MESSAGES = {
  en: {
    title: 'CRITICAL EMERGENCY WARNING: IMMEDIATE MEDICAL CARE REQUIRED',
    badge: 'EMERGENCY PROTOCOL ACTIVATED - AI INTERACTION HALTED',
    instruction: 'If you or the patient are experiencing any of these life-threatening warning signs, stop using this app right now and seek urgent emergency medical attention.',
    dialAction: 'In India, call 112 (National Emergency Helpline) or 102/108 (Ambulance) immediately.',
    locationAdvice: 'Go to the nearest hospital Emergency Room or Casualty Department without delay.',
    appLimitation: 'SamajhCare is an educational reading aid and cannot evaluate, diagnose, manage, or rule out emergencies. The absence of listed warning signs does not guarantee safety.',
    callButtonLabel: 'Call 112 Emergency Services',
    acknowledgeButtonLabel: 'I Understand - Return to Safe Mode'
  },
  hi: {
    title: 'गंभीर आपातकालीन चेतावनी: तत्काल चिकित्सा सहायता की आवश्यकता है',
    badge: 'आपातकालीन प्रोटोकॉल सक्रिय - AI प्रक्रिया रोक दी गई है',
    instruction: 'यदि आप या रोगी इनमें से किसी भी गंभीर लक्षण का सामना कर रहे हैं, तो तुरंत इस ऐप का उपयोग बंद करें और आपातकालीन सहायता प्राप्त करें।',
    dialAction: 'भारत में तुरंत 112 (राष्ट्रीय आपातकालीन नंबर) या 102/108 (एम्बुलेंस) पर कॉल करें।',
    locationAdvice: 'बिना किसी देरी के निकटतम अस्पताल के आपातकालीन वार्ड (Emergency/Casualty) में जाएं।',
    appLimitation: 'समझकेयर केवल एक शैक्षिक सहायता उपकरण है और यह किसी भी आपात स्थिति का आकलन, उपचार या खारिज नहीं कर सकता। इन लक्षणों का न होना इस बात का प्रमाण नहीं है कि आपात स्थिति नहीं है।',
    callButtonLabel: '112 आपातकालीन सेवा पर कॉल करें',
    acknowledgeButtonLabel: 'मैं समझ गया - सुरक्षित मोड पर वापस जाएं'
  }
};

/**
 * Evaluates whether an emergency exists based on:
 * 1. User actively selecting any emergency warning signs
 * 2. Automated regex/keyword scan on the input text
 */
export function evaluateEmergency(
  selectedSignIds: string[],
  textToScan: string = ''
): EmergencyCheckResult {
  const triggers: string[] = [];

  // Check 1: User explicitly checked any warning box
  for (const signId of selectedSignIds) {
    const sign = EMERGENCY_WARNING_SIGNS.find(s => s.id === signId);
    if (sign) {
      triggers.push(`Selected: ${sign.labelEn}`);
    }
  }

  // Check 2: Automated keyword scan on text (case-insensitive)
  if (textToScan && textToScan.trim().length > 0) {
    const normalized = textToScan.toLowerCase();
    for (const sign of EMERGENCY_WARNING_SIGNS) {
      for (const kw of sign.keywords) {
        // match whole word or phrase
        const regex = new RegExp(`\\b${kw.toLowerCase()}\\b`, 'i');
        if (regex.test(normalized) || normalized.includes(kw.toLowerCase())) {
          const triggerDesc = `Detected keyword: "${kw}" (${sign.labelEn})`;
          if (!triggers.includes(triggerDesc)) {
            triggers.push(triggerDesc);
          }
          break;
        }
      }
    }
  }

  const isEmergency = triggers.length > 0;

  return {
    isEmergency,
    detectedTriggers: triggers,
    actionRequired: isEmergency ? 'DIAL_112_IMMEDIATELY' : 'NONE',
    emergencyNumber: '112'
  };
}
