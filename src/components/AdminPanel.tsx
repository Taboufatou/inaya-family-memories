
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, BarChart3, FileText, Save, Trash2, Edit } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AdminPanelProps {
  token: string;
}

interface AppConfig {
  config_key: string;
  config_value: string;
}

interface Stats {
  photos: number;
  videos: number;
  consultations: number;
  journal_entries: number;
  events: number;
  users: number;
  likes: number;
  comments: number;
}

const AdminPanel = ({ token }: AdminPanelProps) => {
  const [config, setConfig] = useState<AppConfig[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AppConfig | null>(null);
  const [newConfigKey, setNewConfigKey] = useState('');
  const [newConfigValue, setNewConfigValue] = useState('');
  const { toast } = useToast();

  const fetchConfig = async () => {
    try {
      const response = await fetch('/api/admin.php?action=config', {
        headers: { 'Authorization': token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Erreur lors du chargement de la configuration:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin.php?action=stats', {
        headers: { 'Authorization': token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
      fetchStats();
    }
  }, [isOpen, token]);

  const handleUpdateConfig = async (configKey: string, configValue: string) => {
    try {
      const response = await fetch('/api/admin.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          action: 'update_config',
          config_key: configKey,
          config_value: configValue
        })
      });

      if (response.ok) {
        await fetchConfig();
        toast({
          title: "Configuration mise à jour",
          description: "Les modifications ont été appliquées ✨"
        });
        
        // Recharger la page pour appliquer les changements
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour la configuration",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    }
  };

  const handleAddConfig = async () => {
    if (!newConfigKey.trim() || !newConfigValue.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive"
      });
      return;
    }

    await handleUpdateConfig(newConfigKey, newConfigValue);
    setNewConfigKey('');
    setNewConfigValue('');
  };

  const getConfigValue = (key: string) => {
    const configItem = config.find(item => item.config_key === key);
    return configItem ? configItem.config_value : '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Panel Admin
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Panel d'Administration</DialogTitle>
          <DialogDescription>
            Gérez la configuration et le contenu de l'application
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="config" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="config">Configuration</TabsTrigger>
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="content">Contenu</TabsTrigger>
          </TabsList>

          <TabsContent value="config" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de l'application</CardTitle>
                <CardDescription>
                  Modifiez les paramètres de l'application
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Titre de l'application</label>
                    <Input
                      value={getConfigValue('app_title')}
                      onChange={(e) => {
                        const newConfig = config.map(item => 
                          item.config_key === 'app_title' 
                            ? { ...item, config_value: e.target.value }
                            : item
                        );
                        setConfig(newConfig);
                      }}
                      placeholder="INAYASPACE"
                    />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => handleUpdateConfig('app_title', getConfigValue('app_title'))}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Sauvegarder
                    </Button>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Sous-titre</label>
                    <Input
                      value={getConfigValue('app_subtitle')}
                      onChange={(e) => {
                        const newConfig = config.map(item => 
                          item.config_key === 'app_subtitle' 
                            ? { ...item, config_value: e.target.value }
                            : item
                        );
                        setConfig(newConfig);
                      }}
                      placeholder="L'espace dédié à notre princesse"
                    />
                    <Button
                      size="sm"
                      className="mt-2"
                      onClick={() => handleUpdateConfig('app_subtitle', getConfigValue('app_subtitle'))}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Sauvegarder
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Ordre des sections (JSON)</label>
                  <Textarea
                    value={getConfigValue('sections_order')}
                    onChange={(e) => {
                      const newConfig = config.map(item => 
                        item.config_key === 'sections_order' 
                          ? { ...item, config_value: e.target.value }
                          : item
                      );
                      setConfig(newConfig);
                    }}
                    placeholder='["dashboard", "photos", "videos", "consultations", "journal", "events"]'
                    rows={2}
                  />
                  <Button
                    size="sm"
                    className="mt-2"
                    onClick={() => handleUpdateConfig('sections_order', getConfigValue('sections_order'))}
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Sauvegarder
                  </Button>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Ajouter une nouvelle configuration</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Clé de configuration"
                      value={newConfigKey}
                      onChange={(e) => setNewConfigKey(e.target.value)}
                    />
                    <Input
                      placeholder="Valeur"
                      value={newConfigValue}
                      onChange={(e) => setNewConfigValue(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddConfig} className="mt-2">
                    Ajouter
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats && Object.entries(stats).map(([key, value]) => (
                <Card key={key}>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary">{value}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {key.replace('_', ' ')}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Gestion du contenu</CardTitle>
                <CardDescription>
                  Modifiez ou supprimez le contenu de l'application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Utilisez les sections individuelles pour modifier le contenu spécifique.
                  En tant qu'administrateur, vous pouvez modifier et supprimer tous les éléments.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPanel;
