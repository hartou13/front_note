'use client';

import { Badge } from '@/components/UI/badge';
import { LinkifyText } from '@/components/UI/LinkifyText';
import { useTags } from '@/lib/hooks/useTags';
import { Calendar, CalendarDays, ChevronDown, Clock, Edit, Eye, FileText, Filter, List, MoreVertical, Plus, Tag as TagIcon, Trash2, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from '../../components/Layout/AppLayout';
import { NoteDeleteModal } from '../../components/Notes/NoteDeleteModal';
import { NoteEditModal } from '../../components/Notes/NoteEditModal';
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

  const router = useRouter();
  
  const { data: notes, isLoading: notesLoading, error } = useNotes();
  const { data: projects } = useProjects();
  const { data: tags = [] } = useTags();

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

  // Filtrer les notes selon le projet sélectionné et les tags
  const filteredNotes = notes?.filter(note => {
    // Filtre par projet
    const matchesProject = !selectedProjectFilter || note.project_id === selectedProjectFilter;
    
    // Filtre par tags
    const matchesTags = selectedTags.length === 0 || 
                       selectedTags.some(tagId => 
                         note.tags?.some(noteTag => noteTag.tag_id === tagId)
                       );
    
    return matchesProject && matchesTags;
  }) || [];

  // Trouver le projet sélectionné pour le filtre
  const selectedFilterProject = projects?.find(p => p.id === selectedProjectFilter);

  // Compter les notes par projet
  const getNotesCountByProject = (projectId: string) => {
    return notes?.filter(note => note.project_id === projectId).length || 0;
  };

  const handleFilterSelect = (projectId: string) => {
    setSelectedProjectFilter(projectId);
    setIsFilterDropdownOpen(false);
  };

  const clearFilter = () => {
    setSelectedProjectFilter('');
    setSelectedTags([]);
  };

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleTagRemove = (tagId: string) => {
    setSelectedTags(prev => prev.filter(id => id !== tagId));
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
    return filteredNotes.filter(note => {
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
              {filteredNotes.length} note{filteredNotes.length !== 1 ? 's' : ''}
              {selectedProjectFilter && ` dans ${selectedFilterProject?.name}`}
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

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/30 rounded-lg">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtres :</span>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            {/* Project Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsFilterDropdownOpen(!isFilterDropdownOpen)}
                className="flex items-center justify-between w-full sm:w-auto px-3 py-2 border border-input rounded-lg hover:bg-accent transition-colors text-sm"
              >
                <div className="flex items-center gap-2">
                  {selectedFilterProject ? (
                    <>
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: selectedFilterProject.color }}
                      />
                      <span>{selectedFilterProject.name}</span>
                    </>
                  ) : (
                    <span className="text-muted-foreground">Tous les projets</span>
                  )}
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Project Dropdown */}
              {isFilterDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsFilterDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto min-w-[250px]">
                    {/* Option "Tous les projets" */}
                    <button
                      onClick={() => handleFilterSelect('')}
                      className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between ${
                        !selectedProjectFilter ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full border border-border bg-muted" />
                        <span className="text-sm">Tous les projets</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {notes?.length || 0} note{(notes?.length || 0) !== 1 ? 's' : ''}
                      </span>
                    </button>

                    {/* Options des projets */}
                    {projects && projects.length > 0 ? (
                      projects
                        .filter(project => project.is_active)
                        .map((project) => {
                          const notesCount = getNotesCountByProject(project.id);
                          return (
                            <button
                              key={project.id}
                              onClick={() => handleFilterSelect(project.id)}
                              className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors flex items-center justify-between ${
                                selectedProjectFilter === project.id ? 'bg-accent' : ''
                              }`}
                            >
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <div 
                                  className="w-3 h-3 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: project.color }}
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="text-sm font-medium truncate block">{project.name}</span>
                                  {project.description && (
                                    <p className="text-xs text-muted-foreground truncate">
                                      {project.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <span className="text-xs text-muted-foreground ml-2">
                                {notesCount} note{notesCount !== 1 ? 's' : ''}
                              </span>
                            </button>
                          );
                        })
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Aucun projet disponible
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Tags Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
                className="flex items-center justify-between w-full sm:w-auto px-3 py-2 border border-input rounded-lg hover:bg-accent transition-colors text-sm"
              >
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {selectedTags.length > 0 ? `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''}` : 'Tous les tags'}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              </button>

              {/* Tags Dropdown */}
              {isTagDropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setIsTagDropdownOpen(false)}
                  />
                  <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto min-w-[200px]">
                    {tags.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {tags.map((tag) => (
                          <button
                            key={tag.id}
                            onClick={() => handleTagToggle(tag.id)}
                            className={`w-full px-3 py-2 text-left hover:bg-accent transition-colors rounded flex items-center gap-2 ${
                              selectedTags.includes(tag.id) ? 'bg-accent' : ''
                            }`}
                          >
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: tag.color }}
                            />
                            <span className="text-sm">{tag.name}</span>
                            {selectedTags.includes(tag.id) && (
                              <div className="ml-auto text-primary">✓</div>
                            )}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="px-3 py-2 text-sm text-muted-foreground">
                        Aucun tag disponible
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Tags sélectionnés et bouton d'effacement */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
              {/* Tags sélectionnés */}
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {selectedTags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <Badge
                        key={tagId}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => handleTagRemove(tagId)}
                      >
                        <div
                          className="w-2 h-2 rounded-full mr-1"
                          style={{ backgroundColor: tag.color }}
                        />
                        {tag.name}
                        <span className="ml-1">×</span>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}

              {/* Clear Filter Button */}
              {(selectedProjectFilter || selectedTags.length > 0) && (
                <button
                  onClick={clearFilter}
                  className="flex items-center justify-center gap-1 px-3 py-2 text-sm bg-muted hover:bg-muted/80 rounded transition-colors w-full sm:w-auto"
                >
                  <X className="w-3 h-3" />
                  Effacer les filtres
                </button>
              )}
            </div>
          </div>
        </div>



        {/* Messages d'erreur */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive text-sm">
              ❌ Erreur lors du chargement des notes : {error.message}
            </p>
          </div>
        )}

        {/* Loading state */}
        {notesLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Notes Display */}
        {!notesLoading && filteredNotes && (
          <>
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {selectedProjectFilter || selectedTags.length > 0
                    ? 'Aucune note trouvée avec les filtres sélectionnés'
                    : 'Aucune note trouvée'
                  }
                </h3>
                <p className="text-muted-foreground mb-6">
                  {selectedProjectFilter || selectedTags.length > 0
                    ? 'Essayez de modifier vos filtres ou créez une nouvelle note'
                    : 'Créez votre première note pour commencer'
                  }
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Créer une note
                </button>
              </div>
            ) : viewMode === 'list' ? (
              // Vue Liste
              <div className="space-y-1">
                {filteredNotes.map((note) => {
                  const projectColor = note.project?.color || '#2973B2';
                  
                  return (
                    <div key={note.id} className="relative group">
                      {/* Menu Button - Positioned outside the clickable note area */}
                      <button
                        onClick={(e) => handleMenuToggle(note.id, e)}
                        className="note-menu-button absolute top-3 right-3 p-1.5 opacity-60 hover:opacity-100 hover:bg-accent rounded-full transition-all duration-200 bg-background/80 backdrop-blur-sm shadow-sm z-20"
                      >
                        <MoreVertical className="w-3 h-3 text-muted-foreground" />
                      </button>

                      {/* Context Menu - Only appears when menu is open */}
                      {openMenuId === note.id && (
                        <div className="note-context-menu absolute top-12 right-3 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 min-w-[140px]">
                          <button
                            onClick={(e) => handleShow(note, e)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
                          >
                            <Eye className="w-3 h-3" />
                            Afficher
                          </button>
                          <button
                            onClick={(e) => handleEdit(note, e)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
                          >
                            <Edit className="w-3 h-3" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => handleDelete(note, e)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-destructive hover:text-destructive transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            Supprimer
                          </button>
                        </div>
                      )}

                      {/* Note Item - Style liste horizontale */}
                      <div 
                        onClick={(e) => handleShow(note, e)}
                        className="flex items-center gap-4 p-4 bg-card hover:bg-accent/30 rounded-lg border border-border/50 transition-all duration-200 cursor-pointer"
                      >
                        {/* Indicateur coloré du projet */}
                        <div 
                          className="w-3 h-12 rounded-full flex-shrink-0"
                          style={{ backgroundColor: projectColor }}
                        />

                        {/* Contenu principal */}
                        <div className="flex-1 min-w-0 space-y-1">
                          {/* Titre de la note avec indicateur */}
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-medium text-foreground truncate flex-1">
                              {note.title}
                            </h3>
                          </div>
                          
                          {/* Contenu tronqué ou complet selon l'état */}
                          <p className={`text-sm text-muted-foreground ${
                            'line-clamp-1'
                          }`}>
                            {!note.hidden && (
                              <LinkifyText 
                                text={ truncateContent(note.content)}
                                className="text-muted-foreground"
                              />
                            )}
                          </p>
                          
                          {/* Informations du projet */}
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{note.project?.name || 'Projet inconnu'}</span>
                            {note.project?.description && (
                              <>
                                <span>•</span>
                                <span className="truncate">{note.project.description}</span>
                              </>
                            )}
                          </div>
                          
                          {/* Tags de la note */}
                          {note.tags && note.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {note.tags.map((noteTag) => (
                                <span
                                  key={noteTag.id}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs rounded-full border"
                                  style={{ 
                                    backgroundColor: `${noteTag.tag.color}20`,
                                    borderColor: noteTag.tag.color,
                                    color: noteTag.tag.color
                                  }}
                                >
                                  <div
                                    className="w-2 h-2 rounded-full"
                                    style={{ backgroundColor: noteTag.tag.color }}
                                  />
                                  {noteTag.tag.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Date et heure */}
                        <div className="flex flex-col items-end text-xs text-muted-foreground space-y-1 flex-shrink-0">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(note.created_at)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(note.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // Vue Calendrier
              <div className="bg-card border border-border rounded-lg p-6">
                {/* Header du calendrier */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-foreground">
                    {new Date(currentMonth.year, currentMonth.month).toLocaleDateString('fr-FR', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={goToPreviousMonth}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                      title="Mois précédent"
                    >
                      <ChevronDown className="w-4 h-4 rotate-90" />
                    </button>
                    <button
                      onClick={goToToday}
                      className="px-3 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    >
                      Aujourd'hui
                    </button>
                    <button
                      onClick={goToNextMonth}
                      className="p-2 hover:bg-accent rounded-lg transition-colors"
                      title="Mois suivant"
                    >
                      <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                  </div>
                </div>

                {/* Grille du calendrier */}
                <div className="grid grid-cols-7 gap-1">
                  {/* En-têtes des jours */}
                  {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map((day) => (
                    <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
                      {day}
                    </div>
                  ))}

                  {/* Jours du mois précédent */}
                  {Array.from({ length: getFirstDayOfMonth(currentMonth.year, currentMonth.month) }).map((_, index) => (
                    <div key={`prev-${index}`} className="p-2 min-h-[80px] bg-muted/20 rounded-lg" />
                  ))}

                  {/* Jours du mois actuel */}
                  {Array.from({ length: getDaysInMonth(currentMonth.year, currentMonth.month) }).map((_, index) => {
                    const day = index + 1;
                    const date = new Date(currentMonth.year, currentMonth.month, day);
                    const notesForDate = getNotesForDate(date);
                    const isToday = new Date().toDateString() === date.toDateString();

                    return (
                      <div
                        key={day}
                        className={`p-2 min-h-[80px] border border-border/50 rounded-lg transition-colors ${
                          isToday ? 'bg-primary/10 border-primary/30' : 'hover:bg-accent/20'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${
                            isToday ? 'text-primary' : 'text-foreground'
                          }`}>
                            {day}
                          </span>
                          {notesForDate.length > 0 && (
                            <span className="text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                              {notesForDate.length}
                            </span>
                          )}
                        </div>
                        
                        {/* Notes pour ce jour */}
                        <div className="space-y-1">
                          {notesForDate.slice(0, 2).map((note) => (
                            <div
                              key={note.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleShow(note, e);
                              }}
                              className="p-1.5 rounded text-xs cursor-pointer transition-colors hover:bg-accent/30"
                              style={{
                                backgroundColor: `${note.project?.color || '#2973B2'}20`,
                                borderLeft: `3px solid ${note.project?.color || '#2973B2'}`
                              }}
                            >
                              <div className="font-medium text-foreground truncate">
                                {note.title}
                              </div>
                              <div className="text-muted-foreground truncate">
                                <LinkifyText 
                                  text={note.project?.name || ''}
                                  className="text-muted-foreground"
                                />
                              </div>
                            </div>
                          ))}
                          {notesForDate.length > 2 && (
                            <div className="text-xs text-muted-foreground text-center">
                              +{notesForDate.length - 2} autres
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Jours du mois suivant */}
                  {Array.from({ 
                    length: 42 - getFirstDayOfMonth(currentMonth.year, currentMonth.month) - getDaysInMonth(currentMonth.year, currentMonth.month) 
                  }).map((_, index) => (
                    <div key={`next-${index}`} className="p-2 min-h-[80px] bg-muted/20 rounded-lg" />
                  ))}
                </div>
              </div>
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