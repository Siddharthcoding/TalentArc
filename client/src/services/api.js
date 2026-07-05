import axios from 'axios';

const apiClient = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: { Accept: 'application/json' },
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

export default apiClient;
