'use client';

import { ChevronDown, Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProjects as useProjectsHook } from '../../lib/hooks/useProjects';
import { getStatusColor, getStatusLabel, numberToStatus, Task, useUpdateTask } from '../../lib/hooks/useTasks';
import { Button } from '../UI/button';

interface TaskEditModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskEditModal: React.FC<TaskEditModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_id: '',
    status: 'todo' as 'todo' | 'waiting' | 'in_progress' | 'done'
  });
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);

  const updateTaskMutation = useUpdateTask();
  const { data: projects = [] } = useProjectsHook();

  useEffect(() => {
    if (isOpen && task) {
      // Convertir le statut numérique en string pour l'édition
      const taskStatus = numberToStatus(task.status);
      
      setFormData({
        name: task.name,
        description: task.description || '',
        project_id: task.project_id,
        status: taskStatus
      });
      setIsProjectDropdownOpen(false);
      setIsStatusDropdownOpen(false);
    }
  }, [isOpen, task]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.project_id) {
      return;
    }

    try {
      await updateTaskMutation.mutateAsync({
        id: task.id,
        data: {
          name: formData.name.trim(),
          description: formData.description.trim(),
          project_id: formData.project_id,
          status: formData.status
        }
      });
      
      onSuccess();
    } catch (error) {
      // L'erreur est gérée par le hook
    }
  };

  const handleClose = () => {
    if (!updateTaskMutation.isPending) {
      onClose();
    }
  };

  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({ ...prev, project_id: projectId }));
    setIsProjectDropdownOpen(false);
  };

  const handleStatusChange = (status: 'todo' | 'waiting' | 'in_progress' | 'done') => {
    setFormData(prev => ({ ...prev, status }));
    setIsStatusDropdownOpen(false);
  };

  const selectedProject = projects.find(p => p.id === formData.project_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Modifier la tâche
          </h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={updateTaskMutation.isPending}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
              Nom de la tâche *
            </label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Entrez le nom de la tâche"
              required
              disabled={updateTaskMutation.isPending}
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              placeholder="Entrez une description (optionnel)"
              disabled={updateTaskMutation.isPending}
            />
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Projet *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={updateTaskMutation.isPending}
              >
                <div className="flex items-center gap-2">
                  {selectedProject ? (
                    <>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedProject.color }}
                      />
                      <span>{selectedProject.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Sélectionnez un projet</span>
                  )}
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isProjectDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Project Dropdown */}
              {isProjectDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProjectDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                    {projects.length > 0 ? (
                      projects
                        .filter(project => project.is_active)
                        .map((project) => (
                          <button
                            key={project.id}
                            type="button"
                            onClick={() => handleProjectChange(project.id)}
                            className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2"
                          >
                            <div 
                              className="w-3 h-3 rounded-full"
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
                          </button>
                        ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Aucun projet disponible
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Statut
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                className="w-full flex items-center justify-between px-3 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                disabled={updateTaskMutation.isPending}
              >
                <div className="flex items-center gap-2">
                  <span className={getStatusColor(formData.status)}>
                    {getStatusLabel(formData.status)}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isStatusDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Status Dropdown */}
              {isStatusDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsStatusDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50">
                    {[
                      { status: 'todo' as const, label: getStatusLabel('todo'), color: getStatusColor('todo') },
                      { status: 'waiting' as const, label: getStatusLabel('waiting'), color: getStatusColor('waiting') },
                      { status: 'in_progress' as const, label: getStatusLabel('in_progress'), color: getStatusColor('in_progress') },
                      { status: 'done' as const, label: getStatusLabel('done'), color: getStatusColor('done') }
                    ].map(({ status, label, color }) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(status)}
                        className="w-full px-3 py-2 text-left hover:bg-accent transition-colors"
                      >
                        <span className={`text-sm font-medium ${color}`}>
                          {label}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Error display */}
          {updateTaskMutation.error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">
                ❌ Erreur : {updateTaskMutation.error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={updateTaskMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={updateTaskMutation.isPending || !formData.name.trim() || !formData.project_id}
              className="flex items-center gap-2"
            >
              {updateTaskMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 