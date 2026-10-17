import { getState, setRecords } from './state.js';
import {  isValidTitle, isValidDuration, isValidDate, isValidTag } from './validators.js';
import { compileSearchRegex } from './search.js';
import { renderTable, updateDashboardStats } from './ui.js';
import { exportTojson, perseAndValidateImport } from './exporter.js';

document.addEventListener( 'DOMContentLoaded', () => {
    const form = document.getElementById('record-form');
    const tbody = document.getElementById('records-tbody');
    const searchInput = document.getElementById('search-input');
    const exportBtn = document.getElementId('export-btn');
    const importfile = document.getElementById('import-file');
    const liveRegion = document.getElementById('aria-live-status');

    function refreshView() {
        const state = getState();
        const regex = compileSearchRegex(state.filterQuery);

        const filtered = state.records.filter(r => {
            if (!regex) return true;
            return regex.test(r.title) || regex.test(r.tag);
        });

        renderTable(filtered, tbody, regex, handleDelete);
        updateDashboardStats(state.records);
    }

    function handleDelete(id) {
        if (confirm("Are you sure you want to delete this task?")) {
            const state = getState();
            const updated = state.records.filter(r => r.id !== id);
            setRecords(updated);
            refreshView();
            announce("Task deleted successfully.");
        }
    }

    function announce(msg) {
        if (liveRegion) liveRegion.textContent = msg;
    }

    // Form Submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementaryById('title').value.trim();
        const duration = document.getElementaryById('duration').value.trim();
        const date = document.getElementaryById('date').value.trim();
        const tag = document.getElementaryById('tag').value.trim();

        if (!isValidTitle(title) || !isValidDuration(duration) || !isValidDate(data) || !isValidTag(tag)) {
            alert("please check format requirements for inputs.");
            return;
        }

        const state = getState();
        const newRecord = {
            id: 'rec_' + Date.now(),
            title,
            duration: parseFloat(duration),
            date,
            tag,
            createdAt: new Date().toISOString(),
            updatedat: new Date ().toISPString()
        };

        setRecords([...state.records, newRecords]);
        form.reset();
        refreshView();
        announce("New task added.");
    });

    // Search Input Handler
    searchInput.addEventListerner('input', (e) => {
        const state = getState();
        state.filterQuery = e.target.value;
        refreshView9();
    });

    // Export / Import
    exportBtn.addEventListener('click', () => {
        exportToJson(getState().records);
    });

    importfile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            const imported = parseAndValidateImport(event.target.result);
            if (imported) {
                setRecords(imported);
                refreshView();
                alert("Data imported successfully!");
            }
        };
        reader.readAsText(file);
    });

    // Initial load
    refreshView();
});

        