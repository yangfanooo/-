import React, { useEffect, useState } from 'react';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { Mic, Square, Loader2, RefreshCw, Check } from 'lucide-react';
import { transcribeAudio } from '../services/siliconFlowService';

interface VoiceRecorderProps {
  apiToken: string;
  onTranscriptionComplete: (text: string) => void;
  onCancel: () => void;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  apiToken,
  onTranscriptionComplete,
  onCancel,
}) => {
  const {
    isRecording,
    recordingTime,
    audioBlob,
    startRecording,
    stopRecording,
    resetRecording,
    hasMicrophonePermission
  } = useAudioRecorder();

  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    startRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Auto-start on mount

  const handleStopAndTranscribe = async () => {
    stopRecording();
    // Wait for the blob to be available in state via effect or logic,
    // but here we rely on the user clicking "Process" after stop, or auto-process
    // We will use a separate effect to trigger transcription once blob is ready if auto desired,
    // but explicit UI is often better.
  };

  // Effect to handle transcription trigger
  useEffect(() => {
    if (audioBlob && !isRecording && !isProcessing) {
      processAudio(audioBlob);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [audioBlob, isRecording]);

  const processAudio = async (blob: Blob) => {
    if (!apiToken) {
      setError("请先在设置中配置 SiliconFlow API Token。");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const text = await transcribeAudio(blob, apiToken);
      onTranscriptionComplete(text);
    } catch (err: any) {
      setError(err.message || "转录失败。");
      setIsProcessing(false);
    }
  };

  if (hasMicrophonePermission === false) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <Mic size={32} />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">麦克风访问被拒绝</h3>
        <p className="text-gray-600 mb-6">请允许麦克风访问以录制笔记。</p>
        <button
          onClick={onCancel}
          className="px-6 py-2 bg-gray-200 text-gray-800 rounded-full font-medium"
        >
          关闭
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 h-full min-h-[400px]">
      {/* Status Visualization */}
      <div className="relative mb-8">
        <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
          isRecording ? 'bg-red-50' : 'bg-blue-50'
        }`}>
          <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
            isRecording ? 'bg-red-100 animate-pulse' : 'bg-blue-100'
          }`}>
             {isProcessing ? (
               <Loader2 size={40} className="text-blue-600 animate-spin" />
             ) : isRecording ? (
               <div className="flex gap-1">
                 {[1,2,3].map(i => (
                   <div key={i} className="w-2 bg-red-500 rounded-full animate-[bounce_1s_infinite]" style={{animationDelay: `${i * 0.1}s`, height: '24px'}}></div>
                 ))}
               </div>
             ) : (
               <Mic size={40} className="text-blue-600" />
             )}
          </div>
        </div>
      </div>

      {/* Timer / Status Text */}
      <div className="mb-8 text-center">
        {isProcessing ? (
          <h3 className="text-xl font-semibold text-gray-800 animate-pulse">正在转录...</h3>
        ) : (
          <h3 className="text-4xl font-mono font-bold text-gray-800 tracking-wider">
            {formatTime(recordingTime)}
          </h3>
        )}
        <p className="text-sm text-gray-500 mt-2">
          {isRecording ? "正在监听..." : isProcessing ? "这可能需要一些时间" : "准备录制"}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-6">
        {!isProcessing && (
          <>
             <button
              onClick={onCancel}
              className="p-4 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              title="取消"
            >
              <XIcon />
            </button>

            {isRecording ? (
              <button
                onClick={stopRecording}
                className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 hover:scale-105 transition-all shadow-lg"
              >
                <Square size={24} fill="currentColor" />
              </button>
            ) : (
               // Retry state (if user stopped but failed) or simple initial
               <button
                  onClick={() => { resetRecording(); startRecording(); }}
                  className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 hover:scale-105 transition-all shadow-lg"
                >
                  <RefreshCw size={24} />
               </button>
            )}
            
            {/* If not recording and we have a blob, the effect handles it, so we don't need a manual send button usually. 
                However, if processing failed, we might want to show error and retry. */}
          </>
        )}
      </div>

      {error && (
        <div className="mt-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm max-w-xs text-center">
          {error}
          <button 
             onClick={() => {
                if (audioBlob) processAudio(audioBlob);
             }}
             className="block mx-auto mt-2 text-red-700 font-bold hover:underline"
          >
            重试转录
          </button>
        </div>
      )}
    </div>
  );
};

const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
)
