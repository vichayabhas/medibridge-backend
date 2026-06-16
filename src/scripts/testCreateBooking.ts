// import dotenv from 'dotenv';
// dotenv.config();

// async function main() {
//   const url = process.env.TEST_BOOKING_URL || 'http://localhost:3001/api/bookings/create';
//   const pharmacistId = process.env.TEST_PHARMACIST_ID || 'ph-unknown';

//   const appointmentTime = new Date(Date.now() + 15 * 60 * 1000);
//   const pad = (n: number) => String(n).padStart(2, '0');
//   const slot = `${pad(appointmentTime.getHours())}:${pad(appointmentTime.getMinutes())}`;
//   const payload = {
//     pharmacistId,
//     slot,
//     duration: 15,
//     dayOffset: 0,
//     appointmentTime: appointmentTime.toISOString(),
//     userId: process.env.TEST_USER_ID || null,
//     patientName: 'ทดสอบ ผู้ใช้',
//     requestType: 'telemedicine',
//     telemedicineChannel: 'chat',
//     telemedicinePatientNote: 'นี่คือหมายเหตุทดสอบ',
//     telemedicineCollectedData: {
//       note: 'ทดลองข้อมูล',
//       duration: 15,
//       slot: '10:30',
//       appointmentTime: new Date().toISOString(),
//       patientName: 'ทดสอบ',
//     }
//   };

//   console.log('Posting to', url, 'with pharmacistId', pharmacistId);
//   try {
//     const res = await fetch(url, {
//       method: 'POST',
//       headers: { 'Content-Type': 'application/json' },
//       body: JSON.stringify(payload),
//     });
//     const text = await res.text();
//     console.log('Status:', res.status);
//     console.log('Response:', text);
//   } catch (e) {
//     console.error('Request failed', e);
//     process.exit(1);
//   }
// }

// main();
