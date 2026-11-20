import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../../config';
import SubCategoryTemplate from '../SubCategoryTemplate';

const HairClips = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`${API}/products/all`)
            .then(res => {
                // Backend-il "Hair Clips" ena irukkum
                const filtered = res.data.filter(p => p.category?.name.toLowerCase() === "hair clibs"); 
                setProducts(filtered);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div>Loading...</div>;
    return <SubCategoryTemplate title="Hair Clips" products={products} />;
};
export default HairClips;