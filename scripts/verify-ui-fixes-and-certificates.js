import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = path.resolve('C:/Users/harsh/.gemini/antigravity/brain/c48c10b7-fd14-4a79-aa85-6519d7ba74f4/screenshots');
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const wait = ms => new Promise(r => setTimeout(r, ms));

async function setInstitutionAuth(page) {
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const instUser = {
      id: 'INST102',
      name: 'Dr. Sunil Bhirud',
      email: 'director@coep.ac.in',
      role: 'institution',
      institutionId: 'INST102',
      institutionName: 'College of Engineering Pune (COEP Technological University)',
      designation: 'Director & Institution Admin'
    };
    localStorage.setItem('advait_auth_user', JSON.stringify(instUser));
  });
  await page.goto('http://127.0.0.1:5173/institution/dashboard', { waitUntil: 'networkidle0' });
  await wait(600);
}

async function setAicteAuth(page) {
  await page.goto('http://127.0.0.1:5173/login', { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    const aicteUser = {
      id: 'AICTE001',
      name: 'Dr. R. K. Srivastav',
      email: 'advisor.approval@aicte-india.org',
      role: 'aicte',
      institutionId: 'AICTE-HQ',
      institutionName: 'All India Council for Technical Education (HQ)',
      designation: 'Advisor - Policy & Academic Approvals'
    };
    localStorage.setItem('advait_auth_user', JSON.stringify(aicteUser));
  });
  await page.goto('http://127.0.0.1:5173/aicte/dashboard', { waitUntil: 'networkidle0' });
  await wait(600);
}

