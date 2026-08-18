import type { AIFinding, AIReport } from '@/types/ai';
import { AI_FINDING_TYPES } from '@/types/ai';

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const FINDING_DESCRIPTIONS: Record<string, { en: string; ar: string }> = {
  caries: {
    en: 'Radiolucency detected in the enamel/dentin suggesting possible carious lesion.',
    ar: 'تم اكتشاف شفافية في المينا/العاج تشير إلى وجود تسوس محتمل.',
  },
  periapical_lesion: {
    en: 'Periapical radiolucency observed at the root apex, indicating possible periapical lesion.',
    ar: 'شفافية ذروية ملحوظة عند قمة الجذر، تشير إلى آفة ذروية محتملة.',
  },
  bone_loss: {
    en: 'Horizontal or vertical bone loss detected, suggesting periodontal involvement.',
    ar: 'تم اكتشاف فقدان عظمي أفقي أو عمودي، يشير إلى ت involvement لثوي.',
  },
  impacted_tooth: {
    en: 'Tooth appears to be impacted with incomplete eruption.',
    ar: 'يبدو أن السن منطمر مع بزوغ غير مكتمل.',
  },
  wisdom_tooth: {
    en: 'Third molar status: mesial angular impaction pattern observed.',
    ar: 'حالة الضرس الثالث: نمط انطمار زاوي إنسي ملحوظ.',
  },
  root_condition: {
    en: 'Root morphology shows possible resorption or shortening.',
    ar: 'مورفولوجيا الجذر تظهر امتصاصاً محتملاً أو تقصيراً.',
  },
  periodontal: {
    en: 'Widened periodontal ligament space suggests periodontal disease.',
    ar: 'اتساع مساحة الرباط اللثوي يشير إلى أمراض اللثة.',
  },
  missing_tooth: {
    en: 'Tooth appears to be missing from the dental arch.',
    ar: 'يبدو أن السن مفقود من القوس السني.',
  },
  restoration: {
    en: 'Existing restoration/filling material detected.',
    ar: 'تم اكتشاف مادة حشو/ترميم موجودة.',
  },
  crown: {
    en: 'Artificial crown detected on the tooth.',
    ar: 'تم اكتشاف تاج اصطناعي على السن.',
  },
  bridge: {
    en: 'Bridge prosthesis detected spanning multiple teeth.',
    ar: 'تم اكتشاف جسر اصطناعي يمتد عبر عدة أسنان.',
  },
  implant: {
    en: 'Dental implant fixture detected.',
    ar: 'تم اكتشاف زرعة سنية.',
  },
  fracture: {
    en: 'Possible fracture line detected in the tooth structure.',
    ar: 'خط كسر محتمل مكتشف في بنية السن.',
  },
  root_canal: {
    en: 'Endodontically treated tooth with root canal filling material.',
    ar: 'سن عولج عصبه مع مادة حشو عصب.',
  },
  abnormal: {
    en: 'Abnormal radiographic finding requiring further evaluation.',
    ar: 'نتيجة شعاعية غير طبيعية تتطلب مزيداً من التقييم.',
  },
};

const RECOMMENDATIONS_EN = [
  'Monitor the affected area at the next recall appointment.',
  'Consider taking a periapical radiograph for better visualization.',
  'Evaluate the need for endodontic treatment.',
  'Schedule a follow-up to assess progression.',
  'Consider restorative intervention to prevent further decay.',
  'Refer to a specialist for comprehensive evaluation.',
  'Recommend improved oral hygiene in the affected region.',
  'Assess the need for extraction if the tooth is non-restorable.',
];

const RECOMMENDATIONS_AR = [
  'مراقبة المنطقة المصابة في موعد المراجعة التالي.',
  'النظر في أخذ أشعة ذروية لتصور أفضل.',
  'تقييم الحاجة إلى علاج عصب.',
  'جدولة متابعة لتقييم التطور.',
  'النظر في تدخل ترميمي لمنع المزيد من التسوس.',
  'إحالة إلى أخصائي للتقييم الشامل.',
  'التوصية بتحسين صحة الفم في المنطقة المصابة.',
  'تقييم الحاجة للخلع إذا كان السن غير قابل للترميم.',
];

const TREATMENT_PLANS_EN = [
  'Phase 1: Address acute findings with restorative treatment. Phase 2: Schedule endodontic evaluation for affected teeth. Phase 3: Regular recall every 6 months.',
  'Immediate: Restore carious lesions with composite fillings. Short-term: Endodontic treatment for teeth with periapical involvement. Long-term: Crown placement for structurally compromised teeth.',
  '1. Extraction of non-restorable teeth. 2. Implant placement after healing. 3. Provisional prosthesis during osseointegration. 4. Final prosthesis delivery.',
];

