'use client';

import { useEffect, useState, useRef } from 'react';
import { getPusherClient } from '@/lib/pusher';
import { motion, AnimatePresence } from 'framer-motion';

type DonationEvent = {
  name: string;
  amount: number;
  message: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
};

export default function Overlay() {
  const [donations, setDonations] = useState<DonationEvent[]>([]);
  const [currentDonation, setCurrentDonation] = useState<DonationEvent | null>(null);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe('sawer-channel');

    channel.bind('donation', (data: DonationEvent) => {
      setDonations(prev => [...prev, data]);
    });

    return () => {
      pusher.unsubscribe('sawer-channel');
    };
  }, []);

  useEffect(() => {
    if (donations.length > 0 && !currentDonation) {
      const nextDonation = donations[0];
      setCurrentDonation(nextDonation);
      setDonations(prev => prev.slice(1));
      
      // Play default notification sound if not playing custom sound or media
      if (nextDonation.mediaType === 'none' || nextDonation.mediaType === 'tts') {
        const audio = new Audio('/notification.mp3'); // Need to put an mp3 in public/
        audio.play().catch(e => console.log('Audio play failed', e));
      }

      // Handle TTS
      if (nextDonation.mediaType === 'tts' && nextDonation.message) {
        const msg = new SpeechSynthesisUtterance(`${nextDonation.name} mendonasikan ${nextDonation.amount} rupiah. Pesannya: ${nextDonation.message}`);
        msg.lang = 'id-ID';
        window.speechSynthesis.speak(msg);
      }

      // Handle Custom Sound
      if (nextDonation.mediaType === 'custom_sound' && nextDonation.mediaUrl) {
         const customAudio = new Audio(nextDonation.mediaUrl);
         customAudio.play().catch(e => console.log('Custom audio play failed', e));
      }

      // Show for 15 seconds to allow time for media
      setTimeout(() => {
        setCurrentDonation(null);
      }, 15000);
    }
  }, [donations, currentDonation]);

  // Handle YouTube extraction
  const getYoutubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  // Handle TikTok extraction
  const getTiktokId = (url: string) => {
    const regExp = /video\/(\d+)/;
    const match = url.match(regExp);
    return match ? match[1] : null;
  };

  return (
    <div className="w-screen h-screen bg-transparent overflow-hidden relative">
      <AnimatePresence>
        {currentDonation && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 50, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="absolute top-0 left-0 w-full flex justify-center"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 rounded-2xl shadow-2xl text-center text-white max-w-2xl border-4 border-white">
              <div className="text-3xl font-black mb-2 animate-pulse">
                {currentDonation.name} donasi Rp {currentDonation.amount.toLocaleString('id-ID')}!
              </div>
              
              {currentDonation.message && (
                <div className="text-xl italic bg-black/20 p-3 rounded-lg mt-4">
                  "{currentDonation.message}"
                </div>
              )}

              {currentDonation.mediaType === 'youtube' && currentDonation.mediaUrl && (
                <div className="mt-4 flex justify-center">
                  <iframe 
                    width="400" 
                    height="225" 
                    src={`https://www.youtube.com/embed/${getYoutubeId(currentDonation.mediaUrl)}?autoplay=1&controls=0`} 
                    frameBorder="0" 
                    allow="autoplay; encrypted-media" 
                    allowFullScreen
                    className="rounded-lg shadow-lg"
                  ></iframe>
                </div>
              )}

              {currentDonation.mediaType === 'tiktok' && currentDonation.mediaUrl && (
                <div className="mt-4 flex justify-center bg-black rounded-lg overflow-hidden h-[400px]">
                  <iframe 
                    src={`https://www.tiktok.com/embed/v2/${getTiktokId(currentDonation.mediaUrl)}`}
                    className="w-[325px] h-[400px] border-0"
                    allow="encrypted-media"
                  ></iframe>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
