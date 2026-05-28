import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware';
import { getCoworkers, assignCoworkerToStores, deleteCoworker } from '../controllers/userController';

const router = Router();

// All routes here require authentication (and the controllers enforce ADMIN role)
router.use(authenticateToken);

router.get('/coworkers', getCoworkers);
router.put('/:id/stores', assignCoworkerToStores);
router.delete('/:id', deleteCoworker);

export default router;
