import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { useI18n } from '../../lib/i18n';

/**
 * Single grade entry for chart calculation
 */
interface GradeEntry {
  /** Student display name */
  studentName: string;
  /** Grade value, null when no grade recorded */
  value: number | null;
  /** Maximum possible grade for the exercise (or 10 for total) */
  maxValue: number;
}

/**
 * Props for GradeDistributionChartModal
 */
interface GradeDistributionChartModalProps {
  /** Controls modal visibility */
  readonly isOpen: boolean;
  /** Callback when the modal is closed */
  readonly onClose: () => void;
  /** Title shown in the modal header (exercise name or "Total") */
  readonly title: string;
  /** Array with each student's grade data */
  readonly grades: GradeEntry[];
}

/** Color palette for each grade category */
const CATEGORY_COLORS: Record<string, string> = {
  noGrade: '#a09890',
  failing: '#c0392b',
  sufficient: '#c4833c',
  good: '#d4a056',
  remarkable: '#5a9e82',
  outstanding: '#2c5f4a',
};

/** Order of categories for display */
const CATEGORY_KEYS = ['noGrade', 'failing', 'sufficient', 'good', 'remarkable', 'outstanding'] as const;

type CategoryKey = typeof CATEGORY_KEYS[number];

/**
 * Classify a grade ratio into a category
 */
function classifyGrade(value: number | null, maxValue: number): CategoryKey {
  if (value === null) return 'noGrade';
  const ratio = maxValue > 0 ? value / maxValue : 0;
  if (ratio < 0.5) return 'failing';
  if (ratio < 0.6) return 'sufficient';
  if (ratio < 0.7) return 'good';
  if (ratio < 0.9) return 'remarkable';
  return 'outstanding';
}

/**
 * Custom label renderer – draws text OUTSIDE the pie with a connector line
 */
function renderOuterLabel(props: PieLabelRenderProps) {
  const cx = Number(props.cx ?? 0);
  const cy = Number(props.cy ?? 0);
  const midAngle = Number(props.midAngle ?? 0);
  const outerRadius = Number(props.outerRadius ?? 0);
  const value = Number(props.value ?? 0);
  const percent = Number(props.percent ?? 0);
  const rawFill = (props as unknown as Record<string, unknown>).fill;
  const fill = typeof rawFill === 'string' ? rawFill : '#3d4440';
  const name = String((props as unknown as Record<string, unknown>).name ?? '');

  if (value === 0) return null;

  const RADIAN = Math.PI / 180;
  const sin = Math.sin(-midAngle * RADIAN);
  const cos = Math.cos(-midAngle * RADIAN);

  /* Points for the connector line: start at pie edge → elbow → label */
  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  const ex = mx + (cos >= 0 ? 12 : -12);
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      {/* Connector line */}
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
      {/* Small dot at pie edge */}
      <circle cx={sx} cy={sy} r={3} fill={fill} />
      {/* Label text */}
      <text x={ex + (cos >= 0 ? 4 : -4)} y={ey} textAnchor={textAnchor} fill="#3d4440" fontSize={12} fontWeight={600} dominantBaseline="central">
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    </g>
  );
}


/**
 * Custom legend renderer for the grade distribution chart
 */
function GradeDistributionLegend({ data }: { readonly data: Array<{ key: string; name: string; value: number; color: string }> }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
      {data.map(d => (
        <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: d.color, display: 'inline-block' }} />
          <span>{d.name} ({d.value})</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Modal that displays a PieChart with grade distribution for a given exercise or total.
 * Categories: Sin nota, Suspenso (<50%), Suficiente (≥50%<60%), Bien (≥60%<70%),
 * Notable (≥70%<90%), Sobresaliente (≥90%).
 */
export function GradeDistributionChartModal({
  isOpen,
  onClose,
  title,
  grades,
}: GradeDistributionChartModalProps) {
  const { t } = useI18n();


  /** Build chart data from grades */
  const chartData = useMemo(() => {
    const counts: Record<CategoryKey, number> = {
      noGrade: 0,
      failing: 0,
      sufficient: 0,
      good: 0,
      remarkable: 0,
      outstanding: 0,
    };

    for (const g of grades) {
      const category = classifyGrade(g.value, g.maxValue);
      counts[category]++;
    }

    return CATEGORY_KEYS.map(key => ({
      name: t(`dashboard.rubrics.chart.${key}`),
      value: counts[key],
      color: CATEGORY_COLORS[key],
      key,
    }));
  }, [grades, t]);

  /** Filter out categories with 0 students for the pie (they still appear in legend) */
  const pieData = useMemo(() => chartData.filter(d => d.value > 0), [chartData]);

  if (!isOpen) return null;

  const hasData = pieData.length > 0;

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      aria-label={t('dashboard.rubrics.chart.title')}
      onClose={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', minHeight: '100%', padding: '1rem', overflowY: 'auto' }}>
        <div className="modal-content grade-distribution-modal" style={{ maxWidth: '850px', width: '90vw', marginTop: 'auto', marginBottom: 'auto' }}>
          <h3 className="modal-title">
            📊 {t('dashboard.rubrics.chart.title')}: {title}
          </h3>
          <div className="modal-body">
            {hasData ? (
              <div className="grade-distribution-chart-container" style={{ minHeight: '520px' }}>
                <ResponsiveContainer width="100%" height={520}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      label={renderOuterLabel}
                      labelLine={false}
                    >
                      {pieData.map(entry => (
                        <Cell
                          key={entry.key}
                          fill={entry.color}
                          stroke="#fff"
                          strokeWidth={2}
                          className="grade-distribution-sector"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined, name: string | undefined) => [
                        `${value ?? 0} ${t('dashboard.rubrics.chart.studentsCount')}`,
                        name ?? '',
                      ]}
                    />
                    <Legend
                      content={<GradeDistributionLegend data={chartData} />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#7a8078', padding: '2rem 0' }}>
                {t('dashboard.rubrics.chart.noDataForChart')}
              </p>
            )}
          </div>
          <div className="modal-footer" style={{ marginTop: '1rem' }}>
            <button className="modal-button save" onClick={onClose}>
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
}



