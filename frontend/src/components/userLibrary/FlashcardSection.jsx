import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, Plus, X, Search, Layers} from 'lucide-react';

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
    <div className="flex flex-col h-full">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-[200px] relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar palabras..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <button
          onClick={handleShuffle}
          className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center text-sm"
        >
          <RotateCcw className="w-4 h-4 mr-1" />
          Mezclar
        </button>
        
        <button
          onClick={() => setShowAddWord(true)}
          className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center text-sm"
        >
          <Plus className="w-4 h-4 mr-1" />
          Agregar
        </button>
      </div>

      <div className="text-sm text-gray-500 mb-3">
        {filteredWords.length > 0 ? (
          `${currentIndex + 1} / ${filteredWords.length} palabras`
        ) : (
          'No hay palabras guardadas'
        )}
      </div>

      {filteredWords.length > 0 ? (
        <div className="flex-1 flex flex-col">
          <div 
            className="relative w-full aspect-[4/3] perspective-1000 cursor-pointer"
            onClick={handleFlip}
          >
            <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
              isFlipped ? 'rotate-y-180' : ''
            }`}>
              <div className="absolute w-full h-full backface-hidden bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center border-2 border-blue-100">
                <div className="text-center">
                  <p className="text-4xl font-bold text-gray-800 mb-4">
                    {currentWord.word}
                  </p>
                  {currentWord.context_sentence && (
                    <p className="text-gray-600 italic text-sm mt-4 px-4">
                      "{currentWord.context_sentence}"
                    </p>
                  )}
                </div>
                <div className="absolute bottom-4 right-4 flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      speakWord(currentWord.word);
                    }}
                    className="p-2 bg-blue-100 hover:bg-blue-200 rounded-full transition-colors"
                    title="Escuchar pronunciación"
                  >
                    <Volume2 className="w-4 h-4 text-blue-600" />
                  </button>
                </div>
              </div>
              <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-lg p-8 flex flex-col items-center justify-center border-2 border-green-100">
                <div className="text-center">
                  <p className="text-lg text-gray-600 mb-2">Significado</p>
                  <p className="text-2xl text-gray-800">
                    {currentWord.word}
                  </p>
                  {currentWord.context_sentence && (
                    <p className="text-gray-600 text-sm mt-4">
                      Contexto: {currentWord.context_sentence}
                    </p>
                  )}
                </div>
                <p className="absolute bottom-4 text-xs text-gray-400">
                  Haz clic para voltear
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDeleteWord(currentWord.id_words)}
                className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm"
              >
                <X className="w-4 h-4 inline mr-1" />
                Eliminar
              </button>
            </div>

            <button
              onClick={handleNext}
              disabled={currentIndex === filteredWords.length - 1}
              className="p-2 rounded-lg border disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <Layers className="w-16 h-16 mb-4" />
          <p className="text-lg">No hay palabras guardadas</p>
          <p className="text-sm">Guarda palabras mientras practicas para verlas aquí</p>
        </div>
      )}

      {showAddWord && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Agregar nueva palabra</h3>
              <button
                onClick={() => setShowAddWord(false)}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleAddWord}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Palabra *
                  </label>
                  <input
                    type="text"
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Contexto (opcional)
                  </label>
                  <input
                    type="text"
                    value={newWord.context_sentence}
                    onChange={(e) => setNewWord({ ...newWord, context_sentence: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: La palabra apareció en este contexto..."
                  />
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddWord(false)}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    Guardar palabra
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardSection;
