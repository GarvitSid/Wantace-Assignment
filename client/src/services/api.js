const API_BASE_URL = 'http://localhost:5000/api';

export const fetchConfig = async () => {
  const response = await fetch(`${API_BASE_URL}/config`);
  if (!response.ok) throw new Error('Failed to load configuration');
  return response.json();
};

export const submitEstimate = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/estimate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Failed to calculate estimate');
  
  return data;
};