import React, { useRef, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Image, Video } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FileUploadProps {
  accept: string;
  onFileSelect: (file: File) => void;
  onFileUpload: (url: string) => void;
  type: 'image' | 'video';
  className?: string;
}

const FileUpload = ({ accept, onFileSelect, onFileUpload, type, className }: FileUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validation de la taille (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: "Erreur",
        description: "Le fichier est trop volumineux (max 50MB)",
        variant: "destructive"
      });
      return;
    }

    setSelectedFile(file);
    onFileSelect(file);

    // Créer une preview pour les images
    if (type === 'image' && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else if (type === 'video' && file.type.startsWith('video/')) {
      const videoUrl = URL.createObjectURL(file);
      setPreviewUrl(videoUrl);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // Simuler l'upload - dans un vrai projet, vous uploaderiez vers votre serveur
      // ou un service cloud comme AWS S3, Cloudinary, etc.
      const formData = new FormData();
      formData.append('file', selectedFile);
      
      // Pour l'instant, on utilise un URL temporaire
      const tempUrl = URL.createObjectURL(selectedFile);
      
      // Simuler un délai d'upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onFileUpload(tempUrl);
      
      toast({
        title: "Fichier uploadé",
        description: `${type === 'image' ? 'Image' : 'Vidéo'} uploadée avec succès`,
      });
      
      // Reset
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Erreur upload:', error);
      toast({
        title: "Erreur",
        description: "Échec de l'upload du fichier",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-4">
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2"
        >
          {type === 'image' ? <Image className="h-4 w-4" /> : <Video className="h-4 w-4" />}
          Choisir un fichier
        </Button>
        
        {selectedFile && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground truncate max-w-[200px]">
              {selectedFile.name}
            </span>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={clearSelection}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Preview */}
      {previewUrl && (
        <div className="border rounded-lg p-4">
          {type === 'image' ? (
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="max-w-full max-h-48 object-contain rounded"
            />
          ) : (
            <video 
              src={previewUrl} 
              controls 
              className="max-w-full max-h-48 rounded"
            >
              Votre navigateur ne supporte pas la lecture vidéo.
            </video>
          )}
        </div>
      )}

      {selectedFile && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Upload en cours...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Uploader le fichier
            </>
          )}
        </Button>
      )}
    </div>
  );
};

export default FileUpload;