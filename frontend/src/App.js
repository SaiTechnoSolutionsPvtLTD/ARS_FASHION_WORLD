import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

import Navbar   from './components/Navbar/Navbar';
import Footer   from './components/Footer/Footer';
import Home     from './pages/Home/Home';
import Shop     from './pages/Shop/Shop';
import Cart     from './pages/Cart/Cart';
import Wishlist from './pages/Wishlist/Wishlist';
import Checkout from './pages/Checkout/Checkout';
import Login    from './pages/Auth/Login';
import Register       from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Contact  from './pages/Contact/Contact';
import ProductDetail         from './pages/ProductDetail/ProductDetail';
import TrendingProductDetail from './pages/TrendingProductDetail/TrendingProductDetail';
import ShopDetail            from './pages/ShopDetail/ShopDetail';
import MyAccount      from './pages/MyAccount/MyAccount';
import MyOrders       from './pages/MyOrder/MyOrder';
import OrderConfirmation from './pages/OrderConfirmation/OrderConfirmation';
import CategoryPage   from './pages/Collections/CategoryPage';


import { CartProvider, useCart } from './context/CartContext';
import { AuthProvider }          from './context/AuthContext';
import { CategoryProvider }      from './context/CategoryContext';

import PrivateRoute from './components/PrivateRoute';
import PublicRoute  from './components/PublicRoute';

import { Toaster } from 'react-hot-toast';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// ✅ Injects navigate into CartContext (must be inside <Router>)
// so addToCart can redirect guests to /login automatically
const NavigateInjector = () => {
  const navigate = useNavigate();
  const { setNavigate } = useCart();
  useEffect(() => { setNavigate(navigate); }, [navigate, setNavigate]);
  return null;
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <CategoryProvider>
          <Toaster position="top-right" reverseOrder={false} />
          <ToastContainer position="bottom-right" autoClose={2500} />
          <Router>
            <NavigateInjector />
            <Navbar />
            <Routes>
              {/* ── Public Pages ── */}
              <Route path="/"        element={<Home />} />
              <Route path="/shop"    element={<Shop />} />
              <Route path="/contact" element={<Contact />} />

              <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
              <Route path="/register"        element={<PublicRoute><Register /></PublicRoute>} />
              <Route path="/forgot-password"  element={<PublicRoute><ForgotPassword /></PublicRoute>} />

              {/* Product Details - Public */}
              <Route path="/product/:id"          element={<ProductDetail />} />
              <Route path="/trending-product/:id" element={<TrendingProductDetail />} />
              <Route path="/shop/:slug"           element={<ShopDetail />} />
              <Route path="/collections/:slug"    element={<CategoryPage />} />

              {/* PrivateRoute: requires login */}
              <Route path="/cart"     element={<PrivateRoute><Cart /></PrivateRoute>} />
              <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
              <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
              <Route path="/my-account"         element={<PrivateRoute><MyAccount /></PrivateRoute>} />
              <Route path="/my-orders"          element={<PrivateRoute><MyOrders /></PrivateRoute>} />
              <Route path="/order-confirmation" element={<PrivateRoute><OrderConfirmation /></PrivateRoute>} />
             
            </Routes>
            <Footer />
          </Router>
        </CategoryProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;