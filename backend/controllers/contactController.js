const ContactMessage = require('../models/ContactMessage');

// 1. SEND (from website Contact page)
exports.sendMessage = async (req, res) => {
    try {
        const { name, email, phone, subject, message } = req.body;
        if (!name || !email || !message) return res.status(400).json({ message: "Name, Email & Message required!" });
        const msg = await ContactMessage.create({ name, email, phone, subject, message });
        res.status(201).json({ message: "Message sent successfully!", data: msg });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 2. GET ALL (Admin inbox)
exports.getAllMessages = async (req, res) => {
    try {
        const msgs = await ContactMessage.findAll({
            where: { isDeleted: false },
            order: [['createdAt', 'DESC']]
        });
        res.json(msgs);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 3. GET SINGLE
exports.getMessage = async (req, res) => {
    try {
        const msg = await ContactMessage.findByPk(req.params.id);
        if (!msg) return res.status(404).json({ message: "Not found" });
        // Mark as read
        if (!msg.isRead) await msg.update({ isRead: true });
        res.json(msg);
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 4. MARK READ
exports.markRead = async (req, res) => {
    try {
        const msg = await ContactMessage.findByPk(req.params.id);
        if (!msg) return res.status(404).json({ message: "Not found" });
        await msg.update({ isRead: true });
        res.json({ message: "Marked as read" });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 5. DELETE (soft)
exports.deleteMessage = async (req, res) => {
    try {
        const msg = await ContactMessage.findByPk(req.params.id);
        if (!msg) return res.status(404).json({ message: "Not found" });
        await msg.destroy();
        res.json({ message: "Message deleted!" });
    } catch (e) { res.status(500).json({ error: e.message }); }
};

// 6. UNREAD COUNT
exports.getUnreadCount = async (req, res) => {
    try {
        const { Op } = require('sequelize');
        const count = await ContactMessage.count({ where: { isRead: false, isDeleted: false } });
        res.json({ unreadCount: count });
    } catch (e) { res.status(500).json({ error: e.message }); }
};
