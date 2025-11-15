import api from '../api';
import { Feedback, FeedbackForm, AnalyticsData } from '../types';

// --- Form Service ---

export const getAllForms = async (): Promise<FeedbackForm[]> => {
  const { data } = await api.get('/forms');
  return data;
};

export const getFormById = async (id: string): Promise<FeedbackForm> => {
  const { data } = await api.get(`/forms/${id}`);
  return data;
};

export const createForm = async (
  form: Omit<FeedbackForm, 'id' | 'createdAt'>
): Promise<FeedbackForm> => {
  const { data } = await api.post('/forms', form);
  return data;
};

export const updateForm = async (
  id: string,
  updates: Partial<FeedbackForm>
): Promise<FeedbackForm> => {
  const { data } = await api.patch(`/forms/${id}`, updates);
  return data;
};

export const deleteForm = async (id: string): Promise<boolean> => {
  await api.delete(`/forms/${id}`);
  return true;
};

// --- Feedback Service ---

export const submitFeedback = async (
  feedback: Omit<Feedback, 'id' | 'createdAt'>
): Promise<Feedback> => {
  const { data } = await api.post('/feedbacks', feedback);
  return data;
};

interface GetFeedbacksParams {
  searchQuery?: string;
  ratingFilter?: number | null;
  selectedFormId?: string;
}

export const getFilteredFeedbacks = async ({
  searchQuery,
  ratingFilter,
  selectedFormId,
}: GetFeedbacksParams): Promise<Feedback[]> => {
  
  const params = new URLSearchParams();
  
  if (selectedFormId && selectedFormId !== 'all') {
    params.append('formId', selectedFormId);
  }
  if (ratingFilter) {
    params.append('rating', String(ratingFilter));
  }
  if (searchQuery) {
    params.append('search', searchQuery);
  }

  const { data } = await api.get(`/feedbacks?${params.toString()}`);
  return data;
};

// --- Analytics Service ---

export const getAnalytics = async (
  selectedFormId: string
): Promise<AnalyticsData> => {
  const params = new URLSearchParams();
  if (selectedFormId && selectedFormId !== 'all') {
    params.append('formId', selectedFormId);
  }
  
  const { data } = await api.get(`/analytics?${params.toString()}`);
  return data;
};

// --- CSV Export (Stays on Frontend) ---

export const exportToCSV = (feedbacks: Feedback[]): string => {
  if (feedbacks.length === 0) return '';

  const headers = ['Name', 'Email', 'Message', 'Rating', 'Created At'];
  const rows = feedbacks.map((f) => [
    f.name,
    f.email,
    f.message.replace(/"/g, '""').replace(/,/g, ';'), // Handle quotes and commas
    f.rating.toString(),
    new Date(f.createdAt).toLocaleString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
  ].join('\n');

  return csvContent;
};