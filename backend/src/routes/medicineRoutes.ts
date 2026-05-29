import { Router } from 'express';
import { getMedicines, createMedicine, updateMedicine, deleteMedicine, bulkCreateMedicines, deleteFiscalYearMedicines } from '../controllers/medicineController';
import { authenticateToken } from '../middleware/authMiddleware';

const router = Router();

// Base route: /api/stores/:storeId/medicines
router.get('/:storeId/medicines', authenticateToken, getMedicines);
router.post('/:storeId/medicines', authenticateToken, createMedicine);
router.post('/:storeId/medicines/bulk', authenticateToken, bulkCreateMedicines);
router.delete('/:storeId/medicines/fiscal/:year', authenticateToken, deleteFiscalYearMedicines);
router.put('/:storeId/medicines/:id', authenticateToken, updateMedicine);
router.delete('/:storeId/medicines/:id', authenticateToken, deleteMedicine);

export default router;
