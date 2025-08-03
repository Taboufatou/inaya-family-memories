
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Plus, Heart, MessageCircle, Upload, Edit, Trash2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import HistoryFilter, { FilterOptions } from './HistoryFilter';
import FileUpload from './FileUpload';
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/utils/apiClient";

interface Photo {
  id: string;
  title: string;
  description: string;
  url: string;
  date: string;
  likes: number;
  comments: string[];
  author: 'papa' | 'maman';
}

interface PhotosSectionProps {
  userType: 'papa' | 'maman' | 'admin';
}

const PhotosSection = ({ userType }: PhotosSectionProps) => {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);

  const [filteredPhotos, setFilteredPhotos] = useState<Photo[]>(photos);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    author: 'all',
    searchTerm: '',
  });

  const [newPhoto, setNewPhoto] = useState({
    title: '',
    description: '',
    file: null as File | null,
    url: ''
  });

  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  // Charger les photos au montage du composant
  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    if (!token) return;
    
    try {
      const response = await apiClient.getPhotos(token);
      if (response.success && (response.data as any)?.photos) {
        const formattedPhotos = (response.data as any).photos.map((p: any) => ({
          id: p.id.toString(),
          title: p.titre,
          description: p.description || '',
          url: p.url,
          date: p.date_prise || p.date_upload,
          likes: p.likes || 0,
          comments: [],
          author: p.author
        }));
        setPhotos(formattedPhotos);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des photos:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les photos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...photos];

    // Filtre par auteur
    if (filters.author !== 'all') {
      filtered = filtered.filter(photo => photo.author === filters.author);
    }

    // Filtre par terme de recherche
    if (filters.searchTerm) {
      filtered = filtered.filter(photo => 
        photo.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        photo.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Filtre par période
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
      }
      
      filtered = filtered.filter(photo => new Date(photo.date) >= cutoffDate);
    }

    // Filtre par dates personnalisées
    if (filters.startDate) {
      filtered = filtered.filter(photo => new Date(photo.date) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      filtered = filtered.filter(photo => new Date(photo.date) <= new Date(filters.endDate!));
    }

    setFilteredPhotos(filtered);
  }, [photos, filters]);

  const handleAddPhoto = async () => {
    if (!newPhoto.title.trim() || !newPhoto.url || !token) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un titre et sélectionner une photo",
        variant: "destructive"
      });
      return;
    }

    try {
      const photoData = {
        titre: newPhoto.title,
        description: newPhoto.description,
        url: newPhoto.url,
        date_prise: new Date().toISOString().split('T')[0],
        lieu: ''
      };

      const response = await apiClient.addPhoto(token, photoData);
      
      if (response.success) {
        await loadPhotos(); // Recharger la liste
        setNewPhoto({ title: '', description: '', file: null, url: '' });
        setIsDialogOpen(false);
        
        toast({
          title: "Photo ajoutée",
          description: "Votre photo a été ajoutée avec succès ✨"
        });
      } else {
        throw new Error(response.error || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la photo",
        variant: "destructive"
      });
    }
  };

  const handleEditPhoto = async () => {
    if (!editingPhoto || !editingPhoto.title.trim() || !token) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un titre pour la photo",
        variant: "destructive"
      });
      return;
    }

    try {
      const photoData = {
        titre: editingPhoto.title,
        description: editingPhoto.description,
        date_prise: editingPhoto.date,
        lieu: ''
      };

      const response = await apiClient.updatePhoto(token, parseInt(editingPhoto.id), photoData);
      
      if (response.success) {
        await loadPhotos(); // Recharger la liste
        setEditingPhoto(null);
        setIsEditDialogOpen(false);
        
        toast({
          title: "Photo modifiée",
          description: "Votre photo a été modifiée avec succès ✨"
        });
      } else {
        throw new Error(response.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la photo",
        variant: "destructive"
      });
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!token) return;

    try {
      const response = await apiClient.deletePhoto(token, parseInt(photoId));
      
      if (response.success) {
        await loadPhotos(); // Recharger la liste
        toast({
          title: "Photo supprimée",
          description: "La photo a été supprimée avec succès"
        });
      } else {
        throw new Error(response.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la photo",
        variant: "destructive"
      });
    }
  };

  const handleLike = (photoId: string) => {
    setPhotos(photos.map(photo => 
      photo.id === photoId 
        ? { ...photo, likes: photo.likes + 1 }
        : photo
    ));
  };

  const handleDownload = (photo: Photo) => {
    // Simuler le téléchargement
    const link = document.createElement('a');
    link.href = photo.url;
    link.download = `${photo.title}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Téléchargement lancé",
      description: `${photo.title} est en cours de téléchargement`
    });
  };

  const canModify = (photo: Photo) => {
    return userType === 'admin' || photo.author === userType;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            📸 Espace Photos
          </h1>
          <p className="text-muted-foreground">
            Tous les précieux moments d'Inaya ({filteredPhotos.length} photos)
          </p>
        </div>
        
        {(
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white hover:opacity-90 shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Ajouter une photo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une nouvelle photo</DialogTitle>
                <DialogDescription>
                  Partagez un moment précieux d'Inaya
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Titre</label>
                  <Input
                    placeholder="Ex: Premier sourire"
                    value={newPhoto.title}
                    onChange={(e) => setNewPhoto({...newPhoto, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Décrivez ce moment spécial..."
                    value={newPhoto.description}
                    onChange={(e) => setNewPhoto({...newPhoto, description: e.target.value})}
                  />
                </div>
                
                 <div>
                   <label className="text-sm font-medium text-foreground">Photo</label>
                   <FileUpload
                     accept="image/*"
                     type="image"
                     onFileSelect={(file) => setNewPhoto({...newPhoto, file})}
                     onFileUpload={(url) => setNewPhoto({...newPhoto, url})}
                   />
                 </div>
                
                <Button onClick={handleAddPhoto} className="w-full gradient-primary text-white">
                  Ajouter la photo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filtres d'historique */}
      <HistoryFilter 
        currentFilters={filters}
        onFilterChange={setFilters}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la photo</DialogTitle>
            <DialogDescription>
              Modifiez les détails de votre photo
            </DialogDescription>
          </DialogHeader>
          
          {editingPhoto && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Titre</label>
                <Input
                  placeholder="Ex: Premier sourire"
                  value={editingPhoto.title}
                  onChange={(e) => setEditingPhoto({...editingPhoto, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  placeholder="Décrivez ce moment spécial..."
                  value={editingPhoto.description}
                  onChange={(e) => setEditingPhoto({...editingPhoto, description: e.target.value})}
                />
              </div>
              
              <Button onClick={handleEditPhoto} className="w-full gradient-primary text-white">
                Sauvegarder les modifications
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Photos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo, index) => (
          <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in-up border-0" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="aspect-square bg-muted relative overflow-hidden">
              <img 
                src={photo.url} 
                alt={photo.title}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm rounded-full p-2">
                <Camera className="h-4 w-4 text-white" />
              </div>
              <div className="absolute top-2 left-2 bg-black/20 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-xs text-white">{photo.author === 'papa' ? 'Papa' : 'Maman'}</span>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-1">{photo.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{photo.description}</p>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">{photo.date}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleLike(photo.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    {photo.likes}
                  </button>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    {photo.comments.length}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(photo)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
                
                {canModify(photo) && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingPhoto(photo);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeletePhoto(photo.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPhotos.length === 0 && (
        <div className="text-center py-12">
          <Camera className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune photo trouvée avec ces filtres</p>
        </div>
      )}
    </div>
  );
};

export default PhotosSection;
