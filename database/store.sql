-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 19 août 2025 à 08:14
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `store`
--

-- --------------------------------------------------------

--
-- Structure de la table `categorie`
--

CREATE TABLE `categorie` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `name_ar` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `created_at`, `updated_at`) VALUES
(2, 'Laptops', '2025-08-17 13:04:07', '2025-08-17 13:04:07');

-- --------------------------------------------------------

--
-- Structure de la table `clients`
--

CREATE TABLE `clients` (
  `id` int(11) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `city` varchar(100) NOT NULL,
  `address` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `email` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(255) NOT NULL,
  `status` enum('en_attente','confirme','declined','en_cours','livre','retour') DEFAULT 'en_attente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `code_promo` varchar(100) DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL,
  `quantity` int(11) DEFAULT 1,
  `category_id` int(11) DEFAULT NULL,
  `original_price` decimal(10,2) DEFAULT NULL,
  `final_price` decimal(10,2) DEFAULT NULL,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `promo_discount` decimal(10,2) DEFAULT 0.00,
  `virement_discount` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Structure de la table `payment_methods`
--

CREATE TABLE `payment_methods` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `name_ar` varchar(100) NOT NULL,
  `name_en` varchar(100) NOT NULL,
  `name_fr` varchar(100) NOT NULL,
  `name_es` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `description_ar` varchar(255) DEFAULT NULL,
  `description_en` varchar(255) DEFAULT NULL,
  `description_fr` varchar(255) DEFAULT NULL,
  `description_es` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `discount_amount` decimal(10,2) DEFAULT 0.00,
  `discount_type` enum('fixed','percentage') DEFAULT 'fixed',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `payment_methods`
--

INSERT INTO `payment_methods` (`id`, `name`, `name_ar`, `name_en`, `name_fr`, `name_es`, `description`, `description_ar`, `description_en`, `description_fr`, `description_es`, `is_active`, `discount_amount`, `discount_type`, `created_at`) VALUES
(1, 'Cashplus', 'كاش بلوس', 'Cashplus', 'Cashplus', 'Cashplus', 'RIB: 123 456 789 000 000 000 12', 'RIB: 123 456 789 000 000 000 12', 'RIB: 123 456 789 000 000 000 12', 'RIB: 123 456 789 000 000 000 12', 'RIB: 123 456 789 000 000 000 12', 1, 0.00, 'fixed', '2025-08-18 17:47:37'),
(2, 'Virement bancaire', 'تحويل بنكي', 'Bank Transfer', 'Virement bancaire', 'Transferencia bancaria', 'RIB: 987 654 321 000 000 000 34', 'RIB: 987 654 321 000 000 000 34', 'RIB: 987 654 321 000 000 000 34', 'RIB: 987 654 321 000 000 000 34', 'RIB: 987 654 321 000 000 000 34', 1, 100.00, 'fixed', '2025-08-18 17:47:37'),
(3, 'Retrait au Magasin', 'استلام من المتجر', 'Store Pickup', 'Retrait au Magasin', 'Recogida en tienda', 'استلام من المتجر', 'استلام من المتجر', 'Store pickup', 'Retrait au magasin', 'Recogida en tienda', 1, 0.00, 'fixed', '2025-08-18 17:47:37'),
(4, 'Cash on Delivery', 'الدفع عند الاستلام', 'Cash on Delivery', 'Paiement à la livraison', 'Pago contra entrega', 'الدفع نقداً عند التوصيل', 'الدفع نقداً عند التوصيل', 'Pay cash upon delivery', 'Payer en espèces à la livraison', 'Pagar en efectivo al entregar', 1, 0.00, 'fixed', '2025-08-18 17:47:37');

-- --------------------------------------------------------

--
-- Structure de la table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `ram` varchar(50) DEFAULT NULL,
  `storage` varchar(50) DEFAULT NULL,
  `screen` varchar(100) DEFAULT NULL,
  `graphics` varchar(100) DEFAULT NULL,
  `os` varchar(50) DEFAULT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `new_price` decimal(10,2) NOT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `processor` varchar(100) DEFAULT NULL,
  `main_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`main_images`)),
  `optional_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`optional_images`)),
  `category_id` int(11) DEFAULT NULL,
  `promo_code` varchar(100) DEFAULT NULL,
  `promo_type` enum('percentage','fixed') DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `products`
