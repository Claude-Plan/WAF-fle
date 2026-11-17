// apps/api/src/routes/targets.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// POST /targets
router.post('/', stub('targets:create'));

// GET /targets
router.get('/', stub('targets:list'));

// GET /targets/:id
router.get('/:id', stub('targets:get'));

// PATCH /targets/:id
router.patch('/:id', stub('targets:update'));

export default router;
