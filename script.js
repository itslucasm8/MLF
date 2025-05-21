// WHV 88-Day Visa Calculator Tool JavaScript
// Refactored for maintainability and extensibility

// --- Config: Feedback messages, colors, etc. ---
const FEEDBACK = {
  startDateRequired: 'Veuillez sélectionner une date de début.',
  endDateRequired: 'Veuillez sélectionner une date de fin.',
  endDateBeforeStart: 'La date de fin ne peut pas être antérieure à la date de début.',
  postcodeRequired: 'Veuillez saisir un code postal.',
  postcodeInvalid: '❌ Code postal invalide',
  postcodeValid: '✅ Code postal éligible',
  jobTypeRequired: 'Veuillez sélectionner un type d\'emploi.',
  jobTypeInvalid: '❌ Type d\'emploi non éligible.',
  jobTypeHospitalityInvalid: '❌ Le tourisme et l\'hôtellerie ne comptent que dans le nord de l\'Australie.',
  jobTypeValid: '✅ Type d\'emploi éligible.',
  hoursRequired: 'Veuillez saisir le nombre d\'heures travaillées (0 ou plus).',
  hoursPartial: 'Moins de 30 heures : semaine partielle comptabilisée.',
  hoursFull: 'Semaine complète comptabilisée (7 jours).',
  rowCounted: jours => `✅ ${jours} jours comptés`,
  rowCountedPartial: jours => `✅ ${jours} jours comptés (partiel)`,
  rowNone: '❌ Aucun jour compté',
  rowInvalid: '❌ Ligne invalide, non comptée',
};
const COLORS = {
  valid: '#43e97b',
  invalid: '#d32f2f',
};

// --- Official WHV Specified Work Job Types ---
const JOB_TYPES = [
  'Plant and animal cultivation',
  'Fishing and pearling',
  'Tree farming and felling',
  'Mining',
  'Construction',
  'Bushfire recovery work',
  'Flood recovery work',
  'Tourism and hospitality'
];

// --- Postcodes (loaded from data/postcodes.json) ---
let ELIGIBLE_POSTCODES = [];
let NA_POSTCODES = [];
async function loadPostcodes() {
  try {
    const res = await fetch("data/postcodes.json");
    const data = await res.json();
    ELIGIBLE_POSTCODES = data.ELIGIBLE_POSTCODES;
    NA_POSTCODES = data.NA_POSTCODES;
  } catch (e) {
    console.error("Failed to load postcode data", e);
  }
}


const VISA_DAYS_TARGET = 88;

// --- DOM Elements ---
const calculator = document.getElementById('visa-calculator');
const weeksEntries = calculator.querySelector('#weeks-entries');
const addWeekBtn = calculator.querySelector('#add-week-btn');
const progressBar = calculator.querySelector('#progress-bar');
const progressText = calculator.querySelector('#progress-text');

// --- Populate job type dropdowns ---
function populateJobTypeDropdown(select) {
  const JOB_TYPES_FR = [
    'Culture de plantes et élevage d\'animaux',
    'Pêche et culture de perles',
    'Sylviculture et abattage',
    'Mines',
    'Construction',
    'Travaux de récupération après incendie',
    'Travaux de récupération après inondation',
    'Tourisme et hôtellerie'
  ];
  select.innerHTML = '<option value="">Sélectionnez le type d\'emploi</option>' +
    JOB_TYPES_FR.map((j, i) => `<option value="${JOB_TYPES[i]}">${j}</option>`).join('');
}
// Populate initial row
populateJobTypeDropdown(calculator.querySelector('.job-type'));

