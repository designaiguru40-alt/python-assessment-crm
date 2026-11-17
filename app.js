/**
 * Quantum AI Python 3 Assessment & CRM Engine
 * Built for Mohit Sir (Technical Faculty)
 */

// Application State
const state = {
  currentStudent: null,
  currentQuestionIndex: 0,
  answers: {}, // { [questionId]: 'a' | 'b' | 'c' | 'd' }
  markedForReview: new Set(),
  timeRemaining: 90 * 60, // in seconds
  timerInterval: null,
  currentRecord: null,
  paletteFilter: 'all',
  reviewFilter: 'all',
  crmRecords: []
};

// Initialize App on DOM Load
document.addEventListener('DOMContentLoaded', () => {
  loadCRMRecords();
  setupEventListeners();
  setupKeyboardShortcuts();
});

// Load records from LocalStorage
function loadCRMRecords() {
  try {
    const data = localStorage.getItem('quantum_ai_python_crm');
    if (data) {
      state.crmRecords = JSON.parse(data);
    } else {
      state.crmRecords = [];
    }
  } catch (e) {
    console.error('Failed to load CRM data:', e);
    state.crmRecords = [];
  }
}

// Save records to LocalStorage
function saveCRMRecords() {
  try {
    localStorage.setItem('quantum_ai_python_crm', JSON.stringify(state.crmRecords));
  } catch (e) {
    console.error('Failed to save CRM data:', e);
  }
}

// Setup Event Listeners
function setupEventListeners() {
  // Navigation Tabs
  document.getElementById('tab-test').addEventListener('click', () => {
    switchTab('test');
    if (!state.currentStudent) {
      showView('view-welcome');
    } else if (state.currentRecord) {
      showView('view-scorecard');
    } else {
      showView('view-exam');
    }
  });

  document.getElementById('tab-crm').addEventListener('click', () => {
    switchTab('crm');
    renderCRM();
    showView('view-crm');
  });

  // Start Form Submission
  const startForm = document.getElementById('student-reg-form');
  if (startForm) {
    startForm.addEventListener('submit', (e) => {
      e.preventDefault();
      startTest();
    });
  }

  // Exam Controls
  document.getElementById('btn-prev').addEventListener('click', () => navigateQuestion(-1));
  document.getElementById('btn-next').addEventListener('click', () => navigateQuestion(1));
  document.getElementById('btn-clear').addEventListener('click', clearChoice);
  document.getElementById('btn-mark').addEventListener('click', toggleMark);
  document.getElementById('btn-submit-exam').addEventListener('click', () => confirmSubmit());

  // Palette Filters
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.paletteFilter = e.target.dataset.filter;
      renderPalette();
    });
  });

  // Review Filters
  document.querySelectorAll('.review-filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.review-filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      state.reviewFilter = e.target.dataset.filter;
      renderReviewList();
    });
  });

  // CRM Search Input
  const crmSearch = document.getElementById('crm-search');
  if (crmSearch) {
    crmSearch.addEventListener('input', () => renderCRMTable());
  }
}

// Keyboard shortcuts for rapid testing
function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Only active during exam view and when not typing in an input
    const examView = document.getElementById('view-exam');
    if (!examView.classList.contains('active') || e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    const key = e.key.toLowerCase();
    if (['a', 'b', 'c', 'd'].includes(key)) {
      selectOption(key);
    } else if (key === '1') selectOption('a');
    else if (key === '2') selectOption('b');
    else if (key === '3') selectOption('c');
    else if (key === '4') selectOption('d');
    else if (key === 'arrowright' || key === 'n') {
      navigateQuestion(1);
    } else if (key === 'arrowleft' || key === 'p') {
      navigateQuestion(-1);
    } else if (key === 'm') {
      toggleMark();
    }
  });
}

// Switch UI Tabs
function switchTab(tab) {
  document.getElementById('tab-test').classList.toggle('active', tab === 'test');
  document.getElementById('tab-crm').classList.toggle('active', tab === 'crm');
}

