// apps/api/src/routes/index.js
// FROZEN AFTER GATE G0 - DO NOT EDIT AFTER G0
// Wires all frozen route stubs per §6 and Part 2B

import { Router } from 'express';
import healthRouter from './health.js';
import llmRouter from './llm.js';
import targetsRouter from './targets.js';
import scansRouter from './scans.js';
import findingsRouter from './findings.js';
import triageRouter from './triage.js';
import intelRouter from './intel.js';
import patchesRouter from './patches.js';
import verificationsRouter from './verifications.js';
import eventsRouter from './events.js';
import corpusRouter from './corpus.js';
import benchmarksRouter from './benchmarks.js';
import streamRouter from './stream.js';
import profilesRouter from './profiles.js';
import internalRouter from './internal.js';

export function createApiRouter() {
  const router = Router();

  // Public /api/v1 routes (§6.2 & B·2)
  router.use('/health', healthRouter);
  router.use('/llm', llmRouter);
  router.use('/targets', targetsRouter);
  router.use('/scans', scansRouter);
  router.use('/findings', findingsRouter);
  router.use('/triage', triageRouter);
  router.use('/intel', intelRouter);
  router.use('/patches', patchesRouter);
  router.use('/verifications', verificationsRouter);
  router.use('/events', eventsRouter);
  router.use('/corpus', corpusRouter);
  router.use('/benchmarks', benchmarksRouter);
  router.use('/stream', streamRouter);
  router.use('/profiles', profilesRouter);

  return router;
}

export function createInternalRouter() {
  // Internal /internal/v1 routes (§6.3 & B·2)
  return internalRouter;
}

export default {
  createApiRouter,
  createInternalRouter
};
