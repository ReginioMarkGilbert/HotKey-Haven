import { Router } from 'express';
import hotkeySetRoutes from './hotkeySetRoutes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
   res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Hotkey routes
router.use('/hotkey-sets', hotkeySetRoutes);

export default router;