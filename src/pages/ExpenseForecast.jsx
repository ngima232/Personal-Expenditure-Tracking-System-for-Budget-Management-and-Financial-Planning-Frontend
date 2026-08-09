import { useEffect, useMemo, useState } from 'react';
import { transactionsApi } from '../api';
import { formatCurrency } from '../utils/format';
import { Card, Spinner, ErrorBanner } from '../components/ui';

export default function ExpenseForecast() {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadForecast = async () => {
      setLoading(true);
      setError('');

      try {
        // Backend now decides which forecasting algorithm to use,
        // so months/alpha/beta are no longer required.
        const res = await transactionsApi.getForecast();

        // Adjust this depending on your API wrapper.
        // If your response is { data: { data: {...} } }, use res.data.data.
        setForecast(res.data?.data ?? res.data);
      } catch (err) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            'Failed to load expenditure forecast.'
        );
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, []);

  const categories = forecast?.categories ?? [];

  const forecastedCategories = useMemo(() => {
    return categories
      .filter(
        (item) =>
          item.forecastedAmount !== null &&
          item.forecastedAmount !== undefined
      )
      .sort(
        (a, b) =>
          (b.forecastedAmount ?? 0) -
          (a.forecastedAmount ?? 0)
      );
  }, [categories]);

  const highestForecastCategory =
    forecastedCategories.length > 0
      ? forecastedCategories[0]
      : null;

  const maxAmount =
    forecastedCategories.length > 0
      ? Math.max(
          ...forecastedCategories.map(
            (item) => item.forecastedAmount ?? 0
          ),
          1
        )
      : 1;

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <ErrorBanner message={error} />;
  }

  if (!forecast) {
    return (
      <Card>
        <div className="py-8 text-center">
          <h3 className="text-base font-semibold text-text-ink">
            Forecast unavailable
          </h3>

          <p className="mt-1 text-sm text-text-muted">
            No expenditure forecasting information is available.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-text-ink">
          Expenditure Forecast
        </h1>

        <p className="mt-1 text-sm text-text-muted">
          Compare your {forecast.previousMonth} expenses with the
          predicted expenditure for {forecast.forecastMonth}.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {forecast.previousMonth}
            </p>

            <p className="mt-2 text-2xl font-semibold text-text-ink">
              {formatCurrency(
                forecast.totalPreviousMonthExpense ?? 0
              )}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Previous month expenses
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              {forecast.forecastMonth}
            </p>

            <p className="mt-2 text-2xl font-semibold text-text-ink">
              {forecast.totalForecastedExpense > 0
                ? formatCurrency(
                    forecast.totalForecastedExpense
                  )
                : 'N/A'}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Forecasted expenses
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Forecasted Categories
            </p>

            <p className="mt-2 text-2xl font-semibold text-text-ink">
              {forecastedCategories.length}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              Categories with enough data
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
              Highest Forecast
            </p>

            <p className="mt-2 truncate text-lg font-semibold text-text-ink">
              {highestForecastCategory?.categoryName ?? 'N/A'}
            </p>

            <p className="mt-1 text-xs text-text-muted">
              {highestForecastCategory
                ? formatCurrency(
                    highestForecastCategory.forecastedAmount
                  )
                : 'No forecast available'}
            </p>
          </div>
        </Card>
      </div>

      {/* Category Forecast */}
      <Card>
        <div className="border-b border-line px-4 py-4">
          <h2 className="text-base font-semibold text-text-ink">
            Category Forecast
          </h2>

          <p className="mt-1 text-xs text-text-muted">
            Forecasting method is selected automatically according
            to the amount of historical data available for each
            category.
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="px-4 py-10 text-center">
            <p className="text-sm text-text-muted">
              No expense categories are available.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {categories.map((item) => {
              const hasForecast =
                item.forecastedAmount !== null &&
                item.forecastedAmount !== undefined;

              const percent = hasForecast
                ? ((item.forecastedAmount ?? 0) /
                    maxAmount) *
                  100
                : 0;

              return (
                <div
                  key={item.category}
                  className="px-4 py-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    {/* Category Information */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium text-text-ink">
                          {item.categoryName}
                        </h3>

                        <ForecastMethodBadge
                          method={
                            item.forecastingMethod
                          }
                        />
                      </div>

                      <p className="mt-1 text-xs text-text-muted">
                        {item.historicalMonths ?? 0}{' '}
                        completed month
                        {item.historicalMonths === 1
                          ? ''
                          : 's'}{' '}
                        of data
                      </p>
                    </div>

                    {/* Amounts */}
                    <div className="grid grid-cols-2 gap-6 sm:text-right">
                      <div>
                        <p className="text-xs text-text-muted">
                          {forecast.previousMonth}
                        </p>

                        <p className="mt-1 text-sm font-medium text-text-ink">
                          {formatCurrency(
                            item.previousMonthExpense ??
                              0
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-text-muted">
                          {forecast.forecastMonth}
                        </p>

                        <p className="mt-1 text-sm font-semibold text-text-ink">
                          {hasForecast
                            ? formatCurrency(
                                item.forecastedAmount
                              )
                            : 'Not enough data'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Forecast Bar */}
                  {hasForecast && (
                    <div className="mt-4">
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
                        <div
                          className="h-full rounded-full bg-brand transition-all"
                          style={{
                            width: `${Math.min(
                              percent,
                              100
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {/* No Forecast Message */}
                  {!hasForecast && (
                    <div className="mt-3 rounded-md border border-line px-3 py-2">
                      <p className="text-xs text-text-muted">
                        Forecast unavailable because
                        this category does not yet have
                        sufficient historical
                        expenditure data.
                      </p>
                    </div>
                  )}

                  {/* Monthly History */}
                  {item.monthlyHistory?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {item.monthlyHistory.map(
                        (month) => (
                          <div
                            key={month.month}
                            className="rounded-md bg-page px-2 py-1 text-xs text-text-muted"
                          >
                            {formatMonthLabel(
                              month.month
                            )}
                            :{' '}
                            <span className="font-medium text-text-ink">
                              {formatCurrency(
                                month.amount
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function ForecastMethodBadge({ method }) {
  const labels = {
    NO_FORECAST: 'No forecast',
    WEIGHTED_MOVING_AVERAGE: 'Weighted Moving Average',
    HOLT_LINEAR_TREND: "Holt's Linear Trend",
  };

  return (
    <span className="rounded-full border border-line px-2 py-0.5 text-[11px] font-medium text-text-muted">
      {labels[method] ?? method}
    </span>
  );
}

function formatMonthLabel(month) {
  if (!month) return '';

  const [year, monthNumber] = month.split('-');

  return new Date(
    Number(year),
    Number(monthNumber) - 1,
    1
  ).toLocaleString('en-GB', {
    month: 'short',
    year: 'numeric',
  });
}