import { Router } from 'express';
import { getMedicines, createMedicine } from '../controllers/medicineController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Base route: /api/stores/:storeId/medicines
router.get('/:storeId/medicines', authenticateToken, getMedicines);
router.post('/:storeId/medicines', authenticateToken, createMedicine);

export default router;
