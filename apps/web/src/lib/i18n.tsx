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
    mr: 'श्री बालाजी मेस',
    hi: 'श्री बालाजी मेस',
    en: 'Shree Balaji Mess',
  },
  tagline: {
    mr: '२१ वर्षांची अखंड परंपरा • चव हीच आमची ओळख',
    hi: '२१ वर्षों की अखंड परंपरा • स्वाद ही हमारी पहचान',
    en: '21 Years of Tradition • Authentic Taste',
  },
  dashboard: {
    mr: 'डॅशबोर्ड',
    hi: 'डैशबोर्ड',
    en: 'Dashboard',
  },
  members: {
    mr: 'सभासद',
    hi: 'सदस्य',
    en: 'Members',
  },
  billing: {
    mr: 'बिलिंग',
    hi: 'बिलिंग',
    en: 'Billing',
  },
  leaves: {
    mr: 'सुट्ट्या',
    hi: 'छुट्टियां',
    en: 'Leaves',
  },
  expenses: {
    mr: 'खर्च',
    hi: 'खर्च',
    en: 'Expenses',
  },
  pnl: {
    mr: 'नफा-तोटा',
    hi: 'लाभ-हानि',
    en: 'Profit & Loss',
  },
  staffTab: {
    mr: 'कर्मचारी पगार',
    hi: 'कर्मचारी वेतन',
    en: 'Staff Payroll',
  },
  kitchenTab: {
    mr: 'स्वयंपाकघर',
    hi: 'रसोई',
    en: 'Kitchen & Menu',
  },
  plansTab: {
    mr: 'मेस प्लॅन्स',
    hi: 'मेस प्लान',
    en: 'Price Plans',
  },
  posTab: {
    mr: 'सुटे जेवण POS',
    hi: 'दैनिक भोजन POS',
    en: 'Walk-in POS',
  },
  moreTab: {
    mr: 'अधिक',
    hi: 'अधिक',
    en: 'More',
  },
  setupWizard: {
    mr: 'मेस सेटिंग्ज',
    hi: 'मेस सेटिंग्स',
    en: 'Mess Settings',
  },
  editSettings: {
    mr: 'मेस सेटिंग्ज बदला',
    hi: 'मेस सेटिंग्स बदलें',
    en: 'Edit Settings',
  },
  ownerView: {
    mr: 'मालक',
    hi: 'मालिक',
    en: 'Owner',
  },
  memberPortalView: {
    mr: 'सभासद पोर्टल',
    hi: 'सदस्य पोर्टल',
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
    mr: 'दुपारचे जेवण',
    hi: 'दोपहर का खाना',
    en: 'Lunch Count',
  },
  dinnerCount: {
    mr: 'रात्रीचे जेवण',
    hi: 'रात का खाना',
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
    mr: 'बंद',
    hi: 'निष्क्रिय',
    en: 'Inactive',
  },
  male: {
    mr: 'शाकाहारी',
    hi: 'शाकाहारी',
    en: 'Vegetarian',
  },
  female: {
    mr: 'मांसाहारी',
    hi: 'मांसाहारी',
    en: 'Non-Vegetarian',
  },
  veg: {
    mr: 'शाकाहारी',
    hi: 'शाकाहारी',
    en: 'Veg',
  },
  nonveg: {
    mr: 'मांसाहारी',
    hi: 'मांसाहारी',
    en: 'Non-Veg',
  },
  dietPreference: {
    mr: 'आहार प्रकार',
    hi: 'भोजन प्रकार',
    en: 'Diet Preference',
  },
  vegRate: {
    mr: 'शाकाहारी दर',
    hi: 'शाकाहारी दर',
    en: 'Veg Monthly Rate',
  },
  nonVegRate: {
    mr: 'मांसाहारी दर',
    hi: 'मांसाहारी दर',
    en: 'Non-Veg Monthly Rate',
  },
  legacyBadge: {
    mr: '२१ वर्षांची परंपरा • चव हीच आमची ओळख',
    hi: '२१ वर्षों की परंपरा • स्वाद ही हमारी पहचान',
    en: '21 Years of Heritage • Authentic Taste',
  },
  dinnerCutoffLabel: {
    mr: 'रात्रीचे जेवण कटऑफ वेळ',
    hi: 'रात के खाने का कटऑफ समय',
    en: 'Dinner Cutoff Time',
  },
  lunchCutoffLabel: {
    mr: 'दुपारचे जेवण कटऑफ वेळ',
    hi: 'दोपहर के खाने का कटऑफ समय',
    en: 'Lunch Cutoff Time',
  },
  bothMeals: {
    mr: 'दुपार + रात्र (दोन्ही)',
    hi: 'दोपहर + रात (दोनों)',
    en: 'Lunch + Dinner (Both)',
  },
  lunchOnly: {
    mr: 'फक्त दुपारचे',
    hi: 'सिर्फ दोपहर',
    en: 'Lunch Only',
  },
  dinnerOnly: {
    mr: 'फक्त रात्रीचे',
    hi: 'सिर्फ रात',
    en: 'Dinner Only',
  },
  monthlyRate: {
    mr: 'मासिक दर (₹)',
    hi: 'मासिक दर (₹)',
    en: 'Monthly Rate (₹)',
  },
  joinDate: {
    mr: 'नोंदणी तारीख',
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
    mr: 'फोन नंबर',
    hi: 'फ़ोन नंबर',
    en: 'Phone Number',
  },
  gender: {
    mr: 'लिंग',
    hi: 'लिंग',
    en: 'Gender',
  },
  planType: {
    mr: 'जेवणाचा प्रकार',
    hi: 'भोजन प्रकार',
    en: 'Meal Plan Type',
  },
  save: {
    mr: 'जतन करा',
    hi: 'सुरक्षित करें',
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
    mr: 'रोजची सुट्टी नोंदवण्याची अंतिम वेळ',
    hi: 'दैनिक छुट्टी दर्ज करने का कटऑफ समय',
    en: 'Daily Leave Cutoff Time',
  },
  cutoffTimeHelp: {
    mr: 'उदा. 09:00 AM नंतर आलेल्या सुट्ट्या मंजुरीसाठी मालकाकडे प्रलंबित राहतील.',
    hi: 'उदा. 09:00 AM के बाद दर्ज की गई छुट्टियां मालिक की मंजूरी के लिए पेंडिंग रहेंगी।',
    en: 'Requests after cutoff require owner approval.',
  },
  maleRateLabel: {
    mr: 'मांसाहारी डीफॉल्ट मासिक दर (₹)',
    hi: 'मांसाहारी डिफ़ॉल्ट मासिक दर (₹)',
    en: 'Default Non-Veg Monthly Rate (₹)',
  },
  femaleRateLabel: {
    mr: 'शुद्ध शाकाहारी डीफॉल्ट मासिक दर (₹)',
    hi: 'शुद्ध शाकाहारी डिफ़ॉल्ट मासिक दर (₹)',
    en: 'Default Pure Veg Monthly Rate (₹)',
  },
  vegRateLabel: {
    mr: 'शुद्ध शाकाहारी डीफॉल्ट मासिक दर (₹)',
    hi: 'शुद्ध शाकाहारी डिफ़ॉल्ट मासिक दर (₹)',
    en: 'Default Pure Veg Monthly Rate (₹)',
  },
  nonVegRateLabel: {
    mr: 'मांसाहारी डीफॉल्ट मासिक दर (₹)',
    hi: 'मांसाहारी डिफ़ॉल्ट मासिक दर (₹)',
    en: 'Default Non-Veg Monthly Rate (₹)',
  },
  upiIdLabel: {
    mr: 'मालकाचा UPI ID',
    hi: 'मालिक का UPI ID',
    en: 'Owner UPI ID',
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
    mr: 'सुट्टी नोंदवा',
    hi: 'छुट्टी दर्ज करें',
    en: 'Submit Leave',
  },
  leaveDateRange: {
    mr: 'सुट्टीचा कालावधी',
    hi: 'छुट्टी की अवधि',
    en: 'Leave Date Range',
  },
  leaveReason: {
    mr: 'सुट्टीचे कारण',
    hi: 'छुट्टी का कारण',
    en: 'Reason for Leave',
  },
  ownerApprovalQueue: {
    mr: 'उशिरा आलेल्या सुट्ट्यांची मंजुरी रांग',
    hi: 'देर से आई छुट्टियों की अनुमोदन कतार',
    en: 'Late Submissions Approval Queue',
  },
  autoValidBadge: {
    mr: 'वेळेत मंजूर',
    hi: 'समय पर स्वीकृत',
    en: 'Auto-Approved',
  },
  latePendingBadge: {
    mr: 'मंजुरी प्रलंबित',
    hi: 'अनुमोदन प्रतीक्षारत',
    en: 'Pending Approval',
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
    mr: 'अचूक वेळ नोंदवली जाते.',
    hi: 'सटीक समय दर्ज किया जाता है।',
    en: 'Timestamp is permanently recorded.',
  },

  // Billing & Accounting
  monthlyBillingLedger: {
    mr: 'मासिक बिलिंग व हिशोब वही',
    hi: 'मासिक बिलिंग और हिसाब बही',
    en: 'Monthly Billing & Ledger',
  },
  generateBills: {
    mr: 'या महिन्याचे बिल तयार करा',
    hi: 'इस महीने का बिल बनाएं',
    en: 'Generate Monthly Bills',
  },
  amountDue: {
    mr: 'बाकी रक्कम',
    hi: 'बकाया राशि',
    en: 'Amount Due',
  },
  amountPaid: {
    mr: 'भरलेली रक्कम',
    hi: 'प्राप्त राशि',
    en: 'Amount Paid',
  },
  pendingDues: {
    mr: 'एकूण येणे बाकी',
    hi: 'कुल बकाया',
    en: 'Pending Dues',
  },
  totalCollected: {
    mr: 'एकूण जमा',
    hi: 'कुल जमा',
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
    en: 'Record Adjustment',
  },
  adjustmentNoteRequired: {
    mr: 'दुरुस्तीचे कारण आवश्यक आहे',
    hi: 'समायोजन का कारण आवश्यक है',
    en: 'Adjustment reason note is required',
  },
  exportCsv: {
    mr: 'CSV डाउनलोड करा',
    hi: 'CSV डाउनलोड करें',
    en: 'Export CSV',
  },

  // Expenses & Staff
  recurringExpenses: {
    mr: 'दरमहा नियमित खर्च',
    hi: 'मासिक नियमित खर्च',
    en: 'Monthly Recurring Expenses',
  },
  oneOffExpenses: {
    mr: 'दैनंदिन खर्च',
    hi: 'दैनिक खर्च',
    en: 'Daily Expenses',
  },
  addExpense: {
    mr: 'खर्च नोंदवा',
    hi: 'खर्च दर्ज करें',
    en: 'Add Expense',
  },
  addStaff: {
    mr: 'कर्मचारी जोडा',
    hi: 'कर्मचारी जोड़ें',
    en: 'Add Staff Member',
  },
  confirmCycle: {
    mr: 'या महिन्याचा खर्च निश्चित करा',
    hi: 'इस महीने का खर्च पक्का करें',
    en: 'Confirm for this Month',
  },

  // P&L Dashboard
  netProfit: {
    mr: 'निव्वळ नफा',
    hi: 'शुद्ध लाभ',
    en: 'Net Profit',
  },
  grossIncome: {
    mr: 'एकूण उत्पन्न',
    hi: 'कुल आय',
    en: 'Gross Income',
  },
  totalExpenses: {
    mr: 'एकूण खर्च',
    hi: 'कुल खर्च',
    en: 'Total Expenses',
  },
  expenseBreakdown: {
    mr: 'खर्चाचे विभागवार वर्गीकरण',
    hi: 'खर्च का श्रेणीवार विवरण',
    en: 'Expense Breakdown',
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
