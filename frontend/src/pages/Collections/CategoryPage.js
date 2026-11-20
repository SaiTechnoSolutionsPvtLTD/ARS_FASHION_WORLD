import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCategories, API_BASE_URL } from '../../context/CategoryContext';
import SubCategoryTemplate from './SubCategoryTemplate';
import './SubCollection.css';

const CategoryPage = () => {
  const { slug }                          = useParams();
  const { getCategoryBySlug, loading: catLoading } = useCategories();
  const navigate                          = useNavigate();

  const [products, setProducts]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [category, setCategory]   = useState(null);

  useEffect(() => {
    // Wait until categories are loaded before doing anything
    if (catLoading) return;

    const found = getCategoryBySlug(slug);

    if (!found) {

      navigate('/shop', { replace: true });
      return;
    }

    setCategory(found);

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/api/products/by-category/${found.id}`);
        setProducts(res.data);
        setError(null);
      } catch (err) {
        console.error('CategoryPage: error fetching products', err);
        setError('Failed to load products for this category.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [slug, catLoading, getCategoryBySlug, navigate]);

  if (catLoading || loading) {
    return (
      <div className="loading-state" style={{ textAlign: 'center', padding: '80px 20px' }}>
        <div className="loading-spinner" />
        <span>Loading Collection...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 20px', color: '#d32f2f' }}>
        <h3>{error}</h3>
        <button onClick={() => navigate('/shop')} style={{ marginTop: 16, padding: '10px 24px', cursor: 'pointer' }}>
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <SubCategoryTemplate
      title={category ? `${category.name} Collection` : 'Collection'}
      products={products}
    />
  );
};

export default CategoryPage;
