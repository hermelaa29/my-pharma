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
      return res.status(400).json({ error: `Validation failed: ${errors.join(', ')}` });
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

/**
 * Update an existing medicine entry
 */
export async function updateMedicine(req: AuthRequest, res: Response) {
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

    const parsed = createMedicineSchema.safeParse(req.body);
    if (!parsed.success) {
      const errors = parsed.error.issues.map(issue => issue.message);
      return res.status(400).json({ error: 'Validation failed', errors });
    }

    const data = parsed.data;
    
    // Calculate current quantity
    const currentQuantity = data.quantityReceived - data.quantityIssued - data.lossAdjustment;

    const medicine = await prisma.medicine.update({
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

    return res.status(200).json({ message: 'Medicine updated successfully.', medicine });
  } catch (error) {
    console.error('Error updating medicine:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Delete a medicine entry
 */
export async function deleteMedicine(req: AuthRequest, res: Response) {
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

    await prisma.medicine.delete({
      where: { id }
    });

    return res.status(200).json({ message: 'Medicine deleted successfully.' });
  } catch (error) {
    console.error('Error deleting medicine:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Bulk create medicines
 */
export async function bulkCreateMedicines(req: AuthRequest, res: Response) {
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

    const parsed = z.array(createMedicineSchema).safeParse(req.body);
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

    await prisma.medicine.createMany({
      data: mapped
    });

    // fetch and return updated list
    const medicines = await prisma.medicine.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' }
    });

    return res.status(201).json({ message: 'Medicines imported successfully.', medicines });
  } catch (error) {
    console.error('Error importing medicines:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}

/**
 * Delete medicines for a specific fiscal year (Admin only)
 */
export async function deleteFiscalYearMedicines(req: AuthRequest, res: Response) {
  try {
    const { storeId, year } = req.params;

    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Only Admin users can perform this action.' });
    }

    const fiscalYear = parseInt(year);
    if (isNaN(fiscalYear)) {
      return res.status(400).json({ error: 'Invalid fiscal year.' });
    }

    // Ethiopian Fiscal Year: Meskerem 1 (Sept 11) to Nehase 30 (Sept 10 of next year)
    // Roughly mapping: Year 2018 -> Sept 11, 2025 to Sept 10, 2026.
    // Let's assume fiscalYear is the Gregorian year of start, e.g., 2025.
    // Actually, the user asked for Ethiopian year.
    // Let's use the Gregorian year offset: Ethiopian Year + 7/8 = Gregorian Year.
    // If Ethiopian Year is 2018, it starts Sept 11, 2025 and ends Sept 10, 2026. (offset +7/+8 depending on month)
    // To make it simple, Gregorian start year = Ethiopian Year + 7.
    
    const startYearGregorian = fiscalYear + 7;
    const startDate = new Date(startYearGregorian, 8, 11); // Sept 11
    const endDate = new Date(startYearGregorian + 1, 8, 10, 23, 59, 59); // Sept 10 next year

    const result = await prisma.medicine.deleteMany({
      where: {
        storeId,
        receivedDate: {
          gte: startDate,
          lte: endDate
        }
      }
    });

    return res.status(200).json({ message: `Deleted ${result.count} medicines for fiscal year ${year}.`, count: result.count });
  } catch (error) {
    console.error('Error deleting fiscal year medicines:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
}
