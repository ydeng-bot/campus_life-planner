Campus Life Planner

Theme: Campus Life Planner: tasks and events with due dates, durations, and tags

**Live site:** https://ydeng-bot.github.io/campus_life-planner/

**Demo video:** [Watch the Loom demo](https://www.loom.com/share/a3e9d77bcfd440588bcc141975734b07)

**Repository:** https://github.com/ydeng-bot/campus_life-planner

## Overview

Campus Life Planner is a responsive web application designed to help students organize academic tasks, deadlines, and study time. Users can add, edit, delete, sort, and search tasks, organize them with tags, and review planned time through a dashboard.

The project is built with vanilla HTML, CSS, and JavaScript using ES modules.

## Features

- **Task management:** Add, edit, and delete tasks with a title, duration, due date, and tag. Invalid input displays inline error messages.
- **Sorting:** Sort tasks by due date, title, or duration in ascending or descending order.
- **Regular-expression search:** Search task titles, tags, and due dates using regular expressions. An Ignore case option is available, matching text is highlighted, and invalid patterns display an error instead of crashing the application. Duration is not included in search.
- **Dashboard:** View the total number of tasks, total planned time, the top tag, and a chart showing tasks due in the past seven days.
- **Settings:** Change whether durations are displayed in minutes or hours and adjust the time cap, which defaults to 20 hours.
- **Duration handling:** Durations are entered and stored in minutes. The Settings unit changes only how durations are displayed.
- **Local storage:** Save application data in the browser so it persists between visits.
- **JSON import and export:** Export task data to JSON, import validated JSON data, and load sample data.
- **Responsive design:** Use the application on mobile, tablet, and desktop screen sizes.
- **Accessibility:** Semantic landmarks, a skip link, labelled inputs, visible focus indicators, and live status/error messages support accessible use.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES modules)
- DOM manipulation and event handling
- Regular expressions
- Browser Local Storage
- JSON

## Regular Expression Catalog

These patterns are defined in `scripts/validators.js`. The pipe characters in the table are escaped for Markdown table formatting; the actual JavaScript regex uses ordinary `|` alternation.

| Purpose | Pattern | Accepts | Rejects |
|---|---|---|---|
| Title | `^(?!.*\s{2})\S(?:.*\S)?$` | `Midterm Exam` | ` Midterm`, `Midterm `, `Mid  term` |
| Duration | `^(0\|[1-9]\d*)(\.\d{1,2})?$` | `3`, `3.5` | `007`, `1.234`, `abc` |
| Date format | `^\d{4}-(0[1-9]\|1[0-2])-(0[1-9]\|[12]\d\|3[01])$` | `2026-10-17` | `17-10-2026`, `2026-13-01` |
| Tag | `^[A-Za-z]+(?:[ -][A-Za-z]+)*$` | `Computer Science`, `Club-Life` | `a1`, `-x` |
| Duplicate word (back-reference) | `\b(\w+)\s+\1\b` | Flags `study study notes` | `study notes` |

The title pattern uses a negative lookahead to reject consecutive spaces. The duplicate-word pattern uses a back-reference to detect the same word repeated consecutively. Both demonstrate advanced regular-expression features.

Additional validation is performed in JavaScript: durations must be greater than zero, and dates must be real calendar dates. For example, `2026-02-31` is rejected even though its format matches the date pattern.

### Search Pattern Examples

Search matches task titles, tags, and due dates.

| Pattern | What it finds |
|---|---|
| `^study` | Text beginning with `study` in a searched task field. |
| `(exam\|quiz)` | Text containing `exam` or `quiz`. |
| `\b\d{2}:\d{2}\b` | Time-like text such as `14:30`, if present in a searched field. |
| `^(?=.*project)(?=.*\d)` | Text containing both `project` and a digit, using positive lookaheads. |
| `(` | An invalid pattern that should display a search error instead of crashing the application. |

## Keyboard Navigation Map

Use the keyboard to navigate the interactive controls. Confirm the behavior in the running application.

| Key | Action |
|---|---|
| Tab | Moves focus to the next interactive element. |
| Shift + Tab | Moves focus to the previous interactive element. |
| Enter | Activates a focused link or button. Form submission behavior depends on the focused field. |
| Space | Activates a focused button or toggles a focused checkbox. |
| Arrow keys | Navigate options in native select controls when the control has focus. |
| Skip link + Enter | Uses the skip link to jump to the main content. |

## Accessibility Notes

- **Semantic structure:** Uses page landmarks and a logical heading hierarchy.
- **Skip link:** Provides a way to bypass repeated navigation and move to the main content.
- **Form labels:** Inputs have associated labels.
- **Keyboard access:** Interactive elements can be reached with the keyboard and have visible focus indicators.
- **Screen-reader feedback:** Live regions communicate status updates and validation/search errors.
- **Table accessibility:** Sortable table headers communicate sort state through `aria-sort`.
- **Reduced motion:** CSS respects the `prefers-reduced-motion` user preference.
- **Responsive layout:** The layout is mobile-first, with breakpoints at 768px and 1024px for tablet and desktop screens.
- **Lighthouse audit:** Chrome DevTools Lighthouse accessibility score of 100 on both desktop and mobile, run on the deployed site on 18 October 2026. Automated audits only detect a subset of issues, so keyboard navigation was also checked manually (see the Manual Testing Checklist).

## Getting Started

### Clone the repository

Open a terminal and run:

```bash
git clone https://github.com/ydeng-bot/campus_life-planner.git
cd campus_life-planner
code .
```

### Run locally

From the project directory, start a local web server:

```bash
python -m http.server 8000
```

Then open the application in your browser:

http://localhost:8000

Stop the server with `Ctrl+C`.

**Why is a server needed?**

The project uses JavaScript ES modules, which may not load correctly when `index.html` is opened directly through the `file://` protocol. A local server lets the browser load the application files through HTTP.

## Running the Tests

The project includes an automated test page for checking application functionality, validation, search, duration conversion, record validation, and import error handling.

**Automated test results: 34 tests passed.** The test file contains 34 checks; run the page to confirm the current result.

### Run the automated tests locally

1. Open a terminal in the project directory.
2. Start the local web server:

   ```bash
   python -m http.server 8000
   ```

3. Open the test page in your browser:

   http://localhost:8000/tests.html

4. Review the PASS/FAIL results and the test summary displayed on the page.

You can also run the tests on the deployed application:

https://ydeng-bot.github.io/campus_life-planner/tests.html

### Manual Testing Checklist

Mark each item complete only after performing the corresponding check.

- [ ] Add a task with valid information.
- [ ] Try invalid titles, durations, dates, and tags.
- [ ] Edit and delete a task.
- [ ] Sort tasks by different fields and directions.
- [ ] Search using a valid regex and confirm matching text is highlighted.
- [ ] Try an invalid regex, such as `(`, and confirm an error appears without crashing the app.
- [ ] Check the Ignore case option.
- [ ] Refresh the page and check whether saved data persists.
- [ ] Export data to JSON and import valid and invalid JSON files.
- [ ] Test keyboard-only navigation and the skip link.
- [ ] Check the layout at approximately 360px, 768px, and 1024px wide.

## Project Structure

```text
campus_life-planner/
├── index.html
├── tests.html
├── seed.json
├── .gitignore
├── assets/
│   └── favicon.svg
├── styles/
│   └── main.css
├── scripts/
│   ├── main.js
│   ├── state.js
│   ├── storage.js
│   ├── ui.js
│   ├── validators.js
│   ├── search.js
│   └── exporter.js
└── tests/
    └── cases.js
