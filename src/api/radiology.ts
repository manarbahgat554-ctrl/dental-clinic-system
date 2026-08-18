import { api } from './axios';
import type { AxiosProgressEvent } from 'axios';
import type { RadiologyImage, AIChatMessage, AIReport } from '@/types';

export interface UploadProgress {
  progress: number;
}

export const radiologyApi = {
  list: (patientId: string) =>
    api.get<RadiologyImage[]>('/radiology', { params: { patientId } }).then((r) => r.data),

  get: (id: string) =>
    api.get<RadiologyImage>(`/radiology/${id}`).then((r) => r.data),

  upload: (
    file: File,
    metadata: { patientId: string; imageType: string; toothNumber?: number; notes?: string },
    onProgress?: (pct: number) => void,
  ): Promise<RadiologyImage> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('patientId', metadata.patientId);
    formData.append('imageType', metadata.imageType);
    if (metadata.toothNumber) formData.append('toothNumber', String(metadata.toothNumber));
    if (metadata.notes) formData.append('notes', metadata.notes);

    return api
      .post<RadiologyImage>('/radiology/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e?: AxiosProgressEvent) => {
          if (!onProgress || !e) return;
          if (typeof e.total === 'number' && typeof e.loaded === 'number') {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        },
      })
      .then((r) => r.data);
  },

  delete: (id: string) =>
    api.delete(`/radiology/${id}`).then((r) => r.data),

  // AI Chat
  listChatMessages: (radiologyImageId: string) =>
    api.get<AIChatMessage[]>('/radiology/chat/messages', { params: { radiologyImageId } }).then((r) => r.data),

  createChatMessage: (data: { patientId: string; radiologyImageId: string; role: string; content: string }) =>
    api.post<AIChatMessage>('/radiology/chat/messages', data).then((r) => r.data),

  deleteChatMessages: (radiologyImageId: string) =>
    api.delete('/radiology/chat/messages', { data: { radiologyImageId } }).then((r) => r.data),

  // AI Reports
  listReports: (patientId: string) =>
    api.get<AIReport[]>('/radiology/reports', { params: { patientId } }).then((r) => r.data),

  createReport: (data: Partial<AIReport>) =>
    api.post<AIReport>('/radiology/reports', data).then((r) => r.data),
};
