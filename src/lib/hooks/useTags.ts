import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '../config/api';

export interface Tag {
  id: string;
  name: string;
  created_at: string;
  user_id: string;
}

interface CreateTagData {
  name: string;
}

interface UpdateTagData {
  name: string;
}

// Fonctions API
const fetchTags = async (): Promise<Tag[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl('/tag'), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des tags');
  }

  return response.json();
};

const createTag = async (data: CreateTagData): Promise<Tag> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl('/tag'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création du tag');
  }

  return response.json();
};

const updateTag = async ({ id, data }: { id: string; data: UpdateTagData }): Promise<Tag> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl(`/tag/${id}`), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du tag');
  }

  return response.json();
};

const deleteTag = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl(`/tag/${id}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression du tag');
  }
};

// Hooks
export const useTags = () => {
  return useQuery({
    queryKey: ['tags'],
    queryFn: fetchTags,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      // Invalider et recharger la liste des tags
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error: Error) => {
      console.error('Erreur de création de tag:', error.message);
    },
  });
};

export const useUpdateTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      // Invalider et recharger la liste des tags
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error: Error) => {
      console.error('Erreur de mise à jour de tag:', error.message);
    },
  });
};

export const useDeleteTag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      // Invalider et recharger la liste des tags
      queryClient.invalidateQueries({ queryKey: ['tags'] });
    },
    onError: (error: Error) => {
      console.error('Erreur de suppression de tag:', error.message);
    },
  });
}; 