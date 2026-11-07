import { Router } from 'express';
import { trackViewAction, trackClickAction } from '../controllers/public/webUpdates.controller.js';

const router = Router();

router.post('/website-updates/:id/track-view', trackViewAction);
router.post('/website-updates/:id/track-click', trackClickAction);

export default router;