--

INSERT INTO `products` (`id`, `name`, `ram`, `storage`, `screen`, `graphics`, `os`, `old_price`, `new_price`, `images`, `description`, `created_at`, `updated_at`, `processor`, `main_images`, `optional_images`, `category_id`, `promo_code`, `promo_type`) VALUES
(4, 'HP Elitebook 840 G5', '16GB', '256GB SSD', NULL, 'Intel UHD Graphics 620', 'Windows 11', 2599.00, 2399.00, '[\"/uploads/1755437991103-196569311.png\",\"/uploads/1755437991129-129012258.jpg\",\"/uploads/1755437991129-422970831.jpg\",\"/uploads/1755437991129-703878638.jpg\",\"/uploads/1755437991130-684606846.jpg\",\"/uploads/1755437991132-666907870.jpg\"]', 'If you’re looking for a laptop that can keep up with your demanding work schedule, then look no further than the HP Elitebook 840 g5. This laptop is a game-changer, with its impressive i5 processor, 8GB of RAM, and 256GB of storage.\r\n\r\nThe Elitebook 840 g5 is the perfect tool for professionals who need a reliable device to get the job done. Whether you’re running multiple programs at once, creating complex spreadsheets, or designing graphics, this laptop can handle it all with ease.', '2025-08-17 11:49:11', '2025-08-17 13:39:51', 'i5 8250u ', '[\"/uploads/1755437991103-196569311.png\"]', '[\"/uploads/1755437991129-129012258.jpg\",\"/uploads/1755437991129-422970831.jpg\",\"/uploads/1755437991129-703878638.jpg\",\"/uploads/1755437991130-684606846.jpg\",\"/uploads/1755437991132-666907870.jpg\"]', NULL, NULL, NULL),
(5, 'HP Elitebook 840 G6', '16GB', '256GB SSD', NULL, 'Intel UHD Graphics 620', 'Windows 11', 3299.00, 2899.00, '[\"/uploads/1755437967225-151293338.png\",\"/uploads/1755437967251-817500473.jpg\",\"/uploads/1755437967251-380149911.jpg\",\"/uploads/1755437967252-121564827.jpg\",\"/uploads/1755437967252-528342959.jpg\",\"/uploads/1755437967254-317703579.jpg\"]', 'Le HP EliteBook 840 G6 est un ordinateur portable haut de gamme conçu pour les professionnels. Il arbore un design élégant et professionnel avec un châssis léger et fin. L\'écran de 14 pouces offre une résolution Full HD ou supérieure, et peut être doté d\'une fonctionnalité tactile. Avec des performances puissantes grâce à son processeur Intel Core i5 ou i7 et jusqu\'à 32 Go de RAM, cet ordinateur portable offre une expérience fluide et efficace.', '2025-08-17 11:51:00', '2025-08-17 13:39:27', 'i5-8365U', '[\"/uploads/1755437967225-151293338.png\"]', '[\"/uploads/1755437967251-817500473.jpg\",\"/uploads/1755437967251-380149911.jpg\",\"/uploads/1755437967252-121564827.jpg\",\"/uploads/1755437967252-528342959.jpg\",\"/uploads/1755437967254-317703579.jpg\"]', NULL, NULL, NULL),
(6, 'HP Elitebook 840 G7', '16GB', '256GB SSD', NULL, 'Intel UHD Graphics 620', 'Windows 11', 3699.00, 3299.00, '[\"/uploads/1755438018355-351456566.png\",\"/uploads/1755438018382-643720072.jpg\",\"/uploads/1755438018383-664632599.jpg\",\"/uploads/1755438018383-505154796.jpg\",\"/uploads/1755438018383-262848783.jpg\"]', '1J5Y0EA PC Portable - HP Elitebook 840 G7 Processeur Intel Core i5-10310U Disque dur 1To SSD, RAM 16 Go DDR4 ,Reseau WIFI et bluetooth, Lecteur d\'empreintes digitales, Windows 10 Pro, Ecran 14 pouces LED FHD, GARANTIE 3 Mois à 4080,00 MAD Disponible et pas cher - Livraison gratuite – Access computer est le spécialiste de la marque HP au Maroc', '2025-08-17 11:52:35', '2025-08-17 13:40:18', 'i5-10310U', '[\"/uploads/1755438018355-351456566.png\"]', '[\"/uploads/1755438018382-643720072.jpg\",\"/uploads/1755438018383-664632599.jpg\",\"/uploads/1755438018383-505154796.jpg\",\"/uploads/1755438018383-262848783.jpg\"]', NULL, NULL, NULL),
(7, 'HP Elitebook 840 G8', '16GB', '256GB SSD', NULL, 'Intel UHD Graphics 620', 'Windows 11', 4899.00, 4499.00, '[\"/uploads/1755437860168-639136134.png\",\"/uploads/1755437860210-966312933.jpg\",\"/uploads/1755437860211-220676830.jpg\",\"/uploads/1755437860212-840072405.jpg\",\"/uploads/1755437860213-544957566.jpg\",\"/uploads/1755437860218-838953440.jpg\"]', 'HP EliteBook 840 G8 (336M4EA) (336M4EA#ABF) sur Access computer, n°1 du high-tech. Intel Core i5-1135G7 16 Go SSD 512 Go 14\" LED Full HD Wi-Fi AX/Bluetooth Webcam Windows 10 Professionnel 64 bits.', '2025-08-17 11:53:50', '2025-08-17 13:37:40', 'i5-1145G7', '[\"/uploads/1755437860168-639136134.png\"]', '[\"/uploads/1755437860210-966312933.jpg\",\"/uploads/1755437860211-220676830.jpg\",\"/uploads/1755437860212-840072405.jpg\",\"/uploads/1755437860213-544957566.jpg\",\"/uploads/1755437860218-838953440.jpg\"]', NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `promo_codes`
--

CREATE TABLE `promo_codes` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) NOT NULL,
  `type` enum('percentage','fixed') NOT NULL,
  `value` decimal(10,2) NOT NULL,
  `applies_to` enum('all','specific') DEFAULT 'all',
  `product_ids` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`product_ids`)),
  `commercial_name` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `promo_codes`
