
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Video, Plus, Heart, MessageCircle, Upload, Edit, Trash2, Download, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import HistoryFilter, { FilterOptions } from './HistoryFilter';

interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;
  date: string;
  likes: number;
  comments: string[];
  author: 'papa' | 'maman';
  duration?: string;
}

interface VideosSectionProps {
  userType: 'papa' | 'maman' | 'admin';
}

const VideosSection = ({ userType }: VideosSectionProps) => {
  const [videos, setVideos] = useState<VideoItem[]>([
    {
      id: '1',
      title: 'Premiers pas',
      description: 'Inaya fait ses premiers pas ! ✨',
      url: '/placeholder.svg',
      date: '2024-12-05',
      likes: 8,
      comments: ['Incroyable ! - Papa', 'Notre petite danseuse - Maman'],
      author: 'papa',
      duration: '0:45'
    },
    {
      id: '2',
      title: 'Rires aux éclats',
      description: 'Moment de bonheur pur',
      url: '/placeholder.svg',
      date: '2024-11-30',
      likes: 12,
      comments: ['Trop mignon - Maman'],
      author: 'maman',
      duration: '1:23'
    }
  ]);

  const [filteredVideos, setFilteredVideos] = useState<VideoItem[]>(videos);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'all',
    author: 'all',
    searchTerm: '',
  });

  const [newVideo, setNewVideo] = useState({
    title: '',
    description: '',
    file: null as File | null
  });

  const [editingVideo, setEditingVideo] = useState<VideoItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  // Appliquer les filtres
  useEffect(() => {
    let filtered = [...videos];

    if (filters.author !== 'all') {
      filtered = filtered.filter(video => video.author === filters.author);
    }

    if (filters.searchTerm) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

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
      
      filtered = filtered.filter(video => new Date(video.date) >= cutoffDate);
    }

    if (filters.startDate) {
      filtered = filtered.filter(video => new Date(video.date) >= new Date(filters.startDate!));
    }
    if (filters.endDate) {
      filtered = filtered.filter(video => new Date(video.date) <= new Date(filters.endDate!));
    }

    setFilteredVideos(filtered);
  }, [videos, filters]);

  const handleAddVideo = () => {
    if (!newVideo.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un titre pour la vidéo",
        variant: "destructive"
      });
      return;
    }

    const video: VideoItem = {
      id: Date.now().toString(),
      title: newVideo.title,
      description: newVideo.description,
      url: '/placeholder.svg',
      date: new Date().toISOString().split('T')[0],
      likes: 0,
      comments: [],
      author: userType as 'papa' | 'maman',
      duration: '0:00'
    };

    setVideos([video, ...videos]);
    setNewVideo({ title: '', description: '', file: null });
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
        description: "Veuillez entrer un titre pour la vidéo",
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

  const handleDownload = (video: VideoItem) => {
    const link = document.createElement('a');
    link.href = video.url;
    link.download = `${video.title}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Téléchargement lancé",
      description: `${video.title} est en cours de téléchargement`
    });
  };

  const canModify = (video: VideoItem) => {
    return userType === 'admin' || video.author === userType;
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            🎬 Espace Vidéos
          </h1>
          <p className="text-muted-foreground">
            Tous les moments précieux d'Inaya en mouvement ({filteredVideos.length} vidéos)
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
                <DialogTitle>Ajouter une nouvelle vidéo</DialogTitle>
                <DialogDescription>
                  Partagez un moment précieux d'Inaya en mouvement
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Titre</label>
                  <Input
                    placeholder="Ex: Premiers pas"
                    value={newVideo.title}
                    onChange={(e) => setNewVideo({...newVideo, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Décrivez ce moment spécial..."
                    value={newVideo.description}
                    onChange={(e) => setNewVideo({...newVideo, description: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Vidéo</label>
                  <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
                    <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">
                      Cliquez pour sélectionner une vidéo
                    </p>
                  </div>
                </div>
                
                <Button onClick={handleAddVideo} className="w-full gradient-primary text-white">
                  Ajouter la vidéo
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
            <DialogTitle>Modifier la vidéo</DialogTitle>
            <DialogDescription>
              Modifiez les détails de votre vidéo
            </DialogDescription>
          </DialogHeader>
          
          {editingVideo && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Titre</label>
                <Input
                  placeholder="Ex: Premiers pas"
                  value={editingVideo.title}
                  onChange={(e) => setEditingVideo({...editingVideo, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  placeholder="Décrivez ce moment spécial..."
                  value={editingVideo.description}
                  onChange={(e) => setEditingVideo({...editingVideo, description: e.target.value})}
                />
              </div>
              
              <Button onClick={handleEditVideo} className="w-full gradient-primary text-white">
                Sauvegarder les modifications
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Videos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((video, index) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in-up border-0" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="aspect-video bg-muted relative overflow-hidden">
              <img 
                src={video.url} 
                alt={video.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <Play className="h-12 w-12 text-white" />
              </div>
              <div className="absolute top-2 right-2 bg-black/20 backdrop-blur-sm rounded-full p-2">
                <Video className="h-4 w-4 text-white" />
              </div>
              <div className="absolute top-2 left-2 bg-black/20 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-xs text-white">{video.author === 'papa' ? 'Papa' : 'Maman'}</span>
              </div>
              <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur-sm rounded px-2 py-1">
                <span className="text-xs text-white">{video.duration}</span>
              </div>
            </div>
            
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-1">{video.title}</h3>
              <p className="text-sm text-muted-foreground mb-3">{video.description}</p>
              
              <div className="flex items-center justify-between text-sm mb-3">
                <span className="text-muted-foreground">{video.date}</span>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleLike(video.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors"
                  >
                    <Heart className="h-4 w-4" />
                    {video.likes}
                  </button>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <MessageCircle className="h-4 w-4" />
                    {video.comments.length}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDownload(video)}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Télécharger
                </Button>
                
                {canModify(video) && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingVideo(video);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteVideo(video.id)}
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

      {filteredVideos.length === 0 && (
        <div className="text-center py-12">
          <Video className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Aucune vidéo trouvée avec ces filtres</p>
        </div>
      )}
    </div>
  );
};

export default VideosSection;
