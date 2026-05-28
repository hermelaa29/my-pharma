import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

const createStoreSchema = z.object({
  name: z.string().min(2, 'Store name must be at least 2 characters').max(100),
  address: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
});

/**
 * Get all pharmacy stores.
 * Accessible by any authenticated user (ADMIN or COWORKER).
 */
export async function getAllStores(req: AuthRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    const isAdmin = req.user.role === 'ADMIN';

    const stores = await prisma.store.findMany({
      where: isAdmin ? undefined : { coworkers: { some: { id: req.user.id } } },
      orderBy: { createdAt: 'desc' },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(200).json({ stores });
  } catch (error) {
    console.error('Error fetching stores:', error);
    return res.status(500).json({ error: 'Internal server error fetching stores.' });
  }
}

/**
 * Create a new pharmacy store.
 * Restricted to ADMIN users only.
 */
export async function createStore(req: AuthRequest, res: Response) {
  try {
    // Enforce ADMIN-only access
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Only Admin users can create stores.' });
    }

    const parsed = createStoreSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.errors.map(e => e.message);
      return res.status(400).json({ errors });
    }

    const { name, address, description } = parsed.data;

    const store = await prisma.store.create({
      data: {
        name,
        address: address ?? null,
        description: description ?? null,
        createdById: req.user.id,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    return res.status(201).json({ message: 'Store created successfully!', store });
  } catch (error) {
    console.error('Error creating store:', error);
    return res.status(500).json({ error: 'Internal server error creating store.' });
  }
}
