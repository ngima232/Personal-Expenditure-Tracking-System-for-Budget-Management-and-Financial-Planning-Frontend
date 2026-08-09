import { useEffect, useState } from 'react';
import { transactionsApi } from '../api';
import { formatCurrency } from '../utils/format';
import { Card, Spinner, ErrorBanner } from '../components/ui'; // adjust path

export default function ExpenseForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadForecast = async () => {
      setLoading(true);
      try {
        const res = await transactionsApi.getForecast({ months: 6 });
        setForecast(res.data);
      } catch (err) {
        setError(err.message || 'Failed to load forecast.');
      } finally {
        setLoading(false);
      }
    };
    loadForecast();
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (!forecast || forecast.breakdown.length === 0) {
    return <p className="text-text-muted">Not enough data to generate a forecast.</p>;
  }

  // Sort breakdown by forecasted amount descending
  const sortedBreakdown = [...forecast.breakdown].sort((a, b) => b.forecastedAmount - a.forecastedAmount);
  const maxAmount = sortedBreakdown[0]?.forecastedAmount || 1;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="p-4">
          <p className="text-xs text-text-muted">Total forecast</p>
          <p className="font-display text-2xl text-text-ink">{formatCurrency(forecast.totalForecast) > 0 ?  formatCurrency(forecast.totalForecast) : 'N/A'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-muted">Categories with forecast</p>
          <p className="font-display text-2xl text-text-ink">{sortedBreakdown.length > 0 ? sortedBreakdown.length : 'N/A'}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-text-muted">Highest expense</p>
          <p className="font-display text-2xl text-text-ink">
            {sortedBreakdown.length > 0 && sortedBreakdown[0]?.forecastedAmount > 0 ? sortedBreakdown[0].categoryName : 'N/A'}
          </p>
        </Card>
      </div>

      {/* Breakdown list */}
      <Card>
        <div className="divide-y divide-line">
          {sortedBreakdown.map((item) => {
            const percent = (item.forecastedAmount / maxAmount) * 100;
            return (
              <div key={item.category} className="py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-ink">{item.categoryName}</span>
                  <span className="figure text-sm font-medium text-text-ink">
                    {formatCurrency(item.forecastedAmount)}
                  </span>
                </div>
                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-brand transition-all"
                    style={{ width: `${Math.min(percent, 100)}%` }}
                  />
                </div>
                {item.monthlyData && (
                  <p className="mt-1 text-xs text-text-muted">
                    {item.monthlyData.length} month{item.monthlyData.length > 1 ? 's' : ''} of data
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}