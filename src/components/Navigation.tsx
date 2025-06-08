
import React from 'react';
import { Button } from "@/components/ui/button";
import { Home, Camera, Heart, BookOpen, Calendar, Video, LogOut } from "lucide-react";

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
    { id: 'journal', label: 'Journal', icon: BookOpen },
    { id: 'events', label: 'Évènements', icon: Calendar },
  ];

  const getUserDisplay = () => {
    switch (userType) {
      case 'papa':
        return 'Bienvenue Papa ❤️';
      case 'maman':
        return 'Bienvenue Maman ❤️';
      case 'admin':
        return 'Admin';
      default:
        return 'Utilisateur';
    }
  };

  return (
    <div className="w-64 bg-card border-r border-border flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-gradient-to-br from-pink-400 to-purple-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">I</span>
          </div>
          <div>
            <h1 className="font-heading font-bold text-lg text-foreground">INAYASPACE</h1>
            <p className="text-sm text-muted-foreground">{getUserDisplay()}</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className={`w-full justify-start gap-3 ${
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setActiveSection(item.id)}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-border">
        <Button
          variant="outline"
          className="w-full gap-2 text-muted-foreground hover:text-foreground"
          onClick={onLogout}
        >
          <LogOut className="h-4 w-4" />
          Déconnexion
        </Button>
      </div>
    </div>
  );
};

export default Navigation;
