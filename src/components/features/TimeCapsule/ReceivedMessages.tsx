import React, { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle } from
'@/components/ui/dialog';
import {
  X,
  Mail,
  Calendar,
  User,
  FileText,
  Image as ImageIcon,
  Video,
  Mic,
  Clock,
  Gift,
  Heart } from
'lucide-react';
import { format } from 'date-fns';import { useTranslation } from "react-i18next";

interface TimeCapsuleMessage {
  id: string;
  title: string;
  messageType: 'text' | 'photo' | 'video' | 'audio';
  textContent: string | null;
  attachmentUrl: string | null;
  attachmentMetadata: any;
  status: 'unlocked' | 'delivered';
  unlockCondition: 'date' | 'after_passing';
  unlockedAt: string;
  createdAt: string;
  sender: {
    id: string;
    name: string;
    email: string;
  };
}

export const ReceivedMessages: React.FC = () => {
  const [messages, setMessages] = useState<TimeCapsuleMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<TimeCapsuleMessage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/time-capsule/received', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }

        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const handleViewMessage = async (message: TimeCapsuleMessage) => {
    setSelectedMessage(message);

    if (message.status === 'unlocked') {
      // Mark message as delivered
      await fetch(`/api/time-capsule/${message.id}/mark-delivered`, {
        method: 'POST'
      });
    }
  };

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'text':
        return <FileText className="h-5 w-5" />;
      case 'photo':
        return <ImageIcon className="h-5 w-5" />;
      case 'video':
        return <Video className="h-5 w-5" />;
      case 'audio':
        return <Mic className="h-5 w-5" />;
      default:
        return <Mail className="h-5 w-5" />;
    }
  };

  if (messages.length === 0 && !loading) {
    return null; // Don't show the section if there are no messages
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">{t("TimeCapsule.receivedMessages.messages_for_you_1")}</h2>
        </div>
        {messages.length > 0 &&
        <Badge variant="secondary">
            {messages.filter((m) => m.status === 'unlocked').length} new
          </Badge>
        }
      </div>

      {loading ?
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) =>
        <Skeleton key={i} className="h-40" />
        )}
        </div> :

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {messages.map((message) =>
        <Card
          key={message.id}
          className={`cursor-pointer transition-all hover:shadow-lg ${
          message.status === 'unlocked' ? 'ring-2 ring-primary' : ''}`
          }
          onClick={() => handleViewMessage(message)}>

              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getMessageIcon(message.messageType)}
                    <CardTitle className="text-lg">{message.title}</CardTitle>
                  </div>
                  {message.status === 'unlocked' &&
              <Badge variant="default" className="text-xs">New</Badge>
              }
                </div>
                <CardDescription>
                  From {message.sender.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Unlocked {format(new Date(message.unlockedAt), 'MMM d, yyyy')}</span>
                </div>
                {message.unlockCondition === 'after_passing' &&
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <Clock className="h-4 w-4" />
                    <span>{t("TimeCapsule.receivedMessages.final_message_2")}</span>
                  </div>
            }
              </CardContent>
            </Card>
        )}
        </div>
      }

      {/* Viewer Modal */}
      {selectedMessage &&
      <Dialog open={Boolean(selectedMessage)} onOpenChange={() => setSelectedMessage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl">{selectedMessage.title}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    From {selectedMessage.sender.name} • {format(new Date(selectedMessage.createdAt), 'MMMM d, yyyy')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {getMessageIcon(selectedMessage.messageType)}
                </div>
              </div>
            </DialogHeader>
            
            <div className="mt-6">
              {selectedMessage.messageType === 'text' && selectedMessage.textContent &&
            <div className="prose prose-gray max-w-none">
                  <p className="whitespace-pre-wrap text-base leading-relaxed">
                    {selectedMessage.textContent}
                  </p>
                </div>
            }
              
              {selectedMessage.messageType === 'photo' && selectedMessage.attachmentUrl &&
            <div className="rounded-lg overflow-hidden">
                  <img
                src={selectedMessage.attachmentUrl}
                alt={selectedMessage.title}
                className="w-full h-auto" />

                </div>
            }
              
              {selectedMessage.messageType === 'video' && selectedMessage.attachmentUrl &&
            <div className="rounded-lg overflow-hidden bg-black">
                  <video
                controls
                className="w-full h-auto"
                src={selectedMessage.attachmentUrl}>{t("TimeCapsule.receivedMessages.your_browser_does_not_support__3")}


              </video>
                </div>
            }
              
              {selectedMessage.messageType === 'audio' && selectedMessage.attachmentUrl &&
            <div className="bg-gray-50 rounded-lg p-6">
                  <audio
                controls
                className="w-full"
                src={selectedMessage.attachmentUrl}>{t("TimeCapsule.receivedMessages.your_browser_does_not_support__4")}


              </audio>
                </div>
            }
            </div>
            
            <DialogFooter className="mt-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {selectedMessage.unlockCondition === 'date' ?
              <>
                    <Calendar className="h-4 w-4" />
                    <span>{t("TimeCapsule.receivedMessages.scheduled_for_5")}{format(new Date(selectedMessage.unlockedAt), 'MMMM d, yyyy')}</span>
                  </> :

              <>
                    <Heart className="h-4 w-4" />
                    <span>{t("TimeCapsule.receivedMessages.final_message_from_6")}{selectedMessage.sender.name}</span>
                  </>
              }
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      }
    </div>);

};