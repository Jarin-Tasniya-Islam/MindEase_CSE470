const SelfCareTask = require('../models/SelfCareTask');
const createNotification = require('../utils/createNotification');

// ✅ Log today's self-care task for authenticated user
exports.markTaskCompleted = async (req, res) => {
  const { taskType } = req.body;
  const userId = req.user.id; // ✅ Use authenticated user from token

  try {
    await SelfCareTask.create({
      user: userId,
      taskType,
      completed: true
    });

    // Optional: Notify after completion
    await createNotification(userId, 'selfcare', '🛡️ Great job completing your self-care task!');

    res.status(201).json({ message: 'Task logged successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to log task', error: err.message });
  }
};

// ✅ Fetch today's tasks for authenticated user
exports.getTodayTasks = async (req, res) => {
  const userId = req.user.id;

  try {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const tasks = await SelfCareTask.find({
      user: userId,
      createdAt: { $gte: start, $lte: end }
    });

    res.status(200).json(tasks);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch today\'s tasks', error: err.message });
  }
};
