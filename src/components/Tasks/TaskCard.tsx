'use client';

import { CheckCircle, ChevronDown, ChevronRight, Circle, Edit, FileText, MoreVertical, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getStatusColor, getStatusLabel, numberToStatus, Task, useTask, useUpdateTask } from '../../lib/hooks/useTasks';
import { Button } from '../UI/button';
import { TaskCreateModal } from './TaskCreateModal';
import { TaskDeleteModal } from './TaskDeleteModal';
import { TaskEditModal } from './TaskEditModal';

interface TaskCardProps {
  task: Task;
  isSubTask?: boolean;
  level?: number;
  onTaskLoaded?: (taskId: string, taskWithDaughters: any) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, isSubTask = false, level = 0, onTaskLoaded }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDaughters, setShowDaughters] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  
  const updateTaskMutation = useUpdateTask();
  const { data: taskWithDaughters, isLoading: isLoadingDaughters } = useTask(showDaughters ? task.id : null);

  // Ajouter au cache quand les sous-tâches sont chargées
  useEffect(() => {
    if (taskWithDaughters && onTaskLoaded) {
      onTaskLoaded(task.id, taskWithDaughters);
    }
  }, [taskWithDaughters, task.id, onTaskLoaded]);

  // Convertir le statut numérique en string pour l'affichage
  const taskStatus = numberToStatus(task.status);
  const statusLabel = getStatusLabel(taskStatus);
  const statusColorClass = getStatusColor(taskStatus);

  const handleStatusToggle = () => {
    // Passer au statut suivant dans le cycle
    const nextStatus = taskStatus === 'todo' ? 'waiting' : 
                      taskStatus === 'waiting' ? 'in_progress' : 
                      taskStatus === 'in_progress' ? 'done' : 'todo';
    
    updateTaskMutation.mutate({
      id: task.id,
      data: { status: nextStatus }
    });
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
  };

  const handleDeleteSuccess = () => {
    setShowDeleteModal(false);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
  };

  const handleTaskClick = () => {
    setShowDaughters(!showDaughters);
  };

  // Icône selon le statut
  const getStatusIcon = () => {
    switch (taskStatus) {
      case 'done':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Circle className="w-4 h-4 text-blue-600" />;
      case 'waiting':
        return <Circle className="w-4 h-4 text-yellow-600" />;
      case 'todo':
      default:
        return <Circle className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />;
    }
  };

  // Calculer le padding en fonction du niveau (réduit)
  const paddingLeft = level * 16; // 16px par niveau (1rem)

  return (
    <>
      <div 
        className="flex items-center justify-between p-3 border border-border rounded-lg hover:shadow-sm transition-shadow"
        style={{ 
          borderLeft: `4px solid ${task.project.color}`,
          backgroundColor: `${task.project.color}10`,
          marginLeft: `${paddingLeft}px`
        }}
      >
        {/* Left side - Status toggle and task info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            onClick={handleStatusToggle}
            disabled={updateTaskMutation.isPending}
            className="flex-shrink-0"
          >
            {getStatusIcon()}
          </button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-foreground truncate text-sm">
                {task.name}
              </h3>
              {task.description && (
                <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              )}
            </div>
            <span className={`text-xs ${statusColorClass}`}>
              {statusLabel}
            </span>
            {/* Description when expanded */}
            {showDaughters && task.description && (
              <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                {task.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Right side - Actions */}
        <div className="flex items-center gap-1 ml-2">
          {/* Toggle daughters button */}
          <Button
            onClick={handleTaskClick}
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            disabled={isLoadingDaughters}
          >
            {isLoadingDaughters ? (
              <div className="w-3 h-3 border-2 border-muted-foreground border-t-transparent rounded-full animate-spin" />
            ) : showDaughters ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>

          {/* Actions dropdown */}
          <div className="relative">
            <Button
              onClick={() => setShowDropdown(!showDropdown)}
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
            >
              <MoreVertical className="w-3 h-3" />
            </Button>

            {/* Dropdown menu */}
            {showDropdown && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowDropdown(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 min-w-32">
                  <button
                    onClick={() => {
                      setShowCreateModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-sm"
                  >
                    <Plus className="w-3 h-3" />
                    Ajouter
                  </button>
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-sm"
                  >
                    <Edit className="w-3 h-3" />
                    Modifier
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(true);
                      setShowDropdown(false);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center gap-2 text-sm text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                    Supprimer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Error display */}
        {updateTaskMutation.error && (
          <div className="absolute top-full left-0 right-0 mt-1 p-2 bg-destructive/10 border border-destructive rounded text-xs text-destructive">
            ❌ Erreur : {updateTaskMutation.error.message}
          </div>
        )}
      </div>

      {/* Daughters tasks */}
      {showDaughters && taskWithDaughters?.daughters && taskWithDaughters.daughters.length > 0 && (
        <div className="space-y-2 mt-2">
          {taskWithDaughters.daughters.map((daughterTask) => (
            <TaskCard 
              key={daughterTask.id} 
              task={daughterTask} 
              isSubTask={true} 
              level={level + 1}
              onTaskLoaded={onTaskLoaded}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <TaskCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
          defaultProjectId={task.project_id}
          defaultMotherTaskId={task.id}
        />
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <TaskEditModal
          task={task}
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <TaskDeleteModal
          task={task}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}; 