import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { Accept: 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('talentarc-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject({ title: 'Request Timeout', message: 'The server is taking too long. Please try again.' });
    }
    if (error.response) {
      const { status, data } = error.response;
      if (status === 413) {
        return Promise.reject({ title: 'File Too Large', message: 'Maximum file size is 10 MB.' });
      }
      if (status === 400) {
        return Promise.reject({ title: 'Invalid File', message: data?.error || 'Could not process this file.' });
      }
      if (status === 415) {
        return Promise.reject({ title: 'Unsupported Format', message: 'Please upload a PDF or DOCX file.' });
      }
      if (status === 401) {
        try { localStorage.removeItem('talentarc-token'); } catch {}
        return Promise.reject({ title: 'Session Expired', message: 'Please sign in again.' });
      }
      return Promise.reject({ title: 'Server Error', message: 'Something went wrong. Please try again.' });
    }
    if (error.message?.includes('Network Error')) {
      return Promise.reject({ title: 'Network Error', message: 'Could not connect to the server. Check your connection.' });
    }
    return Promise.reject({ title: 'Unexpected Error', message: error.message || 'An unexpected error occurred.' });
  }
);

export async function analyzeResume(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await apiClient.post('/resume/analyze', formData);
  if (!data.success) throw { title: 'Analysis Failed', message: data.error || 'Unknown error' };
  return data.data;
}

/**
 * Lightweight resume parse for assessment creation — only extracts text + skills.
 * Uses /resume/upload (no LLM call) so it is fast and reliable.
 */
export async function parseResumeForAssessment(file) {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await apiClient.post('/resume/upload', formData);
  if (!data.success) throw new Error(data.error || 'Could not parse resume');
  return data.data; // { fileName, fileType, normalizedText, structured, rawLength, ... }
}

export async function matchResumeToJD(file, jdText, jdFile) {
  const formData = new FormData();
  formData.append('resume', file);
  if (jdText && typeof jdText === 'string' && jdText.trim()) {
    formData.append('jdText', jdText);
  } else if (jdFile) {
    formData.append('jdFile', jdFile);
  }
  const { data } = await apiClient.post('/jd/match', formData);
  if (!data.success) throw { title: 'Matching Failed', message: data.error || 'Unknown error' };
  return data.data;
}

export async function getMe() {
  const { data } = await apiClient.get('/auth/me');
  return data;
}

export async function logout() {
  const { data } = await apiClient.post('/auth/logout');
  return data;
}

export async function getReports(type) {
  const params = type ? { type } : {};
  const { data } = await apiClient.get('/reports', { params });
  return data;
}

export async function getReport(id) {
  const { data } = await apiClient.get(`/reports/${id}`);
  return data;
}

export async function claimReport(tempUuid) {
  const { data } = await apiClient.post('/reports/claim', { tempUuid });
  return data;
}

export async function deleteReport(id) {
  const { data } = await apiClient.delete(`/reports/${id}`);
  return data;
}

export async function createAssessment(params) {
  const { data } = await apiClient.post('/assessments', params);
  return data;
}

export async function submitAssessment(id, answers) {
  const { data } = await apiClient.post(`/assessments/${id}/submit`, { answers });
  return data;
}

export async function getAssessment(id) {
  const { data } = await apiClient.get(`/assessments/${id}`);
  return data;
}

export async function getUserAssessments() {
  const { data } = await apiClient.get('/assessments');
  return data;
}

export async function updateFullscreenViolations(id) {
  const { data } = await apiClient.post(`/assessments/${id}/violations`);
  return data;
}

export async function deleteAssessment(id) {
  const { data } = await apiClient.delete(`/assessments/${id}`);
  return data;
}

export default apiClient;
