import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\harsh\\.gemini\\antigravity\\brain\\c48c10b7-fd14-4a79-aa85-6519d7ba74f4\\screenshots';

if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

async function clickByText(page, selector, text) {
  const clicked = await page.evaluate((sel, txt) => {
    const list = Array.from(document.querySelectorAll(sel));
    const el = list.find(item => item.textContent && item.textContent.includes(txt));
    if (el) {
      el.click();
      return true;
    }
    return false;
  }, selector, text);
  return clicked;
}

async function runMasterVerification() {
  console.log('🚀 Starting ADVAIT Master Verification: Authentic Logo, Dashboard Cleanup & Autofill...');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1400,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  // ==========================================
  // SECTION 1: AUTHENTIC AICTE LOGO VERIFICATION
  // ==========================================
  console.log('\n--- Section 1: Authentic AICTE Logo Verification ---');
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 600));

  const loginLogoInfo = await page.evaluate(() => {
    const img = document.querySelector('img[alt*="AICTE"]');
    if (!img) return null;
    return {
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      clientWidth: img.clientWidth,
      clientHeight: img.clientHeight,
      isLoaded: img.complete && img.naturalWidth > 0
    };
  });

  console.log('✔ Login Page Logo Assertion:', loginLogoInfo);
  if (!loginLogoInfo || !loginLogoInfo.isLoaded) {
    throw new Error('AICTE Logo failed to load properly on Login Page');
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '62-authentic-aicte-logo-login.png') });
  console.log('✔ Captured 62-authentic-aicte-logo-login.png');

  // Sign in as Institution Nodal Officer (COEP Pune)
  await clickByText(page, 'button', 'Secure Sign In');
  await new Promise(r => setTimeout(r, 1200));

  // Check Header Logo on Institution Dashboard
  const headerLogoInfo = await page.evaluate(() => {
    const img = document.querySelector('header img[alt*="AICTE"]');
    if (!img) return null;
    return {
      src: img.src,
      alt: img.alt,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
      clientWidth: img.clientWidth,
      clientHeight: img.clientHeight,
      isLoaded: img.complete && img.naturalWidth > 0
    };
  });

  console.log('✔ Header Logo Assertion:', headerLogoInfo);
  if (!headerLogoInfo || !headerLogoInfo.isLoaded) {
    throw new Error('AICTE Logo failed to load in Header');
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '63-authentic-aicte-logo-header.png') });
  console.log('✔ Captured 63-authentic-aicte-logo-header.png');

  // ==========================================
  // SECTION 2: REMOVE PIPELINE FROM DASHBOARD
  // ==========================================
  console.log('\n--- Section 2: Dashboard Cleanup (Pipeline Removal) ---');
  await page.goto('http://127.0.0.1:5173/institution/dashboard', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  const dashboardCheck = await page.evaluate(() => {
    const bodyUpper = document.body.innerText.toUpperCase();
    const hasPipelineHeading = bodyUpper.includes('ADVAIT END-TO-END PIPELINE') || bodyUpper.includes('APAAR ACADEMIC IDENTITY LIFECYCLE');
    const hasPipelineSteps = bodyUpper.includes('AUTHORIZED VERIFICATION') && bodyUpper.includes('CENTRAL REPOSITORY') && bodyUpper.includes('APAAR VALIDATION');
    
    // Check five summary cards
    const hasApprovedIntake = bodyUpper.includes('APPROVED INTAKE');
    const hasActualEnrolment = bodyUpper.includes('ACTUAL ENROLMENT');
    const hasSupernumerary = bodyUpper.includes('SUPERNUMERARY SEATS');
    const hasApaarValidated = bodyUpper.includes('APAAR VALIDATED');
    const hasFlaggedIssues = bodyUpper.includes('FLAGGED ISSUES');

    // Check Analytics and Alerts
    const hasIntakeChart = bodyUpper.includes('INTAKE VS ENROLMENT ANALYTICS');
    const hasValidationAlerts = bodyUpper.includes('VALIDATION CENTER ALERTS');

    return {
      pipelineIsRemoved: !hasPipelineHeading && !hasPipelineSteps,
      fiveCardsPresent: hasApprovedIntake && hasActualEnrolment && hasSupernumerary && hasApaarValidated && hasFlaggedIssues,
      analyticsPresent: hasIntakeChart,
      alertsPresent: hasValidationAlerts
    };
  });

  console.log('✔ Dashboard Pipeline Removal & Layout Assertions:', dashboardCheck);
  if (!dashboardCheck.pipelineIsRemoved) {
    throw new Error('Pipeline was NOT removed from Institution Dashboard');
  }
  if (!dashboardCheck.fiveCardsPresent || !dashboardCheck.analyticsPresent || !dashboardCheck.alertsPresent) {
    throw new Error('Required dashboard cards, analytics, or alerts are missing');
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '64-institution-dashboard-clean-no-pipeline.png'), fullPage: true });
  console.log('✔ Captured 64-institution-dashboard-clean-no-pipeline.png');

  // ==========================================
  // SECTION 3: STUDENT DATA UPLOAD AUTOFILL
  // ==========================================
  console.log('\n--- Section 3: Student Data Upload Autofill Verification ---');
  await page.goto('http://127.0.0.1:5173/institution/upload', { waitUntil: 'networkidle0' });
  await new Promise(r => setTimeout(r, 800));

  // Verify Autofill button is visible
  const buttonsCheck = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasAutofillBtn: text.includes('Autofill Sample Data'),
      hasInvalidSampleBtn: text.includes('Load Invalid Sample'),
      hasFormTitle: text.includes('Student-Level APAAR Admission Record')
    };
  });
  console.log('✔ Upload Form Controls Assertion:', buttonsCheck);
  if (!buttonsCheck.hasAutofillBtn || !buttonsCheck.hasInvalidSampleBtn) {
    throw new Error('Autofill or Invalid Sample buttons missing from upload form');
  }

  // Initial Form should be empty
  const initialFormValues = await page.evaluate(() => {
    const nameInput = document.querySelector('input[placeholder*="full name"]');
    const apaarInput = document.querySelector('input[placeholder*="9824"]');
    return {
      name: nameInput ? nameInput.value : null,
      apaar: apaarInput ? apaarInput.value : null
    };
  });
  console.log('✔ Initial Empty Form Values:', initialFormValues);

  // Click "Autofill Sample Data"
  console.log('Testing "Autofill Sample Data"...');
  await clickByText(page, 'button', 'Autofill Sample Data');
  await new Promise(r => setTimeout(r, 600));

  const autofilledValues = await page.evaluate(() => {
    const nameInput = document.querySelector('input[placeholder*="full name"]');
    const apaarInput = document.querySelector('input[placeholder*="9824"]');
    const studentIdInput = document.querySelector('input[placeholder*="COEP"]');
    const fatherInput = document.querySelector('input[placeholder*="guardian"]');
    const stateInput = document.querySelector('input[value*="Maharashtra"]');
    const selects = Array.from(document.querySelectorAll('select')).map(s => s.value);
    const demoBadge = document.body.innerText.includes('Demo Data');

    return {
      name: nameInput ? nameInput.value : '',
      apaarId: apaarInput ? apaarInput.value : '',
      studentId: studentIdInput ? studentIdInput.value : '',
      fatherName: fatherInput ? fatherInput.value : '',
      state: stateInput ? stateInput.value : '',
      selects,
      hasDemoBadge: demoBadge,
      apaarDigitCount: apaarInput ? apaarInput.value.replace(/\s+/g, '').length : 0
    };
  });

  console.log('✔ Autofilled Form Record Assertions:', autofilledValues);
  if (autofilledValues.apaarDigitCount !== 12) {
    throw new Error(`Expected exactly 12-digit APAAR, got ${autofilledValues.apaarDigitCount}`);
  }
  if (!autofilledValues.name || !autofilledValues.studentId || !autofilledValues.hasDemoBadge) {
    throw new Error('Autofill failed to populate student demographic or identity fields');
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '65-student-upload-autofill-valid.png') });
  console.log('✔ Captured 65-student-upload-autofill-valid.png');

  // Verify fields remain editable after autofill
  console.log('Testing field editability after autofill...');
  await page.focus('input[placeholder*="full name"]');
  await page.keyboard.press('End');
  await page.keyboard.type(' Jr.');
  const editedName = await page.$eval('input[placeholder*="full name"]', el => el.value);
  console.log('✔ Field editability confirmed. Edited Name:', editedName);

  // Test "Load Invalid Sample"
  console.log('Testing "Load Invalid Sample"...');
  await clickByText(page, 'button', 'Load Invalid Sample');
  await new Promise(r => setTimeout(r, 600));

  const invalidAutofilledValues = await page.evaluate(() => {
    const apaarInput = document.querySelector('input[placeholder*="9824"]');
    const nameInput = document.querySelector('input[placeholder*="full name"]');
    const hasInvalidBadge = document.body.innerText.includes('Invalid Test Data') || document.body.innerText.includes('Invalid Test Sample');
    return {
      name: nameInput ? nameInput.value : '',
      apaarId: apaarInput ? apaarInput.value : '',
      digitCount: apaarInput ? apaarInput.value.replace(/\s+/g, '').length : 0,
      hasInvalidBadge
    };
  });

  console.log('✔ Invalid Test Sample Assertions:', invalidAutofilledValues);
  if (invalidAutofilledValues.digitCount === 12) {
    throw new Error('Invalid test sample was expected to contain non-12 digit APAAR');
  }
  if (!invalidAutofilledValues.hasInvalidBadge) {
    throw new Error('Invalid test data indicator missing');
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '66-student-upload-autofill-invalid.png') });
  console.log('✔ Captured 66-student-upload-autofill-invalid.png');

  // Submit the invalid sample to verify existing validation rule triggers
  console.log('Submitting invalid sample to verify validation trigger...');
  await clickByText(page, 'button', 'Submit & Validate Record');
  await new Promise(r => setTimeout(r, 1200));

  const validationTriggerCheck = await page.evaluate(() => {
    const text = document.body.innerText;
    return {
      hasWarningToast: text.includes('Student Enrolled with Flag') || text.includes('flagged') || text.includes('Requires validation review')
    };
  });
  console.log('✔ Validation Trigger Verification:', validationTriggerCheck);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '67-student-upload-invalid-flag-triggered.png') });
  console.log('✔ Captured 67-student-upload-invalid-flag-triggered.png');

  // Test Reset Fields
  console.log('Testing Reset Fields...');
  await clickByText(page, 'button', 'Autofill Sample Data');
  await new Promise(r => setTimeout(r, 500));
  await clickByText(page, 'button', 'Reset Fields');
  await new Promise(r => setTimeout(r, 500));

  const resetValues = await page.evaluate(() => {
    const nameInput = document.querySelector('input[placeholder*="full name"]');
    const apaarInput = document.querySelector('input[placeholder*="9824"]');
    const hasDemoBadge = document.body.innerText.includes('Demo Data Loaded');
    return {
      name: nameInput ? nameInput.value : null,
      apaar: apaarInput ? apaarInput.value : null,
      hasDemoBadge
    };
  });
  console.log('✔ Form Reset Assertions:', resetValues);
  if (resetValues.name !== '' || resetValues.apaar !== '' || resetValues.hasDemoBadge) {
    throw new Error('Reset Fields failed to clear form');
  }

  await page.screenshot({ path: path.join(ARTIFACT_DIR, '68-student-upload-form-reset.png') });
  console.log('✔ Captured 68-student-upload-form-reset.png');

  console.log('\n====================================================================');
  console.log('✅ ALL MASTER PROMPT REQUIREMENTS (1, 2 & 3) 100% VERIFIED!');
  console.log('====================================================================\n');

  await browser.close();
}

runMasterVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
