import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '../config/api';

export interface Project {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  user_id: string;
  mother_task_id: string | null;
  created_at: string;
  description: string;
  name: string;
  project_id: string;
  status: number;
  updated_at: string;
  project: Project;
}

export interface TasksResponse {
  data?: Task[];
  pagination?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

// Type pour la réponse directe de l'API (tableau de tâches)
export type TasksArrayResponse = Task[];

// Types de statuts
export type TaskStatusNumber = 0 | 25 | 50 | 100;
export type TaskStatusString = 'todo' | 'waiting' | 'in_progress' | 'done';

// Conversion des statuts
export const taskStatusMap: Record<TaskStatusNumber, TaskStatusString> = {
  0: 'todo',
  25: 'waiting', 
  50: 'in_progress',
  100: 'done'
};

export const taskStatusReverseMap: Record<TaskStatusString, TaskStatusNumber> = {
  'todo': 0,
  'waiting': 25,
  'in_progress': 50,
  'done': 100
};

// Fonctions de conversion
export const numberToStatus = (status: number): TaskStatusString => {
  return taskStatusMap[status as TaskStatusNumber] || 'todo';
};

export const statusToNumber = (status: TaskStatusString): TaskStatusNumber => {
  return taskStatusReverseMap[status] || 0;
};

export const getStatusLabel = (status: TaskStatusString): string => {
  const labels: Record<TaskStatusString, string> = {
    'todo': 'À faire',
    'waiting': 'En attente',
    'in_progress': 'En cours',
    'done': 'Terminée'
  };
  return labels[status];
};

export const getStatusColor = (status: TaskStatusString): string => {
  const colors: Record<TaskStatusString, string> = {
    'todo': 'text-gray-600',
    'waiting': 'text-yellow-600',
    'in_progress': 'text-blue-600',
    'done': 'text-green-600'
  };
  return colors[status];
};

interface CreateTaskData {
  name: string;
  description: string;
  project_id: string;
  mother_task_id?: string | null;
  status?: TaskStatusString;
}

interface UpdateTaskData {
  name?: string;
  description?: string;
  project_id?: string;
  mother_task_id?: string | null;
  status?: TaskStatusString;
}

interface TasksFilters {
  page?: number;
  project_id?: string;
  status?: TaskStatusNumber;
}

// Fonctions API
const fetchTasks = async (filters: TasksFilters = {}): Promise<TasksResponse> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  // Construire les paramètres de requête
  const params = new URLSearchParams();
  
  if (filters.page !== undefined) {
    params.append('page', filters.page.toString());
  }
  
  if (filters.project_id && filters.project_id !== '') {
    params.append('project_id', filters.project_id);
  }
  
  if (filters.status !== undefined) {
    params.append('status', filters.status.toString());
  }

  const url = getApiUrl('/task') + (params.toString() ? `?${params.toString()}` : '');

  const response = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des tâches');
  }

  const data = await response.json();
  
  // Gérer les deux formats de réponse possibles
  // 1. Tableau direct de tâches
  // 2. Objet avec propriété data
  if (Array.isArray(data)) {
    return { data };
  }
  
  return data;
};

const createTask = async (data: CreateTaskData): Promise<Task> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  // Convertir le statut string en nombre pour l'API
  const apiData = {
    ...data,
    status: data.status ? statusToNumber(data.status) : 0
  };

  const response = await fetch(getApiUrl('/task'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création de la tâche');
  }

  return response.json();
};

const updateTask = async ({ id, data }: { id: string; data: UpdateTaskData }): Promise<Task> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  // Convertir le statut string en nombre pour l'API
  const apiData = {
    ...data,
    status: data.status ? statusToNumber(data.status) : undefined
  };

  const response = await fetch(getApiUrl(`/task/${id}`), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiData),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour de la tâche');
  }

  return response.json();
};

