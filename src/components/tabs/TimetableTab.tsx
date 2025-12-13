import React from 'react';

export function TimetableTab() {
  const timeSlots = [
    '08:00 - 08:45',
    '08:45 - 09:30',
    '09:30 - 10:15',
    '10:15 - 10:30', // Recreo
    '10:30 - 11:15',
    '11:15 - 12:00',
    '12:00 - 12:45',
    '12:45 - 13:30'
  ];

  const days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  const schedule: Record<string, string[]> = {
    'Lunes': ['Matemáticas 10A', 'Matemáticas 10B', 'Física 11A', 'RECREO', 'Química 11B', 'Matemáticas 9A', 'Física 10A', 'Tutoría'],
    'Martes': ['Física 10B', 'Matemáticas 11A', 'Química 10A', 'RECREO', 'Matemáticas 10A', 'Física 9B', 'Matemáticas 11B', 'Preparación'],
    'Miércoles': ['Química 9A', 'Física 10A', 'Matemáticas 11A', 'RECREO', 'Matemáticas 10B', 'Química 11A', 'Física 11B', 'Evaluaciones'],
    'Jueves': ['Matemáticas 9B', 'Química 10B', 'Física 11A', 'RECREO', 'Matemáticas 11A', 'Física 10B', 'Química 9B', 'Reunión'],
    'Viernes': ['Física 9A', 'Matemáticas 10A', 'Química 11B', 'RECREO', 'Matemáticas 11B', 'Física 10A', 'Química 10A', 'Planificación']
  };

  return (
    <div className="timetable-container">

      <div className="timetable-grid">
        <div className="timetable-time-column">
          <div className="timetable-cell timetable-header-cell">Hora</div>
          {timeSlots.map((time, index) => (
            <div key={index} className={`timetable-cell timetable-time-cell ${time.includes('10:15') ? 'break-time' : ''}`}>
              {time}
            </div>
          ))}
        </div>

        {days.map((day) => (
          <div key={day} className="timetable-day-column">
            <div className="timetable-cell timetable-header-cell">{day}</div>
            {schedule[day].map((subject, index) => (
              <div 
                key={index} 
                className={`timetable-cell timetable-subject-cell ${subject === 'RECREO' ? 'break-cell' : ''}`}
              >
                {subject}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}