import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '../config/api';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  first_name: string;
  last_name: string;
  email: string;
}

interface UpdateProfileData {
  first_name: string;
  last_name: string;
  email: string;
  language: string;
}

interface UpdateProfileResponse {
  first_name: string;
  last_name: string;
  id: string;
  email: string;
  language: string;
}

const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
  const response = await fetch(getApiUrl('/auth/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error('Échec de la connexion. Vérifiez vos identifiants.');
  }

  return response.json();
};

const logoutUser = async (token: string): Promise<void> => {
  const response = await fetch(getApiUrl('/auth/logout'), {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la déconnexion.');
  }
};

const updateProfile = async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    throw new Error('Token manquant');
  }

  const response = await fetch(getApiUrl('/user'), {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('Erreur lors de la mise à jour du profil.');
  }

  return response.json();
};

export const useLogin = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data: LoginResponse) => {
      // Stocker les informations de l'utilisateur dans localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('firstName', data.first_name);
      localStorage.setItem('lastName', data.last_name);
      localStorage.setItem('email', data.email);
      
      // Redirection vers la page principale
      router.push('/main');
    },
    onError: (error: Error) => {
      console.error('Erreur de connexion:', error.message);
    },
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (data: UpdateProfileResponse) => {
      // Mettre à jour les informations dans localStorage
      localStorage.setItem('firstName', data.first_name);
      localStorage.setItem('lastName', data.last_name);
      localStorage.setItem('email', data.email);
      localStorage.setItem('language', data.language);
    },
    onError: (error: Error) => {
      console.error('Erreur de mise à jour du profil:', error.message);
    },
  });
};

export const useLogout = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem('token');
      if (token) {
        await logoutUser(token);
      }
    },
    onSuccess: () => {
      // Supprimer les informations du localStorage après succès de l'API
      localStorage.removeItem('token');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('email');
      localStorage.removeItem('language');
      
      // Rediriger vers la page de connexion
      router.push('/login');
    },
    onError: (error: Error) => {
      console.error('Erreur de déconnexion:', error.message);
      // Même en cas d'erreur, on nettoie le localStorage et on redirige
      localStorage.removeItem('token');
      localStorage.removeItem('firstName');
      localStorage.removeItem('lastName');
      localStorage.removeItem('email');
      localStorage.removeItem('language');
      
      router.push('/login');
    },
  });
}; 