// View switcher
function showView(viewId) {
  document.querySelectorAll('.view-section').forEach(view => {
    view.classList.remove('active');
  });
  const target = document.getElementById(viewId);
  if (target) {
    target.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// ==========================================================
// TEST EXECUTION LOGIC
// ==========================================================
function startTest() {
  const name = document.getElementById('input-name').value.trim();
  const roll = document.getElementById('input-roll').value.trim() || 'QA-' + Math.floor(1000 + Math.random() * 9000);
  const batch = document.getElementById('input-batch').value;
  const durationMinutes = parseInt(document.getElementById('input-duration').value, 10) || 90;

  if (!name) {
    alert('Kripya bache ka naam darj karein!');
    return;
  }

  state.currentStudent = {
    name,
    roll,
    batch,
    durationMinutes,
    startTime: new Date().toISOString()
  };

  state.answers = {};
  state.markedForReview.clear();
  state.currentQuestionIndex = 0;
  state.timeRemaining = durationMinutes * 60;
  state.currentRecord = null;

  // Update Exam Meta
  document.getElementById('exam-student-name').textContent = name;
  document.getElementById('exam-student-roll').textContent = `Roll: ${roll} • ${batch}`;
  document.getElementById('exam-student-avatar').textContent = name.charAt(0).toUpperCase();

  // Start Timer
  startTimer();

  // Render first question & palette
  renderQuestion(0);
  renderPalette();

  // Show exam view
  showView('view-exam');
}

function startTimer() {
  if (state.timerInterval) clearInterval(state.timerInterval);
  updateTimerDisplay();

  state.timerInterval = setInterval(() => {
    state.timeRemaining--;
    updateTimerDisplay();

    if (state.timeRemaining <= 0) {
      clearInterval(state.timerInterval);
      alert('Samay samaapt ho gaya! Test automatically submit kiya ja raha hai.');
      submitExam(true);
    }
  }, 1000);
}

function updateTimerDisplay() {
  const timerEl = document.getElementById('exam-timer');
  const mins = Math.floor(state.timeRemaining / 60);
  const secs = state.timeRemaining % 60;
  timerEl.textContent = `⏱️ ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  timerEl.className = 'timer-box';
  if (state.timeRemaining < 300) {
    timerEl.classList.add('timer-danger');
  } else if (state.timeRemaining < 600) {
    timerEl.classList.add('timer-warning');
  }
}

function renderQuestion(index) {
  if (index < 0 || index >= PYTHON_QUESTIONS.length) return;
  state.currentQuestionIndex = index;

  const q = PYTHON_QUESTIONS[index];

  // Number & Category
  document.getElementById('q-number').textContent = `Question ${q.id} of ${PYTHON_QUESTIONS.length}`;
  document.getElementById('q-category').textContent = q.category;

  // Prompt
  document.getElementById('q-prompt').textContent = q.prompt;

  // Code Block
  const codeWrapper = document.getElementById('q-code-wrapper');
  const codeContent = document.getElementById('q-code');
  if (q.code && q.code.trim().length > 0) {
    codeWrapper.style.display = 'block';
    codeContent.textContent = q.code;
  } else {
    codeWrapper.style.display = 'none';
  }

  // Options
  const optionsGrid = document.getElementById('q-options-grid');
  optionsGrid.innerHTML = '';

  const selectedAnswer = state.answers[q.id];

  ['a', 'b', 'c', 'd'].forEach(letter => {
    const optText = q.options[letter];
    if (optText !== undefined) {
      const card = document.createElement('div');
      card.className = `option-card ${selectedAnswer === letter ? 'selected' : ''}`;
      card.dataset.option = letter;
      card.innerHTML = `
        <div class="option-letter">${letter}</div>
        <div class="option-text">${escapeHtml(optText)}</div>
      `;
      card.addEventListener('click', () => selectOption(letter));
      optionsGrid.appendChild(card);
    }
  });

  // Buttons state
  document.getElementById('btn-prev').disabled = (index === 0);
  document.getElementById('btn-next').disabled = (index === PYTHON_QUESTIONS.length - 1);

  // Mark for review button state
  const btnMark = document.getElementById('btn-mark');
  if (state.markedForReview.has(q.id)) {
    btnMark.classList.add('marked');
    btnMark.innerHTML = `⭐ Marked`;
  } else {
    btnMark.classList.remove('marked');
    btnMark.innerHTML = `☆ Mark Review`;
  }

  // Update Palette active state
  renderPalette();
}

function selectOption(letter) {
  const q = PYTHON_QUESTIONS[state.currentQuestionIndex];
  state.answers[q.id] = letter;

  // Update UI cards
  document.querySelectorAll('.option-card').forEach(card => {
    card.classList.toggle('selected', card.dataset.option === letter);
  });

  renderPalette();
}

function clearChoice() {
  const q = PYTHON_QUESTIONS[state.currentQuestionIndex];
  delete state.answers[q.id];
  document.querySelectorAll('.option-card').forEach(card => card.classList.remove('selected'));
  renderPalette();
}

function toggleMark() {
  const q = PYTHON_QUESTIONS[state.currentQuestionIndex];
  const btnMark = document.getElementById('btn-mark');

  if (state.markedForReview.has(q.id)) {
    state.markedForReview.delete(q.id);
    btnMark.classList.remove('marked');
    btnMark.innerHTML = `☆ Mark Review`;
  } else {
    state.markedForReview.add(q.id);
    btnMark.classList.add('marked');
    btnMark.innerHTML = `⭐ Marked`;
  }
  renderPalette();
}

function navigateQuestion(offset) {
  const nextIdx = state.currentQuestionIndex + offset;
  if (nextIdx >= 0 && nextIdx < PYTHON_QUESTIONS.length) {
    renderQuestion(nextIdx);
  }
}

function renderPalette() {
  const palette = document.getElementById('exam-palette');
  palette.innerHTML = '';

  let answeredCount = 0;
  let markedCount = 0;

  PYTHON_QUESTIONS.forEach((q, idx) => {
    const isAnswered = Boolean(state.answers[q.id]);
    const isMarked = state.markedForReview.has(q.id);
    const isCurrent = (idx === state.currentQuestionIndex);

    if (isAnswered) answeredCount++;
    if (isMarked) markedCount++;

    // Apply Filter
    if (state.paletteFilter === 'answered' && !isAnswered) return;
    if (state.paletteFilter === 'unanswered' && isAnswered) return;
    if (state.paletteFilter === 'marked' && !isMarked) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'palette-btn';
    btn.textContent = q.id;

    if (isCurrent) btn.classList.add('current');
    if (isMarked) btn.classList.add('marked');
    else if (isAnswered) btn.classList.add('answered');

    btn.addEventListener('click', () => renderQuestion(idx));
    palette.appendChild(btn);
  });

  // Update stats counters
  document.getElementById('stat-answered-count').textContent = answeredCount;
  document.getElementById('stat-unanswered-count').textContent = (PYTHON_QUESTIONS.length - answeredCount);
  document.getElementById('stat-marked-count').textContent = markedCount;
}

// ==========================================================
// TEST SUBMISSION & INSTANT AUTO-SCORING
// ==========================================================
function confirmSubmit() {
  const answeredCount = Object.keys(state.answers).length;
  const unansweredCount = PYTHON_QUESTIONS.length - answeredCount;
  const markedCount = state.markedForReview.size;

  let msg = `Aapne 101 me se ${answeredCount} prashno ke uttar diye hain.\n${unansweredCount} prashn bina uttar ke hain.`;
  if (markedCount > 0) {
    msg += `\n${markedCount} prashn review ke liye marked hain.`;
  }
  msg += `\n\nKya aap sach me test submit karna chahte hain?`;

  if (confirm(msg)) {
    submitExam(false);
  }
}

function submitExam(isAuto = false) {
  if (state.timerInterval) clearInterval(state.timerInterval);

  const endTime = new Date();
  const startTime = new Date(state.currentStudent.startTime);
  const timeTakenSeconds = Math.round((endTime - startTime) / 1000);
  const timeSpentMins = Math.floor(timeTakenSeconds / 60);
  const timeSpentSecs = timeTakenSeconds % 60;
  const formattedTimeTaken = `${timeSpentMins}m ${timeSpentSecs}s`;

  // Calculate Score against PDF Answer Key
  let correctCount = 0;
  let incorrectCount = 0;
  let skippedCount = 0;

  const categoryPerformance = {};

  PYTHON_QUESTIONS.forEach(q => {
    const studentAns = state.answers[q.id];
    const correctAns = q.answer;

    if (!categoryPerformance[q.category]) {
      categoryPerformance[q.category] = { total: 0, correct: 0 };
    }
    categoryPerformance[q.category].total++;

    if (!studentAns) {
      skippedCount++;
    } else if (studentAns === correctAns) {
      correctCount++;
      categoryPerformance[q.category].correct++;
    } else {
      incorrectCount++;
    }
  });

  const percentage = ((correctCount / PYTHON_QUESTIONS.length) * 100).toFixed(1);

  // Status & Grade
  let status = 'Fail';
  let badgeClass = 'badge-fail';
  if (percentage >= 80) {
    status = 'Distinction';
    badgeClass = 'badge-distinction';
  } else if (percentage >= 50) {
    status = 'Pass';
    badgeClass = 'badge-pass';
  }

  // Record Object for CRM
  const record = {
    id: 'TR-' + Date.now(),
    date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    studentName: state.currentStudent.name,
    roll: state.currentStudent.roll,
    batch: state.currentStudent.batch,
    score: correctCount,
    total: PYTHON_QUESTIONS.length,
    percentage: parseFloat(percentage),
    correct: correctCount,
    incorrect: incorrectCount,
    skipped: skippedCount,
    timeTaken: formattedTimeTaken,
    status: status,
    badgeClass: badgeClass,
    answers: { ...state.answers },
    categories: categoryPerformance
  };

  // Save to CRM State & LocalStorage
  state.crmRecords.unshift(record);
  saveCRMRecords();
  state.currentRecord = record;

  // Render Scorecard
  renderScorecard(record);
  showView('view-scorecard');
}

// ==========================================================
// SCORECARD RENDERING
// ==========================================================
function renderScorecard(record) {
  document.getElementById('res-badge').className = `result-badge ${record.badgeClass}`;
  document.getElementById('res-badge').textContent = (record.status === 'Distinction') ? '🌟 Distinction' : (record.status === 'Pass') ? '✅ Qualified / Passed' : '⚠️ Needs Revision';

  document.getElementById('res-student-title').textContent = `${record.studentName} ka Assessment Scorecard`;
  document.getElementById('res-tagline').textContent = `Roll No: ${record.roll} • Batch: ${record.batch} • Exam Date: ${record.date}`;

  document.getElementById('res-score').textContent = record.score;
  document.getElementById('res-percentage').textContent = `Percentage: ${record.percentage}% (${record.status})`;

  document.getElementById('res-correct').textContent = record.correct;
  document.getElementById('res-incorrect').textContent = record.incorrect;
  document.getElementById('res-skipped').textContent = record.skipped;
  document.getElementById('res-time').textContent = record.timeTaken;

  // Render Topic Mastery
  const barsContainer = document.getElementById('category-breakdown-bars');
  barsContainer.innerHTML = '';

  Object.entries(record.categories).forEach(([category, data]) => {
    const catPercent = ((data.correct / data.total) * 100).toFixed(0);
    const item = document.createElement('div');
    item.className = 'cat-bar-item';
    item.innerHTML = `
      <div class="cat-bar-header">
        <span>${category}</span>
        <span>${data.correct} / ${data.total} (${catPercent}%)</span>
      </div>
      <div class="cat-bar-bg">
        <div class="cat-bar-fill" style="width: ${catPercent}%"></div>
      </div>
    `;
    barsContainer.appendChild(item);
  });

  // Action listeners
  document.getElementById('btn-print-scorecard').onclick = () => window.print();
  document.getElementById('btn-review-answers').onclick = () => {
    renderReviewList();
    showView('view-review');
  };
  document.getElementById('btn-retake-test').onclick = () => {
    if (confirm('Naye sire se test shuru karna chahte hain?')) {
      showView('view-welcome');
    }
  };
}

// ==========================================================
// DETAILED QUESTION REVIEW
// ==========================================================
function renderReviewList() {
  const container = document.getElementById('review-items-container');
  container.innerHTML = '';

  const record = state.currentRecord || state.crmRecords[0];
  if (!record) {
    container.innerHTML = '<p>Koi submission record uplabdh nahi hai.</p>';
    return;
  }

  PYTHON_QUESTIONS.forEach(q => {
    const studentChoice = record.answers[q.id];
    const isCorrect = (studentChoice === q.answer);
    const isSkipped = !studentChoice;

    // Filter logic
    if (state.reviewFilter === 'correct' && !isCorrect) return;
    if (state.reviewFilter === 'incorrect' && (isCorrect || isSkipped)) return;
    if (state.reviewFilter === 'skipped' && !isSkipped) return;

    let cardClass = isCorrect ? 'is-correct' : (isSkipped ? 'is-skipped' : 'is-incorrect');
    let badgeText = isCorrect ? '✅ Correct' : (isSkipped ? '⚪ Skipped' : '❌ Incorrect');
    let badgeStyle = isCorrect ? 'correct' : (isSkipped ? 'skipped' : 'incorrect');

    const card = document.createElement('div');
    card.className = `review-item-card ${cardClass}`;

    let codeHtml = '';
    if (q.code && q.code.trim()) {
      codeHtml = `
        <div class="code-wrapper">
          <div class="code-header"><span>Python Code</span></div>
          <div class="code-content">${escapeHtml(q.code)}</div>
        </div>
      `;
    }

    let optionsHtml = '';
    ['a', 'b', 'c', 'd'].forEach(letter => {
      const optVal = q.options[letter];
      if (optVal !== undefined) {
        let optClass = 'review-option';
        let note = '';

        if (letter === q.answer) {
          optClass += ' correct-answer';
          note = ' ✓ (Sahi Uttar)';
        }
        if (studentChoice === letter && !isCorrect) {
          optClass += ' wrong-selection';
          note = ' ✗ (Bache Ka Choice)';
        } else if (studentChoice === letter && isCorrect) {
          note = ' ✓ (Bache Ka Choice)';
        }

        optionsHtml += `
          <div class="${optClass}">
            <strong>${letter.toUpperCase()}.</strong> ${escapeHtml(optVal)} ${note}
          </div>
        `;
      }
    });

    card.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-weight: 700; color: var(--accent);">Question #${q.id} • ${q.category}</span>
        <span class="review-badge ${badgeStyle}">${badgeText}</span>
      </div>
      <div style="font-size: 1.05rem; font-weight: 600;">${q.prompt}</div>
      ${codeHtml}
      <div class="review-options">${optionsHtml}</div>
    `;

    container.appendChild(card);
  });
}

