import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../config';
import SubCategoryTemplate from '../SubCategoryTemplate';

const KidsBows = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/products/all`);
                const filtered = res.data.filter(p => 
                    p.category?.name.toLowerCase() === "kids bow" ||
                    p.category?.name.toLowerCase() === "kids hair bows"
                );
                setProducts(filtered);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching Kids Bows:", err);
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading-state">Loading Kids Hair Bows...</div>;

    return (
        <SubCategoryTemplate 
            title="Kids Hair Bows" 
            products={products} 
        />
    );
};

export default KidsBows;