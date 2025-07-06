'use client';

import { EmptyNotesState } from '@/components/Notes/EmptyNotesState';
import { NotesCalendarView } from '@/components/Notes/NotesCalendarView';
import { NotesListView } from '@/components/Notes/NotesListView';
import { useTags } from '@/lib/hooks/useTags';
import { CalendarDays, List, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { AppLayout } from '../../components/Layout/AppLayout';
import { NoteDeleteModal } from '../../components/Notes/NoteDeleteModal';
import { NoteEditModal } from '../../components/Notes/NoteEditModal';
import { NotesFilters } from '../../components/Notes/NotesFilters';
import { Note, useNotes } from '../../lib/hooks/useNotes';
import { useProjects } from '../../lib/hooks/useProjects';

export default function NotesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProjectFilter, setSelectedProjectFilter] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isFilterDropdownOpen, setIsFilterDropdownOpen] = useState(false);
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [isModalEditing, setIsModalEditing] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [currentPage, setCurrentPage] = useState(0);
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const router = useRouter();
  
  // Construire les filtres pour l'API - pagination + projet + tags
  const filters = useMemo(() => ({
    page: currentPage,
    project_id: selectedProjectFilter || undefined,
    tag_ids: selectedTags.length > 0 ? selectedTags : undefined,
  }), [currentPage, selectedProjectFilter, selectedTags]);

  // Clé de requête stable pour React Query
  const queryKey = useMemo(
    () => [
      'notes',
      currentPage,
      selectedProjectFilter || '',
      JSON.stringify([...selectedTags].sort()), // Clé stable pour les tags
      refreshKey,
    ],
    [currentPage, selectedProjectFilter, selectedTags, refreshKey]
  );

  const { data: notesResponse, isLoading: notesLoading, error } = useNotes(filters, queryKey);
  const { data: projects } = useProjects();
  const { data: tags = [] } = useTags();

  // Mettre à jour les notes quand la réponse change
  useEffect(() => {
    if (notesResponse) {
      if (currentPage === 0) {
        // Première page, remplacer toutes les notes
        setAllNotes(notesResponse.data);
      } else {
        // Pages suivantes, ajouter aux notes existantes
        setAllNotes(prev => [...prev, ...notesResponse.data]);
      }
      
      // Vérifier s'il y a plus de pages
      const totalPages = Math.ceil(notesResponse.pagination.total / notesResponse.pagination.pageSize);
      setHasMorePages(currentPage < totalPages - 1);
    }
  }, [notesResponse, currentPage]);

  // Réinitialiser la pagination quand le filtre projet change
  useEffect(() => {
    setCurrentPage(0);
    setAllNotes([]);
  }, [selectedProjectFilter, selectedTags]);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    setIsLoading(false);
  }, [router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Aujourd\'hui';
    } else if (diffDays === 2) {
      return 'Hier';
    } else if (diffDays <= 7) {
      return `Il y a ${diffDays - 1} jours`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Fonction pour tronquer le contenu
  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Compter les notes par projet (pour l'affichage dans le dropdown)
  const getNotesCountByProject = (projectId: string) => {
    return allNotes.filter(note => note.project_id === projectId).length;
  };

  const handleFilterSelect = (projectId: string) => {
    setSelectedProjectFilter(projectId);
    setIsFilterDropdownOpen(false);
    setRefreshKey(prev => prev + 1); // Force refetch
  };

  const clearFilter = () => {
    setSelectedProjectFilter('');
    setRefreshKey(prev => prev + 1); // Force refetch
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
    setRefreshKey(prev => prev + 1); // Force refetch
  };

  const handleTagRemove = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
    setRefreshKey(prev => prev + 1); // Force refetch
  };

  const clearAllFilters = () => {
    setSelectedProjectFilter('');
    setSelectedTags([]);
    setRefreshKey(prev => prev + 1); // Force refetch
  };

  const handleLoadMore = () => {
    setCurrentPage(prev => prev + 1);
  };

  const handleMenuToggle = (noteId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setOpenMenuId(openMenuId === noteId ? null : noteId);

  };

  const handleEdit = (note: Note, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setEditingNote(note);
    setIsModalEditing(true);
    setOpenMenuId(null);
  };

  const handleShow = (note: Note, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setEditingNote(note);
    setIsModalEditing(false);
    setOpenMenuId(null);
  };

  const handleDelete = (note: Note, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setDeletingNote(note);
    setOpenMenuId(null);
  };

  const handleEditModeChange = (isEditing: boolean) => {
    setIsModalEditing(isEditing);
  };

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      // Vérifier si le clic est en dehors du menu et du bouton
      if (!target.closest('.note-menu-button') && !target.closest('.note-context-menu')) {
        setOpenMenuId(null);
      }
    };
    
    if (openMenuId) {
      // Ajouter l'écouteur immédiatement
      document.addEventListener('click', handleClickOutside);
      
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [openMenuId]);

  // Fonctions pour la vue calendrier
  const getCurrentMonth = () => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth()
    };
  };

  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getNotesForDate = (date: Date) => {
    return allNotes.filter(note => {
      const noteDate = new Date(note.created_at);
      return noteDate.getDate() === date.getDate() &&
             noteDate.getMonth() === date.getMonth() &&
             noteDate.getFullYear() === date.getFullYear();
    });
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  const goToToday = () => {
    setCurrentMonth(getCurrentMonth());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Notes</h1>
            <p className="text-muted-foreground">
              {notesResponse?.pagination.total || 0} note{(notesResponse?.pagination.total || 0) !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-muted/50 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vue liste"
              >
                <List className="w-4 h-4" />
                <span className="text-sm">Liste</span>
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  viewMode === 'calendar'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
                title="Vue calendrier"
              >
                <CalendarDays className="w-4 h-4" />
                <span className="text-sm">Calendrier</span>
              </button>
            </div>
            
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              Nouvelle note
            </button>
          </div>
        </div>

        {/* Filtres */}
        <NotesFilters
          projects={projects || []}
          tags={tags}
          selectedProjectFilter={selectedProjectFilter}
          selectedTags={selectedTags}
          isFilterDropdownOpen={isFilterDropdownOpen}
          isTagDropdownOpen={isTagDropdownOpen}
          onProjectFilterChange={handleFilterSelect}
          onTagToggle={handleTagToggle}
          onTagRemove={handleTagRemove}
          onClearAllFilters={clearAllFilters}
          onFilterDropdownToggle={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
          onTagDropdownToggle={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
          totalNotes={notesResponse?.pagination.total || 0}
          getNotesCountByProject={getNotesCountByProject}
        />

        {/* Messages d'erreur */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive text-sm">
              ❌ Erreur lors du chargement des notes : {error.message}
            </p>
          </div>
        )}

        {/* Loading state */}
        {notesLoading && currentPage === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Notes Display */}
        {!notesLoading && allNotes && (
          <>
            {allNotes.length === 0 ? (
              <EmptyNotesState
                hasFilters={!!selectedProjectFilter || selectedTags.length > 0}
                onCreateNote={() => setIsCreateModalOpen(true)}
              />
            ) : viewMode === 'list' ? (
              <NotesListView
                notes={allNotes}
                openMenuId={openMenuId}
                onMenuToggle={handleMenuToggle}
                onShow={handleShow}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onLoadMore={handleLoadMore}
                isLoading={notesLoading}
                hasMore={hasMorePages}
                formatDate={formatDate}
                formatTime={formatTime}
                truncateContent={truncateContent}
              />
            ) : (
              <NotesCalendarView
                notes={allNotes}
                currentMonth={currentMonth}
                onPreviousMonth={goToPreviousMonth}
                onNextMonth={goToNextMonth}
                onToday={goToToday}
                onShow={handleShow}
                onLoadMore={handleLoadMore}
                isLoading={notesLoading}
                hasMore={hasMorePages}
                getDaysInMonth={getDaysInMonth}
                getFirstDayOfMonth={getFirstDayOfMonth}
                getNotesForDate={getNotesForDate}
              />
            )}
          </>
        )}

        {/* Modals */}
        <NoteEditModal
          note={editingNote}
          isOpen={!!editingNote}
          onClose={() => setEditingNote(null)}
          isEditing={isModalEditing}
          onEditModeChange={handleEditModeChange}
        />

        <NoteEditModal
          note={null}
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />

        {deletingNote && (
          <NoteDeleteModal
            note={deletingNote}
            isOpen={!!deletingNote}
            onClose={() => setDeletingNote(null)}
          />
        )}
      </div>
    </AppLayout>
  );
} 