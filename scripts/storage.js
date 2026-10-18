import { isValidRecord, UNITS } from './validators.js';

const KEY = 'campus_planner_data';
const SETTINGS_KEY = 'campus_planner_settings';

export const DEFAULT_SETTINGS = { unit: 'hours', capHours: 20 };

export const loadRecords = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(KEY) || '[]');
        // Ignore anything that is not a clean list of valid records
        return Array.isArray(parsed) ? parsed.filter(isValidRecord) : [];
    } catch (err) {
        console.error('Storage load error:', err);
        return [];
    }
};

export const saveRecords = (data) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(data));
    } catch (err) {
        console.error('Storage save error:', err);
    }
};

export const loadSettings = () => {
    try {
        const parsed = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null') || {};
        return {
            unit: UNITS.includes(parsed.unit) ? parsed.unit : DEFAULT_SETTINGS.unit,
            capHours: Number.isFinite(parsed.capHours) && parsed.capHours > 0 ? parsed.capHours : DEFAULT_SETTINGS.capHours
        };
    } catch (err) {
        console.error('Settings load error:', err);
        return { ...DEFAULT_SETTINGS };
    }
};

export const saveSettings = (settings) => {
    try {
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (err) {
        console.error('Settings save error:', err);
    }
};