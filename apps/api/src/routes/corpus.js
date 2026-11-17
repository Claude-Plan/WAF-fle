// apps/api/src/routes/corpus.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// GET /corpus/stats
router.get('/stats', stub('corpus:stats'));

export default router;
