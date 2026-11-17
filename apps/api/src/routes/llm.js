// apps/api/src/routes/llm.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// GET /llm/health
router.get('/health', stub('llm:health'));

// POST /llm/selftest
router.post('/selftest', stub('llm:selftest'));

export default router;
