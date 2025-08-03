
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Heart, Plus, Calendar as CalendarIcon, Clock, MapPin, User, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/hooks/useAuth";
import { apiClient } from "@/utils/apiClient";

interface Consultation {
  id: string;
  lieu: string;
  professionnel: string;
  date: Date;
  heure: string;
  commentaires: string;
  likes: number;
  author: 'papa' | 'maman';
}

interface ConsultationsSectionProps {
  userType: 'papa' | 'maman' | 'admin';
}

const ConsultationsSection = ({ userType }: ConsultationsSectionProps) => {
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [loading, setLoading] = useState(true);

  const [newConsultation, setNewConsultation] = useState({
    lieu: '',
    professionnel: '',
    date: undefined as Date | undefined,
    heure: '',
    commentaires: ''
  });

  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  // Charger les consultations au montage du composant
  useEffect(() => {
    loadConsultations();
  }, []);

  const loadConsultations = async () => {
    if (!token) return;
    
    try {
      const response = await apiClient.getConsultations(token);
      if (response.success && (response.data as any)?.consultations) {
        const formattedConsultations = (response.data as any).consultations.map((c: any) => ({
          id: c.id.toString(),
          lieu: c.lieu,
          professionnel: c.professionnel,
          date: new Date(c.consultation_date),
          heure: c.heure || '00:00',
          commentaires: c.commentaires || '',
          likes: c.likes || 0,
          author: c.author
        }));
        setConsultations(formattedConsultations);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des consultations:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les consultations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddConsultation = async () => {
    if (!newConsultation.lieu.trim() || !newConsultation.professionnel.trim() || !newConsultation.date || !token) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const consultationData = {
        lieu: newConsultation.lieu,
        professionnel: newConsultation.professionnel,
        date: newConsultation.date.toISOString().split('T')[0],
        heure: newConsultation.heure || '00:00',
        commentaires: newConsultation.commentaires
      };

      const response = await apiClient.addConsultation(token, consultationData);
      
      if (response.success) {
        await loadConsultations(); // Recharger la liste
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
      } else {
        throw new Error(response.error || 'Erreur lors de l\'ajout');
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter la consultation",
        variant: "destructive"
      });
    }
  };

  const handleEditConsultation = async () => {
    if (!editingConsultation || !editingConsultation.lieu.trim() || !editingConsultation.professionnel.trim() || !token) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    try {
      const consultationData = {
        lieu: editingConsultation.lieu,
        professionnel: editingConsultation.professionnel,
        date: editingConsultation.date.toISOString().split('T')[0],
        heure: editingConsultation.heure,
        commentaires: editingConsultation.commentaires
      };

      const response = await apiClient.updateConsultation(token, parseInt(editingConsultation.id), consultationData);
      
      if (response.success) {
        await loadConsultations(); // Recharger la liste
        setEditingConsultation(null);
        setIsEditDialogOpen(false);
        
        toast({
          title: "Consultation modifiée",
          description: "La consultation a été modifiée avec succès ✨"
        });
      } else {
        throw new Error(response.error || 'Erreur lors de la modification');
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier la consultation",
        variant: "destructive"
      });
    }
  };

  const handleDeleteConsultation = async (consultationId: string) => {
    if (!token) return;

    try {
      const response = await apiClient.deleteConsultation(token, parseInt(consultationId));
      
      if (response.success) {
        await loadConsultations(); // Recharger la liste
        toast({
          title: "Consultation supprimée",
          description: "La consultation a été supprimée avec succès"
        });
      } else {
        throw new Error(response.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la consultation",
        variant: "destructive"
      });
    }
  };

  const handleLike = (consultationId: string) => {
    setConsultations(consultations.map(consultation => 
      consultation.id === consultationId 
        ? { ...consultation, likes: consultation.likes + 1 }
        : consultation
    ));
  };

  const canModify = (consultation: Consultation) => {
    return userType === 'admin' || consultation.author === userType;
  };

  const getAuthorDisplay = (author: 'papa' | 'maman') => {
    return author === 'papa' ? 'Papa ❤️' : 'Maman ❤️';
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
        
        {(
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
                          className="pointer-events-auto"
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
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier la consultation</DialogTitle>
            <DialogDescription>
              Modifiez les détails de votre consultation
            </DialogDescription>
          </DialogHeader>
          
          {editingConsultation && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Lieu *</label>
                <Input
                  placeholder="Cabinet médical, clinique..."
                  value={editingConsultation.lieu}
                  onChange={(e) => setEditingConsultation({...editingConsultation, lieu: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Professionnel de santé *</label>
                <Input
                  placeholder="Dr. Nom du médecin"
                  value={editingConsultation.professionnel}
                  onChange={(e) => setEditingConsultation({...editingConsultation, professionnel: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground">Date *</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editingConsultation.date ? format(editingConsultation.date, "dd/MM/yyyy", { locale: fr }) : "Choisir"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editingConsultation.date}
                        onSelect={(date) => setEditingConsultation({...editingConsultation, date: date || editingConsultation.date})}
                        locale={fr}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground">Heure</label>
                  <Input
                    type="time"
                    value={editingConsultation.heure}
                    onChange={(e) => setEditingConsultation({...editingConsultation, heure: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground">Commentaires</label>
                <Textarea
                  placeholder="Notes sur la consultation..."
                  value={editingConsultation.commentaires}
                  onChange={(e) => setEditingConsultation({...editingConsultation, commentaires: e.target.value})}
                />
              </div>
              
              <Button onClick={handleEditConsultation} className="w-full gradient-primary text-white">
                Sauvegarder les modifications
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                    <p className="text-xs text-muted-foreground">
                      Par {getAuthorDisplay(consultation.author)}
                    </p>
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
                <div className="bg-muted/30 rounded-lg p-4 mb-4">
                  <p className="text-foreground">{consultation.commentaires}</p>
                </div>
              )}

              {canModify(consultation) && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingConsultation(consultation);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Modifier
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteConsultation(consultation.id)}
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

      {consultations.length === 0 && (
        <Card className="border-2 border-dashed border-border">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Aucune consultation pour le moment</h3>
            <p className="text-muted-foreground mb-4">
              Commencez à enregistrer les consultations d'Inaya
            </p>
            {(
              <Button onClick={() => setIsDialogOpen(true)} className="gradient-primary text-white">
                Ajouter la première consultation
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConsultationsSection;
