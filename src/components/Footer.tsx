
import React from 'react';
import { Heart } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-foreground font-semibold">© INAYASPACE 2025</span>
            <span className="text-muted-foreground">— Tous droits réservés</span>
          </div>
          
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <button className="hover:text-primary transition-colors">
              Mentions légales
            </button>
            <button className="hover:text-primary transition-colors">
              Politique de confidentialité
            </button>
            <button className="hover:text-primary transition-colors">
              Gestion des cookies
            </button>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Créé avec ❤️ pour immortaliser les précieux moments d'Inaya
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
