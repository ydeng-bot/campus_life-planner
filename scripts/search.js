export const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function compileSearchRegex(input, flags = 'i') {
    try { return input ? new RegExp(input, flags) : null; } catch { return null; }
}

// Same as above, but also returns a message so the user can see what is wrong
export function tryCompile(input, ignoreCase = true) {
    if (!input) return { regex: null, error: '' };
    try {
        return { regex: new RegExp(input, ignoreCase ? 'i' : ''), error: '' };
    } catch (err) {
        return { regex: null, error: 'Invalid pattern: ' + err.message };
    }
}

export function highlightMatches(text, regex) {
    text = String(text);
    if (!regex) return escapeHtml(text);
    const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    let out = '', last = 0;
    for (const m of text.matchAll(re)) {
        if (!m[0]) continue;
        out += escapeHtml(text.slice(last, m.index)) + '<mark>' + escapeHtml(m[0]) + '</mark>';
        last = m.index + m[0].length;
    }
    return out + escapeHtml(text.slice(last));
}