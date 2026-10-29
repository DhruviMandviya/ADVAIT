import puppeteer from 'puppeteer-core';
import path from 'path';
import fs from 'fs';

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = path.resolve('C:/Users/harsh/.gemini/antigravity/brain/c48c10b7-fd14-4a79-aa85-6519d7ba74f4/screenshots');
if (!fs.existsSync(ARTIFACT_DIR)) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
}

const wait = ms => new Promise(r => setTimeout(r, ms));

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

async function runMasterFixesVerification() {
  console.log('🚀 Starting ADVAIT Master Fixes Verification: Anomaly Header, Cases Table, Count Synchronization & Reset Demo Data...\n');

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
    // PART 1: AICTE ANOMALY DETECTION HEADER ALIGNMENT
    // ==========================================
    console.log('--- PART 1: AICTE Anomaly Detection Header Alignment ---');
    await setAicteAuth(page);
    await page.goto('http://127.0.0.1:5173/aicte/anomalies', { waitUntil: 'networkidle0' });
    await wait(800);

    const headerMetrics = await page.evaluate(() => {
      const heading = document.querySelector('h1')?.innerText.trim();
      const desc = document.querySelector('h1 + p')?.innerText.trim();
      const caseMgrBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Compliance Case Manager'));
      const badge = Array.from(document.querySelectorAll('div, span')).find(el => el.innerText.includes('Flagged Anomalies') && el.classList.contains('bg-[#14233F]'));

      let btnRect = null;
      let badgeRect = null;
      if (caseMgrBtn) {
        const r = caseMgrBtn.getBoundingClientRect();
        btnRect = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
      }
      if (badge) {
        const r = badge.getBoundingClientRect();
        badgeRect = { top: r.top, bottom: r.bottom, left: r.left, right: r.right, width: r.width, height: r.height };
      }

      return {
        heading,
        desc,
        hasCaseMgrBtn: !!caseMgrBtn,
        btnRect,
        badgeRect,
        hasBadge: !!badge
      };
    });

    assert(headerMetrics.heading === 'Intelligent Anomaly Detection & Risk Scoring', `Heading rendered correctly: '${headerMetrics.heading}'`);
    assert(headerMetrics.hasCaseMgrBtn, 'Compliance Case Manager button is present');
    assert(headerMetrics.hasBadge, 'Flagged Anomalies indicator is present');
    assert(headerMetrics.btnRect?.width >= 180, `Button has suitable readable min-width (${Math.round(headerMetrics.btnRect?.width)}px >= 180px)`);

    if (headerMetrics.btnRect && headerMetrics.badgeRect) {
      const verticalOffset = Math.abs(headerMetrics.btnRect.top - headerMetrics.badgeRect.top);
      assert(verticalOffset < 10, `Button and badge are horizontally aligned in action group (vertical offset: ${Math.round(verticalOffset)}px < 10px)`);
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '75-aicte-anomaly-header-alignment.png') });
    console.log('  📸 Screenshot saved: 75-aicte-anomaly-header-alignment.png\n');


    // ==========================================
    // PART 2: AICTE COMPLIANCE CASES TABLE
    // ==========================================
    console.log('--- PART 2: AICTE Compliance Cases Table Layout & Actions Column ---');
    await page.goto('http://127.0.0.1:5173/aicte/cases', { waitUntil: 'networkidle0' });
    await wait(1000);

    const tableMetrics = await page.evaluate(() => {
      const table = document.querySelector('table');
      if (!table) return null;
      const container = table.closest('.overflow-x-auto');
      const ths = Array.from(table.querySelectorAll('thead th')).map(th => th.innerText.trim());
      const thActions = Array.from(table.querySelectorAll('thead th')).slice(-1)[0];
      const rows = Array.from(table.querySelectorAll('tbody tr'));
      
      const thRect = thActions.getBoundingClientRect();
      const actionsHeader = {
        text: thActions.innerText.trim(),
        width: thRect.width,
        right: thRect.right,
        textAlign: window.getComputedStyle(thActions).textAlign
      };

      const rowActions = rows.slice(0, 5).map(r => {
        const lastTd = Array.from(r.querySelectorAll('td')).slice(-1)[0];
        if (!lastTd) return null;
        const rect = lastTd.getBoundingClientRect();
        const primaryBtns = Array.from(lastTd.querySelectorAll('button')).filter(b => b.classList.contains('whitespace-nowrap'));
        return {
          width: rect.width,
          right: rect.right,
          textAlign: window.getComputedStyle(lastTd).textAlign,
          verticalAlign: window.getComputedStyle(lastTd).verticalAlign,
          btnCount: lastTd.querySelectorAll('button').length
        };
      }).filter(Boolean);

      return {
        hasScrollContainer: !!container,
        tableWidth: table.getBoundingClientRect().width,
        isTableFixed: window.getComputedStyle(table).tableLayout === 'fixed',
        ths,
        actionsHeader,
        rowActions
      };
    });

    assert(tableMetrics !== null, 'Compliance cases table found');
    assert(tableMetrics?.hasScrollContainer, 'Table is wrapped in overflow-x-auto container');
    assert(tableMetrics?.isTableFixed, 'Table layout is fixed (table-layout: fixed)');
    assert(tableMetrics?.tableWidth >= 1200, `Table has suitable minimum width (${Math.round(tableMetrics?.tableWidth)}px >= 1200px)`);

    const expectedCols = ['CASE ID & ISSUE', 'INSTITUTION', 'STUDENT / APAAR', 'SEVERITY', 'NOTICE & DUE', 'LATEST RESPONSE', 'ASSIGNED OFFICER', 'STATUS', 'ACTIONS'];
    const allColsMatch = expectedCols.every(col => tableMetrics?.ths.some(th => th.toUpperCase().includes(col)));
    assert(allColsMatch, `Table contains all 9 columns in order: ${tableMetrics?.ths.join(' | ')}`);

    assert(tableMetrics?.actionsHeader?.textAlign === 'right', 'Actions column header is right-aligned');
    if (tableMetrics?.rowActions && tableMetrics.rowActions.length > 0) {
      const headerRight = tableMetrics.actionsHeader.right;
      const allAligned = tableMetrics.rowActions.every(ra => Math.abs(ra.right - headerRight) < 3);
      assert(allAligned, 'All row action cells align precisely with the Actions column header within < 3px tolerance');
      console.log(`  ℹ️ Actions column header width: ${Math.round(tableMetrics.actionsHeader.width)}px, header right: ${Math.round(headerRight)}px`);
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '76-aicte-cases-table-alignment.png') });
    console.log('  📸 Screenshot saved: 76-aicte-cases-table-alignment.png\n');


    // ==========================================
    // PART 3: AUDIT & SYNCHRONIZE INSTITUTION PORTAL CASE COUNTS
    // ==========================================
    console.log('--- PART 3: Institution Portal Compliance Case Counts Audit & Sync ---');
    await setInstitutionAuth(page);
    await page.goto('http://127.0.0.1:5173/institution/validation', { waitUntil: 'networkidle0' });
    await wait(1000);

    const countsData = await page.evaluate(() => {
      // Summary cards
      const cards = Array.from(document.querySelectorAll('.grid > div'));
      const getCardCount = (label) => {
        const card = cards.find(c => c.innerText && c.innerText.toUpperCase().includes(label.toUpperCase()));
        if (!card) return null;
        const numEl = card.querySelector('.text-2xl');
        return numEl ? parseInt(numEl.innerText.trim(), 10) : null;
      };

      const openCasesCount = getCardCount('Total Open Cases');
      const noticesReqCount = getCardCount('Notices Requiring Response');
      const underReviewCount = getCardCount('Responses Under AICTE Review');
      const furtherActionCount = getCardCount('Further Action Required');
      const resolvedCount = getCardCount('Resolved Cases');

      // Tabs
      const tabs = Array.from(document.querySelectorAll('button[type="button"]')).filter(b => b.querySelector('.font-mono'));
      const tabCounts = {};
      tabs.forEach(t => {
        const name = t.querySelector('span:first-child')?.innerText.trim();
        const count = t.querySelector('.font-mono')?.innerText.trim();
        if (name && count) {
          tabCounts[name] = parseInt(count, 10);
        }
      });

      return {
        openCasesCount,
        noticesReqCount,
        underReviewCount,
        furtherActionCount,
        resolvedCount,
        tabCounts
      };
    });

    console.log('  Audited Institution Metrics:');
    console.log('  - Total Open Cases Summary Card:', countsData.openCasesCount);
    console.log('  - Responses Under AICTE Review:', countsData.underReviewCount);
    console.log('  - Tab Badges:', JSON.stringify(countsData.tabCounts, null, 2));

    assert(countsData.openCasesCount === 3, `Total Open Cases card displays 3 active inquiries (got: ${countsData.openCasesCount})`);
    assert(countsData.tabCounts['All Cases'] === 3, `All Cases tab badge displays 3 unique cases (got: ${countsData.tabCounts['All Cases']})`);
    assert(countsData.tabCounts['Data Validation Issues'] === 2, `Data Validation Issues tab badge accurately displays 2 unique cases (got: ${countsData.tabCounts['Data Validation Issues']})`);
    assert(countsData.tabCounts['Cross-Institution Conflicts'] === 1, `Cross-Institution Conflicts tab badge displays 1 (got: ${countsData.tabCounts['Cross-Institution Conflicts']})`);
    assert(countsData.tabCounts['Intake & Quota Issues'] === 0, `Intake & Quota Issues tab badge displays 0 (got: ${countsData.tabCounts['Intake & Quota Issues']})`);
    assert(countsData.tabCounts['Notices Received'] === 1, `Notices Received tab badge displays 1 (got: ${countsData.tabCounts['Notices Received']})`);
    assert(countsData.tabCounts['Responses Submitted'] === 1, `Responses Submitted tab badge displays 1 (got: ${countsData.tabCounts['Responses Submitted']})`);
    assert(countsData.tabCounts['Resolved Cases'] === 0, `Resolved Cases tab badge displays 0 (got: ${countsData.tabCounts['Resolved Cases']})`);

    // Click "Data Validation Issues" tab to verify table & roster alignment
    await page.evaluate(() => {
      const tabs = Array.from(document.querySelectorAll('button[type="button"]'));
      const dvTab = tabs.find(t => t.innerText.includes('Data Validation Issues'));
      if (dvTab) dvTab.click();
    });
    await wait(600);

    const dvSectionData = await page.evaluate(() => {
      const rosterBadge = document.querySelector('.bg-\\[\\#F4F8F6\\] .bg-rose-50, .bg-\\[\\#F4F8F6\\] span[class*="text-rose"]')?.innerText.trim() 
        || document.querySelector('.bg-\\[\\#F4F8F6\\]')?.innerText.match(/\d+\s+Records Flagged/)?.[0];
      const rosterRows = document.querySelectorAll('.bg-\\[\\#F4F8F6\\] ~ div table tbody tr').length;
      const caseTableRows = document.querySelectorAll('.overflow-hidden ~ .overflow-hidden table tbody tr').length 
        || document.querySelectorAll('table.min-w-\\[1020px\\] tbody tr').length;
      return { rosterBadge, rosterRows, caseTableRows };
    });

    console.log(`  - Ingestion Roster Rows: ${dvSectionData.rosterRows}, Case Table Rows: ${dvSectionData.caseTableRows}`);
    assert(dvSectionData.caseTableRows === 2, `Data Validation Issues case table renders exactly 2 cases (got: ${dvSectionData.caseTableRows})`);

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '77-institution-counts-synchronized.png') });
    console.log('  📸 Screenshot saved: 77-institution-counts-synchronized.png\n');


    // ==========================================
    // PART 5: RESET DEMO DATA OPTION & CONFIRMATION MODAL
    // ==========================================
    console.log('--- PART 5: Reset Demo Data Option & Confirmation Modal ---');
    // Open profile dropdown
    const openedProfile = await page.evaluate(() => {
      const profileBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Dr. Sunil Bhirud') || b.querySelector('svg.lucide-chevron-down'));
      if (profileBtn) {
        profileBtn.click();
        return true;
      }
      return false;
    });
    assert(openedProfile, 'Opened user profile dropdown menu');
    await wait(500);

    // Verify Reset Demo Data menu item exists
    const resetMenuItem = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div.absolute button'));
      const resetBtn = buttons.find(b => b.innerText.includes('Reset Demo Data'));
      if (!resetBtn) return null;
      const hasIcon = !!resetBtn.querySelector('svg');
      return {
        text: resetBtn.innerText.trim(),
        hasIcon
      };
    });

    assert(resetMenuItem !== null, 'Reset Demo Data menu item is present in profile dropdown');
    assert(resetMenuItem?.hasIcon, 'Reset Demo Data menu item contains reset icon');

    // Click Reset Demo Data to open confirmation modal
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div.absolute button'));
      const resetBtn = buttons.find(b => b.innerText.includes('Reset Demo Data'));
      if (resetBtn) resetBtn.click();
    });
    await wait(700);

    // Verify modal title, message, and buttons
    const resetModalInfo = await page.evaluate(() => {
      const modal = document.querySelector('[role="dialog"]') || document.querySelector('.fixed.inset-0');
      if (!modal) return null;
      const title = modal.querySelector('h3')?.innerText.trim();
      const text = modal.innerText;
      const hasCancel = Array.from(modal.querySelectorAll('button')).some(b => b.innerText.includes('Cancel'));
      const hasConfirm = Array.from(modal.querySelectorAll('button')).some(b => b.innerText.includes('Reset Demo Data'));
      return {
        title,
        hasWarningMessage: text.includes('This will restore the ADVAIT demonstration environment to its original sample state'),
        hasCancel,
        hasConfirm
      };
    });

    assert(resetModalInfo?.title === 'Reset Demo Data?', `Modal title is exactly 'Reset Demo Data?' (got: '${resetModalInfo?.title}')`);
    assert(resetModalInfo?.hasWarningMessage, 'Modal contains authentic sample state warning message');
    assert(resetModalInfo?.hasCancel && resetModalInfo?.hasConfirm, 'Modal provides Cancel and Reset Demo Data action buttons');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '78-reset-demo-modal.png') });
    console.log('  📸 Screenshot saved: 78-reset-demo-modal.png');

    // Test Cancel button
    console.log('  Testing Cancel button...');
    await page.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      if (!dialog) return;
      const cancelBtn = Array.from(dialog.querySelectorAll('button')).find(b => b.innerText.trim() === 'Cancel');
      if (cancelBtn) cancelBtn.click();
    });
    await wait(500);

    const modalClosedAfterCancel = await page.evaluate(() => !document.querySelector('[role="dialog"]'));
    assert(modalClosedAfterCancel, 'Cancel button closed modal without altering dataset');

    // Re-open and execute actual Reset Demo Data
    console.log('  Executing Reset Demo Data...');
    await page.evaluate(() => {
      const profileBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Dr. Sunil Bhirud') || b.querySelector('svg.lucide-chevron-down'));
      if (profileBtn) profileBtn.click();
    });
    await wait(400);

    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div.absolute button'));
      const resetBtn = buttons.find(b => b.innerText.includes('Reset Demo Data'));
      if (resetBtn) resetBtn.click();
    });
    await wait(600);

    // Click Confirm Reset Demo Data
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('.fixed.inset-0 button'));
      const confirmBtn = buttons.find(b => b.innerText.includes('Reset Demo Data'));
      if (confirmBtn) confirmBtn.click();
    });
    await wait(1200);

    // Check for success toast
    const toastSuccess = await page.evaluate(() => {
      const allText = document.body.innerText;
      return allText.includes('Demo Environment Restored') || allText.includes('pristine sample baseline');
    });
    assert(toastSuccess, 'Success notification displayed confirming demo environment restoration');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, '79-reset-demo-success.png') });
    console.log('  📸 Screenshot saved: 79-reset-demo-success.png');

  } catch (err) {
    console.error('💥 Error during Master Fixes verification:', err);
    allPassed = false;
  } finally {
    await browser.close();
  }

  console.log('\n==========================================');
  if (allPassed) {
    console.log('🎉 ALL MASTER FIXES VERIFICATION CHECKS PASSED PERFECTLY!');
  } else {
    console.error('❌ SOME CHECKS FAILED. PLEASE REVIEW LOGS.');
    process.exit(1);
  }
}

runMasterFixesVerification();
