import { useState, useEffect } from 'react';
import { Star, Send, CheckCircle, Loader2 } from 'lucide-react';
import * as feedbackService from '../../services/feedbackService';
import { FeedbackForm, FormField } from '../../types';

interface FeedbackFormPageProps {
  formId: string;
}

export default function FeedbackFormPage({ formId }: FeedbackFormPageProps) {
  const [form, setForm] = useState<FeedbackForm | null>(null);
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  useEffect(() => {
    const fetchForm = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedForm = await feedbackService.getFormById(formId);
        setForm(fetchedForm);
      } catch (err) {
        console.error('Failed to fetch form', err);
        setError('Form not found or failed to load.');
      }
      setIsLoading(false);
    };
    fetchForm();
  }, [formId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-xl text-gray-700">{error || 'Form not found'}</p>
        </div>
      </div>
    );
  }

  if (!form.isActive) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <p className="text-xl text-gray-700">This form is no longer accepting responses</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Thank You!</h2>
          <p className="text-gray-600 mb-6">
            Your feedback has been submitted successfully. We appreciate your time and input.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setResponses({});
            }}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nameField = form.fields.find(f => f.label.toLowerCase() === 'name');
    const emailField = form.fields.find(f => f.type === 'email');
    const messageField = form.fields.find(f => f.type === 'textarea');
    const ratingField = form.fields.find(f => f.type === 'rating');

    try {
      await feedbackService.submitFeedback({
        formId: form.id,
        name: (nameField ? responses[nameField.id] : '') as string || '',
        email: (emailField ? responses[emailField.id] : '') as string || '',
        message: (messageField ? responses[messageField.id] : '') as string || '',
        rating: (ratingField ? responses[ratingField.id] : 0) as number || 0,
        responses,
      });
      setSubmitted(true);
    } catch (error) {
      console.error('Failed to submit feedback', error);
      alert('Failed to submit feedback. Please try again.');
    }
  };

  const handleFieldChange = (fieldId: string, value: string | number) => {
    setResponses((prev) => ({ ...prev, [fieldId]: value }));
  };

  const renderField = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
        return (
          <input
            type={field.type}
            value={(responses[field.id] as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
          />
        );

      case 'textarea':
        return (
          <textarea
            value={(responses[field.id] as string) || ''}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            required={field.required}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
          />
        );

      case 'rating':
        return (
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleFieldChange(field.id, rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(null)}
                className="transition transform hover:scale-110"
              >
                <Star
                  className={`w-10 h-10 ${
                    rating <= (hoveredRating || (responses[field.id] as number) || 0)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">{form.title}</h1>
            <p className="text-gray-600 text-lg">{form.description}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {form.fields.map((field) => (
              <div key={field.id}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                {renderField(field)}
              </div>
            ))}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 rounded-lg transition transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="w-5 h-5" />
              Submit Feedback
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <p className="text-gray-600 text-sm">
            Powered by Feedback Management Dashboard
          </p>
        </div>
      </div>
    </div>
  );
}