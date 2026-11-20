-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 04, 2026 at 08:32 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `databse_ars_fashion`
--

-- --------------------------------------------------------

--
-- Table structure for table `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `admins`
--

INSERT INTO `admins` (`id`, `email`, `password`, `createdAt`, `updatedAt`) VALUES
(1, 'admin@arsfashion.com', '$2b$10$RfVqG1p1os1CPcxoUrRoDeD321cutxBKbh4S5ShY/RlmZ5AJrtNDK', '2026-04-08 18:44:55', '2026-04-08 18:44:55');

-- --------------------------------------------------------

--
-- Table structure for table `banners`
--

CREATE TABLE `banners` (
  `id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `image` varchar(255) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `buttonText` varchar(255) DEFAULT 'Shop Now'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `banners`
--

INSERT INTO `banners` (`id`, `title`, `image`, `link`, `status`, `createdAt`, `updatedAt`, `subtitle`, `buttonText`) VALUES
(4, 'Stylish Hair Bows ', '1777289022369.webp', 'http://localhost:3000/collections/hair-bows', 1, '2026-04-11 06:31:00', '2026-04-27 11:23:42', 'Womens Trending Collections', 'Shop Now'),
(5, 'Elegant Hair Clibs', '1777352982749.jpg', 'http://localhost:3000/collections/hair-clibs', 1, '2026-04-21 06:03:30', '2026-04-28 11:10:43', 'Upto 50% offer', 'Shop Now'),
(8, 'Carry Your Style Everywhere', '1777534387493.jpg', '/shop', 1, '2026-04-30 07:33:07', '2026-04-30 07:42:18', 'upto  20% offer', 'Shop Now'),
(10, '💫 Grace in Every Move', '1777535625772.jpg', '/shop', 1, '2026-04-30 07:53:45', '2026-04-30 07:53:45', 'Beautiful Bangles that Complete Your Traditional & Modern Look', 'Shop Now');

-- --------------------------------------------------------

--
-- Table structure for table `bestsellers`
--

CREATE TABLE `bestsellers` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `addedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bestsellers`
--

INSERT INTO `bestsellers` (`id`, `productId`, `addedAt`) VALUES
(9, 42, '2026-04-27 14:28:35'),
(12, 45, '2026-04-27 14:46:51'),
(14, 48, '2026-04-27 14:59:04'),
(15, 50, '2026-04-27 15:16:06'),
(16, 47, '2026-04-27 15:41:09'),
(17, 55, '2026-04-27 16:45:43'),
(19, 57, '2026-04-27 16:55:54'),
(20, 62, '2026-04-28 04:36:57'),
(23, 71, '2026-05-04 04:52:54');

-- --------------------------------------------------------

--
-- Table structure for table `brands`
--

CREATE TABLE `brands` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `variantId` int(11) DEFAULT NULL,
  `quantity` int(11) NOT NULL DEFAULT 1,
  `salesPrice` decimal(10,2) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `customerId`, `productId`, `variantId`, `quantity`, `salesPrice`, `createdAt`, `updatedAt`) VALUES
(92, 5, 23, NULL, 1, 100.00, '2026-04-21 07:03:06', '2026-04-21 07:03:06'),
(93, 5, 26, NULL, 1, 49.00, '2026-04-21 07:03:09', '2026-04-21 07:03:09'),
(170, 11, 24, NULL, 1, 50.00, '2026-04-27 12:01:01', '2026-04-27 12:01:01'),
(204, 16, 66, NULL, 1, 70.00, '2026-04-30 12:20:24', '2026-04-30 12:20:24'),
(211, 17, 71, 393, 1, 250.00, '2026-05-04 10:06:31', '2026-05-04 10:06:31'),
(221, 16, 72, NULL, 1, 250.00, '2026-05-25 06:15:42', '2026-05-25 06:15:42');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `quantity` int(11) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `image`, `status`, `quantity`, `createdAt`, `updatedAt`) VALUES
(16, 'Earings', '1777294283697.jpg', 1, 0, '2026-04-27 12:51:23', '2026-04-27 12:51:23'),
(17, 'Hair Clibs', '1777295008665.webp', 1, 0, '2026-04-27 13:03:28', '2026-04-27 13:03:28'),
(18, 'Kids Cute Hair Accessories', '1777306183967.webp', 1, 0, '2026-04-27 16:09:43', '2026-04-27 16:09:43'),
(19, 'kids bands ', '1777309226220.webp', 1, 0, '2026-04-27 17:00:26', '2026-04-27 17:00:26'),
(20, 'Women Hair Bows', '1777350432502.jpg', 1, 0, '2026-04-28 04:27:12', '2026-04-28 04:27:12'),
(21, 'Womens Hair Band', '1777351581177.jpg', 1, 0, '2026-04-28 04:46:21', '2026-04-28 05:46:06'),
(25, 'Bangles', '1777869151100.webp', 1, 0, '2026-05-04 04:32:31', '2026-05-04 04:32:31');

-- --------------------------------------------------------

--
-- Table structure for table `contactmessages`
--

CREATE TABLE `contactmessages` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `isDeleted` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `contactmessages`
--

INSERT INTO `contactmessages` (`id`, `name`, `email`, `phone`, `subject`, `message`, `isRead`, `isDeleted`, `createdAt`, `updatedAt`) VALUES
(5, 'chandru', 'chandru57@gmail.com', '+919076543267', 'payment issues', 'Can I place an order with Cash on Delivery (COD) instead of online payment?', 1, 0, '2026-04-21 07:42:36', '2026-04-21 07:42:57'),
(7, 'kalaiyarasi Ravi', 'kalaiyarasiravi2005@gmail.com', '+916369621417', 'order issues', 'Is Cash on Delivery available?', 1, 0, '2026-04-30 12:09:00', '2026-05-04 04:29:13'),
(8, 'akshaya', 'akshaya123@gmail.com', '+9113235346456', 'product stock enquire', 'Hi, the hair bands are out of stock now. Could you please let me know when they will be restocked? I would like to order.', 1, 0, '2026-04-30 12:16:40', '2026-05-04 04:29:11');

-- --------------------------------------------------------

--
-- Table structure for table `coupons`
--

