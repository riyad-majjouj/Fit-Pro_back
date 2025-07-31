const { GoogleGenerativeAI } = require("@google/generative-ai");
const apiKeyManager = require('./apiKeyManager'); // استيراد مدير المفاتيح

/**
 * دالة لتنظيف وتحليل الرد القادم من Gemini.
 */
const parseGeminiResponse = (rawResponse) => {
    try {
        return JSON.parse(rawResponse);
    } catch (error) {
        console.error("Failed to parse Gemini JSON response, attempting to clean...");
        const cleanedResponse = rawResponse.replace(/```json/g, '').replace(/```/g, '').trim();
        try {
            return JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error("Failed to parse cleaned Gemini response:", parseError);
            throw new Error("Invalid JSON response from AI after cleaning.");
        }
    }
};

/**
 * دالة تقوم بإعادة المحاولة، وعند فشل الطلب بسبب ضغط أو حد استخدام، تقوم بتبديل المفتاح.
 * @param {string} prompt - البرومبت الذي سيتم إرساله إلى Gemini.
 * @returns {Promise<any>}
 */
const withRetryAndKeyRotation = async (prompt) => {
    const totalKeys = apiKeyManager.getTotalKeys();
    // سنحاول مرة واحدة لكل مفتاح متاح
    for (let i = 0; i < totalKeys; i++) {
        try {
            // الحصول على العميل والموديل باستخدام المفتاح الحالي
            const currentKey = apiKeyManager.getKey();
            const genAI = new GoogleGenerativeAI(currentKey);
            const model = genAI.getGenerativeModel({
                model: "gemini-1.5-flash-latest",
                generationConfig: { responseMimeType: "application/json" },
            });
            
            console.log(`Attempting API call with key index: ${i}`);
            // حاول تنفيذ الطلب
            const result = await model.generateContent(prompt);
            console.log(`API call with key index: ${i} was successful.`);
            return result; // إذا نجح الطلب، قم بإرجاع النتيجة
            
        } catch (error) {
            // تحقق مما إذا كان الخطأ هو 503 (مشغول) أو 429 (تجاوز الحد)
            if ((error.status === 503 || error.status === 429) && i < totalKeys - 1) {
                console.warn(`API key at index ${i} failed. Status: ${error.status}. Rotating key...`);
                apiKeyManager.rotateKey(); // قم بتبديل المفتاح
            } else {
                console.error(`API call failed on all available keys or with a non-retriable error.`);
                throw error; // إذا فشلت كل المفاتيح، أرجع الخطأ
            }
        }
    }
    // في حالة عدم وجود مفاتيح على الإطلاق
    throw new Error("No API keys available to process the request.");
};

/**
 * إنشاء خطة غذائية
 */
const generateDietPlan = async (userData, language, availableFoods) => {
    const foodList = availableFoods.map(food => ({
        id: food._id.toString(),
        name: food.name[language],
    }));

    const prompt = `
        You are a professional nutritionist creating a full one-day diet plan.
        Your final output MUST be ONLY a valid JSON object that strictly follows the provided example format. Do not add any extra text, notes, or markdown.

        User Data:
        - Goal: ${userData.goal}
        - Weight: ${userData.weight} kg

        Available Foods (You can ONLY use foods from this list):
        ${JSON.stringify(foodList)}

        **CRITICAL INSTRUCTIONS:**
        1. Create a plan for one full day, divided into 3 to 5 meals (e.g., Breakfast, Lunch, Dinner, Snack).
        2. For each food item, you must provide its "foodId", a suitable "quantity", and estimated "calories", "protein", "carbs", and "fat".
        3. The response should be an object containing a single key: "meals", which is an array of meal objects.

        **JSON Response Format Example (Your response must be identical in structure to this):**
        {
          "meals": [
            {
              "mealName": "Breakfast",
              "items": [
                { "foodId": "ID_FROM_LIST", "quantity": "3 large", "calories": 234, "protein": 18, "carbs": 1, "fat": 15 },
                { "foodId": "ID_FROM_LIST", "quantity": "80g", "calories": 300, "protein": 10, "carbs": 54, "fat": 5 }
              ]
            }
          ]
        }
    `;
    
    const result = await withRetryAndKeyRotation(prompt);
    const responseText = result.response.text();
    console.log("--- RAW RESPONSE FROM GEMINI (DIET) ---");
    console.log(responseText);
    return parseGeminiResponse(responseText);
};

