import { useState, useEffect } from 'react';
import { wordsAPI } from '../api/words';

export const useWords = () => {
  const [words, setWords] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchWords = async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await wordsAPI.getMyWords(params);
      setWords(data.items || []);
      setTotal(data.total || 0);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const saveWord = async (wordData) => {
    setLoading(true);
    try {
      const newWord = await wordsAPI.save(wordData);
      setWords(prev => [newWord, ...prev]);
      setTotal(prev => prev + 1);
      return newWord;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteWord = async (wordId) => {
    setLoading(true);
    try {
      await wordsAPI.delete(wordId);
      setWords(prev => prev.filter(w => w.id_word !== wordId));
      setTotal(prev => prev - 1);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRandomWord = async () => {
    try {
      return await wordsAPI.getRandomWord();
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const countWords = async (params = {}) => {
    try {
      const data = await wordsAPI.countMyWords(params);
      return data.count;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    words,
    total,
    loading,
    error,
    fetchWords,
    saveWord,
    deleteWord,
    getRandomWord,
    countWords
  };
};
