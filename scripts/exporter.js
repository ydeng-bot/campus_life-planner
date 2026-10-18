import { isValidRecord } from './validators.js';

export function exportToJson(records) {
    const blob = new Blob([JSON.stringify(records, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.href = url;
    downloadAnchor.download = 'campus_planner_backup.json';
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(url);
}

// Returns { records, error }. Exactly one of them is empty/null.
export function parseAndValidateImport(jsonString) {
    let parsed;
    try {
        parsed = JSON.parse(jsonString);
    } catch {
        return { records: null, error: 'The file is not valid JSON.' };
    }
    if (!Array.isArray(parsed)) {
        return { records: null, error: 'The JSON must be a list (array) of records.' };
    }

    const seen = new Set();
    for (let i = 0; i < parsed.length; i++) {
        if (!isValidRecord(parsed[i])) {
            return { records: null, error: `Record ${i + 1} is invalid. Check id, title, duration, dueDate, tag and timestamps.` };
        }
        if (seen.has(parsed[i].id)) {
            return { records: null, error: `Record ${i + 1} repeats the id "${parsed[i].id}".` };
        }
        seen.add(parsed[i].id);
    }

    // Keep only the fields we know about
    const records = parsed.map(r => ({
        id: r.id, title: r.title, duration: r.duration, dueDate: r.dueDate,
        tag: r.tag, createdAt: r.createdAt, updatedAt: r.updatedAt
    }));
    return { records, error: '' };
}