--

INSERT INTO `promo_codes` (`id`, `name`, `code`, `type`, `value`, `applies_to`, `product_ids`, `commercial_name`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'az', '789', 'percentage', 5.00, 'all', '[]', 'sat', 1, '2025-08-19 06:07:21', '2025-08-19 06:07:21');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('product_manager','gestion_commandes','super_admin') NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'super_admin', '2025-08-16 09:41:29'),
(2, 'product_manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'product_manager', '2025-08-16 09:41:29'),
(3, 'order_manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'gestion_commandes', '2025-08-16 09:41:29'),
(4, 'products@example.com', '$2a$10$y9KccQU/KMKHDraBv60E2eXOHc1jJXs55NBH5yKo/xJOnu5mukDvS', 'product_manager', '2025-08-16 09:42:12'),
(5, 'orders@example.com', '$2a$10$oQlHIkvNTE8yOv8V2LI/sepz4F6x/SWF.9ZxKOC/Kv.VTC2qK//R6', 'gestion_commandes', '2025-08-16 09:42:13'),
(6, 'admin@example.com', '$2a$10$iK8T16AB8RIEjFg0hKnLmOg3XTefl9U63K3uQBQMdpbItQr3atKrK', 'super_admin', '2025-08-16 09:42:13');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `categorie`
--
ALTER TABLE `categorie`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Index pour la table `clients`
--
ALTER TABLE `clients`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Index pour la table `payment_methods`
--
ALTER TABLE `payment_methods`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `promo_codes`
--
ALTER TABLE `promo_codes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT pour la table `payment_methods`
--
ALTER TABLE `payment_methods`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT pour la table `promo_codes`
--
ALTER TABLE `promo_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
