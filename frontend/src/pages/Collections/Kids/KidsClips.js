import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../config';
import SubCategoryTemplate from '../SubCategoryTemplate';

const KidsHairClips = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await axios.get(`${API}/products/all`);
                const filtered = res.data.filter(p => {
   
    const catName = p.category?.name?.toLowerCase() || "";
    
    return catName === "hair clibs"; 
});
                setProducts(filtered);
                setLoading(false);
            } catch (err) {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) return <div className="loading">Loading Kids Hair Clips...</div>;
    return <SubCategoryTemplate title="Kids Hair Clips Collection" products={products} />;
};

export default KidsHairClips;