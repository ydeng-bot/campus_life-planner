// Simple input validation rules using regular expressions
export const isValidTitle = (title) => /^\S(?:.*\S)?$/.test(title);

export const isValidDuration = (val) => /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(val);

export const isValidDate = (date) => /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date);

export const isValidTag = (tag) => /^[A-Za-z]+(?:[ -][A-Za-z]+)*$/.test(tag);

// Advanced regex: matches duplicate consecutive words (e.g. "Math Math")
export const hasDuplicateWords = (text) => /\b(\w+)\s+\1\b/i.test(text);

// ---------------------------------------------------------------
// Everything below builds on the five rules above.
// ---------------------------------------------------------------

// Extra patterns: the app needs the captured word, and tests.html imports RULES.
export const RULES = {
  doubleSpace: /\s{2,}/,
  dupWord: /\b(\w+)\s+\1\b/i
};

// The regex checks the shape; this checks the day really exists (2026-02-30 fails).
export function isRealDate(s) {
  if (!isValidDate(s)) return false;
  const [y, m, d] = s.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d;
}

export function validate(r) {
  const e = {};
  const title = String(r.title ?? '');
  const dupe = title.match(RULES.dupWord);
  if (!isValidTitle(title)) e.title = 'Enter a title with no spaces at the start or end.';
  else if (RULES.doubleSpace.test(title)) e.title = 'Use single spaces between words.';
  else if (hasDuplicateWords(title)) e.title = `The word "${dupe[1]}" is repeated. Remove one.`;

  const date = String(r.dueDate ?? '');
  if (!isValidDate(date)) e.dueDate = 'Use the format YYYY-MM-DD, for example 2026-10-20.';
  else if (!isRealDate(date)) e.dueDate = 'That date does not exist. Check the day and month.';

  if (!isValidDuration(String(r.duration ?? ''))) e.duration = 'Enter minutes as a number like 90 or 1.5 (up to 2 decimals).';
  if (!isValidTag(String(r.tag ?? ''))) e.tag = 'Use letters, spaces or hyphens only, like "Club-Life".';
  return e;
}

export const validateCap = v => isValidDuration(String(v ?? '')) ? null : 'Enter a whole or decimal number of minutes, like 600.';

// One stored/imported record: structure first, then the regex rules. Returns an error string or null.
export function validateRecord(r, n = 'Record') {
  if (!r || typeof r !== 'object' || Array.isArray(r)) return `${n}: must be an object.`;
  if (typeof r.id !== 'string' || !r.id.trim()) return `${n}: missing id.`;
  if (isNaN(Date.parse(r.createdAt)) || isNaN(Date.parse(r.updatedAt))) return `${n}: createdAt and updatedAt must be valid timestamps.`;
  if (typeof r.duration !== 'number') return `${n}: duration must be a number.`;
  const first = Object.values(validate(r))[0];
  return first ? `${n}: ${first}` : null;
}

// Returns an error string, or null when the file is safe to load.
export function validateImport(data) {
  if (!Array.isArray(data)) return 'The file must contain a JSON array of tasks.';
  if (data.length > 5000) return 'The file has too many records (limit 5000).';
  const ids = new Set();
  for (const [i, r] of data.entries()) {
    const err = validateRecord(r, `Record ${i + 1}`);
    if (err) return err;
    if (ids.has(r.id)) return `Record ${i + 1}: duplicate id "${r.id}".`;
    ids.add(r.id);
  }
  return null;
}

// For data already in localStorage: keep good records, silently drop damaged or duplicate ones.
export function sanitize(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  return list.filter(r => {
    if (validateRecord(r) || seen.has(r.id)) return false;
    seen.add(r.id); return true;
  });
}
