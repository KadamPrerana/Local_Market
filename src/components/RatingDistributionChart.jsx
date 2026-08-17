import React from 'react';
import { Star, BarChart3 } from 'lucide-react';

export default function RatingDistributionChart({ distribution = {} }) {
  const starsList = [5, 4, 3, 2, 1];

  return (
    <div className="card-box">
      <div className="card-box-header">
        <div className="card-box-title">
          <BarChart3 size={18} className="text-emerald-600" />
          <h3>Rating Breakdown</h3>
        </div>
      </div>
      <div className="rating-chart-container">
        {starsList.map((star) => {
          const count = distribution[star] || 0;
          const percentage = count > 0 ? star * 20 : 0; // 20/40/60/80/100 breakdown logic only when count > 0
          return (
            <div key={star} className="distribution-bar-row">
              <div className="star-label-col" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span>{star}</span>
                <Star size={14} fill="#f59e0b" color="#f59e0b" style={{ display: 'inline-block' }} />
              </div>
              <div className="progress-track-col">
                <div
                  className="progress-fill-emerald"
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="count-col" style={{ width: '70px', display: 'flex', justifyContent: 'flex-end', gap: '4px', whiteSpace: 'nowrap' }}>
                <span className="font-bold text-slate-800">{count}</span>
                <span className="text-xs text-slate-400">({percentage}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
