'use client';

import { ChevronDown, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Note, useCreateNote, useUpdateNote } from '../../lib/hooks/useNotes';
import { useProjects } from '../../lib/hooks/useProjects';

interface NoteEditModalProps {
  note: Note | null; // null = création, Note = modification ou affichage
  isOpen: boolean;
  onClose: () => void;
  isEditing?: boolean; // true = édition, false = lecture seule, undefined = création
  onEditModeChange?: (isEditing: boolean) => void; // Callback pour changer le mode
}

export const NoteEditModal = ({ note, isOpen, onClose, isEditing, onEditModeChange }: NoteEditModalProps) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    project_id: '',
  });
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);

  const { data: projects } = useProjects();
  const updateNoteMutation = useUpdateNote();
  const createNoteMutation = useCreateNote();

  // Déterminer le mode : création, édition ou lecture seule
  const isCreateMode = note === null;
  const isReadOnlyMode = note !== null && isEditing === false;
  const isEditMode = note !== null && isEditing === true;
  
  const isLoading = updateNoteMutation.isPending || createNoteMutation.isPending;

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title,
        content: note.content,
        project_id: note.project_id,
      });
    } else {
      setFormData({
        title: '',
        content: '',
        project_id: projects && projects.length > 0 ? projects[0].id : '',
      });
    }
  }, [note, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim() || !formData.project_id) {
      return;
    }

    const dataToSubmit = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      project_id: formData.project_id,
    };

    try {
      if (isEditMode && note) {
        await updateNoteMutation.mutateAsync({
          id: note.id,
          data: dataToSubmit,
        });
      } else {
        await createNoteMutation.mutateAsync(dataToSubmit);
      }
      onClose();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProjectSelect = (projectId: string) => {
    setFormData(prev => ({
      ...prev,
      project_id: projectId,
    }));
    setIsProjectDropdownOpen(false);
  };

  const selectedProject = projects?.find(p => p.id === formData.project_id);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-card-foreground">
            {isEditMode ? 'Modifier la note' : isCreateMode ? 'Créer une nouvelle note' : 'Afficher la note'}
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
          {/* Titre de la note */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-card-foreground mb-2">
              Titre de la note *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              disabled={isReadOnlyMode}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Entrez le titre de la note"
            />
          </div>

          {/* Projet associé */}
          <div>
            <label className="block text-sm font-medium text-card-foreground mb-2">
              Projet associé *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
                disabled={isReadOnlyMode}
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center gap-2">
                  {selectedProject && (
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: selectedProject.color }}
                    />
                  )}
                  <span>
                    {selectedProject ? selectedProject.name : 'Sélectionner un projet'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Dropdown */}
              {isProjectDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsProjectDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto">
                    {projects && projects.length > 0 ? (
                      projects.filter(project => project.is_active).map((project) => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => handleProjectSelect(project.id)}
                          className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 ${
                            formData.project_id === project.id ? 'bg-accent' : ''
                          }`}
                        >
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: project.color }}
                          />
                          <span className="text-sm">{project.name}</span>
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

          {/* Contenu de la note */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-card-foreground mb-2">
              Contenu *
            </label>
            <textarea
              id="content"
              name="content"
              value={formData.content}
              onChange={handleInputChange}
              required
              rows={8}
              disabled={isReadOnlyMode}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground resize-none disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Écrivez le contenu de votre note..."
            />
          </div>

          {/* Messages d'erreur */}
          {(updateNoteMutation.error || createNoteMutation.error) && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">
                ❌ {updateNoteMutation.error?.message || createNoteMutation.error?.message}
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            {isReadOnlyMode ? (
              <>
                <button
                  type="button"
                  onClick={() => onEditModeChange?.(true)}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Modifier
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-input rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                >
                  Fermer
                </button>
              </>
            ) : (
              <>
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
                  disabled={isLoading || !formData.title.trim() || !formData.content.trim() || !formData.project_id}
                  className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                      Sauvegarde...
                    </span>
                  ) : (
                    isEditMode ? 'Modifier' : 'Créer'
                  )}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}; 