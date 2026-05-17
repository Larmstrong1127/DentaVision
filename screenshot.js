const puppeteer = require('puppeteer');
const axios = require('axios');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:4000/api';
const APP  = 'http://localhost:3000';
const OUT  = path.join(__dirname, 'screenshots');

if (!fs.existsSync(OUT)) fs.mkdirSync(OUT);

async function setupDemoData() {
  let clinicToken, clinicCode;
  try {
    const r = await axios.post(`${BASE}/auth/clinic/register`, {
      name: 'Sunrise Dental Group', email: 'demo-clinic@dentavision.dev', password: 'Demo1234!'
    });
    clinicToken = r.data.token;
    const match = r.data.message?.match(/([A-Z0-9]{6,})/);
    clinicCode = match ? match[1] : null;
    console.log('✓ Clinic registered, code:', clinicCode);
  } catch (e) {
    if (e.response?.status === 409) {
      const r = await axios.post(`${BASE}/auth/clinic/login`, { email: 'demo-clinic@dentavision.dev', password: 'Demo1234!' });
      clinicToken = r.data.token;
      clinicCode = r.data.user?.registrationCode;
      console.log('✓ Clinic logged in, code:', clinicCode);
    } else { throw e; }
  }

  let patientToken;
  try {
    const r = await axios.post(`${BASE}/auth/patient/register`, {
      firstName: 'Alex', lastName: 'Rivera', email: 'demo-patient@dentavision.dev',
      password: 'Demo1234!', clinicCode
    });
    patientToken = r.data.token;
    console.log('✓ Patient registered');
  } catch (e) {
    if (e.response?.status === 409) {
      const r = await axios.post(`${BASE}/auth/patient/login`, { email: 'demo-patient@dentavision.dev', password: 'Demo1234!' });
      patientToken = r.data.token;
      console.log('✓ Patient logged in');
    } else { throw e; }
  }

  return { clinicToken, patientToken };
}

async function screenshot(page, name) {
  const filePath = path.join(OUT, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`  📸 ${name}.png`);
}

// Inject token BEFORE the page JS runs so React reads it from localStorage on mount
async function gotoAuthenticated(page, url, token, role) {
  await page.evaluateOnNewDocument((t, r) => {
    localStorage.setItem('dv_token', t);
    localStorage.setItem('dv_user', JSON.stringify({ role: r }));
  }, token, role);
  await page.goto(url, { waitUntil: 'networkidle0' });
  await new Promise(res => setTimeout(res, 1500));
}

async function main() {
  const { clinicToken, patientToken } = await setupDemoData();

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    defaultViewport: { width: 1280, height: 800 }
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    // ── 1. Login page (unauthenticated) ───────────────────────
    console.log('\nCapturing: Login page');
    await page.goto(`${APP}/login`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    await screenshot(page, '01-login');

    // ── 2. Register clinic page ───────────────────────────────
    console.log('Capturing: Register clinic page');
    await page.goto(`${APP}/register/clinic`, { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    await screenshot(page, '02-register-clinic');

    // ── 3. Clinic Dashboard ───────────────────────────────────
    console.log('Capturing: Clinic dashboard');
    await gotoAuthenticated(page, `${APP}/clinic`, clinicToken, 'clinic');
    await screenshot(page, '03-clinic-dashboard');

    // ── 4. Patients page ──────────────────────────────────────
    console.log('Capturing: Patients list');
    await gotoAuthenticated(page, `${APP}/clinic/patients`, clinicToken, 'clinic');
    await screenshot(page, '04-clinic-patients');

    // ── 5. Scan page ──────────────────────────────────────────
    console.log('Capturing: Scan page');
    await gotoAuthenticated(page, `${APP}/clinic/scan`, clinicToken, 'clinic');
    await screenshot(page, '05-clinic-scan');

    // ── 6. Patient Home ───────────────────────────────────────
    console.log('Capturing: Patient home');
    await gotoAuthenticated(page, `${APP}/my`, patientToken, 'patient');
    await screenshot(page, '06-patient-home');

    // ── 7. Patient Treatment Plan ─────────────────────────────
    console.log('Capturing: Patient treatment plan');
    await gotoAuthenticated(page, `${APP}/my/treatment`, patientToken, 'patient');
    await screenshot(page, '07-patient-treatment');

    // ── 8. Patient Chart ──────────────────────────────────────
    console.log('Capturing: Patient chart');
    await gotoAuthenticated(page, `${APP}/my/chart`, patientToken, 'patient');
    await screenshot(page, '08-patient-chart');

    console.log('\n✅ All screenshots saved to:', OUT);
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
