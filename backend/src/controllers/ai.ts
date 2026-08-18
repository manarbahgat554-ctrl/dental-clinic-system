import type { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { createError } from '../middlewares/error.js';

export async function analyzeImage(req: AuthRequest, res: Response) {
  if (!req.user) throw createError(401, 'Not authenticated');
  const { imageType, imageData, patientId, radiologyImageId } = req.body;

  if (!imageType) throw createError(400, 'imageType is required');

  // Placeholder — will connect to real AI providers (OpenAI, Gemini, Claude, OpenRouter, local)
  // based on clinic's ai_provider setting
  res.json({
    status: 'completed',
    imageType,
    findings: [],
    imageQualityScore: 85,
    confidenceScore: 90,
    riskLevel: 'low',
    recommendations: [],
    suggestedTreatmentPlan: '',
    urgencyLevel: 'routine',
    suggestedNextAppointment: null,
    reportSummary: 'Analysis complete — connect AI provider for full results.',
    patientId,
    radiologyImageId,
  });
}
