
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, Plus, Calendar as CalendarIcon, Clock, MapPin, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Consultation {
  id: string;
  lieu: string;
  professionnel: string;
  date: Date;
  heure: string;
  commentaires: string;
  likes: number;
}

const ConsultationsSection = () => {
  const [consultations, setConsultations] = useState<Consultation[]>([
    {
      id: '1',
      lieu: 'Cabinet Dr. Martin',
      professionnel: 'Dr. Sophie Martin',
      date: new Date('2024-12-01'),
      heure: '14:30',
      commentaires: 'Première visite, tout va bien. Inaya grandit parfaitement ❤️',
      likes: 3
    },
    {
      id: '2',
      lieu: 'Clinique des Enfants',
      professionnel: 'Dr. Pierre Durand',
      date: new Date('2024-11-15'),
      heure: '10:00',
      commentaires: 'Vaccins à jour, poids parfait pour son âge',
      likes: 2
    }
  ]);

  const [newConsultation, setNewConsultation] = useState({
    lieu: '',
    professionnel: '',
    date: undefined as Date | undefined,
    heure: '',
    commentaires: ''
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleAddConsultation = () => {
    if (!newConsultation.lieu.trim() || !newConsultation.professionnel.trim() || !newConsultation.date) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const consultation: Consultation = {
      id: Date.now().toString(),
      lieu: newConsultation.lieu,
      professionnel: newConsultation.professionnel,
      date: newConsultation.date,
      heure: newConsultation.heure || '00:00',
      commentaires: newConsultation.commentaires,
      likes: 0
    };

    setConsultations([consultation, ...consultations]);
    setNewConsultation({
      lieu: '',
      professionnel: '',
      date: undefined,
      heure: '',
      commentaires: ''
    });
    setIsDialogOpen(false);
    
    toast({
      title: "Consultation ajoutée",
      description: "La consultation a été enregistrée avec succès ✨"
    });
  };

  const handleLike = (consultationId: string) => {
    setConsultations(consultations.map(consultation => 
      consultation.id === consultationId 
        ? { ...consultation, likes: consultation.likes + 1 }
        : consultation
    ));
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            🩺 Consultations
          </h1>
          <p className="text-muted-foreground">
            Suivi médical d'Inaya
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gradient-primary text-white hover:opacity-90 shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              Nouvelle consultation
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter une consultation</DialogTitle>
              <DialogDescription>
                Enregistrez un rendez-vous médical d'Inaya
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Lieu *</label>
                <Input
                  placeholder="Cabinet médical, clinique..."
                  value={newConsultation.lieu}
                  onChange={(e) => setNewConsultation({...newConsultation, lieu: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Professionnel de santé *</label>
                <Input
                  placeholder="Dr. Nom du médecin"
                  value={newConsultation.professionnel}
                  onChange={(e) => setNewConsultation({...newConsultation, professionnel: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newConsultation.date ? format(newConsultation.date, "dd/MM/yyyy", { locale: fr }) : "Choisir"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={newConsultation.date}
                        onSelect={(date) => setNewConsultation({...newConsultation, date})}
                        locale={fr}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Heure</label>
                  <Input
                    type="time"
                    value={newConsultation.heure}
                    onChange={(e) => setNewConsultation({...newConsultation, heure: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Commentaires</label>
                <Textarea
                  placeholder="Notes sur la consultation..."
                  value={newConsultation.commentaires}
                  onChange={(e) => setNewConsultation({...newConsultation, commentaires: e.target.value})}
                />
              </div>
              
              <Button onClick={handleAddConsultation} className="w-full gradient-primary text-white">
                Enregistrer la consultation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Consultations List */}
      <div className="space-y-4">
        {consultations.map((consultation, index) => (
          <Card key={consultation.id} className="hover:shadow-lg transition-all duration-300 animate-fade-in-up border-0" style={{ animationDelay: `${index * 100}ms` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-lg mb-2">{consultation.lieu}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {consultation.professionnel}
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4" />
                      {format(consultation.date, "EEEE dd MMMM yyyy", { locale: fr })}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {consultation.heure}
                    </div>
                  </div>
                </div>
                
                <button 
                  onClick={() => handleLike(consultation.id)}
                  className="flex items-center gap-1 text-red-500 hover:text-red-600 transition-colors p-2"
                >
                  <Heart className="h-5 w-5" />
                  {consultation.likes}
                </button>
              </div>
              
              {consultation.commentaires && (
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-foreground">{consultation.commentaires}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ConsultationsSection;
