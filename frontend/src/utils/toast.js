import { toast } from 'react-toastify';

const baseConfig = {
  position: 'bottom-right',
  autoClose: 2500,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showCartAddedToast = (productName) =>
  toast.success(`${productName} added to cart!`, baseConfig);

export const showWishlistAddedToast = (productName) =>
  toast.success(`${productName} added to wishlist!`, baseConfig);

export const showWishlistRemovedToast = (productName) =>
  toast.info(`${productName} removed from wishlist!`, baseConfig);

export const showOutOfStockToast = (message = 'This product is out of stock!') =>
  toast.error(message, baseConfig);
