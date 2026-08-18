import { Router } from 'express';

import {
  listInvoices,
  createInvoice,
  updateInvoice,
  listPayments,
  createPayment,
} from '../controllers/invoices.js';

import { authMiddleware } from '../middlewares/auth.js';
import { asyncHandler } from '../middlewares/error.js';

const invoiceRouter = Router();

invoiceRouter.use(authMiddleware);

invoiceRouter.get('/', asyncHandler(listInvoices));
invoiceRouter.post('/', asyncHandler(createInvoice));
invoiceRouter.put('/:id', asyncHandler(updateInvoice));

export default invoiceRouter;

export const paymentRouter = Router();

paymentRouter.use(authMiddleware);

paymentRouter.get('/', asyncHandler(listPayments));
paymentRouter.post('/', asyncHandler(createPayment));