
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Heart, Baby } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  // Fallback d'authentification pour les tests en développement
  const fallbackAuth = (email: string, password: string) => {
    const users = [
      { email: 'papa@inaya.zidaf.fr', password: 'P@paIn@ya2025', type: 'papa', id: 1 },
      { email: 'maman@inaya.zidaf.fr', password: 'M@manIn@ya2025', type: 'maman', id: 2 },
      { email: 'admin@inaya.zidaf.fr', password: '$S@rrebourg57400$', type: 'admin', id: 3 }
    ];

    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
      const token = 'fallback_token_' + Date.now();
      login(token, {
        id: user.id,
        email: user.email,
        type: user.type as 'papa' | 'maman' | 'admin'
      });
      return true;
    }
    return false;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'login',
          email, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        login(data.token, data.user);
        toast({
          title: "Connexion réussie",
          description: `Bienvenue ${data.user.type === 'papa' ? 'Papa' : data.user.type === 'maman' ? 'Maman' : 'Administrateur'} ❤️`,
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: data.error || "Identifiants incorrects",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erreur de connexion:', error);
      
      // Fallback en cas d'erreur API (pour les tests en développement)
      if (fallbackAuth(email, password)) {
        toast({
          title: "Connexion réussie (mode test)",
          description: `Bienvenue ${email.includes('papa') ? 'Papa' : email.includes('maman') ? 'Maman' : 'Administrateur'} ❤️`,
        });
      } else {
        toast({
          title: "Erreur de connexion",
          description: "Erreur de communication avec le serveur ou identifiants incorrects",
          variant: "destructive",
        });
      }
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center gradient-soft p-4">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 animate-bounce-gentle">
          <Heart className="h-8 w-8 text-primary" />
        </div>
        <div className="absolute top-20 right-20 animate-bounce-gentle" style={{ animationDelay: '1s' }}>
          <Baby className="h-6 w-6 text-accent" />
        </div>
        <div className="absolute bottom-20 left-20 animate-bounce-gentle" style={{ animationDelay: '2s' }}>
          <Heart className="h-4 w-4 text-secondary" />
        </div>
      </div>
      
      <Card className="w-full max-w-md animate-fade-in-up shadow-xl border-0 bg-card/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto mb-4 w-20 h-20 rounded-full gradient-primary flex items-center justify-center">
            <Baby className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-3xl font-heading text-foreground">
            🪐 INAYASPACE
          </CardTitle>
          <CardDescription className="text-muted-foreground text-lg">
            L'univers précieux d'Inaya
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="papa@inaya.zidaf.fr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-border/50 focus:border-primary"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-border/50 focus:border-primary"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full gradient-primary text-white hover:opacity-90 transition-all duration-300 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "Connexion..." : "Se connecter ❤️"}
            </Button>
          </form>
          
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Accès réservé aux parents et administrateur</p>
            <p className="text-xs mt-2 text-primary">Mode test activé - API PHP en développement</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
