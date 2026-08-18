import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { booksAPI } from '../../api/books';
import TypingArea from '../../components/Practice/Typingarea';
import './ReadingMode.css';

const ReadingMode = () => {
    const { bookId, chapterId } = useParams();
    const navigate = useNavigate();
    
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [bookTitle, setBookTitle] = useState('');
    const [chapterTitle, setChapterTitle] = useState('');

    useEffect(() => {
        const loadContent = async () => {
            if (!bookId) {
                setError('No se especificó un libro');
                setLoading(false);
                return;
            }

            setLoading(true);
            
            try {
                const bookData = await booksAPI.getById(parseInt(bookId));
                setBookTitle(bookData.title_es || bookData.title_en || 'Sin título');

                const chaptersData = await booksAPI.listChapters(parseInt(bookId));
                
                if (!chaptersData || chaptersData.length === 0) {
                    setError('Este libro no tiene capítulos');
                    setLoading(false);
                    return;
                }

                let selectedChapter = null;
                
                if (chapterId) {
                    selectedChapter = chaptersData.find(c => c.id_chapter === parseInt(chapterId));
                }
                
                if (!selectedChapter) {
                    selectedChapter = chaptersData[0];
                }

                if (selectedChapter) {
                    setChapterTitle(selectedChapter.title_es || selectedChapter.title_en || 'Capítulo');
                  
                    const content = selectedChapter.content_es || selectedChapter.content_en || '';
                    setText(content);
                } else {
                    setError('No se encontró el capítulo');
                }

            } catch (err) {
                console.error('Error:', err);
                setError(err.message || 'Error al cargar el libro');
            } finally {
                setLoading(false);
            }
        };

        loadContent();
    }, [bookId, chapterId]);

    if (loading) {
        return <div className="reading-loading">📖 Cargando libro...</div>;
    }

    if (error) {
        return (
            <div className="reading-error">
                <h3>❌ {error}</h3>
                <button onClick={() => navigate('/library')}>Volver a la biblioteca</button>
            </div>
        );
    }

    if (!text) {
        return (
            <div className="reading-empty">
                <h3>📖 No hay texto para mostrar</h3>
                <button onClick={() => navigate('/library')}>Volver a la biblioteca</button>
            </div>
        );
    }

    return (
        <div className="reading-mode-container">
            <div className="reading-header">
                <button onClick={() => navigate('/library')} className="back-btn">
                    ← Biblioteca
                </button>
                <h1>{bookTitle}</h1>
                <span className="chapter-name">{chapterTitle}</span>
            </div>

            <div className="reading-content">
                <TypingArea 
                    text={text}
                    onComplete={(data) => {
                        console.log('✅ Capítulo completado!', data);
                    }}
                    onProgress={(data) => {
                        console.log('📊 Progreso:', data.currentIndex / text.length * 100 + '%');
                    }}
                />
            </div>
        </div>
    );
};

export default ReadingMode;
