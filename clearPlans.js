const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');

// تحميل متغيرات البيئة
dotenv.config();

// الاتصال بقاعدة البيانات
connectDB();

/**
 * دالة لحذف جميع الخطط (الغذائية والرياضية) من كل المستخدمين.
 * هذه العملية لا تحذف المستخدمين، بل تفرّغ حقول الخطط فقط.
 */
const clearAllPlans = async () => {
    console.log('Starting to clear all plans from all users...');

    try {
        // نستخدم updateMany لتحديث كل المستندات (المستخدمين) في قاعدة البيانات
        // الفلتر {} يعني "تطابق مع كل المستندات"
        // $set يقوم بتعيين قيمة جديدة للحقول. تعيينها إلى كائن فارغ يمسح محتوياتها
        // وهذا يطابق المخطط الذي يتوقع كائنًا وليس قيمة null
        const result = await User.updateMany(
            {}, 
            {
                $set: {
                    dietPlan: {},
                    workoutPlan: {}
                }
            }
        );

        console.log('-------------------------------------------');
        console.log('Operation successful!');
        console.log(`- Documents scanned: ${result.matchedCount}`);
        console.log(`- Plans cleared for: ${result.modifiedCount} users.`);
        console.log('-------------------------------------------');
        process.exit();
    } catch (error) {
        console.error('An error occurred while clearing plans:', error);
        process.exit(1); // الخروج مع رمز خطأ
    }
};

// تشغيل الدالة
clearAllPlans();