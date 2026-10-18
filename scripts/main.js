import { getState, setRecords, setSettings, sortRecords, nextId } from './state.js';
import { titleError, durationError, dateError, tagError, capError, hasDuplicateWords } from './validators.js';
import { tryCompile } from './search.js';
import { renderTable, renderStats, updateSortHeaders, setFieldError, markInvalid } from './ui.js';
import { exportToJson, parseAndValidateImport } from './exporter.js';

const $ = id => document.getElementById(id);
const state = getState();

const form = $('record-form');
const tbody = $('records-tbody');
const searchInput = $('search-input');
const caseToggle = $('case-toggle');
const liveRegion = $('live-status');

/* ---------- Helpers ---------- */

function announce(msg) {
    liveRegion.textContent = '';                       // clear first so repeated messages are re-read
    setTimeout(() => { liveRegion.textContent = msg; }, 30);
}

function refreshTable() {
    const { regex, error } = tryCompile(state.filterQuery, state.ignoreCase);
    $('search-error').textContent = error;

    const filtered = regex
        ? state.records.filter(r => regex.test(r.title) || regex.test(r.tag) || regex.test(r.dueDate))
        : state.records;
    const sorted = sortRecords(filtered, state.sortField, state.sortAsc);

    renderTable(sorted, tbody, { regex, editingId: state.editingId, unit: state.settings.unit });
    updateSortHeaders(state.sortField, state.sortAsc);
    $('result-count').textContent = `${sorted.length} of ${state.records.length} tasks shown.`;
}

function refreshView() {
    refreshTable();
    renderStats(state.records, state.settings);
}

function replaceRecords(records, message) {
    state.editingId = null;
    setRecords(records);
    refreshView();
    announce(message);
}

function focusEditButton(id) {
    tbody.querySelector(`button[data-action="edit"][data-id="${CSS.escape(id)}"]`)?.focus();
}

/* ---------- Add form (live validation) ---------- */

const fields = {
    title:    { input: $('title'),    error: $('title-error'),    check: titleError },
    duration: { input: $('duration'), error: $('duration-error'), check: durationError },
    dueDate:  { input: $('dueDate'),  error: $('dueDate-error'),  check: dateError },
    tag:      { input: $('tag'),      error: $('tag-error'),      check: tagError }
};

const TITLE_HINT = 'No spaces at the start/end and no double spaces.';
const titleHint = $('title-hint');
titleHint.textContent = TITLE_HINT;

Object.values(fields).forEach(f => {
    f.input.addEventListener('input', () => {
        setFieldError(f.input, f.error, f.check(f.input.value));
    });
});

fields.title.input.addEventListener('input', () => {
    titleHint.textContent = hasDuplicateWords(fields.title.input.value)
        ? 'Heads up: a word is repeated (for example "the the").'
        : TITLE_HINT;
});

form.addEventListener('submit', (e) => {
    e.preventDefault();

    let firstBad = null;
    for (const f of Object.values(fields)) {
        const msg = f.check(f.input.value);
        setFieldError(f.input, f.error, msg);
        if (msg && !firstBad) firstBad = f.input;
    }
    if (firstBad) {
        announce('Please fix the highlighted fields.');
        firstBad.focus();
        return;
    }

    const now = new Date().toISOString();
    const newRecord = {
        id: nextId(state.records),
        title: fields.title.input.value,
        duration: Number(fields.duration.input.value),
        dueDate: fields.dueDate.input.value,
        tag: fields.tag.input.value,
        createdAt: now,
        updatedAt: now
    };

    setRecords([...state.records, newRecord]);
    form.reset();
    titleHint.textContent = TITLE_HINT;
    refreshView();
    announce('New task added.');
    fields.title.input.focus();
});

/* ---------- Inline edit and delete ---------- */

function startEdit(id) {
    state.editingId = id;
    refreshTable();
    $('edit-title')?.focus();
}

function cancelEdit() {
    const id = state.editingId;
    state.editingId = null;
    refreshTable();
    if (id) focusEditButton(id);
}

