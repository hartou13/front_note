'use client';

import { AppLayout } from '@/components/Layout/AppLayout';
import { TagDeleteModal } from '@/components/Tags/TagDeleteModal';
import { ColorPicker } from '@/components/UI/ColorPicker';
import { Tag, useCreateTag, useTags, useUpdateTag } from '@/lib/hooks/useTags';
import { Edit, Plus, Search, Tag as TagIcon, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function TagsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#2973B2');
  const [editTagName, setEditTagName] = useState('');
  const [editTagColor, setEditTagColor] = useState('#2973B2');

  // Hooks TanStack Query
  const { data: tags = [], isLoading, error } = useTags();
  const createTagMutation = useCreateTag();
  const updateTagMutation = useUpdateTag();

  // Créer un nouveau tag
  const handleCreateTag = async () => {
    if (!newTagName.trim()) return;

    try {
      await createTagMutation.mutateAsync({ 
        name: newTagName.trim(),
        color: newTagColor
      });
      setNewTagName('');
      setNewTagColor('#2973B2');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la création du tag:', error);
    }
  };

  // Mettre à jour un tag
  const handleUpdateTag = async () => {
    if (!editingTag || !editTagName.trim()) return;

    try {
      await updateTagMutation.mutateAsync({
        id: editingTag.id,
        data: { 
          name: editTagName.trim(),
          color: editTagColor
        }
      });
      setEditingTag(null);
      setEditTagName('');
      setEditTagColor('#2973B2');
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tag:', error);
    }
  };

  // Ouvrir le modal de suppression
  const openDeleteModal = (tag: Tag) => {
    setTagToDelete(tag);
    setIsDeleteModalOpen(true);
  };

  // Fermer le modal de suppression
  const closeDeleteModal = () => {
    setTagToDelete(null);
    setIsDeleteModalOpen(false);
  };

  // Ouvrir le dialogue d'édition
  const openEditDialog = (tag: Tag) => {
    setEditingTag(tag);
    setEditTagName(tag.name);
    setEditTagColor(tag.color);
    setIsEditDialogOpen(true);
  };

  // Filtrer les tags selon la recherche
  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  if (error) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-destructive text-lg mb-2">Erreur lors du chargement des tags</p>
            <p className="text-muted-foreground">Veuillez réessayer plus tard</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tags</h1>
            <p className="text-muted-foreground">
              Gérez vos tags pour organiser vos notes et projets
            </p>
          </div>
          <button
            onClick={() => setIsCreateDialogOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Nouveau Tag
          </button>
        </div>

        {/* Barre de recherche */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Rechercher des tags..."
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
          />
        </div>

        {/* Liste des tags */}
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {filteredTags.map((tag) => (
            <div key={tag.id} className="bg-card border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  <div 
                    className="w-4 h-4 rounded-full border border-border flex-shrink-0"
                    style={{ backgroundColor: tag.color }}
                  />
                  <h3 className="text-lg font-semibold truncate">{tag.name}</h3>
                </div>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0 ml-2">
                  {new Date(tag.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => openEditDialog(tag)}
                  className="p-2 border border-input rounded-lg hover:bg-accent transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => openDeleteModal(tag)}
                  className="p-2 border border-input rounded-lg hover:bg-accent transition-colors text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Message si aucun tag */}
        {filteredTags.length === 0 && (
          <div className="text-center py-12">
            <TagIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'Aucun tag trouvé' : 'Aucun tag créé'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Essayez de modifier vos critères de recherche'
                : 'Commencez par créer votre premier tag'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => setIsCreateDialogOpen(true)}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors mx-auto w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                Créer un tag
              </button>
            )}
          </div>
        )}

        {/* Dialogue de création */}
        {isCreateDialogOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Créer un nouveau tag</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="tag-name" className="block text-sm font-medium mb-2">
                    Nom du tag
                  </label>
                  <input
                    id="tag-name"
                    type="text"
                    value={newTagName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTagName(e.target.value)}
                    placeholder="Entrez le nom du tag"
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleCreateTag()}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    disabled={createTagMutation.isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Couleur du tag
                  </label>
                  <ColorPicker
                    value={newTagColor}
                    onChange={setNewTagColor}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsCreateDialogOpen(false)}
                    className="px-4 py-2 border border-input rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                    disabled={createTagMutation.isPending}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || createTagMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createTagMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Création...
                      </span>
                    ) : (
                      'Créer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dialogue d'édition */}
        {isEditDialogOpen && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-semibold mb-4">Modifier le tag</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="edit-tag-name" className="block text-sm font-medium mb-2">
                    Nom du tag
                  </label>
                  <input
                    id="edit-tag-name"
                    type="text"
                    value={editTagName}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditTagName(e.target.value)}
                    placeholder="Entrez le nouveau nom du tag"
                    onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleUpdateTag()}
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background text-foreground"
                    disabled={updateTagMutation.isPending}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Couleur du tag
                  </label>
                  <ColorPicker
                    value={editTagColor}
                    onChange={setEditTagColor}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setIsEditDialogOpen(false)}
                    className="px-4 py-2 border border-input rounded-lg text-muted-foreground hover:bg-accent transition-colors"
                    disabled={updateTagMutation.isPending}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleUpdateTag}
                    disabled={!editTagName.trim() || updateTagMutation.isPending}
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updateTagMutation.isPending ? (
                      <span className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                        Mise à jour...
                      </span>
                    ) : (
                      'Mettre à jour'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de suppression */}
        {tagToDelete && (
          <TagDeleteModal
            tag={tagToDelete}
            isOpen={isDeleteModalOpen}
            onClose={closeDeleteModal}
          />
        )}
      </div>
    </AppLayout>
  );
} 