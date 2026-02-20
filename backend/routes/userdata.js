const express = require('express');
const db = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// ---- Plan Tasks ----

// GET /api/userdata/tasks
router.get('/tasks', authenticate, (req, res) => {
  const tasks = db.prepare('SELECT task_id, completed FROM plan_tasks WHERE user_id = ?').all(req.userId);
  const map = {};
  tasks.forEach((t) => { map[t.task_id] = !!t.completed; });
  res.json({ tasks: map });
});

// POST /api/userdata/tasks/:taskId/toggle
router.post('/tasks/:taskId/toggle', authenticate, (req, res) => {
  const { taskId } = req.params;

  const existing = db.prepare(
    'SELECT completed FROM plan_tasks WHERE user_id = ? AND task_id = ?'
  ).get(req.userId, taskId);

  if (existing) {
    const newVal = existing.completed ? 0 : 1;
    db.prepare(
      'UPDATE plan_tasks SET completed = ?, completed_at = ? WHERE user_id = ? AND task_id = ?'
    ).run(newVal, newVal ? Date.now() : null, req.userId, taskId);
    res.json({ taskId, completed: !!newVal });
  } else {
    db.prepare(
      'INSERT INTO plan_tasks (user_id, task_id, completed, completed_at) VALUES (?, ?, 1, ?)'
    ).run(req.userId, taskId, Date.now());
    res.json({ taskId, completed: true });
  }
});

// ---- Challenge ----

// GET /api/userdata/challenge
router.get('/challenge', authenticate, (req, res) => {
  const challenge = db.prepare(
    'SELECT * FROM challenges WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(req.userId);

  if (!challenge) {
    return res.json({ active: false });
  }

  res.json({
    active: true,
    startDate: challenge.start_date,
    completedDays: JSON.parse(challenge.completed_days),
    streak: challenge.streak,
  });
});

// POST /api/userdata/challenge/start
router.post('/challenge/start', authenticate, (req, res) => {
  const result = db.prepare(
    'INSERT INTO challenges (user_id, start_date) VALUES (?, ?)'
  ).run(req.userId, Date.now());

  res.json({ id: result.lastInsertRowid, startDate: Date.now(), completedDays: {}, streak: 0 });
});

// POST /api/userdata/challenge/day/:day
router.post('/challenge/day/:day', authenticate, (req, res) => {
  const day = parseInt(req.params.day, 10);
  const challenge = db.prepare(
    'SELECT * FROM challenges WHERE user_id = ? ORDER BY created_at DESC LIMIT 1'
  ).get(req.userId);

  if (!challenge) {
    return res.status(404).json({ error: 'No active challenge' });
  }

  const completed = JSON.parse(challenge.completed_days);

  if (completed[day]) {
    delete completed[day];
  } else {
    completed[day] = Date.now();
  }

  // Calculate streak
  let streak = 0;
  for (let i = 1; i <= 30; i++) {
    if (completed[i]) streak++;
    else break;
  }

  db.prepare(
    'UPDATE challenges SET completed_days = ?, streak = ? WHERE id = ?'
  ).run(JSON.stringify(completed), streak, challenge.id);

  res.json({ completedDays: completed, streak });
});

// ---- Water Tracker ----

// GET /api/userdata/water
router.get('/water', authenticate, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const todayLog = db.prepare(
    'SELECT intake_ml FROM water_logs WHERE user_id = ? AND log_date = ?'
  ).get(req.userId, today);

  const history = db.prepare(
    'SELECT log_date, intake_ml FROM water_logs WHERE user_id = ? ORDER BY log_date DESC LIMIT 30'
  ).all(req.userId);

  res.json({
    today: todayLog?.intake_ml || 0,
    history: history.map((h) => ({ date: h.log_date, intake: h.intake_ml })),
  });
});

// POST /api/userdata/water/add
router.post('/water/add', authenticate, (req, res) => {
  const { amount } = req.body;
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Amount must be positive' });
  }

  const today = new Date().toISOString().split('T')[0];

  db.prepare(`
    INSERT INTO water_logs (user_id, log_date, intake_ml) VALUES (?, ?, ?)
    ON CONFLICT(user_id, log_date) DO UPDATE SET intake_ml = intake_ml + ?
  `).run(req.userId, today, amount, amount);

  const updated = db.prepare(
    'SELECT intake_ml FROM water_logs WHERE user_id = ? AND log_date = ?'
  ).get(req.userId, today);

  res.json({ today: updated.intake_ml });
});

// ---- Routine ----

// GET /api/userdata/routine
router.get('/routine', authenticate, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const routine = db.prepare(
    'SELECT tasks FROM routines WHERE user_id = ? AND routine_date = ?'
  ).get(req.userId, today);

  res.json({ date: today, tasks: routine ? JSON.parse(routine.tasks) : {} });
});

// POST /api/userdata/routine/toggle
router.post('/routine/toggle', authenticate, (req, res) => {
  const { taskId } = req.body;
  if (!taskId) return res.status(400).json({ error: 'taskId required' });

  const today = new Date().toISOString().split('T')[0];
  const existing = db.prepare(
    'SELECT tasks FROM routines WHERE user_id = ? AND routine_date = ?'
  ).get(req.userId, today);

  let tasks = existing ? JSON.parse(existing.tasks) : {};
  tasks[taskId] = !tasks[taskId];

  db.prepare(`
    INSERT INTO routines (user_id, routine_date, tasks) VALUES (?, ?, ?)
    ON CONFLICT(user_id, routine_date) DO UPDATE SET tasks = ?
  `).run(req.userId, today, JSON.stringify(tasks), JSON.stringify(tasks));

  res.json({ date: today, tasks });
});

// ---- Workout ----

// GET /api/userdata/workout
router.get('/workout', authenticate, (req, res) => {
  const today = new Date().toISOString().split('T')[0];
  const workout = db.prepare(
    'SELECT completed FROM workouts WHERE user_id = ? AND workout_date = ?'
  ).get(req.userId, today);

  res.json({ date: today, completed: workout ? JSON.parse(workout.completed) : {} });
});

// POST /api/userdata/workout/toggle
router.post('/workout/toggle', authenticate, (req, res) => {
  const { exerciseId } = req.body;
  if (!exerciseId) return res.status(400).json({ error: 'exerciseId required' });

  const today = new Date().toISOString().split('T')[0];
  const existing = db.prepare(
    'SELECT completed FROM workouts WHERE user_id = ? AND workout_date = ?'
  ).get(req.userId, today);

  let completed = existing ? JSON.parse(existing.completed) : {};
  completed[exerciseId] = !completed[exerciseId];

  db.prepare(`
    INSERT INTO workouts (user_id, workout_date, completed) VALUES (?, ?, ?)
    ON CONFLICT(user_id, workout_date) DO UPDATE SET completed = ?
  `).run(req.userId, today, JSON.stringify(completed), JSON.stringify(completed));

  res.json({ date: today, completed });
});

module.exports = router;
