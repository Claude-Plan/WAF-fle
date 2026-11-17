// apps/api/src/routes/scans.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// POST /scans
router.post('/', stub('scans:create'));

// POST /scans/import
router.post('/import', stub('scans:import'));

// GET /scans
router.get('/', stub('scans:list'));

// GET /scans/:id
router.get('/:id', stub('scans:get'));

export default router;
