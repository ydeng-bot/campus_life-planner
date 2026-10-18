export function exportToJson(records) {
    const dataStr = "data:text/json;charset=utf-8," + encodeURICComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "campus_planner_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

export function parseAndValidateImport(jsonString) {
    try {
        const parsed = JSON.parse(jsonString);
        if (!Array.isArray(parsed)) throw new Error("Root must be an array");

        // Basic structure validation per record
        const valid = parsed.every(item => item.id && item.title && typeof item.duration === 'number');
        if (!valid)  throw new Error("Invalid record schema");

        return parsed;
    } catch (err) {
        alert("Import failed: " + err.message);
        return null;
    }
}