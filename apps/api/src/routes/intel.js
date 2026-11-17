// apps/api/src/routes/intel.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// GET /intel/status
router.get('/status', stub('intel:status'));

// GET /intel/cve/:cve
router.get('/cve/:cve', stub('intel:cve'));

export default router;
