
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Plus, Heart, Clock, Edit, Trash2, Play, Calendar as CalendarIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface VideoEntry {
  id: string;
  title: string;
  description: string;
  url: string;
  date: Date;
  author: 'papa' | 'maman';
  likes: number;
  category: string;
}

interface VideosSectionProps {
  userType: 'papa' | 'maman' | 'admin';
}

const VideosSection = ({ userType }: VideosSectionProps) => {
  const [videos, setVideos] = useState<VideoEntry[]>([
    {
      id: '1',
      title: 'Premiers pas d\'Inaya',
      description: 'Elle marche toute seule pour la première fois ! ❤️',
      url: 'https://example.com/video1.mp4',
      date: new Date('2024-12-01'),
      author: 'maman',
      likes: 12,
      category: 'Premiers pas'
    },
    {
      id: '2',
      title: 'Première berceuse',
      description: 'Papa chante une berceuse à Inaya avant le dodo 🎵',
      url: 'https://example.com/video2.mp4',
      date: new Date('2024-11-25'),
      author: 'papa',
      likes: 8,
      category: 'Moments tendres'
    }
  ]);

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    url: '',
    category: ''
  });

  const [editingVideo, setEditingVideo] = useState<VideoEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddVideo = () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins le titre et l'URL de la vidéo",
        variant: "destructive"
      });
      return;
    }

    const video: VideoEntry = {
      id: Date.now().toString(),
      title: newVideo.title,
      description: newVideo.description,
      url: newVideo.url,
      date: new Date(),
      author: userType as 'papa' | 'maman',
      likes: 0,
      category: newVideo.category || 'Général'
    };

    setVideos([video, ...videos]);
    setNewVideo({
      title: '',
      description: '',
      url: '',
      category: ''
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Vidéo ajoutée",
      description: "Votre vidéo a été ajoutée avec succès ✨"
    });
  };

  const handleEditVideo = () => {
    if (!editingVideo || !editingVideo.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins le titre",
        variant: "destructive"
      });
      return;
    }

    setVideos(videos.map(video => 
      video.id === editingVideo.id ? editingVideo : video
    ));
    setEditingVideo(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Vidéo modifiée",
      description: "Votre vidéo a été modifiée avec succès ✨"
    });
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideos(videos.filter(video => video.id !== videoId));
    toast({
      title: "Vidéo supprimée",
      description: "La vidéo a été supprimée avec succès"
    });
  };

  const handleLike = (videoId: string) => {
    setVideos(videos.map(video => 
      video.id === videoId 
        ? { ...video, likes: video.likes + 1 }
        : video
    ));
  };

  const canModify = (video: VideoEntry) => {
    return userType === 'admin' || video.author === userType;
  };

  const getAuthorDisplay = (author: 'papa' | 'maman') => {
    return author === 'papa' ? 'Papa ❤️' : 'Maman ❤️';
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            🎥 Vidéos
          </h1>
          <p className="text-muted-foreground">
            Les plus beaux moments d'Inaya en vidéo
          </p>
        </div>
        
        {userType !== 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white hover:opacity-90 shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Ajouter une vidéo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une vidéo</DialogTitle>
                <DialogDescription>
                  Partagez un moment spécial d'Inaya en vidéo
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Titre *</label>
                  <Input
                    placeholder="Ex: Premiers pas"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">URL de la vidéo *</label>
                  <Input
                    placeholder="https://..."
                    value={newVideo.url}
                    onChange={(e) => setNewVideo({...newVideo, url: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Catégorie</label>
                  <Input
                    placeholder="Ex: Premiers pas, Moments tendres..."
                    value={newVideo.category}
                    onChange={(e) => setNewVideo({...newVideo, category: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Décrivez ce moment spécial..."
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                    rows={3}
                  />
                </div>
                
                <Button onClick={handleAddVideo} className="w-full gradient-primary text-white">
                  Ajouter la vidéo
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
            <DialogTitle>Modifier la vidéo</DialogTitle>
            <DialogDescription>
              Modifiez les détails de votre vidéo
            </DialogDescription>
          </DialogHeader>
          
          {editingVideo && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Titre *</label>
                <Input
                  placeholder="Ex: Premiers pas"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">URL de la vidéo *</label>
                <Input
                  placeholder="https://..."
                  value={editingVideo.url}
                  onChange={(e) => setEditingVideo({...editingVideo, url: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Catégorie</label>
                <Input
                  placeholder="Ex: Premiers pas, Moments tendres..."
                  value={editingVideo.category}
                  onChange={(e) => setEditingVideo({...editingVideo, category: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  placeholder="Décrivez ce moment spécial..."
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                  rows={3}
                />
              </div>
              
              <Button onClick={handleEditVideo} className="w-full gradient-primary text-white">
                Sauvegarder les modifications
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Videos List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => (
          <Card key={video.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in-up border-0" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-0">
              {/* Video Thumbnail/Player */}
              <div className="relative aspect-video bg-muted rounded-t-lg overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Button variant="ghost" size="icon" className="h-16 w-16 rounded-full bg-white/90 hover:bg-white text-black">
                    <Play className="h-8 w-8 ml-1" />
                  </Button>
                </div>
                <Video className="absolute top-4 right-4 h-6 w-6 text-white" />
              </div>
              
              <div className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">{video.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {video.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                      <Clock className="h-4 w-4" />
                      {format(video.date, "dd/MM/yyyy", { locale: fr })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Par {getAuthorDisplay(video.author)}
                    </p>
                  </div>
                  
                  <button 
                    onClick={() => handleLike(video.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    {video.likes}
                  </button>
                </div>
                
                {video.description && (
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-foreground text-sm">{video.description}</p>
                  </div>
                )}

                {canModify(video) && (
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingVideo(video);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {videos.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="p-12 text-center">
            <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucune vidéo pour le moment</h3>
            <p className="text-muted-foreground mb-4">
              Commencez à partager les premiers moments d'Inaya en vidéo
            </p>
            {userType !== 'admin' && (
              <Button onClick={() => setIsDialogOpen(true)} className="gradient-primary text-white">
                Ajouter la première vidéo
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VideosSection;
