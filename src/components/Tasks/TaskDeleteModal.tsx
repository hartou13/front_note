'use client';

import { AlertTriangle, Loader2, Trash2, X } from 'lucide-react';
import { Task, useDeleteTask } from '../../lib/hooks/useTasks';
import { Button } from '../UI/button';

interface TaskDeleteModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const TaskDeleteModal: React.FC<TaskDeleteModalProps> = ({
  task,
  isOpen,
  onClose,
  onSuccess
}) => {
  const deleteTaskMutation = useDeleteTask();

  const handleDelete = async () => {
    try {
      await deleteTaskMutation.mutateAsync(task.id);
      onSuccess();
    } catch (error) {
      // L'erreur est gérée par le hook
    }
  };

  const handleClose = () => {
    if (!deleteTaskMutation.isPending) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Supprimer la tâche
          </h2>
          <Button
            onClick={handleClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            disabled={deleteTaskMutation.isPending}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-foreground mb-2">
                Êtes-vous sûr de vouloir supprimer la tâche <strong>"{task.name}"</strong> ?
              </p>
              <p className="text-muted-foreground text-sm">
                Cette action est irréversible et supprimera définitivement la tâche.
              </p>
            </div>
          </div>

          {/* Task details */}
          <div className="bg-muted/50 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: task.project.color }}
              />
              <span className="text-sm font-medium text-foreground">
                {task.project.name}
              </span>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {task.description}
              </p>
            )}
          </div>

          {/* Error display */}
          {deleteTaskMutation.error && (
            <div className="p-3 bg-destructive/10 border border-destructive rounded-lg mb-4">
              <p className="text-destructive text-sm">
                ❌ Erreur : {deleteTaskMutation.error.message}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={deleteTaskMutation.isPending}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTaskMutation.isPending}
              className="flex items-center gap-2"
            >
              {deleteTaskMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Supprimer
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 