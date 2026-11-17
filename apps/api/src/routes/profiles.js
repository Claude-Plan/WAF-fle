// apps/api/src/routes/profiles.js
import { Router } from 'express';
import { stub } from './stubHelper.js';

const router = Router();

// POST /profiles/rebuild
router.post('/rebuild', stub('profiles:rebuild'));

// GET /profiles
router.get('/', stub('profiles:list'));

// GET /profiles/:id
router.get('/:id', stub('profiles:get'));

// POST /profiles/:id/lock
router.post('/:id/lock', stub('profiles:lock'));

export default router;
