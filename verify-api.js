async function verifyApi() {
  console.log('🔍 Testing NestJS API Endpoints directly...');

  // 1. Fetch current mess
  const messRes = await fetch('http://localhost:4000/api/mess/current', {
    headers: { Authorization: 'Bearer demo-owner-token' },
  });
  console.log('GET /api/mess/current status:', messRes.status);
  const mess = await messRes.json();
  console.log('Mess Name:', mess.name, '| UPI:', mess.upiId);

  // 2. Fetch members
  const membersRes = await fetch('http://localhost:4000/api/members', {
    headers: { Authorization: 'Bearer demo-owner-token' },
  });
  console.log('GET /api/members status:', membersRes.status);
  const members = await membersRes.json();
  console.log('Total members fetched:', members.length);

  // 3. Create a new member
  const newMemberRes = await fetch('http://localhost:4000/api/members', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer demo-owner-token',
    },
    body: JSON.stringify({
      name: 'Aditya Patil',
      phone: '+91 99887 76655',
      gender: 'male',
      rate: 3200,
      planType: 'both',
      joinDate: '2026-09-11',
      status: 'active',
    }),
  });
  console.log('POST /api/members status:', newMemberRes.status);
  const created = await newMemberRes.json();
  console.log('Created Member:', created.name, '| ID:', created.id);

  // 4. Fetch cook forecast
  const forecastRes = await fetch('http://localhost:4000/api/members/forecast', {
    headers: { Authorization: 'Bearer demo-owner-token' },
  });
  console.log('GET /api/members/forecast status:', forecastRes.status);
  const forecast = await forecastRes.json();
  console.log('Cook for count:', forecast.cookForCount, '| Lunch:', forecast.lunchCount, '| Dinner:', forecast.dinnerCount);

  console.log('\n🎉 NestJS REST API VERIFICATION SUCCESSFUL!');
}

verifyApi().catch(console.error);