function saveEdit(id) {
    const defs = [
        ['edit-title', titleError, 'Title'],
        ['edit-duration', durationError, 'Duration'],
        ['edit-dueDate', dateError, 'Due date'],
        ['edit-tag', tagError, 'Tag']
    ];
    const messages = [];
    let firstBad = null;

    for (const [elId, check, label] of defs) {
        const input = $(elId);
        const msg = check(input.value);
        markInvalid(input, !!msg);
        if (msg) {
            messages.push(`${label}: ${msg}`);
            if (!firstBad) firstBad = input;
        }
    }
    if (messages.length) {
        $('edit-error').textContent = messages.join(' ');
        firstBad.focus();
        return;
    }

    const updated = state.records.map(r => r.id === id ? {
        ...r,
        title: $('edit-title').value,
        duration: Number($('edit-duration').value),
        dueDate: $('edit-dueDate').value,
        tag: $('edit-tag').value,
        updatedAt: new Date().toISOString()
    } : r);

    state.editingId = null;
    setRecords(updated);
    refreshView();
    announce('Task updated.');
    focusEditButton(id);
}

function handleDelete(id) {
    const record = state.records.find(r => r.id === id);
    if (!record) return;
    if (!confirm(`Delete "${record.title}"? This cannot be undone.`)) return;

    if (state.editingId === id) state.editingId = null;
    setRecords(state.records.filter(r => r.id !== id));
    refreshView();
    announce('Task deleted.');
    $('records-heading').focus();
}

tbody.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const { action, id } = btn.dataset;
    if (action === 'edit') startEdit(id);
    else if (action === 'delete') handleDelete(id);
    else if (action === 'save') saveEdit(id);
    else if (action === 'cancel') cancelEdit();
});

tbody.addEventListener('keydown', (e) => {
    const row = e.target.closest('tr.editing');
    if (!row) return;
    if (e.key === 'Enter' && e.target.tagName === 'INPUT') {
        e.preventDefault();
        saveEdit(row.dataset.id);
    } else if (e.key === 'Escape') {
        cancelEdit();
    }
});

/* ---------- Sorting ---------- */

const SORT_NAMES = { title: 'title', duration: 'duration', dueDate: 'due date' };

function setSort(field, asc) {
    state.sortField = field;
    state.sortAsc = asc;
    refreshTable();
    announce(`Sorted by ${SORT_NAMES[field]}, ${asc ? 'ascending' : 'descending'}.`);
}

document.querySelector('thead').addEventListener('click', (e) => {
    const th = e.target.closest('th[data-field]');
    if (!th) return;
    const field = th.dataset.field;
    setSort(field, state.sortField === field ? !state.sortAsc : true);
});

$('sort-select').addEventListener('change', (e) => setSort(e.target.value, state.sortAsc));
$('sort-dir').addEventListener('click', () => setSort(state.sortField, !state.sortAsc));

/* ---------- Search ---------- */

searchInput.addEventListener('input', (e) => {
    state.filterQuery = e.target.value;
    refreshTable();
});

caseToggle.addEventListener('change', (e) => {
    state.ignoreCase = e.target.checked;
    refreshTable();
});

/* ---------- Settings ---------- */

$('unit').value = state.settings.unit;
$('cap').value = state.settings.capHours;

$('settings-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const capInput = $('cap');
    const msg = capError(capInput.value);
    setFieldError(capInput, $('cap-error'), msg);
    if (msg) {
        announce('Please fix the cap value.');
        capInput.focus();
        return;
    }
    setSettings({ unit: $('unit').value, capHours: Number(capInput.value) });
    refreshView();
    announce('Settings saved.');
});

/* ---------- Export / Import / Sample data ---------- */

$('export-btn').addEventListener('click', () => {
    exportToJson(state.records);
    announce('Backup file downloaded.');
});

$('import-file').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const { records, error } = parseAndValidateImport(event.target.result);
        if (error) {
            announce('Import failed: ' + error);
            return;
        }
        if (state.records.length && !confirm(`Replace your ${state.records.length} current tasks with ${records.length} imported tasks?`)) {
            return;
        }
        replaceRecords(records, `Imported ${records.length} tasks.`);
    };
    reader.onerror = () => announce('Import failed: the file could not be read.');
    reader.readAsText(file);
    e.target.value = '';                               // lets you import the same file again
});

$('sample-btn').addEventListener('click', async () => {
    try {
        const res = await fetch('seed.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const { records, error } = parseAndValidateImport(await res.text());
        if (error) {
            announce('Sample data problem: ' + error);
            return;
        }
        if (state.records.length && !confirm('Replace your current tasks with the sample data?')) return;
        replaceRecords(records, `Loaded ${records.length} sample tasks.`);
    } catch {
        announce('Could not load seed.json. Open the app through a web server (for example VS Code Live Server) or GitHub Pages, not by double-clicking the file.');
    }
});

/* ---------- Start ---------- */

refreshView();        