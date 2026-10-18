// Regex catalog (also listed in the README)
export const PATTERNS = {
    // No leading/trailing space + lookahead that forbids double spaces (advanced)
    title: /^(?!.*\s{2})\S(?:.*\S)?$/,
    // 0 or a number without leading zeros, up to 2 decimals
    duration: /^(0|[1-9]\d*)(\.\d{1,2})?$/,
    // YYYY-MM-DD
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,
    // letters, with single spaces or hyphens between words
    tag: /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/,
    // back-reference (advanced): the same word twice in a row
    duplicateWord: /\b(\w+)\s+\1\b/i
};

export function isValidTitle(title) {
    return typeof title === 'string' && title.length <= 100 && PATTERNS.title.test(title);
}

export function isValidDuration(value) {
    const s = String(value);
    return PATTERNS.duration.test(s) && Number(s) > 0;
}

export function isValidDate(dateStr) {
    if (typeof dateStr !== 'string' || !PATTERNS.date.test(dateStr)) return false;
    // The regex allows 2026-02-31, so also check the real calendar
    const [y, m, d] = dateStr.split('-').map(Number);
    const dt = new Date(Date.UTC(y, m - 1, d));
    return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function isValidTag(tag) {
    return typeof tag === 'string' && tag.length <= 40 && PATTERNS.tag.test(tag);
}

export function hasDuplicateWords(text) {
    return PATTERNS.duplicateWord.test(String(text));
}

function isValidTimestamp(value) {
    return typeof value === 'string' && !Number.isNaN(Date.parse(value));
}

export function isValidRecord(r) {
    return !!r && typeof r === 'object' && !Array.isArray(r)
        && typeof r.id === 'string' && /^[\w-]{1,40}$/.test(r.id)
        && isValidTitle(r.title)
        && typeof r.duration === 'number' && Number.isFinite(r.duration) && r.duration > 0
        && isValidDate(r.dueDate)
        && isValidTag(r.tag)
        && isValidTimestamp(r.createdAt)
        && isValidTimestamp(r.updatedAt);
}

// Error-message helpers: return '' when the value is fine.
export function titleError(v) {
    if (!v) return 'Title is required.';
    if (/^\s|\s$/.test(v)) return 'Remove spaces at the start or end.';
    if (/\s{2,}/.test(v)) return 'Use single spaces between words.';
    if (!isValidTitle(v)) return 'Title must be 100 characters or fewer.';
    return '';
}

export function durationError(v) {
    if (!v) return 'Duration is required.';
    if (!PATTERNS.duration.test(v)) return 'Use a number like 90 or 1.5 (max 2 decimals, no leading zeros).';
    if (Number(v) <= 0) return 'Duration must be greater than 0.';
    return '';
}

export function dateError(v) {
    if (!v) return 'Due date is required.';
    if (!PATTERNS.date.test(v)) return 'Use the format YYYY-MM-DD, for example 2026-10-25.';
    if (!isValidDate(v)) return 'That date does not exist on the calendar.';
    return '';
}

export function tagError(v) {
    if (!v) return 'Tag is required.';
    if (!isValidTag(v)) return 'Use letters, single spaces or hyphens only, for example Computer Science.';
    return '';
}

export function capError(v) {
    if (!v) return 'Cap is required.';
    if (!PATTERNS.duration.test(v)) return 'Use a number like 20 or 12.5.';
    if (Number(v) <= 0) return 'Cap must be greater than 0.';
    return '';
}

// Units: durations are always STORED in minutes. These helpers only change how they are shown.
export const UNITS = ['minutes', 'hours'];

export function convertMinutes(minutes, unit) {
    return unit === 'hours' ? minutes / 60 : minutes;
}

export function formatDuration(minutes, unit) {
    const value = Math.round(convertMinutes(minutes, unit) * 100) / 100;
    return `${value} ${unit === 'hours' ? 'hrs' : 'min'}`;
}