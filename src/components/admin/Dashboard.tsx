import { useState, useEffect } from 'react';
import { Search, Filter, Download, Loader2 } from 'lucide-react';
import * as feedbackService from '../../services/feedbackService';
import { Feedback, FeedbackForm, AnalyticsData } from '../../types';
import AnalyticsCards from './AnalyticsCards';
import FeedbackTable from './FeedbackTable';

const defaultAnalytics: AnalyticsData = {
  totalFeedbacks: 0,
  averageRating: 0,
  positiveCount: 0,
  negativeCount: 0,
  neutralCount: 0,
};

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [selectedFormId, setSelectedFormId] = useState<string>('all');

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>(defaultAnalytics);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch forms (for dropdown) on mount
  useEffect(() => {
    const fetchForms = async () => {
      try {
        const formsData = await feedbackService.getAllForms();
        setForms(formsData);
      } catch (error) {
        console.error('Failed to fetch forms', error);
      }
    };
    fetchForms();
  }, []);

  // Fetch feedbacks and analytics whenever filters change
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [feedbackData, analyticsData] = await Promise.all([
          feedbackService.getFilteredFeedbacks({
            searchQuery,
            ratingFilter,
            selectedFormId,
          }),
          feedbackService.getAnalytics(selectedFormId),
        ]);
        setFeedbacks(feedbackData);
        setAnalytics(analyticsData);
      } catch (error) {
        console.error('Failed to fetch data', error);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [searchQuery, ratingFilter, selectedFormId]);

  const handleExport = () => {
    const csv = feedbackService.exportToCSV(feedbacks);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `feedbacks-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h2>
        <p className="text-gray-600">Monitor and analyze feedback responses</p>
      </div>

      <AnalyticsCards analytics={analytics} />

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or message..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={selectedFormId}
            onChange={(e) => setSelectedFormId(e.target.value)}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Forms</option>
            {forms.map((form) => (
              <option key={form.id} value={form.id}>
                {form.title}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={ratingFilter === null ? '' : ratingFilter}
              onChange={(e) =>
                setRatingFilter(e.target.value === '' ? null : Number(e.target.value))
              }
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
          </div>

          <button
            onClick={handleExport}
            disabled={feedbacks.length === 0}
            className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg transition"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        </div>
      ) : (
        <FeedbackTable feedbacks={feedbacks} />
      )}
    </div>
  );
}