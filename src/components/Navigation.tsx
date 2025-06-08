
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Home, Camera, Video, Heart, FileText, Calendar, LogOut, Settings } from "lucide-react";
import PasswordChangeDialog from './PasswordChangeDialog';

interface NavigationProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  userType: 'papa' | 'maman' | 'admin';
  onLogout: () => void;
}

const Navigation = ({ activeSection, setActiveSection, userType, onLogout }: NavigationProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Accueil', icon: Home },
    { id: 'photos', label: 'Photos', icon: Camera },
    { id: 'videos', label: 'Vidéos', icon: Video },
    { id: 'consultations', label: 'Consultations', icon: Heart },
    { id: 'journal', label: 'Journal', icon: FileText },
    { id: 'events', label: 'Événements', icon: Calendar },
  ];

  return (
    <Card className="w-64 h-full bg-card border-r border-border flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-heading font-bold text-foreground mb-1">
          🪐 INAYASPACE
        </h2>
        <p className="text-sm text-muted-foreground">
          {userType === 'papa' ? 'Papa' : userType === 'maman' ? 'Maman' : 'Administrateur'}
        </p>
      </div>

      <Separator />

      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <Icon className="h-4 w-4 mr-3" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <Separator />

      <div className="p-4 space-y-2">
        <PasswordChangeDialog userType={userType} />
        
        <Button
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4 mr-3" />
          Se déconnecter
        </Button>
      </div>
    </Card>
  );
};

export default Navigation;
