'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Project, useDeleteProject } from '../../lib/hooks/useProjects';

interface ProjectDeleteModalProps {
  project: Project;
  isOpen: boolean;
  onClose: () => void;
}

export const ProjectDeleteModal = ({ project, isOpen, onClose }: ProjectDeleteModalProps) => {
  const deleteProjectMutation = useDeleteProject();

  const handleDelete = async () => {
    try {
      await deleteProjectMutation.mutateAsync(project.id);
      onClose();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Supprimer le projet
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
            disabled={deleteProjectMutation.isPending}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="space-y-2">
            <p className="text-card-foreground">
              Êtes-vous sûr de vouloir supprimer ce projet ?
            </p>
            <div className="p-3 bg-muted rounded-lg border-l-4 border-l-destructive">
              <p className="font-medium text-card-foreground">
                {project.name}
              </p>
              {project.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
            <p className="text-sm text-destructive font-medium mb-1">
              ⚠️ Attention
            </p>
            <p className="text-xs text-destructive/80">
              Cette action est irréversible. Toutes les données associées à ce projet seront définitivement supprimées.
            </p>
          </div>

          {/* Messages d'erreur */}
          {deleteProjectMutation.error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">
                ❌ {deleteProjectMutation.error.message}
              </p>
            </div>
          )}

          {/* Boutons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-input rounded-lg text-muted-foreground hover:bg-accent transition-colors"
              disabled={deleteProjectMutation.isPending}
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteProjectMutation.isPending}
              className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleteProjectMutation.isPending ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive-foreground mr-2"></div>
                  Suppression...
                </span>
              ) : (
                'Supprimer définitivement'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 