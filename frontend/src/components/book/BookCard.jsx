const BookCard = ({ book, onSelect }) => {
  return (
    <div className="book-card" onClick={() => onSelect(book.id_book)}>
      <img src={book.cover_image} alt={book.title_es} />
      <div className="book-info">
        <h3>{book.title_es}</h3>
        <p>{book.author}</p>
        <div className="book-meta">
          <span>{book.difficulty}</span>
          <span>{book.chapter_count} capítulos</span>
        </div>
        {book.user_progress && (
          <div className="progress-bar">
            <div className="progress" style={{ width: `${book.user_progress}%` }} />
            <span>{book.user_progress}% completado</span>
          </div>
        )}
      </div>
    </div>
  );
};
