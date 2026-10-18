import { loadRecords, saveRecords, loadSettings, saveSettings } from './storage.js';

const state = {
    records: loadRecords(),
    settings: loadSettings(),
    filterQuery: '',
    ignoreCase: true,
    sortField: 'dueDate',
    sortAsc: true,
    editingId: null
};

export function getState() {
    return state;
}

export function setRecords(newRecords) {
    state.records = newRecords;
    saveRecords(state.records);
}

export function setSettings(changes) {
    state.settings = { ...state.settings, ...changes };
    saveSettings(state.settings);
}

export function nextId(records) {
    const max = records.reduce((highest, r) => {
        const match = /^rec_(\d+)$/.exec(r.id);
        return match ? Math.max(highest, Number(match[1])) : highest;
    }, 0);
    return 'rec_' + String(max + 1).padStart(4, '0');
}

export function sortRecords(records, field, asc) {
    const dir = asc ? 1 : -1;
    return [...records].sort((a, b) => {
        const result = field === 'duration'
            ? a.duration - b.duration
            : String(a[field]).localeCompare(String(b[field]), undefined, { sensitivity: 'base' });
        return result * dir;
    });
}