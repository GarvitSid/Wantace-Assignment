import React from 'react';

export default function QuestionField({ question, value, onChange }) {
  if (!question.active) return null;

  if (question.type === 'number') {
    return (
      <div className="flex flex-col gap-2 my-4">
        <label className="font-semibold text-gray-800 text-lg">
          {question.label} {question.unit && <span className="text-gray-500 text-sm font-normal">({question.unit})</span>}
        </label>
        <input
          type="number"
          min={question.min}
          max={question.max}
          value={value || ''}
          onChange={(e) => onChange(question.key, Number(e.target.value))}
          className="p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full transition-all"
          placeholder={`Enter value between ${question.min} and ${question.max}`}
          required={question.required}
        />
      </div>
    );
  }

  if (question.type === 'select') {
    return (
      <div className="flex flex-col gap-3 my-4">
        <label className="font-semibold text-gray-800 text-lg">{question.label}</label>
        <div className="grid grid-cols-1 gap-3">
          {question.options.map((opt) => (
            <label
              key={opt.value}
              className={`p-4 border rounded-lg cursor-pointer flex items-center justify-between transition-all ${
                value === opt.value 
                  ? 'bg-blue-50 border-blue-600 shadow-sm' 
                  : 'bg-white border-gray-200 hover:border-blue-300 hover:bg-gray-50'
              }`}
            >
              <span className={`font-medium ${value === opt.value ? 'text-blue-900' : 'text-gray-700'}`}>
                {opt.label}
              </span>
              <input
                type="radio"
                name={question.key}
                value={opt.value}
                checked={value === opt.value}
                onChange={() => onChange(question.key, opt.value)}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500"
                required={question.required}
              />
            </label>
          ))}
        </div>
      </div>
    );
  }

  return null;
}