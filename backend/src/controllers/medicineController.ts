import { Response } from 'express';
import prisma from '../db';
import { AuthRequest } from '../middleware/authMiddleware';
import { z } from 'zod';

const createMedicineSchema = z.object({
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
 * Get all medicines for a specific store
 */
export async function getMedicines(req: AuthRequest, res: Response) {
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

    const medicines = await prisma.medicine.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(200).json({ medicines });
  } catch (error) {
    console.error('Error fetching medicines:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Create a new medicine entry for a specific store
 */
export async function createMedicine(req: AuthRequest, res: Response) {
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

    const parsed = createMedicineSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map(issue => issue.message);
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    const data = parsed.data;
    
    // Calculate current quantity
    const currentQuantity = data.quantityReceived - data.quantityIssued - data.lossAdjustment;

    const medicine = await prisma.medicine.create({
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

    return res.status(201).json({ message: 'Medicine created successfully.', medicine });
  } catch (error) {
    console.error('Error creating medicine:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
