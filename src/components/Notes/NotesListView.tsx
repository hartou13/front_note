import { LinkifyText } from '@/components/UI/LinkifyText';
import { LoadMoreButton } from '@/components/UI/LoadMoreButton';
import { Note } from '@/lib/hooks/useNotes';
import { Calendar, Clock, Edit, Eye, MoreVertical, Trash2 } from 'lucide-react';

interface NotesListViewProps {
  notes: Note[];
  openMenuId: string | null;
  onMenuToggle: (noteId: string, event: React.MouseEvent) => void;
  onShow: (note: Note, event: React.MouseEvent) => void;
  onEdit: (note: Note, event: React.MouseEvent) => void;
  onDelete: (note: Note, event: React.MouseEvent) => void;
  onLoadMore: () => void;
  isLoading: boolean;
  hasMore: boolean;
  formatDate: (dateString: string) => string;
  formatTime: (dateString: string) => string;
  truncateContent: (content: string, maxLength?: number) => string;
}

export function NotesListView({
  notes,
  openMenuId,
  onMenuToggle,
  onShow,
  onEdit,
  onDelete,
  onLoadMore,
  isLoading,
  hasMore,
  formatDate,
  formatTime,
  truncateContent,
}: NotesListViewProps) {
  return (
    <div className="space-y-1">
      {notes.map((note) => {
        const projectColor = note.project?.color || '#2973B2';
        
        return (
          <div key={note.id} className="relative group">
            {/* Menu Button - Positioned outside the clickable note area */}
            <button
              onClick={(e) => onMenuToggle(note.id, e)}
              className="note-menu-button absolute top-3 right-3 p-1.5 opacity-60 hover:opacity-100 hover:bg-accent rounded-full transition-all duration-200 bg-background/80 backdrop-blur-sm shadow-sm z-20"
            >
              <MoreVertical className="w-3 h-3 text-muted-foreground" />
            </button>

            {/* Context Menu - Only appears when menu is open */}
            {openMenuId === note.id && (
              <div className="note-context-menu absolute top-12 right-3 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                <button
                  onClick={(e) => onShow(note, e)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
                >
                  <Eye className="w-3 h-3" />
                  Afficher
                </button>
                <button
                  onClick={(e) => onEdit(note, e)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
                >
                  <Edit className="w-3 h-3" />
                  Modifier
                </button>
                <button
                  onClick={(e) => onDelete(note, e)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-destructive hover:text-destructive transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Supprimer
                </button>
              </div>
            )}

            {/* Note Item - Style liste horizontale */}
            <div 
              onClick={(e) => onShow(note, e)}
              className="flex items-center gap-4 p-4 bg-card hover:bg-accent/30 rounded-lg border border-border/50 transition-all duration-200 cursor-pointer"
            >
              {/* Indicateur coloré du projet */}
              <div 
                className="w-3 h-12 rounded-full flex-shrink-0"
                style={{ backgroundColor: projectColor }}
              />

              {/* Contenu principal */}
              <div className="flex-1 min-w-0 space-y-1">
                {/* Titre de la note avec indicateur */}
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-medium text-foreground truncate flex-1">
                    {note.title}
                  </h3>
                </div>
                
                {/* Contenu tronqué ou complet selon l'état */}
                <p className={`text-sm text-muted-foreground ${
                  'line-clamp-1'
                }`}>
                  {!note.hidden && (
                    <LinkifyText 
                      text={truncateContent(note.content)}
                      className="text-muted-foreground"
                    />
                  )}
                </p>
                
                {/* Informations du projet */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{note.project?.name || 'Projet inconnu'}</span>
                  {note.project?.description && (
                    <>
                      <span>•</span>
                      <span className="truncate">{note.project.description}</span>
                    </>
                  )}
                </div>
                
                {/* Tags de la note */}
                {note.tags && note.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {note.tags.map((noteTag) => (
                      <span
                        key={noteTag.id}
                        className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border"
                        style={{ 
                          backgroundColor: `${noteTag.tag.color}20`,
                          borderColor: noteTag.tag.color,
                          color: noteTag.tag.color
                        }}
                      >
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: noteTag.tag.color }}
                        />
                        {noteTag.tag.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Date et heure */}
              <div className="flex flex-col items-end text-xs text-muted-foreground space-y-1 flex-shrink-0">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{formatDate(note.created_at)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(note.created_at)}</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Bouton "Afficher plus" */}
      <LoadMoreButton
        onClick={onLoadMore}
        isLoading={isLoading}
        hasMore={hasMore}
      />
    </div>
  );
} 