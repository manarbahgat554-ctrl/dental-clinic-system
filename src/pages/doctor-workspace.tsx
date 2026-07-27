import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Stethoscope,
  User,
  Activity,
  ClipboardList,
  FileText,
  Sparkles,
  XCircle,
  CheckCircle2,
  ScanLine,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { queries, queryKeys } from '@/lib/api';
import { initials } from '@/lib/format';
import { PatientDentalChart } from '@/components/dental/patient-dental-chart';
import { ImageGallery } from '@/components/radiology/image-gallery';
import { cn } from '@/lib/utils';
import type { Patient } from '@/types';

const aiSuggestions = [
  { id: 1, tooth: 16, finding: 'Possible interproximal caries', confidence: 87, status: 'pending' },
  { id: 2, tooth: 26, finding: 'Periapical radiolucency', confidence: 74, status: 'pending' },
  { id: 3, tooth: 36, finding: 'Bone loss around distal root', confidence: 82, status: 'pending' },
  { id: 4, tooth: 11, finding: 'Root fracture suspected', confidence: 61, status: 'pending' },
];

export function DoctorWorkspacePage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [suggestions, setSuggestions] = useState(aiSuggestions);

  const { data: patients = [] } = useQuery({
    queryKey: queryKeys.patients,
    queryFn: () => queries.patients.list(),
  });

  const handleSuggestion = (id: number, accept: boolean) => {
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: accept ? 'accepted' : 'rejected' } : s)),
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Doctor Workspace"
        description="Your advanced clinical environment for examinations and treatment planning"
      />

      {!selectedPatient ? (
        <PatientPicker patients={patients} onSelect={setSelectedPatient} />
      ) : (
        <div className="space-y-6">
          {/* Patient context bar */}
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="overflow-hidden">
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                    <span className="text-sm font-bold text-primary">
                      {initials(selectedPatient.first_name, selectedPatient.last_name)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">{selectedPatient.first_name} {selectedPatient.last_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedPatient.phone} · {selectedPatient.blood_group || 'Blood —'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setSelectedPatient(null)}>
                  Change Patient
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          <Tabs defaultValue="chart">
            <TabsList className="grid w-full grid-cols-2 sm:flex sm:w-auto">
              <TabsTrigger value="chart"><Activity className="mr-1.5 h-4 w-4" />Dental Chart</TabsTrigger>
              <TabsTrigger value="exam"><ClipboardList className="mr-1.5 h-4 w-4" />Examination</TabsTrigger>
              <TabsTrigger value="radiology"><ScanLine className="mr-1.5 h-4 w-4" />Radiology</TabsTrigger>
              <TabsTrigger value="ai"><Sparkles className="mr-1.5 h-4 w-4" />AI Assistant</TabsTrigger>
            </TabsList>

            <TabsContent value="chart">
              <PatientDentalChart patientId={selectedPatient.id} />
            </TabsContent>

            <TabsContent value="exam" className="space-y-4">
              <ClinicalExamination />
            </TabsContent>

            <TabsContent value="radiology" className="space-y-4">
              <ImageGallery patientId={selectedPatient.id} patientName={`${selectedPatient.first_name} ${selectedPatient.last_name}`} />
            </TabsContent>

            <TabsContent value="ai" className="space-y-4">
              <AIAssistant suggestions={suggestions} onSuggestion={handleSuggestion} />
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}

function PatientPicker({ patients, onSelect }: { patients: Patient[]; onSelect: (p: Patient) => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5 text-primary" /> Select a patient to begin
        </CardTitle>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            No patients available. Add patients first.
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
                  <span className="text-xs font-bold text-primary">{initials(p.first_name, p.last_name)}</span>
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{p.first_name} {p.last_name}</p>
                  <p className="truncate text-xs text-muted-foreground">{p.phone || p.email || 'No contact'}</p>
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
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle className="text-base">Chief Complaint & History</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <Field label="Chief Complaint" placeholder="e.g. Pain in upper right molar" />
          <Field label="History of Present Illness" textarea placeholder="Duration, severity, triggers..." />
          <Field label="Diagnosis" placeholder="Primary diagnosis" />
          <Field label="Differential Diagnosis" textarea placeholder="Alternative diagnoses" />
          <Field label="Treatment Plan" textarea placeholder="Planned procedures" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Extra-Oral Examination</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field label="Face Symmetry" placeholder="Symmetric / Asymmetric" />
            <Field label="TMJ" placeholder="Normal / Clicking / Pain" />
            <Field label="Lymph Nodes" placeholder="Normal / Enlarged" />
            <Field label="Extra-Oral Notes" textarea placeholder="Observations" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Intra-Oral Examination</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <Field label="Tongue" placeholder="Normal / Coated / Lesion" />
            <Field label="Palate" placeholder="Normal" />
            <Field label="Floor of Mouth" placeholder="Normal" />
            <Field label="Buccal Mucosa" placeholder="Normal" />
            <Field label="Gingiva" placeholder="Healthy / Inflamed" />
          </CardContent>
        </Card>
      </div>

      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">Periodontal & Occlusion</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <Field label="Pocket Depth" placeholder="mm" />
          <Field label="Mobility" placeholder="Grade 0-3" />
          <Field label="Bleeding" placeholder="Yes / No" />
          <Field label="Plaque Index" placeholder="0-3" />
          <Field label="Calculus Index" placeholder="0-3" />
          <Field label="Furcation" placeholder="None / Grade I-III" />
          <Field label="Overbite" placeholder="mm" />
          <Field label="Overjet" placeholder="mm" />
          <Field label="Crossbite" placeholder="None / Ant / Post" />
          <Field label="Open Bite" placeholder="Yes / No" />
          <Field label="Deep Bite" placeholder="Yes / No" />
          <Field label="Midline" placeholder="Centered / Shift" />
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, placeholder, textarea }: { label: string; placeholder: string; textarea?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {textarea ? (
        <Textarea placeholder={placeholder} rows={2} />
      ) : (
        <Input placeholder={placeholder} />
      )}
    </div>
  );
}

function AIAssistant({
  suggestions,
  onSuggestion,
}: {
  suggestions: typeof aiSuggestions;
  onSuggestion: (id: number, accept: boolean) => void;
}) {
  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-primary/15 p-2.5">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">AI Radiology Assistant</p>
            <p className="text-xs text-muted-foreground">
              Analysis based on uploaded X-rays. Review each suggestion and accept or reject.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {suggestions.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className={cn(
              'transition-all',
              s.status === 'accepted' && 'border-success/40 bg-success/5',
              s.status === 'rejected' && 'border-destructive/40 bg-destructive/5 opacity-60',
            )}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/15 font-bold text-warning">
                  {s.tooth}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{s.finding}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Tooth {s.tooth}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <div className="flex items-center gap-1">
                      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${s.confidence}%` }} />
                      </div>
                      <span className="text-xs font-medium text-primary">{s.confidence}%</span>
                    </div>
                  </div>
                </div>
                {s.status === 'pending' ? (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 text-destructive" onClick={() => onSuggestion(s.id, false)}>
                      <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
                    </Button>
                    <Button size="sm" className="h-8" onClick={() => onSuggestion(s.id, true)}>
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Accept
                    </Button>
                  </div>
                ) : (
                  <Badge variant={s.status === 'accepted' ? 'default' : 'secondary'} className="capitalize">
                    {s.status}
                  </Badge>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
