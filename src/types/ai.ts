export interface AIFinding {
  id: string;
  type: string;
  label: string;
  labelAr: string;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  confidence: number;
  toothNumber?: number;
  position?: { x: number; y: number };
  description: string;
  descriptionAr: string;
  color: string;
  differentialDiagnosis?: string;
  recommendedTreatment?: string;
  clinicalNotes?: string;
  riskAssessment?: string;
  nextStep?: string;
  estimatedCost?: number;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface AIReport {
  id: string;
  clinicId: string;
  patientId: string;
  radiologyImageId: string | null;
  uploadedBy: string | null;
  imageType: string;
  findings: AIFinding[];
  imageQualityScore: number;
  confidenceScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  recommendations: string[];
  suggestedTreatmentPlan: string;
  urgencyLevel: 'routine' | 'soon' | 'urgent' | 'immediate';
  suggestedNextAppointment: string | null;
  reportSummary: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export const FINDING_COLORS: Record<string, string> = {
  caries: '#ef4444',
  root_canal: '#3b82f6',
  filling: '#eab308',
  crown: '#a855f7',
  bridge: '#6366f1',
  implant: '#a855f7',
  bone_loss: '#22c55e',
  periapical_lesion: '#f97316',
  abscess: '#dc2626',
  fracture: '#f97316',
  impacted_tooth: '#06b6d4',
  missing_tooth: '#ffffff',
  calculus: '#78716c',
  periodontal: '#10b981',
  root_resorption: '#be123c',
  broken_instrument: '#7c3aed',
  open_apex: '#0ea5e9',
  restoration: '#eab308',
  abnormal: '#64748b',
};

export const AI_FINDING_TYPES: { type: string; label: string; labelAr: string; color: string }[] = [
  { type: 'caries', label: 'Caries', labelAr: 'تسوس', color: '#ef4444' },
  { type: 'root_canal', label: 'Root Canal', labelAr: 'علاج عصب', color: '#3b82f6' },
  { type: 'filling', label: 'Filling', labelAr: 'حشو', color: '#eab308' },
  { type: 'crown', label: 'Crown', labelAr: 'تاج', color: '#a855f7' },
  { type: 'bridge', label: 'Bridge', labelAr: 'جسر', color: '#6366f1' },
  { type: 'implant', label: 'Implant', labelAr: 'زرعة', color: '#a855f7' },
  { type: 'bone_loss', label: 'Bone Loss', labelAr: 'فقدان العظم', color: '#22c55e' },
  { type: 'periapical_lesion', label: 'Periapical Lesion', labelAr: 'آفة ذروية', color: '#f97316' },
  { type: 'abscess', label: 'Abscess', labelAr: 'خراج', color: '#dc2626' },
  { type: 'fracture', label: 'Fracture', labelAr: 'كسر', color: '#f97316' },
  { type: 'impacted_tooth', label: 'Impacted Tooth', labelAr: 'سن منطمر', color: '#06b6d4' },
  { type: 'missing_tooth', label: 'Missing Tooth', labelAr: 'سن مفقود', color: '#ffffff' },
  { type: 'calculus', label: 'Calculus', labelAr: 'جير', color: '#78716c' },
  { type: 'periodontal', label: 'Periodontal Disease', labelAr: 'أمراض اللثة', color: '#10b981' },
  { type: 'root_resorption', label: 'Root Resorption', labelAr: 'امتصاص الجذر', color: '#be123c' },
  { type: 'broken_instrument', label: 'Broken Instrument', labelAr: 'أداة مكسورة', color: '#7c3aed' },
  { type: 'open_apex', label: 'Open Apex', labelAr: 'قمة مفتوحة', color: '#0ea5e9' },
  { type: 'restoration', label: 'Restoration', labelAr: 'ترميم', color: '#eab308' },
  { type: 'abnormal', label: 'Abnormal Finding', labelAr: 'نتيجة غير طبيعية', color: '#64748b' },
];

export const XRAY_TYPES = [
  { value: 'Panoramic', labelKey: 'aiAnalysis.panorama' },
  { value: 'Periapical', labelKey: 'aiAnalysis.periapical' },
  { value: 'Bitewing', labelKey: 'aiAnalysis.bitewing' },
  { value: 'CBCT', labelKey: 'aiAnalysis.cbct' },
  { value: 'Cephalometric', labelKey: 'aiAnalysis.ceph' },
  { value: 'Intraoral Photo', labelKey: 'aiAnalysis.intraoral' },
  { value: 'Extraoral Photo', labelKey: 'aiAnalysis.extraoral' },
];

export const RISK_COLORS: Record<string, string> = {
  low: '#22c55e',
  moderate: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

export const URGENCY_COLORS: Record<string, string> = {
  routine: '#22c55e',
  soon: '#0ea5e9',
  urgent: '#f59e0b',
  immediate: '#ef4444',
};

export const AI_PROVIDERS = [
  { value: 'openai', label: 'OpenAI (GPT-4)', labelAr: 'OpenAI (GPT-4)' },
  { value: 'gemini', label: 'Google Gemini', labelAr: 'Google Gemini' },
  { value: 'claude', label: 'Anthropic Claude', labelAr: 'Anthropic Claude' },
  { value: 'openrouter', label: 'OpenRouter', labelAr: 'OpenRouter' },
  { value: 'local', label: 'Local AI', labelAr: 'ذكاء اصطناعي محلي' },
];
