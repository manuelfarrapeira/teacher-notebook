import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { PieLabelRenderProps } from 'recharts';
import { useI18n } from '../../lib/i18n';

/**
 * A single student's criterion assignment for chart calculation
 */
interface RubricCriterionEntry {
  /** Student display name */
  studentName: string;
  /** Criterion data, null when no criterion assigned */
  criterion: {
    description: string;
    gradeStart: number;
    gradeEnd: number;
    /** Optional textual qualification label */
    qualification?: string;
  } | null;
}

/**
 * Props for RubricDistributionChartModal
 */
interface RubricDistributionChartModalProps {
  /** Controls modal visibility */
  readonly isOpen: boolean;
  /** Callback when the modal is closed */
  readonly onClose: () => void;
  /** Title shown in the modal header (rubric name) */
  readonly title: string;
  /** Array with each student's criterion data */
  readonly entries: RubricCriterionEntry[];
}

/** Predefined colour palette for criterion groups */
const CRITERION_PALETTE = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6',
  '#3d7a5e', '#ec4899', '#14b8a6', '#f43f5e', '#6366f1',
];

/** Colour for "no criterion" group */
const NO_CRITERION_COLOR = '#9ca3af';

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

  const sx = cx + outerRadius * cos;
  const sy = cy + outerRadius * sin;
  const mx = cx + (outerRadius + 18) * cos;
  const my = cy + (outerRadius + 18) * sin;
  const ex = mx + (cos >= 0 ? 12 : -12);
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" strokeWidth={1.5} />
      <circle cx={sx} cy={sy} r={3} fill={fill} />
      <text x={ex + (cos >= 0 ? 4 : -4)} y={ey} textAnchor={textAnchor} fill="#3d4440" fontSize={12} fontWeight={600} dominantBaseline="central">
        {name} ({(percent * 100).toFixed(0)}%)
      </text>
    </g>
  );
}

/**
 * Build a unique key for a criterion based on its grade range
 */
function criterionKey(gradeStart: number, gradeEnd: number): string {
  return `${gradeStart}-${gradeEnd}`;
}

/**
 * Custom legend for rubric distribution – shows range + count
 */
function RubricDistributionLegend({ data }: {
  readonly data: Array<{ key: string; label: string; value: number; color: string; description: string }>;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
      {data.map(d => (
        <div key={d.key} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
          <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: d.color, display: 'inline-block' }} />
          <span>{d.label} ({d.value})</span>
        </div>
      ))}
    </div>
  );
}

/**
 * Custom tooltip content – shows the criterion description on hover
 */
function RubricChartTooltip({ active, payload }: {
  readonly active?: boolean;
  readonly payload?: Array<{ payload: { label: string; value: number; description: string } }>;
}) {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '0.5rem',
      padding: '0.6rem 0.8rem',
      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      maxWidth: '280px',
    }}>
      <p style={{ margin: 0, fontWeight: 600, fontSize: '0.85rem', color: '#3d4440' }}>
        {data.label}
      </p>
      {data.description && (
        <p style={{ margin: '0.3rem 0 0', fontSize: '0.8rem', color: '#7a8078', whiteSpace: 'pre-wrap' }}>
          {data.description}
        </p>
      )}
      <p style={{ margin: '0.3rem 0 0', fontSize: '0.75rem', color: '#9ca3af' }}>
        {data.value} {data.value === 1 ? 'alumno' : 'alumnos'}
      </p>
    </div>
  );
}

/**
 * Modal that displays a PieChart with criterion distribution for a rubric.
 * Each sector represents a distinct criterion (grade range).
 * Students without a criterion are grouped as "Sin criterio".
 * Hovering a sector shows the criterion description in the tooltip.
 */
export function RubricDistributionChartModal({
  isOpen,
  onClose,
  title,
  entries,
}: RubricDistributionChartModalProps) {
  const { t } = useI18n();

  /** Build chart data grouping students by their assigned criterion */
  const { chartData, pieData } = useMemo(() => {
    /** Map: criterionKey → { count, description, label, gradeStart } */
    const groups = new Map<string, { count: number; description: string; label: string; gradeStart: number }>();

    let noCriterionCount = 0;

    for (const entry of entries) {
      if (entry.criterion) {
        const key = criterionKey(entry.criterion.gradeStart, entry.criterion.gradeEnd);
        const existing = groups.get(key);
        if (existing) {
          existing.count++;
        } else {
          const rangeLabel = `${entry.criterion.gradeStart}–${entry.criterion.gradeEnd}`;
          const label = entry.criterion.qualification
            ? `${rangeLabel} (${entry.criterion.qualification})`
            : rangeLabel;
          groups.set(key, {
            count: 1,
            description: entry.criterion.description,
            label,
            gradeStart: entry.criterion.gradeStart,
          });
        }
      } else {
        noCriterionCount++;
      }
    }

    /** Sort groups by gradeStart ascending */
    const sortedGroups = [...groups.entries()].sort((a, b) => a[1].gradeStart - b[1].gradeStart);

    const allData: Array<{
      key: string;
      label: string;
      name: string;
      value: number;
      color: string;
      description: string;
    }> = [];

    /** No criterion group first */
    allData.push({
      key: 'noCriterion',
      label: t('dashboard.classRubrics.noCriterion'),
      name: t('dashboard.classRubrics.noCriterion'),
      value: noCriterionCount,
      color: NO_CRITERION_COLOR,
      description: '',
    });

    sortedGroups.forEach(([key, group], index) => {
      allData.push({
        key,
        label: group.label,
        name: group.label,
        value: group.count,
        color: CRITERION_PALETTE[index % CRITERION_PALETTE.length],
        description: group.description,
      });
    });

    const filtered = allData.filter(d => d.value > 0);
    return { chartData: allData, pieData: filtered };
  }, [entries, t]);

  if (!isOpen) return null;

  const hasData = pieData.length > 0;

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      aria-label={t('dashboard.classRubrics.chart.title')}
      onClose={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
        <div className="modal-content grade-distribution-modal" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <h3 className="modal-title">
            📊 {t('dashboard.classRubrics.chart.title')}: {title}
          </h3>
          <div className="modal-body">
            {hasData ? (
              <div className="grade-distribution-chart-container">
                <ResponsiveContainer width="100%" height={400}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={110}
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
                    <Tooltip content={<RubricChartTooltip />} />
                    <Legend
                      content={<RubricDistributionLegend data={chartData} />}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#7a8078', padding: '2rem 0' }}>
                {t('dashboard.classRubrics.chart.noDataForChart')}
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


