// apps/api/src/routes/events.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// GET /events
router.get('/', stub('events:list'));

// GET /events/stats
router.get('/stats', stub('events:stats'));

export default router;
