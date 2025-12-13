import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';

export function ScheduleTab() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const today = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  const events = [
    { year: 2025, month: 10, date: 15, title: 'Matemáticas 10A', time: '08:00', color: 'blue' },
    { year: 2025, month: 11, date: 15, title: 'Física 11B', time: '10:00', color: 'green' },
    { year: 2025, month: 11, date: 22, title: 'Química 9C', time: '14:00', color: 'purple' },
    { year: 2026, month: 0, date: 10, title: 'Historia 8A', time: '09:00', color: 'blue' },
    { year: 2026, month: 0, date: 5, title: 'Biología 12B', time: '11:00', color: 'green' },
    { year: 2026, month: 0, date: 5, title: 'Biología 12B', time: '11:00', color: 'green' },
  ];
  
  const handleMonthChange = (month: number) => {
    setCurrentDate(new Date(currentYear, month, 1));
  };

  const handleYearChange = (year: number) => {
    setCurrentDate(new Date(year, currentMonth, 1));
  };

  const generateYears = () => {
    const years = [];
    const startYear = currentYear - 10;
    const endYear = currentYear + 10;
    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }
    return years;
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(new Date(currentYear, currentMonth + direction, 1));
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Días vacíos del mes anterior
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = today.getDate() === day && 
                     today.getMonth() === currentMonth && 
                     today.getFullYear() === currentYear;
      
      const dayEvents = events.filter(event => 
        event.year === currentYear && 
        event.month === currentMonth && 
        event.date === day
      );
      
      days.push(
        <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
          <span className="day-number">{day}</span>
          <div className="day-events">
            {dayEvents.map((event, index) => (
              <div 
                key={index} 
                className={`event event-${event.color}`}
                title={`${event.time} - ${event.title}`}
              >
                <span className="event-time">{event.time}</span>
                <span className="event-title">{event.title}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    return days;
  };
  
  return (
    <div className="dashboard-card">
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="calendar-nav">
            <button onClick={() => navigateMonth(-1)} className="nav-btn">
              <ChevronLeft className="icon-tab" />
            </button>
            
            <div className="calendar-selectors">
              <select 
                value={currentMonth} 
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="calendar-select"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              
              <select 
                value={currentYear} 
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="calendar-select"
              >
                {generateYears().map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
            
            <button onClick={() => navigateMonth(1)} className="nav-btn">
              <ChevronRight className="icon-tab" />
            </button>
          </div>
          <button className="add-event-btn">
            <Plus className="icon-tab" />
            Nuevo Evento
          </button>
        </div>
        
        <div className="calendar-grid">
          <div className="calendar-weekdays">
            {dayNames.map(day => (
              <div key={day} className="weekday">{day}</div>
            ))}
          </div>
          
          <div className="calendar-days">
            {renderCalendarDays()}
          </div>
        </div>
      </div>
    </div>
  );
}