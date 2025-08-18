const express = require('express');
const router = express.Router();
const SupportPerson = require('../models/SupportPerson');

// GET /api/support-persons  → list all support persons
router.get('/', async (_req, res) => {
  try {
    const people = await SupportPerson.find().sort({ name: 1 });
    res.json(people);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch support persons', details: err.message });
  }
});

/**
 * POST /api/support-persons/seed
 * Dev-only helper to insert dummy support persons.
 * Remove or protect this route in production.
 */
router.post('/seed', async (_req, res) => {
  try {
    const seed = [
      { name: 'Dr. Ayesha Rahman', title: 'Clinical Psychologist', specialization: 'Adolescent Mental Health' },
      { name: 'Mr. Tanvir Alam', title: 'Peer Counselor', specialization: 'Exam Stress & Motivation' },
      { name: 'Dr. Rehana Kabir', title: 'Therapist', specialization: 'Anxiety and Depression' },
    ];

    await SupportPerson.deleteMany({});
    const docs = await SupportPerson.insertMany(seed);

    res.status(201).json({ inserted: docs.length, people: docs });
  } catch (err) {
    res.status(500).json({ error: 'Seed failed', details: err.message });
  }
});

module.exports = router;
