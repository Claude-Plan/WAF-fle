// apps/api/src/routes/patches.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// GET /patches
router.get('/', stub('patches:list'));

// GET /patches/:id
router.get('/:id', stub('patches:get'));

// POST /patches/:id/verify
router.post('/:id/verify', stub('patches:verify'));

// POST /patches/:id/deploy
router.post('/:id/deploy', stub('patches:deploy'));

// POST /patches/:id/rollback
router.post('/:id/rollback', stub('patches:rollback'));

// GET /patches/:id/export
router.get('/:id/export', stub('patches:export'));

// GET /patches/:id/promotion
router.get('/:id/promotion', stub('patches:promotion:get'));

export default router;
