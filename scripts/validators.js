export function isValidTitle(title) {
    if (typeof title !== 'string') return false;
    const trimmed = title.trim();
    return trimmed.length >= 3 && trimmed.length <= 100 && title === trimmed;
}

export function isValidDate(dateStr) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;
    const date = new Date(dateStr);
    return !isNaN(date.getTime());
}

export function isValidTags(tagsStr) {
    if (typeof tagsStr !== 'string') return false;
    if (!tagsStr.trim()) return true;
    const tags = tagsStr.split(',').map(t => t.trim());
    return tags.every(t => /^[A-Za-z]+( [A-Za-z]+)*$/.test(t));
}