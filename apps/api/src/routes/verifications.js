// apps/api/src/routes/verifications.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// GET /verifications/:id
router.get('/:id', stub('verifications:get'));

// GET /verifications/:id/cases
router.get('/:id/cases', stub('verifications:cases'));

export default router;
