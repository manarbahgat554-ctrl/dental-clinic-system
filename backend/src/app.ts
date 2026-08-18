import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.js';
import patientRoutes from './routes/patients.js';
import appointmentRoutes from './routes/appointments.js';
import treatmentRoutes from './routes/treatments.js';
import invoiceRoutes from './routes/invoices.js';
import paymentRoutes from './routes/payments.js';
import radiologyRoutes from './routes/radiology.js';
import inventoryRoutes from './routes/inventory.js';
import labOrderRoutes from './routes/lab-orders.js';
import aiRoutes from './routes/ai.js';
import clinicRoutes from './routes/clinic.js';
import countryRoutes from './routes/countries.js';

import { errorHandler } from './middlewares/error.js';

const app = express();

// ============================================================
// CORS
// ============================================================

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5175',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  }),
);

// ============================================================
// Body Parser
// ============================================================

app.use(express.json({ limit: '10mb' }));

app.use(
  express.urlencoded({
    extended: true,
    limit: '10mb',
  }),
);

// ============================================================
// Health Check
// ============================================================

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// ============================================================
// Routes
// ============================================================

app.use('/api/auth', authRoutes);

app.use('/api/patients', patientRoutes);

app.use('/api/appointments', appointmentRoutes);

app.use('/api/treatments', treatmentRoutes);

app.use('/api/invoices', invoiceRoutes);

app.use('/api/payments', paymentRoutes);

app.use('/api/radiology', radiologyRoutes);

app.use('/api/inventory', inventoryRoutes);

app.use('/api/lab-orders', labOrderRoutes);

app.use('/api/ai', aiRoutes);

app.use('/api/clinic', clinicRoutes);

app.use('/api/countries', countryRoutes);

// ============================================================
// Error Handler
// ============================================================

app.use(errorHandler);

export default app;