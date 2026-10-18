import { highlightMatches, escapeHtml } from './search.js';
import { formatDuration, convertMinutes } from './validators.js';

const $ = id => document.getElementById(id);

/* ---------- Table ---------- */

export function renderTable(records, tbodyEl, { regex, editingId, unit }) {
    if (records.length === 0) {
        tbodyEl.innerHTML = '<tr><td colspan="5" class="empty">No tasks found. Add one above, or load sample data in Settings.</td></tr>';
        return;
    }
    tbodyEl.innerHTML = records
        .map(r => (r.id === editingId ? editRow(r) : viewRow(r, regex, unit)))
        .join('');
}

function viewRow(r, regex, unit) {
    const id = escapeHtml(r.id);
    const title = escapeHtml(r.title);
    return `
    <tr data-id="${id}">
        <td data-label="Title">${highlightMatches(r.title, regex)}</td>
        <td data-label="Duration">${escapeHtml(formatDuration(r.duration, unit))}</td>
        <td data-label="Due date">${highlightMatches(r.dueDate, regex)}</td>
        <td data-label="Tag"><span class="tag">${highlightMatches(r.tag, regex)}</span></td>
        <td data-label="Actions" class="actions">
            <button type="button" class="secondary" data-action="edit" data-id="${id}" aria-label="Edit ${title}">Edit</button>
            <button type="button" class="danger" data-action="delete" data-id="${id}" aria-label="Delete ${title}">Delete</button>
        </td>
    </tr>`;
}

function editRow(r) {
    const id = escapeHtml(r.id);
    return `
    <tr data-id="${id}" class="editing">
        <td data-label="Title">
            <label class="sr-only" for="edit-title">Title</label>
            <input id="edit-title" type="text" value="${escapeHtml(r.title)}" autocomplete="off">
        </td>
        <td data-label="Duration (min)">
            <label class="sr-only" for="edit-duration">Duration in minutes</label>
            <input id="edit-duration" type="text" inputmode="decimal" value="${escapeHtml(r.duration)}" autocomplete="off">
        </td>
        <td data-label="Due date">
            <label class="sr-only" for="edit-dueDate">Due date (YYYY-MM-DD)</label>
            <input id="edit-dueDate" type="text" inputmode="numeric" value="${escapeHtml(r.dueDate)}" autocomplete="off">
        </td>
        <td data-label="Tag">
            <label class="sr-only" for="edit-tag">Tag</label>
            <input id="edit-tag" type="text" value="${escapeHtml(r.tag)}" autocomplete="off">
        </td>
        <td data-label="Actions" class="actions">
            <button type="button" data-action="save" data-id="${id}">Save</button>
            <button type="button" class="secondary" data-action="cancel" data-id="${id}">Cancel</button>
            <p id="edit-error" class="error" role="status"></p>
        </td>
    </tr>`;
}

export function updateSortHeaders(field, asc) {
    document.querySelectorAll('th[data-field]').forEach(th => {
        const active = th.dataset.field === field;
        th.setAttribute('aria-sort', active ? (asc ? 'ascending' : 'descending') : 'none');
        th.querySelector('.arrow').textContent = active ? (asc ? '\u25B2' : '\u25BC') : '\u2195';
    });
    const select = $('sort-select');
    if (select) select.value = field;
    const dirBtn = $('sort-dir');
    if (dirBtn) dirBtn.textContent = asc ? '\u2191 Ascending' : '\u2193 Descending';
}

/* ---------- Form errors ---------- */

export function markInvalid(input, invalid) {
    if (invalid) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
}

export function setFieldError(input, errorEl, message) {
    errorEl.textContent = message;
    markInvalid(input, !!message);
}

/* ---------- Dashboard ---------- */

const setText = (id, value) => { $(id).textContent = value; };

export function renderStats(records, settings) {
    const unit = settings.unit;
    const totalMinutes = records.reduce((sum, r) => sum + r.duration, 0);

    setText('stat-count', records.length);
    setText('stat-duration', formatDuration(totalMinutes, unit));
    setText('stat-top-tag', topTag(records));
    setText('stat-cap', formatDuration(settings.capHours * 60, unit));

    renderCap(totalMinutes, settings);
    renderTrend(records, unit);
}

function topTag(records) {
    const counts = new Map();
    for (const r of records) {
        const key = r.tag.toLowerCase();
        const entry = counts.get(key) || { n: 0, label: r.tag };
        entry.n++;
        counts.set(key, entry);
    }
    let best = null;
    for (const entry of counts.values()) {
        if (!best || entry.n > best.n) best = entry;
    }
    return best ? `${best.label} (${best.n})` : '\u2014';
}

function renderCap(totalMinutes, settings) {
    const unit = settings.unit;
    const capMinutes = settings.capHours * 60;
    const diff = capMinutes - totalMinutes;
    const progress = $('cap-progress');

    progress.value = capMinutes > 0 ? Math.min(100, Math.round((totalMinutes / capMinutes) * 100)) : 0;
    progress.classList.toggle('over', diff < 0);

    if (diff >= 0) {
        // Under the cap: polite message
        $('cap-polite').textContent = `${formatDuration(diff, unit)} remaining under your ${formatDuration(capMinutes, unit)} cap.`;
        $('cap-assertive').textContent = '';
    } else {
        // Over the cap: assertive message
        $('cap-assertive').textContent = `Over your cap by ${formatDuration(-diff, unit)}.`;
        $('cap-polite').textContent = '';
    }
}

function isoDay(date) {
    const z = n => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${z(date.getMonth() + 1)}-${z(date.getDate())}`;
}

function renderTrend(records, unit) {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push({ key: isoDay(d), label: d.toLocaleDateString('en-US', { weekday: 'short' }), minutes: 0 });
    }
    for (const r of records) {
        const day = days.find(d => d.key === r.dueDate);
        if (day) day.minutes += r.duration;
    }
    const max = Math.max(...days.map(d => d.minutes), 0);
    const trend = $('trend');

    trend.innerHTML = days.map(d => {
        const pct = max ? Math.round((d.minutes / max) * 100) : 0;
        const shown = Math.round(convertMinutes(d.minutes, unit) * 10) / 10;
        return `<div class="bar-col">
            <span class="bar-value">${shown}</span>
            <div class="bar-track"><div class="bar" style="height:${pct}%"></div></div>
            <span class="bar-label">${escapeHtml(d.label)}</span>
        </div>`;
    }).join('');

    trend.setAttribute(
        'aria-label',
        'Time planned per day for the last 7 days: ' + days.map(d => `${d.label} ${formatDuration(d.minutes, unit)}`).join(', ')
    );
}