const TREATMENT_PLANS_AR = [
  'المرحلة 1: معالجة النتائج الحادة بالعلاج الترميمي. المرحلة 2: جدولة تقييم عصب للأسنان المصابة. المرحلة 3: مراجعة منتظمة كل 6 أشهر.',
  'فوري: ترميم التسوس بالحشوات المركبة. قصير المدى: علاج عصب للأسنان ذات ال involvement الذروي. طويل المدى: وضع تيجان للأسنان المتضررة بنيوياً.',
  '1. خلع الأسنان غير القابلة للترميم. 2. وضع زرعات بعد الشفاء. 3. أجهزة مؤقتة أثناء الاندماج العظمي. 4. تسليم الأجهزة النهائية.',
];

export function generateAIAnalysis(
  imageType: string,
  language: 'en' | 'ar',
): Omit<AIReport, 'id' | 'clinicId' | 'patientId' | 'radiologyImageId' | 'uploadedBy' | 'createdAt'> {
  const findingCount = randomInt(2, 6);
  const selectedTypes = new Set<string>();
  const findings: AIFinding[] = [];

  for (let i = 0; i < findingCount; i++) {
    const ft = pick(AI_FINDING_TYPES);
    if (selectedTypes.has(ft.type)) continue;
    selectedTypes.add(ft.type);

    const desc = FINDING_DESCRIPTIONS[ft.type] ?? FINDING_DESCRIPTIONS.abnormal;
    const severities: ('low' | 'moderate' | 'high' | 'critical')[] = ['low', 'moderate', 'high', 'critical'];

    findings.push({
      id: `finding-${i}-${Date.now()}`,
      type: ft.type,
      label: ft.label,
      labelAr: ft.labelAr,
      severity: pick(severities),
      confidence: randomInt(60, 95),
      toothNumber: randomInt(11, 48),
      position: { x: randomInt(10, 90), y: randomInt(10, 90) },
      description: language === 'ar' ? desc.ar : desc.en,
      descriptionAr: desc.ar,
      color: ft.color,
      differentialDiagnosis: language === 'ar' ? 'يستبعد التشخيص التفريقي الحالات المشابهة' : 'Differential diagnosis considers similar presentations',
      recommendedTreatment: language === 'ar' ? pick(RECOMMENDATIONS_AR) : pick(RECOMMENDATIONS_EN),
      clinicalNotes: language === 'ar' ? 'مراجعة سريرية موصى بها للتأكيد' : 'Clinical review recommended for confirmation',
      riskAssessment: pick(['low', 'moderate', 'high', 'critical']),
      nextStep: language === 'ar' ? pick(RECOMMENDATIONS_AR) : pick(RECOMMENDATIONS_EN),
      estimatedCost: randomInt(100, 5000),
      priority: pick(['low', 'medium', 'high', 'urgent']),
    });
  }

  const maxSeverity = findings.reduce((max, f) => {
    const order = ['low', 'moderate', 'high', 'critical'];
    return order.indexOf(f.severity) > order.indexOf(max) ? f.severity : max;
  }, 'low');

  const confidence = Math.round(findings.reduce((s, f) => s + f.confidence, 0) / findings.length);
  const quality = randomInt(65, 95);
  const urgencies = ['routine', 'soon', 'urgent', 'immediate'] as const;
  const urgencyIdx = ['low', 'moderate', 'high', 'critical'].indexOf(maxSeverity);
  const urgency = urgencies[Math.min(urgencyIdx, 3)];

  const recCount = randomInt(3, 5);
  const recommendations: string[] = [];
  for (let i = 0; i < recCount; i++) {
    recommendations.push(language === 'ar' ? pick(RECOMMENDATIONS_AR) : pick(RECOMMENDATIONS_EN));
  }

  const plan = language === 'ar' ? pick(TREATMENT_PLANS_AR) : pick(TREATMENT_PLANS_EN);

  const nextApptDays = urgency === 'immediate' ? 7 : urgency === 'urgent' ? 14 : urgency === 'soon' ? 30 : 90;
  const nextAppt = new Date(Date.now() + nextApptDays * 86400000).toISOString().split('T')[0];

  const summaryEn = `Analysis of the ${imageType} image revealed ${findings.length} findings with an overall confidence of ${confidence}%. The highest risk level detected is ${maxSeverity}. Image quality is ${quality >= 80 ? 'good' : quality >= 65 ? 'moderate' : 'poor'} (${quality}%). Recommended urgency: ${urgency}.`;
  const summaryAr = `كشف تحليل صورة ${imageType} عن ${findings.length} نتائج بثقة إجمالية ${confidence}%. أعلى مستوى مخاطر مكتشف هو ${maxSeverity}. جودة الصورة ${quality >= 80 ? 'جيدة' : quality >= 65 ? 'متوسطة' : 'ضعيفة'} (${quality}%). الإلحاح الموصى به: ${urgency}.`;

  return {
    imageType: imageType,
    findings,
    imageQualityScore: quality,
    confidenceScore: confidence,
    riskLevel: maxSeverity as AIReport['riskLevel'],
    recommendations,
    suggestedTreatmentPlan: plan,
    urgencyLevel: urgency as AIReport['urgencyLevel'],
    suggestedNextAppointment: nextAppt,
    reportSummary: language === 'ar' ? summaryAr : summaryEn,
    status: 'completed',
  };
}
