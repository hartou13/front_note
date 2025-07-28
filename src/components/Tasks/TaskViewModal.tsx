'use client';

import { CheckCircle, Circle, Edit, X } from 'lucide-react';
import { Task, getStatusColor, getStatusLabel, numberToStatus } from '../../lib/hooks/useTasks';
import { Button } from '../UI/button';

interface TaskViewModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export const TaskViewModal: React.FC<TaskViewModalProps> = ({ task, isOpen, onClose, onEdit }) => {
  if (!isOpen) return null;

  const taskStatus = numberToStatus(task.status);
  const statusLabel = getStatusLabel(taskStatus);
  const statusColorClass = getStatusColor(taskStatus);

  const getStatusIcon = () => {
    switch (taskStatus) {
      case 'done':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in_progress':
        return <Circle className="w-5 h-5 text-blue-600" />;
      case 'waiting':
        return <Circle className="w-5 h-5 text-yellow-600" />;
      case 'todo':
      default:
        return <Circle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 1: return 'Très basse';
      case 2: return 'Basse';
      case 3: return 'Moyenne';
      case 4: return 'Haute';
      case 5: return 'Très haute';
      default: return 'Non définie';
    }
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 1: return 'text-gray-600';
      case 2: return 'text-blue-600';
      case 3: return 'text-green-600';
      case 4: return 'text-yellow-600';
      case 5: return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">
            Détails de la tâche
          </h2>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Nom de la tâche
            </label>
            <div className="px-3 py-2 border border-border rounded-lg bg-muted/30 text-foreground">
              {task.name}
            </div>
          </div>

          {/* Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Statut
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-muted/30">
                {getStatusIcon()}
                <span className={`text-sm font-medium ${statusColorClass}`}>
                  {statusLabel}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Priorité
              </label>
              <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-muted/30">
                <div
                  className={`w-3 h-3 rounded-full ${
                    task.priority === 1 ? 'bg-gray-500' :
                    task.priority === 2 ? 'bg-blue-500' :
                    task.priority === 3 ? 'bg-green-500' :
                    task.priority === 4 ? 'bg-yellow-500' :
                    task.priority === 5 ? 'bg-red-500' :
                    'bg-gray-500'
                  }`}
                />
                <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                  {getPriorityLabel(task.priority)}
                </span>
              </div>
            </div>
          </div>

          {/* Project */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Projet
            </label>
            <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-muted/30">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: task.project.color }}
              />
              <span className="text-sm font-medium">
                {task.project.name}
              </span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Description
              </label>
              <div className="px-3 py-2 border border-border rounded-lg bg-muted/30">
                <p className="text-sm text-foreground whitespace-pre-wrap">
                  {task.description}
                </p>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-1 gap-4">
            {task.created_at && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Créée le
                </label>
                <div className="px-3 py-2 border border-border rounded-lg bg-muted/30">
                  <p className="text-sm">
                    {new Date(task.created_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            )}
            
            {task.updated_at && (
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Modifiée le
                </label>
                <div className="px-3 py-2 border border-border rounded-lg bg-muted/30">
                  <p className="text-sm">
                    {new Date(task.updated_at).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ID de la tâche
              </label>
              <div className="px-3 py-2 border border-border rounded-lg bg-muted/30">
                <p className="font-mono text-xs">
                  {task.id}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                ID du projet
              </label>
              <div className="px-3 py-2 border border-border rounded-lg bg-muted/30">
                <p className="font-mono text-xs">
                  {task.project_id}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
          <Button onClick={onClose} variant="outline">
            Fermer
          </Button>
          {onEdit && (
            <Button onClick={onEdit} className="flex items-center gap-2">
              <Edit className="w-4 h-4" />
              Modifier
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// Utility function to determine text color based on background color
const getContrastColor = (hexColor: string): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  
  // Convert to RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, black for light backgrounds
  return luminance > 0.5 ? '#000000' : '#ffffff';
}; 