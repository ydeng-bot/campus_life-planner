import {
    isValidTitle, isValidDuration, isValidDate, isValidTag,
    hasDuplicateWords, isValidRecord, convertMinutes
} from '../scripts/validators.js';
import { compileSearchRegex, highlightMatches } from '../scripts/search.js';
import { parseAndValidateImport } from '../scripts/exporter.js';

export function runTests() {
    const results = [];

    function check(name, condition) {
        results.push({ name, passed: Boolean(condition) });
    }

    const goodRecord = {
        id: 'rec_0001', title: 'Midterm Exam', duration: 90, dueDate: '2026-10-17', tag: 'Computer Science',
        createdAt: '2026-10-01T10:00:00.000Z', updatedAt: '2026-10-01T10:00:00.000Z'
    };

    // Title
    check('Title accepts normal text', isValidTitle('Midterm Exam'));
    check('Title rejects leading space', !isValidTitle(' Midterm'));
    check('Title rejects trailing space', !isValidTitle('Midterm '));
    check('Title rejects double spaces', !isValidTitle('Mid  term'));
    check('Title rejects empty text', !isValidTitle(''));

    // Duration
    check('Duration accepts whole numbers', isValidDuration('90'));
    check('Duration accepts decimals', isValidDuration('3.5'));
    check('Duration rejects 0', !isValidDuration('0'));
    check('Duration rejects 3 decimals', !isValidDuration('3.555'));
    check('Duration rejects leading zeros', !isValidDuration('007'));
    check('Duration rejects letters', !isValidDuration('abc'));

    // Date
    check('Date accepts YYYY-MM-DD', isValidDate('2026-10-17'));
    check('Date accepts a leap day', isValidDate('2024-02-29'));
    check('Date rejects month 13', !isValidDate('2026-13-01'));
    check('Date rejects 2026-02-31', !isValidDate('2026-02-31'));
    check('Date rejects wrong format', !isValidDate('17/10/2026'));

    // Tag
    check('Tag accepts letters and spaces', isValidTag('Computer Science'));
    check('Tag accepts hyphens', isValidTag('Pre-med'));
    check('Tag rejects digits', !isValidTag('Math101'));
    check('Tag rejects double spaces', !isValidTag('Computer  Science'));

    // Advanced regex (back-reference)
    check('Back-reference catches duplicate words', hasDuplicateWords('study study notes'));
    check('Back-reference ignores normal text', !hasDuplicateWords('study notes'));

    // Search
    check('Search regex compiles safely', compileSearchRegex('exam') instanceof RegExp);
    check('Invalid search regex returns null', compileSearchRegex('(') === null);
    check('Highlight wraps matches in <mark>', highlightMatches('Exam prep', /exam/i) === '<mark>Exam</mark> prep');
    check('Highlight escapes HTML', highlightMatches('<b>hi</b>', null) === '&lt;b&gt;hi&lt;/b&gt;');

    // Units
    check('90 minutes converts to 1.5 hours', convertMinutes(90, 'hours') === 1.5);
    check('Minutes stay minutes', convertMinutes(90, 'minutes') === 90);

    // Records and import
    check('A good record is valid', isValidRecord(goodRecord));
    check('A record with a bad date is invalid', !isValidRecord({ ...goodRecord, dueDate: '2026-02-31' }));
    check('Import rejects malformed JSON', parseAndValidateImport('{oops').error !== '');
    check('Import rejects a non-array', parseAndValidateImport('{}').error !== '');
    check('Import accepts valid records', parseAndValidateImport(JSON.stringify([goodRecord])).records?.length === 1);
    check('Import rejects duplicate ids', parseAndValidateImport(JSON.stringify([goodRecord, goodRecord])).error !== '');

    return results;
}