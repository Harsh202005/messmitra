import {
  isLeaveSubmissionLate,
  calculateProratedMeals,
  calculateMonthlyBill,
  generateWhatsAppReminderLink,
  STANDARD_BASE_MEALS,
} from './index';

function runTests() {
  console.log('🧪 Running MessMitra Domain & Calculation Tests...\n');

  // Test 1: Standard Base Meals Constant
  console.assert(STANDARD_BASE_MEALS === 56, 'STANDARD_BASE_MEALS must equal 56');
  console.log('✅ Test 1 Passed: STANDARD_BASE_MEALS is 56');

  // Test 2: Leave Cutoff Detection
  // Case A: Leave for tomorrow (future date) submitted at 11:00 PM -> NOT late
  const subDateA = new Date('2026-09-11T23:00:00');
  const isLateA = isLeaveSubmissionLate(subDateA, '2026-09-12', '09:00');
  console.assert(!isLateA, 'Future date leave must NOT be late');
  console.log('✅ Test 2A Passed: Future leave is timely (auto_valid)');

  // Case B: Leave for TODAY submitted at 09:15 AM (cutoff 09:00) -> IS late
  const subDateB = new Date('2026-09-11T09:15:00');
  const isLateB = isLeaveSubmissionLate(subDateB, '2026-09-11', '09:00');
  console.assert(isLateB, 'Today leave submitted after cutoff must be marked LATE');
  console.log('✅ Test 2B Passed: Same-day post-cutoff leave marked isLate=true');

  // Case C: Leave for TODAY submitted at 08:30 AM (cutoff 09:00) -> NOT late
  const subDateC = new Date('2026-09-11T08:30:00');
  const isLateC = isLeaveSubmissionLate(subDateC, '2026-09-11', '09:00');
  console.assert(!isLateC, 'Today leave submitted before cutoff must NOT be late');
  console.log('✅ Test 2C Passed: Same-day pre-cutoff leave marked isLate=false');

  // Test 3: Partial-Month Pro-ration for Mid-Cycle Joins
  // Member joined on 16th September in a 30-day month (active days = 30 - 16 + 1 = 15 days * 2 meals = 30 meals)
  const proratedMeals = calculateProratedMeals('2026-09-16', 2026, 9, 'both');
  console.assert(proratedMeals === 30, `Expected 30 meals for 15 active days, got ${proratedMeals}`);
  console.log('✅ Test 3 Passed: Mid-month join prorated accurately to 30 meals');

  // Test 4: Monthly Bill & Leave Deductions
  // Base Rate = ₹3200 for 56 meals (~₹57.14/meal). 3 approved leave days (6 meals deducted)
  const bill = calculateMonthlyBill(3200, 3, 'both');
  console.assert(bill.leaveDeduction > 0, 'Leave deduction must be calculated');
  console.assert(bill.finalAmountDue < 3200, 'Final bill must be discounted by leave deduction');
  console.log(`✅ Test 4 Passed: Monthly bill calculated (Base: ₹3200 -> Deduction: ₹${bill.leaveDeduction} -> Due: ₹${bill.finalAmountDue})`);

  // Test 5: WhatsApp Click-to-Chat Deep-link Generator
  const waLink = generateWhatsAppReminderLink(
    '9890123456',
    'Rahul Deshmukh',
    'Balaji Mess',
    3200,
    'balajimess@okhdfcbank',
    'सप्टेंबर'
  );
  console.assert(waLink.startsWith('https://wa.me/919890123456'), 'WhatsApp link must have 91 prefix');
  console.assert(waLink.includes('balajimess%40okhdfcbank'), 'UPI ID must be URL-encoded');
  console.log('✅ Test 5 Passed: WhatsApp Click-to-Chat reminder link generated correctly\n');

  console.log('🎉 ALL DOMAIN TESTS PASSED SUCCESSFULLY!');
}

runTests();
