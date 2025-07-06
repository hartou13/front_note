import { LinkifyText } from '@/components/UI/LinkifyText';
import { LoadMoreButton } from '@/components/UI/LoadMoreButton';
import { Note } from '@/lib/hooks/useNotes';
import { ChevronDown } from 'lucide-react';

interface NotesCalendarViewProps {
  notes: Note[];
  currentMonth: { year: number; month: number };
  onPreviousMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  onShow: (note: Note, event: React.MouseEvent) => void;
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  getDaysInMonth: (year: number, month: number) => number;
  getFirstDayOfMonth: (year: number, month: number) => number;
  getNotesForDate: (date: Date) => Note[];
}

export function NotesCalendarView({
  notes,
  currentMonth,
  onPreviousMonth,
  onNextMonth,
  onToday,
  onShow,
  onLoadMore,
  isLoading,
  hasMore,
  getDaysInMonth,
  getFirstDayOfMonth,
  getNotesForDate,
}: NotesCalendarViewProps) {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      {/* Header du calendrier */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          {new Date(currentMonth.year, currentMonth.month).toLocaleDateString('fr-FR', {
            month: 'long',
            year: 'numeric'
          })}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onPreviousMonth}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Mois précédent"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
          </button>
          <button
            onClick={onToday}
            className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Aujourd'hui
          </button>
          <button
            onClick={onNextMonth}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
            title="Mois suivant"
          >
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </div>
      </div>

      {/* Grille du calendrier */}
      <div className="grid grid-cols-7 gap-1">
        {/* En-têtes des jours */}
        {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
          <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {/* Jours du mois précédent */}
        {Array.from({ length: getFirstDayOfMonth(currentMonth.year, currentMonth.month) }).map((_, index) => (
          <div key={`prev-${index}`} className="p-2 min-h-[80px] bg-muted/20 rounded-lg" />
        ))}

        {/* Jours du mois actuel */}
        {Array.from({ length: getDaysInMonth(currentMonth.year, currentMonth.month) }).map((_, index) => {
          const day = index + 1;
          const date = new Date(currentMonth.year, currentMonth.month, day);
          const notesForDate = getNotesForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div
              key={day}
              className={`p-2 min-h-[80px] border border-border/50 rounded-lg transition-colors ${
                isToday ? 'bg-primary/10 border-primary/30' : 'hover:bg-accent/20'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-sm font-medium ${
                  isToday ? 'text-primary' : 'text-foreground'
                }`}>
                  {day}
                </span>
                {notesForDate.length > 0 && (
                  <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                    {notesForDate.length}
                  </span>
                )}
              </div>
              
              {/* Notes pour ce jour */}
              <div className="space-y-1">
                {notesForDate.slice(0, 2).map((note) => (
                  <div
                    key={note.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onShow(note, e);
                    }}
                    className="p-1.5 rounded text-xs cursor-pointer transition-colors hover:bg-accent/30"
                    style={{
                      backgroundColor: `${note.project?.color || '#2973B2'}20`,
                      borderLeft: `3px solid ${note.project?.color || '#2973B2'}`
                    }}
                  >
                    <div className="font-medium text-foreground truncate">
                      {note.title}
                    </div>
                    <div className="text-muted-foreground truncate">
                      <LinkifyText 
                        text={note.project?.name || ''}
                        className="text-muted-foreground"
                      />
                    </div>
                  </div>
                ))}
                {notesForDate.length > 2 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{notesForDate.length - 2} autres
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Jours du mois suivant */}
        {Array.from({ 
          length: 42 - getFirstDayOfMonth(currentMonth.year, currentMonth.month) - getDaysInMonth(currentMonth.year, currentMonth.month) 
        }).map((_, index) => (
          <div key={`next-${index}`} className="p-2 min-h-[80px] bg-muted/20 rounded-lg" />
        ))}
      </div>

      {/* Bouton "Afficher plus" pour la vue calendrier */}
      <LoadMoreButton
        onClick={onLoadMore}
        isLoading={isLoading}
        hasMore={hasMore}
        className="mt-6 border-t border-border pt-6"
      />
    </div>
  );
} 