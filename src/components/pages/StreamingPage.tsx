import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { Alert, AlertDescription } from '../ui/alert';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  MessageCircle, 
  Heart, 
  Share2, 
  Users, 
  Eye,
  Send,
  Settings,
  Fullscreen,
  ArrowLeft,
  X,
  Info,
  Lock,
  CheckCircle,
  Loader,
  Video
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';
import StreamingAccessAPI from '../../services/api/StreamingAccessAPI';

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  image: string;
  price: number;
  currency: string;
  category: string;
  attendees: number;
  maxAttendees: number;
  isLive: boolean;
  organizer: string;
  streamUrl?: string;
  videoUrl?: string;
  source?: 'feeti2' | 'feetiplay';
  isReplay?: boolean;
}

interface ChatMessage {
  id: string;
  user: string;
  message: string;
  timestamp: string;
  isSuper?: boolean;
}

interface StreamingPageProps {
  event: Event;
  onBack: () => void;
  currentUser: any;
}

export function StreamingPage({ event, onBack, currentUser }: StreamingPageProps) {
  const isFeetiPlayEvent = event.source === 'feetiplay';
  const isReplay = !!event.isReplay || (!event.isLive && !!event.videoUrl);
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(isFeetiPlayEvent);
  const [accessCode, setAccessCode] = useState('');
  const [accessPin, setAccessPin] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Video player state
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(80);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Chat state
  const [chatMessage, setChatMessage] = useState('');
  const [viewers, setViewers] = useState(1247);
  const [likes, setLikes] = useState(234);
  const [hasLiked, setHasLiked] = useState(false);
  const [showEventInfo, setShowEventInfo] = useState(true);

  useEffect(() => {
    if (isFeetiPlayEvent) {
      setIsAuthenticated(true);
    }
  }, [isFeetiPlayEvent]);

  // Mock chat messages
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      user: 'MusicFan92',
      message: 'Incroyable performance ! 🎵',
      timestamp: '20:45',
    },
    {
      id: '2',
      user: 'EventLover',
      message: 'Le son est parfait depuis Paris !',
      timestamp: '20:46',
    },
    {
      id: '3',
      user: 'LiveStreamPro',
      message: 'Qualité vidéo excellente 👏',
      timestamp: '20:47',
      isSuper: true
    },
    {
      id: '4',
      user: 'ConcertGoer',
      message: 'Merci pour ce live gratuit !',
      timestamp: '20:48',
    }
  ]);

  // Video player controls
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateTime);
    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('ended', () => setIsPlaying(false));

    return () => {
      video.removeEventListener('timeupdate', updateTime);
      video.removeEventListener('loadedmetadata', updateDuration);
      video.removeEventListener('ended', () => setIsPlaying(false));
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.volume = volume / 100;
    }
  }, [volume]);

  const handleVerifyAccess = async () => {
    if (!accessCode || !accessPin) {
      toast.error('Veuillez entrer votre code d\'accès et PIN');
      return;
    }

    setIsVerifying(true);

    try {
      const response = await StreamingAccessAPI.verifyAccessCode(
        event.id,
        accessCode.trim().toUpperCase(),
        accessPin.trim()
      );

      if (response.success && response.data?.valid) {
        setIsAuthenticated(true);
        toast.success('Accès autorisé ! Profitez de l\'événement 🎉');
      } else {
        toast.error(response.data?.message || 'Code d\'accès invalide');
      }
    } catch (error: any) {
      toast.error(error.message || 'Erreur lors de la vérification');
    } finally {
      setIsVerifying(false);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    if (videoRef.current) {
      videoRef.current.volume = value / 100;
      if (value === 0) {
        setIsMuted(true);
        videoRef.current.muted = true;
      } else if (isMuted) {
        setIsMuted(false);
        videoRef.current.muted = false;
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoRef.current) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const newTime = percentage * duration;
    
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      user: currentUser?.name || 'Anonyme',
      message: chatMessage,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');
  };

  const handleLike = () => {
    if (!hasLiked) {
      setLikes(prev => prev + 1);
      setHasLiked(true);
      toast.success('❤️ Vous avez aimé !');
    } else {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: isReplay ? `Regardez le replay ${event.title} sur Feeti !` : `Regardez ${event.title} en direct sur Feeti !`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Lien copié dans le presse-papiers !');
    }
  };

  // Authentication screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
        <div className="container mx-auto px-4 py-8">
          <Button
            variant="ghost"
            onClick={onBack}
            className="mb-6 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <div className="max-w-4xl mx-auto">
            {/* Event Header */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20 text-white mb-6">
              <CardContent className="p-6">
                <div className="flex items-start gap-6">
                  <div className="relative flex-shrink-0 w-32 h-32 rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={event.image}
                      alt={event.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <Badge className={`absolute top-2 right-2 ${isReplay ? 'bg-purple-600' : 'bg-red-600 animate-pulse'}`}>
                      {isReplay ? 'REPLAY' : '🔴 LIVE'}
                    </Badge>
                  </div>
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
                    <div className="flex items-center gap-4 text-white/80 mb-4">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{viewers.toLocaleString()} spectateurs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                          <span>{isReplay ? 'Replay disponible' : 'En direct'}</span>
                      </div>
                    </div>
                    <p className="text-white/70">{event.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Authentication Form */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white text-2xl">
                  <Lock className="w-6 h-6 text-indigo-400" />
                  Accès Sécurisé au Streaming
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                  <Alert className="bg-blue-500/20 border-blue-400/30">
                    <Info className="w-4 h-4 text-blue-300" />
                    <AlertDescription className="text-blue-100">
                      <strong>Accès réservé aux participants.</strong> Entrez le code d'accès et le PIN 
                      que vous avez reçus par email après votre achat.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="accessCode" className="text-white">Code d'Accès</Label>
                    <Input
                      id="accessCode"
                      value={accessCode}
                      onChange={(e) => setAccessCode(e.target.value)}
                      placeholder="XXXX-XXXX-XXXX"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-lg font-mono tracking-wider"
                      maxLength={14}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="accessPin" className="text-white">Code PIN</Label>
                    <Input
                      id="accessPin"
                      type="password"
                      value={accessPin}
                      onChange={(e) => setAccessPin(e.target.value)}
                      placeholder="••••••"
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 text-center text-lg font-mono tracking-wider"
                      maxLength={6}
                    />
                  </div>
                </div>

                <Button
                  onClick={handleVerifyAccess}
                  disabled={isVerifying || !accessCode || !accessPin}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white py-6 text-lg"
                >
                  {isVerifying ? (
                    <>
                      <Loader className="w-5 h-5 mr-2 animate-spin" />
                      Vérification en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Accéder au Stream
                    </>
                  )}
                </Button>

                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-white/60 text-center">
                    Vous n'avez pas de code d'accès ?{' '}
                    <button
                      onClick={onBack}
                      className="text-indigo-400 hover:text-indigo-300 underline"
                    >
                      Acheter un billet
                    </button>
                  </p>
                </div>

                {/* Demo access for testing */}
                <Alert className="bg-amber-500/20 border-amber-400/30">
                  <Info className="w-4 h-4 text-amber-300" />
                  <AlertDescription className="text-amber-100">
                    <strong>Mode Démo :</strong> Pour tester, utilisez n'importe quel code (ex: TEST-1234-5678) 
                    et PIN (ex: 123456)
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Streaming page with active video player
  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={onBack}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>

          <Badge className={`text-white px-4 py-2 ${isReplay ? 'bg-purple-600' : 'bg-red-600 animate-pulse'}`}>
            {!isReplay && <span className="inline-block w-2 h-2 bg-white rounded-full mr-2 animate-ping"></span>}
            {isReplay ? 'REPLAY' : 'EN DIRECT'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Video Player */}
          <div className="lg:col-span-2 space-y-4">
            <div 
              ref={containerRef}
              className="relative bg-black rounded-xl overflow-hidden shadow-2xl"
              style={{ aspectRatio: '16/9' }}
            >
              {/* Video Element */}
              <video
                ref={videoRef}
                className="w-full h-full object-contain"
                poster={event.image}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              >
                {event.videoUrl || event.streamUrl ? (
                  <source src={event.videoUrl || event.streamUrl} type="video/mp4" />
                ) : (
                  <source 
                    src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" 
                    type="video/mp4" 
                  />
                )}
                Votre navigateur ne supporte pas la lecture vidéo.
              </video>

              {/* Live indicator overlay */}
              <div className="absolute top-4 left-4 z-10">
                <div className={`flex items-center gap-2 text-white px-4 py-2 rounded-full ${isReplay ? 'bg-purple-600' : 'bg-red-600'}`}>
                  {!isReplay && (
                    <span className="flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                    </span>
                  )}
                  <span className="font-bold">{isReplay ? 'REPLAY' : 'EN DIRECT'}</span>
                </div>
              </div>

              {/* Viewer count */}
              <div className="absolute top-4 right-4 z-10">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm text-white px-4 py-2 rounded-full">
                  <Eye className="w-4 h-4" />
                  <span className="font-medium">{viewers.toLocaleString()}</span>
                </div>
              </div>

              {/* Play/Pause overlay (shown when paused) */}
              {!isPlaying && (
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer z-20"
                  onClick={togglePlay}
                >
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all hover:scale-110">
                    <Play className="w-10 h-10 text-white ml-1" />
                  </div>
                </div>
              )}

              {/* Video Controls */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4 z-30">
                {/* Progress bar */}
                <div 
                  className="w-full h-1 bg-white/20 rounded-full mb-4 cursor-pointer hover:h-2 transition-all"
                  onClick={handleSeek}
                >
                  <div 
                    className="h-full bg-red-600 rounded-full relative"
                    style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                  >
                    <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg"></div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  {/* Left controls */}
                  <div className="flex items-center gap-3">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={togglePlay}
                      className="text-white hover:bg-white/10 h-10 w-10"
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleMute}
                      className="text-white hover:bg-white/10 h-10 w-10"
                    >
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </Button>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => handleVolumeChange(Number(e.target.value))}
                      className="w-20 accent-red-600"
                    />

                    <span className="text-white text-sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>
                  </div>

                  {/* Right controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-white hover:bg-white/10 h-10 w-10"
                    >
                      <Settings className="w-5 h-5" />
                    </Button>

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={toggleFullscreen}
                      className="text-white hover:bg-white/10 h-10 w-10"
                    >
                      <Fullscreen className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Event Info */}
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-white mb-2">{event.title}</h2>
                    <p className="text-gray-400 mb-4">{event.description}</p>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{event.organizer}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Video className="w-4 h-4" />
                        <span>{event.category}</span>
                      </div>
                      <Badge variant="outline" className="text-white border-white/20">
                        {event.date} • {event.time}
                      </Badge>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowEventInfo(!showEventInfo)}
                    className="text-gray-400 hover:text-white"
                  >
                    <Info className="w-5 h-5" />
                  </Button>
                </div>

                {showEventInfo && (
                  <>
                    <Separator className="my-4 bg-gray-800" />
                    
                    <div className="space-y-3">
                      <h3 className="font-semibold text-white">À propos de cet événement</h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </>
                )}

                {/* Interaction buttons */}
                <div className="flex items-center gap-3 mt-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLike}
                    className={`${
                      hasLiked 
                        ? 'bg-red-600 text-white border-red-600' 
                        : 'text-white border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <Heart className={`w-4 h-4 mr-2 ${hasLiked ? 'fill-current' : ''}`} />
                    {likes.toLocaleString()}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleShare}
                    className="text-white border-white/20 hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Partager
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chat Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800 h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageCircle className="w-5 h-5 text-indigo-400" />
                  Chat en Direct
                </CardTitle>
              </CardHeader>

              <Separator className="bg-gray-800" />

              {/* Chat messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-3">
                  {chatMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.isSuper 
                          ? 'bg-indigo-600/20 border border-indigo-500/30' 
                          : 'bg-gray-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium text-sm ${
                          msg.isSuper ? 'text-indigo-400' : 'text-white'
                        }`}>
                          {msg.user}
                        </span>
                        {msg.isSuper && (
                          <Badge className="bg-indigo-600 text-white text-xs px-1 py-0">
                            VIP
                          </Badge>
                        )}
                        <span className="text-xs text-gray-500 ml-auto">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm text-gray-300">{msg.message}</p>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Chat input */}
              <div className="p-4 border-t border-gray-800">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Envoyez un message..."
                    className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  />
                  <Button 
                    type="submit" 
                    size="icon"
                    disabled={!chatMessage.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
                {!currentUser && (
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Connectez-vous pour chatter
                  </p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
