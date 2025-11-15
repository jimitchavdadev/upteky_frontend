import { MessageSquare, Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { AnalyticsData } from '../../types';

interface AnalyticsCardsProps {
  analytics: AnalyticsData;
}

export default function AnalyticsCards({ analytics }: AnalyticsCardsProps) {
  const cards = [
    {
      title: 'Total Feedbacks',
      value: analytics.totalFeedbacks,
      icon: MessageSquare,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
    },
    {
      title: 'Average Rating',
      value: analytics.averageRating.toFixed(1),
      icon: Star,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
    },
    {
      title: 'Positive (4+)',
      value: analytics.positiveCount,
      icon: ThumbsUp,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
    },
    {
      title: 'Negative (<3)',
      value: analytics.negativeCount,
      icon: ThumbsDown,
      color: 'red',
      bgColor: 'bg-red-100',
      textColor: 'text-red-600',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div
          key={card.title}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition"
        >
          <div className="flex items-start justify-between mb-4">
            <div className={`p-3 ${card.bgColor} rounded-lg`}>
              <card.icon className={`w-6 h-6 ${card.textColor}`} />
            </div>
          </div>
          <p className="text-gray-600 text-sm mb-1">{card.title}</p>
          <p className="text-3xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}
