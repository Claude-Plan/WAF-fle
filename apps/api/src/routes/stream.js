// apps/api/src/routes/stream.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// GET /stream (SSE)
router.get('/', stub('stream:get'));

export default router;
