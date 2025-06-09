
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";

interface EmojiLikeButtonProps {
  contentType: string;
  contentId: string;
  token: string;
}

interface EmojiType {
  id: number;
  emoji: string;
  name: string;
}

interface LikeData {
  emoji_counts: Record<string, { count: number; users: string[] }>;
  user_has_liked: boolean;
  user_emoji: string | null;
}

const EMOJI_TYPES: EmojiType[] = [
  { id: 1, emoji: '❤️', name: 'Cœur' },
  { id: 2, emoji: '😍', name: 'Yeux cœur' },
  { id: 3, emoji: '🥰', name: 'Sourire amoureux' },
  { id: 4, emoji: '😊', name: 'Sourire' },
  { id: 5, emoji: '👏', name: 'Applaudissements' },
  { id: 6, emoji: '🎉', name: 'Fête' },
  { id: 7, emoji: '✨', name: 'Étoiles' },
  { id: 8, emoji: '🔥', name: 'Feu' }
];

const EmojiLikeButton = ({ contentType, contentId, token }: EmojiLikeButtonProps) => {
  const [likeData, setLikeData] = useState<LikeData>({
    emoji_counts: {},
    user_has_liked: false,
    user_emoji: null
  });
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const fetchLikes = async () => {
    try {
      const response = await fetch(`/api/likes.php?content_type=${contentType}&content_id=${contentId}`, {
        headers: { 'Authorization': token }
      });
      
      if (response.ok) {
        const data = await response.json();
        setLikeData(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des likes:', error);
    }
  };

  useEffect(() => {
    fetchLikes();
  }, [contentType, contentId, token]);

  const handleEmojiClick = async (emojiId: number) => {
    try {
      const response = await fetch('/api/likes.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId,
          emoji_id: emojiId
        })
      });

      if (response.ok) {
        await fetchLikes();
        setIsOpen(false);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible d'ajouter le like",
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

  const handleRemoveLike = async () => {
    try {
      const response = await fetch('/api/likes.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          content_type: contentType,
          content_id: contentId
        })
      });

      if (response.ok) {
        await fetchLikes();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive"
      });
    }
  };

  const totalLikes = Object.values(likeData.emoji_counts).reduce((sum, data) => sum + data.count, 0);

  return (
    <div className="flex items-center gap-2">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={`flex items-center gap-1 ${likeData.user_has_liked ? 'text-red-500' : 'text-muted-foreground'}`}
          >
            {likeData.user_has_liked && likeData.user_emoji ? (
              <span className="text-lg">{likeData.user_emoji}</span>
            ) : (
              <span className="text-lg">👍</span>
            )}
            {totalLikes > 0 && <span className="text-sm">{totalLikes}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-4 gap-2">
            {EMOJI_TYPES.map((emoji) => (
              <Button
                key={emoji.id}
                variant="ghost"
                size="sm"
                className="p-2 hover:bg-muted"
                onClick={() => handleEmojiClick(emoji.id)}
                title={emoji.name}
              >
                <span className="text-xl">{emoji.emoji}</span>
              </Button>
            ))}
          </div>
          {likeData.user_has_liked && (
            <div className="mt-2 pt-2 border-t">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRemoveLike}
                className="w-full text-red-600"
              >
                Retirer mon like
              </Button>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Affichage des émojis avec compteurs */}
      <div className="flex items-center gap-1">
        {Object.entries(likeData.emoji_counts).map(([emoji, data]) => (
          <div key={emoji} className="flex items-center gap-1 text-sm">
            <span>{emoji}</span>
            <span className="text-muted-foreground">{data.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmojiLikeButton;
