const assert = require('assert');
const {
  calculateLeaveDaysInMonth,
  calculateProratedMeals,
  calculateMonthlyBill,
  isLeaveSubmissionLate,
  isNonVegDay,
  formatTime12Hour,
} = require('./packages/types/dist/index.js');

console.log('🧪 RUNNING COMPREHENSIVE DOMAIN & CALCULATION LOGIC SUITE...\n');

// 1. Test calculateLeaveDaysInMonth
console.log('1️⃣ Testing Month-Clamped Leave Day Calculation...');

// Case A: Leave completely within the month (Sep 10 to Sep 15)
const days1 = calculateLeaveDaysInMonth('2026-09-10', '2026-09-15', 2026, 9);
assert.strictEqual(days1, 6, 'Should be 6 days (10, 11, 12, 13, 14, 15)');
console.log(`✅ Within-month leave: Sep 10-15 -> ${days1} days in Sep`);

// Case B: Leave spanning previous month into target month (Aug 28 to Sep 04)
const days2 = calculateLeaveDaysInMonth('2026-08-28', '2026-09-04', 2026, 9);
assert.strictEqual(days2, 4, 'Should clamp to Sep 1-4 = 4 days');
console.log(`✅ Previous-month spanning leave: Aug 28 - Sep 04 -> ${days2} days in Sep`);

// Case C: Leave spanning target month into next month (Sep 28 to Oct 05)
const days3 = calculateLeaveDaysInMonth('2026-09-28', '2026-10-05', 2026, 9);
assert.strictEqual(days3, 3, 'Should clamp to Sep 28-30 = 3 days');
console.log(`✅ Next-month spanning leave: Sep 28 - Oct 05 -> ${days3} days in Sep`);

// Case D: Leave spanning entire month (Aug 15 to Oct 15)
const days4 = calculateLeaveDaysInMonth('2026-08-15', '2026-10-15', 2026, 9);
assert.strictEqual(days4, 30, 'Should clamp to 30 days of September');
console.log(`✅ Entire month spanned: Aug 15 - Oct 15 -> ${days4} days in Sep`);

// Case E: Leave outside the month (Jul 10 to Jul 15)
const days5 = calculateLeaveDaysInMonth('2026-07-10', '2026-07-15', 2026, 9);
assert.strictEqual(days5, 0, 'Should be 0 days for July leave evaluated in Sep');
console.log(`✅ Non-overlapping leave: Jul 10-15 -> ${days5} days in Sep`);

// 2. Test calculateProratedMeals
console.log('\n2️⃣ Testing Prorated Base Meals for Mid-Month Joins...');
const proratedMidSep = calculateProratedMeals('2026-09-16', 2026, 9, 'both');
// 30 - 16 + 1 = 15 days * 2 = 30 meals
assert.strictEqual(proratedMidSep, 30, 'Mid-month join on 16th (15 active days * 2 meals = 30)');
console.log(`✅ Mid-month join (Sep 16, both meals) -> ${proratedMidSep} base meals`);

const proratedPrior = calculateProratedMeals('2026-06-01', 2026, 9, 'both');
assert.strictEqual(proratedPrior, 56, 'Joined prior month -> 56 standard base meals');
console.log(`✅ Prior join (Jun 01, full cycle) -> ${proratedPrior} base meals`);

// 3. Test calculateMonthlyBill
console.log('\n3️⃣ Testing Monthly Bill & Itemized Leave Deduction...');
const billVeg = calculateMonthlyBill(3000, 3, 'both', 56);
assert.strictEqual(billVeg.perMealRate, 53.57, 'Per meal rate for ₹3000 / 56 meals = 53.57');
assert.strictEqual(billVeg.leaveDeduction, 321, '3 leave days * 2 meals * 53.57 = 321.42 -> rounded to 321');
assert.strictEqual(billVeg.finalAmountDue, 2679, 'Final bill: 3000 - 321 = 2679');
console.log(`✅ Bill for ₹3000 rate with 3 approved leave days -> Due: ₹${billVeg.finalAmountDue} (Deduction: ₹${billVeg.leaveDeduction})`);

// 4. Test isLeaveSubmissionLate with plan type & cutoffs
console.log('\n4️⃣ Testing Leave Cutoff Logic with Plan Types...');
const nowAt10AM = new Date(2026, 8, 15, 10, 0, 0); // 10:00 AM on Sep 15

// Lunch plan (cutoff 09:00 AM) submitted at 10:00 AM for same day -> LATE
const isLunchLate = isLeaveSubmissionLate(nowAt10AM, '2026-09-15', '09:00', 'lunch', '09:00', '18:00');
assert.strictEqual(isLunchLate, true, 'Same day lunch submitted at 10 AM is late (after 9 AM)');
console.log(`✅ Same-day Lunch leave at 10:00 AM (09:00 cutoff) -> isLate: ${isLunchLate}`);

// Dinner plan (cutoff 18:00 / 6:00 PM) submitted at 10:00 AM for same day -> ON TIME
const isDinnerLate = isLeaveSubmissionLate(nowAt10AM, '2026-09-15', '18:00', 'dinner', '09:00', '18:00');
assert.strictEqual(isDinnerLate, false, 'Same day dinner submitted at 10 AM is NOT late (before 6 PM)');
console.log(`✅ Same-day Dinner leave at 10:00 AM (18:00 cutoff) -> isLate: ${isDinnerLate}`);

// Future date -> ON TIME
const isFutureLate = isLeaveSubmissionLate(nowAt10AM, '2026-09-20', '09:00', 'both', '09:00', '18:00');
assert.strictEqual(isFutureLate, false, 'Future date is always on time');
console.log(`✅ Future leave (Sep 20) -> isLate: ${isFutureLate}`);

// 5. Test isNonVegDay (Wed, Fri, Sun schedule)
console.log('\n5️⃣ Testing Balaji Mess Weekly Schedule (Non-Veg on Wed, Fri, Sun)...');
assert.strictEqual(isNonVegDay(0), true, 'Sunday (0) is Non-Veg night');
assert.strictEqual(isNonVegDay(3), true, 'Wednesday (3) is Non-Veg night');
assert.strictEqual(isNonVegDay(5), true, 'Friday (5) is Non-Veg night');
assert.strictEqual(isNonVegDay(1), false, 'Monday (1) is 100% Pure Veg');
assert.strictEqual(isNonVegDay(2), false, 'Tuesday (2) is 100% Pure Veg');
assert.strictEqual(isNonVegDay(4), false, 'Thursday (4) is 100% Pure Veg');
assert.strictEqual(isNonVegDay(6), false, 'Saturday (6) is 100% Pure Veg');
console.log('✅ Weekly schedule verified: Non-Veg only on Wed/Fri/Sun nights.');

console.log('\n🎉 ALL DOMAIN & CALCULATION TESTS PASSED WITH 100% ACCURACY!\n');
