// apps/api/src/routes/health.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// GET /health
router.get('/', stub('health:get'));

export default router;
