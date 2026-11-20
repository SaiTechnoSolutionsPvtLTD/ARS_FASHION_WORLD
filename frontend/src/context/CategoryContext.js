import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API as _API, IMG } from '../config';

export const API_BASE_URL = _API.replace('/api', '');

const CategoryContext = createContext(null);

export const CategoryProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);

  const toSlug = (name) =>
    name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/categories/all`);
      const active = res.data.filter(cat => cat.status !== false);
      setCategories(active);
      setError(null);
    } catch (err) {
      console.error('CategoryContext: failed to fetch categories', err);
      setError('Could not load categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const getCategoryBySlug = (slug) =>
    categories.find(cat => toSlug(cat.name) === slug) || null;

  return (
    <CategoryContext.Provider value={{ categories, loading, error, toSlug, getCategoryBySlug, refetch: fetchCategories }}>
      {children}
    </CategoryContext.Provider>
  );
};

export const useCategories = () => {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error('useCategories must be used inside <CategoryProvider>');
  return ctx;
};