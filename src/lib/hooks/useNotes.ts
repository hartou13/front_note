import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getApiUrl } from '../config/api';

export interface Tag {
  id: string;
  name: string;
  color: string;
  created_at: string;
  user_id: string;
}

export interface NoteTag {
  id: string;
  tag_id: string;
  note_id: string;
  tag: Tag;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  project_id: string;
  user_id: string;
  created_at: string;
  hidden: boolean;
  tags?: NoteTag[];
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

export interface NotesResponse {
  data: Note[];
  pagination: {
    total: number;
    page: number;
    pageSize: number;
  };
}

interface CreateNoteData {
  title: string;
  content: string;
  project_id: string;
  hidden?: boolean;
  tags?: string[]; // IDs des tags
}

interface UpdateNoteData {
  title: string;
  content: string;
  project_id: string;
  hidden?: boolean;
  tags?: string[]; // IDs des tags
}

interface NotesFilters {
  page?: number;
  project_id?: string;
  tag_ids?: string[];
  query?: string;
}

// Fonctions API
const fetchNotes = async (filters: NotesFilters = {}): Promise<NotesResponse> => {
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
  
  if (filters.tag_ids && filters.tag_ids.length > 0) {
    filters.tag_ids.forEach(tagId => {
      params.append('tag_ids', tagId);
    });
  }
  
  if (filters.query && filters.query.trim() !== '') {
    params.append('query', filters.query.trim());
  }

  const url = getApiUrl('/note') + (params.toString() ? `?${params.toString()}` : '');

  const response = await fetch(url, {
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
export const useNotes = (filters: NotesFilters = {}, customQueryKey?: any[]) => {
  return useQuery({
    queryKey: customQueryKey || ['notes', filters],
    queryFn: () => fetchNotes(filters),
    staleTime: 0, // Pas de cache, toujours refetch
    gcTime: 0, // Pas de cache
    refetchOnMount: true,
    refetchOnWindowFocus: false,
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