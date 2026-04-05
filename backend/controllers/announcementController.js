const Announcement = require('../models/Announcement');

// Create announcement (Admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { title, content } = req.body;

    const announcement = new Announcement({
      title,
      content,
      createdBy: req.user.id
    });

    await announcement.save();

    res.json({ message: 'Announcement created successfully', announcement });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get all announcements
exports.getAllAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find({ isActive: true })
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });

    res.json(announcements);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Update announcement (Admin only)
exports.updateAnnouncement = async (req, res) => {
  try {
    const { title, content, isActive } = req.body;
    let announcement = await Announcement.findById(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (isActive !== undefined) announcement.isActive = isActive;

    await announcement.save();

    res.json({ message: 'Announcement updated successfully', announcement });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Delete announcement (Admin only)
exports.deleteAnnouncement = async (req, res) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);

    if (!announcement) {
      return res.status(404).json({ message: 'Announcement not found' });
    }

    res.json({ message: 'Announcement deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};