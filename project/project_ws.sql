-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: May 03, 2024 at 12:41 PM
-- Server version: 10.4.27-MariaDB
-- PHP Version: 8.2.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project_ws`
--
CREATE OR REPLACE DATABASE `project_ws` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `project_ws`;

-- --------------------------------------------------------

--
-- Table structure for table `owner`
--

DROP TABLE IF EXISTS `owner`;
CREATE TABLE `owner` (
  `owner_id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `no_telepon` int(11) NOT NULL,
  `api_hit` int(11) NOT NULL,
  PRIMARY KEY (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `restaurant`
--

DROP TABLE IF EXISTS `restaurant`;
CREATE TABLE `restaurant` (
  `restaurant_id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_restaurant` varchar(255) NOT NULL,
  `alamat` varchar(255) NOT NULL,
  `deskripsi` text NOT NULL,
  `api_key` varchar(255),
  `owner_id` int(11) NOT NULL,
  PRIMARY KEY (`restaurant_id`),
  KEY owner_id (owner_id),
  FOREIGN KEY (owner_id) REFERENCES owner(owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `H_trans`
--

DROP TABLE IF EXISTS `H_trans`;
CREATE TABLE `H_trans` (
  `trans_id` int(11) NOT NULL AUTO_INCREMENT,
  `restaurant_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `kupon_id` int(11) NOT NULL,
  `status_transaksi` int(5) NOT NULL, -- 0 br dibuat, 1 payment sdh lunas, 2 dibuat resto, 3 sukses, 4 gagal
  `subtotal` int(11) NOT NULL,
  `grand_total` int(11) NOT NULL,
  PRIMARY KEY (`trans_id`),
  KEY restaurant_id (restaurant_id),
  KEY member_id (member_id),
  KEY kupon_id (kupon_id),
  FOREIGN KEY (`kupon_id`) REFERENCES `kupon`(`kupon_id`),
  FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`),
  FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `D_trans`
--

DROP TABLE IF EXISTS `D_trans`;
CREATE TABLE `D_trans` (
  `d_trans_id` int(11) NOT NULL AUTO_INCREMENT,
  `trans_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `quantitas` int(11) NOT NULL,
  `subtotal` int(11) NOT NULL,
  PRIMARY KEY (`d_trans_id`),
  KEY menu_id (menu_id),
  FOREIGN KEY (`menu_id`) REFERENCES `menu`(`menu_id`),
  FOREIGN KEY (`trans_id`) REFERENCES `H_trans`(`trans_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;




--
-- Table structure for table `item`
--

-- bahan dapur

DROP TABLE IF EXISTS `item`;
CREATE TABLE `item` (
  `item_id` int(11) NOT NULL AUTO_INCREMENT,
  `nama_item` varchar(255) NOT NULL,
  `restaurant_id` int(11) NOT NULL,
  -- `bahan` text NOT NULL,
  `quantitas` int(11) NOT NULL,
  `satuan` varchar(50) NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`item_id`),
  KEY restaurant_id (restaurant_id),
  FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `menu`;
CREATE TABLE `menu` (
  `menu_id` int(11) NOT NULL AUTO_INCREMENT,
  `restaurant_id` int(11) NOT NULL,
  `nama_menu` varchar(255) NOT NULL,
  `deskripsi_menu` text NOT NULL,
  `harga_menu` int(11) NOT NULL,
  PRIMARY KEY (`menu_id`),
  KEY restaurant_id (restaurant_id),
  FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `menu`
--

DROP TABLE IF EXISTS `topping`;
CREATE TABLE `topping` (
  `topping_id` int(11) NOT NULL AUTO_INCREMENT,
  `restaurant_id` int(11) NOT NULL,
  `nama_topping` varchar(255) NOT NULL,
  `deskripsi_topping` text NOT NULL,
  `harga_topping` int(11) NOT NULL,
  PRIMARY KEY (`topping_id`),
  KEY restaurant_id (restaurant_id),
  FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`restaurant_id`)
);

--
-- Table structure for table `menu_item`
--

DROP TABLE IF EXISTS `menu_item`;
CREATE TABLE `menu_item` (
  `restaurant_id` int(11) NOT NULL,
  `menu_id` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `needed_quantity` decimal(10,2) NOT NULL,
  KEY menu_id (menu_id),
  KEY item_id (item_id),
  KEY restaurant_id (restaurant_id),
  FOREIGN KEY (`menu_id`) REFERENCES `menu`(`menu_id`),
  FOREIGN KEY (`item_id`) REFERENCES `item`(`item_id`),
  FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `member`
--

DROP TABLE IF EXISTS `member`;
CREATE TABLE `member` (
  `member_id` int(11) NOT NULL AUTO_INCREMENT,
  `restaurant_id` int(11) NOT NULL,
  `username` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_member` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  PRIMARY KEY (`member_id`),
  KEY restaurant_id (restaurant_id),
  FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`restaurant_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `kupon`
--

DROP TABLE IF EXISTS `kupon`;
CREATE TABLE `kupon` (
  `kupon_id` int(11) NOT NULL AUTO_INCREMENT,
  `restaurant_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `potongan` int(11) NOT NULL,
  `masa_berlaku` DATE NOT NULL,
  PRIMARY KEY (`kupon_id`),
  KEY restaurant_id (restaurant_id),
  KEY member_id (member_id),
  FOREIGN KEY (`restaurant_id`) REFERENCES `restaurant`(`restaurant_id`),
  FOREIGN KEY (`member_id`) REFERENCES `member`(`member_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Table structure for table `review`
--

DROP TABLE IF EXISTS `review`;
CREATE TABLE `review` (
  `review_id` int(11) NOT NULL AUTO_INCREMENT,
  `owner_id` int(11) NOT NULL,
  `comment` text NOT NULL,
  `status` ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`review_id`),
  FOREIGN KEY (`owner_id`) REFERENCES `owner`(`owner_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `owner`
--
-- ALTER TABLE `owner`
--   ADD PRIMARY KEY (`owner_id`);

-- --
-- -- Indexes for table `restaurant`
-- --
-- ALTER TABLE `restaurant`
--   ADD PRIMARY KEY (`restaurant_id`);

-- --
-- -- AUTO_INCREMENT for dumped tables
-- --

-- --
-- -- AUTO_INCREMENT for table `owner`
-- --
-- ALTER TABLE `owner`
--   MODIFY `owner_id` int(11) NOT NULL AUTO_INCREMENT;

-- --
-- -- AUTO_INCREMENT for table `restaurant`
-- --
-- ALTER TABLE `restaurant`
--   MODIFY `restaurant_id` int(11) NOT NULL AUTO_INCREMENT;
-- COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
