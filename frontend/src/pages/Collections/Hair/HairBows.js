import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../config';
import SubCategoryTemplate from '../SubCategoryTemplate';

const HairBows = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/products/all`);
                const filtered = res.data.filter(p => 
                    p.category?.name.toLowerCase() === 'hair bow' ||
                    p.category?.name.toLowerCase() === "hair bow"
                );
                setProducts(filtered);
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading">Loading Hair Bows...</div>;
    return <SubCategoryTemplate title="Hair Bows Collection" products={products} />;
};

export default HairBows;