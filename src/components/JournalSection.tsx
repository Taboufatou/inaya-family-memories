
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Plus, Heart, Clock, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface JournalEntry {
  id: string;
  content: string;
  date: Date;
  author: 'papa' | 'maman';
  likes: number;
}

interface JournalSectionProps {
  userType: 'papa' | 'maman' | 'admin';
}

const JournalSection = ({ userType }: JournalSectionProps) => {
  const [entries, setEntries] = useState<JournalEntry[]>([
    {
      id: '1',
      content: 'Aujourd\'hui, Inaya a fait sa première nuit complète ! 8 heures de sommeil d\'affilée. Nous sommes si heureux et reposés ❤️',
      date: new Date('2024-12-01'),
      author: 'maman',
      likes: 5
    },
    {
      id: '2',
      content: 'Premier sourire conscient ce matin ! Elle nous regardait et a souri. Mon cœur a fondu. Ce moment restera gravé à jamais 🥺✨',
      date: new Date('2024-11-28'),
      author: 'papa',
      likes: 7
    },
    {
      id: '3',
      content: 'Inaya découvre ses petites mains. Elle les regarde, les bouge, essaie de les attraper. C\'est fascinant de la voir découvrir son corps.',
      date: new Date('2024-11-25'),
      author: 'maman',
      likes: 4
    }
  ]);

  const [newEntry, setNewEntry] = useState('');
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddEntry = () => {
    if (!newEntry.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez écrire quelque chose dans votre note",
        variant: "destructive"
      });
      return;
    }

    const entry: JournalEntry = {
      id: Date.now().toString(),
      content: newEntry,
      date: new Date(),
      author: userType as 'papa' | 'maman',
      likes: 0
    };

    setEntries([entry, ...entries]);
    setNewEntry('');
    setIsDialogOpen(false);
    
    toast({
      title: "Note ajoutée",
      description: "Votre note a été ajoutée au journal ✨"
    });
  };

  const handleEditEntry = () => {
    if (!editingEntry || !editingEntry.content.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez écrire quelque chose dans votre note",
        variant: "destructive"
      });
      return;
    }

    setEntries(entries.map(entry => 
      entry.id === editingEntry.id ? editingEntry : entry
    ));
    setEditingEntry(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Note modifiée",
      description: "Votre note a été modifiée avec succès ✨"
    });
  };

  const handleDeleteEntry = (entryId: string) => {
    setEntries(entries.filter(entry => entry.id !== entryId));
    toast({
      title: "Note supprimée",
      description: "La note a été supprimée avec succès"
    });
  };

  const handleLike = (entryId: string) => {
    setEntries(entries.map(entry => 
      entry.id === entryId 
        ? { ...entry, likes: entry.likes + 1 }
        : entry
    ));
  };

  const canModify = (entry: JournalEntry) => {
    return userType === 'admin' || entry.author === userType;
  };

  const getAuthorDisplay = (author: 'papa' | 'maman') => {
    return author === 'papa' ? 'Papa ❤️' : 'Maman ❤️';
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            📝 Journal Partagé
          </h1>
          <p className="text-muted-foreground">
            Vos pensées et anecdotes sur Inaya
          </p>
        </div>
        
        {userType !== 'admin' && (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white hover:opacity-90 shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Nouvelle note
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une note au journal</DialogTitle>
                <DialogDescription>
                  Partagez un moment, une pensée, une anecdote sur Inaya
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Votre note</label>
                  <Textarea
                    placeholder="Écrivez vos pensées, une anecdote, un moment spécial..."
                    value={newEntry}
                    onChange={(e) => setNewEntry(e.target.value)}
                    rows={6}
                  />
                </div>
                
                <Button onClick={handleAddEntry} className="w-full gradient-primary text-white">
                  Ajouter au journal
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
            <DialogTitle>Modifier la note</DialogTitle>
            <DialogDescription>
              Modifiez votre note du journal
            </DialogDescription>
          </DialogHeader>
          
          {editingEntry && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Votre note</label>
                <Textarea
                  placeholder="Écrivez vos pensées, une anecdote, un moment spécial..."
                  value={editingEntry.content}
                  onChange={(e) => setEditingEntry({...editingEntry, content: e.target.value})}
                  rows={6}
                />
              </div>
              
              <Button onClick={handleEditEntry} className="w-full gradient-primary text-white">
                Sauvegarder les modifications
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Journal Entries */}
      <div className="space-y-6">
        {entries.map((entry, index) => (
          <Card key={entry.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in-up border-0 relative overflow-hidden" style={{ animationDelay: `${index * 100}ms` }}>
            <div className={`absolute left-0 top-0 bottom-0 w-1 ${entry.author === 'papa' ? 'bg-blue-500' : 'bg-pink-500'}`} />
            
            <CardContent className="p-6 pl-8">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${entry.author === 'papa' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600'}`}>
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{getAuthorDisplay(entry.author)}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {format(entry.date, "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleLike(entry.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors p-2"
                >
                  <Heart className="h-5 w-5" />
                  {entry.likes}
                </button>
              </div>
              
              <div className="bg-muted/20 rounded-lg p-4 mb-4">
                <p className="text-foreground leading-relaxed whitespace-pre-wrap">{entry.content}</p>
              </div>

              {canModify(entry) && (
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingEntry(entry);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteEntry(entry.id)}
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

      {entries.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucune note pour le moment</h3>
            <p className="text-muted-foreground mb-4">
              Commencez à écrire vos premières pensées sur Inaya
            </p>
            {userType !== 'admin' && (
              <Button onClick={() => setIsDialogOpen(true)} className="gradient-primary text-white">
                Écrire la première note
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default JournalSection;
