import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

const assignStoresSchema = z.object({
  storeIds: z.array(z.string()),
});

/**
 * Get all coworkers and their assigned stores.
 * ADMIN only.
 */
export async function getCoworkers(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const coworkers = await prisma.user.findMany({
      where: { role: 'COWORKER' },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        assignedStores: {
          select: { id: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ coworkers });
  } catch (error) {
    console.error('Error fetching coworkers:', error);
    return res.status(500).json({ error: 'Internal server error fetching coworkers.' });
  }
}

/**
 * Update a coworker's store assignments.
 * ADMIN only.
 */
export async function assignCoworkerToStores(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { id: coworkerId } = req.params;
    
    const parsed = assignStoresSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid store IDs provided.' });
    }
    const { storeIds } = parsed.data;

    // Verify the user exists and is a coworker
    const coworker = await prisma.user.findUnique({ where: { id: coworkerId } });
    if (!coworker || coworker.role !== 'COWORKER') {
      return res.status(404).json({ error: 'Coworker not found or invalid role.' });
    }

    // Update assignments using set (replaces existing assignments)
    const updatedUser = await prisma.user.update({
      where: { id: coworkerId },
      data: {
        assignedStores: {
          set: storeIds.map(id => ({ id }))
        }
      },
      select: {
        id: true,
        name: true,
        assignedStores: { select: { id: true, name: true } }
      }
    });

    return res.status(200).json({ message: 'Store assignments updated successfully.', coworker: updatedUser });
  } catch (error) {
    console.error('Error assigning stores:', error);
    return res.status(500).json({ error: 'Internal server error updating assignments.' });
  }
}

/**
 * Delete a coworker permanently.
 * ADMIN only.
 */
export async function deleteCoworker(req: AuthRequest, res: Response) {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const { id: coworkerId } = req.params;

    const coworker = await prisma.user.findUnique({ where: { id: coworkerId } });
    if (!coworker || coworker.role !== 'COWORKER') {
      return res.status(404).json({ error: 'Coworker not found or invalid role.' });
    }

    await prisma.user.delete({
      where: { id: coworkerId }
    });

    return res.status(200).json({ message: 'Coworker deleted successfully.' });
  } catch (error) {
    console.error('Error deleting coworker:', error);
    return res.status(500).json({ error: 'Internal server error deleting coworker.' });
  }
}
