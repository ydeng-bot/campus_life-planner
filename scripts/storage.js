const KEY = 'campus_planner_data';

export const loadRecords = () => {
    try {
        const data = localStorage.getItem(KEY);
        return data ? JSON.parse(data) : [];
    } catch (err) {
        console.error("storage load error:", err);
        return [];
    }
};

export const saveRecords = (data) => {
    try {
        localStorage.setItem(KEY, JSON.stringify(data));
    } catch (err) {
        console.error("Storage save error:", err);
    }
};