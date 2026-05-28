import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getAllStores, createStore } from '../controllers/storeController';

const router = Router();

// GET /api/stores - Fetch all stores (any authenticated user)
router.get('/', authenticateToken, getAllStores);

// POST /api/stores - Create a new store (ADMIN only, enforced in controller)
router.post('/', authenticateToken, createStore);

export default router;
