import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown, ChevronRight, BookOpen, Clock, Play } from 'lucide-react';
import './ChapterList.css';

const ChapterList = ({ chapters, bookId, language = 'es' }) => {
  const navigate = useNavigate();
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

  const handlePractice = (chapterId, e) => {
    e.stopPropagation();
    navigate(`/practice/${bookId}/${chapterId}`);
  };

  if (!chapters || chapters.length === 0) {
    return (
      <div className="chapters-empty">
        <BookOpen className="chapters-empty-icon" />
        <p>Este libro aún no tiene capítulos</p>
      </div>
    );
  }

  return (
    <div className="chapters-container">
      <h3 className="chapters-title">Capítulos</h3>
      <div className="chapters-list">
        {chapters.map((chapter) => (
          <div
            key={chapter.id_chapter}
            className="chapter-item"
          >
            <button
              onClick={() => toggleChapter(chapter.id_chapter)}
              className="chapter-header"
            >
              <div className="chapter-header-left">
                <span className="chapter-number">
                  Capítulo {chapter.chapter_number || '?'}
                </span>
                <span className="chapter-title-text">{getTitle(chapter)}</span>
              </div>
              <div className="chapter-header-right">
                <button
                  onClick={(e) => handlePractice(chapter.id_chapter, e)}
                  className="practice-button"
                >
                  <Play className="practice-icon" />
                  Practicar
                </button>
                {expandedChapters[chapter.id_chapter] ? (
                  <ChevronDown className="chapter-toggle-icon" />
                ) : (
                  <ChevronRight className="chapter-toggle-icon" />
                )}
              </div>
            </button>

            {expandedChapters[chapter.id_chapter] && (
              <div className="chapter-content">
                <div className="chapter-content-inner">
                  <p className="chapter-description">
                    {getContent(chapter)}
                  </p>
                  <div className="chapter-meta">
                    <Clock className="chapter-meta-icon" />
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
