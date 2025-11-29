import React from 'react';
import { Note } from '../types';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';

interface NoteCardProps {
  note: Note;
  onClick: (note: Note) => void;
}

export const NoteCard: React.FC<NoteCardProps> = ({ note, onClick }) => {
  return (
    <div 
      onClick={() => onClick(note)}
      className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <Calendar size={12} />
          <span>{new Date(note.createdAt).toLocaleString()}</span>
        </div>
        {note.aiResponse && (
          <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
            <Sparkles size={10} />
            <span>已处理</span>
          </div>
        )}
      </div>
      
      <p className="text-gray-800 font-medium line-clamp-2 leading-relaxed mb-2">
        {note.content}
      </p>

      {note.aiResponse && (
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-500 line-clamp-2">
            <span className="font-semibold text-purple-600 mr-1">{note.aiPromptType}:</span>
            {note.aiResponse}
          </p>
        </div>
      )}

      <div className="flex justify-end mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-blue-500 text-xs font-semibold flex items-center gap-1">
          查看详情 <ChevronRight size={12} />
        </span>
      </div>
    </div>
  );
};
