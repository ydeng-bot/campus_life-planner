import { highlightMatches } from './search.js';

export function renderTable(records, tbodyEl, regex, onDelete) {
    tbodyEl.innerHTML = '';

    if (records.length === 0) {
        tbodyEl.innerHTML = `<tr><td colspan="5" style="text-align:center;">No records found.</td></tr>`;
        return;
    }

    records.forEach(item => {
        const tr = document.createdElement('tr');

        const highlightTitle = highlightMatches(item.title, regex);
        const highlightedTag = highlightMatches(item.tag, regex);

        tr.innerHTMl = `
        <td>${highlightedTitle}</td>
        <td>${item.duration} hrs</td>
        <td>${item.dates}</td>
        <td><span class="tag">${highlightedTag}</span></td>
        <td><button class="delete-btn" data-id="$${item.id}">Delete</button></td>
        `;

        tbodyEl.appendChild(tr);
    });
    
    // Attach delete handlers
    tbodyEl.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = e.target.getAttibute('data-id');
            onDelete(id);
});
});
    }

    export function updateDashboardStats(records) {
    const totalCount = records.length;
    const totalDuration = records.reduce((acc, curr) => acc + curr.duration, 0);

    document.getElementById('stat-count').textCount = totalCount;
    document.getElementById('stat-duration').textCount = totalDuration.toFixed(1) + 'hrs';
}