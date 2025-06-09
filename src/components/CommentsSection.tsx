
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Edit, Trash2, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface Comment {
  id: number;
  user_id: number;
  comment_text: string;
  created_at: string;
  updated_at: string;
  email: string;
  user_type: string;
}

interface CommentsSectionProps {
  contentType: string;
  contentId: string;
  token: string;
  userType: string;
  userId: number;
}

const CommentsSection = ({ contentType, contentId, token, userType, userId }: CommentsSectionProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editText, setEditText] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/comments.php?content_type=${contentType}&content_id=${contentId}`, {
        headers: { 'Authorization': token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setComments(data.comments);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des commentaires:', error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [contentType, contentId, token]);

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez écrire un commentaire",
        variant: "destructive"
      });
      return;
    }

    if (newComment.length > 150) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas dépasser 150 caractères",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/comments.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          comment_text: newComment
        })
      });

      if (response.ok) {
        await fetchComments();
        setNewComment('');
        setIsDialogOpen(false);
        toast({
          title: "Commentaire ajouté",
          description: "Votre commentaire a été publié ✨"
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Impossible d'ajouter le commentaire",
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

  const handleEditComment = async () => {
    if (!editText.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez écrire un commentaire",
        variant: "destructive"
      });
      return;
    }

    if (editText.length > 150) {
      toast({
        title: "Erreur",
        description: "Le commentaire ne peut pas dépasser 150 caractères",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/comments.php', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          comment_id: editingComment?.id,
          comment_text: editText
        })
      });

      if (response.ok) {
        await fetchComments();
        setEditingComment(null);
        setEditText('');
        setIsEditDialogOpen(false);
        toast({
          title: "Commentaire modifié",
          description: "Votre commentaire a été mis à jour ✨"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de modifier le commentaire",
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

  const handleDeleteComment = async (commentId: number) => {
    try {
      const response = await fetch('/api/comments.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ comment_id: commentId })
      });

      if (response.ok) {
        await fetchComments();
        toast({
          title: "Commentaire supprimé",
          description: "Le commentaire a été supprimé"
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer le commentaire",
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

  const canModifyComment = (comment: Comment) => {
    return userType === 'admin' || comment.user_id === userId;
  };

  const getAuthorDisplay = (comment: Comment) => {
    if (comment.user_type === 'papa') return 'Papa ❤️';
    if (comment.user_type === 'maman') return 'Maman ❤️';
    return 'Admin';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-1 text-muted-foreground">
              <MessageCircle className="h-4 w-4" />
              {comments.length > 0 && <span className="text-sm">{comments.length}</span>}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Commentaires</DialogTitle>
              <DialogDescription>
                Partagez vos pensées (max 150 caractères)
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Textarea
                  placeholder="Écrivez votre commentaire..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  maxLength={150}
                  rows={3}
                />
                <div className="text-right text-xs text-muted-foreground mt-1">
                  {newComment.length}/150
                </div>
              </div>
              
              <Button onClick={handleAddComment} className="w-full">
                <Send className="h-4 w-4 mr-2" />
                Publier le commentaire
              </Button>
              
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {comments.map((comment) => (
                  <div key={comment.id} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium text-sm">{getAuthorDisplay(comment)}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(comment.created_at), "dd/MM/yyyy 'à' HH:mm", { locale: fr })}
                          {comment.updated_at !== comment.created_at && ' (modifié)'}
                        </p>
                      </div>
                      
                      {canModifyComment(comment) && (
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingComment(comment);
                              setEditText(comment.comment_text);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteComment(comment.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm">{comment.comment_text}</p>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le commentaire</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Textarea
                placeholder="Modifiez votre commentaire..."
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={150}
                rows={3}
              />
              <div className="text-right text-xs text-muted-foreground mt-1">
                {editText.length}/150
              </div>
            </div>
            
            <Button onClick={handleEditComment} className="w-full">
              Sauvegarder les modifications
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommentsSection;
