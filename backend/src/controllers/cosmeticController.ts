import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

const createCosmeticSchema = z.object({
  itemCode: z.string().min(1, "Item Code is required"),
  itemName: z.string().min(1, "Item Name is required"),
  receivedDate: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  wholesaler: z.string().optional().nullable(),
  quantityReceived: z.number().default(0),
  quantityIssued: z.number().default(0),
  lossAdjustment: z.number().default(0),
  expireDate: z.string().optional().nullable(),
  batchNumber: z.string().optional().nullable(),
  purchasePrice: z.number().default(0),
  salePrice: z.number().default(0),
  remark: z.string().optional().nullable(),
});

/**
 * Get all cosmetics for a specific store
 */
export async function getCosmetics(req: AuthRequest, res: Response) {
  try {
    const { storeId } = req.params;

    // Verify user has access to this store
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { coworkers: true }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    if (req.user!.role !== 'ADMIN' && !store.coworkers.some(cw => cw.id === req.user!.id)) {
      return res.status(403).json({ error: 'Access denied to this store.' });
    }

    const cosmetics = await prisma.cosmetic.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ cosmetics });
  } catch (error) {
    console.error('Error fetching cosmetics:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Create a new cosmetic entry for a specific store
 */
export async function createCosmetic(req: AuthRequest, res: Response) {
  try {
    const { storeId } = req.params;

    // Verify user has access
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { coworkers: true }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    if (req.user!.role !== 'ADMIN' && !store.coworkers.some(cw => cw.id === req.user!.id)) {
      return res.status(403).json({ error: 'Access denied to this store.' });
    }

    const parsed = createCosmeticSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map(issue => issue.message);
      return res.status(400).json({ error: `Validation failed: ${errors.join(', ')}` });
    }

    const data = parsed.data;
    
    // Calculate current quantity
    const currentQuantity = data.quantityReceived - data.quantityIssued - data.lossAdjustment;

    const cosmetic = await prisma.cosmetic.create({
      data: {
        storeId,
        itemCode: data.itemCode,
        itemName: data.itemName,
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : null,
        category: data.category,
        wholesaler: data.wholesaler,
        quantityReceived: data.quantityReceived,
        quantityIssued: data.quantityIssued,
        lossAdjustment: data.lossAdjustment,
        currentQuantity,
        expireDate: data.expireDate ? new Date(data.expireDate) : null,
        batchNumber: data.batchNumber,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        remark: data.remark,
      }
    });

    return res.status(201).json({ message: 'Cosmetic created successfully.', cosmetic });
  } catch (error) {
    console.error('Error creating cosmetic:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Update an existing cosmetic entry
 */
export async function updateCosmetic(req: AuthRequest, res: Response) {
  try {
    const { storeId, id } = req.params;

    // Verify user has access
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { coworkers: true }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    if (req.user!.role !== 'ADMIN' && !store.coworkers.some(cw => cw.id === req.user!.id)) {
      return res.status(403).json({ error: 'Access denied to this store.' });
    }

    const parsed = createCosmeticSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map(issue => issue.message);
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    const data = parsed.data;
    
    // Calculate current quantity
    const currentQuantity = data.quantityReceived - data.quantityIssued - data.lossAdjustment;

    const cosmetic = await prisma.cosmetic.update({
      where: { id },
      data: {
        itemCode: data.itemCode,
        itemName: data.itemName,
        receivedDate: data.receivedDate ? new Date(data.receivedDate) : null,
        category: data.category,
        wholesaler: data.wholesaler,
        quantityReceived: data.quantityReceived,
        quantityIssued: data.quantityIssued,
        lossAdjustment: data.lossAdjustment,
        currentQuantity,
        expireDate: data.expireDate ? new Date(data.expireDate) : null,
        batchNumber: data.batchNumber,
        purchasePrice: data.purchasePrice,
        salePrice: data.salePrice,
        remark: data.remark,
      }
    });

    return res.status(200).json({ message: 'Cosmetic updated successfully.', cosmetic });
  } catch (error) {
    console.error('Error updating cosmetic:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Delete a cosmetic entry
 */
export async function deleteCosmetic(req: AuthRequest, res: Response) {
  try {
    const { storeId, id } = req.params;

    // Verify user has access
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { coworkers: true }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    if (req.user!.role !== 'ADMIN' && !store.coworkers.some(cw => cw.id === req.user!.id)) {
      return res.status(403).json({ error: 'Access denied to this store.' });
    }

    await prisma.cosmetic.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Cosmetic deleted successfully.' });
  } catch (error) {
    console.error('Error deleting cosmetic:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Bulk create cosmetics
 */
export async function bulkCreateCosmetics(req: AuthRequest, res: Response) {
  try {
    const { storeId } = req.params;

    // Verify user has access
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { coworkers: true }
    });

    if (!store) {
      return res.status(404).json({ error: 'Store not found.' });
    }

    if (req.user!.role !== 'ADMIN' && !store.coworkers.some(cw => cw.id === req.user!.id)) {
      return res.status(403).json({ error: 'Access denied to this store.' });
    }

    const parsed = z.array(createCosmeticSchema).safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Validation failed on some rows.' });
    }

    const mapped = parsed.data.map(data => ({
      storeId,
      itemCode: data.itemCode,
      itemName: data.itemName,
      receivedDate: data.receivedDate ? new Date(data.receivedDate) : null,
      category: data.category,
      wholesaler: data.wholesaler,
      quantityReceived: data.quantityReceived,
      quantityIssued: data.quantityIssued,
      lossAdjustment: data.lossAdjustment,
      currentQuantity: data.quantityReceived - data.quantityIssued - data.lossAdjustment,
      expireDate: data.expireDate ? new Date(data.expireDate) : null,
      batchNumber: data.batchNumber,
      purchasePrice: data.purchasePrice,
      salePrice: data.salePrice,
      remark: data.remark,
    }));

    await prisma.cosmetic.createMany({
      data: mapped
    });

    // fetch and return updated list
    const cosmetics = await prisma.cosmetic.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(201).json({ message: 'Cosmetics imported successfully.', cosmetics });
  } catch (error) {
    console.error('Error importing cosmetics:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Delete cosmetics for a specific fiscal year (Admin only)
 */
export async function deleteFiscalYearCosmetics(req: AuthRequest, res: Response) {
  try {
    const { storeId, year } = req.params;

    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Only Admin users can perform this action.' });
    }

    const fiscalYear = parseInt(year);
    if (isNaN(fiscalYear)) {
      return res.status(400).json({ error: 'Invalid fiscal year.' });
    }

    const startYearGregorian = fiscalYear + 7;
    const startDate = new Date(startYearGregorian, 8, 11); // Sept 11
    const endDate = new Date(startYearGregorian + 1, 8, 10, 23, 59, 59); // Sept 10 next year

    const result = await prisma.cosmetic.deleteMany({
      where: {
        storeId,
        receivedDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return res.status(200).json({ message: `Deleted ${result.count} cosmetics for fiscal year ${year}.`, count: result.count });
  } catch (error) {
    console.error('Error deleting fiscal year cosmetics:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