// ==========================================================
// TEACHER CRM DASHBOARD
// ==========================================================
function renderCRM() {
  loadCRMRecords();

  const totalTests = state.crmRecords.length;
  document.getElementById('crm-total-count').textContent = totalTests;

  if (totalTests === 0) {
    document.getElementById('crm-avg-score').textContent = '0%';
    document.getElementById('crm-high-score').textContent = '0 / 101';
    document.getElementById('crm-pass-rate').textContent = '0%';
  } else {
    const totalPercentage = state.crmRecords.reduce((acc, r) => acc + r.percentage, 0);
    const avgPercentage = (totalPercentage / totalTests).toFixed(1);
    const highestScore = Math.max(...state.crmRecords.map(r => r.score));
    const passCount = state.crmRecords.filter(r => r.percentage >= 50).length;
    const passRate = ((passCount / totalTests) * 100).toFixed(0);

    document.getElementById('crm-avg-score').textContent = `${avgPercentage}%`;
    document.getElementById('crm-high-score').textContent = `${highestScore} / 101`;
    document.getElementById('crm-pass-rate').textContent = `${passRate}%`;
  }

  renderCRMTable();

  // Export CSV Listener
  document.getElementById('btn-export-csv').onclick = exportCRMToCSV;
  document.getElementById('btn-clear-crm').onclick = clearCRMData;
}

