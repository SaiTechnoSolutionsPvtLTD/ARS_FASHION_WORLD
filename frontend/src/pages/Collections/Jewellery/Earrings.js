import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../config';
import SubCategoryTemplate from '../SubCategoryTemplate';
import '../SubCollection.css'; 

const Earrings = () => {
    const [products, setproducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Backend API Call
                const response = await axios.get(`${API}/products/all`);
                console.log("Fetched Products: ", response.data); // Debugging log
                
                
                const filteredProducts = response.data.filter(product => 
                    product.category && product.category.name === "earings"
                );

                setproducts(filteredProducts);
                console.log("earrings:", filteredProducts);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError("Failed to load Earrings collection.");
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="loading-state">Loading Earrings...</div>;
    if (error) return <div className="error-state">{error}</div>;

    return (
        <SubCategoryTemplate 
            title="Earrings Collection" 
            products={products} 
        />
    );
};

export default  Earrings;