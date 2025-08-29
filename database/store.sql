-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : jeu. 21 août 2025 à 03:05
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
-- Structure de la table `accessoires`
--

CREATE TABLE `accessoires` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `old_price` decimal(10,2) DEFAULT NULL,
  `new_price` decimal(10,2) NOT NULL,
  `description` text DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `main_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`main_images`)),
  `optional_images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`optional_images`)),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `accessoires`
--

INSERT INTO `accessoires` (`id`, `name`, `old_price`, `new_price`, `description`, `category_id`, `images`, `main_images`, `optional_images`, `created_at`, `updated_at`) VALUES
(1, 'Logitech G102 LightSync RGB (Noir)', 249.00, 199.00, 'Souris filaire pour gamer - droitier - capteur optique 8000 dpi - 6 boutons programmables - rétro-éclairage LightSync RGB', 3, '[\"/uploads/1755736346014-728577046.jpg\"]', '[\"/uploads/1755736346014-728577046.jpg\"]', '[]', '2025-08-20 21:21:07', '2025-08-21 00:32:26');

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
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `slug` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `categories`
--

INSERT INTO `categories` (`id`, `name`, `created_at`, `updated_at`, `slug`) VALUES
(2, 'Laptops', '2025-08-17 13:04:07', '2025-08-20 22:08:31', 'laptops'),
(3, 'Accesoires', '2025-08-20 21:14:10', '2025-08-20 22:08:31', 'accessoires');

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

--
-- Déchargement des données de la table `clients`
--

INSERT INTO `clients` (`id`, `full_name`, `phone`, `city`, `address`, `created_at`, `email`) VALUES
(13, 'Khattabi Abdelkrim', '0523408787', 'Ben AHmed', '74 derb lkora', '2025-08-20 16:26:58', 'godjeksatou@gmail.com'),
(14, 'Khattabi Abdelkrim', '0523408787', 'Ben AHmed', '74 derb lkora', '2025-08-20 19:19:18', 'godjekdoon@gmail.com'),
(15, 'Ibouha amine', '06587598', 'Agadir', '48498efdsg', '2025-08-20 19:52:00', 'ibouhaamin@gmail.com'),
(16, 'Khattabi Abdelkrim', '0523408787', 'Ben AHmed', '74 derb lkora', '2025-08-20 21:52:26', 'godjekdoon@gmail.com'),
(17, 'Nabil nabil', '06578459', 'Casablanca', '21 rue el houda lot elmouahidine', '2025-08-20 23:07:53', 'nabilelasri11@gmail.com'),
(18, 'Test', '0656569595', 'Ben Ahmed', 'Derb si hamou Lot Almouahidin\nrue Alhouda n 21', '2025-08-20 23:12:20', 'godjekdoon@gmail.com');

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
  `virement_discount` decimal(10,2) DEFAULT 0.00,
  `review_token` varchar(64) DEFAULT NULL,
  `review_used` tinyint(1) DEFAULT 0,
  `currency` varchar(10) DEFAULT 'DH'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `orders`
--

