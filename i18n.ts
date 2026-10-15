/**
 * SamajhCare - Bilingual Localization Dictionary (English & Hindi)
 */

import { Language } from './types';

export const I18N = {
  en: {
    appName: 'SamajhCare',
    appTagline: 'Source-Grounded Healthcare Instruction Understanding Assistant',
    badgeSafety: 'Teach-Back Verification & Safety Grounding',
    selectLanguage: 'Language / भाषा:',
    
    // Steps
    step1Title: 'Step 1: Paste Healthcare Instructions',
    step1Desc: 'Enter the exact discharge summary, medication instructions, or care guide given by your doctor or clinic.',
    step1Placeholder: 'Paste instructions here... (e.g. "Take Amoxicillin 500mg every 8 hours with water for 7 days...")',
    charCount: 'characters',
    maxCharLimit: 'Max 5,000 characters',
    validationEmpty: 'Please enter or select healthcare instructions to proceed.',
    validationTooLong: 'Input exceeds maximum limit of 5,000 characters. Please shorten.',
    
    // Quick Presets
    quickPresetsTitle: 'Or load a synthetic test scenario (No real patient data):',
    
    // Emergency checkboxes
    emergencySectionTitle: 'Safety Red Flags & Emergency Warning Signs',
    emergencySectionSubtitle: 'Check any of the following symptoms if currently experienced by the patient:',
    emergencyBannerNotice: 'Checking any symptom halts standard processing and triggers the immediate emergency protocol.',
    
    // Actions
    btnExplainSource: 'Analyze & Explain Instructions',
    btnAnalyzing: 'Analyzing source text...',
    btnComparing: 'Performing teach-back comparison...',
    btnCopySummary: 'Copy Formatted Summary',
    btnCopied: 'Summary Copied to Clipboard!',
    btnStartNew: 'Start New Session',
    btnRunAutomatedTests: 'Run Automated Test Suite (12 Scenarios)',
    btnOpenApiKeyModal: 'API Key & Mode Settings',

    // Step 2: Explanation & Source Display
    step2Title: 'Step 2: Source Instructions & Grounded Explanation',
    originalSourceHeading: 'Supplied Source Instructions (Persistent Reference)',
    plainExplanationHeading: 'Plain-Language Explanation',
    keyPointsTitle: 'Key Instructions Grounded in Source:',
    precautionsTitle: 'Important Safety Precautions:',
    flaggedAmbiguitiesTitle: 'Ambiguities Detected in Source:',
    flaggedContradictionsTitle: 'Contradictions Detected in Source:',
    explicitBadge: 'Explicitly Stated in Source',
    inferredBadge: 'Clarification Needed',
    
    // Step 3: Teach-back Input
    step3Title: 'Step 3: Teach-Back — Explain In Your Own Words',
    step3Subtitle: 'To ensure there are no misunderstandings, describe how, when, and how long you plan to follow these instructions.',
    teachBackPlaceholder: 'Example: "I understand I need to take 1 tablet in the morning after eating, and I should not..."',
    teachBackHint: 'Tip: Mention medication name, dosage, timing, duration, and what you should avoid.',
    btnSubmitTeachBack: 'Check My Understanding',
    validationTeachBackEmpty: 'Please enter your understanding before submitting.',
    
    // Step 4: Comparison Result
    step4Title: 'Step 4: Source-Grounded Teach-Back Comparison',
    resultConsistentTitle: 'Consistent with Supplied Source',
    resultMismatchTitle: 'Possible Misunderstanding Detected',
    resultClarificationTitle: 'Needs Clarification (Ambiguous / Contradictory)',
    
    resultConsistentSubtext: 'The user explanation appears consistent with explicit statements in the supplied text. (Note: This is an interpretation check only, not medical confirmation of safety.)',
    resultMismatchSubtext: 'One or more instructions in the explanation deviate from or conflict with the supplied source text.',
    resultClarificationSubtext: 'The instructions or your explanation contain ambiguous, missing, or contradictory details that must be verified.',
    
    sourceExcerptHeading: 'Exact Grounded Source Passage:',
    verifiedCitationBadge: '✓ Verified Verbatim Excerpt from Source Text',
    unverifiedCitationBadge: '⚠️ Excerpt could not be verified verbatim in source',
    
    differencesHeading: 'Identified Misunderstandings / Nuances:',
    doctorQuestionsHeading: 'Targeted Questions to Ask Your Doctor / Pharmacist:',
    
    // Disclaimer & Privacy
    disclaimerTitle: 'Important Medical Disclaimer & Privacy Protection',
    disclaimerText: 'SamajhCare is an educational tool designed strictly to assist with reading comprehension and teach-back verification of user-supplied healthcare instructions. It is NOT a medical diagnosis, clinical assessment, or substitute for professional medical care. Never modify dosages or treatment plans without consulting your licensed healthcare professional. In India, call 112 immediately for medical emergencies.',
    privacyNotice: 'Zero Data Retention: Health instructions and teach-back responses are kept only in memory during your active browser session and are never saved to any database, localStorage, or third-party analytics.',
    
    // Emergency Modal
    emergencyModalTitle: 'CRITICAL EMERGENCY WARNING DETECTED',
    emergencyModalBody: 'An emergency warning sign or red flag has been detected. AI processing has been stopped immediately.',
    emergencyModalAction: 'Please seek urgent emergency medical attention right now.',
    emergencyCall112: 'Call 112 (India National Emergency)',
    emergencyDismiss: 'Close Alert & Return to Safe Mode',
    
    // Test Suite Drawer
    testSuiteTitle: 'Automated Synthetic Test Suite Runner',
    testSuiteSubtitle: 'Validates 12 clinical edge cases, prompt injection, emergency bypass, excerpt verification, and multilingual handling.',
    testSuiteRunAll: 'Execute All Automated Tests',
    testSuiteRunning: 'Running test matrix...',
    testsPassedLabel: 'Passed',
    testsFailedLabel: 'Failed',
    
    // API Key Dialog
    apiKeyTitle: 'Gemini API Configuration',
    apiKeySubtitle: 'Choose between Live Gemini API Mode or Offline High-Fidelity Simulation Mode.',
    apiKeyLabel: 'Gemini API Key (Optional for Demo):',
    apiKeyPlaceholder: 'AIzaSy...',
    apiKeyHelp: 'Keys are kept only in temporary browser memory for the current session and never logged or stored.',
    modeLive: 'Live Gemini API Mode',
    modeSimulated: 'Offline High-Fidelity Simulation Mode (No Key Needed)',
    saveApiKey: 'Save Session Configuration'
  },
  hi: {
    appName: 'समझकेयर (SamajhCare)',
    appTagline: 'स्वास्थ्य निर्देशों को सही ढंग से समझने और गलतफहमी दूर करने में सहायक',
    badgeSafety: 'टीच-बैक सत्यापन एवं सुरक्षा ग्राउंडिंग',
    selectLanguage: 'भाषा / Language:',
    
    // Steps
    step1Title: 'चरण 1: डॉक्टर या अस्पताल के निर्देश दर्ज करें',
    step1Desc: 'अपने डॉक्टर या अस्पताल द्वारा दी गई डिस्चार्ज पर्ची, दवा के निर्देश या देखभाल संबंधी पर्चा यहाँ पेस्ट करें।',
    step1Placeholder: 'यहाँ निर्देश पेस्ट करें... (उदा. "एमोक्सिसिलिन 500mg कैप्सूल दिन में 3 बार 7 दिनों तक पानी के साथ लें...")',
    charCount: 'अक्षर',
    maxCharLimit: 'अधिकतम 5,000 अक्षर',
    validationEmpty: 'कृपया आगे बढ़ने के लिए स्वास्थ्य निर्देश दर्ज करें या कोई परिदृश्य चुनें।',
    validationTooLong: 'निर्देश 5,000 अक्षरों की अधिकतम सीमा से अधिक हैं। कृपया छोटा करें।',
    
    // Quick Presets
    quickPresetsTitle: 'या कोई परीक्षण परिदृश्य चुनें (बिना किसी वास्तविक रोगी डेटा के):',
    
    // Emergency checkboxes
    emergencySectionTitle: 'आपातकालीन चेतावनी संकेत एवं खतरे के लक्षण',
    emergencySectionSubtitle: 'यदि रोगी वर्तमान में निम्नलिखित में से किसी भी लक्षण का अनुभव कर रहा है, तो चेक करें:',
    emergencyBannerNotice: 'किसी भी लक्षण को चुनने पर सामान्य प्रक्रिया तुरंत रुक जाती है और आपातकालीन प्रोटोकॉल सक्रिय हो जाता है।',
    
    // Actions
    btnExplainSource: 'निर्देशों का विश्लेषण एवं सरल व्याख्या करें',
    btnAnalyzing: 'दिए गए निर्देशों का विश्लेषण किया जा रहा है...',
    btnComparing: 'टीच-बैक समझ की तुलना की जा रही है...',
    btnCopySummary: 'सारांश कॉपी करें',
    btnCopied: 'सारांश क्लिपबोर्ड में कॉपी हो गया!',
    btnStartNew: 'नया सत्र शुरू करें',
    btnRunAutomatedTests: 'स्वचालित टेस्ट चलाएं (12 परिदृश्य)',
    btnOpenApiKeyModal: 'API कुंजी एवं मोड सेटिंग्स',

    // Step 2: Explanation & Source Display
    step2Title: 'चरण 2: मूल निर्देश और सरल भाषा में व्याख्या',
    originalSourceHeading: 'प्रदान किए गए मूल निर्देश (हमेशा दिखाई देने वाले)',
    plainExplanationHeading: 'सरल भाषा में समझाई गई जानकारी',
    keyPointsTitle: 'मूल पाठ पर आधारित मुख्य निर्देश:',
    precautionsTitle: 'महत्वपूर्ण सावधानियां:',
    flaggedAmbiguitiesTitle: 'मूल निर्देशों में अस्पष्ट बातें:',
    flaggedContradictionsTitle: 'मूल निर्देशों में परस्पर विरोधी बातें:',
    explicitBadge: 'मूल पर्चे में स्पष्ट उल्लेख',
    inferredBadge: 'स्पष्टीकरण अपेक्षित',
    
    // Step 3: Teach-back Input
    step3Title: 'चरण 3: टीच-बैक — अपनी समझ को अपने शब्दों में बताएं',
    step3Subtitle: 'यह सुनिश्चित करने के लिए कि कोई गलतफहमी न हो, बताएं कि आप इन निर्देशों का पालन कैसे, कब और कितने समय तक करेंगे।',
    teachBackPlaceholder: 'उदाहरण: "मुझे समझ आया कि मुझे सुबह नाश्ते के बाद 1 गोली लेनी है और मुझे..."',
    teachBackHint: 'सुझाव: दवा का नाम, मात्रा (खुराक), समय, कितने दिन लेनी है, और क्या परहेज करना है, इसका उल्लेख करें।',
    btnSubmitTeachBack: 'मेरी समझ की जाँच करें',
    validationTeachBackEmpty: 'कृपया तुलना करने से पहले अपनी समझ यहाँ लिखें।',
    
    // Step 4: Comparison Result
    step4Title: 'चरण 4: दिए गए निर्देशों के साथ तुलना का परिणाम',
    resultConsistentTitle: 'दिए गए निर्देशों के अनुरूप (Consistent with Source)',
    resultMismatchTitle: 'संभावित गलतफहमी पाई गई (Possible Misunderstanding)',
    resultClarificationTitle: 'स्पष्टीकरण की आवश्यकता है (Needs Clarification)',
    
    resultConsistentSubtext: 'आपकी व्याख्या दिए गए पर्चे के स्पष्ट बयानों के अनुरूप प्रतीत होती है। (नोट: यह केवल भाषा समझ की जांच है, चिकित्सकीय सुरक्षा का दावा नहीं।)',
    resultMismatchSubtext: 'आपकी समझ में एक या अधिक बातें मूल पर्चे में दिए गए निर्देशों से भिन्न या विपरीत हैं।',
    resultClarificationSubtext: 'मूल पर्चे या आपकी व्याख्या में कुछ बातें अधूरी, अस्पष्ट या विरोधाभासी हैं जिन्हें डॉक्टर से स्पष्ट करना जरूरी है।',
    
    sourceExcerptHeading: 'मूल पर्चे से संबंधित उद्धरण (Exact Excerpt):',
    verifiedCitationBadge: '✓ मूल पर्चे से शत-प्रतिशत सत्यापित अंश',
    unverifiedCitationBadge: '⚠️ यह अंश मूल पर्चे में शब्दशः नहीं मिला',
    
    differencesHeading: 'पहचानी गई भिन्नताएं / गलतफहमियां:',
    doctorQuestionsHeading: 'डॉक्टर या फार्मासिस्ट से पूछने योग्य महत्वपूर्ण प्रश्न:',
    
    // Disclaimer & Privacy
    disclaimerTitle: 'महत्वपूर्ण चिकित्सा अस्वीकरण एवं गोपनीयता सुरक्षा',
    disclaimerText: 'समझकेयर केवल एक शैक्षिक उपकरण है जिसका उद्देश्य दिए गए स्वास्थ्य निर्देशों को पढ़ने और समझने में मदद करना है। यह कोई मेडिकल डायग्नोसिस, नैदानिक सलाह या डॉक्टर का विकल्प नहीं है। अपने पंजीकृत डॉक्टर से पूछे बिना कभी भी खुराक या उपचार में बदलाव न करें। भारत में आपात स्थिति के लिए तुरंत 112 डायल करें।',
    privacyNotice: 'शून्य डेटा संचयन: आपके स्वास्थ्य निर्देश और उत्तर केवल इस ब्राउज़र सत्र के दौरान मेमोरी में रहते हैं और इन्हें किसी भी डेटाबेस, स्टोरेज या एनालिटिक्स में कभी सहेजा नहीं जाता।',
    
    // Emergency Modal
    emergencyModalTitle: 'गंभीर आपातकालीन चेतावनी',
    emergencyModalBody: 'एक गंभीर आपातकालीन संकेत पाया गया है। AI प्रक्रिया को तत्काल प्रभाव से रोक दिया गया है।',
    emergencyModalAction: 'कृपया तुरंत निकटतम अस्पताल या आपातकालीन सेवा से संपर्क करें।',
    emergencyCall112: '112 पर तुरंत कॉल करें (राष्ट्रीय आपातकालीन सेवा)',
    emergencyDismiss: 'चेतावनी बंद करें और सुरक्षित मोड पर लौटें',
    
    // Test Suite Drawer
    testSuiteTitle: 'स्वचालित परीक्षण सूट (Automated Test Suite)',
    testSuiteSubtitle: '12 नैदानिक परिदृश्यों, आपातकालीन बाईपास, उद्धरण सत्यापन और बहुभाषी क्षमता की जांच करता है।',
    testSuiteRunAll: 'सभी 12 टेस्ट निष्पादित करें',
    testSuiteRunning: 'टेस्ट चल रहे हैं...',
    testsPassedLabel: 'सफल (Passed)',
    testsFailedLabel: 'विफल (Failed)',
    
    // API Key Dialog
    apiKeyTitle: 'Gemini API सेटिंग्स',
    apiKeySubtitle: 'लाइव Gemini API मोड या ऑफलाइन हाई-फिडेलिटी सिमुलेशन मोड चुनें।',
    apiKeyLabel: 'Gemini API कुंजी (डेमो के लिए वैकल्पिक):',
    apiKeyPlaceholder: 'AIzaSy...',
    apiKeyHelp: 'कुंजी केवल वर्तमान सत्र के लिए ब्राउज़र मेमोरी में रहती है और कभी सहेजी या भेजी नहीं जाती।',
    modeLive: 'लाइव Gemini API मोड',
    modeSimulated: 'ऑफलाइन सिमुलेशन मोड (कुंजी की आवश्यकता नहीं)',
    saveApiKey: 'सेटिंग्स सहेजें'
  }
};
