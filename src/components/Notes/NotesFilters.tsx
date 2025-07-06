import { Badge } from '@/components/UI/badge';
import { ChevronDown, Tag as TagIcon, X } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
}

interface Tag {
  id: string;
  name: string;
  color: string;
}

interface NotesFiltersProps {
  projects: Project[];
  tags: Tag[];
  selectedProjectFilter: string;
  selectedTags: string[];
  isFilterDropdownOpen: boolean;
  isTagDropdownOpen: boolean;
  onProjectFilterChange: (projectId: string) => void;
  onTagToggle: (tagId: string) => void;
  onTagRemove: (tagId: string) => void;
  onClearAllFilters: () => void;
  onFilterDropdownToggle: () => void;
  onTagDropdownToggle: () => void;
  totalNotes: number;
  getNotesCountByProject: (projectId: string) => number;
}

export function NotesFilters({
  projects,
  tags,
  selectedProjectFilter,
  selectedTags,
  isFilterDropdownOpen,
  isTagDropdownOpen,
  onProjectFilterChange,
  onTagToggle,
  onTagRemove,
  onClearAllFilters,
  onFilterDropdownToggle,
  onTagDropdownToggle,
  totalNotes,
  getNotesCountByProject,
}: NotesFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-muted/30 rounded-lg">
      {/* Project Filter Dropdown */}
      <div className="relative">
        <button
          onClick={onFilterDropdownToggle}
          className="flex items-center justify-between w-full sm:w-auto px-3 py-2 border border-input rounded-lg hover:bg-accent transition-colors text-sm"
        >
          <div className="flex items-center gap-2">
            {selectedProjectFilter ? (
              <>
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: projects?.find(p => p.id === selectedProjectFilter)?.color || '#2973B2' }}
                />
                <span>{projects?.find(p => p.id === selectedProjectFilter)?.name || 'Projet inconnu'}</span>
              </>
            ) : (
              <span className="text-muted-foreground">Tous les projets</span>
            )}
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Project Dropdown */}
        {isFilterDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={onFilterDropdownToggle}
            />
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto min-w-[250px]">
              {/* Option "Tous les projets" */}
              <button
                onClick={() => onProjectFilterChange('')}
                className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between ${
                  !selectedProjectFilter ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border border-border bg-muted" />
                  <span className="text-sm">Tous les projets</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {totalNotes} note{totalNotes !== 1 ? 's' : ''}
                </span>
              </button>

              {/* Options des projets */}
              {projects && projects.length > 0 ? (
                projects
                  .filter(project => project.is_active)
                  .map((project) => {
                    const notesCount = getNotesCountByProject(project.id);
                    return (
                      <button
                        key={project.id}
                        onClick={() => onProjectFilterChange(project.id)}
                        className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between ${
                          selectedProjectFilter === project.id ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: project.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium truncate block">{project.name}</span>
                            {project.description && (
                              <p className="text-xs text-muted-foreground truncate">
                                {project.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-2">
                          {notesCount} note{notesCount !== 1 ? 's' : ''}
                        </span>
                      </button>
                    );
                  })
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Aucun projet disponible
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Tags Filter Dropdown */}
      <div className="relative">
        <button
          onClick={onTagDropdownToggle}
          className="flex items-center justify-between w-full sm:w-auto px-3 py-2 border border-input rounded-lg hover:bg-accent transition-colors text-sm"
        >
          <div className="flex items-center gap-2">
            <TagIcon className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">
              {selectedTags.length > 0 ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}` : 'Tous les tags'}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 text-muted-foreground" />
        </button>

        {/* Tags Dropdown */}
        {isTagDropdownOpen && (
          <>
            <div 
              className="fixed inset-0 z-40"
              onClick={onTagDropdownToggle}
            />
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto min-w-[200px]">
              {tags.length > 0 ? (
                <div className="p-2 space-y-1">
                  {tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => onTagToggle(tag.id)}
                      className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors rounded flex items-center gap-2 ${
                        selectedTags.includes(tag.id) ? 'bg-accent' : ''
                      }`}
                    >
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: tag.color }}
                      />
                      <span className="text-sm">{tag.name}</span>
                      {selectedTags.includes(tag.id) && (
                        <div className="ml-auto text-primary">✓</div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Aucun tag disponible
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Tags sélectionnés */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedTags.map(tagId => {
            const tag = tags.find(t => t.id === tagId);
            return tag ? (
              <Badge
                key={tagId}
                variant="secondary"
                className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => onTagRemove(tagId)}
              >
                <div
                  className="w-2 h-2 rounded-full mr-1"
                  style={{ backgroundColor: tag.color }}
                />
                {tag.name}
                <span className="ml-1">×</span>
              </Badge>
            ) : null;
          })}
        </div>
      )}

      {/* Bouton unique pour effacer tous les filtres */}
      {(selectedProjectFilter || selectedTags.length > 0) && (
        <button
          onClick={onClearAllFilters}
          className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded transition-colors w-full sm:w-auto"
        >
          <X className="w-3 h-3" />
          Effacer les filtres
        </button>
      )}
    </div>
  );
} 