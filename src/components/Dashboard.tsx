
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Heart, FileText, Calendar, Star, Sparkles, Video } from "lucide-react";

interface DashboardProps {
  userType: 'papa' | 'maman' | 'admin';
  onSectionChange?: (section: string) => void;
}

const Dashboard = ({ userType, onSectionChange }: DashboardProps) => {
  const stats = [
    { label: 'Photos', value: '127', icon: Camera, color: 'text-primary', section: 'photos' },
    { label: 'Vidéos', value: '15', icon: Video, color: 'text-purple-500', section: 'videos' },
    { label: 'Consultations', value: '8', icon: Heart, color: 'text-red-500', section: 'consultations' },
    { label: 'Entrées journal', value: '23', icon: FileText, color: 'text-purple-500', section: 'journal' },
    { label: 'Événements', value: '5', icon: Calendar, color: 'text-blue-500', section: 'events' },
  ];

  const recentActivities = [
    { 
      action: 'Photo ajoutée', 
      detail: 'Premier sourire', 
      time: 'Il y a 2 heures',
      by: userType === 'papa' ? 'Maman' : 'Papa'
    },
    { 
      action: 'Consultation', 
      detail: 'Visite pédiatre', 
      time: 'Hier',
      by: userType === 'papa' ? 'Papa' : 'Maman'
    },
    { 
      action: 'Note journal', 
      detail: 'Première nuit complète', 
      time: 'Il y a 3 jours',
      by: userType === 'papa' ? 'Maman' : 'Papa'
    },
  ];

  const handleCardClick = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <div className="p-6 space-y-6 animate-fade-in-up">
      <div className="relative">
        <div className="absolute -top-2 -right-2">
          <Sparkles className="h-6 w-6 text-primary animate-pulse-soft" />
        </div>
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
          {userType === 'papa' ? 'Bienvenue Papa ❤️' : 
           userType === 'maman' ? 'Bienvenue Maman ❤️' : 
           'Panel Administrateur'}
        </h1>
        <p className="text-muted-foreground text-lg">
          L'univers précieux d'Inaya vous attend
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.label} 
              className="relative overflow-hidden hover:shadow-lg transition-all duration-300 animate-fade-in-up border-0 bg-gradient-to-br from-card to-muted/20 cursor-pointer hover:scale-105" 
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleCardClick(stat.section)}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
                <div className="absolute -bottom-2 -right-2 opacity-10">
                  <Icon className="h-16 w-16" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <Card className="animate-fade-in-up border-0 shadow-lg" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-primary" />
            Activités récentes
          </CardTitle>
          <CardDescription>
            Les derniers moments partagés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{activity.action}</p>
                  <p className="text-sm text-muted-foreground">{activity.detail}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                  <p className="text-xs text-primary">par {activity.by}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quote of the day */}
      <Card className="gradient-soft border-0 animate-fade-in-up" style={{ animationDelay: '600ms' }}>
        <CardContent className="p-6 text-center">
          <p className="text-lg italic text-foreground mb-2">
            "Chaque jour avec Inaya est un cadeau précieux ✨"
          </p>
          <p className="text-sm text-muted-foreground">
            Pensée du jour
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