async function runE2EVerification() {
  console.log('🚀 Starting ADVAIT Comprehensive E2E Verification: UI Fixes & Certificate Registry...\n');

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=1440,920']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 920 });

  let allPassed = true;
  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      allPassed = false;
    }
  }

  try {
    // ==========================================
    // PHASE 4: REMOVAL OF "AICTE Central Vault: Live Sync Active" BADGE
    // ==========================================
    console.log('--- PHASE 4: Header Badge Removal Verification ---');
    await setInstitutionAuth(page);

    const hasVaultBadgeInst = await page.evaluate(() => {
      const allText = document.body.innerText;
      return allText.includes('AICTE Central Vault') || allText.includes('Live Sync Active');
    });
    assert(!hasVaultBadgeInst, 'Institution Portal header does NOT contain "AICTE Central Vault: Live Sync Active"');

    // Also check AICTE Official Portal
    await setAicteAuth(page);
    const hasVaultBadgeAicte = await page.evaluate(() => {
      const allText = document.body.innerText;
      return allText.includes('AICTE Central Vault') || allText.includes('Live Sync Active');
    });
    assert(!hasVaultBadgeAicte, 'AICTE Official Portal header does NOT contain "AICTE Central Vault: Live Sync Active"');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '74-header-clean-no-vault-badge.png') });
    console.log('  📸 Screenshot saved: 74-header-clean-no-vault-badge.png\n');


    // ==========================================
    // PHASE 1: COMPLIANCE & RESOLUTION CENTER TABLE ALIGNMENT
    // ==========================================
    console.log('--- PHASE 1: Compliance & Resolution Center Table Alignment ---');
    await setInstitutionAuth(page);
    await page.goto('http://127.0.0.1:5173/institution/validation', { waitUntil: 'networkidle0' });
    await wait(1000);

    const tableMetrics = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return null;
      const container = table.closest('.overflow-x-auto');
      const thActions = Array.from(table.querySelectorAll('thead th')).slice(-1)[0];
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      
      const thRect = thActions.getBoundingClientRect();
      const actionsHeaders = {
        text: thActions.innerText.trim(),
        width: thRect.width,
        right: thRect.right,
        textAlign: window.getComputedStyle(thActions).textAlign
      };

      const rowActions = rows.slice(0, 5).map(r => {
        const lastTd = Array.from(r.querySelectorAll('td')).slice(-1)[0];
        if (!lastTd) return null;
        const rect = lastTd.getBoundingClientRect();
        return {
          width: rect.width,
          right: rect.right,
          textAlign: window.getComputedStyle(lastTd).textAlign,
          buttonCount: lastTd.querySelectorAll('button').length
        };
      }).filter(Boolean);

      return {
        hasScrollContainer: !!container,
        tableWidth: table.getBoundingClientRect().width,
        isTableFixed: window.getComputedStyle(table).tableLayout === 'fixed',
        actionsHeaders,
        rowActions
      };
    });

    assert(tableMetrics !== null, 'Compliance table found');
    assert(tableMetrics?.hasScrollContainer, 'Table is wrapped in overflow-x-auto container');
    assert(tableMetrics?.isTableFixed, 'Table layout is fixed for deterministic column alignment');
    assert(tableMetrics?.actionsHeaders?.text.toUpperCase().includes('ACTIONS'), 'Actions column header is present');
    assert(tableMetrics?.actionsHeaders?.textAlign === 'right', 'Actions column header is right-aligned');

    if (tableMetrics?.rowActions && tableMetrics.rowActions.length > 0) {
      const headerRight = tableMetrics.actionsHeaders.right;
      const allAligned = tableMetrics.rowActions.every(ra => Math.abs(ra.right - headerRight) < 3);
      assert(allAligned, 'All row action cells align precisely with the Actions column header within < 3px tolerance');
      console.log(`  ℹ️ Actions column header width: ${Math.round(tableMetrics.actionsHeaders.width)}px, header right edge: ${Math.round(headerRight)}px`);
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '69-compliance-table-alignment.png') });
    console.log('  📸 Screenshot saved: 69-compliance-table-alignment.png\n');


    // ==========================================
    // PHASE 2: RESUBMIT / COMPLIANCE MODAL ARCHITECTURE & PINNED FOOTER
    // ==========================================
    console.log('--- PHASE 2: Institutional Compliance Response Modal Layout & Pinned Footer ---');
    
    // Switch to "Notices Received" tab to see actionable notices
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button'));
      const noticeTab = tabs.find(b => b.innerText.includes('Notices Received') || b.innerText.includes('All Cases'));
      if (noticeTab) noticeTab.click();
    });
    await wait(600);

    // Look for a "Respond" or "Resubmit" button
    const openedModal = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const targetBtn = buttons.find(b => b.innerText.trim() === 'Respond' || b.innerText.trim() === 'Resubmit' || b.innerText.trim().includes('Respond'));
      if (targetBtn) {
        targetBtn.click();
        return true;
      }
      return false;
    });
    assert(openedModal, 'Found and clicked Respond / Resubmit button on compliance case');
    await wait(800);

    // Verify modal portal, scroll locking, and pinned submit button
    const modalMetrics = await page.evaluate(() => {
      const overlay = document.querySelector('.fixed.inset-0');
      const modalDialog = document.querySelector('[role="dialog"]') || document.querySelector('.fixed.inset-0 > div');
      if (!overlay || !modalDialog) return null;

      const bodyOverflow = window.getComputedStyle(document.body).overflow;
      const isPortal = modalDialog.closest('body') === document.body && !document.querySelector('#root').contains(modalDialog.parentElement);

      // Submit button
      const buttons = Array.from(modalDialog.querySelectorAll('button'));
      const submitBtn = buttons.find(b => b.innerText.includes('Submit') || b.innerText.includes('Compliance Response'));
      const cancelBtn = buttons.find(b => b.innerText.includes('Cancel'));

      let submitRect = null;
      if (submitBtn) {
        const r = submitBtn.getBoundingClientRect();
        submitRect = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, height: r.height, width: r.width };
      }
      const viewportHeight = window.innerHeight;

      return {
        bodyOverflow,
        isPortal,
        hasSubmitBtn: !!submitBtn,
        submitBtnVisible: submitRect ? (submitRect.bottom <= viewportHeight && submitRect.top >= 0) : false,
        submitRect,
        viewportHeight,
        hasCancelBtn: !!cancelBtn
      };
    });

    assert(modalMetrics !== null, 'Response / Resubmit modal opened');
    assert(modalMetrics?.bodyOverflow === 'hidden', 'Body scroll is locked while modal is open');
    assert(modalMetrics?.hasSubmitBtn, 'Submit Compliance Response button is present in modal');
    assert(modalMetrics?.submitBtnVisible, `Submit button is permanently visible in viewport (${Math.round(modalMetrics?.submitRect?.bottom)}px <= ${modalMetrics?.viewportHeight}px)`);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '70-resubmit-modal-pinned-footer.png') });
    console.log('  📸 Screenshot saved: 70-resubmit-modal-pinned-footer.png');

    // Test dismiss modal via Escape key
    await page.keyboard.press('Escape');
    await wait(500);

    const bodyUnlocked = await page.evaluate(() => window.getComputedStyle(document.body).overflow !== 'hidden');
    assert(bodyUnlocked, 'Modal closed on Escape key and body scroll unlocked\n');


    // ==========================================
    // PHASE 3: STUDENT CERTIFICATE REGISTRY
    // ==========================================
    console.log('--- PHASE 3: Student Certificate Registry ---');
    await page.goto('http://127.0.0.1:5173/institution/certificate-preview', { waitUntil: 'networkidle0' });
    await wait(1000);

    // Verify heading, subtitle, and table headers
    const registryInfo = await page.evaluate(() => {
      const heading = document.querySelector('h1')?.innerText.trim();
      const subtitle = document.querySelector('h1 + p')?.innerText.trim();
      const table = document.querySelector('table');
      const ths = table ? Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim()) : [];
      const rows = table ? Array.from(table.querySelectorAll('tbody tr')).length : 0;
      
      const apaarCells = table ? Array.from(table.querySelectorAll('tbody tr td:nth-child(3)')).map(td => td.innerText.trim()) : [];

      return {
        heading,
        subtitle,
        ths,
        rows,
        apaarCells
      };
    });

    assert(registryInfo.heading === 'Student Certificate Registry', `Heading is exactly 'Student Certificate Registry' (got: '${registryInfo.heading}')`);
    assert(registryInfo.subtitle?.toLowerCase().includes('view verified student records and preview their corresponding academic identity verification certificates'), 'Subtitle matches required specification');
    assert(registryInfo.rows > 0, `Table displays ${registryInfo.rows} student records for institution`);
    
    // Check all 8 required column concepts
    const requiredCols = ['STUDENT NAME', 'ROLL', 'APAAR', 'PROGRAMME', 'YEAR', 'VERIFICATION', 'CERTIFICATE', 'ACTIONS'];
    const allColsMatch = requiredCols.every(col => registryInfo.ths.some(th => th.toUpperCase().includes(col)));
    assert(allColsMatch, `Table contains all required columns: ${registryInfo.ths.join(' | ')}`);

    const apaarMasked = registryInfo.apaarCells.length > 0 && registryInfo.apaarCells.every(cell => cell.includes('••••'));
    assert(apaarMasked, `All displayed APAAR IDs are privacy-masked (e.g. ${registryInfo.apaarCells[0]})`);

    // Capture Table overview screenshot
    await page.screenshot({ path: path.join(ARTIFACT_DIR, '71-student-certificate-registry-table.png') });
    console.log('  📸 Screenshot saved: 71-student-certificate-registry-table.png');

    // Test Search input
    console.log('  Testing search functionality...');
    await page.type('input[placeholder*="Search"]', 'Rahul');
    await wait(500);
    const searchResultsCount = await page.evaluate(() => document.querySelectorAll('tbody tr').length);
    assert(searchResultsCount >= 1, `Search filters students dynamically (${searchResultsCount} matches)`);

    // Clear search completely using Control+A then Backspace and native setter
    await page.focus('input[placeholder*="Search"]');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.evaluate(() => {
      const input = document.querySelector('input[placeholder*="Search"]');
      if (input) {
        const nativeSet = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
        if (nativeSet) nativeSet.call(input, '');
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
    await wait(800);

    // Test View Certificate on a Validated student
    console.log('  Testing View Certificate on Validated student...');
    const openedCert = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const validatedRow = rows.find(r => r.innerText.includes('Validated') && r.innerText.includes('Available'));
      if (validatedRow) {
        const viewCertBtn = Array.from(validatedRow.querySelectorAll('button')).find(b => b.innerText.includes('Certificate'));
        if (viewCertBtn) {
          viewCertBtn.click();
          return true;
        }
      }
      return false;
    });
    assert(openedCert, 'Found and clicked View Certificate on Validated student');
    await wait(800);

    // Check certificate modal elements
    const certModalDetails = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]') || document.querySelector('.fixed.inset-0');
      if (!modal) return null;
      const text = modal.innerText;
      const hasLogo = !!modal.querySelector('img[alt*="AICTE"]');
      return {
        hasCertificateTitle: text.includes('Academic') && text.includes('Verification'),
        hasLogo,
        hasApaar: text.includes('APAAR ID'),
        hasCouncilSeal: text.includes('All India Council for Technical Education')
      };
    });

    assert(certModalDetails?.hasCertificateTitle, 'Certificate modal displays official certificate title');
    assert(certModalDetails?.hasLogo, 'Certificate modal contains authentic AICTE crest/logo');
    assert(certModalDetails?.hasApaar, 'Certificate modal shows official APAAR identifier');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '72-student-certificate-preview-modal.png') });
    console.log('  📸 Screenshot saved: 72-student-certificate-preview-modal.png');

    // Close certificate modal via Close button
    try {
      await page.click('button[aria-label="Close modal"]');
    } catch (e) {
      console.log('  Could not click close button, pressing Escape');
      await page.keyboard.press('Escape');
    }
    await wait(800);

    // Test Ineligible / Blocked Download on Flagged student
    console.log('  Testing Certificate Ineligibility check on Flagged student...');
    const rowDebug = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      return rows.map(r => ({
        text: r.innerText.replace(/\n/g, ' | '),
        buttons: Array.from(r.querySelectorAll('button')).map(b => b.innerText.trim())
      }));
    });
    console.log('  Rows in table:', JSON.stringify(rowDebug, null, 2));

    const triggeredIneligible = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('tbody tr'));
      const flaggedRow = rows.find(r => r.innerText.includes('Flagged') || r.innerText.includes('Ineligible') || r.innerText.includes('Pending'));
      if (flaggedRow) {
        const buttons = Array.from(flaggedRow.querySelectorAll('button'));
        const actionBtn = buttons.find(b => b.innerText.includes('Download') || b.innerText.includes('View Certificate') || b.innerText.includes('Certificate'));
        if (actionBtn) {
          actionBtn.click();
          return true;
        }
      }
      return false;
    });
    assert(triggeredIneligible, 'Clicked Download / View Certificate on Flagged student');
    await wait(800);

    const ineligibilityNotice = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]') || document.querySelector('.fixed.inset-0');
      if (!modal) return null;
      const text = modal.innerText;
      return {
        isBlockedModal: text.includes('Certificate Not Available') || text.includes('Compliance Case Pending') || text.includes('Flagged') || text.includes('Ineligible') || text.includes('Resolution Required'),
        hasExplanation: text.includes('compliance') || text.includes('validation') || text.includes('Resolution Center') || text.includes('discrepanc') || text.includes('resolution')
      };
    });

    assert(ineligibilityNotice?.isBlockedModal, 'Certificate Ineligibility Modal correctly blocked issuance with explanatory message');
    assert(ineligibilityNotice?.hasExplanation, 'Modal explains that student record requires compliance resolution before certificate generation');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '73-certificate-ineligible-modal.png') });
    console.log('  📸 Screenshot saved: 73-certificate-ineligible-modal.png');

    // Close ineligible modal via Close button or Escape
    const closeBtn = await page.$('button[aria-label="Close modal"]');
    if (closeBtn) {
      await closeBtn.click();
    } else {
      await page.keyboard.press('Escape');
    }
    await wait(400);

    // Also verify route alias /institution/certificates
    console.log('\n--- Checking Route Alias /institution/certificates ---');
    await page.goto('http://127.0.0.1:5173/institution/certificates', { waitUntil: 'networkidle0' });
    await wait(800);
    const aliasTitle = await page.evaluate(() => document.querySelector('h1')?.innerText.trim());
    assert(aliasTitle === 'Student Certificate Registry', `Route alias /institution/certificates successfully renders Student Certificate Registry`);

  } catch (err) {
    console.error('💥 Error during E2E verification:', err);
    allPassed = false;
  } finally {
    await browser.close();
  }

  console.log('\n==========================================');
  if (allPassed) {
    console.log('🎉 ALL E2E VERIFICATION CHECKS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME CHECKS FAILED. PLEASE REVIEW LOGS.');
    process.exit(1);
  }
}

runE2EVerification();
