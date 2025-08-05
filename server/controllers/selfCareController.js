const SelfCareTask = require('../models/SelfCareTask');

// ✅ Log or update task completion
exports.markTaskCompleted = async (req, res) => {
  const { userId, taskType } = req.body;

  try {
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const updated = await SelfCareTask.findOneAndUpdate(
      { userId, taskType, date: { $gte: start, $lte: end } },
      { completed: true },
      { upsert: true, new: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to mark task', error: err.message });
  }
};

// ✅ Fetch today's tasks
exports.getTodayTasks = async (req, res) => {
  try {
    const { userId } = req.params;
    const today = new Date();
    const start = new Date(today.setHours(0, 0, 0, 0));
    const end = new Date(today.setHours(23, 59, 59, 999));

    const tasks = await SelfCareTask.find({
      userId,
      date: { $gte: start, $lte: end }
    });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch tasks', error: err.message });
  }
};
