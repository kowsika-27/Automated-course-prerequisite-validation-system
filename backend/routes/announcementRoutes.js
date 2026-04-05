const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcementController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Create announcement (Admin only)
router.post('/', authMiddleware, adminMiddleware, announcementController.createAnnouncement);

// Get all announcements
router.get('/', announcementController.getAllAnnouncements);

// Update announcement (Admin only)
router.put('/:id', authMiddleware, adminMiddleware, announcementController.updateAnnouncement);

// Delete announcement (Admin only)
router.delete('/:id', authMiddleware, adminMiddleware, announcementController.deleteAnnouncement);

module.exports = router;