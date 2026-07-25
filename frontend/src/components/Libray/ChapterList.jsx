import React, { useState } from 'react';
import { ChevronDown, ChevronRight, BookOpen, Clock, Play } from 'lucide-react';
import { Link } from 'react-router-dom';

const ChapterList = ({ chapters, bookId, language = 'es' }) => {
  const [expandedChapters, setExpandedChapters] = useState({});

  const toggleChapter = (chapterId) => {
    setExpandedChapters(prev => ({
      ...prev,
      [chapterId]: !prev[chapterId]
    }));
  };

  const getTitle = (chapter) => {
    return chapter[`title_${language}`] || chapter.title_es || chapter.title_en || 'Sin título';
  };

  const getContent = (chapter) => {
    const content = chapter[`content_${language}`] || chapter.content_es || chapter.content_en;
    return content ? content.substring(0, 200) + '...' : 'Contenido no disponible';
  };

  if (!chapters || chapters.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Este libro aún no tiene capítulos</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xl font-semibold mb-4">Capítulos</h3>
      <div className="space-y-2">
        {chapters.map((chapter) => (
          <div
            key={chapter.id_chapter}
            className="bg-white rounded-lg shadow-md overflow-hidden"
          >
            <button
              onClick={() => toggleChapter(chapter.id_chapter)}
              className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center flex-1">
                <span className="font-medium text-gray-900 mr-3">
                  Capítulo {chapter.chapter_number || '?'}
                </span>
                <span className="text-gray-700">{getTitle(chapter)}</span>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  to={`/practice/${bookId}/${chapter.id_chapter}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center text-blue-600 hover:text-blue-800"
                >
                  <Play className="w-4 h-4 mr-1" />
                  <span className="text-sm">Practicar</span>
                </Link>
                {expandedChapters[chapter.id_chapter] ? (
                  <ChevronDown className="w-5 h-5 text-gray-400" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </div>
            </button>

            {expandedChapters[chapter.id_chapter] && (
              <div className="px-4 pb-4 border-t">
                <div className="pt-3">
                  <p className="text-gray-600 text-sm whitespace-pre-wrap">
                    {getContent(chapter)}
                  </p>
                  <div className="mt-3 flex items-center text-sm text-gray-500">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{chapter.word_count || 0} palabras</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterList;
