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
      { name: 'Dr. Nilufa Yasmin', title: 'Clinical Psychologist', specialization: 'Eating Disorders' },
      { name: 'Ms. Nusrat Jahan', title: 'Therapist', specialization: 'Trauma and PTSD' },
      { name: 'Dr. Farid Ahmed', title: 'Clinical Psychologist', specialization: 'Obsessive-Compulsive Disorder (OCD)' },
      { name: 'Ms. Samira Rahman', title: 'Therapist', specialization: 'Relationship Issues' },
      { name: 'Dr. Mehnaz Sultana', title: 'Clinical Psychologist', specialization: 'Adult ADHD' },
      { name: 'Mr. Faisal Karim', title: 'Therapist', specialization: 'Grief Counseling' },
      { name: 'Dr. Laila Hossain', title: 'Clinical Psychologist', specialization: 'Panic Disorders' },
      { name: 'Ms. Maliha Khan', title: 'Therapist', specialization: 'Self-Esteem & Identity' },
      { name: 'Dr. Shahinur Alam', title: 'Clinical Psychologist', specialization: 'Bipolar Disorder' },
      { name: 'Ms. Tasfia Noor', title: 'Therapist', specialization: 'Mindfulness-Based Therapy' },
      { name: 'Mr. Jahidul Islam', title: 'Peer Counselor', specialization: 'Self-Confidence & Academic Pressure' },
      { name: 'Dr. Asif Mahmud', title: 'Clinical Psychologist', specialization: 'Post-Traumatic Stress Disorder (PTSD)' },
      { name: 'Ms. Riyana Zaman', title: 'Therapist', specialization: 'Anger Management' },
      { name: 'Dr. Kamrun Nahar', title: 'Clinical Psychologist', specialization: 'Sleep Disorders' },
      { name: 'Mr. Nabeel Haque', title: 'Therapist', specialization: 'Addiction Recovery' },
      { name: 'Mr. Rayhan Alam', title: 'Peer Counselor', specialization: 'Motivation & Peer Pressure' },
      { name: 'Dr. Fariha Chowdhury', title: 'Clinical Psychologist', specialization: 'Social Anxiety' },
      { name: 'Ms. Jannat Akter', title: 'Therapist', specialization: 'Parenting Support' },
      { name: 'Dr. Imtiaz Rahman', title: 'Clinical Psychologist', specialization: 'Schizophrenia & Psychosis' },
      { name: 'Ms. Nafisa Karim', title: 'Therapist', specialization: 'Life Transitions & Adjustment' },
      { name: 'Mr. Aminul Islam', title: 'Peer Counselor', specialization: 'Time Management & Burnout' },
      { name: 'Dr. Sabrina Mahmud', title: 'Clinical Psychologist', specialization: 'Crisis Intervention' }
    ];

    await SupportPerson.deleteMany({});
    const docs = await SupportPerson.insertMany(seed);

    res.status(201).json({ inserted: docs.length, people: docs });
  } catch (err) {
    res.status(500).json({ error: 'Seed failed', details: err.message });
  }
});

module.exports = router;
