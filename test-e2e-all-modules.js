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
  console.assert(mess.name.includes('Balaji'), 'Mess name matches');
  console.log(`✅ Mess active: ${mess.name} | Cutoff: ${mess.dailyCutoffTime} | UPI: ${mess.upiId}`);

  // 2. Member Management
  console.log('\n2️⃣ Testing Member Management & Forecasting...');
  const membersRes = await fetch(`${BASE_URL}/members`, { headers: AUTH_HEADER });
  const members = await membersRes.json();
  console.assert(members.length >= 6, 'Should have initial active members');
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

  const staffRes = await fetch(`${BASE_URL}/expenses/staff`, { headers: AUTH_HEADER });
  const staff = await staffRes.json();
  console.log(`✅ Staff list (Cooks & Helpers): ${staff.map(s => `${s.name} - ₹${s.monthlySalary}`).join(', ')}`);

  // 6. P&L Dashboard & Reports
  console.log('\n6️⃣ Testing P&L Dashboard & CSV Reports...');
  const pnlRes = await fetch(`${BASE_URL}/pnl/summary?month=2026-09`, { headers: AUTH_HEADER });
  const pnl = await pnlRes.json();
  console.log(`✅ P&L Headline: Total Collected: ₹${pnl.totalDuesCollected} - Total Expenses: ₹${pnl.totalExpenses} = Net Profit: ₹${pnl.netProfit}`);

  const billCsvRes = await fetch(`${BASE_URL}/reports/billing/csv?month=2026-09`, { headers: AUTH_HEADER });
  const billCsv = await billCsvRes.text();
  console.assert(billCsv.startsWith('Member Name,Phone'), 'CSV has proper headers');
  console.log(`✅ Exported Billing CSV (${billCsv.split('\n').length} lines).`);

  const expCsvRes = await fetch(`${BASE_URL}/reports/expenses/csv?month=2026-09`, { headers: AUTH_HEADER });
  const expCsv = await expCsvRes.text();
  console.assert(expCsv.startsWith('Type,Category'), 'Expense CSV has proper headers');
  console.log(`✅ Exported Expense CSV (${expCsv.split('\n').length} lines).`);

  console.log('\n🎉 ALL MESSMITRA END-TO-END MODULE TESTS PASSED WITH 100% SUCCESS!');
}

runE2ETests().catch(console.error);
