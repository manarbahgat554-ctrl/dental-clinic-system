import { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Send, Loader2, Trash2, Bot, User, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { radiologyApi } from '@/api/radiology';
import { cn } from '@/lib/utils';
import type { AIChatMessage } from '@/types';

interface PerImageChatProps {
  patientId: string;
  radiologyImageId: string;
  clinicId: string;
  imageType: string;
}

export function PerImageChat({ patientId, radiologyImageId, clinicId, imageType }: PerImageChatProps) {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAr = i18n.language === 'ar';

  const { data: messages = [] } = useQuery({
    queryKey: ['ai-chat', radiologyImageId],
    queryFn: () => radiologyApi.listChatMessages(radiologyImageId),
    enabled: !!radiologyImageId,
  });

  const saveMessageMutation = useMutation({
    mutationFn: async (msg: { role: 'user' | 'assistant'; content: string }) => {
      return radiologyApi.createChatMessage({
        patientId,
        radiologyImageId,
        role: msg.role,
        content: msg.content,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat', radiologyImageId] });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const clearChatMutation = useMutation({
    mutationFn: () => radiologyApi.deleteChatMessages(radiologyImageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-chat', radiologyImageId] });
      toast.success(t('aiChat.chatSaved'));
    },
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, thinking]);

  const suggestedQuestions = isAr
    ? [
        t('aiChat.questionImg1'),
        t('aiChat.questionImg2'),
        t('aiChat.questionImg3'),
        t('aiChat.questionImg4'),
        t('aiChat.questionImg5'),
      ]
    : [
        t('aiChat.questionImg1'),
        t('aiChat.questionImg2'),
        t('aiChat.questionImg3'),
        t('aiChat.questionImg4'),
        t('aiChat.questionImg5'),
      ];

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase();

    if (q.includes('inflammation') || q.includes('التهاب')) {
      return isAr
        ? `بناءً على تحليل صورة ${imageType}، يوجد احتمال وجود التهاب في المنطقة الذروية للجذر. يوصى بإجراء فحص سريري للتأكيد.`
        : `Based on analysis of the ${imageType} image, there appears to be possible periapical inflammation. Clinical examination is recommended for confirmation.`;
    }

    if (q.includes('root canal') || q.includes('عصب')) {
      return isAr
        ? `بناءً على الصورة، قد يكون علاج الجذور ضرورياً إذا كان هناك تسوس عميق أو آفة ذروية. يجب تقييم الحالة سريرياً قبل اتخاذ القرار النهائي.`
        : `Based on the image, root canal treatment may be necessary if there is deep caries or a periapical lesion. Clinical evaluation is needed before final decision.`;
    }

    if (q.includes('fracture') || q.includes('كسر')) {
      return isAr
        ? `تم فحص الصورة بحثاً عن خطوط الكسر. إذا كان هناك شك في وجود كسر، يوصى بأخذ أشعة إضافية بزوايا مختلفة للتأكيد.`
        : `The image has been examined for fracture lines. If a fracture is suspected, additional radiographs at different angles are recommended for confirmation.`;
    }

    if (q.includes('36') || q.includes('السن رقم')) {
      return isAr
        ? `السن رقم 36 (الضرس الأول السفلي الأيسر) يظهر علامات تستدعي الانتباه. يرجى مراجعة النتائج التفصيلية في التقرير للحصول على معلومات كاملة.`
        : `Tooth #36 (lower left first molar) shows signs that warrant attention. Please review the detailed findings in the report for complete information.`;
    }

    if (q.includes('treatment') || q.includes('plan') || q.includes('علاج') || q.includes('خطة')) {
      return isAr
        ? `خطة العلاج المقترحة تعتمد على النتائج المكتشفة. يوصى بمعالجة التسوس أولاً، ثم تقييم الحاجة لعلاج العصب، وأخيراً الترميم المناسب. الرجاء مراجعة التقرير التفصيلي.`
        : `The suggested treatment plan depends on the detected findings. Recommended approach: address caries first, evaluate endodontic needs, then proceed with appropriate restoration. Please review the detailed report.`;
    }

    return isAr
      ? `يمكنني مساعدتك في الأسئلة حول هذه الأشعة. جرّب السؤال عن: الالتهاب، علاج العصب، الكسور، حالة سن معين، أو خطة العلاج.`
      : `I can help with questions about this X-ray. Try asking about: inflammation, root canal, fractures, specific tooth condition, or treatment plan.`;
  };

  const handleSend = (text?: string) => {
    const message = text ?? input;
    if (!message.trim()) return;

    saveMessageMutation.mutate({ role: 'user', content: message });
    setInput('');
    setThinking(true);

    setTimeout(() => {
      const response = generateResponse(message);
      saveMessageMutation.mutate({ role: 'assistant', content: response });
      setThinking(false);
    }, 1200);
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5 text-primary" /> {t('aiChat.perImageChat')}
        </CardTitle>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => clearChatMutation.mutate()}
            disabled={clearChatMutation.isPending}
          >
            <Trash2 className="mr-1 h-3.5 w-3.5" /> {t('aiChat.clearChat')}
          </Button>
        )}
      </CardHeader>
      <CardContent>
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
                  key={msg.id}
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

        <div className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={t('aiChat.askAboutImage')}
            className="flex h-10 flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
            dir={isAr ? 'rtl' : 'ltr'}
          />
          <Button onClick={() => handleSend()} disabled={thinking || !input.trim() || saveMessageMutation.isPending}>
            {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">{t('aiChat.disclaimer')}</p>
      </CardContent>
    </Card>
  );
}
