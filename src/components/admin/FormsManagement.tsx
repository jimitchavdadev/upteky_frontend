import { useState, useEffect } from 'react';
import { Plus, ExternalLink, Copy, Trash2, Power, PowerOff, Loader2, FileText } from 'lucide-react';
import * as feedbackService from '../../services/feedbackService';
import { FeedbackForm } from '../../types';
import CreateFormModal from './CreateFormModal';

export default function FormsManagement() {
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [feedbackCounts, setFeedbackCounts] = useState<Record<string, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadForms = async () => {
    setIsLoading(true);
    try {
      const formsData = await feedbackService.getAllForms();
      setForms(formsData);
      
      // Fetch feedback counts for all forms
      const counts: Record<string, number> = {};
      const allFeedbacks = await feedbackService.getFilteredFeedbacks({});
      for (const form of formsData) {
        counts[form.id] = allFeedbacks.filter(f => f.formId === form.id).length;
      }
      setFeedbackCounts(counts);

    } catch (error) {
      console.error('Failed to load forms', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    loadForms();
  }, []);

  const handleCreateForm = async (formData: Omit<FeedbackForm, 'id' | 'createdAt'>) => {
    try {
      await feedbackService.createForm(formData);
      await loadForms(); // Refresh the list
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create form', error);
    }
  };

  const handleToggleActive = async (form: FeedbackForm) => {
    try {
      await feedbackService.updateForm(form.id, { isActive: !form.isActive });
      await loadForms(); // Refresh the list
    } catch (error) {
      console.error('Failed to toggle form status', error);
    }
  };

  const handleDeleteForm = async (formId: string) => {
    if (confirm('Are you sure you want to delete this form and all its responses?')) {
      try {
        await feedbackService.deleteForm(formId);
        await loadForms(); // Refresh the list
      } catch (error) {
        console.error('Failed to delete form', error);
      }
    }
  };

  const getFormLink = (formId: string) => {
    return `${window.location.origin}/form/${formId}`;
  };

  const copyFormLink = (formId: string) => {
    const link = getFormLink(formId);
    navigator.clipboard.writeText(link);
    setCopiedId(formId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Forms Management</h2>
          <p className="text-gray-600 mt-1">Create and manage feedback forms</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition transform hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Create New Form
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <div className="grid gap-6">
          {forms.map((form) => (
            <div
              key={form.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{form.title}</h3>
                    {form.isActive ? (
                      <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">
                        <Power className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                        <PowerOff className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-3">{form.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>{form.fields.length} fields</span>
                    <span>Created {new Date(form.createdAt).toLocaleDateString()}</span>
                    <span>{feedbackCounts[form.id] || 0} responses</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleActive(form)}
                    className={`p-2 rounded-lg transition ${
                      form.isActive
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-400 hover:bg-gray-50'
                    }`}
                    title={form.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {form.isActive ? <Power className="w-5 h-5" /> : <PowerOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => handleDeleteForm(form.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete Form"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                <div className="flex-1 mr-4">
                  <p className="text-xs text-gray-600 mb-1">Form Link:</p>
                  <code className="text-sm text-gray-900 break-all">{getFormLink(form.id)}</code>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyFormLink(form.id)}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg transition"
                  >
                    <Copy className="w-4 h-4" />
                    {copiedId === form.id ? 'Copied!' : 'Copy'}
                  </button>
                  <a
                    href={`/form/${form.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                  >
                    <ExternalLink className="w-4 h-4" />
                    Open
                  </a>
                </div>
              </div>
            </div>
          ))}

          {forms.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No forms yet</h3>
              <p className="text-gray-600 mb-4">Create your first feedback form to get started</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition"
              >
                <Plus className="w-5 h-5" />
                Create New Form
              </button>
            </div>
          )}
        </div>
      )}

      {showCreateModal && (
        <CreateFormModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateForm}
        />
      )}
    </div>
  );
}