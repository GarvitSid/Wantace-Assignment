import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Retrieve the API URL from environment variables, defaulting to empty string for relative paths in production
const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export default function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('leads');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return navigate('/admin/login');

    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const [leadsRes, configRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/admin/leads`, { headers }),
        fetch(`${API_BASE_URL}/api/admin/config`, { headers })
      ]);

      if (leadsRes.status === 401 || configRes.status === 401) {
        localStorage.removeItem('adminToken');
        return navigate('/admin/login');
      }

      setLeads(await leadsRes.json());
      setConfig(await configRes.json());
    } catch (error) {
      console.error('Failed to load admin data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigSave = async () => {
    setSaving(true);
    const token = localStorage.getItem('adminToken');
    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(config)
      });
      
      if (!response.ok) throw new Error('Save failed');
      
      alert('Configuration Saved! The public estimator is instantly updated with a new version.');
      fetchAdminData(); 
    } catch (error) {
      alert('Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/admin/login');
  };

  if (loading) return <div className="p-10 text-center">Loading Owner Panel...</div>;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar */}
      <nav className="bg-gray-900 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-bold">Northline Owner Panel</h1>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('leads')} className={`px-4 py-2 rounded ${activeTab === 'leads' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>Leads</button>
          <button onClick={() => setActiveTab('config')} className={`px-4 py-2 rounded ${activeTab === 'config' ? 'bg-blue-600' : 'hover:bg-gray-700'}`}>Pricing & Config</button>
          <button onClick={handleLogout} className="px-4 py-2 bg-red-600 rounded hover:bg-red-700">Logout</button>
        </div>
      </nav>

      <div className="p-8 max-w-7xl mx-auto">
        
        {/* LEADS TAB */}
        {activeTab === 'leads' && (
          <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimate Range</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details (Raw Answers)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leads.map((lead, index) => (
                  <tr key={lead.id || lead._id || index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(lead.createdAt || lead.captured_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                      <div className="text-sm text-gray-500">{lead.phone}</div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        ${lead.estimate_low} - ${lead.estimate_high}
                      </span>
                      <div className="text-xs text-gray-400 mt-1">Config v{lead.config_version}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {lead.answers && Object.entries(lead.answers).map(([key, val]) => (
                        <div key={key}><span className="font-medium">{key}:</span> {val}</div>
                      ))}
                    </td>
                  </tr>
                ))}
                {leads.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500">No leads captured yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* CONFIG TAB */}
        {activeTab === 'config' && config && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Pricing Configuration</h2>
                  <p className="text-gray-500">Currently active version: {config.config_version}</p>
                </div>
                <button 
                  onClick={handleConfigSave}
                  disabled={saving}
                  className="px-6 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                >
                  {saving ? 'Saving...' : 'Save & Publish Changes'}
                </button>
              </div>

              {/* Global Modifiers */}
              {config.modifiers && (
                <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">Global Modifiers</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Waste Factor (Decimal)</label>
                      <input 
                        type="number" step="0.01"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
                        value={config.modifiers.waste_factor}
                        onChange={(e) => setConfig({
                          ...config, 
                          modifiers: { ...config.modifiers, waste_factor: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Permit Flat Fee ($)</label>
                      <input 
                        type="number" step="1"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
                        value={config.modifiers.permit_flat_fee}
                        onChange={(e) => setConfig({
                          ...config, 
                          modifiers: { ...config.modifiers, permit_flat_fee: Number(e.target.value) }
                        })}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Range Spread (%)</label>
                      <input 
                        type="number" step="1"
                        className="mt-1 block w-full p-2 border border-gray-300 rounded focus:ring-blue-500"
                        value={config.modifiers.range_spread_pct}
                        onChange={(e) => setConfig({
                          ...config, 
                          modifiers: { ...config.modifiers, range_spread_pct: Number(e.target.value) }
                        })}
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Questions Array */}
              <h3 className="text-lg font-bold text-gray-800 mb-4">Estimator Questions</h3>
              <div className="space-y-8">
                {config.questions.map((q, qIndex) => (
                  <div key={qIndex} className={`p-4 border rounded-lg transition-colors ${q.active ? 'border-gray-200' : 'border-red-200 bg-red-50 opacity-75'}`}>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                      <input 
                        className="text-lg font-bold w-full md:w-1/2 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 bg-white"
                        value={q.label}
                        onChange={(e) => {
                          const newConfig = {...config};
                          newConfig.questions[qIndex].label = e.target.value;
                          setConfig(newConfig);
                        }}
                      />
                      <label className="flex items-center gap-2 cursor-pointer text-sm font-medium bg-white p-2 rounded border">
                        <input 
                          type="checkbox" 
                          checked={q.active}
                          onChange={(e) => {
                            const newConfig = {...config};
                            newConfig.questions[qIndex].active = e.target.checked;
                            setConfig(newConfig);
                          }}
                          className="w-5 h-5 text-blue-600 focus:ring-blue-500 rounded"
                        />
                        {q.active ? 'Question is Active' : 'Question is Hidden'}
                      </label>
                    </div>

                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                        {q.options.map((opt, oIndex) => (
                          <div key={oIndex} className="bg-white p-4 rounded border border-gray-200 text-sm flex flex-col gap-3 shadow-sm">
                            
                            {/* Editable Option Label */}
                            <div className="flex items-center justify-between border-b pb-2">
                               <input 
                                className="font-semibold text-gray-800 w-full bg-transparent border-none focus:ring-0 p-0"
                                value={opt.label}
                                onChange={(e) => {
                                  const newConfig = {...config};
                                  newConfig.questions[qIndex].options[oIndex].label = e.target.value;
                                  setConfig(newConfig);
                                }}
                              />
                            </div>
                            
                            <div className="flex flex-wrap gap-4 items-center">
                              {opt.rate_per_sqft !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Rate/sqft: $</span>
                                  <input 
                                    type="number" step="0.01"
                                    className="w-24 p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    value={opt.rate_per_sqft}
                                    onChange={(e) => {
                                      const newConfig = {...config};
                                      newConfig.questions[qIndex].options[oIndex].rate_per_sqft = Number(e.target.value);
                                      setConfig(newConfig);
                                    }}
                                  />
                                </div>
                              )}
                              
                              {opt.multiplier !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Multiplier:</span>
                                  <input 
                                    type="number" step="0.01"
                                    className="w-24 p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    value={opt.multiplier}
                                    onChange={(e) => {
                                      const newConfig = {...config};
                                      newConfig.questions[qIndex].options[oIndex].multiplier = Number(e.target.value);
                                      setConfig(newConfig);
                                    }}
                                  />
                                </div>
                              )}

                              {opt.tear_off_per_sqft !== undefined && (
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">Tear-off/sqft: $</span>
                                  <input 
                                    type="number" step="0.01"
                                    className="w-24 p-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                    value={opt.tear_off_per_sqft}
                                    onChange={(e) => {
                                      const newConfig = {...config};
                                      newConfig.questions[qIndex].options[oIndex].tear_off_per_sqft = Number(e.target.value);
                                      setConfig(newConfig);
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}