INSERT INTO `orders` (`id`, `client_id`, `product_id`, `product_name`, `status`, `created_at`, `updated_at`, `code_promo`, `payment_method`, `quantity`, `category_id`, `original_price`, `final_price`, `discount_amount`, `promo_discount`, `virement_discount`, `review_token`, `review_used`, `currency`) VALUES
(14, 13, 5, 'HP Elitebook 840 G6', 'livre', '2025-08-20 16:26:58', '2025-08-20 16:35:01', NULL, 'Retrait au Magasin', 1, NULL, 2899.00, 2899.00, 0.00, 0.00, 0.00, NULL, 0, 'DH'),
(15, 14, 5, 'HP Elitebook 840 G6', 'en_attente', '2025-08-20 19:19:18', '2025-08-20 19:19:18', NULL, 'Cashplus', 1, NULL, 2899.00, 2899.00, 0.00, 0.00, 0.00, NULL, 0, 'DH'),
(16, 15, 5, 'HP Elitebook 840 G6', 'livre', '2025-08-20 19:52:00', '2025-08-20 19:52:53', NULL, 'Cashplus', 1, NULL, 2899.00, 2899.00, 0.00, 0.00, 0.00, NULL, 0, 'DH'),
(17, 16, 5, 'HP Elitebook 840 G6', 'livre', '2025-08-20 21:52:26', '2025-08-20 22:12:24', NULL, 'Cash on Delivery', 1, NULL, 2899.00, 2899.00, 0.00, 0.00, 0.00, 'e9ee1c2161fd7bbd11901f2557a48214ab48b6d46f6a9252024dd40699457f30', 1, 'DH'),
(18, 17, 5, 'HP Elitebook 840 G6', 'livre', '2025-08-20 23:07:53', '2025-08-20 23:10:48', NULL, 'Retrait au Magasin', 1, NULL, 2899.00, 2899.00, 0.00, 0.00, 0.00, '91119d631c7a0c7f5e75814b0de22e27dc0f68e8e5efc6b9e8f757a42a67dd39', 0, 'DH'),
(19, 18, 5, 'HP Elitebook 840 G6', 'livre', '2025-08-20 23:12:20', '2025-08-20 23:13:40', NULL, 'Cash on Delivery', 1, NULL, 2899.00, 2899.00, 0.00, 0.00, 0.00, '2e4319c7d1195692868a526534a397f1e0ea514d67c8b50a8ef79600acea7688', 1, 'DH');

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
(4, 'HP Elitebook 840 G5', '16GB', '256GB SSD', NULL, 'Intel UHD Graphics 620', 'Windows 11', 2599.00, 2399.00, '[]', 'If you’re looking for a laptop that can keep up with your demanding work schedule, then look no further than the HP Elitebook 840 g5. This laptop is a game-changer, with its impressive i5 processor, 8GB of RAM, and 256GB of storage.\r\n\r\nThe Elitebook 840 g5 is the perfect tool for professionals who need a reliable device to get the job done. Whether you’re running multiple programs at once, creating complex spreadsheets, or designing graphics, this laptop can handle it all with ease.', '2025-08-17 11:49:11', '2025-08-21 00:27:48', 'i5 8250u ', '[]', '[]', 2, NULL, NULL),
(5, 'HP Elitebook 840 G6', '16GB', '256GB SSD', NULL, 'Intel UHD Graphics 620', 'Windows 11', 3299.00, 2899.00, '[]', 'Le HP EliteBook 840 G6 est un ordinateur portable haut de gamme conçu pour les professionnels. Il arbore un design élégant et professionnel avec un châssis léger et fin. L\'écran de 14 pouces offre une résolution Full HD ou supérieure, et peut être doté d\'une fonctionnalité tactile. Avec des performances puissantes grâce à son processeur Intel Core i5 ou i7 et jusqu\'à 32 Go de RAM, cet ordinateur portable offre une expérience fluide et efficace.', '2025-08-17 11:51:00', '2025-08-21 00:12:42', 'i5-8365U', '[]', '[]', NULL, NULL, NULL),
(6, 'HP Elitebook 840 G7', '16GB', '256GB SSD', NULL, 'Intel UHD Graphics 620', 'Windows 11', 3699.00, 3299.00, '[]', '1J5Y0EA PC Portable - HP Elitebook 840 G7 Processeur Intel Core i5-10310U Disque dur 1To SSD, RAM 16 Go DDR4 ,Reseau WIFI et bluetooth, Lecteur d\'empreintes digitales, Windows 10 Pro, Ecran 14 pouces LED FHD, GARANTIE 3 Mois à 4080,00 MAD Disponible et pas cher - Livraison gratuite – Access computer est le spécialiste de la marque HP au Maroc', '2025-08-17 11:52:35', '2025-08-21 00:12:33', 'i5-10310U', '[]', '[]', NULL, NULL, NULL),
(7, 'HP Elitebook 840 G8', '16GB', '256GB SSD', NULL, 'Intel UHD Graphics 620', 'Windows 11', 4899.00, 4499.00, '[]', 'HP EliteBook 840 G8 (336M4EA) (336M4EA#ABF) sur Access computer, n°1 du high-tech. Intel Core i5-1135G7 16 Go SSD 512 Go 14\" LED Full HD Wi-Fi AX/Bluetooth Webcam Windows 10 Professionnel 64 bits.', '2025-08-17 11:53:50', '2025-08-21 00:12:22', 'i5-1145G7', '[]', '[]', NULL, NULL, NULL);

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

-- --------------------------------------------------------

--
-- Structure de la table `reviews`
--

CREATE TABLE `reviews` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `client_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL,
  `photos` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`photos`)),
  `name` varchar(255) DEFAULT NULL,
  `comment` text DEFAULT NULL,
  `approved` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

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
-- Index pour la table `accessoires`
--
ALTER TABLE `accessoires`
  ADD PRIMARY KEY (`id`);

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
-- Index pour la table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`);

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
-- AUTO_INCREMENT pour la table `accessoires`
--
ALTER TABLE `accessoires`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT pour la table `categorie`
--
ALTER TABLE `categorie`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT pour la table `clients`
--
ALTER TABLE `clients`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT pour la table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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

-- --------------------------------------------------------

--
-- Structure de la table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `admin-page` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Déchargement des données de la table `settings`
--

INSERT INTO `settings` (`id`, `admin-page`) VALUES
(1, 'admin');

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
