// apps/api/src/routes/triage.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// POST /triage/run
router.post('/run', stub('triage:run'));

// GET /triage/compare
router.get('/compare', stub('triage:compare'));

export default router;
