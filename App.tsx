import React, { useState, useEffect } from 'react';
import { Note, AppSettings, AIPromptType } from './types';
import { generateNoteContent } from './services/geminiService';
import { SettingsModal } from './components/SettingsModal';
import { VoiceRecorder } from './components/VoiceRecorder';
import { NoteCard } from './components/NoteCard';
import { 
  Settings, 
  Plus, 
  ArrowLeft, 
  Trash2, 
  Sparkles, 
  Copy, 
  CheckCheck 
} from 'lucide-react';

export default function App() {
  // --- State ---
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('notes');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [settings, setSettings] = useState<AppSettings>(() => {
    const saved = localStorage.getItem('settings');
    return saved ? JSON.parse(saved) : { siliconFlowToken: '' };
  });

  const [view, setView] = useState<'list' | 'record' | 'detail'>('list');
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [copied, setCopied] = useState(false);

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  useEffect(() => {
    localStorage.setItem('settings', JSON.stringify(settings));
  }, [settings]);

  // --- Handlers ---
  const handleSaveSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const handleTranscriptionComplete = (text: string) => {
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: text,
      createdAt: Date.now(),
    };
    setNotes(prev => [newNote, ...prev]);
    setActiveNote(newNote);
    setView('detail');
  };

  const handleDeleteNote = (id: string) => {
    if (confirm('确定要删除这条笔记吗？')) {
      setNotes(prev => prev.filter(n => n.id !== id));
      setActiveNote(null);
      setView('list');
    }
  };

  const handleRunAI = async (promptType: AIPromptType) => {
    if (!activeNote) return;
    
    if (!settings.siliconFlowToken) {
      alert("请先在设置中配置 SiliconFlow API Token。");
      setIsSettingsOpen(true);
      return;
    }
    
    setIsGeneratingAI(true);
    try {
      const response = await generateNoteContent(activeNote.content, promptType, settings.siliconFlowToken);
      const updatedNote = { 
        ...activeNote, 
        aiResponse: response,
        aiPromptType: promptType 
      };
      
      setNotes(prev => prev.map(n => n.id === updatedNote.id ? updatedNote : n));
      setActiveNote(updatedNote);
    } catch (error: any) {
      // 显示更详细的错误信息
      const errorMessage = error?.message || "生成 AI 内容失败，请检查 API Token 配置和网络连接。";
      alert(errorMessage);
      console.error("AI Action Error:", error);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- Renderers ---

  // 1. Voice Recorder View
  if (view === 'record') {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col">
         <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0">
             <h1 className="text-lg font-bold text-gray-800">新建录音</h1>
             <button onClick={() => setView('list')} className="p-2 bg-gray-100 rounded-full">
                 <Settings size={0} className="w-0 h-0" /> {/* Hidden hack for spacing if needed, or just X */}
                 <span className="text-sm font-semibold text-gray-600">取消</span>
             </button>
         </div>
        <VoiceRecorder
          apiToken={settings.siliconFlowToken}
          onTranscriptionComplete={handleTranscriptionComplete}
          onCancel={() => setView('list')}
        />
      </div>
    );
  }

  // 2. Note Detail View
  if (view === 'detail' && activeNote) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
          <button 
            onClick={() => setView('list')}
            className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-sm font-medium text-gray-500">
            {new Date(activeNote.createdAt).toLocaleString()}
          </span>
          <button 
            onClick={() => handleDeleteNote(activeNote.id)}
            className="p-2 -mr-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full space-y-6">
          {/* Original Content */}
          <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">原始转录</h3>
            <p className="text-lg leading-relaxed text-gray-800 whitespace-pre-wrap">{activeNote.content}</p>
          </section>

          {/* AI Actions */}
          <section>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 ml-1">AI 操作</h3>
            <div className="flex flex-wrap gap-2">
              {Object.values(AIPromptType).map((type) => (
                <button
                  key={type}
                  disabled={isGeneratingAI}
                  onClick={() => handleRunAI(type)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2
                    ${activeNote.aiPromptType === type 
                      ? 'bg-purple-100 text-purple-700 ring-2 ring-purple-200' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300'}
                  `}
                >
                  <Sparkles size={14} className={activeNote.aiPromptType === type ? 'fill-purple-300' : ''} />
                  {type}
                </button>
              ))}
            </div>
          </section>

          {/* AI Result */}
          {isGeneratingAI ? (
            <div className="bg-gradient-to-br from-purple-50 to-white rounded-2xl p-6 border border-purple-100 animate-pulse">
               <div className="flex items-center gap-2 text-purple-600 mb-2">
                 <Sparkles size={18} className="animate-spin" />
                 <span className="font-semibold">AI 正在思考...</span>
               </div>
               <div className="h-4 bg-purple-100 rounded w-3/4 mb-2"></div>
               <div className="h-4 bg-purple-100 rounded w-1/2"></div>
            </div>
          ) : activeNote.aiResponse ? (
            <section className="bg-gradient-to-br from-white to-purple-50 rounded-2xl p-6 shadow-sm border border-purple-100 relative group">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-bold text-purple-800 flex items-center gap-2">
                   <Sparkles size={16} className="fill-purple-600" />
                   AI 输出: {activeNote.aiPromptType}
                 </h3>
                 <button 
                  onClick={() => copyToClipboard(activeNote.aiResponse || "")}
                  className="p-1.5 text-purple-400 hover:text-purple-700 hover:bg-purple-100 rounded-md transition-colors"
                  title="复制"
                 >
                   {copied ? <CheckCheck size={16} /> : <Copy size={16} />}
                 </button>
              </div>
              <div className="prose prose-sm prose-purple max-w-none text-gray-700">
                <p className="whitespace-pre-wrap leading-relaxed">{activeNote.aiResponse}</p>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    );
  }

  // 3. Main List View
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative">
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSave={handleSaveSettings}
      />

      {/* Header */}
      <header className="bg-white sticky top-0 z-20 px-6 py-4 shadow-sm border-b border-gray-100 flex justify-between items-center">
        <div>
           <h1 className="text-xl font-bold text-gray-800 tracking-tight">VoiceNotes<span className="text-blue-600">.ai</span></h1>
        </div>
        <button 
          onClick={() => setIsSettingsOpen(true)}
          className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors relative"
        >
          <Settings size={22} />
          {!settings.siliconFlowToken && (
            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
          )}
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 pb-24 max-w-2xl mx-auto w-full">
        {notes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center px-6">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Sparkles size={40} className="text-blue-300" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">还没有笔记</h2>
            <p className="text-gray-500 mb-8 max-w-xs">
              点击下方的麦克风按钮录制您的第一条想法、创意或会议笔记。
            </p>
            {!settings.siliconFlowToken && (
               <button 
                 onClick={() => setIsSettingsOpen(true)}
                 className="text-sm text-blue-600 font-semibold underline underline-offset-4"
               >
                 请先配置 API Token
               </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
             {notes.map(note => (
               <NoteCard key={note.id} note={note} onClick={(n) => {setActiveNote(n); setView('detail');}} />
             ))}
          </div>
        )}
      </main>

      {/* FAB */}
      <div className="fixed bottom-8 left-0 right-0 flex justify-center z-20 pointer-events-none">
        <button
          onClick={() => {
            if(!settings.siliconFlowToken) {
              setIsSettingsOpen(true);
              return;
            }
            setView('record');
          }}
          className="pointer-events-auto bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg shadow-blue-600/30 transition-transform active:scale-95 flex items-center gap-2 px-6"
        >
          <Plus size={24} />
          <span className="font-semibold text-lg">新建笔记</span>
        </button>
      </div>
    </div>
  );
}
