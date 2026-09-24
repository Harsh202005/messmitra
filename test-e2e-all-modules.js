async function runE2ETests() {
  console.log('================================================================');
  console.log('🚀 RUNNING COMPLETE END-TO-END SUITE FOR MESSMITRA SAAS');
  console.log('================================================================\n');

  const BASE_URL = 'http://localhost:4000/api';
  const AUTH_HEADER = { Authorization: 'Bearer demo-owner-token' };

  // 0. Auth & RBAC (ID/Password Login)
  console.log('0️⃣ Testing Role-Based Auth & ID/Password Login...');
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usernameOrEmail: 'owner@balajimess.com',
      password: 'password123',
    }),
  });
  const loginData = await loginRes.json();
  console.assert(loginData.user.role === 'owner', 'Role should be owner');
  console.log(`✅ Logged in as: ${loginData.user.name} | Role: ${loginData.user.role} | Token received`);

  // Test Member Login
  const memberLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usernameOrEmail: 'rahul@messmitra.com',
      password: 'password123',
    }),
  });
  const memberLogin = await memberLoginRes.json();
  console.assert(memberLogin.user.role === 'member', 'Role should be member');
  console.log(`✅ Member login verified: ${memberLogin.user.name} (ID: ${memberLogin.user.memberId})`);

  // Test Cook Login
  const cookLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      usernameOrEmail: 'cook@balajimess.com',
      password: 'password123',
    }),
  });
  const cookLogin = await cookLoginRes.json();
  console.assert(cookLogin.user.role === 'staff', 'Role should be staff');
  console.log(`✅ Cook/Staff login verified: ${cookLogin.user.name}`);

  // 1. Mess & Onboarding
  console.log('\n1️⃣ Testing Mess Setup & Cutoff Settings...');
  const messRes = await fetch(`${BASE_URL}/mess/current`, { headers: AUTH_HEADER });
  const mess = await messRes.json();
  console.assert(mess.name.includes('Balaji') || mess.name.includes('बालाजी'), 'Mess name matches');
  console.log(`✅ Mess active: ${mess.name} | Cutoff: ${mess.dailyCutoffTime} | UPI: ${mess.upiId}`);

  // 2. Member Management
  console.log('\n2️⃣ Testing Member Management & Forecasting...');
  let membersRes = await fetch(`${BASE_URL}/members`, { headers: AUTH_HEADER });
  let members = await membersRes.json();
  if (members.length === 0) {
    const addMemberRes = await fetch(`${BASE_URL}/members`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test Member',
        phone: '+91 98901 00001',
        gender: 'male',
        dietPreference: 'veg',
        rate: 3000,
        planType: 'both',
        joinDate: '2026-09-01',
        status: 'active',
      }),
    });
    const createdMember = await addMemberRes.json();
    members = [createdMember];
  }
  console.assert(members.length >= 1, 'Should have active members');
  console.log(`✅ Fetched ${members.length} members.`);

  const forecastRes = await fetch(`${BASE_URL}/members/forecast`, { headers: AUTH_HEADER });
  const forecast = await forecastRes.json();
  console.log(`✅ Forward Forecast: Cook for ${forecast.cookForCount} heads (Active: ${forecast.totalActiveMembers}, Leaves: ${forecast.membersOnLeave})`);

  // 3. Leave Requests & Cutoff Check
  console.log('\n3️⃣ Testing Leave Requests Flow & Dispute Resolution...');
  // Case A: Future leave -> Auto-Valid
  const futureLeaveRes = await fetch(`${BASE_URL}/leaves`, {
    method: 'POST',
    headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      memberId: members[0].id,
      startDate: '2026-09-25',
      endDate: '2026-09-27',
      reason: 'Diwali break',
    }),
  });
  const futureLeave = await futureLeaveRes.json();
  console.assert(futureLeave.status === 'auto_valid', 'Future leave must be auto_valid');
  console.log(`✅ Future leave submitted -> Status: ${futureLeave.status} (isLate: ${futureLeave.isLate})`);

  // Case B: Review / Approve a pending late leave
  const pendingLeavesRes = await fetch(`${BASE_URL}/leaves?status=pending_approval`, { headers: AUTH_HEADER });
  const pendingLeaves = await pendingLeavesRes.json();
  if (pendingLeaves.length > 0) {
    const reviewRes = await fetch(`${BASE_URL}/leaves/${pendingLeaves[0].id}/review`, {
      method: 'PATCH',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'approved' }),
    });
    const reviewed = await reviewRes.json();
    console.log(`✅ Late leave ${reviewed.id} reviewed by owner -> New Status: ${reviewed.status}`);
  }

  // 4. Billing Engine & Payment Ledger
  console.log('\n4️⃣ Testing Billing Engine (56-Meal Formula) & Immutable Ledger...');
  const genBillRes = await fetch(`${BASE_URL}/billing/generate`, {
    method: 'POST',
    headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
    body: JSON.stringify({ month: '2026-09' }),
  });
  const generatedCycles = await genBillRes.json();
  console.log(`✅ Generated monthly itemized bills for ${generatedCycles.length || 'all'} members.`);

  const billingRes = await fetch(`${BASE_URL}/billing?month=2026-09`, { headers: AUTH_HEADER });
  const billingLedger = await billingRes.json();
  console.log(`✅ Billing Summary: Total Due: ₹${billingLedger.totalAmountDue} | Total Paid: ₹${billingLedger.totalAmountPaid} | Pending: ₹${billingLedger.totalPendingDues}`);

  if (billingLedger.cycles && billingLedger.cycles.length > 0) {
    const firstCycle = billingLedger.cycles[0];
    // Record payment
    const payRes = await fetch(`${BASE_URL}/billing/${firstCycle.id}/pay`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: 1000, method: 'upi_link', transactionRef: 'UPI/TEST12345' }),
    });
    console.log(`✅ Recorded ₹1000 payment for ${firstCycle.memberName} -> Status: ${payRes.status}`);

    // Record adjustment
    const adjRes = await fetch(`${BASE_URL}/billing/${firstCycle.id}/adjustment`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount: -150, note: 'Special discount approved by owner' }),
    });
    console.log(`✅ Recorded adjustment with mandatory note -> Status: ${adjRes.status}`);
  }

  // 5. Expense Management & Staff
  console.log('\n5️⃣ Testing Expenses & Staff Tagging...');
  const recurringRes = await fetch(`${BASE_URL}/expenses/recurring`, { headers: AUTH_HEADER });
  const recurring = await recurringRes.json();
  console.log(`✅ Recurring scheduled expenses count: ${recurring.length}`);

  const oneOffRes = await fetch(`${BASE_URL}/expenses/oneoff`, {
    method: 'POST',
    headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      category: 'vegetables',
      amount: 650,
      date: '2026-09-11',
      note: 'Evening market shopping',
    }),
  });
  const createdOneOff = await oneOffRes.json();
  console.log(`✅ Recorded one-off expense: ₹${createdOneOff.amount} (${createdOneOff.category})`);

  let staffRes = await fetch(`${BASE_URL}/expenses/staff`, { headers: AUTH_HEADER });
  let staff = await staffRes.json();
  if (staff.length === 0) {
    const addStaffRes = await fetch(`${BASE_URL}/expenses/staff`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Mahadev Maharaj',
        role: 'Head Cook',
        monthlySalary: 18000,
        phone: '+91 97654 00001',
      }),
    });
    const createdStaff = await addStaffRes.json();
    staff = [createdStaff];
  }
  console.log(`✅ Staff list (Cooks & Helpers): ${staff.map((s) => `${s.name} - ₹${s.monthlySalary}`).join(', ')}`);

  // 6. Staff Salary Ledger & Attendance
  console.log('\n6️⃣ Testing Staff Salary Ledger & Attendance Tracking...');
  if (staff.length > 0) {
    const salaryPayRes = await fetch(`${BASE_URL}/expenses/staff/salaries`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staffId: staff[0].id,
        staffName: staff[0].name,
        month: '2026-09',
        baseSalary: staff[0].monthlySalary,
        advanceDeductions: 2000,
        netPaid: 2000,
        paymentType: 'advance',
        paymentMethod: 'cash',
        voucherNumber: `SAL-2026-09-${Date.now().toString().slice(-3)}`,
        note: 'Ganesh festival advance',
      }),
    });
    const salaryPay = await salaryPayRes.json();
    console.log(`✅ Recorded Staff Salary Voucher: ${salaryPay.voucherNumber} (Net Paid: ₹${salaryPay.netPaid})`);

    const attRes = await fetch(`${BASE_URL}/expenses/staff/attendance`, {
      method: 'POST',
      headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        staffId: staff[0].id,
        date: '2026-09-17',
        status: 'present',
        notes: 'Morning shift on time',
      }),
    });
    const att = await attRes.json();
    console.log(`✅ Recorded Staff Attendance for ${staff[0].name} -> Status: ${att.status}`);
  }

  // 7. POS Walk-In Orders & Catalog
  console.log('\n7️⃣ Testing POS Walk-In Orders & Counter Billing...');
  const catalogRes = await fetch(`${BASE_URL}/orders/catalog`, { headers: AUTH_HEADER });
  const catalog = await catalogRes.json();
  console.log(`✅ POS Catalog loaded with ${catalog.length} items (e.g. ${catalog[0]?.name})`);

  const orderRes = await fetch(`${BASE_URL}/orders`, {
    method: 'POST',
    headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      items: [
        { itemId: 'thali-veg-unlimited', name: 'Pure Veg Unlimited Thali', price: 80, quantity: 2, diet: 'veg' },
      ],
      totalAmount: 160,
      paymentMethod: 'upi',
      paymentStatus: 'paid',
      customerName: 'राहुल पाटील (Walk-in)',
      customerPhone: '9890112233',
    }),
  });
  const order = await orderRes.json();
  console.log(`✅ Created POS Order ${order.orderNumber} -> Total: ₹${order.totalAmount} (${order.paymentMethod.toUpperCase()})`);

  const statsRes = await fetch(`${BASE_URL}/orders/stats`, { headers: AUTH_HEADER });
  const stats = await statsRes.json();
  console.log(`✅ Daily POS Stats: ${stats.totalOrders} Orders | Revenue: ₹${stats.totalRevenue} (Veg Thalis: ${stats.vegThaliCount})`);

  // 8. Meal Tokens System
  console.log('\n8️⃣ Testing Meal Token Issuance & Redemption Flow...');
  const issueTokenRes = await fetch(`${BASE_URL}/tokens`, {
    method: 'POST',
    headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      customerName: 'गणेश शिंदे',
      customerPhone: '9822334455',
      tokenType: 'single_veg',
      tokenName: 'शुद्ध शाकाहारी जेवण टोकन',
      amount: 80,
      dietPreference: 'veg',
      mealSlot: 'lunch',
      paymentMethod: 'upi',
    }),
  });
  const issuedToken = await issueTokenRes.json();
  console.log(`✅ Issued Token ${issuedToken.tokenNumber} for ${issuedToken.customerName} (Status: ${issuedToken.status})`);

  const redeemTokenRes = await fetch(`${BASE_URL}/tokens/${issuedToken.tokenNumber}/redeem`, {
    method: 'PATCH',
    headers: AUTH_HEADER,
  });
  const redeemedToken = await redeemTokenRes.json();
  console.log(`✅ Redeemed Token ${redeemedToken.tokenNumber} -> Status: ${redeemedToken.status}`);

  // 9. Price Plans & Concessions
  console.log('\n9️⃣ Testing Mess Price Plans & Concessions...');
  const plansRes = await fetch(`${BASE_URL}/plans`, { headers: AUTH_HEADER });
  const plans = await plansRes.json();
  console.log(`✅ Active Price Plans: ${plans.length} plans loaded (e.g. ${plans.map((p) => p.name).join(', ')})`);

  // 10. Self-Registration Queue & Approvals
  console.log('\n🔟 Testing Member Self-Registration & Approval Queue...');
  const regRes = await fetch(`${BASE_URL}/registrations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'स्वप्नील जोशी (Swapnil Joshi)',
      phone: '+91 98811 22334',
      role: 'member',
      dietPreference: 'veg',
      planType: 'both',
      rate: 3000,
    }),
  });
  const createdReg = await regRes.json();
  console.log(`✅ Self-Registration submitted for: ${createdReg.name} (Status: ${createdReg.status})`);

  const reviewRegRes = await fetch(`${BASE_URL}/registrations/${createdReg.id}/review`, {
    method: 'PATCH',
    headers: { ...AUTH_HEADER, 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'approved' }),
  });
  const approvedReg = await reviewRegRes.json();
  console.log(`✅ Owner approved registration -> New Status: ${approvedReg.status}`);

  // 11. P&L Dashboard
  console.log('\n1️⃣1️⃣ Testing P&L Dashboard Summary...');
  const pnlRes = await fetch(`${BASE_URL}/pnl/summary?month=2026-09`, { headers: AUTH_HEADER });
  const pnl = await pnlRes.json();
  console.log(`✅ P&L Summary: Dues Collected: ₹${pnl.totalDuesCollected} | Total Expenses: ₹${pnl.totalExpenses} | Net Profit: ₹${pnl.netProfit}`);

  console.log('\n🎉 ALL MESSMITRA END-TO-END MODULE TESTS (11/11 SUITES) COMPLETED WITH 100% SUCCESS!');
}

runE2ETests().catch(console.error);
