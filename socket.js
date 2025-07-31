const { Server } = require("socket.io");
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');

// --- الخطوة 1: إضافة خريطة لتتبع المستخدمين المتصلين ---
const userSocketMap = {}; // key: userId, value: socketId

const initSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:8080",
            methods: ["GET", "POST"]
        }
    });

    // Middleware للمصادقة (لا تغيير هنا)
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.query.token;
            if (!token) throw new Error('Token not provided.');
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (!user) throw new Error('User not found.');
            socket.user = user;
            next();
        } catch (err) {
            next(new Error(`Authentication error: ${err.message}`));
        }
    });

    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.user.email} with socket ID: ${socket.id}`);
        
        // --- الخطوة 2: تسجيل المستخدم في الخريطة عند الاتصال ---
        const userId = socket.user._id.toString();
        userSocketMap[userId] = socket.id;
        
        // إرسال قائمة المستخدمين المتصلين (مفيد لاحقًا لمعرفة من هو "online")
        io.emit('getOnlineUsers', Object.keys(userSocketMap));

        // --- (منطق المحادثة النصية يبقى كما هو) ---
        socket.on('joinChat', (conversationId) => {
            socket.join(conversationId);
            console.log(`User ${socket.user.email} joined chat: ${conversationId}`);
        });

        socket.on('sendMessage', async ({ conversationId, content }) => {
            try {
                let newMessage = new Message({ conversationId, sender: socket.user._id, content });
                await newMessage.save();
                newMessage = await Message.findById(newMessage._id).populate('sender', 'name _id');
                await Conversation.findByIdAndUpdate(conversationId, { lastMessage: { text: content, sender: socket.user._id } });
                io.to(conversationId).emit('newMessage', newMessage);
            } catch (error) {
                console.error("Error sending message:", error);
            }
        });

        // --- الخطوة 3: إضافة مستمعي أحداث WebRTC Signaling ---

        // عندما يبدأ مستخدم مكالمة
        socket.on('call-user', (data) => {
            const targetSocketId = userSocketMap[data.targetUserId];
            if (targetSocketId) {
                console.log(`Forwarding call from ${socket.user.email} to socket ${targetSocketId}`);
                // إرسال إشارة "مكالمة واردة" إلى المستخدم المستهدف
                io.to(targetSocketId).emit('incoming-call', {
                    signalData: data.signalData, // بيانات offer من WebRTC
                    from: {
                        socketId: socket.id,
                        userId: socket.user._id,
                        name: socket.user.name,
                    }
                });
            } else {
                console.warn(`Call failed: Target user ${data.targetUserId} is not online.`);
            }
        });

        // عندما يرد المستخدم على المكالمة
        socket.on('answer-call', (data) => {
            console.log(`Forwarding answer from ${socket.user.email} to socket ${data.targetSocketId}`);
            // إرسال إشارة "تم الرد على المكالمة" إلى البادئ بالمكالمة
            io.to(data.targetSocketId).emit('call-accepted', {
                signalData: data.signalData, // بيانات answer من WebRTC
            });
        });
        
        // تبادل "ICE Candidates" (معلومات عن مسارات الشبكة)
        socket.on('ice-candidate', (data) => {
            const targetSocketId = userSocketMap[data.targetUserId];
             if(targetSocketId) {
                io.to(targetSocketId).emit('ice-candidate', {
                    candidate: data.candidate
                });
            }
        });

        // عند إنهاء المكالمة
        socket.on('end-call', (data) => {
            const targetSocketId = userSocketMap[data.targetUserId];
            if(targetSocketId) {
                 io.to(targetSocketId).emit('call-ended');
            }
        });


        // --- الخطوة 4: إزالة المستخدم من الخريطة عند قطع الاتصال ---
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.user.email}`);
            delete userSocketMap[userId];
            // إرسال القائمة المحدثة للمستخدمين المتصلين
            io.emit('getOnlineUsers', Object.keys(userSocketMap));
        });
    });

    return io;
};

module.exports = { initSocket };