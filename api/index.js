const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

// نقطة وصول وحيدة وبسيطة
app.get('/api/test', (req, res) => {
    console.log("Test endpoint was hit!"); // رسالة لنراها في السجلات
    res.status(200).json({ message: "Success! The Vercel deployment is working." });
});

// تصدير التطبيق
module.exports = app;