'use client';

import { Filter, Plus, Search } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/Layout/AppLayout';
import { TaskCard } from '../../components/Tasks/TaskCard';
import { TaskCreateModal } from '../../components/Tasks/TaskCreateModal';
import { TaskFilters } from '../../components/Tasks/TaskFilters';
import { Button } from '../../components/UI/button';
import { numberToStatus, Task, useTasks } from '../../lib/hooks/useTasks';

export default function TasksPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    project_id: '',
  });

  // Récupérer toutes les tâches sans filtres
  const { data: tasksResponse, isLoading, error } = useTasks({});

  // Gérer les deux formats possibles de réponse
  let allTasks: Task[] = [];
  if (Array.isArray(tasksResponse)) {
    // Si la réponse est directement un tableau
    allTasks = tasksResponse;
  } else if (tasksResponse?.data) {
    // Si la réponse a une propriété data
    allTasks = tasksResponse.data;
  } else {
    // Fallback
    allTasks = [];
  }

  // Fonction pour vérifier si une tâche correspond à la recherche
  const taskMatchesSearch = (task: Task, searchLower: string): boolean => {
    return (
      task.name.toLowerCase().includes(searchLower) ||
      (task.description && task.description.toLowerCase().includes(searchLower)) ||
      task.project.name.toLowerCase().includes(searchLower)
    );
  };

  // Fonction pour vérifier si une tâche ou ses sous-tâches déjà chargées correspondent à la recherche
  const taskOrLoadedDaughtersMatchSearch = (task: Task, searchLower: string, loadedTasks: Map<string, any>): boolean => {
    // Vérifier la tâche elle-même
    if (taskMatchesSearch(task, searchLower)) {
      return true;
    }
    
    // Si pas de recherche, pas besoin de vérifier les sous-tâches
    if (!searchLower) {
      return false;
    }
    
    // Vérifier les sous-tâches déjà chargées en cache
    const taskWithDaughters = loadedTasks.get(task.id);
    if (taskWithDaughters?.daughters && taskWithDaughters.daughters.length > 0) {
      // Vérifier récursivement chaque sous-tâche déjà chargée
      for (const daughter of taskWithDaughters.daughters) {
        if (taskMatchesSearch(daughter, searchLower) || taskOrLoadedDaughtersMatchSearch(daughter, searchLower, loadedTasks)) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Filtrer les tâches par projet (frontend) - mémorisé avec useMemo
  const projectFilteredTasks = useMemo(() => {
    return filters.project_id 
      ? allTasks.filter(task => task.project_id === filters.project_id)
      : allTasks;
  }, [allTasks, filters.project_id]);

  // Filtrer les tâches par recherche (frontend avec recherche dans le cache)
  const [searchFilteredTasks, setSearchFilteredTasks] = useState<Task[]>(projectFilteredTasks);
  const [loadedTasksCache, setLoadedTasksCache] = useState<Map<string, any>>(new Map());

  // Fonction pour ajouter une tâche chargée au cache (mémorisée avec useCallback)
  const addToCache = useCallback((taskId: string, taskWithDaughters: any) => {
    setLoadedTasksCache(prev => new Map(prev).set(taskId, taskWithDaughters));
  }, []);

  // Effet pour mettre à jour la recherche de manière synchrone
  useEffect(() => {
    if (!searchTerm) {
      setSearchFilteredTasks(projectFilteredTasks);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const matchingTasks: Task[] = [];

    for (const task of projectFilteredTasks) {
      if (taskOrLoadedDaughtersMatchSearch(task, searchLower, loadedTasksCache)) {
        matchingTasks.push(task);
      }
    }

    setSearchFilteredTasks(matchingTasks);
  }, [searchTerm, projectFilteredTasks, loadedTasksCache]);

  // Organiser les tâches par statut
  const tasksByStatus = {
    todo: searchFilteredTasks.filter(task => numberToStatus(task.status) === 'todo'),
    waiting: searchFilteredTasks.filter(task => numberToStatus(task.status) === 'waiting'),
    in_progress: searchFilteredTasks.filter(task => numberToStatus(task.status) === 'in_progress'),
    done: searchFilteredTasks.filter(task => numberToStatus(task.status) === 'done')
  };

  const statusConfig = [
    { key: 'todo', label: 'À faire', color: 'text-muted-foreground' },
    { key: 'waiting', label: 'En attente', color: 'text-yellow-600' },
    { key: 'in_progress', label: 'En cours', color: 'text-blue-600' },
    { key: 'done', label: 'Terminé', color: 'text-green-600' }
  ] as const;

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (error) {
    return (
      <AppLayout>
        <div className="container mx-auto p-6">
          <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
            <p className="text-destructive">
              ❌ Erreur lors du chargement des tâches : {error.message}
            </p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-2"
              variant="outline"
            >
              Réessayer
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mes Tâches</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos tâches et suivez votre progression
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle tâche
            </Button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <input
              type="text"
              placeholder="Rechercher une tâche..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Filters Toggle */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtres
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <TaskFilters
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : searchFilteredTasks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
              <Plus className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Aucune tâche trouvée
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || Object.values(filters).some(f => f !== '' && f !== undefined)
                ? 'Aucune tâche ne correspond à vos critères de recherche.'
                : 'Commencez par créer votre première tâche.'
              }
            </p>
            {!searchTerm && !Object.values(filters).some(f => f !== '' && f !== undefined) && (
              <Button onClick={() => setShowCreateModal(true)}>
                Créer une tâche
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statusConfig.map(({ key, label, color }) => (
              <div key={key} className="space-y-4">
                {/* Column Header */}
                <div className="flex items-center justify-between">
                  <h3 className={`font-semibold ${color}`}>
                    {label}
                  </h3>
                  <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                    {tasksByStatus[key].length}
                  </span>
                </div>
                
                {/* Tasks in this status */}
                <div className="space-y-3">
                  {tasksByStatus[key].map((task: Task) => (
                    <TaskCard 
                      key={task.id} 
                      task={task} 
                      onTaskLoaded={addToCache}
                    />
                  ))}
                  
                  {tasksByStatus[key].length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p className="text-sm">Aucune tâche</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create Modal */}
        {showCreateModal && (
          <TaskCreateModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
      </div>
    </AppLayout>
  );
} 