
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Camera, Plus, Heart, MessageCircle, Upload, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const [photos, setPhotos] = useState<Photo[]>([
    {
      id: '1',
      title: 'Premier sourire',
      description: 'Le plus beau sourire du monde ❤️',
      url: '/placeholder.svg',
      date: '2024-12-01',
      likes: 5,
      comments: ['Magnifique ! - Papa', 'Mon cœur fond - Maman'],
      author: 'maman'
    },
    {
      id: '2', 
      title: 'Sieste paisible',
      description: 'Comme elle est sereine',
      url: '/placeholder.svg',
      date: '2024-11-28',
      likes: 3,
      comments: ['Si mignonne - Maman'],
      author: 'papa'
    }
  ]);

  const [newPhoto, setNewPhoto] = useState({
    title: '',
    description: '',
    file: null as File | null
  });

  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddPhoto = () => {
    if (!newPhoto.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un titre pour la photo",
        variant: "destructive"
      });
      return;
    }

    const photo: Photo = {
      id: Date.now().toString(),
      title: newPhoto.title,
      description: newPhoto.description,
      url: '/placeholder.svg',
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: [],
      author: userType as 'papa' | 'maman'
    };

    setPhotos([photo, ...photos]);
    setNewPhoto({ title: '', description: '', file: null });
    setIsDialogOpen(false);
    
    toast({
      title: "Photo ajoutée",
      description: "Votre photo a été ajoutée avec succès ✨"
    });
  };

  const handleEditPhoto = () => {
    if (!editingPhoto || !editingPhoto.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un titre pour la photo",
        variant: "destructive"
      });
      return;
    }

    setPhotos(photos.map(photo => 
      photo.id === editingPhoto.id ? editingPhoto : photo
    ));
    setEditingPhoto(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Photo modifiée",
      description: "Votre photo a été modifiée avec succès ✨"
    });
  };

  const handleDeletePhoto = (photoId: string) => {
    setPhotos(photos.filter(photo => photo.id !== photoId));
    toast({
      title: "Photo supprimée",
      description: "La photo a été supprimée avec succès"
    });
  };

  const handleLike = (photoId: string) => {
    setPhotos(photos.map(photo => 
      photo.id === photoId 
        ? { ...photo, likes: photo.likes + 1 }
        : photo
    ));
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
            Tous les précieux moments d'Inaya
          </p>
        </div>
        
        {userType !== 'admin' && (
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
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour sélectionner une photo
                    </p>
                  </div>
                </div>
                
                <Button onClick={handleAddPhoto} className="w-full gradient-primary text-white">
                  Ajouter la photo
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

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
        {photos.map((photo, index) => (
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
              
              <div className="flex items-center justify-between text-sm">
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
              
              {canModify(photo) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingPhoto(photo);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeletePhoto(photo.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PhotosSection;
