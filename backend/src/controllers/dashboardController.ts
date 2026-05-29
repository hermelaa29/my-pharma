import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/authMiddleware';

/**
 * Get dashboard data for a specific store.
 * Returns: store info, team members, medicine stats, cosmetic stats, and red-flagged counts.
 */
export async function getDashboardData(req: AuthRequest, res: Response) {
  try {
    const { storeId } = req.params;

    // Verify user has access to this store
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: {
        createdBy: { select: { id: true, name: true, email: true, role: true } },
        coworkers: { select: { id: true, name: true, email: true, role: true } },
      }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    if (req.user!.role !== 'ADMIN' && !store.coworkers.some(cw => cw.id === req.user!.id)) {
      return res.status(403).json({ error: 'Access denied to this store.' });
    }

    // Fetch all admins (they have access to all stores)
    const admins = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true, name: true, email: true, role: true },
    });

    // Build team: admins + coworkers (deduplicate)
    const teamMap = new Map<string, { id: string; name: string; email: string; role: string }>();
    for (const admin of admins) {
      teamMap.set(admin.id, admin);
    }
    for (const cw of store.coworkers) {
      teamMap.set(cw.id, cw);
    }
    const team = Array.from(teamMap.values());

    // Calculate cutoff date for red flags (3 months from now)
    const now = new Date();
    const redFlagCutoff = new Date(now.getFullYear(), now.getMonth() + 3, now.getDate());

    // Fetch medicine stats
    const medicines = await prisma.medicine.findMany({
      where: { storeId },
      select: {
        currentQuantity: true,
        purchasePrice: true,
        expireDate: true,
      }
    });

    const medicineStats = {
      totalItems: medicines.length,
      totalQty: medicines.reduce((sum, m) => sum + m.currentQuantity, 0),
      totalPurchaseValue: medicines.reduce((sum, m) => sum + (m.currentQuantity * m.purchasePrice), 0),
      redFlaggedCount: medicines.filter(m => m.expireDate && new Date(m.expireDate) <= redFlagCutoff).length,
    };

    // Fetch cosmetic stats
    const cosmetics = await prisma.cosmetic.findMany({
      where: { storeId },
      select: {
        currentQuantity: true,
        purchasePrice: true,
        expireDate: true,
      }
    });

    const cosmeticStats = {
      totalItems: cosmetics.length,
      totalQty: cosmetics.reduce((sum, c) => sum + c.currentQuantity, 0),
      totalPurchaseValue: cosmetics.reduce((sum, c) => sum + (c.currentQuantity * c.purchasePrice), 0),
      redFlaggedCount: cosmetics.filter(c => c.expireDate && new Date(c.expireDate) <= redFlagCutoff).length,
    };

    return res.status(200).json({
      store: {
        id: store.id,
        name: store.name,
        address: store.address,
        description: store.description,
        createdBy: store.createdBy,
      },
      team,
      medicineStats,
      cosmeticStats,
      totalRedFlagged: medicineStats.redFlaggedCount + cosmeticStats.redFlaggedCount,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
