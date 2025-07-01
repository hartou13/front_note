'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Tag, useDeleteTag } from '../../lib/hooks/useTags';

interface TagDeleteModalProps {
  tag: Tag;
  isOpen: boolean;
  onClose: () => void;
}

export const TagDeleteModal = ({ tag, isOpen, onClose }: TagDeleteModalProps) => {
  const deleteTagMutation = useDeleteTag();

  const handleDelete = async () => {
    try {
      await deleteTagMutation.mutateAsync(tag.id);
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
            <div className="w-10 h-10 bg-destructive/10 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-destructive" />
            </div>
            <h2 className="text-lg font-semibold text-card-foreground">
              Supprimer le tag
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-muted-foreground mb-4">
            Êtes-vous sûr de vouloir supprimer le tag{' '}
            <span className="font-semibold text-foreground">&quot;{tag.name}&quot;</span> ?
          </p>
          
          <div className="bg-muted/50 rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <div 
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: tag.color }}
              />
              <p className="text-sm text-muted-foreground">
                <strong>Nom du tag :</strong> {tag.name}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              <strong>Couleur :</strong> {tag.color}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              <strong>Créé le :</strong> {new Date(tag.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>

          <p className="text-sm text-destructive">
            ⚠️ Cette action est irréversible.
          </p>

          {/* Messages d'erreur */}
          {deleteTagMutation.error && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive rounded-lg">
              <p className="text-destructive text-sm">
                ❌ {deleteTagMutation.error.message}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 pt-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-input rounded-lg text-muted-foreground hover:bg-accent transition-colors"
            disabled={deleteTagMutation.isPending}
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            disabled={deleteTagMutation.isPending}
            className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleteTagMutation.isPending ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-destructive-foreground mr-2"></div>
                Suppression...
              </span>
            ) : (
              'Supprimer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}; 