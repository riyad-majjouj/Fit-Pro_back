const User = require('../models/User');

/**
 * @desc    جلب قائمة العملاء الخاصة بالمدرب
 * @route   GET /api/coach/clients
 * @access  Private (للمدربين فقط)
 */
const getMyClients = async (req, res) => {
    if (req.user.role !== 'coach') {
        return res.status(403).json({ message: "Access denied. Coaches only." });
    }

    try {
        // ابحث عن المدرب واملأ حقل العملاء بالبيانات الكاملة
        const coachWithClients = await User.findById(req.user._id)
            .populate('clients', 'name email phoneNumber userData'); // جلب كل البيانات المهمة

        if (!coachWithClients) {
            return res.status(404).json({ message: "Coach not found." });
        }

        res.status(200).json(coachWithClients.clients);
    } catch (error) {
        console.error("Error fetching coach clients:", error);
        res.status(500).json({ message: "Server error" });
    }
};

module.exports = { getMyClients };