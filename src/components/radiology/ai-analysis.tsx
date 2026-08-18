import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Sparkles, ScanLine, Loader2, FileDown, Printer, Save,
  Activity, Clock, TrendingUp, ShieldAlert, Eye, EyeOff, Layers,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { radiologyApi } from '@/api/radiology';
import { useAuthStore } from '@/stores/auth-store';
import { queries, queryKeys } from '@/lib/api';
import { generateAIAnalysis } from '@/lib/ai-analysis';
import { generateAIReportPDF } from '@/lib/ai-report-pdf';
import { AI_FINDING_TYPES, XRAY_TYPES, RISK_COLORS, URGENCY_COLORS } from '@/types/ai';
import type { AIReport, AIFinding } from '@/types/ai';
import { cn } from '@/lib/utils';

interface AIAnalysisProps {
  patientId: string;
  patientName: string;
}

export function AIAnalysis({ patientId, patientName }: AIAnalysisProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [xrayType, setXrayType] = useState('Panoramic');
  const [analyzing, setAnalyzing] = useState(false);
  const [report, setReport] = useState<AIReport | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageId, setImageId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());
  const [selectedFinding, setSelectedFinding] = useState<AIFinding | null>(null);

  const isAr = i18n.language === 'ar';

  const { data: radiologyImages = [] } = useQuery({
    queryKey: queryKeys.radiology(patientId),
    queryFn: () => queries.radiology.listByPatient(patientId),
  });

  const { data: savedReports = [] } = useQuery({
    queryKey: ['ai-reports', patientId],
    queryFn: () => radiologyApi.listReports(patientId),
  });

  const saveMutation = useMutation({
    mutationFn: async (rep: AIReport) => {
      const profile = useAuthStore.getState().profile;
      return radiologyApi.createReport({
        ...rep,
        clinicId: profile?.clinicId ?? '',
        patientId: patientId,
        uploadedBy: profile?.id ?? null,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-reports', patientId] });
      setSaved(true);
      toast.success(t('aiAnalysis.savedToHistory'));
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setReport(null);
    setSaved(false);
    setSelectedFinding(null);

    await new Promise((r) => setTimeout(r, 2000));

    const lang = (isAr ? 'ar' : 'en') as 'en' | 'ar';
    const analysis = generateAIAnalysis(xrayType, lang);

    const newReport: AIReport = {
      id: `temp-${Date.now()}`,
      clinicId: '',
      patientId: patientId,
      radiologyImageId: imageId,
      uploadedBy: null,
      createdAt: new Date().toISOString(),
      ...analysis,
    };

    setReport(newReport);
    setAnalyzing(false);
    toast.success(t('aiAnalysis.analysisComplete'));
  };

  const toggleLayer = (type: string) => {
    setHiddenLayers((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const handleSelectImage = (imgId: string, url: string) => {
    setImageUrl(url);
    setImageId(imgId);
    if (report) setReport({ ...report, radiologyImageId: imgId });
  };

  const visibleFindings = report?.findings.filter((f) => !hiddenLayers.has(f.type)) ?? [];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-5 w-5 text-primary" />
            {t('aiAnalysis.title')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">{t('aiAnalysis.subtitle')}</p>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs">{t('aiAnalysis.selectXrayType')}</Label>
              <Select value={xrayType} onValueChange={setXrayType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {XRAY_TYPES.map((x) => (
                    <SelectItem key={x.value} value={x.value}>{t(x.labelKey)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {radiologyImages.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs">{t('aiAnalysis.uploadForAnalysis')}</Label>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                {radiologyImages.slice(0, 6).map((img) => (
                  <button
                    key={img.id}
                    onClick={() => handleSelectImage(img.id, img.imageUrl)}
                    className={cn(
                      'overflow-hidden rounded-lg border-2 transition-all',
                      imageUrl === img.imageUrl ? 'border-primary ring-2 ring-primary/20' : 'border-transparent hover:border-primary/40',
                    )}
                  >
                    <img src={img.imageUrl} alt={img.imageName} className="h-16 w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleAnalyze} disabled={analyzing} className="w-full sm:w-auto">
            {analyzing ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('aiAnalysis.analyzing')}</>
            ) : (
              <><ScanLine className="mr-2 h-4 w-4" />{report ? t('aiAnalysis.reAnalyze') : t('aiAnalysis.analyze')}</>
            )}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence>
        {analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col items-center gap-4 p-8">
                <div className="relative">
                  <div className="absolute inset-0 animate-pulse rounded-full bg-primary/20 blur-xl" />
                  <div className="relative rounded-2xl bg-primary/15 p-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                </div>
                <p className="text-sm font-medium text-primary">{t('aiAnalysis.analyzing')}</p>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {report && !analyzing && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Image with color-coded finding overlays */}
          {imageUrl && (
            <Card>
              <CardContent className="p-4">
                <div className="relative overflow-hidden rounded-lg" style={{ background: '#0a0a0a' }}>
                  <img src={imageUrl} alt="X-ray" className="w-full" />
                  {visibleFindings.map((f, i) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFinding(f)}
                      className="absolute group"
                      style={{
                        left: `${f.position?.x}%`,
                        top: `${f.position?.y}%`,
                        transform: 'translate(-50%, -50%)',
                      }}
                    >
                      <div
                        className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold shadow-lg transition-transform hover:scale-125"
                        style={{
                          background: f.color + '90',
                          borderColor: f.color,
                          color: f.type === 'missing_tooth' ? '#000' : '#fff',
                        }}
                      >
                        {i + 1}
                      </div>
                      <div className="pointer-events-none absolute left-1/2 top-full z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-xs font-medium opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                        {isAr ? f.labelAr : f.label} · {f.confidence}%
                      </div>
                    </button>
                  ))}
                </div>

                {/* Layer toggles */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                    <Layers className="h-3.5 w-3.5" /> {t('aiAnalysis.layers')}:
                  </span>
                  {report.findings.map((f) => (
                    <button
                      key={f.type}
                      onClick={() => toggleLayer(f.type)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                        hiddenLayers.has(f.type) ? 'opacity-40' : 'opacity-100',
                      )}
                      style={{ borderColor: f.color + '60', background: f.color + '15' }}
                    >
                      {hiddenLayers.has(f.type) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      <span style={{ color: f.type === 'missing_tooth' ? '#000' : f.color }}>
                        {isAr ? f.labelAr : f.label}
                      </span>
                    </button>
                  ))}
                </div>

                {selectedFinding && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 rounded-lg border p-3"
                    style={{ borderColor: selectedFinding.color + '40', background: selectedFinding.color + '08' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold" style={{ color: selectedFinding.color }}>
                          {isAr ? selectedFinding.labelAr : selectedFinding.label}
                        </p>
                        {selectedFinding.toothNumber && (
                          <p className="text-xs text-muted-foreground">{t('aiAnalysis.toothNumber')}: {selectedFinding.toothNumber}</p>
                        )}
                      </div>
                      <Badge style={{ background: RISK_COLORS[selectedFinding.severity] + '20', color: RISK_COLORS[selectedFinding.severity] }}>
                        {selectedFinding.severity}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">{isAr ? selectedFinding.descriptionAr : selectedFinding.description}</p>
                    {selectedFinding.differentialDiagnosis && (
                      <p className="mt-1 text-xs"><strong>{t('aiAnalysis.differentialDx')}:</strong> {selectedFinding.differentialDiagnosis}</p>
                    )}
                    {selectedFinding.recommendedTreatment && (
                      <p className="mt-1 text-xs"><strong>{t('aiAnalysis.recommendedTreatment')}:</strong> {selectedFinding.recommendedTreatment}</p>
                    )}
                    {selectedFinding.nextStep && (
                      <p className="mt-1 text-xs"><strong>{t('aiAnalysis.nextStep')}:</strong> {selectedFinding.nextStep}</p>
                    )}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Score cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            <ScoreCard icon={Activity} label={t('aiAnalysis.imageQuality')} value={`${report.imageQualityScore}%`} color="text-accent" />
            <ScoreCard icon={TrendingUp} label={t('aiAnalysis.confidence')} value={`${report.confidenceScore}%`} color="text-primary" />
            <ScoreCard icon={ShieldAlert} label={t('aiAnalysis.riskLevel')} value={report.riskLevel} color="text-destructive" />
          </div>

          {/* Detailed findings table */}
          <Card>
            <CardHeader><CardTitle className="text-base">{t('aiAnalysis.detailedReport')}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {report.findings.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">{t('aiAnalysis.noFindings')}</p>
              ) : (
                report.findings.map((f, i) => <FindingRow key={f.id} finding={f} index={i} isAr={isAr} />)
              )}
            </CardContent>
          </Card>

          {/* Recommendations + Treatment plan + Urgency */}
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="text-base">{t('aiAnalysis.recommendations')}</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-success/20 text-xs font-bold text-success flex items-center justify-center">{i + 1}</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-base">{t('aiAnalysis.urgency')}</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ background: URGENCY_COLORS[report.urgencyLevel] }} />
                  <span className="text-sm font-medium capitalize">{report.urgencyLevel}</span>
                </div>
                {report.suggestedNextAppointment && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {t('aiAnalysis.nextAppointment')}: {report.suggestedNextAppointment}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => generateAIReportPDF(report, patientName)} variant="outline">
              <FileDown className="mr-2 h-4 w-4" /> {t('aiAnalysis.downloadPDF')}
            </Button>
            <Button onClick={() => window.print()} variant="outline">
              <Printer className="mr-2 h-4 w-4" /> {t('aiAnalysis.printReport')}
            </Button>
            <Button onClick={() => saveMutation.mutate(report)} disabled={saved || saveMutation.isPending}>
              {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              {saved ? t('aiAnalysis.savedToHistory') : t('aiAnalysis.saveToHistory')}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}

function ScoreCard({ icon: Icon, label, value, color }: { icon: typeof Activity; label: string; value: string; color: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className={cn('rounded-lg bg-muted p-2.5', color)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-lg font-bold capitalize">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function FindingRow({ finding, index, isAr }: { finding: AIFinding; index: number; isAr: boolean }) {
  const { t } = useTranslation();
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-start gap-3">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm"
          style={{ background: finding.color + '90', color: finding.type === 'missing_tooth' ? '#000' : '#fff' }}
        >
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium" style={{ color: finding.color }}>{isAr ? finding.labelAr : finding.label}</p>
            {finding.toothNumber && <Badge variant="outline" className="text-[10px]">{t('aiAnalysis.toothNumber')} {finding.toothNumber}</Badge>}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{isAr ? finding.descriptionAr : finding.description}</p>
          <div className="mt-2 grid gap-1.5 text-xs sm:grid-cols-2">
            {finding.differentialDiagnosis && <div><strong className="text-muted-foreground">{t('aiAnalysis.differentialDx')}:</strong> {finding.differentialDiagnosis}</div>}
            {finding.recommendedTreatment && <div><strong className="text-muted-foreground">{t('aiAnalysis.recommendedTreatment')}:</strong> {finding.recommendedTreatment}</div>}
            {finding.clinicalNotes && <div><strong className="text-muted-foreground">{t('aiAnalysis.clinicalNotes')}:</strong> {finding.clinicalNotes}</div>}
            {finding.riskAssessment && <div><strong className="text-muted-foreground">{t('aiAnalysis.riskAssessment')}:</strong> {finding.riskAssessment}</div>}
            {finding.nextStep && <div><strong className="text-muted-foreground">{t('aiAnalysis.nextStep')}:</strong> {finding.nextStep}</div>}
            {finding.priority && <div><strong className="text-muted-foreground">{t('aiAnalysis.priority')}:</strong> {finding.priority}</div>}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full" style={{ width: `${finding.confidence}%`, background: finding.color }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">{finding.confidence}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