CREATE TABLE `coupons` (
  `id` int(11) NOT NULL,
  `code` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `type` enum('percentage','flat') DEFAULT 'percentage',
  `discountValue` decimal(10,2) NOT NULL,
  `minOrderAmount` decimal(10,2) DEFAULT 0.00,
  `maxDiscount` decimal(10,2) DEFAULT NULL,
  `startDate` datetime NOT NULL,
  `endDate` datetime NOT NULL,
  `usageLimit` int(11) DEFAULT 100,
  `usedCount` int(11) DEFAULT 0,
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `maxOrderAmount` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customeraddresses`
--

CREATE TABLE `customeraddresses` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `houseNo` varchar(255) NOT NULL,
  `street` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `pincode` varchar(255) NOT NULL,
  `country` varchar(255) NOT NULL DEFAULT 'India',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `district` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `customers`
--

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `phone` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `customers`
--

INSERT INTO `customers` (`id`, `name`, `email`, `password`, `phone`, `createdAt`, `updatedAt`) VALUES
(16, 'kalaiyarasi', 'kalaiyarasiravi2005@gmail.com', '$2b$10$F60dwCoJk64UyoeoL0SkHOmuVk3BrPEWiGDZWkZDDKLAI7WV1QnHW', '6369621417', '2026-04-30 05:13:55', '2026-05-04 05:33:47'),
(17, 'akshaya', 'itaakshayas@gmail.com', '$2b$10$KTu4lFRBNekCHE6uZ/7WeOOBknoZM3MHmvDWG9qQXL0EOvOR332Ka', '9344528302', '2026-05-04 05:35:51', '2026-05-04 05:35:51');

-- --------------------------------------------------------

--
-- Table structure for table `deals`
--

CREATE TABLE `deals` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text NOT NULL,
  `image` varchar(255) NOT NULL,
  `expiryDate` datetime NOT NULL,
  `buttonText` varchar(255) DEFAULT 'SHOP NOW',
  `buttonLink` varchar(255) DEFAULT '/shop',
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `newarrivals`
--

CREATE TABLE `newarrivals` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `addedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `newarrivals`
--

INSERT INTO `newarrivals` (`id`, `productId`, `addedAt`) VALUES
(8, 43, '2026-04-27 14:33:24'),
(20, 72, '2026-05-04 04:57:21'),
(21, 47, '2026-05-04 12:47:42'),
(22, 63, '2026-05-04 12:47:49'),
(23, 62, '2026-05-04 12:48:06');

-- --------------------------------------------------------

--
-- Table structure for table `offerbanners`
--

CREATE TABLE `offerbanners` (
  `id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `image` varchar(255) NOT NULL,
  `link` varchar(255) DEFAULT NULL,
  `discountTag` varchar(255) DEFAULT NULL,
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `subtitle` varchar(255) DEFAULT NULL,
  `buttonText` varchar(255) DEFAULT 'Shop Now'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `offerbanners`
--

INSERT INTO `offerbanners` (`id`, `title`, `image`, `link`, `discountTag`, `status`, `createdAt`, `updatedAt`, `subtitle`, `buttonText`) VALUES
(6, 'Mega Sale', '1777289144072.jpg', '/shop', 'SALE30', 1, '2026-04-25 05:11:57', '2026-04-27 11:25:44', 'upto 30% offer', 'Shop Now'),
(7, 'Flat 40% OFF on Accessories', '1777535892341.jpg', 'http://localhost:3000/shop', 'SALE30', 1, '2026-04-27 09:08:47', '2026-04-30 07:58:12', 'upto 40% offer', 'Shop Now'),
(9, '✨ Style Upgrade Sale  ✨', '1777535796364.jpg', '/shop', NULL, 1, '2026-04-30 07:56:36', '2026-04-30 09:14:10', '💖 Flat 40% OFF', 'Shop Now');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `orderId` varchar(255) NOT NULL,
  `customerId` int(11) NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `discountAmount` decimal(10,2) DEFAULT 0.00,
  `paymentStatus` enum('Pending','Paid','Failed') DEFAULT 'Pending',
  `orderStatus` enum('Pending','Confirmed','Shipped','Out for Delivery','Delivered','Cancelled') DEFAULT 'Pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `couponId` int(11) DEFAULT NULL,
  `shippingAddressId` int(11) DEFAULT NULL,
  `paymentMethod` varchar(255) DEFAULT 'Online',
  `paymentId` varchar(255) DEFAULT NULL,
  `razorpayOrderId` varchar(255) DEFAULT NULL,
  `snapName` varchar(255) DEFAULT NULL,
  `snapPhone` varchar(255) DEFAULT NULL,
  `snapAddressLine` varchar(255) DEFAULT NULL,
  `snapCity` varchar(255) DEFAULT NULL,
  `snapDistrict` varchar(255) DEFAULT NULL,
  `snapState` varchar(255) DEFAULT NULL,
  `snapPincode` varchar(6) DEFAULT NULL,
  `shippingAmount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`orderId`, `customerId`, `totalAmount`, `discountAmount`, `paymentStatus`, `orderStatus`, `createdAt`, `updatedAt`, `couponId`, `shippingAddressId`, `paymentMethod`, `paymentId`, `razorpayOrderId`, `snapName`, `snapPhone`, `snapAddressLine`, `snapCity`, `snapDistrict`, `snapState`, `snapPincode`, `shippingAmount`) VALUES
('ARS-1777875437580', 17, 297.00, 33.00, 'Paid', 'Delivered', '2026-05-04 06:17:17', '2026-05-04 12:52:09', 13, 30, 'Online', 'pay_SlBX16J1eICyw2', 'order_SlBPn7QolQrg0f', 'akshaya', '9344528302', 'Agaram 181/2,Agaram vill and post', 'Thirupattur', 'Karur', 'Tamil Nadu', '635653', 0.00);

-- --------------------------------------------------------

--
-- Table structure for table `orderslots`
--

CREATE TABLE `orderslots` (
  `id` int(11) NOT NULL,
  `orderId` varchar(255) NOT NULL,
  `productId` int(11) DEFAULT NULL,
  `variantId` int(11) DEFAULT NULL,
  `productName` varchar(255) DEFAULT NULL,
  `productImage` varchar(255) DEFAULT NULL,
  `variantLabel` varchar(255) DEFAULT NULL,
  `salesPrice` decimal(10,2) NOT NULL,
  `quantity` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `orderslots`
--

INSERT INTO `orderslots` (`id`, `orderId`, `productId`, `variantId`, `productName`, `productImage`, `variantLabel`, `salesPrice`, `quantity`, `createdAt`, `updatedAt`) VALUES
(90, 'ARS-1777526151842', NULL, NULL, 'EXOTIC Women\'s Handbag', '1777437948899.webp', NULL, 700.00, 1, '2026-04-30 05:15:51', '2026-04-30 06:53:16'),
(91, 'ARS-1777526151842', 58, NULL, 'Seeotwo Baby Hair Ties', '1777309342887.webp', 'S / rainbow ', 50.00, 1, '2026-04-30 05:15:51', '2026-04-30 05:15:51'),
(92, 'ARS-1777526151842', 59, NULL, 'Pine Kids Hair Rubber Bands with Floral Applique', '1777309576031.webp', 'S / any 5 colors', 50.00, 1, '2026-04-30 05:15:51', '2026-04-30 05:15:51'),
(93, 'ARS-1777526151842', 60, NULL, 'Sonpal Girl\'s Rabbit Ear Hair Tie', '1777309769382.webp', NULL, 69.00, 1, '2026-04-30 05:15:51', '2026-04-30 05:15:51'),
(94, 'ARS-1777526151842', 61, NULL, 'BELICIA Floral Lace Bow Hair Clip for Women and Girls', '1777350585396.jpg', NULL, 78.00, 1, '2026-04-30 05:15:51', '2026-04-30 05:15:51'),
(95, 'ARS-1777550537467', 45, NULL, ' Cute Mini Claw Hair Clip Set', '1777301211382.webp', NULL, 70.00, 1, '2026-04-30 12:02:17', '2026-04-30 12:02:17'),
(96, 'ARS-1777550537467', 48, NULL, 'Curve Grip Banana Catch Clip', '1777301944083.webp', NULL, 90.00, 1, '2026-04-30 12:02:17', '2026-04-30 12:02:17'),
(97, 'ARS-1777550537467', 66, NULL, 'SILVR BEAR Luxury Satin Skinny Scrunchies For Women/Girls ', '1777352498352.jpg', NULL, 70.00, 2, '2026-04-30 12:02:17', '2026-04-30 12:02:17'),
(98, 'ARS-1777550537467', 56, NULL, 'Daliva Women And Girls Heart Triangle Stud Earrings', '1777308733476.webp', NULL, 80.00, 1, '2026-04-30 12:02:17', '2026-04-30 12:02:17'),
(99, 'ARS-1777875437580', 72, NULL, 'ATIBELLE Set of 2 Gold-Plated Stone-Studded Beaded Bangles', '1777870640908.webp', NULL, 250.00, 1, '2026-05-04 06:17:17', '2026-05-04 06:17:17'),
(100, 'ARS-1777875437580', 56, NULL, 'Daliva Women And Girls Heart Triangle Stud Earrings', '1777308733476.webp', NULL, 80.00, 1, '2026-05-04 06:17:17', '2026-05-04 06:17:17'),
(101, 'ARS-1777879207231', NULL, NULL, 'test', '1777879126671.jpg', 'S / red', 40.00, 1, '2026-05-04 07:20:07', '2026-05-04 07:23:35'),
(102, 'ARS-1777881116791', NULL, NULL, 'test', '1777881029295.jpeg', 'S / red', 50.00, 2, '2026-05-04 07:51:56', '2026-05-04 07:54:09'),
(103, 'ARS-1777881826515', NULL, NULL, 'test', '1777881771307.jpeg', NULL, 20.00, 1, '2026-05-04 08:03:46', '2026-05-04 08:06:41');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `mainImage` varchar(255) DEFAULT NULL,
  `categoryId` int(11) NOT NULL,
  `status` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `mrpPrice` decimal(10,2) DEFAULT NULL,
  `salesPrice` decimal(10,2) DEFAULT NULL,
  `slug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `description`, `mainImage`, `categoryId`, `status`, `createdAt`, `updatedAt`, `mrpPrice`, `salesPrice`, `slug`) VALUES
(42, 'Floral Stud Earrings ', 'This cute collection features 6 unique flower designs in beautiful pastel colours, perfect for adding a fresh and aesthetic vibe to your outfits. Lightweight and comfortable, these earrings are ideal for daily wear, college, office, and casual looks.', '1777300115511.webp', 16, 1, '2026-04-27 14:28:35', '2026-05-04 10:16:12', 100.00, 80.00, 'floral-stud-earrings'),
(43, 'Vintage Gold Stud Earrings', 'These elegant gold-tone studs are lightweight, comfortable, and perfect for daily wear, office outfits, festive looks, or casual styling.\r\n\r\nA versatile 6-pair earrings collection that adds a classic vintage charm to any outfit.', '1777300404143.webp', 16, 1, '2026-04-27 14:33:24', '2026-05-04 12:47:10', 100.00, 80.00, 'vintage-gold-stud-earrings'),
(44, 'Pastel Petal Earrings – Elegant Tulip Bloom Studs', 'Inspired by blooming flowers, these Tulip Earrings bring a fresh and elegant vibe to your look. The soft pastel petals combined with a pearl accent create a classy yet trendy accessory.', '1777300658142.webp', 16, 1, '2026-04-27 14:37:38', '2026-05-04 12:47:00', 100.00, 69.00, 'pastel-petal-earrings-elegant-tulip-bloom-studs'),
(45, ' Cute Mini Claw Hair Clip Set', 'Add a cute touch to your hairstyle with this 6 Pcs Mini Claw Hair Clip Set. These stylish clips come in random colors and trendy shapes like flowers, stars, hearts and bows. Perfect for daily wear, casual styling, and quick hairstyles.\r\n\r\n Lightweight and easy to use, these mini clips help hold small sections of hair while giving a cute Korean-style look.', '1777301211382.webp', 17, 1, '2026-04-27 14:46:51', '2026-04-27 15:40:14', 100.00, 70.00, 'cute-mini-claw-hair-clip-set'),
(46, 'Butterfly Hair Claw Clip (2 Pcs Set) – Durable Hair Clip for Women', 'Add style and strength to your hairstyle with these Strong Grip Butterfly Hair Clips (2pcs set)  \r\n\r\nMade with high-quality durable acrylic, these clips are designed to be strong, long-lasting, and resistant to breaking or scratching. The powerful spring provides a strong grip that holds your hair securely without slipping.', '1777301451924.webp', 17, 1, '2026-04-27 14:50:51', '2026-05-04 12:46:51', 100.00, 80.00, 'butterfly-hair-claw-clip-2-pcs-set-durable-hair-clip-for-women'),
(47, 'Bloom Grip Floral Hair Claw Clip / Banana Clip', 'Designed with cute flower details and a glossy transparent finish, these clips are perfect for everyday styling with a trendy twist.\r\n\r\nWhether you\'re going for a casual look or dressing up, these clips hold your hair firmly while making you stand out 💫', '1777301696786.webp', 17, 1, '2026-04-27 14:54:56', '2026-05-04 12:47:41', 100.00, 80.00, 'bloom-grip-floral-hair-claw-clip-banana-clip'),
(48, 'Curve Grip Banana Catch Clip', 'Style your hair effortlessly with our ARS CurveGrip Banana Catch Clip .\r\nDesigned with a sleek curved shape and strong inner grip, this clip holds your hair securely without slipping or pulling.\r\nIts glossy transparent finish gives a modern, minimal look while ensuring maximum durability 💫\r\nPerfect for quick styling, everyday use, and all hair types.', '1777301944083.webp', 17, 1, '2026-04-27 14:59:04', '2026-04-27 15:39:54', 120.00, 90.00, 'curve-grip-banana-catch-clip'),
(49, 'Tropical Bloom Big Flower Claw Clip Set (4 pcs) – Trendy Korean Hair Clips', 'Add a tropical vibe to your hairstyle with Tropical Bloom Big Flower Claw Clips 🌸.\r\n\r\nThis set includes 4 big imported flower claw clips in mixed colours. Perfect for everyday styling, these clips offer a strong grip, lightweight feel, and trendy floral look.', '1777302716984.webp', 17, 1, '2026-04-27 15:11:57', '2026-04-27 15:51:58', 150.00, 99.00, 'tropical-bloom-big-flower-claw-clip-set-4-pcs-trendy-korean-hair-clips'),
(50, ' Floral Pinterest Collection Clips ', 'Floral Pinterest Collection Clips - 5 pcs Set\r\n\r\nAdd a cute Pinterest vibe to your hairstyle with this 5 pcs floral clip set.\r\n\r\nEach set includes 1 big flower clip, 2 medium clips, and 2 mini clips – perfect for creating multiple trendy hairstyles.', '1777302965984.webp', 17, 1, '2026-04-27 15:16:06', '2026-04-27 15:16:06', 130.00, 80.00, 'floral-pinterest-collection-clips'),
(51, 'Kids Hair Clips', 'Add a touch of charm to your little one’s look with our adorable collection of kids hair clips. Designed with love, these clips are perfect for daily wear, school, parties, and special occasions.', '1777306304380.webp', 18, 1, '2026-04-27 16:11:44', '2026-04-27 16:11:44', 100.00, 79.00, 'kids-hair-clips'),
(52, 'Snap Clips (Tik-Tak Clips)', 'Small and easy to use\r\nMakes a “snap” sound when closed\r\nPerfect for daily wear 👧\r\n\r\n👉 Best for: School & simple hairstyles', '1777306485861.webp', 18, 1, '2026-04-27 16:14:45', '2026-05-04 12:46:03', 100.00, 80.00, 'snap-clips-tik-tak-clips'),
(53, 'Kids Cute Hair Accessories Combo Box', 'A cute and colorful hair accessories set for kids including soft hair ties and clips, neatly packed in a storage box. Perfect for school, daily hairstyles, and gifting.', '1777306691354.webp', 18, 1, '2026-04-27 16:18:11', '2026-05-04 12:46:39', 100.00, 70.00, 'kids-cute-hair-accessories-combo-box'),
(54, 'Mini Claw Clips', 'Cute and colorful kids hair clips designed for comfort and style. These clips are lightweight, easy to use, and provide a strong grip without pulling hair, making them perfect for daily wear and special occasions.', '1777308120609.webp', 18, 1, '2026-04-27 16:42:00', '2026-05-04 12:45:56', 100.00, 68.00, 'mini-claw-clips'),
(55, 'Glitter Snap Clips (Set of 2)', 'Bright, trendy, and easy-to-wear hair clips for kids. Designed to stay secure and comfortable all day, they are ideal for adding a cute touch to any outfit.', '1777308343786.webp', 18, 1, '2026-04-27 16:45:43', '2026-05-04 12:45:23', 160.00, 100.00, 'glitter-snap-clips-set-of-2'),
(56, 'Daliva Women And Girls Heart Triangle Stud Earrings', 'Elegant Shaped Stud Earrings Combo Set of 4 With White Solitaire Crystal Diamonds for Women and Girls - Plated | Stylish, Traditional, Western and Fashion Wear.', '1777308733476.webp', 16, 1, '2026-04-27 16:52:13', '2026-05-04 12:45:33', 120.00, 80.00, 'daliva-women-and-girls-heart-triangle-stud-earrings'),
(57, 'Women\'s Tiny Heart Wood Stud Earrings', 'Elegant Shaped Stud Earrings Combo Set of 4 With White Solitaire Crystal Diamonds for Women and Girls - Plated | Stylish, Traditional, Western and Fashion Wear', '1777308954638.webp', 16, 1, '2026-04-27 16:55:54', '2026-04-27 16:55:54', 120.00, 80.00, 'womens-tiny-heart-wood-stud-earrings'),
(58, 'Seeotwo Baby Hair Ties', 'Shop the best kids hair rubber bands at Hairbounce. Our snag-free, colorful elastics are perfect for school braids and toddler ponytails.', '1777309342887.webp', 19, 1, '2026-04-27 17:02:22', '2026-05-04 12:45:15', 100.00, 50.00, 'seeotwo-baby-hair-ties'),
(59, 'Pine Kids Hair Rubber Bands with Floral Applique', 'ZiFuno Cartoon Characters Stickers Elastic Rubber Bands (20 Pcs) Hair Accessories |Fancy Design Toddler | Multicolor for Baby Girls and Kids (Assorted Design).', '1777309576031.webp', 19, 1, '2026-04-27 17:06:16', '2026-05-04 12:44:43', 100.00, 50.00, 'pine-kids-hair-rubber-bands-with-floral-applique'),
(60, 'Sonpal Girl\'s Rabbit Ear Hair Tie', 'ZiFuno Cartoon Characters Stickers Elastic Rubber Bands (20 Pcs) Hair Accessories |Fancy Design Toddler | Multicolor for Baby Girls and Kids (Assorted Design)', '1777309769382.webp', 19, 1, '2026-04-27 17:09:29', '2026-05-04 12:44:29', 100.00, 69.00, 'sonpal-girls-rabbit-ear-hair-tie'),
(61, 'BELICIA Floral Lace Bow Hair Clip for Women and Girls', 'Stylish Vintage Ribbon Bowknot Hair Accessory | Non-Slip Decorative Hairpin for Thick and Thin Hair | Ideal for Daily Parties and Events (Pink)', '1777350585396.jpg', 20, 1, '2026-04-28 04:29:45', '2026-05-04 12:44:23', 100.00, 78.00, 'belicia-floral-lace-bow-hair-clip-for-women-and-girls'),
(62, ' Korean tulip Design Hair Scrunchies', 'Satin Scrunchie Set with Tulip flower for Women & Girls | Korean tulip Design Hair Scrunchies for Daily Use | Soft Elastic Hair Ties (Multicolor 7 pieces)', '1777351017339.jpg', 20, 1, '2026-04-28 04:36:57', '2026-05-04 12:48:06', 120.00, 60.00, 'korean-tulip-design-hair-scrunchies'),
(63, 'Handmade Crochet Sunflower Hair Tie ', 'RR creation Handmade Crochet Sunflower Hair Tie for Women & Girls | Aesthetic Cotton Floral Hair Accessories | Cute Daisy & Sunflower Elastic Hair Bands | Korean Style Retro Hand-Woven Crochet Hair Ties ', '1777351242736.jpg', 20, 1, '2026-04-28 04:40:42', '2026-05-04 12:47:49', 100.00, 70.00, 'handmade-crochet-sunflower-hair-tie'),
(64, 'SIMMI Classic Satin Silk Scrunchies For Women And Girls', '\r\nClick to see full view\r\nSIMMI Classic Satin Silk Scrunchies For Women And Girls Set Of 12 Scrunchie for Less Hair fall Hairbands Rubber Band Scrunchies For Girls Best Gift For Mom, Sister And Girlfriend', '1777351727670.jpg', 21, 1, '2026-04-28 04:48:47', '2026-05-04 12:44:56', 100.00, 70.00, 'simmi-classic-satin-silk-scrunchies-for-women-and-girls'),
(65, ' RedBerry Cuddle Scrunchie Set - Pack of 12 ', '\r\nRedBerry Cuddle Scrunchie Set - Pack of 12 | Stylish Hair Ties for Women & Girls | Anti Hair Breakage Hair Accessories (Printed Scrunchies)', '1777352002902.jpg', 21, 1, '2026-04-28 04:53:22', '2026-04-30 11:59:43', 100.00, 69.00, 'redberry-cuddle-scrunchie-set-pack-of-12'),
(66, 'SILVR BEAR Luxury Satin Skinny Scrunchies For Women/Girls ', 'SILVR BEAR Luxury Satin Skinny Scrunchies For Women/Girls - Same 6 Colors As Pic, 𝗔𝗻𝘁𝗶-𝗛𝗮𝗶𝗿-𝗕𝗿𝗲𝗮𝗸𝗮𝗴𝗲,\r\nHair Ties, Slim Scrunchies Set For Girls (Skinny Rose Collection)', '1777352498352.jpg', 21, 1, '2026-04-28 05:01:38', '2026-05-25 05:44:02', 100.00, 70.00, 'silvr-bear-luxury-satin-skinny-scrunchies-for-womengirls'),
(70, 'YouBella Women\'s Stylish Traditional Hand Work Bangles', 'Bangles are elegant circular ornaments worn around the wrist, commonly associated with traditional and modern fashion. They come in a wide variety of materials such as gold, silver, glass, plastic, wood, and metal, each offering a distinct look and feel. Bangles can be plain and minimalistic or richly decorated with intricate carvings, gemstones, enamel work, or colorful patterns.', '1777869998853.jpg', 25, 1, '2026-05-04 04:46:38', '2026-05-04 12:44:06', 200.00, 149.00, 'youbella-womens-stylish-traditional-hand-work-bangles'),
(71, 'Gold Toned Multicolor Bangles', 'Golden bangles are elegant and timeless accessories that add a rich, stylish touch to any outfit. With their shiny gold finish and versatile designs, they are perfect for both daily wear and special occasions.', '1777870374383.webp', 25, 1, '2026-05-04 04:52:54', '2026-05-04 04:52:54', 300.00, 250.00, 'gold-toned-multicolor-bangles'),
(72, 'ATIBELLE Set of 2 Gold-Plated Stone-Studded Beaded Bangles', 'White stone bangles are graceful and eye-catching accessories that add a touch of sparkle to any outfit. Adorned with shimmering white stones, they offer a classy and elegant look, perfect for weddings, parties, and festive occasions.', '1777870640908.webp', 25, 1, '2026-05-04 04:57:20', '2026-05-04 04:57:20', 300.00, 250.00, 'atibelle-set-of-2-gold-plated-stone-studded-beaded-bangles');

-- --------------------------------------------------------

--
-- Table structure for table `productvariants`
--

CREATE TABLE `productvariants` (
  `id` int(11) NOT NULL,
  `size` enum('All Sizes','Free Size','XS','S','M','L','XL','XXL') DEFAULT 'All Sizes',
  `color` varchar(255) DEFAULT NULL,
  `mrpPrice` decimal(10,2) NOT NULL,
  `salesPrice` decimal(10,2) NOT NULL,
  `quantity` int(11) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `productId` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `productvariants`
--

INSERT INTO `productvariants` (`id`, `size`, `color`, `mrpPrice`, `salesPrice`, `quantity`, `createdAt`, `updatedAt`, `productId`) VALUES
(280, 'S', 'any two colors', 100.00, 60.00, 20, '2026-04-27 15:16:06', '2026-04-27 15:16:06', 50),
(281, 'M', 'any two color', 130.00, 70.00, 20, '2026-04-27 15:16:06', '2026-04-27 15:16:06', 50),
(282, 'L', 'any two colors', 150.00, 90.00, 20, '2026-04-27 15:16:06', '2026-04-27 15:16:06', 50),
(283, 'S', 'any two ', 100.00, 80.00, 20, '2026-04-27 15:39:54', '2026-04-27 15:39:54', 48),
(284, 'M', 'any two', 110.00, 90.00, 20, '2026-04-27 15:39:54', '2026-04-27 15:39:54', 48),
(285, 'L', 'any two', 130.00, 100.00, 20, '2026-04-27 15:39:54', '2026-04-27 15:39:54', 48),
(289, 'S', 'all colors', 100.00, 60.00, 20, '2026-04-27 15:40:14', '2026-04-27 15:40:14', 45),
(290, 'M', 'all colors', 100.00, 80.00, 30, '2026-04-27 15:40:14', '2026-04-27 15:40:14', 45),
(291, 'L', 'all colors', 120.00, 9030.00, 30, '2026-04-27 15:40:14', '2026-04-27 15:40:14', 45),
(297, 'S', 'any 4 color', 130.00, 100.00, 20, '2026-04-27 15:51:58', '2026-04-27 15:51:58', 49),
(298, 'M', 'any 4 colors', 130.00, 120.00, 20, '2026-04-27 15:51:58', '2026-04-27 15:51:58', 49),
(299, 'L', 'any 4 colors', 160.00, 130.00, 20, '2026-04-27 15:51:58', '2026-04-27 15:51:58', 49),
(308, 'S', 'rainbow', 100.00, 70.00, 20, '2026-04-27 16:11:44', '2026-04-27 16:11:44', 51),
(309, 'XS', 'rainbow', 100.00, 50.00, 20, '2026-04-27 16:11:44', '2026-04-27 16:11:44', 51),
(321, 'S', 'any 4 colors', 120.00, 80.00, 20, '2026-04-27 16:55:54', '2026-04-27 16:55:54', 57),
(322, 'XS', 'any 4 colors', 100.00, 50.00, 20, '2026-04-27 16:55:54', '2026-04-27 16:55:54', 57),
(323, 'M', 'any 4 colors', 140.00, 90.00, 20, '2026-04-27 16:55:54', '2026-04-27 16:55:54', 57),
(383, 'S', 'any 12 colors', 100.00, 60.00, 0, '2026-04-30 11:59:43', '2026-04-30 11:59:43', 65),
(384, 'M', 'any 12 color', 110.00, 70.00, 0, '2026-04-30 11:59:43', '2026-04-30 11:59:43', 65),
(385, 'L', 'any 12 colors', 120.00, 80.00, 0, '2026-04-30 11:59:43', '2026-04-30 11:59:43', 65),
(386, 'XL', 'any 12 colors', 140.00, 90.00, 0, '2026-04-30 11:59:43', '2026-04-30 11:59:43', 65),
(387, 'Free Size', 'any 12 colors', 100.00, 70.00, 0, '2026-04-30 11:59:43', '2026-04-30 11:59:43', 65),
(391, 'S', 'golden ', 250.00, 200.00, 20, '2026-05-04 04:52:54', '2026-05-04 04:52:54', 71),
(392, 'M', 'golden', 300.00, 250.00, 20, '2026-05-04 04:52:54', '2026-05-04 04:52:54', 71),
(393, 'L', 'golden', 350.00, 300.00, 20, '2026-05-04 04:52:54', '2026-05-04 04:52:54', 71),
(394, 'S', 'gold', 300.00, 250.00, 20, '2026-05-04 04:57:20', '2026-05-04 04:57:20', 72),
(395, 'M', 'gold', 350.00, 300.00, 20, '2026-05-04 04:57:20', '2026-05-04 04:57:20', 72),
(396, 'L', 'gold', 400.00, 350.00, 20, '2026-05-04 04:57:20', '2026-05-04 04:57:20', 72),
(400, 'S', 'multi color', 100.00, 80.00, 40, '2026-05-04 10:16:12', '2026-05-04 10:16:12', 42),
(401, 'M', 'multi colors', 100.00, 80.00, 60, '2026-05-04 10:16:12', '2026-05-04 10:16:12', 42),
(402, 'S', 'rainbow colors', 200.00, 150.00, 30, '2026-05-04 12:44:06', '2026-05-04 12:44:06', 70),
(403, 'M', 'rainbow colors', 250.00, 200.00, 30, '2026-05-04 12:44:06', '2026-05-04 12:44:06', 70),
(404, 'L', 'rainbow colors', 300.00, 250.00, 30, '2026-05-04 12:44:06', '2026-05-04 12:44:06', 70),
(408, 'S', 'pastel pink', 100.00, 60.00, 20, '2026-05-04 12:44:23', '2026-05-04 12:44:23', 61),
(409, 'XS', 'pastel pink', 100.00, 50.00, 20, '2026-05-04 12:44:23', '2026-05-04 12:44:23', 61),
(410, 'S', 'pastel pink', 100.00, 40.00, 20, '2026-05-04 12:44:23', '2026-05-04 12:44:23', 61),
(411, 'S', 'rainbow color', 100.00, 60.00, 20, '2026-05-04 12:44:29', '2026-05-04 12:44:29', 60),
(412, 'XS', 'rainbow colors', 100.00, 50.00, 20, '2026-05-04 12:44:29', '2026-05-04 12:44:29', 60),
(413, 'M', 'ranbow colors', 120.00, 70.00, 20, '2026-05-04 12:44:29', '2026-05-04 12:44:29', 60),
(414, 'S', 'any 5 colors', 100.00, 50.00, 60, '2026-05-04 12:44:43', '2026-05-04 12:44:43', 59),
(415, 'XS', 'any 5 colors', 100.00, 50.00, 60, '2026-05-04 12:44:43', '2026-05-04 12:44:43', 59),
(416, 'M', 'any 5 colors', 100.00, 60.00, 50, '2026-05-04 12:44:43', '2026-05-04 12:44:43', 59),
(422, 'S', 'any 12 colors', 100.00, 70.00, 20, '2026-05-04 12:44:56', '2026-05-04 12:44:56', 64),
(423, 'Free Size', 'any 12 colors', 140.00, 80.00, 20, '2026-05-04 12:44:56', '2026-05-04 12:44:56', 64),
(424, 'XXL', 'any 12 colors', 180.00, 90.00, 20, '2026-05-04 12:44:56', '2026-05-04 12:44:56', 64),
(425, 'M', 'any 12 colors', 130.00, 80.00, 20, '2026-05-04 12:44:56', '2026-05-04 12:44:56', 64),
(426, 'L', 'any 12 colors', 150.00, 80.00, 20, '2026-05-04 12:44:56', '2026-05-04 12:44:56', 64),
(427, 'S', 'rainbow ', 100.00, 50.00, 30, '2026-05-04 12:45:15', '2026-05-04 12:45:15', 58),
(428, 'XS', 'rainbow', 100.00, 50.00, 30, '2026-05-04 12:45:15', '2026-05-04 12:45:15', 58),
(429, 'M', 'rainbow', 100.00, 60.00, 40, '2026-05-04 12:45:15', '2026-05-04 12:45:15', 58),
(430, 'S', 'any two colors', 100.00, 60.00, 30, '2026-05-04 12:45:23', '2026-05-04 12:45:23', 55),
(431, 'M', 'any two colors', 100.00, 80.00, 40, '2026-05-04 12:45:23', '2026-05-04 12:45:23', 55),
(432, 'S', 'silver shades', 100.00, 80.00, 30, '2026-05-04 12:45:33', '2026-05-04 12:45:33', 56),
(433, 'M', 'silver ', 120.00, 90.00, 50, '2026-05-04 12:45:33', '2026-05-04 12:45:33', 56),
(434, 'L', 'silver', 150.00, 100.00, 40, '2026-05-04 12:45:33', '2026-05-04 12:45:33', 56),
(435, 'S', 'multi colors', 100.00, 70.00, 40, '2026-05-04 12:45:56', '2026-05-04 12:45:56', 54),
(436, 'XS', 'multi colors', 100.00, 50.00, 40, '2026-05-04 12:45:56', '2026-05-04 12:45:56', 54),
(437, 'S', 'pastel color', 100.00, 70.00, 20, '2026-05-04 12:46:03', '2026-05-04 12:46:03', 52),
(438, 'XS', 'pastel color', 100.00, 50.00, 20, '2026-05-04 12:46:03', '2026-05-04 12:46:03', 52),
(442, 'S', 'rainbow colors', 100.00, 80.00, 20, '2026-05-04 12:46:39', '2026-05-04 12:46:39', 53),
(443, 'XS', 'rainbow colors', 100.00, 70.00, 20, '2026-05-04 12:46:39', '2026-05-04 12:46:39', 53),
(444, 'S', 'any two colors', 100.00, 70.00, 20, '2026-05-04 12:46:51', '2026-05-04 12:46:51', 46),
(445, 'M', 'any two colors', 100.00, 80.00, 20, '2026-05-04 12:46:51', '2026-05-04 12:46:51', 46),
(446, 'L', 'any two colors', 130.00, 90.00, 20, '2026-05-04 12:46:51', '2026-05-04 12:46:51', 46),
(447, 'S', 'pastel color', 100.00, 70.00, 20, '2026-05-04 12:47:00', '2026-05-04 12:47:00', 44),
(448, 'M', 'pastel color', 100.00, 80.00, 20, '2026-05-04 12:47:00', '2026-05-04 12:47:00', 44),
(449, 'L', 'pastel color', 120.00, 100.00, 20, '2026-05-04 12:47:00', '2026-05-04 12:47:00', 44),
(450, 'S', 'golden', 100.00, 80.00, 70, '2026-05-04 12:47:10', '2026-05-04 12:47:10', 43),
(451, 'M', 'golden', 100.00, 80.00, 30, '2026-05-04 12:47:10', '2026-05-04 12:47:10', 43),
(452, 'L', 'golden', 120.00, 100.00, 30, '2026-05-04 12:47:10', '2026-05-04 12:47:10', 43),
(453, 'S', 'any two', 100.00, 80.00, 20, '2026-05-04 12:47:42', '2026-05-04 12:47:42', 47),
(454, 'M', 'any two', 100.00, 90.00, 30, '2026-05-04 12:47:42', '2026-05-04 12:47:42', 47),
(455, 'L', 'any two', 130.00, 100.00, 30, '2026-05-04 12:47:42', '2026-05-04 12:47:42', 47),
(456, 'S', 'yellow', 100.00, 60.00, 20, '2026-05-04 12:47:49', '2026-05-04 12:47:49', 63),
(457, 'XS', 'yellow', 100.00, 60.00, 30, '2026-05-04 12:47:49', '2026-05-04 12:47:49', 63),
(458, 'M', 'yellow', 100.00, 70.00, 40, '2026-05-04 12:47:49', '2026-05-04 12:47:49', 63),
(459, 'S', 'any 4 colors', 120.00, 60.00, 40, '2026-05-04 12:48:06', '2026-05-04 12:48:06', 62),
(460, 'M', 'any 4 colors', 120.00, 70.00, 30, '2026-05-04 12:48:06', '2026-05-04 12:48:06', 62),
(461, 'XS', 'any 4 colors', 120.00, 50.00, 30, '2026-05-04 12:48:06', '2026-05-04 12:48:06', 62),
(462, 'S', 'any 6 colors', 100.00, 70.00, 2, '2026-05-25 05:44:02', '2026-05-25 05:44:02', 66),
(463, 'Free Size', 'any 6 colors', 100.00, 70.00, 2, '2026-05-25 05:44:02', '2026-05-25 05:44:02', 66),
(464, 'M', 'any 6 colors', 120.00, 80.00, 2, '2026-05-25 05:44:02', '2026-05-25 05:44:02', 66),
(465, 'L', 'any 6 colors', 130.00, 90.00, 0, '2026-05-25 05:44:02', '2026-05-25 05:44:02', 66),
(466, 'XL', 'any 6 colors', 140.00, 90.00, 2, '2026-05-25 05:44:02', '2026-05-25 05:44:02', 66);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `feedback` text NOT NULL,
  `status` enum('pending','published','rejected') DEFAULT 'pending',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `orderId` varchar(50) DEFAULT NULL,
  `productId` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL DEFAULT 5
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `customerId`, `feedback`, `status`, `createdAt`, `updatedAt`, `orderId`, `productId`, `rating`) VALUES
(16, 16, 'good and fast delivery ❤️', 'published', '2026-04-30 12:05:08', '2026-05-04 07:27:16', 'ARS-1777550537467', 45, 5);

-- --------------------------------------------------------

--
-- Table structure for table `shippingaddresses`
--

CREATE TABLE `shippingaddresses` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `city` varchar(255) NOT NULL,
  `state` varchar(255) NOT NULL,
  `pincode` varchar(6) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `addressLine` varchar(255) NOT NULL,
  `district` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shippingaddresses`
--

INSERT INTO `shippingaddresses` (`id`, `customerId`, `city`, `state`, `pincode`, `createdAt`, `updatedAt`, `name`, `phone`, `addressLine`, `district`) VALUES
(28, 16, 'coimbutore', 'Tamil Nadu', '635658', '2026-04-30 05:15:24', '2026-04-30 05:20:36', 'kalaiyarasi', '6369621417', 'south street. anna nagar', 'Nagapattinam'),
(29, 16, 'Karur, Tamil Nadu, India', 'Tamil Nadu', '639002', '2026-04-30 12:01:09', '2026-04-30 12:01:09', 'kalaiyarasi', '6369621417', 'Nanjaikalakurichi', 'Karur'),
(30, 17, 'Thirupattur', 'Tamil Nadu', '635653', '2026-05-04 06:10:10', '2026-05-04 06:10:10', 'akshaya', '9344528302', 'Agaram 181/2,Agaram vill and post', 'Karur');

-- --------------------------------------------------------

--
-- Table structure for table `shippingrates`
--

CREATE TABLE `shippingrates` (
  `id` int(11) NOT NULL,
  `state` varchar(100) NOT NULL,
  `amount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `isActive` tinyint(1) DEFAULT 1,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `shippingrates`
--

INSERT INTO `shippingrates` (`id`, `state`, `amount`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'Andhra Pradesh', 50.00, 1, '2026-05-25 07:11:56', '2026-05-25 07:11:56'),
(2, 'Tamil Nadu', 60.00, 1, '2026-05-25 07:12:09', '2026-05-25 07:12:09'),
(3, 'Goa', 200.00, 1, '2026-05-25 07:13:48', '2026-05-25 07:13:48'),
(4, 'Karnataka', 150.00, 1, '2026-05-25 07:18:56', '2026-05-25 07:18:56'),
(5, 'Kerala', 250.00, 1, '2026-05-25 07:26:40', '2026-05-25 07:26:40');

-- --------------------------------------------------------

--
-- Table structure for table `subcategories`
--

CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `thumbnails`
--

CREATE TABLE `thumbnails` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `image` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `thumbnails`
--

INSERT INTO `thumbnails` (`id`, `productId`, `image`, `createdAt`, `updatedAt`) VALUES
(1, 1, '1775697480566.webp', '2026-04-09 01:18:00', '2026-04-09 01:18:00'),
(2, 1, '1775697480578.webp', '2026-04-09 01:18:00', '2026-04-09 01:18:00'),
(3, 1, '1775697480582.webp', '2026-04-09 01:18:00', '2026-04-09 01:18:00'),
(4, 2, '1775698706224.webp', '2026-04-09 01:38:26', '2026-04-09 01:38:26'),
(5, 2, '1775698706232.webp', '2026-04-09 01:38:26', '2026-04-09 01:38:26'),
(6, 2, '1775698706236.webp', '2026-04-09 01:38:26', '2026-04-09 01:38:26'),
(7, 3, '1775698814805.webp', '2026-04-09 01:40:14', '2026-04-09 01:40:14'),
(8, 3, '1775698814811.webp', '2026-04-09 01:40:14', '2026-04-09 01:40:14'),
(9, 4, '1775698910245.jpg', '2026-04-09 01:41:50', '2026-04-09 01:41:50'),
(10, 5, '1775699009389.webp', '2026-04-09 01:43:29', '2026-04-09 01:43:29'),
(11, 6, '1775699104454.webp', '2026-04-09 01:45:04', '2026-04-09 01:45:04'),
(12, 6, '1775699104454.webp', '2026-04-09 01:45:04', '2026-04-09 01:45:04'),
(13, 6, '1775699104462.webp', '2026-04-09 01:45:04', '2026-04-09 01:45:04'),
(14, 7, '1775699211797.webp', '2026-04-09 01:46:51', '2026-04-09 01:46:51'),
(15, 7, '1775699211799.webp', '2026-04-09 01:46:51', '2026-04-09 01:46:51'),
(16, 7, '1775699211802.webp', '2026-04-09 01:46:51', '2026-04-09 01:46:51'),
(17, 8, '1775699339536.webp', '2026-04-09 01:48:59', '2026-04-09 01:48:59'),
(18, 8, '1775699339537.webp', '2026-04-09 01:48:59', '2026-04-09 01:48:59'),
(19, 8, '1775699339544.webp', '2026-04-09 01:48:59', '2026-04-09 01:48:59'),
(20, 8, '1775699339550.webp', '2026-04-09 01:48:59', '2026-04-09 01:48:59'),
(21, 9, '1775699623644.webp', '2026-04-09 01:53:43', '2026-04-09 01:53:43'),
(22, 9, '1775699623644.webp', '2026-04-09 01:53:43', '2026-04-09 01:53:43'),
(23, 9, '1775699623645.webp', '2026-04-09 01:53:43', '2026-04-09 01:53:43'),
(24, 10, '1775699721004.jpg', '2026-04-09 01:55:21', '2026-04-09 01:55:21'),
(25, 11, '1775699836971.jpg', '2026-04-09 01:57:17', '2026-04-09 01:57:17'),
(27, 12, '1775699951279.webp', '2026-04-09 01:59:11', '2026-04-09 01:59:11'),
(28, 13, '1775700059024.webp', '2026-04-09 02:00:59', '2026-04-09 02:00:59'),
(29, 13, '1775700059027.webp', '2026-04-09 02:00:59', '2026-04-09 02:00:59'),
(30, 13, '1775700059029.webp', '2026-04-09 02:00:59', '2026-04-09 02:00:59'),
(31, 14, '1775700182247.webp', '2026-04-09 02:03:02', '2026-04-09 02:03:02'),
(32, 14, '1775700182247.jpg', '2026-04-09 02:03:02', '2026-04-09 02:03:02'),
(33, 14, '1775700182248.webp', '2026-04-09 02:03:02', '2026-04-09 02:03:02'),
(34, 15, '1775700269525.webp', '2026-04-09 02:04:29', '2026-04-09 02:04:29'),
(35, 15, '1775700269530.webp', '2026-04-09 02:04:29', '2026-04-09 02:04:29'),
(36, 16, '1775700333998.webp', '2026-04-09 02:05:34', '2026-04-09 02:05:34'),
(37, 17, '1775700437645.jpg', '2026-04-09 02:07:17', '2026-04-09 02:07:17'),
(38, 18, '1775700527360.webp', '2026-04-09 02:08:47', '2026-04-09 02:08:47'),
(39, 18, '1775700527364.webp', '2026-04-09 02:08:47', '2026-04-09 02:08:47'),
(40, 19, '1775700607238.webp', '2026-04-09 02:10:07', '2026-04-09 02:10:07'),
(41, 19, '1775700607239.webp', '2026-04-09 02:10:07', '2026-04-09 02:10:07'),
(43, 20, '1775700679644.webp', '2026-04-09 02:11:19', '2026-04-09 02:11:19'),
(44, 21, '1775700956226.jpg', '2026-04-09 02:15:56', '2026-04-09 02:15:56'),
(45, 21, '1775700956271.webp', '2026-04-09 02:15:56', '2026-04-09 02:15:56'),
(46, 22, '1775701050381.webp', '2026-04-09 02:17:30', '2026-04-09 02:17:30'),
(47, 22, '1775701050383.webp', '2026-04-09 02:17:30', '2026-04-09 02:17:30'),
(48, 23, '1775709085194.avif', '2026-04-09 04:31:25', '2026-04-09 04:31:25'),
(50, 24, '1775709165131.avif', '2026-04-09 04:32:45', '2026-04-09 04:32:45'),
(56, 27, '1775709640763.avif', '2026-04-09 04:40:40', '2026-04-09 04:40:40'),
(57, 28, '1775709778540.webp', '2026-04-09 04:42:58', '2026-04-09 04:42:58'),
(58, 28, '1775709778562.webp', '2026-04-09 04:42:58', '2026-04-09 04:42:58'),
(66, 32, '1775710516190.avif', '2026-04-09 04:55:16', '2026-04-09 04:55:16'),
(69, 34, '1775710824790.avif', '2026-04-09 05:00:24', '2026-04-09 05:00:24'),
(76, 36, '1775711142667.avif', '2026-04-09 05:05:42', '2026-04-09 05:05:42'),
(81, 35, '1775711811983.avif', '2026-04-09 05:16:52', '2026-04-09 05:16:52'),
(82, 33, '1775711841936.avif', '2026-04-09 05:17:21', '2026-04-09 05:17:21'),
(83, 31, '1775711917994.avif', '2026-04-09 05:18:38', '2026-04-09 05:18:38'),
(84, 30, '1775712007630.avif', '2026-04-09 05:20:07', '2026-04-09 05:20:07'),
(85, 29, '1775712042496.avif', '2026-04-09 05:20:42', '2026-04-09 05:20:42'),
(87, 24, '1775714653581.avif', '2026-04-09 06:04:13', '2026-04-09 06:04:13'),
(88, 25, '1775715018103.avif', '2026-04-09 06:10:18', '2026-04-09 06:10:18'),
(89, 33, '1775721597232.avif', '2026-04-09 07:59:57', '2026-04-09 07:59:57'),
(90, 32, '1775721678121.avif', '2026-04-09 08:01:18', '2026-04-09 08:01:18'),
(91, 30, '1775721721342.avif', '2026-04-09 08:02:01', '2026-04-09 08:02:01'),
(95, 31, '1775725691821.avif', '2026-04-09 09:08:11', '2026-04-09 09:08:11'),
(96, 23, '1775725775708.avif', '2026-04-09 09:09:35', '2026-04-09 09:09:35'),
(97, 34, '1775796157926.avif', '2026-04-10 04:42:37', '2026-04-10 04:42:37'),
(98, 34, '1775796157931.avif', '2026-04-10 04:42:37', '2026-04-10 04:42:37'),
(102, 39, '1776066574078.avif', '2026-04-13 07:49:34', '2026-04-13 07:49:34'),
(103, 39, '1776066574080.jpg', '2026-04-13 07:49:34', '2026-04-13 07:49:34'),
(104, 39, '1776066574080.webp', '2026-04-13 07:49:34', '2026-04-13 07:49:34'),
(105, 26, '1776229497055.avif', '2026-04-15 05:04:57', '2026-04-15 05:04:57'),
(106, 40, '1776751178105.webp', '2026-04-21 05:59:38', '2026-04-21 05:59:38'),
(107, 40, '1776751178106.jpg', '2026-04-21 05:59:38', '2026-04-21 05:59:38'),
(110, 37, '1776833860745.avif', '2026-04-22 04:57:40', '2026-04-22 04:57:40'),
(111, 37, '1776833860746.avif', '2026-04-22 04:57:40', '2026-04-22 04:57:40'),
(112, 38, '1777023664699.avif', '2026-04-24 09:41:04', '2026-04-24 09:41:04'),
(116, 42, '1777300115515.webp', '2026-04-27 14:28:35', '2026-04-27 14:28:35'),
(117, 42, '1777300115524.webp', '2026-04-27 14:28:35', '2026-04-27 14:28:35'),
(119, 43, '1777300404146.webp', '2026-04-27 14:33:24', '2026-04-27 14:33:24'),
(120, 43, '1777300404148.webp', '2026-04-27 14:33:24', '2026-04-27 14:33:24'),
(121, 44, '1777300658150.webp', '2026-04-27 14:37:38', '2026-04-27 14:37:38'),
(122, 44, '1777300658152.webp', '2026-04-27 14:37:38', '2026-04-27 14:37:38'),
(123, 44, '1777300658158.webp', '2026-04-27 14:37:38', '2026-04-27 14:37:38'),
(124, 44, '1777300658161.webp', '2026-04-27 14:37:38', '2026-04-27 14:37:38'),
(125, 45, '1777301211383.webp', '2026-04-27 14:46:51', '2026-04-27 14:46:51'),
(126, 46, '1777301451933.webp', '2026-04-27 14:50:51', '2026-04-27 14:50:51'),
(127, 46, '1777301451934.webp', '2026-04-27 14:50:51', '2026-04-27 14:50:51'),
(128, 47, '1777301696789.webp', '2026-04-27 14:54:56', '2026-04-27 14:54:56'),
(129, 47, '1777301696801.webp', '2026-04-27 14:54:56', '2026-04-27 14:54:56'),
(130, 47, '1777301696809.webp', '2026-04-27 14:54:56', '2026-04-27 14:54:56'),
(131, 48, '1777301944084.webp', '2026-04-27 14:59:04', '2026-04-27 14:59:04'),
(132, 48, '1777301944088.webp', '2026-04-27 14:59:04', '2026-04-27 14:59:04'),
(133, 49, '1777302716986.webp', '2026-04-27 15:11:57', '2026-04-27 15:11:57'),
(134, 49, '1777302717028.webp', '2026-04-27 15:11:57', '2026-04-27 15:11:57'),
(135, 50, '1777302965984.webp', '2026-04-27 15:16:06', '2026-04-27 15:16:06'),
(136, 50, '1777302965986.webp', '2026-04-27 15:16:06', '2026-04-27 15:16:06'),
(137, 51, '1777306304381.webp', '2026-04-27 16:11:44', '2026-04-27 16:11:44'),
(138, 51, '1777306304382.webp', '2026-04-27 16:11:44', '2026-04-27 16:11:44'),
(139, 52, '1777306485862.webp', '2026-04-27 16:14:45', '2026-04-27 16:14:45'),
(140, 52, '1777306485863.webp', '2026-04-27 16:14:45', '2026-04-27 16:14:45'),
(141, 52, '1777306485874.webp', '2026-04-27 16:14:45', '2026-04-27 16:14:45'),
(142, 53, '1777306691355.webp', '2026-04-27 16:18:11', '2026-04-27 16:18:11'),
(143, 53, '1777306691358.webp', '2026-04-27 16:18:11', '2026-04-27 16:18:11'),
(144, 54, '1777308120610.webp', '2026-04-27 16:42:00', '2026-04-27 16:42:00'),
(145, 54, '1777308120651.webp', '2026-04-27 16:42:00', '2026-04-27 16:42:00'),
(146, 54, '1777308120652.webp', '2026-04-27 16:42:00', '2026-04-27 16:42:00'),
(147, 55, '1777308343787.webp', '2026-04-27 16:45:43', '2026-04-27 16:45:43'),
(148, 56, '1777308733478.webp', '2026-04-27 16:52:13', '2026-04-27 16:52:13'),
(149, 56, '1777308733479.webp', '2026-04-27 16:52:13', '2026-04-27 16:52:13'),
(150, 57, '1777308954639.webp', '2026-04-27 16:55:54', '2026-04-27 16:55:54'),
(151, 58, '1777309342888.avif', '2026-04-27 17:02:22', '2026-04-27 17:02:22'),
(152, 58, '1777309342888.avif', '2026-04-27 17:02:22', '2026-04-27 17:02:22'),
(153, 58, '1777309342889.avif', '2026-04-27 17:02:22', '2026-04-27 17:02:22'),
(154, 59, '1777309576031.webp', '2026-04-27 17:06:16', '2026-04-27 17:06:16'),
(155, 59, '1777309576032.webp', '2026-04-27 17:06:16', '2026-04-27 17:06:16'),
(156, 60, '1777309769383.webp', '2026-04-27 17:09:29', '2026-04-27 17:09:29'),
(157, 60, '1777309769388.webp', '2026-04-27 17:09:29', '2026-04-27 17:09:29'),
(158, 60, '1777309769392.webp', '2026-04-27 17:09:29', '2026-04-27 17:09:29'),
(159, 61, '1777350585397.jpg', '2026-04-28 04:29:45', '2026-04-28 04:29:45'),
(160, 61, '1777350585399.jpg', '2026-04-28 04:29:45', '2026-04-28 04:29:45'),
(161, 61, '1777350585404.jpg', '2026-04-28 04:29:45', '2026-04-28 04:29:45'),
(162, 61, '1777350585413.jpg', '2026-04-28 04:29:45', '2026-04-28 04:29:45'),
(163, 62, '1777351017349.jpg', '2026-04-28 04:36:57', '2026-04-28 04:36:57'),
(164, 62, '1777351017358.jpg', '2026-04-28 04:36:57', '2026-04-28 04:36:57'),
(165, 62, '1777351017365.jpg', '2026-04-28 04:36:57', '2026-04-28 04:36:57'),
(166, 62, '1777351017376.jpg', '2026-04-28 04:36:57', '2026-04-28 04:36:57'),
(167, 63, '1777351242737.jpg', '2026-04-28 04:40:42', '2026-04-28 04:40:42'),
(168, 64, '1777351727672.jpg', '2026-04-28 04:48:47', '2026-04-28 04:48:47'),
(171, 64, '1777351727693.jpg', '2026-04-28 04:48:47', '2026-04-28 04:48:47'),
(172, 65, '1777352002908.jpg', '2026-04-28 04:53:22', '2026-04-28 04:53:22'),
(173, 65, '1777352002914.jpg', '2026-04-28 04:53:22', '2026-04-28 04:53:22'),
(174, 65, '1777352002919.jpg', '2026-04-28 04:53:22', '2026-04-28 04:53:22'),
(175, 65, '1777352002921.jpg', '2026-04-28 04:53:22', '2026-04-28 04:53:22'),
(176, 66, '1777352498357.jpg', '2026-04-28 05:01:38', '2026-04-28 05:01:38'),
(177, 66, '1777352498364.jpg', '2026-04-28 05:01:38', '2026-04-28 05:01:38'),
(178, 66, '1777352498370.jpg', '2026-04-28 05:01:38', '2026-04-28 05:01:38'),
(179, 67, '1777354724246.jpg', '2026-04-28 05:38:44', '2026-04-28 05:38:44'),
(180, 68, '1777356285961.jpg', '2026-04-28 06:04:46', '2026-04-28 06:04:46'),
(181, 68, '1777356285968.jpg', '2026-04-28 06:04:46', '2026-04-28 06:04:46'),
(182, 69, '1777437948900.webp', '2026-04-29 04:45:48', '2026-04-29 04:45:48'),
(183, 69, '1777437948911.webp', '2026-04-29 04:45:48', '2026-04-29 04:45:48'),
(184, 70, '1777869998853.jpg', '2026-05-04 04:46:38', '2026-05-04 04:46:38'),
(185, 70, '1777869998856.jpg', '2026-05-04 04:46:38', '2026-05-04 04:46:38'),
(186, 70, '1777869998863.jpg', '2026-05-04 04:46:38', '2026-05-04 04:46:38'),
(187, 71, '1777870374390.webp', '2026-05-04 04:52:54', '2026-05-04 04:52:54'),
(188, 71, '1777870374392.webp', '2026-05-04 04:52:54', '2026-05-04 04:52:54'),
(189, 72, '1777870640914.webp', '2026-05-04 04:57:20', '2026-05-04 04:57:20'),
(190, 72, '1777870640922.webp', '2026-05-04 04:57:20', '2026-05-04 04:57:20'),
(191, 72, '1777870640927.webp', '2026-05-04 04:57:20', '2026-05-04 04:57:20'),
(192, 73, '1777879126691.jpeg', '2026-05-04 07:18:46', '2026-05-04 07:18:46'),
(193, 74, '1777881029298.jpg', '2026-05-04 07:50:29', '2026-05-04 07:50:29'),
(194, 75, '1777881771315.jpg', '2026-05-04 08:02:51', '2026-05-04 08:02:51');

-- --------------------------------------------------------

--
-- Table structure for table `trendingproducts`
--

CREATE TABLE `trendingproducts` (
  `id` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `addedAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `trendingproducts`
--

INSERT INTO `trendingproducts` (`id`, `productId`, `addedAt`) VALUES
(14, 49, '2026-04-27 15:11:57'),
(16, 42, '2026-04-27 15:52:31'),
(17, 51, '2026-04-27 16:11:44'),
(20, 54, '2026-04-27 16:42:00'),
(22, 57, '2026-04-27 16:55:54'),
(24, 59, '2026-04-27 17:06:16'),
(26, 61, '2026-04-28 04:29:45'),
(29, 65, '2026-04-28 04:53:22'),
(33, 43, '2026-05-04 12:47:10');

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int(11) NOT NULL,
  `customerId` int(11) NOT NULL,
  `productId` int(11) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `customerId`, `productId`, `createdAt`, `updatedAt`) VALUES
(64, 16, 66, '2026-04-30 05:14:53', '2026-04-30 05:14:53'),
(65, 17, 44, '2026-05-04 06:21:51', '2026-05-04 06:21:51'),
(66, 17, 71, '2026-05-04 10:06:41', '2026-05-04 10:06:41'),
(72, 16, 45, '2026-05-22 05:06:01', '2026-05-22 05:06:01'),
(73, 16, 61, '2026-05-22 06:03:03', '2026-05-22 06:03:03'),
(74, 16, 47, '2026-05-25 05:10:10', '2026-05-25 05:10:10');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`),
  ADD UNIQUE KEY `email_59` (`email`),
  ADD UNIQUE KEY `email_60` (`email`),
  ADD UNIQUE KEY `email_61` (`email`);

--
-- Indexes for table `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `bestsellers`
--
ALTER TABLE `bestsellers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `productId` (`productId`);

--
-- Indexes for table `brands`
--
ALTER TABLE `brands`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD UNIQUE KEY `name_29` (`name`),
  ADD UNIQUE KEY `name_30` (`name`),
  ADD UNIQUE KEY `name_31` (`name`),
  ADD UNIQUE KEY `name_32` (`name`),
  ADD UNIQUE KEY `name_33` (`name`),
  ADD UNIQUE KEY `name_34` (`name`),
  ADD UNIQUE KEY `name_35` (`name`),
  ADD UNIQUE KEY `name_36` (`name`),
  ADD UNIQUE KEY `name_37` (`name`),
  ADD UNIQUE KEY `name_38` (`name`),
  ADD UNIQUE KEY `name_39` (`name`),
  ADD UNIQUE KEY `name_40` (`name`),
  ADD UNIQUE KEY `name_41` (`name`),
  ADD UNIQUE KEY `name_42` (`name`),
  ADD UNIQUE KEY `name_43` (`name`),
  ADD UNIQUE KEY `name_44` (`name`),
  ADD UNIQUE KEY `name_45` (`name`),
  ADD UNIQUE KEY `name_46` (`name`),
  ADD UNIQUE KEY `name_47` (`name`),
  ADD UNIQUE KEY `name_48` (`name`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `name_2` (`name`),
  ADD UNIQUE KEY `name_3` (`name`),
  ADD UNIQUE KEY `name_4` (`name`),
  ADD UNIQUE KEY `name_5` (`name`),
  ADD UNIQUE KEY `name_6` (`name`),
  ADD UNIQUE KEY `name_7` (`name`),
  ADD UNIQUE KEY `name_8` (`name`),
  ADD UNIQUE KEY `name_9` (`name`),
  ADD UNIQUE KEY `name_10` (`name`),
  ADD UNIQUE KEY `name_11` (`name`),
  ADD UNIQUE KEY `name_12` (`name`),
  ADD UNIQUE KEY `name_13` (`name`),
  ADD UNIQUE KEY `name_14` (`name`),
  ADD UNIQUE KEY `name_15` (`name`),
  ADD UNIQUE KEY `name_16` (`name`),
  ADD UNIQUE KEY `name_17` (`name`),
  ADD UNIQUE KEY `name_18` (`name`),
  ADD UNIQUE KEY `name_19` (`name`),
  ADD UNIQUE KEY `name_20` (`name`),
  ADD UNIQUE KEY `name_21` (`name`),
  ADD UNIQUE KEY `name_22` (`name`),
  ADD UNIQUE KEY `name_23` (`name`),
  ADD UNIQUE KEY `name_24` (`name`),
  ADD UNIQUE KEY `name_25` (`name`),
  ADD UNIQUE KEY `name_26` (`name`),
  ADD UNIQUE KEY `name_27` (`name`),
  ADD UNIQUE KEY `name_28` (`name`),
  ADD UNIQUE KEY `name_29` (`name`),
  ADD UNIQUE KEY `name_30` (`name`),
  ADD UNIQUE KEY `name_31` (`name`),
  ADD UNIQUE KEY `name_32` (`name`),
  ADD UNIQUE KEY `name_33` (`name`),
  ADD UNIQUE KEY `name_34` (`name`),
  ADD UNIQUE KEY `name_35` (`name`),
  ADD UNIQUE KEY `name_36` (`name`),
  ADD UNIQUE KEY `name_37` (`name`),
  ADD UNIQUE KEY `name_38` (`name`),
  ADD UNIQUE KEY `name_39` (`name`),
  ADD UNIQUE KEY `name_40` (`name`),
  ADD UNIQUE KEY `name_41` (`name`),
  ADD UNIQUE KEY `name_42` (`name`),
  ADD UNIQUE KEY `name_43` (`name`),
  ADD UNIQUE KEY `name_44` (`name`),
  ADD UNIQUE KEY `name_45` (`name`),
  ADD UNIQUE KEY `name_46` (`name`),
  ADD UNIQUE KEY `name_47` (`name`),
  ADD UNIQUE KEY `name_48` (`name`),
  ADD UNIQUE KEY `name_49` (`name`),
  ADD UNIQUE KEY `name_50` (`name`),
  ADD UNIQUE KEY `name_51` (`name`),
  ADD UNIQUE KEY `name_52` (`name`),
  ADD UNIQUE KEY `name_53` (`name`),
  ADD UNIQUE KEY `name_54` (`name`),
  ADD UNIQUE KEY `name_55` (`name`),
  ADD UNIQUE KEY `name_56` (`name`),
  ADD UNIQUE KEY `name_57` (`name`),
  ADD UNIQUE KEY `name_58` (`name`),
  ADD UNIQUE KEY `name_59` (`name`),
  ADD UNIQUE KEY `name_60` (`name`),
  ADD UNIQUE KEY `name_61` (`name`),
  ADD UNIQUE KEY `name_62` (`name`),
  ADD UNIQUE KEY `name_63` (`name`);

--
-- Indexes for table `contactmessages`
--
ALTER TABLE `contactmessages`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `coupons`
--
ALTER TABLE `coupons`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `code_2` (`code`),
  ADD UNIQUE KEY `code_3` (`code`),
  ADD UNIQUE KEY `code_4` (`code`),
  ADD UNIQUE KEY `code_5` (`code`),
  ADD UNIQUE KEY `code_6` (`code`),
  ADD UNIQUE KEY `code_7` (`code`),
  ADD UNIQUE KEY `code_8` (`code`),
  ADD UNIQUE KEY `code_9` (`code`),
  ADD UNIQUE KEY `code_10` (`code`),
  ADD UNIQUE KEY `code_11` (`code`),
  ADD UNIQUE KEY `code_12` (`code`),
  ADD UNIQUE KEY `code_13` (`code`),
  ADD UNIQUE KEY `code_14` (`code`),
  ADD UNIQUE KEY `code_15` (`code`),
  ADD UNIQUE KEY `code_16` (`code`),
  ADD UNIQUE KEY `code_17` (`code`),
  ADD UNIQUE KEY `code_18` (`code`),
  ADD UNIQUE KEY `code_19` (`code`),
  ADD UNIQUE KEY `code_20` (`code`),
  ADD UNIQUE KEY `code_21` (`code`),
  ADD UNIQUE KEY `code_22` (`code`),
  ADD UNIQUE KEY `code_23` (`code`),
  ADD UNIQUE KEY `code_24` (`code`),
  ADD UNIQUE KEY `code_25` (`code`),
  ADD UNIQUE KEY `code_26` (`code`),
  ADD UNIQUE KEY `code_27` (`code`),
  ADD UNIQUE KEY `code_28` (`code`),
  ADD UNIQUE KEY `code_29` (`code`),
  ADD UNIQUE KEY `code_30` (`code`),
  ADD UNIQUE KEY `code_31` (`code`),
  ADD UNIQUE KEY `code_32` (`code`),
  ADD UNIQUE KEY `code_33` (`code`),
  ADD UNIQUE KEY `code_34` (`code`),
  ADD UNIQUE KEY `code_35` (`code`),
  ADD UNIQUE KEY `code_36` (`code`),
  ADD UNIQUE KEY `code_37` (`code`),
  ADD UNIQUE KEY `code_38` (`code`),
  ADD UNIQUE KEY `code_39` (`code`),
  ADD UNIQUE KEY `code_40` (`code`),
  ADD UNIQUE KEY `code_41` (`code`),
  ADD UNIQUE KEY `code_42` (`code`),
  ADD UNIQUE KEY `code_43` (`code`),
  ADD UNIQUE KEY `code_44` (`code`),
  ADD UNIQUE KEY `code_45` (`code`),
  ADD UNIQUE KEY `code_46` (`code`),
  ADD UNIQUE KEY `code_47` (`code`),
  ADD UNIQUE KEY `code_48` (`code`);

--
-- Indexes for table `customeraddresses`
--
ALTER TABLE `customeraddresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customerId` (`customerId`);

--
-- Indexes for table `customers`
--
ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `email_2` (`email`),
  ADD UNIQUE KEY `email_3` (`email`),
  ADD UNIQUE KEY `email_4` (`email`),
  ADD UNIQUE KEY `email_5` (`email`),
  ADD UNIQUE KEY `email_6` (`email`),
  ADD UNIQUE KEY `email_7` (`email`),
  ADD UNIQUE KEY `email_8` (`email`),
  ADD UNIQUE KEY `email_9` (`email`),
  ADD UNIQUE KEY `email_10` (`email`),
  ADD UNIQUE KEY `email_11` (`email`),
  ADD UNIQUE KEY `email_12` (`email`),
  ADD UNIQUE KEY `email_13` (`email`),
  ADD UNIQUE KEY `email_14` (`email`),
  ADD UNIQUE KEY `email_15` (`email`),
  ADD UNIQUE KEY `email_16` (`email`),
  ADD UNIQUE KEY `email_17` (`email`),
  ADD UNIQUE KEY `email_18` (`email`),
  ADD UNIQUE KEY `email_19` (`email`),
  ADD UNIQUE KEY `email_20` (`email`),
  ADD UNIQUE KEY `email_21` (`email`),
  ADD UNIQUE KEY `email_22` (`email`),
  ADD UNIQUE KEY `email_23` (`email`),
  ADD UNIQUE KEY `email_24` (`email`),
  ADD UNIQUE KEY `email_25` (`email`),
  ADD UNIQUE KEY `email_26` (`email`),
  ADD UNIQUE KEY `email_27` (`email`),
  ADD UNIQUE KEY `email_28` (`email`),
  ADD UNIQUE KEY `email_29` (`email`),
  ADD UNIQUE KEY `email_30` (`email`),
  ADD UNIQUE KEY `email_31` (`email`),
  ADD UNIQUE KEY `email_32` (`email`),
  ADD UNIQUE KEY `email_33` (`email`),
  ADD UNIQUE KEY `email_34` (`email`),
  ADD UNIQUE KEY `email_35` (`email`),
  ADD UNIQUE KEY `email_36` (`email`),
  ADD UNIQUE KEY `email_37` (`email`),
  ADD UNIQUE KEY `email_38` (`email`),
  ADD UNIQUE KEY `email_39` (`email`),
  ADD UNIQUE KEY `email_40` (`email`),
  ADD UNIQUE KEY `email_41` (`email`),
  ADD UNIQUE KEY `email_42` (`email`),
  ADD UNIQUE KEY `email_43` (`email`),
  ADD UNIQUE KEY `email_44` (`email`),
  ADD UNIQUE KEY `email_45` (`email`),
  ADD UNIQUE KEY `email_46` (`email`),
  ADD UNIQUE KEY `email_47` (`email`),
  ADD UNIQUE KEY `email_48` (`email`),
  ADD UNIQUE KEY `email_49` (`email`),
  ADD UNIQUE KEY `email_50` (`email`),
  ADD UNIQUE KEY `email_51` (`email`),
  ADD UNIQUE KEY `email_52` (`email`),
  ADD UNIQUE KEY `email_53` (`email`),
  ADD UNIQUE KEY `email_54` (`email`),
  ADD UNIQUE KEY `email_55` (`email`),
  ADD UNIQUE KEY `email_56` (`email`),
  ADD UNIQUE KEY `email_57` (`email`),
  ADD UNIQUE KEY `email_58` (`email`),
  ADD UNIQUE KEY `email_59` (`email`),
  ADD UNIQUE KEY `email_60` (`email`),
  ADD UNIQUE KEY `email_61` (`email`),
  ADD UNIQUE KEY `email_62` (`email`);

--
-- Indexes for table `deals`
--
ALTER TABLE `deals`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `newarrivals`
--
ALTER TABLE `newarrivals`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `productId` (`productId`);

--
-- Indexes for table `offerbanners`
--
ALTER TABLE `offerbanners`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`orderId`),
  ADD KEY `customerId` (`customerId`),
  ADD KEY `fk_shipping` (`shippingAddressId`);

--
-- Indexes for table `orderslots`
--
ALTER TABLE `orderslots`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orderId` (`orderId`),
  ADD KEY `productId` (`productId`),
  ADD KEY `orderslots_variantId_fkey` (`variantId`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`),
  ADD KEY `categoryId` (`categoryId`);

--
-- Indexes for table `productvariants`
--
ALTER TABLE `productvariants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `productId` (`productId`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_review_per_order_per_customer` (`orderId`,`customerId`),
  ADD KEY `customerId` (`customerId`);

--
-- Indexes for table `shippingaddresses`
--
ALTER TABLE `shippingaddresses`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customerId` (`customerId`);

--
-- Indexes for table `shippingrates`
--
ALTER TABLE `shippingrates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `state` (`state`);

--
-- Indexes for table `subcategories`
--
ALTER TABLE `subcategories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `thumbnails`
--
ALTER TABLE `thumbnails`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `trendingproducts`
--
ALTER TABLE `trendingproducts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `productId` (`productId`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `customerId` (`customerId`),
  ADD KEY `productId` (`productId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `bestsellers`
--
ALTER TABLE `bestsellers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `brands`
--
ALTER TABLE `brands`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=222;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT for table `contactmessages`
--
ALTER TABLE `contactmessages`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `coupons`
--
ALTER TABLE `coupons`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `customeraddresses`
--
ALTER TABLE `customeraddresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `customers`
--
ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `deals`
--
ALTER TABLE `deals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT for table `newarrivals`
--
ALTER TABLE `newarrivals`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `offerbanners`
--
ALTER TABLE `offerbanners`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `orderslots`
--
ALTER TABLE `orderslots`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=76;

--
-- AUTO_INCREMENT for table `productvariants`
--
ALTER TABLE `productvariants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=467;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `shippingaddresses`
--
ALTER TABLE `shippingaddresses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `shippingrates`
--
ALTER TABLE `shippingrates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `subcategories`
--
ALTER TABLE `subcategories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `thumbnails`
--
ALTER TABLE `thumbnails`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=195;

--
-- AUTO_INCREMENT for table `trendingproducts`
--
ALTER TABLE `trendingproducts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bestsellers`
--
ALTER TABLE `bestsellers`
  ADD CONSTRAINT `bestsellers_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_10` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_11` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_12` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_13` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_14` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_3` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_4` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_5` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_6` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_7` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_8` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `bestsellers_ibfk_9` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `customeraddresses`
--
ALTER TABLE `customeraddresses`
  ADD CONSTRAINT `customeraddresses_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_10` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_11` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_12` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_13` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_14` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_15` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_16` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_17` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_18` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_19` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_2` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_20` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_21` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_22` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_23` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_24` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_25` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_26` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_27` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_28` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_29` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_3` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_30` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_31` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_32` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_33` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_34` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_35` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_36` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_37` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_38` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_39` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_4` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_40` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_41` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_42` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_43` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_44` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_45` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_46` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_47` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_48` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_49` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_5` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_50` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_51` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_52` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_53` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_54` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_55` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_56` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_57` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_58` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_59` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_6` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_60` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_61` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_62` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_7` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_8` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `customeraddresses_ibfk_9` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `newarrivals`
--
ALTER TABLE `newarrivals`
  ADD CONSTRAINT `newarrivals_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_10` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_11` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_12` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_13` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_14` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_3` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_4` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_5` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_6` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_7` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_8` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `newarrivals_ibfk_9` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `fk_shipping` FOREIGN KEY (`shippingAddressId`) REFERENCES `shippingaddresses` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_10` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_11` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_12` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_13` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_14` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_15` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_16` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_17` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_18` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_19` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_20` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_21` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_22` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_23` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_24` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_25` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_26` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_27` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_28` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_29` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_30` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_31` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_32` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_33` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_34` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_35` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_36` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_37` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_38` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_39` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_4` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_40` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_41` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_42` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_43` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_44` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_45` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_46` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_47` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_48` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_49` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_5` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_50` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_51` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_52` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_53` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_54` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_55` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_56` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_57` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_58` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_59` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_6` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_60` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_61` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_7` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_8` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `orders_ibfk_9` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `orderslots`
--
ALTER TABLE `orderslots`
  ADD CONSTRAINT `orderslots_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `orderslots_variantId_fkey` FOREIGN KEY (`variantId`) REFERENCES `productvariants` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_10` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_11` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_12` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_13` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_14` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_15` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_16` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_17` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_18` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_19` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_20` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_21` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_22` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_23` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_24` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_25` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_26` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_27` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_28` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_29` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_3` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_30` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_31` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_32` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_33` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_34` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_35` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_36` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_37` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_38` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_39` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_4` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_40` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_41` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_42` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_43` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_44` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_45` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_46` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_47` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_48` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_49` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_5` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_50` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_51` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_52` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_53` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_54` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_55` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_56` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_57` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_58` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_59` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_6` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_60` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_61` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_62` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_63` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_7` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_8` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `products_ibfk_9` FOREIGN KEY (`categoryId`) REFERENCES `categories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `productvariants`
--
ALTER TABLE `productvariants`
  ADD CONSTRAINT `productvariants_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_10` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_11` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_12` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_13` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_14` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_15` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_16` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_17` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_18` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_19` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_20` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_21` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_22` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_23` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_24` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_25` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_26` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_27` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_28` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_29` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_3` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_30` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_31` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_32` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_33` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_34` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_35` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_36` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_37` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_38` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_39` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_4` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_40` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_41` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_42` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_43` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_44` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_45` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_46` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_47` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_48` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_49` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_5` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_50` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_51` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_52` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_53` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_54` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_55` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_56` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_57` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_58` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_59` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_6` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_60` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_61` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_62` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_63` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_7` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_8` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `productvariants_ibfk_9` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `reviews_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `shippingaddresses`
--
ALTER TABLE `shippingaddresses`
  ADD CONSTRAINT `shippingaddresses_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_10` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_11` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_12` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_13` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_14` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_15` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_16` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_17` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_18` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_19` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_2` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_20` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_21` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_22` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_23` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_24` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_25` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_26` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_27` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_28` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_29` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_3` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_30` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_31` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_32` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_33` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_34` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_35` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_36` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_37` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_38` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_39` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_4` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_40` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_41` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_42` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_43` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_44` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_45` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_46` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_47` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_48` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_49` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_5` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_50` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_51` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_52` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_53` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_54` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_55` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_56` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_57` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_58` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_59` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_6` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_60` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_61` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_62` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_7` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_8` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `shippingaddresses_ibfk_9` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `trendingproducts`
--
ALTER TABLE `trendingproducts`
  ADD CONSTRAINT `trendingproducts_ibfk_1` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_10` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_11` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_12` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_13` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_14` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_3` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_4` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_5` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_6` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_7` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_8` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `trendingproducts_ibfk_9` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD CONSTRAINT `wishlists_ibfk_1` FOREIGN KEY (`customerId`) REFERENCES `customers` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wishlists_ibfk_2` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE NO ACTION ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
