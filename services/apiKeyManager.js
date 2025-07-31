// --- 1. قراءة جميع المفاتيح من .env وتخزينها ---
const apiKeys = [];
let i = 1;
while (process.env[`GEMINI_API_KEY_${i}`]) {
    apiKeys.push(process.env[`GEMINI_API_KEY_${i}`]);
    i++;
}

if (apiKeys.length === 0) {
    throw new Error('No GEMINI_API_KEY found in .env file. Please add at least one key in the format GEMINI_API_KEY_1, GEMINI_API_KEY_2, etc.');
}

console.log(`Loaded ${apiKeys.length} Gemini API keys.`);

// --- 2. متغير لتتبع المفتاح المستخدم حاليًا ---
let currentKeyIndex = 0;

// --- 3. دوال لإدارة المفاتيح ---

/**
 * دالة للحصول على المفتاح الحالي.
 * @returns {string} - مفتاح API الحالي.
 */
const getKey = () => {
    return apiKeys[currentKeyIndex];
};

/**
 * دالة للتبديل إلى المفتاح التالي في القائمة بشكل دائري.
 */
const rotateKey = () => {
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    console.log(`Rotated to API key index: ${currentKeyIndex}`);
    return apiKeys[currentKeyIndex];
};

module.exports = {
    getKey,
    rotateKey,
    getTotalKeys: () => apiKeys.length,
};