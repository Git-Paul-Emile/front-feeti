import { useState } from 'react';
import { Share2, Facebook, Twitter, MessageCircle, Copy, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { toast } from 'sonner@2.0.3';

interface SocialShareButtonProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function SocialShareButton({ 
  url, 
  title, 
  description = '', 
  image = '',
  size = 'sm',
  variant = 'ghost'
}: SocialShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareData = {
    url: encodeURIComponent(url),
    title: encodeURIComponent(title),
    description: encodeURIComponent(description),
    image: encodeURIComponent(image)
  };

  const socialLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${shareData.url}&quote=${shareData.title}`,
    twitter: `https://twitter.com/intent/tweet?url=${shareData.url}&text=${shareData.title}`,
    whatsapp: `https://wa.me/?text=${shareData.title}%20${shareData.url}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${shareData.url}`
  };

  const handleShare = (platform: keyof typeof socialLinks) => {
    window.open(socialLinks[platform], '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success('Lien copié dans le presse-papiers !');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Erreur lors de la copie du lien');
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: description,
          url: url,
        });
      } catch (err) {
        // User cancelled sharing or error occurred
      }
    }
  };

  const buttonSizes = {
    sm: 'h-7 w-7',
    md: 'h-8 w-8',
    lg: 'h-9 w-9'
  };

  const iconSizes = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-4 w-4'
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          size="sm"
          className={`${buttonSizes[size]} hover:bg-gray-100 transition-colors duration-200`}
          onClick={(e) => e.stopPropagation()}
        >
          <Share2 className={`${iconSizes[size]} text-gray-600`} />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-64 p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-3">
          <h4 className="font-medium text-sm text-gray-900">Partager</h4>
          
          {/* Native Share (if supported) */}
          {navigator.share && (
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start gap-3 h-9"
              onClick={handleNativeShare}
            >
              <Share2 className="h-4 w-4" />
              Partager...
            </Button>
          )}
          
          {/* Social Media Buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9 hover:bg-blue-50 hover:border-blue-200"
              onClick={() => handleShare('facebook')}
            >
              <Facebook className="h-4 w-4 text-blue-600" />
              Facebook
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9 hover:bg-sky-50 hover:border-sky-200"
              onClick={() => handleShare('twitter')}
            >
              <Twitter className="h-4 w-4 text-sky-500" />
              Twitter
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9 hover:bg-green-50 hover:border-green-200"
              onClick={() => handleShare('whatsapp')}
            >
              <MessageCircle className="h-4 w-4 text-green-600" />
              WhatsApp
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="justify-start gap-2 h-9 hover:bg-blue-50 hover:border-blue-200"
              onClick={() => handleShare('linkedin')}
            >
              <div className="h-4 w-4 bg-blue-700 rounded-sm flex items-center justify-center">
                <span className="text-white text-xs font-bold">in</span>
              </div>
              LinkedIn
            </Button>
          </div>
          
          {/* Copy Link Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start gap-3 h-9 hover:bg-gray-50"
            onClick={handleCopyLink}
          >
            {copied ? (
              <>
                <Check className="h-4 w-4 text-green-600" />
                <span className="text-green-600">Copié !</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copier le lien
              </>
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}