// Simple input validation rules using regular expressions
export const  isValidTitle = (title) => /^\S(?:.*\S)?$/.test(title);

export const isValidDuration = (val) => /^(0|[1-9]\d*)(\.\d{1,2})?$/.test(val);

export const isValidate = (date) => /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/.test(date);

export const isValidTag = (tag) => /^[A-Za-z]+(?:[ -][A-Za-z]+]+)*$/.test(tag);

//Advanced regex: matches duplicates consecutive words (e.g. "Math Math")
export const hasDuplicateWords = (text) => /\b(\w+)\s+\1\b/i.test(text);