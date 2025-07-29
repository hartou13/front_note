'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Task, useTaskHistory } from '../../lib/hooks/useTasks';
import { Button } from '../UI/button';
import { TaskDayModal } from './TaskDayModal';

interface TaskHistoryCalendarProps {
  isLoading?: boolean; // Made optional since we'll handle loading internally
}

export function TaskHistoryCalendar({ isLoading: externalLoading }: TaskHistoryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch data for the current month
  const { data: tasks, isLoading: historyLoading, error } = useTaskHistory(
    currentDate.getMonth() + 1, // getMonth() returns 0-11, we need 1-12
    currentDate.getFullYear()
  );

  const isLoading = externalLoading || historyLoading;

  // Get the first day of the current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  // Get the last day of the current month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfWeek = firstDayOfMonth.getDay();
  
  // Calculate the start date for the calendar grid (including previous month's days)
  const startDate = new Date(firstDayOfMonth);
  startDate.setDate(startDate.getDate() - firstDayOfWeek);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days = [];
    const currentDate = new Date(startDate);
    
    // Generate 42 days (6 weeks * 7 days) to ensure we have enough days
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return days;
  }, [startDate]);

  // Group tasks by date
  const tasksByDate = useMemo(() => {
    const grouped: Record<string, Task[]> = {};
    
    tasks?.forEach(task => {
      if (task.finished_at) {
        // Parse the date and convert to local timezone properly
        const date = new Date(task.finished_at);
        // Use toLocaleDateString to get the date in local timezone
        const dateKey = date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
        
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(task);
      }
    });
    
    return grouped;
  }, [tasks]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  const getDateKey = (date: Date) => {
    return date.toLocaleDateString('en-CA'); // YYYY-MM-DD format in local timezone
  };

  const formatDate = (date: Date) => {
    return date.getDate().toString();
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const handleDateClick = (date: Date) => {
    const dateKey = getDateKey(date);
    const dayTasks = tasksByDate[dateKey] || [];
    
    if (dayTasks.length > 0) {
      setSelectedDate(date);
      setIsModalOpen(true);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDate(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
        <p className="text-destructive">
          ❌ Erreur lors du chargement de l'historique : {error.message}
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button
            onClick={goToPreviousMonth}
            variant="outline"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <h2 className="text-xl font-semibold text-card-foreground">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <Button
            onClick={goToNextMonth}
            variant="outline"
            size="sm"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          onClick={goToToday}
          variant="outline"
          size="sm"
        >
          Aujourd'hui
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day headers */}
        {dayNames.map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((date, index) => {
          const dateKey = getDateKey(date);
          const dayTasks = tasksByDate[dateKey] || [];
          const isCurrentMonthDay = isCurrentMonth(date);
          const isTodayDate = isToday(date);
          const hasTasks = dayTasks.length > 0;
          
          return (
            <div
              key={index}
              className={`
                min-h-[100px] p-2 border border-border/50 rounded-lg cursor-pointer transition-all
                ${isCurrentMonthDay ? 'bg-background' : 'bg-muted/30'}
                ${isTodayDate ? 'ring-2 ring-primary' : ''}
                ${!isCurrentMonthDay ? 'text-muted-foreground' : 'text-foreground'}
                ${hasTasks ? 'hover:bg-accent/50 hover:border-accent' : ''}
                ${hasTasks ? 'hover:shadow-md' : ''}
              `}
              onClick={() => handleDateClick(date)}
              title={hasTasks ? `Cliquer pour voir ${dayTasks.length} tâche(s) terminée(s)` : undefined}
            >
              {/* Date number */}
              <div className="text-sm font-medium mb-1">
                {formatDate(date)}
              </div>
              
              {/* Tasks for this day */}
              <div className="space-y-1">
                {dayTasks.slice(0, 3).map(task => (
                  <div
                    key={task.id}
                    className="text-xs p-1 rounded truncate shadow-sm border"
                    style={{
                      backgroundColor: task.project.color + '20', // 20% opacity
                      color: task.project.color,
                      borderColor: task.project.color + '40' // 40% opacity
                    }}
                    title={task.name}
                  >
                    {task.name}
                  </div>
                ))}
                
                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center bg-muted/50 px-1 py-0.5 rounded">
                    +{dayTasks.length - 3} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary/10 rounded"></div>
              <span>Tâches terminées</span>
            </div>
          </div>
          
          <div className="text-right">
            <span>Total: {tasks?.filter(t => t.finished_at).length || 0} tâches terminées</span>
          </div>
        </div>
      </div>

      {/* Modal */}
      <TaskDayModal
        isOpen={isModalOpen}
        onClose={closeModal}
        date={selectedDate}
        tasks={selectedDate ? (tasksByDate[getDateKey(selectedDate)] || []) : []}
      />
    </div>
  );
} 