/**
 * إنشاء خطة تمارين
 */
const generateWorkoutPlan = async (userData, language, availableExercises) => {
    const exerciseList = availableExercises.map(ex => ({
        id: ex._id.toString(),
        targetMuscle: ex.targetMuscle,
        type: ex.type
    }));

    const prompt = `
        You are an expert personal trainer. Your task is to create a weekly workout plan.
        Your final output MUST be ONLY a valid JSON object that strictly follows the provided example format.

        User Data:
        - Goal: ${userData.goal}
        - Activity Level: ${userData.activityLevel}

        Available Exercises (Select exercises from this list using their ID):
        ${JSON.stringify(exerciseList)}

        **JSON Response Format Example (Follow this structure):**
        {
          "splitName": "Push Pull Legs",
          "days": [
            {
              "day": "Day 1 - Push",
              "exercises": [
                { "exerciseId": "ID_FROM_LIST", "sets": 4, "reps": "8-12", "weight": "20kg", "rest": "90s" }
              ]
            }
          ]
        }
    `;
    
    const result = await withRetryAndKeyRotation(prompt);
    const responseText = result.response.text();
    console.log("--- RAW RESPONSE FROM GEMINI (WORKOUT) ---");
    console.log(responseText);
    return parseGeminiResponse(responseText);
};

/**
 * ترجمة خطة غذائية
 */
const translateDietPlan = async (existingPlan, targetLanguage) => {
    const languageName = targetLanguage === 'ar' ? 'Arabic' : 'English';
    const prompt = `
        You are a professional translator. Your task is to translate ONLY the string values in the provided JSON object into ${languageName}.
        - Translate the "mealName" in each meal.
        - Translate the "quantity" string in each item if it contains non-numeric words (e.g., "piece", "cup").
        - DO NOT translate or change any other field, especially IDs and numbers.
        - The output MUST be a valid JSON object with the exact same structure.

        JSON to Translate:
        ${JSON.stringify(existingPlan)}
    `;
    
    const result = await withRetryAndKeyRotation(prompt);
    return parseGeminiResponse(result.response.text());
};

/**
 * ترجمة خطة تمارين
 */
const translateWorkoutPlan = async (existingPlan, targetLanguage) => {
    const languageName = targetLanguage === 'ar' ? 'Arabic' : 'English';
    const prompt = `
        You are a professional translator. Your task is to translate ONLY the string values in the provided JSON object into ${languageName}.
        - Translate the "splitName" and the "day" string in each day object.
        - Translate any non-numeric words in the "reps", "weight", and "rest" fields.
        - DO NOT translate or change any other field, especially IDs and numbers.
        - The output MUST be a valid JSON object with the exact same structure.

        JSON to Translate:
        ${JSON.stringify(existingPlan)}
    `;

    const result = await withRetryAndKeyRotation(prompt);
    return parseGeminiResponse(result.response.text());
};

/**
 * إيجاد كمية مكافئة لعنصر غذائي جديد
 */
const getEquivalentItem = async (originalItem, newItemData) => {
    const prompt = `
        You are a nutrition calculator. Your task is to find an equivalent amount of a new food item that nutritionally matches an original food item.
        Your final output MUST be ONLY a valid JSON object.

        Original Item: ${JSON.stringify(originalItem)}
        New Item to calculate for: ${JSON.stringify(newItemData)}

        **INSTRUCTIONS:**
        1. Look at the nutritional values of the "Original Item".
        2. Determine a new "quantity" for the "New Item" so its nutritional values are as close as possible to the original.
        3. Calculate the new "calories", "protein", "carbs", and "fat" for that new quantity.
        4. Return a JSON object for the new item with all its calculated values.

        **JSON Response Format Example:**
        {
          "foodId": "${newItemData._id}",
          "quantity": "180g",
          "calories": ${originalItem.calories},
          "protein": ${originalItem.protein},
          "carbs": ${originalItem.carbs},
          "fat": ${originalItem.fat}
        }
    `;

    const result = await withRetryAndKeyRotation(prompt);
    return parseGeminiResponse(result.response.text());
};

// تصدير جميع الدوال
module.exports = {
    generateDietPlan,
    generateWorkoutPlan,
    getEquivalentItem,
    translateDietPlan,
    translateWorkoutPlan,
};