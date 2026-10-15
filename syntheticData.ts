/**
 * SamajhCare - Synthetic Non-Patient Clinical Scenarios
 * 
 * High-quality synthetic test scenarios created strictly for testing and validation.
 * Contains ZERO real-patient protected health information (PHI).
 * Covers faithful paraphrases, misunderstandings, ambiguities, contradictions,
 * missing data, and emergency red flags in both English and Hindi.
 */

import { SyntheticScenario } from './types';

export const SYNTHETIC_SCENARIOS: SyntheticScenario[] = [
  {
    id: 'scenario_1_faithful',
    titleEn: '1. Oral Antibiotic Course (Faithful Paraphrase)',
    titleHi: '1. एंटीबायोटिक का पूरा कोर्स (सही समझ)',
    category: 'faithful',
    sourceTextEn: `Take Amoxicillin 500mg capsules by mouth every 8 hours with a full glass of water for 7 full days. Do not stop taking this medication even if symptoms improve or fever subsides before the 7 days are completed. If mild nausea occurs, you may take the dose with a meal.`,
    sourceTextHi: `एमोक्सिसिलिन 500 मिलीग्राम (Amoxicillin 500mg) कैप्सूल पूरे 7 दिनों तक हर 8 घंटे में एक गिलास पानी के साथ मुंह से लें। 7 दिन पूरे होने से पहले लक्षण ठीक होने या बुखार उतरने पर भी दवा बंद न करें। यदि हल्का जी मिचलाए, तो खुराक भोजन के साथ ले सकते हैं।`,
    sampleTeachBackEn: `I will take one 500mg Amoxicillin capsule three times a day (every 8 hours) with plenty of water for the full 7 days. Even if my fever is completely gone on day 4, I must not stop and will finish all 7 days of medicine. If I feel a bit nauseous, I can have it with food.`,
    sampleTeachBackHi: `मुझे एमोक्सिसिलिन 500mg की दवा पूरे 7 दिनों तक हर 8 घंटे में पानी के साथ लेनी है। अगर 3-4 दिन में मेरा बुखार ठीक भी हो जाता है, तब भी मुझे दवा बंद नहीं करनी है और पूरे 7 दिन का कोर्स पूरा करना है। मतली होने पर मैं इसे खाने के साथ ले सकता हूँ।`,
    expectedStatus: 'MATCHES_SOURCE',
    rationale: 'The user accurately restated the medicine name, 500mg dosage, 8-hour frequency, 7-day duration, prohibition against stopping early, and nausea food mitigation.'
  },
  {
    id: 'scenario_2_misunderstanding',
    titleEn: '2. Post-Cataract Eye Drops (Possible Misunderstanding)',
    titleHi: '2. मोतियाबिंद के बाद आई ड्रॉप (संभावित गलतफहमी)',
    category: 'misunderstanding',
    sourceTextEn: `Instill 1 drop of Prednisolone 1% ophthalmic suspension into the operated RIGHT eye twice daily (once in the morning, once in the evening) for 14 days. Do not rub, press, or touch the operated right eye. Do not allow tap water to enter the eye for 10 days. Wear the clear eye shield taped over the eye when sleeping for the first week.`,
    sourceTextHi: `ऑपरेशन की गई दाहिनी आंख (Right Eye) में 14 दिनों तक रोजाना दो बार (सुबह और शाम) प्रेडनिसोलोन 1% आई ड्रॉप की 1 बूंद डालें। दाहिनी आंख को बिल्कुल न रगड़ें और न दबाएं। 10 दिनों तक आंख में नल का पानी न जाने दें। पहले सप्ताह सोते समय आंख पर सुरक्षात्मक आई शील्ड टेप से लगाकर रखें।`,
    sampleTeachBackEn: `I will put 1 drop into both of my eyes whenever they feel itchy or dry during the day, and I can wash my face normally with regular tap water as long as I close my eyes tight.`,
    sampleTeachBackHi: `मैं दिन में जब भी आंख में सूखापन लगेगा दोनों आंखों में एक-एक बूंद डालूंगा और नल के पानी से मुंह धो सकता हूँ बस आंखें कसकर बंद रखनी हैं।`,
    expectedStatus: 'POSSIBLE_MISMATCH',
    rationale: 'Critical mismatches: User plans to instill drops in BOTH eyes instead of only the operated RIGHT eye; plans as-needed use instead of twice daily; violates the 10-day strict prohibition on tap water; and omitted the sleep eye shield.'
  },
  {
    id: 'scenario_3_ambiguous',
    titleEn: '3. Pediatric Antipyretic (Ambiguous Source)',
    titleHi: '3. बच्चे के बुखार की दवा (अस्पष्ट निर्देश)',
    category: 'ambiguous',
    sourceTextEn: `Give Paracetamol syrup if the child develops elevated body temperature. Repeat if fever stays high. Keep the child well hydrated. Follow up if fever does not resolve.`,
    sourceTextHi: `यदि बच्चे को तेज बुखार आता है तो पैरासिटामोल सिरप दें। बुखार न उतरे तो दोबारा दे सकते हैं। बच्चे को पर्याप्त पानी पिलाते रहें। बुखार ठीक न होने पर पुनः दिखाएं।`,
    sampleTeachBackEn: `I will give my toddler some Paracetamol syrup when he feels hot, and give another spoon every hour if his temperature stays high.`,
    sampleTeachBackHi: `जब बच्चे का शरीर गरम लगेगा तो मैं उसे पैरासिटामोल सिरप का चम्मच भर दूंगा और अगर बुखार नहीं उतरा तो हर एक घंटे में चम्मच दोहराता रहूँगा।`,
    expectedStatus: 'NEEDS_CLARIFICATION',
    rationale: 'The supplied source instruction is dangerously ambiguous: it omits milligram strength, weight-based mL volume, minimum hourly interval (e.g. 4-6 hours), and maximum daily doses. User repetition hourly poses severe hepatotoxicity risk.'
  },
  {
    id: 'scenario_4_contradictory',
    titleEn: '4. Anticoagulant Timing (Contradictory Source)',
    titleHi: '4. खून पतला करने की दवा (परस्पर विरोधी निर्देश)',
    category: 'contradictory',
    sourceTextEn: `Discharge Sheet Section 2: Take Warfarin 3mg tablet once daily in the morning with breakfast. Discharge Sheet Section 6 (Pharmacist Instructions): Warfarin 3mg must be taken strictly at 9:00 PM bedtime on an empty stomach to maintain stable international normalized ratio (INR) blood levels.`,
    sourceTextHi: `डिस्चार्ज पर्ची खंड 2: वारफारिन 3 मिलीग्राम की गोली प्रतिदिन सुबह नाश्ते के साथ लें। डिस्चार्ज पर्ची खंड 6 (फार्मासिस्ट निर्देश): स्थिर INR स्तर बनाए रखने के लिए वारफारिन 3 मिलीग्राम की गोली रात 9:00 बजे सोते समय खाली पेट ही लेनी चाहिए।`,
    sampleTeachBackEn: `I understand I need to take 3mg of Warfarin once every day, and I will just take it whenever it suits my morning or evening routine with meals.`,
    sampleTeachBackHi: `मुझे रोज वारफारिन 3mg की एक गोली लेनी है, मैं अपनी सुविधानुसार सुबह या शाम खाने के साथ ले लूँगा।`,
    expectedStatus: 'NEEDS_CLARIFICATION',
    rationale: 'The instructions contain a direct internal contradiction (morning with breakfast vs 9 PM bedtime on empty stomach). Taking an anticoagulant inconsistently affects INR monitoring and increases bleeding or clotting risks.'
  },
  {
    id: 'scenario_5_missing',
    titleEn: '5. Surgical Suture Care (Missing Removal Timeline)',
    titleHi: '5. सर्जरी के टांकों की देखभाल (हटाने का समय गायब)',
    category: 'missing',
    sourceTextEn: `Keep the surgical wound dressing clean and dry for 48 hours. After 48 hours, remove the outer gauze and wash gently with mild soap. Apply Bacitracin ointment twice daily. The nylon non-absorbable skin sutures must be removed by a healthcare provider at the clinic.`,
    sourceTextHi: `सर्जरी की पट्टी को 48 घंटे तक साफ और सूखा रखें। 48 घंटे बाद बाहरी जाली हटाकर हल्के साबुन से धो सकते हैं। दिन में दो बार बैसिट्रासिन मलहम लगाएं। त्वचा के नायलॉन टांके (non-absorbable sutures) क्लिनिक में स्वास्थ्यकर्मी द्वारा ही निकाले जाने चाहिए।`,
    sampleTeachBackEn: `I will keep the bandage dry for two days, wash it gently and put the ointment on twice a day. The stitches are special and will dissolve on their own over the next two weeks.`,
    sampleTeachBackHi: `दो दिन पट्टी सूखी रखूँगा, फिर धोकर दिन में दो बार मलहम लगाऊँगा। टांके अपने आप दो हफ़्ते में गलकर समाप्त हो जाएँगे।`,
    expectedStatus: 'POSSIBLE_MISMATCH',
    rationale: 'The user incorrectly believes the sutures will dissolve on their own, whereas the source explicitly states they are non-absorbable nylon sutures requiring clinic removal. Also, the source omits the specific day count for return removal.'
  },
  {
    id: 'scenario_6_emergency',
    titleEn: '6. Acute Chest Pain Emergency (Emergency Warning Signs)',
    titleHi: '6. सीने में तेज दर्द आपात स्थिति (आपातकालीन चेतावनी)',
    category: 'emergency',
    sourceTextEn: `Routine discharge instructions for mild stable gastritis: Take Antacid gel 10mL before meals. WARNING: If you experience sudden crushing chest pressure, pain radiating to left arm or jaw, or severe shortness of breath, these are NOT indigestion—seek immediate emergency medical care.`,
    sourceTextHi: `गैस्ट्राइटिस के लिए सामान्य निर्देश: भोजन से पहले 10ml एंटासिड जेल लें। चेतावनी: यदि आपको अचानक सीने में भारी दबाव, बाएं हाथ या जबड़े में तेज दर्द, या सांस लेने में भारी तकलीफ महसूस हो, तो यह अपच नहीं है—तुरंत आपातकालीन चिकित्सा लें।`,
    sampleTeachBackEn: `I am feeling a heavy crushing weight on my chest right now and breaking out in a cold sweat with shortness of breath. Should I just drink two spoons of antacid and wait for an hour?`,
    sampleTeachBackHi: `मुझे अभी अपनी छाती पर भारी दबाव महसूस हो रहा है, पसीना आ रहा है और सांस लेने में बहुत दिक्कत हो रही है। क्या मैं दो चम्मच एंटासिड पीकर लेट जाऊं?`,
    expectedStatus: 'EMERGENCY_TRIGGERED',
    rationale: 'The teach-back contains active red flags for myocardial infarction / acute coronary syndrome. Application code immediately halts AI flow and triggers the deterministic 112 emergency screen.'
  }
];
