import { useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';
import { FeedbackForm, FormField } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface CreateFormModalProps {
  onClose: () => void;
  onSubmit: (formData: Omit<FeedbackForm, 'id' | 'createdAt'>) => void;
}

export default function CreateFormModal({ onClose, onSubmit }: CreateFormModalProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fields, setFields] = useState<Omit<FormField, 'id'>[]>([
    { label: 'Name', type: 'text', required: true, placeholder: 'Enter your name' },
    { label: 'Email', type: 'email', required: true, placeholder: 'your.email@example.com' },
    { label: 'Message', type: 'textarea', required: true, placeholder: 'Your feedback...' },
    { label: 'Rating', type: 'rating', required: true },
  ]);

  const handleAddField = () => {
    setFields([...fields, { label: '', type: 'text', required: false, placeholder: '' }]);
  };

  const handleRemoveField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index: number, updates: Partial<FormField>) => {
    const newFields = [...fields];
    newFields[index] = { ...newFields[index], ...updates };
    setFields(newFields);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData: Omit<FeedbackForm, 'id' | 'createdAt'> = {
      title,
      description,
      createdBy: user?.id || '',
      isActive: true,
      fields: fields.map((field, index) => ({
        ...field,
        id: `field-${index + 1}`,
      })),
    };

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Create New Form</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Form Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Customer Satisfaction Survey"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe the purpose of this form..."
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Form Fields
              </label>
              <button
                type="button"
                onClick={handleAddField}
                className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition text-sm"
              >
                <Plus className="w-4 h-4" />
                Add Field
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg space-y-3"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-3">
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          handleFieldChange(index, { label: e.target.value })
                        }
                        placeholder="Field Label"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        required
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <select
                          value={field.type}
                          onChange={(e) =>
                            handleFieldChange(index, {
                              type: e.target.value as FormField['type'],
                            })
                          }
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="email">Email</option>
                          <option value="textarea">Textarea</option>
                          <option value="rating">Rating</option>
                        </select>

                        <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg text-sm">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) =>
                              handleFieldChange(index, { required: e.target.checked })
                            }
                            className="rounded"
                          />
                          Required
                        </label>
                      </div>

                      {field.type !== 'rating' && (
                        <input
                          type="text"
                          value={field.placeholder || ''}
                          onChange={(e) =>
                            handleFieldChange(index, { placeholder: e.target.value })
                          }
                          placeholder="Placeholder text (optional)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveField(index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 hover:bg-gray-50 rounded-lg transition font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition font-medium"
            >
              Create Form
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
