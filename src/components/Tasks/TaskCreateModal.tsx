'use client';

import { ChevronDown, Loader2, Save, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useProjects as useProjectsHook } from '../../lib/hooks/useProjects';
import { useCreateTask } from '../../lib/hooks/useTasks';
import { Button } from '../UI/button';

interface TaskCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultProjectId?: string;
  defaultMotherTaskId?: string;
}

export const TaskCreateModal: React.FC<TaskCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId,
  defaultMotherTaskId
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    project_id: '',
    priority: 3
  });
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const createTaskMutation = useCreateTask();
  const { data: projects = [] } = useProjectsHook();

  useEffect(() => {
    if (isOpen) {
      // Réinitialiser le formulaire avec les valeurs par défaut
      setFormData({
        name: '',
        description: '',
        project_id: defaultProjectId || (projects.length > 0 ? projects[0].id : ''),
        priority: 3
      });
      setIsProjectDropdownOpen(false);
    }
  }, [isOpen, projects, defaultProjectId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.project_id) {
      return;
    }

    try {
      await createTaskMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim(),
        project_id: formData.project_id,
        mother_task_id: defaultMotherTaskId,
        priority: formData.priority,
        status: 'todo' // Par défaut, toutes les nouvelles tâches sont "À faire"
      });
      
      onSuccess();
    } catch (error) {
      // L'erreur est gérée par le hook
    }
  };

  const handleClose = () => {
    if (!createTaskMutation.isPending) {
      onClose();
    }
  };

  const handleProjectChange = (projectId: string) => {
    setFormData(prev => ({ ...prev, project_id: projectId }));
    setIsProjectDropdownOpen(false);
  };

  const selectedProject = projects.find(p => p.id === formData.project_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Nouvelle tâche
          </h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={createTaskMutation.isPending}
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
              disabled={createTaskMutation.isPending}
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
              disabled={createTaskMutation.isPending}
            />
          </div>

          {/* Priority */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
              Priorité
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              disabled={createTaskMutation.isPending}
            >
              <option value={1}>1 - Très basse</option>
              <option value={2}>2 - Basse</option>
              <option value={3}>3 - Moyenne</option>
              <option value={4}>4 - Haute</option>
              <option value={5}>5 - Très haute</option>
            </select>
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
                disabled={createTaskMutation.isPending}
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

          {/* Error display */}
          {createTaskMutation.error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">
                ❌ Erreur : {createTaskMutation.error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createTaskMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={createTaskMutation.isPending || !formData.name.trim() || !formData.project_id}
              className="flex items-center gap-2"
            >
              {createTaskMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Création...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Créer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}; 