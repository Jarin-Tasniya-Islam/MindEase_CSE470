// server/routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const auth = require('../middleware/auth');               // attaches req.user from JWT
const isAdmin = require('../middleware/adminMiddleware'); // ensures req.user.role === 'admin'

const User = require('../models/User');
const JournalEntry = require('../models/JournalEntry');
const MoodEntry = require('../models/MoodEntry');
const Appointment = require('../models/Appointment');

/* ----------------------------------------
   Quick health to verify admin guard
----------------------------------------- */
router.get('/health', auth, isAdmin, (_req, res) => {
    res.json({ ok: true, role: 'admin' });
});

/* ----------------------------------------
   Users (optional helpers)
----------------------------------------- */
router.get('/users', auth, isAdmin, async (_req, res) => {
    try {
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch users', error: err.message });
    }
});

router.patch('/users/:id/role', auth, isAdmin, async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: 'Invalid role value' });
        }
        const updated = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true, select: '-passwordHash', runValidators: true }
        );
        if (!updated) return res.status(404).json({ message: 'User not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update role', error: err.message });
    }
});

router.delete('/users/:id', auth, isAdmin, async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'User removed' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete user', error: err.message });
    }
});

/* ========================================
   Journals (with user name/email)
======================================== */
router.get('/journals', auth, isAdmin, async (_req, res) => {
    try {
        const items = await JournalEntry.find({})
            .populate('user', 'name email')        // <- show user info
            .sort({ createdAt: -1 })
            .lean();

        const result = items.map(j => ({
            _id: j._id,
            createdAt: j.createdAt || j.date,
            content: j.content || j.text || '',
            user: j.user ? { name: j.user.name || '', email: j.user.email || '' } : { name: '', email: '' },
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch journals', error: err.message });
    }
});

router.delete('/journals/:id', auth, isAdmin, async (req, res) => {
    try {
        const deleted = await JournalEntry.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Journal not found' });
        res.json({ message: 'Journal removed' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete journal', error: err.message });
    }
});

/* ========================================
   Moods (with user name/email)
======================================== */
router.get('/moods', auth, isAdmin, async (_req, res) => {
    try {
        const items = await MoodEntry.find({})
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .lean();

        const result = items.map(m => ({
            _id: m._id,
            createdAt: m.createdAt || m.dateTime,
            mood: m.moodLevel ?? m.mood ?? '',
            note: m.notes || m.note || '',
            user: m.user ? { name: m.user.name || '', email: m.user.email || '' } : { name: '', email: '' },
            tags: Array.isArray(m.tags) ? m.tags : [],
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch moods', error: err.message });
    }
});

router.delete('/moods/:id', auth, isAdmin, async (req, res) => {
    try {
        const deleted = await MoodEntry.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Mood entry not found' });
        res.json({ message: 'Mood entry removed' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete mood', error: err.message });
    }
});

/* ========================================
   Appointments (admin view + actions)
======================================== */
router.get('/appointments', auth, isAdmin, async (_req, res) => {
    try {
        const items = await Appointment.find({})
            .populate('user', 'name email')                         // who booked
            .populate('supportPerson', 'name title specialization') // provider
            .sort({ date: 1 })
            .lean();

        const result = items.map(a => ({
            _id: a._id,
            date: a.date,
            status: a.status || 'pending',
            notes: a.notes || a.note || '',
            user: a.user ? { name: a.user.name || '', email: a.user.email || '' } : { name: '', email: '' },
            providerName: a.supportPerson?.name || a.providerName || '',
            providerType: a.supportPerson?.title || a.providerType || a.supportPerson?.specialization || '',
        }));

        res.json(result);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch appointments', error: err.message });
    }
});

router.patch('/appointments/:id/status', auth, isAdmin, async (req, res) => {
    try {
        const { status } = req.body; // 'confirmed' | 'cancelled' | 'pending'
        const allowed = ['pending', 'confirmed', 'cancelled'];
        if (!allowed.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }
        const updated = await Appointment.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updated) return res.status(404).json({ message: 'Appointment not found' });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update status', error: err.message });
    }
});

router.delete('/appointments/:id', auth, isAdmin, async (req, res) => {
    try {
        const deleted = await Appointment.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Appointment not found' });
        res.json({ message: 'Appointment removed' });
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete appointment', error: err.message });
    }
});

module.exports = router;
