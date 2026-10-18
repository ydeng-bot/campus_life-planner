import { loadRecords, saveRecords } from './storage.js';

let state = {
    records: loadRecords(),
    filterQuery: '',
    sortField: 'date',
    sortAsc: true
};

export function getState() {
    return state;
}

export function setRecords(newRecords) {
    state.records = newRecords; 
    saveRecords(state.records);
}