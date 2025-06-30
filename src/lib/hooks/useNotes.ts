import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '../config/api';

export interface Note {
  id: string;
  title: string;
  content: string;
  project_id: string;
  user_id: string;
  created_at: string;
  project: {
    id: string;
    name: string;
    description: string;
    mother_project_id: string | null;
    user_id: string;
    created_at: string;
    is_active: boolean;
    color: string;
  };
}

interface CreateNoteData {
  title: string;
  content: string;
  project_id: string;
}

interface UpdateNoteData {
  title: string;
  content: string;
  project_id: string;
}

// Fonctions API
const fetchNotes = async (): Promise<Note[]> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl('/note'), {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des notes');
  }

  return response.json();
};

const createNote = async (data: CreateNoteData): Promise<Note> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl('/note'), {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la création de la note');
  }

  return response.json();
};

const updateNote = async ({ id, data }: { id: string; data: UpdateNoteData }): Promise<Note> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl(`/note/${id}`), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour de la note');
  }

  return response.json();
};

const deleteNote = async (id: string): Promise<void> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl(`/note/${id}`), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la suppression de la note');
  }
};

// Hooks
export const useNotes = () => {
  return useQuery({
    queryKey: ['notes'],
    queryFn: fetchNotes,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useCreateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNote,
    onSuccess: () => {
      // Invalider et recharger la liste des notes
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error: Error) => {
      console.error('Erreur de création de note:', error.message);
    },
  });
};

export const useUpdateNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateNote,
    onSuccess: () => {
      // Invalider et recharger la liste des notes
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error: Error) => {
      console.error('Erreur de mise à jour de note:', error.message);
    },
  });
};

export const useDeleteNote = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNote,
    onSuccess: () => {
      // Invalider et recharger la liste des notes
      queryClient.invalidateQueries({ queryKey: ['notes'] });
    },
    onError: (error: Error) => {
      console.error('Erreur de suppression de note:', error.message);
    },
  });
}; 