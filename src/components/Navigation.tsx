
import React from 'react';
import { Button } from "@/components/ui/button";
import { Camera, FileText, Heart, Calendar, Home, LogOut, Baby } from "lucide-react";

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
    { id: 'consultations', label: 'Consultations', icon: Heart },
    { id: 'journal', label: 'Journal', icon: FileText },
    { id: 'events', label: 'Événements', icon: Calendar },
  ];

  return (
    <nav className="bg-card border-r border-border min-h-screen w-64 p-6 flex flex-col">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
            <Baby className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-heading font-bold text-foreground">INAYASPACE</h1>
            <p className="text-sm text-muted-foreground">
              {userType === 'papa' ? 'Bienvenue Papa ❤️' : 
               userType === 'maman' ? 'Bienvenue Maman ❤️' : 
               'Admin'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "ghost"}
              className={`w-full justify-start gap-3 transition-all duration-200 ${
                activeSection === item.id 
                  ? 'gradient-primary text-white shadow-md' 
                  : 'hover:bg-accent/20 text-foreground'
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </div>

      <div className="mt-auto pt-6 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={onLogout}
        >
          <LogOut className="h-5 w-5" />
          Déconnexion
        </Button>
      </div>
    </nav>
  );
};

export default Navigation;
