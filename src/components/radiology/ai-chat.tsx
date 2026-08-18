import { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Loader2, Trash2, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { queries, queryKeys } from '@/lib/api';
import { formatCurrency, formatDate, appointmentStatusMeta, calculateAge } from '@/lib/format';
import { cn } from '@/lib/utils';
import type { Patient, ToothRecord } from '@/types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AIChatProps {
  patient: Patient;
}

export function AIChat({ patient }: AIChatProps) {
  const { t } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { data: appointments = [] } = useQuery({
    queryKey: queryKeys.appointments,
    queryFn: () => queries.appointments.list(),
  });
  const { data: treatments = [] } = useQuery({
    queryKey: queryKeys.treatments(patient.id),
    queryFn: () => queries.treatments.listByPatient(patient.id),
  });
  const { data: invoices = [] } = useQuery({
    queryKey: queryKeys.invoices,
    queryFn: () => queries.invoices.list(),
  });
  const { data: teeth = [] } = useQuery({
    queryKey: queryKeys.teeth(patient.id),
    queryFn: () => queries.teeth.listByPatient(patient.id),
  });

  const patientAppts = appointments.filter((a) => a.patientId === patient.id);
  const patientInvoices = invoices.filter((i) => i.patientId === patient.id);
  const outstandingBalance = patientInvoices.reduce((s, i) => s + (i.total - i.paidAmount), 0);
  const affectedTeeth = teeth.filter((t: ToothRecord) => t.status !== 'healthy');
  const pendingTreatments = treatments.filter((t: { status: string; name: string; progress: number }) => t.status === 'planned' || t.status === 'in_progress');

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const suggestedQuestions = [
    t('aiChat.question1'),
    t('aiChat.question2'),
    t('aiChat.question3'),
    t('aiChat.question4'),
    t('aiChat.question5'),
  ];

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes('medical') || q.includes('history') || q.includes('summar')) {
      const conditions: string[] = [];
      if (patient.allergies) conditions.push(`Allergies: ${patient.allergies}`);
      if (patient.diabetes) conditions.push('Diabetes');
      if (patient.heartDisease) conditions.push('Heart disease');
      if (patient.smoking) conditions.push('Smoking');
      if (patient.bloodPressure) conditions.push(`Blood pressure: ${patient.bloodPressure}`);
      if (patient.currentMedications) conditions.push(`Medications: ${patient.currentMedications}`);
      const age = calculateAge(patient.dateOfBirth);
      return `Patient ${patient.firstName} ${patient.lastName}${age ? `, ${age} years old` : ''}.\nMedical conditions: ${conditions.length > 0 ? conditions.join(', ') : 'None reported'}.\nEmergency contact: ${patient.emergencyContactName || 'Not set'}.`;
    }

    if (q.includes('pending') || q.includes('treatment')) {
      if (pendingTreatments.length === 0) return 'No pending treatments for this patient.';
      return `Pending treatments:\n${pendingTreatments.map((t: { name: string; status: string; progress: number }) => `• ${t.name} (${t.status}, ${t.progress}% complete)`).join('\n')}`;
    }

    if (q.includes('allerg')) {
      return patient.allergies ? `This patient has the following allergies: ${patient.allergies}. Please review before any procedure.` : 'No known allergies recorded for this patient.';
    }

    if (q.includes('dental') || q.includes('chart') || q.includes('tooth')) {
      if (affectedTeeth.length === 0) return 'The dental chart shows all teeth are healthy with no recorded issues.';
      return `Dental chart shows ${affectedTeeth.length} affected teeth:\n${affectedTeeth.map((t: ToothRecord) => `• Tooth ${t.toothNumber}: ${t.status}${t.diagnosis ? ` (${t.diagnosis})` : ''}`).join('\n')}`;
    }

    if (q.includes('balance') || q.includes('outstanding') || q.includes('invoice') || q.includes('payment')) {
      return `Outstanding balance: ${formatCurrency(outstandingBalance)} across ${patientInvoices.filter((i) => i.status !== 'paid').length} unpaid invoices. Total billed: ${formatCurrency(patientInvoices.reduce((s, i) => s + i.total, 0))}.`;
    }

    if (q.includes('appointment')) {
      if (patientAppts.length === 0) return 'No appointments on record.';
      const upcoming = patientAppts.filter((a) => new Date(a.startTime) > new Date());
      if (upcoming.length > 0) {
        return `Upcoming appointments:\n${upcoming.map((a) => `• ${formatDate(a.startTime)} at ${a.startTime.split('T')[1]?.slice(0, 5)} (${a.status})`).join('\n')}`;
      }
      return `Last appointment: ${formatDate(patientAppts[0]?.startTime)} (${patientAppts[0]?.status}). No upcoming appointments scheduled.`;
    }

    return `I can help with questions about ${patient.firstName}'s medical history, dental chart, treatments, invoices, and appointments. Try asking about allergies, pending treatments, or the outstanding balance.`;
  };

  const handleSend = (text?: string) => {
    const message = text ?? input;
    if (!message.trim()) return;

    setMessages((prev) => [...prev, { role: 'user', content: message }]);
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const response = generateResponse(message);
      setMessages((prev) => [...prev, { role: 'assistant', content: response }]);
      setThinking(false);
    }, 1200);
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="rounded-xl bg-primary/15 p-2.5"><Sparkles className="h-5 w-5 text-primary" /></div>
          <div>
            <p className="text-sm font-semibold">{t('aiChat.title')}</p>
            <p className="text-xs text-muted-foreground">{t('aiChat.subtitle')}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bot className="h-5 w-5 text-primary" /> {t('aiChat.title')}
          </CardTitle>
          {messages.length > 0 && (
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <Trash2 className="mr-1 h-3.5 w-3.5" /> {t('aiChat.clearChat')}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {/* Messages */}
          {messages.length === 0 && !thinking ? (
            <div className="space-y-3">
              <p className="text-xs font-medium text-muted-foreground">{t('aiChat.suggestedQuestions')}</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(q)}
                    className="rounded-lg border p-3 text-left text-sm transition-colors hover:border-primary/40 hover:bg-primary/5"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div ref={scrollRef} className="max-h-[400px] space-y-3 overflow-y-auto scrollbar-thin pr-2">
              <AnimatePresence>
                {messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-2', msg.role === 'user' && 'flex-row-reverse')}
                  >
                    <div className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      msg.role === 'assistant' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
                    )}>
                      {msg.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      'max-w-[80%] rounded-lg p-3 text-sm whitespace-pre-line',
                      msg.role === 'assistant' ? 'bg-muted' : 'bg-primary text-primary-foreground',
                    )}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 rounded-lg bg-muted p-3">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-muted-foreground">{t('aiChat.thinking')}</span>
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {/* Input */}
          <div className="mt-4 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={t('aiChat.placeholder')}
              className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button onClick={() => handleSend()} disabled={thinking || !input.trim()}>
              {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">{t('aiChat.disclaimer')}</p>
        </CardContent>
      </Card>
    </div>
  );
}
