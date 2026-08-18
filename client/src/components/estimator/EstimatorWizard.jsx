import React, { useState, useEffect } from 'react';
import QuestionField from '../dynamic/QuestionField';
import { fetchConfig, submitEstimate } from '../../services/api';
import { Link } from 'react-router-dom';

export default function EstimatorWizard() {
  const [config, setConfig] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [contact, setContact] = useState({ name: '', phone: '', email: '' });
  const [estimate, setEstimate] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const data = await fetchConfig();
        setConfig(data);
      } catch (err) {
        setError('Failed to load estimator configuration.');
      } finally {
        setLoading(false);
      }
    };
    loadConfig();
  }, []);

  const handleAnswerChange = (key, value) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
    setError(''); // Clear errors when user types
  };

  const handleNext = () => {
    const currentQuestion = config.questions[currentStep];
    
    // Strict Validation: Prevent skipping required questions
    if (currentQuestion.required && !answers[currentQuestion.key]) {
      setError('Please answer this question to continue.');
      return;
    }
    
    setError('');
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const result = await submitEstimate({
        ...contact,
        answers
      });
      setEstimate(result);
    } catch (err) {
      setError(err.message || 'Unable to calculate estimate. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center p-8 text-gray-500 text-lg">Loading estimator...</div>;
  if (error && !config) return <div className="text-center p-8 text-red-500 font-medium">{error}</div>;

  const isContactStep = currentStep === config.questions.length;
  
  // ----------------------------------------------------
  // View 1: The Final Estimate Result
  // ----------------------------------------------------
  if (estimate) {
    const formatCurrency = (amount) => 
      new Intl.NumberFormat('en-US', { style: 'currency', currency: config.business.currency || 'USD', maximumFractionDigits: 0 }).format(amount);

    return (
      <div className="max-w-lg mx-auto bg-white p-8 rounded-xl shadow-lg text-center border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Roof Estimate</h2>
        <p className="text-gray-500 mb-6">Based on the details provided for {config.business.name}</p>
        <div className="bg-blue-50 py-6 px-4 rounded-lg border border-blue-100 mb-6">
          <span className="text-4xl font-extrabold text-blue-700">
            {formatCurrency(estimate.estimate_low)} - {formatCurrency(estimate.estimate_high)}
          </span>
        </div>
        <p className="text-sm text-gray-400">Our team will contact you shortly at {contact.phone} to discuss your exact needs.</p>
      </div>
    );
  }

  // ----------------------------------------------------
  // View 2: The Wizard Form (Questions & Contact)
  // ----------------------------------------------------
  return (
    <div className="max-w-lg mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-md border border-gray-100">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">{config.business.name} Estimator</h2>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
            style={{ width: `${((currentStep) / (config.questions.length + 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">{error}</div>}

      {!isContactStep ? (
        // Dynamic Question Step
        <div className="animate-fade-in">
          <QuestionField 
            question={config.questions[currentStep]} 
            value={answers[config.questions[currentStep].key]} 
            onChange={handleAnswerChange} 
          />
          <div className="flex justify-between mt-8">
            <button 
              onClick={handleBack} 
              disabled={currentStep === 0}
              className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg disabled:opacity-50 transition-colors"
            >
              Back
            </button>
            <button 
              onClick={handleNext} 
              className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors shadow-sm"
            >
              Next Step
            </button>
          </div>
        </div>
      ) : (
        // Contact Capture Step
        <form onSubmit={handleSubmit} className="animate-fade-in">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Almost done! Where should we send the details?</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Full Name" required value={contact.name} onChange={e => setContact({...contact, name: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="tel" placeholder="Phone Number" required value={contact.phone} onChange={e => setContact({...contact, phone: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
            <input type="email" placeholder="Email Address" required value={contact.email} onChange={e => setContact({...contact, email: e.target.value})} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex justify-between mt-8">
            <button type="button" onClick={handleBack} className="px-5 py-2.5 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Back</button>
            <button type="submit" disabled={submitting} className="px-5 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium transition-colors disabled:opacity-70 shadow-sm">
              {submitting ? 'Calculating...' : 'Get My Estimate'}
            </button>
          </div>
        </form>
      )}
      <div className="mt-8 text-center animate-fade-in">
        <Link to="/admin/login" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Owner Login
        </Link>
      </div>
    </div>
  );
}