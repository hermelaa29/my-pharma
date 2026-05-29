import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getDashboardData } from '../controllers/dashboardController';

const router = Router();

// GET /api/stores/:storeId/dashboard - Get dashboard data for a store
router.get('/:storeId/dashboard', authenticateToken, getDashboardData);

export default router;
