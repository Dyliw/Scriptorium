import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw,
  Volume2,
  Plus,
  X,
  Search,
  Layers
} from 'lucide-react';
import './FlashcardSection.css';

const FlashcardSection = ({ words, onDeleteWord, onSaveWord }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showAddWord, setShowAddWord] = useState(false);
  const [newWord, setNewWord] = useState({ word: '', context_sentence: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredWords, setFilteredWords] = useState(words);

  useEffect(() => {
    if (searchTerm) {
      setFilteredWords(
        words.filter(w => 
          w.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
          w.context_sentence?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredWords(words);
    }
  }, [words, searchTerm]);

  const handleNext = () => {
    if (currentIndex < filteredWords.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleShuffle = () => {
    const shuffled = [...filteredWords];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setFilteredWords(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
  };

  const handleAddWord = async (e) => {
    e.preventDefault();
    if (newWord.word.trim()) {
      try {
        await onSaveWord(newWord);
        setNewWord({ word: '', context_sentence: '' });
        setShowAddWord(false);
      } catch (error) {
        console.error('Error saving word:', error);
      }
    }
  };

  const handleDeleteWord = async (wordId) => {
    if (window.confirm('¿Eliminar esta palabra?')) {
      try {
        await onDeleteWord(wordId);
        if (currentIndex >= filteredWords.length - 1) {
          setCurrentIndex(Math.max(0, filteredWords.length - 2));
        }
      } catch (error) {
        console.error('Error deleting word:', error);
      }
    }
  };

  const speakWord = (word) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.lang = 'es-ES';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const currentWord = filteredWords[currentIndex];

  return (
    <div className="flashcard-container">
      {/* Barra de búsqueda y acciones */}
      <div className="flashcard-toolbar">
        <div className="search-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Buscar palabras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        
        <button onClick={handleShuffle} className="toolbar-button shuffle">
          <RotateCcw className="button-icon" />
          Mezclar
        </button>
        
        <button onClick={() => setShowAddWord(true)} className="toolbar-button add">
          <Plus className="button-icon" />
          Agregar
        </button>
      </div>

      {/* Contador */}
      <div className="flashcard-counter">
        {filteredWords.length > 0 ? (
          `${currentIndex + 1} / ${filteredWords.length} palabras`
        ) : (
          'No hay palabras guardadas'
        )}
      </div>

      {/* Flashcard */}
      {filteredWords.length > 0 ? (
        <div className="flashcard-main">
          <div className="flashcard-wrapper" onClick={handleFlip}>
            <div className={`flashcard-inner ${isFlipped ? 'flipped' : ''}`}>
              {/* Frente */}
              <div className="flashcard-front">
                <div className="flashcard-content">
                  <p className="flashcard-word">
                    {currentWord.word}
                  </p>
                  {currentWord.context_sentence && (
                    <p className="flashcard-context">
                      "{currentWord.context_sentence}"
                    </p>
                  )}
                </div>
                <div className="flashcard-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentWord.word);
                    }}
                    className="speak-button"
                    title="Escuchar pronunciación"
                  >
                    <Volume2 className="speak-icon" />
                  </button>
                </div>
              </div>

              {/* Reverso */}
              <div className="flashcard-back">
                <div className="flashcard-content">
                  <p className="flashcard-meaning-label">Significado</p>
                  <p className="flashcard-meaning">
                    {currentWord.word}
                  </p>
                  {currentWord.context_sentence && (
                    <p className="flashcard-context-back">
                      Contexto: {currentWord.context_sentence}
                    </p>
                  )}
                </div>
                <p className="flashcard-flip-hint">
                  Haz clic para voltear
                </p>
              </div>
            </div>
          </div>

          {/* Controles de navegación */}
          <div className="flashcard-navigation">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="nav-button"
            >
              <ChevronLeft className="nav-icon" />
            </button>

            <button
              onClick={() => handleDeleteWord(currentWord.id_words)}
              className="delete-button"
            >
              <X className="delete-icon" />
              Eliminar
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === filteredWords.length - 1}
              className="nav-button"
            >
              <ChevronRight className="nav-icon" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flashcard-empty">
          <Layers className="empty-icon" />
          <p className="empty-title">No hay palabras guardadas</p>
          <p className="empty-subtitle">Guarda palabras mientras practicas para verlas aquí</p>
        </div>
      )}

      {/* Modal para agregar palabra */}
      {showAddWord && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">Agregar nueva palabra</h3>
              <button
                onClick={() => setShowAddWord(false)}
                className="modal-close"
              >
                <X className="modal-close-icon" />
              </button>
            </div>
            
            <form onSubmit={handleAddWord}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">
                    Palabra *
                  </label>
                  <input
                    type="text"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    className="form-input"
                    required
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">
                    Contexto (opcional)
                  </label>
                  <input
                    type="text"
                    value={newWord.context_sentence}
                    onChange={(e) => setNewWord({ ...newWord, context_sentence: e.target.value })}
                    className="form-input"
                    placeholder="Ej: La palabra apareció en este contexto..."
                  />
                </div>
              </div>
              
              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setShowAddWord(false)}
                  className="modal-cancel"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="modal-submit"
                >
                  Guardar palabra
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardSection;
