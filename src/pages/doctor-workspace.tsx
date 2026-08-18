import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  User,
  Activity,
  ClipboardList,
  ScanLine,
  Sparkles,
  MessageSquare,
  Box,
  GitCompare,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { queries, queryKeys } from '@/lib/api';
import { initials } from '@/lib/format';
import { PatientDentalChart } from '@/components/dental/patient-dental-chart';
import { ImageGallery } from '@/components/radiology/image-gallery';
import { AIAnalysis } from '@/components/radiology/ai-analysis';
import { AIChat } from '@/components/radiology/ai-chat';
import { XrayCompare } from '@/components/radiology/xray-compare';
import { DentalViewer3D } from '@/components/dental/dental-viewer-3d';
import type { Patient } from '@/types';

export function DoctorWorkspacePage() {
  const { t } = useTranslation();
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  const { data: patients = [] } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => queries.patients.list(),
  });

  return (
    <div className="space-y-6">
      <PageHeader title={t('workspace.title')} description={t('workspace.description')} />

      {!selectedPatient ? (
        <PatientPicker patients={patients} onSelect={setSelectedPatient} />
      ) : (
        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="overflow-hidden">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <span className="text-sm font-bold text-primary">
                      {initials(selectedPatient.firstName, selectedPatient.lastName)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedPatient.firstName} {selectedPatient.lastName}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedPatient.phone} · {selectedPatient.bloodGroup || '—'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                  {t('workspace.changePatient')}
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs defaultValue="chart">
            <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto sm:flex-wrap">
              <TabsTrigger value="chart"><Activity className="mr-1.5 h-4 w-4" />{t('workspace.dentalChart')}</TabsTrigger>
              <TabsTrigger value="3d"><Box className="mr-1.5 h-4 w-4" />3D Viewer</TabsTrigger>
              <TabsTrigger value="exam"><ClipboardList className="mr-1.5 h-4 w-4" />{t('workspace.examination')}</TabsTrigger>
              <TabsTrigger value="radiology"><ScanLine className="mr-1.5 h-4 w-4" />{t('workspace.radiology')}</TabsTrigger>
              <TabsTrigger value="ai"><Sparkles className="mr-1.5 h-4 w-4" />{t('workspace.aiAssistant')}</TabsTrigger>
              <TabsTrigger value="compare"><GitCompare className="mr-1.5 h-4 w-4" />{t('aiAnalysis.compare')}</TabsTrigger>
              <TabsTrigger value="chat"><MessageSquare className="mr-1.5 h-4 w-4" />{t('aiChat.title')}</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <PatientDentalChart patientId={selectedPatient.id} />
            </TabsContent>

            <TabsContent value="3d" className="space-y-4">
              <DentalViewer3D />
            </TabsContent>

            <TabsContent value="exam" className="space-y-4">
              <ClinicalExamination />
            </TabsContent>

            <TabsContent value="radiology" className="space-y-4">
              <ImageGallery patientId={selectedPatient.id} patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <AIAnalysis patientId={selectedPatient.id} patientName={`${selectedPatient.firstName} ${selectedPatient.lastName}`} />
            </TabsContent>

            <TabsContent value="compare" className="space-y-4">
              <XrayCompare patientId={selectedPatient.id} />
            </TabsContent>

            <TabsContent value="chat" className="space-y-4">
              <AIChat patient={selectedPatient} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function PatientPicker({ patients, onSelect }: { patients: Patient[]; onSelect: (p: Patient) => void }) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5 text-primary" /> {t('workspace.selectPatient')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {t('workspace.noPatientsAvailable')}
          </p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {patients.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                onClick={() => onSelect(p)}
                className="group flex items-center gap-3 rounded-lg border p-3 text-left transition-all hover:border-primary hover:bg-primary/5"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-xs font-bold text-primary">{initials(p.firstName, p.lastName)}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.firstName} {p.lastName}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.phone || p.email || '—'}</p>
                </div>
                <Stethoscope className="ml-auto h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </motion.button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ClinicalExamination() {
  const { t } = useTranslation();
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">{t('workspace.chiefComplaint')}</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label={t('workspace.chiefComplaint')} placeholder="e.g. Pain in upper right molar" />
          <Field label={t('workspace.historyPresentIllness')} textarea placeholder="Duration, severity, triggers..." />
          <Field label={t('workspace.diagnosis')} placeholder={t('workspace.diagnosis')} />
          <Field label={t('workspace.differentialDiagnosis')} textarea placeholder={t('workspace.differentialDiagnosis')} />
          <Field label={t('workspace.treatmentPlan')} textarea placeholder={t('workspace.treatmentPlan')} />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">{t('workspace.extraOralExam')}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field label={t('workspace.faceSymmetry')} placeholder="Symmetric / Asymmetric" />
            <Field label={t('workspace.tmj')} placeholder="Normal / Clicking / Pain" />
            <Field label={t('workspace.lymphNodes')} placeholder="Normal / Enlarged" />
            <Field label={t('common.notes')} textarea placeholder={t('common.notes')} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t('workspace.intraOralExam')}</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field label={t('workspace.tongue')} placeholder="Normal / Coated / Lesion" />
            <Field label={t('workspace.palate')} placeholder="Normal" />
            <Field label={t('workspace.floorOfMouth')} placeholder="Normal" />
            <Field label={t('workspace.buccalMucosa')} placeholder="Normal" />
            <Field label={t('workspace.gingiva')} placeholder="Healthy / Inflamed" />
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">{t('workspace.periodontalOcclusion')}</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Field label={t('workspace.pocketDepth')} placeholder="mm" />
          <Field label={t('workspace.mobility')} placeholder="Grade 0-3" />
          <Field label={t('workspace.bleeding')} placeholder={t('common.yes') + ' / ' + t('common.no')} />
          <Field label={t('workspace.plaqueIndex')} placeholder="0-3" />
          <Field label={t('workspace.calculusIndex')} placeholder="0-3" />
          <Field label={t('workspace.furcation')} placeholder="None / Grade I-III" />
          <Field label={t('workspace.overbite')} placeholder="mm" />
          <Field label={t('workspace.overjet')} placeholder="mm" />
          <Field label={t('workspace.crossbite')} placeholder="None / Ant / Post" />
          <Field label={t('workspace.openBite')} placeholder={t('common.yes') + ' / ' + t('common.no')} />
          <Field label={t('workspace.deepBite')} placeholder={t('common.yes') + ' / ' + t('common.no')} />
          <Field label={t('workspace.midline')} placeholder="Centered / Shift" />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, placeholder, textarea }: { label: string; placeholder: string; textarea?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {textarea ? <Textarea placeholder={placeholder} rows={2} /> : <Input placeholder={placeholder} />}
    </div>
  );
}
