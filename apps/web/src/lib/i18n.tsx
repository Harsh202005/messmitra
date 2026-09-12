'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'mr' | 'hi' | 'en';

interface Translations {
  [key: string]: {
    mr: string;
    hi: string;
    en: string;
  };
}

export const translations: Translations = {
  // Brand & Nav
  appName: {
    mr: 'मेस मित्र',
    hi: 'मेस मित्र',
    en: 'MessMitra',
  },
  tagline: {
    mr: 'स्मार्ट मेस व टिफिन हिशोब प्रणाली',
    hi: 'स्मार्ट मेस और टिफिन हिसाब प्रणाली',
    en: 'Smart Mess & Tiffin Accounting SaaS',
  },
  dashboard: {
    mr: 'डॅशबोर्ड',
    hi: 'डैशबोर्ड',
    en: 'Dashboard',
  },
  members: {
    mr: 'सभासद (Members)',
    hi: 'सदस्य (Members)',
    en: 'Members',
  },
  billing: {
    mr: 'बिलिंग व हिशोब',
    hi: 'बिलिंग और हिसाब',
    en: 'Billing & Accounting',
  },
  leaves: {
    mr: 'सुट्ट्या (Leaves)',
    hi: 'छुट्टियां (Leaves)',
    en: 'Leave Requests',
  },
  expenses: {
    mr: 'खर्च व्यवस्थापन',
    hi: 'खर्च प्रबंधन',
    en: 'Expenses',
  },
  pnl: {
    mr: 'नफा-तोटा (P&L)',
    hi: 'लाभ-हानि (P&L)',
    en: 'P&L Dashboard',
  },
  setupWizard: {
    mr: 'मेस सेटिंग्ज',
    hi: 'मेस सेटिंग्स',
    en: 'Mess Settings',
  },
  editSettings: {
    mr: 'मेस सेटिंग्ज बदला',
    hi: 'मेस सेटिंग्स बदलें',
    en: 'Edit Mess Settings',
  },
  ownerView: {
    mr: 'मालक डॅशबोर्ड (Owner)',
    hi: 'मालिक डैशबोर्ड (Owner)',
    en: 'Owner Dashboard',
  },
  memberPortalView: {
    mr: 'सभासद पोर्टल (Member View)',
    hi: 'सदस्य पोर्टल (Member View)',
    en: 'Member Portal',
  },

  // Forecast Card
  tomorrowForecast: {
    mr: 'उद्याचा स्वयंपाक अंदाज',
    hi: 'कल का खाना बनाने का अनुमान',
    en: "Tomorrow's Cooking Forecast",
  },
  activeMembers: {
    mr: 'एकूण सक्रिय सभासद',
    hi: 'कुल सक्रिय सदस्य',
    en: 'Total Active Members',
  },
  membersOnLeave: {
    mr: 'मंजूर सुट्टीवर',
    hi: 'मंजूर छुट्टी पर',
    en: 'On Approved Leave',
  },
  cookFor: {
    mr: 'उद्याचे जेवण बनवायचे',
    hi: 'कल का खाना बनाना है',
    en: 'Cook For (Heads)',
  },
  lunchCount: {
    mr: 'दुपारचे जेवण (Lunch)',
    hi: 'दोपहर का खाना (Lunch)',
    en: 'Lunch Count',
  },
  dinnerCount: {
    mr: 'रात्रीचे जेवण (Dinner)',
    hi: 'रात का खाना (Dinner)',
    en: 'Dinner Count',
  },

  // Member Management
  memberDirectory: {
    mr: 'सभासद यादी',
    hi: 'सदस्य सूची',
    en: 'Member Directory',
  },
  addMember: {
    mr: 'नवीन सभासद जोडा',
    hi: 'नया सदस्य जोड़ें',
    en: 'Add Member',
  },
  editMember: {
    mr: 'सभासद माहिती बदला',
    hi: 'सदस्य जानकारी बदलें',
    en: 'Edit Member',
  },
  searchPlaceholder: {
    mr: 'नाव किंवा फोन नंबरने शोधा...',
    hi: 'नाम या फोन नंबर से खोजें...',
    en: 'Search by name or phone...',
  },
  all: {
    mr: 'सर्व',
    hi: 'सभी',
    en: 'All',
  },
  active: {
    mr: 'सक्रिय',
    hi: 'सक्रिय',
    en: 'Active',
  },
  inactive: {
    mr: 'बंद / इनॅक्टिव्ह',
    hi: 'निष्क्रिय',
    en: 'Inactive',
  },
  male: {
    mr: 'मुलगा (Male)',
    hi: 'पुरुष (Male)',
    en: 'Male',
  },
  female: {
    mr: 'मुलगी (Female)',
    hi: 'महिला (Female)',
    en: 'Female',
  },
  bothMeals: {
    mr: 'दुपार + रात्र (दोन्ही)',
    hi: 'दोपहर + रात (दोनों)',
    en: 'Lunch + Dinner (Both)',
  },
  lunchOnly: {
    mr: 'फक्त दुपारचे',
    hi: 'सिर्फ दोपहर (Lunch)',
    en: 'Lunch Only',
  },
  dinnerOnly: {
    mr: 'फक्त रात्रीचे',
    hi: 'सिर्फ रात (Dinner)',
    en: 'Dinner Only',
  },
  monthlyRate: {
    mr: 'मासिक दर (₹)',
    hi: 'मासिक दर (₹)',
    en: 'Monthly Rate (₹)',
  },
  joinDate: {
    mr: 'जोडल्याची तारीख',
    hi: 'जुड़ने की तारीख',
    en: 'Join Date',
  },
  status: {
    mr: 'स्थिती',
    hi: 'स्थिति',
    en: 'Status',
  },
  actions: {
    mr: 'कृती',
    hi: 'कार्रवाई',
    en: 'Actions',
  },
  fullName: {
    mr: 'पूर्ण नाव',
    hi: 'पूरा नाम',
    en: 'Full Name',
  },
  phoneNumber: {
    mr: 'फोन नंबर (WhatsApp)',
    hi: 'फ़ोन नंबर (WhatsApp)',
    en: 'Phone Number (WhatsApp)',
  },
  gender: {
    mr: 'लिंग',
    hi: 'लिंग',
    en: 'Gender',
  },
  planType: {
    mr: 'जेवणाचा प्रकार (Plan)',
    hi: 'भोजन प्रकार (Plan)',
    en: 'Meal Plan Type',
  },
  save: {
    mr: 'जतन करा (Save)',
    hi: 'सुरक्षित करें (Save)',
    en: 'Save',
  },
  cancel: {
    mr: 'रद्द करा',
    hi: 'रद्द करें',
    en: 'Cancel',
  },
  noMembersFound: {
    mr: 'कोणतेही सभासद सापडले नाहीत.',
    hi: 'कोई सदस्य नहीं मिला।',
    en: 'No members found.',
  },

  // Setup Wizard
  wizardStep1Title: {
    mr: 'पायरी १: मेसची मूलभूत माहिती',
    hi: 'चरण १: मेस की बुनियादी जानकारी',
    en: 'Step 1: Basic Mess Details',
  },
  wizardStep2Title: {
    mr: 'पायरी २: सुट्टीची वेळ व मासिक दर',
    hi: 'चरण २: छुट्टी का समय और मासिक दर',
    en: 'Step 2: Cutoff Time & Rates',
  },
  wizardStep3Title: {
    mr: 'पायरी ३: UPI व पेमेंट लिंक्स',
    hi: 'चरण ३: UPI और भुगतान लिंक्स',
    en: 'Step 3: UPI & Payment Links',
  },
  messName: {
    mr: 'मेसचे नाव',
    hi: 'मेस का नाम',
    en: 'Mess Name',
  },
  messArea: {
    mr: 'परिसर / एरिया',
    hi: 'इलाका / एरिया',
    en: 'Area / Landmark',
  },
  messCity: {
    mr: 'शहर',
    hi: 'शहर',
    en: 'City',
  },
  cutoffTime: {
    mr: 'रोजची सुट्टी नोंदवण्याची अंतिम वेळ (Cutoff)',
    hi: 'दैनिक छुट्टी दर्ज करने का कटऑफ समय',
    en: 'Daily Leave Cutoff Time',
  },
  cutoffTimeHelp: {
    mr: 'उदा. 09:00 AM नंतर आलेल्या सुट्ट्या मंजुरीसाठी मालकाकडे प्रलंबित राहतील.',
    hi: 'उदा. 09:00 AM के बाद दर्ज की गई छुट्टियां मालिक की मंजूरी के लिए पेंडिंग रहेंगी।',
    en: 'Requests after cutoff require owner approval.',
  },
  maleRateLabel: {
    mr: 'मुलांचा डीफॉल्ट मासिक दर (₹)',
    hi: 'पुरुषों का डिफ़ॉल्ट मासिक दर (₹)',
    en: 'Default Male Monthly Rate (₹)',
  },
  femaleRateLabel: {
    mr: 'मुलींचा डीफॉल्ट मासिक दर (₹)',
    hi: 'महिलाओं का डिफ़ॉल्ट मासिक दर (₹)',
    en: 'Default Female Monthly Rate (₹)',
  },
  upiIdLabel: {
    mr: 'मालकाचा UPI ID (GPay / PhonePe)',
    hi: 'मालिक का UPI ID (GPay / PhonePe)',
    en: 'Owner UPI ID (GPay / PhonePe / Paytm)',
  },
  upiIdHelp: {
    mr: 'सभासदांना WhatsApp वर पाठवल्या जाणाऱ्या बिल लिंकमध्ये हा UPI ID आपोआप जोडला जाईल.',
    hi: 'सदस्यों को WhatsApp पर भेजे जाने वाले बिल लिंक में यह UPI ID अपने आप जुड़ जाएगा।',
    en: 'Embedded into WhatsApp bill reminders.',
  },
  nextStep: {
    mr: 'पुढील पायरी',
    hi: 'अगला चरण',
    en: 'Next Step',
  },
  prevStep: {
    mr: 'मागील पायरी',
    hi: 'पिछला चरण',
    en: 'Previous Step',
  },
  completeSetup: {
    mr: 'सेटअप पूर्ण करा व सुरू करा 🚀',
    hi: 'सेटअप पूरा करें और शुरू करें 🚀',
    en: 'Complete Setup & Launch 🚀',
  },
  setupSuccess: {
    mr: 'मेस माहिती यशस्वीरित्या जतन केली!',
    hi: 'मेस की जानकारी सफलतापूर्वक सुरक्षित की गई!',
    en: 'Mess settings saved successfully!',
  },

  // Leaves & Dispute Resolution
  submitLeave: {
    mr: 'सुट्टी नोंदवा (Submit Leave)',
    hi: 'छुट्टी दर्ज करें (Submit Leave)',
    en: 'Submit Leave Request',
  },
  leaveDateRange: {
    mr: 'सुट्टीचा कालावधी (तारीख पासून - पर्यंत)',
    hi: 'छुट्टी की अवधि (तारीख से - तक)',
    en: 'Leave Date Range (From - To)',
  },
  leaveReason: {
    mr: 'सुट्टीचे कारण (पर्यायी)',
    hi: 'छुट्टी का कारण (वैकल्पिक)',
    en: 'Reason for Leave (Optional)',
  },
  ownerApprovalQueue: {
    mr: 'उशिरा आलेल्या सुट्ट्यांची मंजुरी रांग',
    hi: 'देर से आई छुट्टियों की अनुमोदन कतार',
    en: 'Late Submissions Approval Queue',
  },
  autoValidBadge: {
    mr: 'वेळेत (आपोआप मंजूर)',
    hi: 'समय पर (स्वतः स्वीकृत)',
    en: 'Auto-Valid (Pre-Cutoff)',
  },
  latePendingBadge: {
    mr: 'उशिरा (मंजुरी प्रलंबित)',
    hi: 'देर से (अनुमोदन प्रतीक्षारत)',
    en: 'Late (Pending Approval)',
  },
  approvedBadge: {
    mr: 'मंजूर',
    hi: 'स्वीकृत',
    en: 'Approved',
  },
  rejectedBadge: {
    mr: 'नाकारले',
    hi: 'अस्वीकृत',
    en: 'Rejected',
  },
  approveBtn: {
    mr: 'मंजूर करा',
    hi: 'स्वीकार करें',
    en: 'Approve',
  },
  rejectBtn: {
    mr: 'नाकारा',
    hi: 'अस्वीकार करें',
    en: 'Reject',
  },
  timestampAuditNote: {
    mr: 'वाद निवारणासाठी अचूक वेळ नोंदवली जाते (अपरिवर्तनीय).',
    hi: 'विवाद समाधान के लिए सटीक समय दर्ज किया जाता है (अपरिवर्तनीय)।',
    en: 'Timestamp is permanently recorded for dispute resolution.',
  },

  // Billing & Accounting
  monthlyBillingLedger: {
    mr: 'मासिक बिलिंग व हिशोब वही',
    hi: 'मासिक बिलिंग और हिसाब बही',
    en: 'Monthly Billing & Ledger',
  },
  generateBills: {
    mr: 'या महिन्याचे बिल तयार करा (56 Meals Formula)',
    hi: 'इस महीने का बिल बनाएं (56 Meals Formula)',
    en: 'Generate Monthly Bills (56-Meal Formula)',
  },
  amountDue: {
    mr: 'बाकी रक्कम (Due)',
    hi: 'बकाया राशि (Due)',
    en: 'Amount Due',
  },
  amountPaid: {
    mr: 'भरलेली रक्कम (Paid)',
    hi: 'प्राप्त राशि (Paid)',
    en: 'Amount Paid',
  },
  pendingDues: {
    mr: 'एकूण येणे बाकी (Pending)',
    hi: 'कुल बकाया (Pending)',
    en: 'Pending Dues',
  },
  totalCollected: {
    mr: 'एकूण जमा (Collected)',
    hi: 'कुल जमा (Collected)',
    en: 'Total Collected',
  },
  sendWhatsAppReminder: {
    mr: 'WhatsApp बिल पाठवा',
    hi: 'WhatsApp बिल भेजें',
    en: 'Send WhatsApp Bill',
  },
  recordPayment: {
    mr: 'पैसे जमा नोंदवा',
    hi: 'भुगतान दर्ज करें',
    en: 'Record Payment',
  },
  recordAdjustment: {
    mr: 'दुरुस्ती / वजावट नोंदवा',
    hi: 'समायोजन / छूट दर्ज करें',
    en: 'Record Adjustment Entry',
  },
  adjustmentNoteRequired: {
    mr: 'दुरुस्तीचे कारण आवश्यक आहे (Audit Note)',
    hi: 'समायोजन का कारण आवश्यक है (Audit Note)',
    en: 'Adjustment reason note is required',
  },
  exportCsv: {
    mr: 'CSV डाउनलोड करा (Export)',
    hi: 'CSV डाउनलोड करें (Export)',
    en: 'Export CSV Report',
  },

  // Expenses & Staff
  recurringExpenses: {
    mr: 'दरमहा नियमित खर्च (Rent / Salary / Gas)',
    hi: 'मासिक नियमित खर्च (Rent / Salary / Gas)',
    en: 'Monthly Recurring Expenses',
  },
  oneOffExpenses: {
    mr: 'दैनंदिन खर्च (भाजीपाला / किराणा / दुरुस्ती)',
    hi: 'दैनिक खर्च (सब्जी / किराना / मरम्मत)',
    en: 'Daily One-Off Expenses',
  },
  addExpense: {
    mr: 'खर्च नोंदवा',
    hi: 'खर्च दर्ज करें',
    en: 'Add Expense',
  },
  addStaff: {
    mr: 'कर्मचारी जोडा (महाराज / मदतनीस)',
    hi: 'कर्मचारी जोड़ें (रसोइया / सहायक)',
    en: 'Add Staff Member',
  },
  confirmCycle: {
    mr: 'या महिन्याचा खर्च निश्चित करा',
    hi: 'इस महीने का खर्च पक्का करें',
    en: 'Confirm for this Month',
  },

  // P&L Dashboard
  netProfit: {
    mr: 'निव्वळ नफा (Net Profit)',
    hi: 'शुद्ध लाभ (Net Profit)',
    en: 'Net Profit',
  },
  grossIncome: {
    mr: 'एकूण उत्पन्न (जमा फी)',
    hi: 'कुल आय (प्राप्त शुल्क)',
    en: 'Gross Income (Fees Collected)',
  },
  totalExpenses: {
    mr: 'एकूण खर्च',
    hi: 'कुल खर्च',
    en: 'Total Expenses',
  },
  expenseBreakdown: {
    mr: 'खर्चाचे विभागवार वर्गीकरण',
    hi: 'खर्च का श्रेणीवार विवरण',
    en: 'Expense Breakdown by Category',
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: 'mr',
  setLanguage: () => {},
  t: (key) => translations[key]?.mr || (key as string),
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('mr');

  useEffect(() => {
    const saved = localStorage.getItem('messmitra_lang') as Language;
    if (saved && (saved === 'mr' || saved === 'hi' || saved === 'en')) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('messmitra_lang', lang);
  };

  const t = (key: keyof typeof translations): string => {
    const entry = translations[key];
    if (!entry) return key as string;
    return entry[language] || entry.mr || entry.en || (key as string);
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => useContext(I18nContext);
