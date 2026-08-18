import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { GitCompare, X, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { queries, queryKeys } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { cn } from '@/lib/utils';

interface XrayCompareProps {
  patientId: string;
}

export function XrayCompare({ patientId }: XrayCompareProps) {
  const { t } = useTranslation();
  const [imageAId, setImageAId] = useState('');
  const [imageBId, setImageBId] = useState('');

  const { data: images = [] } = useQuery({
    queryKey: queryKeys.radiology(patientId),
    queryFn: () => queries.radiology.listByPatient(patientId),
  });

  const imageA = images.find((i) => i.id === imageAId);
  const imageB = images.find((i) => i.id === imageBId);
  const canCompare = imageA && imageB && imageA.id !== imageB.id;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <GitCompare className="h-5 w-5 text-primary" /> {t('aiAnalysis.compare')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-xs">{t('aiAnalysis.imageA')}</Label>
            <Select value={imageAId} onValueChange={setImageAId}>
              <SelectTrigger><SelectValue placeholder={t('aiAnalysis.selectTwoImages')} /></SelectTrigger>
              <SelectContent>
                {images.map((img) => (
                  <SelectItem key={img.id} value={img.id}>
                    {img.imageType} — {formatDate(img.createdAt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-xs">{t('aiAnalysis.imageB')}</Label>
            <Select value={imageBId} onValueChange={setImageBId}>
              <SelectTrigger><SelectValue placeholder={t('aiAnalysis.selectTwoImages')} /></SelectTrigger>
              <SelectContent>
                {images.map((img) => (
                  <SelectItem key={img.id} value={img.id}>
                    {img.imageType} — {formatDate(img.createdAt)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {canCompare && (
          <div className="grid gap-4 sm:grid-cols-2">
            <ComparisonImage label={t('aiAnalysis.imageA')} image={imageA!} />
            <ComparisonImage label={t('aiAnalysis.imageB')} image={imageB!} />
          </div>
        )}

        {!canCompare && images.length < 2 && (
          <p className="py-6 text-center text-sm text-muted-foreground">
            {t('aiAnalysis.selectTwoImages')}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function ComparisonImage({ label, image }: { label: string; image: { imageUrl: string; imageType: string; createdAt: string; imageName: string } }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium">{label}</span>
        <span className="text-xs text-muted-foreground">{image.imageType} · {formatDate(image.createdAt)}</span>
      </div>
      <div className="overflow-hidden rounded-lg border-2" style={{ background: '#0a0a0a' }}>
        <img src={image.imageUrl} alt={image.imageName} className="w-full" />
      </div>
    </div>
  );
}
