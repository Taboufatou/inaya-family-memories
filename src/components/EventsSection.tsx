
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarIcon, Plus, Clock, MapPin, Edit, Trash2, Heart, PartyPopper } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format, isFuture, isPast, isToday, differenceInDays } from "date-fns";
import { fr } from "date-fns/locale";

interface Event {
  id: string;
  title: string;
  description: string;
  date: Date;
  heure: string;
  lieu: string;
  author: 'papa' | 'maman';
  likes: number;
}

interface EventsSectionProps {
  userType: 'papa' | 'maman' | 'admin';
}

const EventsSection = ({ userType }: EventsSectionProps) => {
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      title: 'Premier anniversaire',
      description: 'Célébration du premier anniversaire d\'Inaya avec la famille ❤️',
      date: new Date('2025-06-15'),
      heure: '15:00',
      lieu: 'À la maison',
      author: 'maman',
      likes: 8
    },
    {
      id: '2',
      title: 'Visite chez le pédiatre',
      description: 'Contrôle de routine et vaccins',
      date: new Date('2025-01-20'),
      heure: '10:30',
      lieu: 'Cabinet Dr. Martin',
      author: 'papa',
      likes: 2
    },
    {
      id: '3',
      title: 'Séance photos professionnelle',
      description: 'Photos souvenirs avec photographe professionnel',
      date: new Date('2024-12-15'),
      heure: '14:00',
      lieu: 'Studio Photo Lumière',
      author: 'maman',
      likes: 5
    }
  ]);

  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: undefined as Date | undefined,
    heure: '',
    lieu: ''
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddEvent = () => {
    if (!newEvent.title.trim() || !newEvent.date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins le titre et la date",
        variant: "destructive"
      });
      return;
    }

    const event: Event = {
      id: Date.now().toString(),
      title: newEvent.title,
      description: newEvent.description,
      date: newEvent.date,
      heure: newEvent.heure || '00:00',
      lieu: newEvent.lieu,
      author: userType as 'papa' | 'maman',
      likes: 0
    };

    setEvents([event, ...events]);
    setNewEvent({
      title: '',
      description: '',
      date: undefined,
      heure: '',
      lieu: ''
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Événement ajouté",
      description: "Votre événement a été ajouté avec succès ✨"
    });
  };

  const handleEditEvent = () => {
    if (!editingEvent || !editingEvent.title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir au moins le titre",
        variant: "destructive"
      });
      return;
    }

    setEvents(events.map(event => 
      event.id === editingEvent.id ? editingEvent : event
    ));
    setEditingEvent(null);
    setIsEditDialogOpen(false);
    
    toast({
      title: "Événement modifié",
      description: "Votre événement a été modifié avec succès ✨"
    });
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    toast({
      title: "Événement supprimé",
      description: "L'événement a été supprimé avec succès"
    });
  };

  const handleLike = (eventId: string) => {
    setEvents(events.map(event => 
      event.id === eventId 
        ? { ...event, likes: event.likes + 1 }
        : event
    ));
  };

  const canModify = (event: Event) => {
    return userType === 'admin' || event.author === userType;
  };

  const getEventStatus = (eventDate: Date) => {
    if (isToday(eventDate)) {
      return { status: 'today', label: "Aujourd'hui", color: 'text-green-600 bg-green-100' };
    } else if (isFuture(eventDate)) {
      const days = differenceInDays(eventDate, new Date());
      if (days <= 7) {
        return { status: 'soon', label: `Dans ${days} jour${days > 1 ? 's' : ''}`, color: 'text-orange-600 bg-orange-100' };
      }
      return { status: 'future', label: 'À venir', color: 'text-blue-600 bg-blue-100' };
    } else {
      return { status: 'past', label: 'Passé', color: 'text-gray-600 bg-gray-100' };
    }
  };

  const sortedEvents = [...events].sort((a, b) => a.date.getTime() - b.date.getTime());

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            🎂 Événements
          </h1>
          <p className="text-muted-foreground">
            Tous les moments importants d'Inaya
          </p>
        </div>
        
        {(
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-primary text-white hover:opacity-90 shadow-lg">
                <Plus className="h-5 w-5 mr-2" />
                Nouvel événement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter un événement</DialogTitle>
                <DialogDescription>
                  Créez un nouvel événement pour Inaya
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Titre *</label>
                  <Input
                    placeholder="Ex: Premier anniversaire"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Description</label>
                  <Textarea
                    placeholder="Décrivez l'événement..."
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground">Date *</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {newEvent.date ? format(newEvent.date, "dd/MM/yyyy", { locale: fr }) : "Choisir"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={newEvent.date}
                          onSelect={(date) => setNewEvent({...newEvent, date})}
                          locale={fr}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-foreground">Heure</label>
                    <Input
                      type="time"
                      value={newEvent.heure}
                      onChange={(e) => setNewEvent({...newEvent, heure: e.target.value})}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Lieu</label>
                  <Input
                    placeholder="Ex: À la maison"
                    value={newEvent.lieu}
                    onChange={(e) => setNewEvent({...newEvent, lieu: e.target.value})}
                  />
                </div>
                
                <Button onClick={handleAddEvent} className="w-full gradient-primary text-white">
                  Créer l'événement
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'événement</DialogTitle>
            <DialogDescription>
              Modifiez les détails de votre événement
            </DialogDescription>
          </DialogHeader>
          
          {editingEvent && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Titre *</label>
                <Input
                  placeholder="Ex: Premier anniversaire"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Description</label>
                <Textarea
                  placeholder="Décrivez l'événement..."
                  value={editingEvent.description}
                  onChange={(e) => setEditingEvent({...editingEvent, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingEvent.date ? format(editingEvent.date, "dd/MM/yyyy", { locale: fr }) : "Choisir"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editingEvent.date}
                        onSelect={(date) => setEditingEvent({...editingEvent, date: date!})}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Heure</label>
                  <Input
                    type="time"
                    value={editingEvent.heure}
                    onChange={(e) => setEditingEvent({...editingEvent, heure: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Lieu</label>
                <Input
                  placeholder="Ex: À la maison"
                  value={editingEvent.lieu}
                  onChange={(e) => setEditingEvent({...editingEvent, lieu: e.target.value})}
                />
              </div>
              
              <Button onClick={handleEditEvent} className="w-full gradient-primary text-white">
                Sauvegarder les modifications
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Events List */}
      <div className="space-y-4">
        {sortedEvents.map((event, index) => {
          const eventStatus = getEventStatus(event.date);
          return (
            <Card key={event.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in-up border-0" style={{ animationDelay: `${index * 100}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <PartyPopper className="h-6 w-6 text-primary" />
                      <h3 className="font-semibold text-foreground text-lg">{event.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${eventStatus.color}`}>
                        {eventStatus.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        {format(event.date, "EEEE dd MMMM yyyy", { locale: fr })}
                        {event.heure && ` à ${event.heure}`}
                      </div>
                      {event.lieu && (
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {event.lieu}
                        </div>
                      )}
                      <div className="text-xs">
                        Créé par {event.author === 'papa' ? 'Papa' : 'Maman'}
                      </div>
                    </div>
                    
                    {event.description && (
                      <div className="bg-muted/30 rounded-lg p-3 mb-4">
                        <p className="text-foreground text-sm">{event.description}</p>
                      </div>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleLike(event.id)}
                    className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors p-2"
                  >
                    <Heart className="h-5 w-5" />
                    {event.likes}
                  </button>
                </div>

                {canModify(event) && (
                  <div className="flex items-center gap-2 pt-3 border-t border-border">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setEditingEvent(event);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {events.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="p-12 text-center">
            <PartyPopper className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucun événement pour le moment</h3>
            <p className="text-muted-foreground mb-4">
              Commencez à planifier les futurs moments d'Inaya
            </p>
            {userType !== 'admin' && (
              <Button onClick={() => setIsDialogOpen(true)} className="gradient-primary text-white">
                Créer le premier événement
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default EventsSection;
