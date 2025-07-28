'use client';

import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';
import { useProjects } from '../../lib/hooks/useProjects';
import { useTasks } from '../../lib/hooks/useTasks';
import { Button } from '../UI/button';

interface TaskFiltersProps {
  filters: {
    project_id: string;
    priority: number | undefined;
  };
  onFiltersChange: (filters: {
    project_id: string;
    priority: number | undefined;
  }) => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  filters,
  onFiltersChange
}) => {
  const { data: projects = [] } = useProjects();
  const { data: tasksResponse } = useTasks();
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isPriorityDropdownOpen, setIsPriorityDropdownOpen] = useState(false);

  const tasks = tasksResponse?.data || [];

  const handleProjectChange = (projectId: string) => {
    onFiltersChange({
      ...filters,
      project_id: projectId
    });
    setIsProjectDropdownOpen(false);
  };

  const handlePriorityChange = (priority: number | undefined) => {
    onFiltersChange({
      ...filters,
      priority: priority
    });
    setIsPriorityDropdownOpen(false);
  };

  const clearFilters = () => {
    onFiltersChange({
      project_id: '',
      priority: undefined
    });
  };

  const hasActiveFilters = filters.project_id !== '' || filters.priority !== undefined;

  // Compter les tâches par projet
  const getTasksCountByProject = (projectId: string) => {
    return tasks.filter(task => task.project_id === projectId).length;
  };

  const totalTasks = tasks.length;

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-foreground">Filtres</h3>
        {hasActiveFilters && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs"
          >
            <X className="w-3 h-3 mr-1" />
            Effacer
          </Button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        {/* Project Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center justify-between w-full sm:w-auto px-3 py-2 border border-input rounded-lg hover:bg-accent transition-colors text-sm"
          >
            <div className="flex items-center gap-2">
              {filters.project_id ? (
                <>
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: projects?.find(p => p.id === filters.project_id)?.color || '#2973B2' }}
                  />
                  <span>{projects?.find(p => p.id === filters.project_id)?.name || 'Projet inconnu'}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Tous les projets</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Project Dropdown */}
          {isProjectDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsProjectDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto min-w-[250px]">
                {/* Option "Tous les projets" */}
                <button
                  onClick={() => handleProjectChange('')}
                  className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between ${
                    !filters.project_id ? 'bg-accent' : ''
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full border border-border bg-muted" />
                    <span className="text-sm">Tous les projets</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {totalTasks} tâche{totalTasks !== 1 ? 's' : ''}
                  </span>
                </button>

                {/* Options des projets */}
                {projects && projects.length > 0 ? (
                  projects
                    .filter(project => project.is_active)
                    .map((project) => {
                      const tasksCount = getTasksCountByProject(project.id);
                      return (
                        <button
                          key={project.id}
                          onClick={() => handleProjectChange(project.id)}
                          className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between ${
                            filters.project_id === project.id ? 'bg-accent' : ''
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
                            {tasksCount} tâche{tasksCount !== 1 ? 's' : ''}
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

        {/* Priority Filter Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsPriorityDropdownOpen(!isPriorityDropdownOpen)}
            className="flex items-center justify-between w-full sm:w-auto px-3 py-2 border border-input rounded-lg hover:bg-accent transition-colors text-sm"
          >
            <div className="flex items-center gap-2">
              {filters.priority !== undefined ? (
                <>
                  <div
                    className={`w-3 h-3 rounded-full ${
                      filters.priority === 1 ? 'bg-gray-500' :
                      filters.priority === 2 ? 'bg-blue-500' :
                      filters.priority === 3 ? 'bg-green-500' :
                      filters.priority === 4 ? 'bg-yellow-500' :
                      filters.priority === 5 ? 'bg-red-500' :
                      'bg-gray-500'
                    }`}
                  />
                  <span>Priorité {filters.priority}</span>
                </>
              ) : (
                <span className="text-muted-foreground">Toutes les priorités</span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </button>

          {/* Priority Dropdown */}
          {isPriorityDropdownOpen && (
            <>
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setIsPriorityDropdownOpen(false)}
              />
              <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-[200px]">
                {/* Option "Toutes les priorités" */}
                <button
                  onClick={() => handlePriorityChange(undefined)}
                  className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between ${
                    filters.priority === undefined ? 'bg-accent' : ''
                  }`}
                >
                  <span className="text-sm">Toutes les priorités</span>
                  <span className="text-xs text-muted-foreground">
                    {totalTasks} tâche{totalTasks !== 1 ? 's' : ''}
                  </span>
                </button>

                {/* Options des priorités */}
                {[
                  { priority: 1, label: 'Très basse', color: 'bg-gray-500' },
                  { priority: 2, label: 'Basse', color: 'bg-blue-500' },
                  { priority: 3, label: 'Moyenne', color: 'bg-green-500' },
                  { priority: 4, label: 'Haute', color: 'bg-yellow-500' },
                  { priority: 5, label: 'Très haute', color: 'bg-red-500' }
                ].map(({ priority, label, color }) => (
                  <button
                    key={priority}
                    onClick={() => handlePriorityChange(priority)}
                    className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between ${
                      filters.priority === priority ? 'bg-accent' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${color}`} />
                      <span className="text-sm">Priorité {priority} - {label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          {filters.project_id && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
              <span>Projet: {projects.find(p => p.id === filters.project_id)?.name}</span>
              <button
                onClick={() => handleProjectChange('')}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
          {filters.priority !== undefined && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
              <div
                className={`w-2 h-2 rounded-full ${
                  filters.priority === 1 ? 'bg-gray-500' :
                  filters.priority === 2 ? 'bg-blue-500' :
                  filters.priority === 3 ? 'bg-green-500' :
                  filters.priority === 4 ? 'bg-yellow-500' :
                  filters.priority === 5 ? 'bg-red-500' :
                  'bg-gray-500'
                }`}
              />
              <span>Priorité {filters.priority}</span>
              <button
                onClick={() => handlePriorityChange(undefined)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}; 