const deleteTask = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl(`/task/${id}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression de la tâche');
  }
};

// Hooks
export const useTasks = (filters: TasksFilters = {}, customQueryKey?: any[]) => {
  return useQuery({
    queryKey: customQueryKey || ['tasks', filters],
    queryFn: () => fetchTasks(filters),
    staleTime: 0, // Pas de cache, toujours refetch
    gcTime: 0, // Pas de cache
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });
};

export const useCreateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: (newTask) => {
      // Ajouter la nouvelle tâche à la liste principale
      queryClient.setQueryData(['tasks'], (oldData: TasksResponse | TasksArrayResponse | undefined) => {
        if (!oldData) return oldData;

        // Gérer les deux formats de réponse possibles
        if (Array.isArray(oldData)) {
          return [...oldData, newTask];
        } else if (oldData.data) {
          return {
            ...oldData,
            data: [...oldData.data, newTask]
          };
        }
        return oldData;
      });

      // Si la nouvelle tâche a une mère, l'ajouter aux sous-tâches de la mère
      if (newTask.mother_task_id) {
        queryClient.setQueryData(['task', newTask.mother_task_id], (oldData: TaskWithDaughters | undefined) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            daughters: [...(oldData.daughters || []), newTask]
          };
        });
      }

      // Invalider les requêtes de tâches pour forcer un refresh si nécessaire
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useUpdateTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTask,
    onSuccess: (updatedTask) => {
      // Mettre à jour la tâche dans la liste principale
      queryClient.setQueryData(['tasks'], (oldData: TasksResponse | TasksArrayResponse | undefined) => {
        if (!oldData) return oldData;

        // Gérer les deux formats de réponse possibles
        if (Array.isArray(oldData)) {
          return oldData.map(task => 
            task.id === updatedTask.id ? updatedTask : task
          );
        } else if (oldData.data) {
          return {
            ...oldData,
            data: oldData.data.map(task => 
              task.id === updatedTask.id ? updatedTask : task
            )
          };
        }
        return oldData;
      });

      // Mettre à jour la tâche individuelle si elle est en cache
      queryClient.setQueryData(['task', updatedTask.id], (oldData: TaskWithDaughters | undefined) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          ...updatedTask
        };
      });

      // Mettre à jour la tâche dans les sous-tâches des autres tâches
      queryClient.setQueriesData({ queryKey: ['task'] }, (oldData: TaskWithDaughters | undefined) => {
        if (!oldData || !oldData.daughters) return oldData;
        
        const updatedDaughters = oldData.daughters.map(daughter => 
          daughter.id === updatedTask.id ? updatedTask : daughter
        );
        
        if (JSON.stringify(oldData.daughters) !== JSON.stringify(updatedDaughters)) {
          return {
            ...oldData,
            daughters: updatedDaughters
          };
        }
        return oldData;
      });

      // Invalider les requêtes de tâches pour forcer un refresh si nécessaire
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTask,
    onSuccess: (_, deletedTaskId) => {
      // Supprimer la tâche de la liste principale
      queryClient.setQueryData(['tasks'], (oldData: TasksResponse | TasksArrayResponse | undefined) => {
        if (!oldData) return oldData;

        // Gérer les deux formats de réponse possibles
        if (Array.isArray(oldData)) {
          return oldData.filter(task => task.id !== deletedTaskId);
        } else if (oldData.data) {
          return {
            ...oldData,
            data: oldData.data.filter(task => task.id !== deletedTaskId)
          };
        }
        return oldData;
      });

      // Supprimer la tâche des sous-tâches des autres tâches
      queryClient.setQueriesData({ queryKey: ['task'] }, (oldData: TaskWithDaughters | undefined) => {
        if (!oldData || !oldData.daughters) return oldData;
        
        const updatedDaughters = oldData.daughters.filter(daughter => daughter.id !== deletedTaskId);
        
        if (oldData.daughters.length !== updatedDaughters.length) {
          return {
            ...oldData,
            daughters: updatedDaughters
          };
        }
        return oldData;
      });

      // Supprimer la tâche individuelle du cache
      queryClient.removeQueries({ queryKey: ['task', deletedTaskId] });

      // Invalider les requêtes de tâches pour forcer un refresh si nécessaire
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
};

// Type pour une tâche avec ses sous-tâches
export interface TaskWithDaughters extends Task {
  daughters: Task[];
}

// Hook pour récupérer une tâche spécifique avec ses sous-tâches
export const useTask = (taskId: string | null) => {
  return useQuery({
    queryKey: ['task', taskId],
    queryFn: async (): Promise<TaskWithDaughters> => {
      if (!taskId) {
        throw new Error('ID de tâche manquant');
      }

      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token manquant');
      }

      const response = await fetch(getApiUrl(`/task/${taskId}`), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la tâche');
      }

      return response.json();
    },
    enabled: !!taskId,
  });
}; 