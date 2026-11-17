// apps/api/src/routes/internal.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// GET /internal/v1/rules/active
router.get('/rules/active', stub('internal:rules:active'));

// GET /internal/v1/rules/candidate/:patch_id
router.get('/rules/candidate/:patch_id', stub('internal:rules:candidate'));

// POST /internal/v1/events
router.post('/events', stub('internal:events:batch'));

// POST /internal/v1/corpus
router.post('/corpus', stub('internal:corpus:batch'));

// GET /internal/v1/profiles/active
router.get('/profiles/active', stub('internal:profiles:active'));

export default router;