// --- Add/Remove week entry logic ---
addWeekBtn.addEventListener('click', () => {
  const idx = weeksEntries.children.length;
  const template = weeksEntries.children[0];
  const clone = template.cloneNode(true);
  clone.setAttribute('data-index', idx);
  // Prefill postcode/job type from last entry
  if (weeksEntries.children.length > 0) {
    const last = weeksEntries.children[weeksEntries.children.length - 1];
    clone.querySelector('.postcode').value = last.querySelector('.postcode').value;
    clone.querySelector('.job-type').value = last.querySelector('.job-type').value;
  }
  // Reset other values
  clone.querySelectorAll('input, select').forEach(el => {
    if (el.classList.contains('postcode') || el.classList.contains('job-type')) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
  // Remove any previous error states and feedback
  clone.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  clone.querySelectorAll('.valid-msg, .invalid-msg').forEach(fb => { fb.textContent = ''; fb.classList.remove('valid-msg', 'invalid-msg'); });
  // Remove row feedback if present
  const oldFeedback = clone.querySelector('.row-feedback');
  if (oldFeedback) oldFeedback.remove();
  // Attach event listeners
  populateJobTypeDropdown(clone.querySelector('.job-type'));
  clone.querySelector('.remove-week').addEventListener('click', removeWeekHandler);
  // Insert
  weeksEntries.appendChild(clone);
  updateAll();
  expandEntry(clone);
});
function removeWeekHandler(e) {
  if (weeksEntries.children.length > 1) {
    e.target.closest('.entry').remove();
    updateAll();
  }
}
// Attach remove handler to initial row
weeksEntries.querySelector('.remove-week').addEventListener('click', removeWeekHandler);

// --- Validation and Calculation ---
function isEligiblePostcode(pc) {
  return ELIGIBLE_POSTCODES.includes(pc);
}
function isHospitalityAllowed(pc) {
  return NA_POSTCODES.includes(pc);
}
function isEligibleJobType(jt) {
  return JOB_TYPES.includes(jt);
}
function calculateVisaDays(hours) {
  if (hours >= 30) return 7;
  if (hours > 0) return Math.min(7, (hours / 30) * 7);
  return 0;
}

// --- Debounce utility ---
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function updateAll() {
  let totalVisaDays = 0;
  Array.from(weeksEntries.children).forEach((entry, idx) => {
    // Remove previous error states and feedback
    entry.querySelectorAll('input, select').forEach(el => el.classList.remove('invalid'));
    entry.querySelectorAll('.valid-msg, .invalid-msg').forEach(fb => { fb.textContent = ''; fb.classList.remove('valid-msg', 'invalid-msg'); });
    // Remove or create row feedback
    let rowFeedback = entry.querySelector('.row-feedback');
    if (!rowFeedback) {
      rowFeedback = document.createElement('div');
      rowFeedback.className = 'row-feedback';
      rowFeedback.setAttribute('aria-live', 'polite');
      rowFeedback.style.fontSize = '0.85em';
      rowFeedback.style.margin = '0.2em 0 0.1em 0';
      rowFeedback.style.fontWeight = '500';
      entry.appendChild(rowFeedback);
    } else {
      rowFeedback.textContent = '';
      rowFeedback.className = 'row-feedback';
      rowFeedback.setAttribute('aria-live', 'polite');
    }
    // Get values
    const postcode = entry.querySelector('.postcode').value.trim();
    const jobType = entry.querySelector('.job-type').value;
    const hours = parseFloat(entry.querySelector('.hours-worked').value);
    const startDate = entry.querySelector('.start-date').value;
    const endDate = entry.querySelector('.end-date').value;
    let valid = true;
    // Validate start date
    if (!startDate) {
      entry.querySelector('.start-date-feedback').textContent = FEEDBACK.startDateRequired;
      entry.querySelector('.start-date-feedback').classList.add('invalid-msg');
      valid = false;
    } else {
      entry.querySelector('.start-date-feedback').textContent = '';
      entry.querySelector('.start-date-feedback').classList.add('valid-msg');
    }
    // Validate end date
    if (!endDate) {
      entry.querySelector('.end-date-feedback').textContent = FEEDBACK.endDateRequired;
      entry.querySelector('.end-date-feedback').classList.add('invalid-msg');
      valid = false;
    } else if (startDate && endDate < startDate) {
      entry.querySelector('.end-date-feedback').textContent = FEEDBACK.endDateBeforeStart;
      entry.querySelector('.end-date-feedback').classList.add('invalid-msg');
      valid = false;
    } else {
      entry.querySelector('.end-date-feedback').textContent = '';
      entry.querySelector('.end-date-feedback').classList.add('valid-msg');
    }
    // Validate postcode
    if (!postcode) {
      entry.querySelector('.postcode-feedback').textContent = FEEDBACK.postcodeRequired;
      entry.querySelector('.postcode-feedback').classList.add('invalid-msg');
      valid = false;
    } else if (!isEligiblePostcode(postcode)) {
      entry.querySelector('.postcode-feedback').textContent = FEEDBACK.postcodeInvalid;
      entry.querySelector('.postcode-feedback').classList.add('invalid-msg');
      entry.querySelector('.postcode').classList.add('invalid');
      valid = false;
    } else {
      entry.querySelector('.postcode-feedback').textContent = FEEDBACK.postcodeValid;
      entry.querySelector('.postcode-feedback').classList.add('valid-msg');
    }
    // Validate job type
    if (!jobType) {
      entry.querySelector('.job-type-feedback').textContent = FEEDBACK.jobTypeRequired;
      entry.querySelector('.job-type-feedback').classList.add('invalid-msg');
      valid = false;
    } else if (!isEligibleJobType(jobType)) {
      entry.querySelector('.job-type-feedback').textContent = FEEDBACK.jobTypeInvalid;
      entry.querySelector('.job-type-feedback').classList.add('invalid-msg');
      entry.querySelector('.job-type').classList.add('invalid');
      valid = false;
    } else if (jobType === 'Tourism and hospitality' && !isHospitalityAllowed(postcode)) {
      entry.querySelector('.job-type-feedback').textContent = FEEDBACK.jobTypeHospitalityInvalid;
      entry.querySelector('.job-type-feedback').classList.add('invalid-msg');
      entry.querySelector('.job-type').classList.add('invalid');
      entry.querySelector('.postcode').classList.add('invalid');
      valid = false;
    } else {
      entry.querySelector('.job-type-feedback').textContent = FEEDBACK.jobTypeValid;
      entry.querySelector('.job-type-feedback').classList.add('valid-msg');
    }
    // Validate hours
    let visaDays = 0;
    if (isNaN(hours) || hours < 0) {
      entry.querySelector('.hours-worked-feedback').textContent = FEEDBACK.hoursRequired;
      entry.querySelector('.hours-worked-feedback').classList.add('invalid-msg');
      entry.querySelector('.hours-worked').classList.add('invalid');
      valid = false;
    } else if (hours > 0 && hours < 30) {
      entry.querySelector('.hours-worked-feedback').textContent = FEEDBACK.hoursPartial;
      entry.querySelector('.hours-worked-feedback').classList.add('valid-msg');
      visaDays = Math.min(7, (hours / 30) * 7);
    } else if (hours >= 30) {
      entry.querySelector('.hours-worked-feedback').textContent = FEEDBACK.hoursFull;
      entry.querySelector('.hours-worked-feedback').classList.add('valid-msg');
      visaDays = 7;
    } else {
      entry.querySelector('.hours-worked-feedback').textContent = '';
      entry.querySelector('.hours-worked-feedback').classList.add('valid-msg');
    }
    // Show row feedback and count visa days only if valid
    if (valid) {
      if (visaDays >= 7) {
        rowFeedback.textContent = FEEDBACK.rowCounted(visaDays.toFixed(0));
        rowFeedback.style.color = COLORS.valid;
      } else if (visaDays > 0) {
        rowFeedback.textContent = FEEDBACK.rowCountedPartial(visaDays.toFixed(2));
        rowFeedback.style.color = COLORS.valid;
      } else {
        rowFeedback.textContent = FEEDBACK.rowNone;
        rowFeedback.style.color = COLORS.invalid;
      }
      totalVisaDays += visaDays;
    } else {
      rowFeedback.textContent = FEEDBACK.rowInvalid;
      rowFeedback.style.color = COLORS.invalid;
    }
    entry.setAttribute('data-visa-days', valid ? visaDays : 0);
    // Remove button visibility
    const removeBtn = entry.querySelector('.remove-week');
    removeBtn.style.display = (weeksEntries.children.length > 1) ? '' : 'none';
  });
  // Update progress
  const percent = Math.min(100, (totalVisaDays / VISA_DAYS_TARGET) * 100);
  progressBar.style.width = percent + '%';
  progressText.textContent = `${Math.round(totalVisaDays)} / ${VISA_DAYS_TARGET} jours de visa complétés`;
}

// --- Listen for changes (debounced) ---
const debouncedUpdateAll = debounce(updateAll, 80);
weeksEntries.addEventListener('input', debouncedUpdateAll);
weeksEntries.addEventListener('change', debouncedUpdateAll);

// --- Optional: style invalid fields ---
const style = document.createElement('style');
style.textContent = `.invalid { border-color: #d32f2f !important; background: #fff0f0 !important; }`;
document.head.appendChild(style);

// Initial calculation
loadPostcodes().then(updateAll);

// --- Collapse/Expand logic ---
function getEntrySummary(entry) {
  const start = entry.querySelector('.start-date').value;
  const end = entry.querySelector('.end-date').value;
  const jobType = entry.querySelector('.job-type');
  const jobTypeLabel = jobType.options[jobType.selectedIndex]?.textContent || '';
  const visaDays = entry.getAttribute('data-visa-days') || '0';
  return `<span><i class='fa-regular fa-calendar-days'></i> ${start || '—'} → <i class='fa-regular fa-calendar-check'></i> ${end || '—'}</span>
    <span><i class='fa-solid fa-briefcase'></i> ${jobTypeLabel}</span>
    <span class='summary-days'><i class='fa-regular fa-clock'></i> ${visaDays} jours</span>
    <button type='button' class='entry-toggle' aria-label='Développer'><i class='fa-solid fa-chevron-down'></i></button>
    <button type='button' class='summary-edit' aria-label='Modifier'><i class='fa-solid fa-pen'></i> Modifier</button>`;
}
function collapseEntry(entry) {
  entry.classList.add('collapsed');
  let summary = entry.querySelector('.entry-summary');
  if (!summary) {
    summary = document.createElement('div');
    summary.className = 'entry-summary';
    entry.prepend(summary);
  }
  summary.innerHTML = getEntrySummary(entry);
}
function expandEntry(entry) {
  entry.classList.remove('collapsed');
}
// Toggle collapse/expand for a single entry
weeksEntries.addEventListener('click', function(e) {
  if (e.target.closest('.entry-toggle')) {
    const entry = e.target.closest('.entry');
    if (entry.classList.contains('collapsed')) expandEntry(entry);
    else collapseEntry(entry);
  }
  if (e.target.closest('.summary-edit')) {
    const entry = e.target.closest('.entry');
    expandEntry(entry);
  }
});
// When adding a new week, prefill postcode/job type from last entry if present
addWeekBtn.addEventListener('click', () => {
  const idx = weeksEntries.children.length;
  const template = weeksEntries.children[0];
  const clone = template.cloneNode(true);
  clone.setAttribute('data-index', idx);
  // Prefill postcode/job type from last entry
  if (weeksEntries.children.length > 0) {
    const last = weeksEntries.children[weeksEntries.children.length - 1];
    clone.querySelector('.postcode').value = last.querySelector('.postcode').value;
    clone.querySelector('.job-type').value = last.querySelector('.job-type').value;
    // Auto-extend start date
    const prevEnd = last.querySelector('.end-date').value;
    if (prevEnd) {
      const nextStart = new Date(prevEnd);
      nextStart.setDate(nextStart.getDate() + 1);
      clone.querySelector('.start-date').value = nextStart.toISOString().slice(0,10);
    }
  }
  // Reset other values
  clone.querySelectorAll('input, select').forEach(el => {
    if (el.classList.contains('postcode') || el.classList.contains('job-type') || el.classList.contains('start-date')) return;
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });
  // Remove any previous error states and feedback
  clone.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  clone.querySelectorAll('.valid-msg, .invalid-msg').forEach(fb => { fb.textContent = ''; fb.classList.remove('valid-msg', 'invalid-msg'); });
  // Remove row feedback if present
  const oldFeedback = clone.querySelector('.row-feedback');
  if (oldFeedback) oldFeedback.remove();
  // Attach event listeners
  populateJobTypeDropdown(clone.querySelector('.job-type'));
  clone.querySelector('.remove-week').addEventListener('click', removeWeekHandler);
  // Insert
  weeksEntries.appendChild(clone);
  updateAll();
  expandEntry(clone);
});

// --- Business Preset Logic ---
let businessPreset = null;
function saveBusinessPreset(postcode, jobType) {
  businessPreset = { postcode, jobType };
}
function applyBusinessPreset(entry) {
  if (businessPreset) {
    entry.querySelector('.postcode').value = businessPreset.postcode;
    entry.querySelector('.job-type').value = businessPreset.jobType;
  }
}
// Add preset UI
const presetDiv = document.createElement('div');
presetDiv.style.display = 'flex';
presetDiv.style.gap = '0.7em';
presetDiv.style.marginBottom = '0.7em';
presetDiv.innerHTML = `
  <button type="button" id="save-preset-btn" class="mlf-btn mlf-btn-secondary"><i class="fa-solid fa-star"></i> Sauver comme entreprise</button>
  <button type="button" id="use-preset-btn" class="mlf-btn mlf-btn-secondary"><i class="fa-solid fa-building"></i> Remplir avec l'entreprise</button>
`;
const form = calculator.querySelector('#weeks-form');
form.insertBefore(presetDiv, form.querySelector('#collapse-all-space'));
document.getElementById('save-preset-btn').onclick = function() {
  const last = weeksEntries.lastElementChild;
  saveBusinessPreset(last.querySelector('.postcode').value, last.querySelector('.job-type').value);
  this.textContent = 'Entreprise sauvegardée !';
  setTimeout(() => { this.innerHTML = '<i class="fa-solid fa-star"></i> Sauver comme entreprise'; }, 1500);
};
document.getElementById('use-preset-btn').onclick = function() {
  const last = weeksEntries.lastElementChild;
  applyBusinessPreset(last);
};
// --- Export CSV ---
const exportBtn = document.createElement('button');
exportBtn.type = 'button';
exportBtn.className = 'mlf-btn mlf-btn-secondary';
exportBtn.style.marginTop = '1.2em';
exportBtn.innerHTML = '<i class="fa-solid fa-file-csv"></i> Exporter (CSV)';
form.appendChild(exportBtn);
exportBtn.onclick = function() {
  let csv = 'Date de début,Date de fin,Code postal,Type d\'emploi,Heures travaillées,Jours visa\n';
  Array.from(weeksEntries.children).forEach(entry => {
    const start = entry.querySelector('.start-date').value;
    const end = entry.querySelector('.end-date').value;
    const postcode = entry.querySelector('.postcode').value;
    const jobType = entry.querySelector('.job-type');
    const jobTypeLabel = jobType.options[jobType.selectedIndex]?.textContent || '';
    const hours = entry.querySelector('.hours-worked').value;
    const visaDays = entry.getAttribute('data-visa-days') || '0';
    csv += `${start},${end},${postcode},${jobTypeLabel},${hours},${visaDays}\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mes_88_jours.csv';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 
