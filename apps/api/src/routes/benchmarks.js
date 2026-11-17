// apps/api/src/routes/benchmarks.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// POST /benchmarks/run
router.post('/run', stub('benchmarks:run'));

// GET /benchmarks
router.get('/', stub('benchmarks:list'));

// GET /benchmarks/:id
router.get('/:id', stub('benchmarks:get'));

export default router;
