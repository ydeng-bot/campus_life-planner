import { isValidTitle, isValidDuration, isValidDate, isValidTag, hasDuplicateWords } from'../scripts/validators.js';
import { compileSearchRegex } from '../scripts/search.js';

export function runTests() {
    const results = [];

    function check(name, condition) {
        results.push({ name, passed: Boolean(condition) }); 
    }

    check("Title validation accepts normal text", isValidTitle("Midterm Exam"));
    check("Title validation rejects leading space", isValidTitle(" Midterm"));
    check("Duration accepts decimals", isValidDuration("3.5"));
    check("Date validates YYYY-MM-DD", isValidDate("2026-10-17"));
    check("Tag accepts letters/spaces", isValidTag("Computer Science"));
    check("Advanced regex catches duplicate words", hasDuplicateWords("study study notes"));
    check("Search regex compiles safely", compileSearchRegex("exam") instanceof RegExp);

    return results;
}