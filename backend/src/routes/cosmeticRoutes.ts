import { Router } from 'express';
import { getCosmetics, createCosmetic, updateCosmetic, deleteCosmetic, bulkCreateCosmetics, deleteFiscalYearCosmetics } from '../controllers/cosmeticController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Base route: /api/stores/:storeId/cosmetics
router.get('/:storeId/cosmetics', authenticateToken, getCosmetics);
router.post('/:storeId/cosmetics', authenticateToken, createCosmetic);
router.post('/:storeId/cosmetics/bulk', authenticateToken, bulkCreateCosmetics);
router.delete('/:storeId/cosmetics/fiscal/:year', authenticateToken, deleteFiscalYearCosmetics);
router.put('/:storeId/cosmetics/:id', authenticateToken, updateCosmetic);
router.delete('/:storeId/cosmetics/:id', authenticateToken, deleteCosmetic);

export default router;
