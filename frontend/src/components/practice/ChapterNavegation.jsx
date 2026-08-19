import React from 'react';
import { ChevronLeft, ChevronRight, List } from 'lucide-react';

const ChapterNavigation = ({ 
    currentChapter, 
    chapters, 
    onChapterSelect,
    onNext,
    onPrevious
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const currentIndex = chapters.findIndex(c => c.id_chapter === currentChapter?.id_chapter);

    const getTitle = (chapter) => {
        return chapter.title_es || chapter.title_en || chapter.title_de || 'Sin título';
    };

    return (
        <div className="chapter-navigation">
            <button 
                className="nav-arrow"
                onClick={onPrevious}
                disabled={currentIndex === 0}
                title="Capítulo anterior"
            >
                <ChevronLeft size={20} />
            </button>

            <div className="chapter-selector">
                <button 
                    className="chapter-selector-trigger"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <List size={16} />
                    <span className="chapter-name">
                        {currentChapter ? getTitle(currentChapter) : 'Seleccionar capítulo'}
                    </span>
                    <span className="chapter-number">
                        {currentIndex + 1}/{chapters.length}
                    </span>
                </button>

                {isOpen && (
                    <div className="chapter-dropdown">
                        {chapters.map((chapter, index) => (
                            <button
                                key={chapter.id_chapter}
                                className={`chapter-option ${chapter.id_chapter === currentChapter?.id_chapter ? 'active' : ''}`}
                                onClick={() => {
                                    onChapterSelect(chapter);
                                    setIsOpen(false);
                                }}
                            >
                                <span className="chapter-option-number">{index + 1}</span>
                                <span className="chapter-option-title">{getTitle(chapter)}</span>
                                {chapter.completed && (
                                    <span className="chapter-option-status">✅</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <button 
                className="nav-arrow"
                onClick={onNext}
                disabled={currentIndex === chapters.length - 1}
                title="Siguiente capítulo"
            >
                <ChevronRight size={20} />
            </button>
        </div>
    );
};

export default ChapterNavigation;
