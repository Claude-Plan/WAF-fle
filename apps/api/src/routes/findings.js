// apps/api/src/routes/findings.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// GET /findings
router.get('/', stub('findings:list'));

// GET /findings/:id
router.get('/:id', stub('findings:get'));

// PATCH /findings/:id
router.patch('/:id', stub('findings:update'));

// POST /findings/:id/confirm
router.post('/:id/confirm', stub('findings:confirm'));

// GET /findings/:id/triage
router.get('/:id/triage', stub('findings:triage:get'));

// POST /findings/:id/triage/explain
router.post('/:id/triage/explain', stub('findings:triage:explain'));

// GET /findings/:id/exposure
router.get('/:id/exposure', stub('findings:exposure:get'));

// POST /findings/:id/patches
router.post('/:id/patches', stub('findings:patches:create'));

export default router;
