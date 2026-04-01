import React, { useMemo, useState, useCallback } from 'react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';
import { useI18n } from '../../lib/i18n';

/**
 * Subject grade data for a single quarter
 */
interface SubjectQuarterGrade {
  /** Subject ID */
  subjectId: number;
  /** Subject display name */
  subjectName: string;
  /** Averages per quarter (index 0 = Q1, 1 = Q2, 2 = Q3). null if no data */
  quarterAverages: (number | null)[];
  /** Final average across quarters. null if no data */
  finalAverage: number | null;
}

/**
 * Class subject (all subjects in the class)
 */
interface ClassSubjectInfo {
  /** Subject ID */
  subjectId: number;
  /** Subject display name */
  subjectName: string;
}

/**
 * Props for StudentRadarChartModal
 */
interface StudentRadarChartModalProps {
  /** Controls modal visibility */
  readonly isOpen: boolean;
  /** Callback when the modal is closed */
  readonly onClose: () => void;
  /** Student full name */
  readonly studentName: string;
  /** All subjects in the class (including those without grades) */
  readonly classSubjects: ClassSubjectInfo[];
  /** Grade data per subject (only subjects with grades) */
  readonly subjectGrades: SubjectQuarterGrade[];
}

/** Colors for each data series */
const SERIES_COLORS: Record<SeriesKey, string> = {
  q1: '#2c5f4a',
  q2: '#c4833c',
  q3: '#5a9e82',
  final: '#8b6914',
};

/** All series keys in display order */
type SeriesKey = 'q1' | 'q2' | 'q3' | 'final';
const ALL_SERIES: SeriesKey[] = ['q1', 'q2', 'q3', 'final'];

/**
 * Interactive legend: click an item to show/hide that series
 */
function RadarInteractiveLegend({ series, hiddenKeys, onToggle }: {
  readonly series: Array<{ key: SeriesKey; label: string; color: string; hasData: boolean }>;
  readonly hiddenKeys: Set<SeriesKey>;
  readonly onToggle: (key: SeriesKey) => void;
}) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.75rem', marginTop: '0.5rem' }}>
      {series.filter(s => s.hasData).map(s => {
        const isHidden = hiddenKeys.has(s.key);
        return (
          <button
            key={s.key}
            type="button"
            onClick={() => onToggle(s.key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.8rem',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '0.2rem 0.4rem',
              borderRadius: '0.25rem',
              opacity: isHidden ? 0.4 : 1,
              textDecoration: isHidden ? 'line-through' : 'none',
              transition: 'opacity 0.2s',
            }}
          >
            <span style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: s.color,
              display: 'inline-block',
            }} />
            <span style={{ color: '#3d4440' }}>{s.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * Modal that displays a Radar Chart (spider/web) showing a student's
 * performance across all class subjects. Each vertex is a subject,
 * and areas represent grades per quarter + final grade.
 * Legend items are clickable to show/hide individual series.
 */
export function StudentRadarChartModal({
  isOpen,
  onClose,
  studentName,
  classSubjects,
  subjectGrades,
}: StudentRadarChartModalProps) {
  const { t } = useI18n();

  const [hiddenSeries, setHiddenSeries] = useState<Set<SeriesKey>>(new Set());

  const toggleSeries = useCallback((key: SeriesKey) => {
    setHiddenSeries(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  /** Build radar data: one entry per subject with Q1, Q2, Q3 and Final values */
  const radarData = useMemo(() => {
    return classSubjects.map(cs => {
      const gradeData = subjectGrades.find(sg => sg.subjectId === cs.subjectId);
      return {
        subject: cs.subjectName,
        q1: gradeData?.quarterAverages[0] ?? 0,
        q2: gradeData?.quarterAverages[1] ?? 0,
        q3: gradeData?.quarterAverages[2] ?? 0,
        final: gradeData?.finalAverage ?? 0,
      };
    });
  }, [classSubjects, subjectGrades]);

  /** Check which series have any data > 0 */
  const seriesHasData: Record<SeriesKey, boolean> = useMemo(() => ({
    q1: radarData.some(d => d.q1 > 0),
    q2: radarData.some(d => d.q2 > 0),
    q3: radarData.some(d => d.q3 > 0),
    final: radarData.some(d => d.final > 0),
  }), [radarData]);

  /** Series metadata for the legend */
  const seriesMeta = useMemo(() => ALL_SERIES.map(key => ({
    key,
    label: t(`dashboard.evalCriteria.radarChart.${key === 'final' ? 'finalGrade' : key.replace('q', 'quarter')}`),
    color: SERIES_COLORS[key],
    hasData: seriesHasData[key],
  })), [t, seriesHasData]);

  if (!isOpen) return null;

  const hasData = classSubjects.length > 0;
  const title = `${t('dashboard.evalCriteria.radarChart.title')}: ${studentName}`;

  return (
    <dialog
      className="modal-overlay"
      open={isOpen}
      aria-label={title}
      onClose={onClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '1rem' }}>
        <div className="modal-content grade-distribution-modal" style={{ maxWidth: '850px', width: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
          <h3 className="modal-title">
            📊 {title}
          </h3>
          <div className="modal-body">
            {hasData ? (
              <div className="grade-distribution-chart-container" style={{ minHeight: '520px' }}>
                <ResponsiveContainer width="100%" height={520}>
                  <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="70%">
                    <PolarGrid stroke="#e5e7eb" />
                    {/* @ts-expect-error recharts PolarAngleAxis typing incompatibility with React 18 */}
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fontSize: 11, fill: '#3d4440', fontWeight: 500 }}
                    />
                    <PolarRadiusAxis
                      angle={90}
                      domain={[0, 10]}
                      tick={{ fontSize: 10, fill: '#9ca3af' }}
                      tickCount={6}
                    />
                    {seriesHasData.q1 && !hiddenSeries.has('q1') && (
                      <Radar
                        name={seriesMeta[0].label}
                        dataKey="q1"
                        stroke={SERIES_COLORS.q1}
                        fill={SERIES_COLORS.q1}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    )}
                    {seriesHasData.q2 && !hiddenSeries.has('q2') && (
                      <Radar
                        name={seriesMeta[1].label}
                        dataKey="q2"
                        stroke={SERIES_COLORS.q2}
                        fill={SERIES_COLORS.q2}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    )}
                    {seriesHasData.q3 && !hiddenSeries.has('q3') && (
                      <Radar
                        name={seriesMeta[2].label}
                        dataKey="q3"
                        stroke={SERIES_COLORS.q3}
                        fill={SERIES_COLORS.q3}
                        fillOpacity={0.15}
                        strokeWidth={2}
                      />
                    )}
                    {seriesHasData.final && !hiddenSeries.has('final') && (
                      <Radar
                        name={seriesMeta[3].label}
                        dataKey="final"
                        stroke={SERIES_COLORS.final}
                        fill={SERIES_COLORS.final}
                        fillOpacity={0.2}
                        strokeWidth={2.5}
                        strokeDasharray="5 3"
                      />
                    )}
                    <Tooltip
                      formatter={(value: number | undefined) => {
                        if (value === undefined) return ['0 / 10'];
                        const formatted = Number.isInteger(value) ? String(value) : value.toFixed(2);
                        return [`${formatted} / 10`];
                      }}
                    />
                    <Legend content={<RadarInteractiveLegend series={seriesMeta} hiddenKeys={hiddenSeries} onToggle={toggleSeries} />} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p style={{ textAlign: 'center', color: '#7a8078', padding: '2rem 0' }}>
                {t('dashboard.evalCriteria.radarChart.noDataForChart')}
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

