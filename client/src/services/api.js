// We point to the host, and explicitly add /api to the endpoints below
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const fetchConfig = async () => {
  // Notice we added /api/config here
  const response = await fetch(`${API_BASE_URL}/api/config`);
  if (!response.ok) throw new Error('Failed to load configuration');
  return response.json();
};

export const submitEstimate = async (payload) => {
  // Notice we added /api/estimate here
  const response = await fetch(`${API_BASE_URL}/api/estimate`, {
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