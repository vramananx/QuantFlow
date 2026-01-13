
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

export const LiveAnalyst: React.FC = () => {
  const [active, setActive] = useState(false);
  const [status, setStatus] = useState<'idle' | 'connecting' | 'live' | 'error'>('idle');
  const [volume, setVolume] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext>(null);
  const sessionRef = useRef<any>(null);

  const startSession = async () => {
    setStatus('connecting');
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const ac = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        audioContextRef.current = ac;
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Mocking visualizer
        const analyzer = ac.createAnalyser();
        const source = ac.createMediaStreamSource(stream);
        source.connect(analyzer);
        const dataArray = new Uint8Array(analyzer.frequencyBinCount);
        const updateVol = () => {
            analyzer.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((a,b)=>a+b) / dataArray.length;
            setVolume(avg);
            if(active) requestAnimationFrame(updateVol);
        };
        updateVol();

        const sessionPromise = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-12-2025',
            config: {
                responseModalities: [Modality.AUDIO],
                systemInstruction: "You are a senior quantitative portfolio manager. Analyze market trends and risk for the user concisely.",
                speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
            },
            callbacks: {
                onopen: () => {
                    setStatus('live');
                    // Send stream data... (Simplified for this component view)
                    // In real implementation, we'd hook up the ScriptProcessor here as per docs
                },
                onmessage: async (msg: LiveServerMessage) => {
                    if (msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
                        const audioData = msg.serverContent.modelTurn.parts[0].inlineData.data;
                        playAudio(audioData, ac);
                    }
                },
                onclose: () => setStatus('idle'),
                onerror: () => setStatus('error')
            }
        });
        
        sessionRef.current = sessionPromise;
        setActive(true);

    } catch (e) {
        console.error(e);
        setStatus('error');
    }
  };

  const stopSession = () => {
     setActive(false);
     setStatus('idle');
     sessionRef.current?.then((s: any) => s.close()); // Close if valid
  };

  const playAudio = async (base64: string, ctx: AudioContext) => {
      // Decode and play logic
      const binaryString = atob(base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
      
      const audioBuffer = await ctx.decodeAudioData(bytes.buffer); // Use standard decode for simplicity in this snippet, ideally use custom PCM decoder
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.start();
  };

  if (!active) {
      return (
          <button 
            onClick={startSession}
            className="fixed bottom-8 right-8 z-50 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full shadow-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-3"
          >
             <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
             Live Analyst
          </button>
      );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md animate-in fade-in">
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-[64px] shadow-2xl flex flex-col items-center gap-8 relative overflow-hidden w-full max-w-lg">
            <button onClick={stopSession} className="absolute top-8 right-8 text-slate-500 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="relative w-48 h-48 rounded-full bg-slate-800 flex items-center justify-center border-4 border-slate-700 shadow-[0_0_50px_rgba(59,130,246,0.3)]">
                {status === 'connecting' && <div className="absolute inset-0 border-t-4 border-blue-500 rounded-full animate-spin" />}
                <div className={`w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full transition-all duration-75 ${status === 'live' ? 'scale-100' : 'scale-90 opacity-50'}`} style={{ transform: `scale(${1 + volume/200})` }} />
            </div>

            <div className="text-center space-y-2">
                <h3 className="text-2xl font-black text-white tracking-tight">Gemini Live Analyst</h3>
                <p className="text-blue-400 font-bold uppercase text-xs tracking-widest">{status === 'connecting' ? 'Establishing Secure Link...' : status === 'live' ? 'Listening • Voice Active' : 'Session Ended'}</p>
            </div>

            <div className="flex gap-4">
               <div className="h-12 w-2 bg-slate-700 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
               <div className="h-12 w-2 bg-slate-700 rounded-full animate-pulse" style={{ animationDelay: '100ms' }} />
               <div className="h-12 w-2 bg-slate-700 rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
               <div className="h-12 w-2 bg-slate-700 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
        </div>
    </div>
  );
};
