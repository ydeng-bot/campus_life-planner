const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function compileSearchRegex(input, flags = 'i') {
    try { return input ? new RegExp(input, flags) : null; } catch { return null; }
}

export function highlightMatches(text, regex) {
    text = String(text);
    if (!regex) return esc(text);
    const re = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
    let out = '', last = 0;
    for (const m of text.matchAll(re)) {
        if (!m[0]) continue;
        out += esc(text.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>';
        last = m.index + m[0].length;
    }
    return out + esc(text.slice(last));
}