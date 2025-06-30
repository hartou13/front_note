'use client';

import { ArrowUpRight, Edit, Folder, FolderOpen, MoreVertical, Plus, Trash2, TreePine } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AppLayout } from '../../components/Layout/AppLayout';
import { ProjectDeleteModal } from '../../components/Projects/ProjectDeleteModal';
import { ProjectEditModal } from '../../components/Projects/ProjectEditModal';
import { Project, useProjects } from '../../lib/hooks/useProjects';

export default function ProjectsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const router = useRouter();
  
  const { data: projects, isLoading: projectsLoading, error } = useProjects();

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
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }) + ' ' + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      }`}>
        {isActive ? 'Actif' : 'Inactif'}
      </span>
    );
  };

  // Fonction pour trouver le projet parent
  const findParentProject = (parentId: string | null) => {
    if (!parentId || !projects) return null;
    return projects.find(p => p.id === parentId);
  };

  // Fonction pour compter les projets enfants
  const countChildProjects = (projectId: string) => {
    if (!projects) return 0;
    return projects.filter(p => p.mother_project_id === projectId).length;
  };

  const handleProjectClick = (project: Project) => {
    setSelectedProject(selectedProject?.id === project.id ? null : project);
  };

  const handleMenuToggle = (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setOpenMenuId(openMenuId === projectId ? null : projectId);
  };

  const handleEdit = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setEditingProject(project);
    setOpenMenuId(null);
  };

  const handleDelete = (project: Project, event: React.MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setDeletingProject(project);
    setOpenMenuId(null);
  };

  // Fermer le menu quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      
      // Ne pas fermer si on clique sur le bouton du menu ou sur le menu lui-même
      if (target.closest('[data-menu-button="true"]') || target.closest('[data-menu="true"]')) {
        return;
      }
      
      setOpenMenuId(null);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

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
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Mes Projets</h1>
            <p className="text-muted-foreground mt-1">
              Gérez vos projets et suivez leur progression
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau Projet
          </button>
        </div>

        {/* Messages d'erreur */}
        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive rounded-lg">
            <p className="text-destructive text-sm">
              ❌ Erreur lors du chargement des projets : {error.message}
            </p>
          </div>
        )}

        {/* Loading state */}
        {projectsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}

        {/* Projects Grid - Windows Explorer Style */}
        {!projectsLoading && projects && (
          <>
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Aucun projet trouvé
                </h3>
                <p className="text-muted-foreground mb-6">
                  Créez votre premier projet pour commencer
                </p>
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Créer un projet
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 p-4">
                {projects.map((project) => {
                  const projectColor = project.color || '#2973B2';
                  const parentProject = findParentProject(project.mother_project_id);
                  const childCount = countChildProjects(project.id);
                  const isSelected = selectedProject?.id === project.id;
                  
                  return (
                    <div key={project.id} className="relative group">
                      {/* Menu Button - Positioned outside the clickable project area */}
                      {/* <button
                        onClick={(e) => handleMenuToggle(project.id, e)}
                        className="absolute top-2 right-2 p-1.5 opacity-60 hover:opacity-100 hover:bg-accent rounded-full transition-all duration-200 bg-background/80 backdrop-blur-sm shadow-sm z-20"
                        data-menu-button="true"
                      >
                        <MoreVertical className="w-3 h-3 text-muted-foreground" />
                      </button> */}

                      {/* Context Menu - Only appears when menu is open */}
                      {/* {openMenuId === project.id && (
                        <div 
                          className="absolute top-12 right-2 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 min-w-[140px]"
                          data-menu="true"
                        >
                          <button
                            onClick={(e) => handleEdit(project, e)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
                          >
                            <Edit className="w-3 h-3" />
                            Modifier
                          </button>
                          <button
                            onClick={(e) => handleDelete(project, e)}
                            className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-destructive hover:text-destructive transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-3 h-3" />
                            Supprimer
                          </button>
                        </div>
                      )} */}

                      {/* Project Folder - Clickable area for project details */}
                      <div
                        onClick={() => handleProjectClick(project)}
                        className={`cursor-pointer p-3 rounded-lg transition-all duration-200 hover:bg-accent/50 ${
                          isSelected ? 'bg-accent ring-2 ring-primary' : ''
                        }`}
                      >
                        {/* Folder Icon */}
                        <div className="relative mb-2 flex justify-center">
                          <Folder
                            className="w-16 h-16 drop-shadow-sm"
                            style={{ color: projectColor }}
                            fill={projectColor}
                            fillOpacity={0.8}
                          />
                          
                          {/* Status badge on folder */}
                          <div className={`absolute -top-2 -left-2 px-2 py-1 rounded-full text-xs font-medium ${
                            project.is_active 
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-500 text-white'
                          }`}>
                            {project.is_active ? 'Actif' : 'Inactif'}
                          </div>
                          
                          {/* Hierarchy indicator */}
                          {parentProject && (
                            <ArrowUpRight className="absolute -top-1 -right-1 w-4 h-4 text-muted-foreground bg-background rounded-full p-0.5" />
                          )}
                          {childCount > 0 && (
                            <TreePine className="absolute -top-1 -right-1 w-4 h-4 text-muted-foreground bg-background rounded-full p-0.5" />
                          )}
                        </div>

                        {/* Project Name */}
                        <div className="text-center">
                          <h3 className="text-sm font-medium text-foreground truncate px-1 leading-tight">
                            {project.name}
                          </h3>
                          
                          {/* Date - Windows style */}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(project.created_at)}
                          </p>
                          
                          {/* Child count badge */}
                          {childCount > 0 && (
                            <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full">
                              {childCount} élément{childCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* Project Details Panel - Appears when a project is selected */}
        {selectedProject && (
          <div className="mt-6 p-6 bg-muted/30 rounded-lg border">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Folder
                  className="w-8 h-8"
                  style={{ color: selectedProject.color }}
                  fill={selectedProject.color}
                  fillOpacity={0.8}
                />
                <div>
                  <h3 className="text-lg font-semibold text-foreground">{selectedProject.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusBadge(selectedProject.is_active)}
                    {countChildProjects(selectedProject.id) > 0 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                        {countChildProjects(selectedProject.id)} sous-projet{countChildProjects(selectedProject.id) > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={(e) => handleMenuToggle(selectedProject.id, e)}
                  className="p-2 opacity-60 hover:opacity-100 hover:bg-accent rounded-lg transition-colors"
                  data-menu-button="true"
                >
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
                {openMenuId === selectedProject.id && (
                  <div className="absolute right-0 mt-2 bg-popover border border-border rounded-lg shadow-lg z-50 py-1 min-w-[140px]" data-menu="true">
                    <button
                      onClick={(e) => handleEdit(selectedProject, e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent transition-colors flex items-center gap-2 text-foreground"
                    >
                      <Edit className="w-3 h-3" />
                      Modifier
                    </button>
                    <button
                      onClick={(e) => handleDelete(selectedProject, e)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-accent text-destructive hover:text-destructive transition-colors flex items-center gap-2"
                    >
                      <Trash2 className="w-3 h-3" />
                      Supprimer
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedProject.description || 'Aucune description disponible'}
                </p>
              </div>

              {/* Project hierarchy info */}
              {findParentProject(selectedProject.mother_project_id) && (
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-2">Projet parent</h4>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: findParentProject(selectedProject.mother_project_id)?.color }}
                    />
                    <span className="text-sm text-muted-foreground">
                      {findParentProject(selectedProject.mother_project_id)?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Additional details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Créé le :</span>
                  <p className="font-medium">{formatDate(selectedProject.created_at)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Couleur :</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div 
                      className="w-4 h-4 rounded border border-border"
                      style={{ backgroundColor: selectedProject.color }}
                    />
                    <span className="font-mono text-xs">{selectedProject.color}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        {editingProject && (
          <ProjectEditModal
            project={editingProject}
            isOpen={!!editingProject}
            onClose={() => setEditingProject(null)}
          />
        )}

        {deletingProject && (
          <ProjectDeleteModal
            project={deletingProject}
            isOpen={!!deletingProject}
            onClose={() => setDeletingProject(null)}
          />
        )}

        {isCreateModalOpen && (
          <ProjectEditModal
            project={null}
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
          />
        )}
      </div>
    </AppLayout>
  );
} 