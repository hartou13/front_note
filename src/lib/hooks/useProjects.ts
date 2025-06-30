import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '../config/api';

export interface Project {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  mother_project_id: string | null;
  user_id: string;
  created_at: string;
  color: string;
}

interface UpdateProjectData {
  name: string;
  description: string;
  is_active: boolean;
  mother_project_id?: string | null;
  color: string;
}

interface CreateProjectData {
  name: string;
  description: string;
  is_active?: boolean;
  mother_project_id?: string | null;
  color: string;
}

// Fonctions API
const fetchProjects = async (): Promise<Project[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl('/project'), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des projets');
  }

  return response.json();
};

const updateProject = async ({ id, data }: { id: string; data: UpdateProjectData }): Promise<Project> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl(`/project/${id}`), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du projet');
  }

  return response.json();
};

const deleteProject = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl(`/project/${id}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression du projet');
  }
};

const createProject = async (data: CreateProjectData): Promise<Project> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl('/project'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création du projet');
  }

  return response.json();
};

// Hooks
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProject,
    onSuccess: () => {
      // Invalider et recharger la liste des projets
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      console.error('Erreur de mise à jour du projet:', error.message);
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      // Invalider et recharger la liste des projets
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      console.error('Erreur de suppression du projet:', error.message);
    },
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      // Invalider et recharger la liste des projets
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
    onError: (error: Error) => {
      console.error('Erreur de création du projet:', error.message);
    },
  });
}; 