function renderCRMTable() {
  const tbody = document.getElementById('crm-table-body');
  tbody.innerHTML = '';

  const search = (document.getElementById('crm-search').value || '').toLowerCase();
  const filtered = state.crmRecords.filter(r => 
    r.studentName.toLowerCase().includes(search) || 
    r.roll.toLowerCase().includes(search) ||
    r.batch.toLowerCase().includes(search)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 2rem;">Koi record nahi mila.</td></tr>`;
    return;
  }

  filtered.forEach(record => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${record.studentName}</strong></td>
      <td>${record.roll}</td>
      <td><span style="font-size: 0.8rem; color: var(--text-muted);">${record.batch}</span></td>
      <td><strong>${record.score}</strong> / 101 (${record.percentage}%)</td>
      <td>${record.timeTaken}</td>
      <td><span class="status-pill ${record.status.toLowerCase()}">${record.status}</span></td>
      <td>
        <div class="table-actions">
          <button class="btn-icon" title="View Scorecard" onclick="viewStudentScorecard('${record.id}')">👁️ View</button>
          <button class="btn-icon" title="Delete Entry" onclick="deleteCRMRecord('${record.id}')">🗑️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

window.viewStudentScorecard = function(recordId) {
  const found = state.crmRecords.find(r => r.id === recordId);
  if (found) {
    state.currentRecord = found;
    renderScorecard(found);
    switchTab('test');
    showView('view-scorecard');
  }
};

window.deleteCRMRecord = function(recordId) {
  if (confirm('Kya aap is student ka record delete karna chahte hain?')) {
    state.crmRecords = state.crmRecords.filter(r => r.id !== recordId);
    saveCRMRecords();
    renderCRM();
  }
};

function clearCRMData() {
  if (confirm('Savdhaani: Kya aap CRM ka poora data delete karna chahte hain?')) {
    state.crmRecords = [];
    saveCRMRecords();
    renderCRM();
  }
}

function exportCRMToCSV() {
  if (state.crmRecords.length === 0) {
    alert('Export karne ke liye koi record nahi hai!');
    return;
  }

  let csv = 'ID,Date,Student Name,Roll No,Batch,Score,Total,Percentage,Status,Time Taken\n';
  state.crmRecords.forEach(r => {
    csv += `"${r.id}","${r.date}","${r.studentName}","${r.roll}","${r.batch}",${r.score},${r.total},${r.percentage}%,"${r.status}","${r.timeTaken}"\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `QuantumAI_Python_Test_Records_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

// Utility: HTML escape
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
}
