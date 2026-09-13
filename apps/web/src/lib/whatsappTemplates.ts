/**
 * Shree Balaji Mess - Official WhatsApp Marathi Message Templates & URL Generators
 * Owner: Shankar Giri (+91 9822338975)
 */

export const BALAJI_WHATSAPP_TEMPLATES = {
  // 1. Monthly Dues Reminder (मासिक मेस फी स्मरणपत्र)
  monthlyDues: (params: {
    memberName: string;
    month: string;
    amountDue: number;
    upiId: string;
    ownerPhone?: string;
  }) => {
    return (
      `*🙏 श्री बालाजी मेस - मासिक फी स्मरणपत्र*\n` +
      `-----------------------------------------\n` +
      `नमस्कार *${params.memberName}*,\n\n` +
      `आपली *${params.month}* महिन्याची मेस फी खालीलप्रमाणे देय आहे:\n\n` +
      `💰 *एकूण बाकी रक्कम:* ₹${params.amountDue}\n` +
      `📲 *Google Pay / PhonePe UPI:* \`${params.upiId}\`\n\n` +
      `कृपया वेळेवर फी भरून सहकार्य करावे. फी भरल्यावर स्क्रीनशॉट याच नंबरवर पाठवा.\n\n` +
      `✨ _२१ वर्षांची अखंड परंपरा • चव हीच आमची ओळख_\n` +
      `📞 *शंकर गिरी:* ${params.ownerPhone || '9822338975'}`
    );
  },

  // 2. Official Payment Receipt (अधिकृत पावती)
  paymentReceipt: (params: {
    memberName: string;
    receiptNo: string;
    amountPaid: number;
    month: string;
    balanceDue: number;
    paymentMode: string;
  }) => {
    return (
      `*🧾 श्री बालाजी मेस - अधिकृत पावती*\n` +
      `-----------------------------------------\n` +
      `पावती क्र.: *#${params.receiptNo}*\n` +
      `सभासद: *${params.memberName}*\n` +
      `महिना: *${params.month}*\n` +
      `भरलेली रक्कम: *₹${params.amountPaid}* (${params.paymentMode === 'cash' ? 'रोख' : 'ऑनलाइन UPI'})\n` +
      `शिल्लक बाकी: *₹${params.balanceDue}*\n\n` +
      `✅ आपली फी यशस्वीरित्या जमा झाली आहे. धन्यवाद!\n\n` +
      `✨ _श्री बालाजी मेस (चालक: शंकर गिरी - 9822338975)_`
    );
  },

  // 3. New Member Registration Approved (नवीन नोंदणी मंजुरी)
  registrationApproved: (params: {
    memberName: string;
    planType: string;
    rate: number;
    cutoffLunch: string;
    cutoffDinner: string;
  }) => {
    return (
      `*🎉 श्री बालाजी मेस मध्ये आपले स्वागत आहे!*\n` +
      `-----------------------------------------\n` +
      `नमस्कार *${params.memberName}*,\n` +
      `आपली श्री बालाजी मेसची नोंदणी मंजूर झाली आहे.\n\n` +
      `📋 *योजना:* ${params.planType === 'veg' ? 'शाकाहारी (Veg ₹3,000)' : 'मांसाहारी (Non-Veg ₹3,200)'}\n` +
      `💰 *मासिक दर:* ₹${params.rate}/महिना\n` +
      `⏰ *दुपारचे सुट्टी कटऑफ:* सकाळी ${params.cutoffLunch || '09:00 AM'}\n` +
      `⏰ *रात्रीचे सुट्टी कटऑफ:* संध्याकाळी ${params.cutoffDinner || '06:00 PM'}\n\n` +
      `सुट्टी असल्यास अ‍ॅपवरून कटऑफ वेळेच्या आधी नोंद करावी जेणेकरून बिल वजावट मिळेल.\n\n` +
      `✨ _२१ वर्षांची अखंड परंपरा • चव हीच आमची ओळख_`
    );
  },

  // 4. Special Sunday Feast Announcement (रविवार विशेष बेत)
  sundaySpecialAnnouncement: (params: {
    date: string;
    specialMenuVeg: string;
    specialMenuNonVeg: string;
    timeSlot: string;
  }) => {
    return (
      `*🍛 श्री बालाजी मेस - रविवार स्पेशल बेत (${params.date})*\n` +
      `-----------------------------------------\n` +
      `सर्व सभासदांना सूचित करण्यात येते की या रविवारी विशेष मेजवानीचे आयोजन केले आहे:\n\n` +
      `🟢 *शाकाहारी (Veg):* ${params.specialMenuVeg || 'गुलाबजाम, पुरी, मटार पनीर, जिरा राईस, डाळ तडका'}\n` +
      `🔴 *मांसाहारी (Non-Veg):* ${params.specialMenuNonVeg || 'सुक्का चिकन / तांबडा पांढरा रस्सा, चिकन बिर्याणी'}\n\n` +
      `⏰ *वेळ:* ${params.timeSlot || 'दुपारी १२:३० ते ०३:३०'}\n\n` +
      `सर्वांनी वेळेवर उपस्थित राहावे.\n` +
      `✨ _श्री बालाजी मेस • चालक: शंकर गिरी (9822338975)_`
    );
  },

  // 5. Daily Cutoff Reminder (सुट्टी नोंद स्मरणपत्र)
  dailyCutoffReminder: (params: {
    mealType: 'lunch' | 'dinner';
    cutoffTime: string;
  }) => {
    return (
      `*⏰ श्री बालाजी मेस - सुट्टी सूचना स्मरणपत्र*\n` +
      `-----------------------------------------\n` +
      `आपणास ${params.mealType === 'lunch' ? 'आजच्या दुपारच्या' : 'आजच्या रात्रीच्या'} जेवणाला गैरहजर राहायचे असल्यास कृपया *${params.cutoffTime}* च्या आधी अ‍ॅपमध्ये सुट्टी नोंदवा.\n\n` +
      `कटऑफ वेळेनंतर आलेल्या नोंदी ग्राह्य धरल्या जाणार नाहीत व अन्न वाया जाणार नाही.\n\n` +
      `सहकार्याबद्दल धन्यवाद!\n` +
      `✨ _श्री बालाजी मेस_`
    );
  },
};

/**
 * Clean phone number to Indian 10-12 digits and generate wa.me link
 */
export function generateDirectWhatsAppUrl(phone: string, text: string): string {
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    cleaned = `91${cleaned}`;
  } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
    // Already good
  } else if (cleaned.length === 11 && cleaned.startsWith('0')) {
    cleaned = `91${cleaned.substring(1)}`;
  } else if (!cleaned) {
    cleaned = '919822338975';
  }

  const encoded = encodeURIComponent(text);
  return `https://wa.me/${cleaned}?text=${encoded}`;
}
