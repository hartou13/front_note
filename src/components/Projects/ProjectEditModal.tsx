'use client';

import { ChevronDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Project, useCreateProject, useProjects, useUpdateProject } from '../../lib/hooks/useProjects';
import { ColorPicker } from '../UI/ColorPicker';

interface ProjectEditModalProps {
  project: Project | null; // null = création, Project = modification
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectEditModal = ({ project, isOpen, onClose }: ProjectEditModalProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    is_active: true,
    mother_project_id: '',
    color: '#2973B2',
  });
  const [isParentDropdownOpen, setIsParentDropdownOpen] = useState(false);

  const { data: allProjects } = useProjects();
  const updateProjectMutation = useUpdateProject();
  const createProjectMutation = useCreateProject();

  const isEditing = project !== null;
  const isLoading = updateProjectMutation.isPending || createProjectMutation.isPending;

  // Filtrer les projets disponibles comme parents
  const availableParentProjects = allProjects?.filter(p => {
    // Exclure le projet actuel et ses descendants pour éviter les boucles
    if (isEditing && project) {
      return p.id !== project.id && p.mother_project_id !== project.id;
    }
    return true;
  }) || [];

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        is_active: project.is_active,
        mother_project_id: project.mother_project_id || '',
        color: project.color || '#2973B2',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        is_active: true,
        mother_project_id: '',
        color: '#2973B2',
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const dataToSubmit = {
      name: formData.name,
      description: formData.description,
      is_active: formData.is_active,
      mother_project_id: formData.mother_project_id || null,
      color: formData.color,
    };

    try {
      if (isEditing && project) {
        await updateProjectMutation.mutateAsync({
          id: project.id,
          data: dataToSubmit,
        });
      } else {
        await createProjectMutation.mutateAsync(dataToSubmit);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleColorChange = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color,
    }));
  };

  const handleParentProjectSelect = (parentId: string) => {
    setFormData(prev => ({
      ...prev,
      mother_project_id: parentId,
    }));
    setIsParentDropdownOpen(false);
  };

  const selectedParentProject = availableParentProjects.find(p => p.id === formData.mother_project_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            {isEditing ? 'Modifier le projet' : 'Créer un nouveau projet'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Nom du projet */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-card-foreground mb-2">
              Nom du projet *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
              placeholder="Entrez le nom du projet"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-card-foreground mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground resize-none"
              placeholder="Décrivez votre projet..."
            />
          </div>

          {/* Couleur du projet */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Couleur du projet
            </label>
            <ColorPicker
              value={formData.color}
              onChange={handleColorChange}
              className="w-full"
            />
          </div>

          {/* Projet parent */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Projet parent (optionnel)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsParentDropdownOpen(!isParentDropdownOpen)}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  {selectedParentProject ? (
                    <>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedParentProject.color }}
                      />
                      <span>{selectedParentProject.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Aucun projet parent</span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Dropdown */}
              {isParentDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsParentDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {/* Option "Aucun parent" */}
                    <button
                      type="button"
                      onClick={() => handleParentProjectSelect('delete')}
                      className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 ${
                        !formData.mother_project_id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="w-3 h-3 rounded-full border border-border bg-muted" />
                      <span className="text-sm text-muted-foreground">Aucun projet parent</span>
                    </button>

                    {/* Options des projets */}
                    {availableParentProjects.length > 0 ? (
                      availableParentProjects
                        .filter(parentProject => parentProject.is_active)
                        .map((parentProject) => (
                          <button
                            key={parentProject.id}
                            type="button"
                            onClick={() => handleParentProjectSelect(parentProject.id)}
                            className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 ${
                              formData.mother_project_id === parentProject.id ? 'bg-accent' : ''
                            }`}
                          >
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: parentProject.color }}
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium truncate">{parentProject.name}</span>
                              {parentProject.description && (
                                <p className="text-xs text-muted-foreground truncate">
                                  {parentProject.description}
                                </p>
                              )}
                            </div>
                          </button>
                        ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Aucun projet disponible comme parent
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Sélectionnez un projet parent pour créer une hiérarchie
            </p>
          </div>

          {/* Statut actif */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleInputChange}
              className="w-4 h-4 text-primary border-input rounded focus:ring-2 focus:ring-ring"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-card-foreground">
              Projet actif
            </label>
          </div>

          {/* Messages d'erreur */}
          {(updateProjectMutation.error || createProjectMutation.error) && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">
                ❌ {updateProjectMutation.error?.message || createProjectMutation.error?.message}
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input rounded-lg text-muted-foreground hover:bg-accent transition-colors"
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                  Sauvegarde...
                </span>
              ) : (
                isEditing ? 'Modifier' : 'Créer'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 