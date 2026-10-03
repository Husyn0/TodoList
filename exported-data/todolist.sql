-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 02, 2026 at 10:40 PM
-- Server version: 8.0.46-0ubuntu0.24.04.4
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `todolist`
--

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `total_jobs` int NOT NULL,
  `pending_jobs` int NOT NULL,
  `failed_jobs` int NOT NULL,
  `failed_job_ids` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `options` mediumtext COLLATE utf8mb4_unicode_ci,
  `cancelled_at` int DEFAULT NULL,
  `created_at` int NOT NULL,
  `finished_at` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(5, '0001_01_01_000000_create_users_table', 1),
(6, '0001_01_01_000001_create_cache_table', 1),
(7, '0001_01_01_000002_create_jobs_table', 1),
(8, '2026_09_29_085154_create_personal_access_tokens_table', 1),
(9, 'create_tasks_table', 2);

-- --------------------------------------------------------

--
-- Table structure for table `password_reset_tokens`
--

CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 2, 'auth', '45ed5932891e3ff16642cb0a70837a0309580bddf6fc7e172ba7c6f447af91d2', '[\"*\"]', NULL, NULL, '2026-09-29 08:29:14', '2026-09-29 08:29:14'),
(3, 'App\\Models\\User', 5, 'auth', '362627823733be08782c4ffc0ac5cd651ff74d9e8a355e1bbd0908311efe3a0d', '[\"*\"]', NULL, NULL, '2026-09-29 08:29:37', '2026-09-29 08:29:37'),
(5, 'App\\Models\\User', 2, 'auth', '68d17b16eb1793fbab6ebf04090a179eee0c94842e5825030a6feeb26599c109', '[\"*\"]', '2026-09-29 08:33:36', NULL, '2026-09-29 08:33:36', '2026-09-29 08:33:36'),
(9, 'App\\Models\\User', 7, 'auth', '8db011fe1175d7cf072604adea5e3c0f9f8c715e24974b04432ed4fd2e2edaf7', '[\"*\"]', NULL, NULL, '2026-09-29 08:41:23', '2026-09-29 08:41:23'),
(12, 'App\\Models\\User', 8, 'auth', 'cc08cab863953d992a537864f0781e1ff3527d65e9e2c5f25a49690769741bd7', '[\"*\"]', '2026-09-29 08:51:50', NULL, '2026-09-29 08:51:50', '2026-09-29 08:51:50');

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tasks`
--

CREATE TABLE `tasks` (
  `id` bigint UNSIGNED NOT NULL,
  `user_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `due_date` date NOT NULL,
  `priority` enum('low','medium','high') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `status` enum('pending','in_progress','done') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `position` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `tasks`
--

INSERT INTO `tasks` (`id`, `user_id`, `title`, `description`, `due_date`, `priority`, `status`, `position`, `created_at`, `updated_at`) VALUES
(4, 2, 'frw', 'rf', '2026-10-01', 'medium', 'done', 0, '2026-09-29 08:35:35', '2026-09-29 17:08:38'),
(5, 2, 'hbhk', 'hbhk', '2026-09-27', 'medium', 'done', 0, '2026-09-29 08:35:44', '2026-10-02 17:15:33'),
(7, 2, 'hbjg', 'gjf', '2026-10-03', 'medium', 'done', 0, '2026-09-29 08:36:01', '2026-10-02 10:43:47'),
(8, 2, 'vhgvgv', 'jbhvjhcfh', '2026-10-01', 'medium', 'in_progress', 0, '2026-09-29 08:36:10', '2026-10-02 11:25:15'),
(9, 2, 'jkhgyjh', 'nbmv', '2026-09-28', 'medium', 'done', 0, '2026-09-29 08:36:20', '2026-10-02 11:25:07'),
(11, 2, 'Write project spec', 'Draft the initial requirements doc', '2026-10-02', 'high', 'pending', 0, '2026-09-29 08:43:38', '2026-10-02 11:25:21'),
(12, 2, 'test', 'test sat', '2026-10-03', 'medium', 'done', 0, '2026-09-29 17:06:42', '2026-10-02 11:22:43'),
(13, 2, 'test1', 'test1', '2026-10-02', 'medium', 'done', 0, '2026-09-29 17:07:22', '2026-09-29 17:07:22'),
(14, 2, 'gugv', 'bvjghg', '2026-10-01', 'medium', 'pending', 0, '2026-09-29 17:07:45', '2026-09-29 17:07:45'),
(15, 2, 'd', 'd', '2026-10-02', 'medium', 'done', 0, '2026-09-29 17:08:08', '2026-10-02 17:04:22'),
(16, 2, 'dew', 'ew', '2026-10-01', 'medium', 'done', 0, '2026-09-29 17:09:07', '2026-09-29 17:09:07'),
(17, 2, 'mon', 'monday', '2026-10-01', 'medium', 'pending', 0, '2026-09-29 17:11:17', '2026-10-02 17:29:20'),
(20, 2, 'TodoList', 'complete todolist web app', '2026-09-30', 'high', 'in_progress', 0, '2026-09-29 17:14:16', '2026-10-02 11:25:04'),
(21, 2, 'Rechart', 'put radar chart in dashboard from rechart', '2026-09-29', 'medium', 'done', 0, '2026-09-29 17:15:00', '2026-10-02 11:23:59'),
(22, 2, 'backend', 'create laravel backend for todolist', '2026-09-29', 'medium', 'done', 0, '2026-09-29 17:15:46', '2026-10-02 11:24:36'),
(23, 2, 'frontend', 'create frontend for todolist', '2026-10-02', 'medium', 'done', 0, '2026-09-29 17:16:49', '2026-10-02 10:43:36'),
(24, 2, 'Automotors backend', 'finish testing Memory management feature', '2026-09-29', 'medium', 'done', 0, '2026-09-29 17:18:09', '2026-10-02 11:24:33'),
(25, 2, 'Automotors', 'Add sanctum=>laravel=>cookies', '2026-09-28', 'low', 'pending', 0, '2026-09-29 17:19:53', '2026-10-02 11:24:59'),
(26, 2, 'Automotors', 'Reset password feature', '2026-09-30', 'low', 'pending', 0, '2026-09-29 17:20:39', '2026-10-02 11:25:00'),
(27, 2, 'Automotors', 'Verify email', '2026-09-29', 'low', 'pending', 0, '2026-09-29 17:22:16', '2026-09-29 17:22:16'),
(28, 2, 'Exercise', 'Do exercise in morning and get rest the remaining of day', '2026-10-03', 'high', 'pending', 0, '2026-09-29 17:26:13', '2026-09-29 17:26:13'),
(29, 2, 'test', 'test btn position', '2026-09-27', 'high', 'done', 0, '2026-10-02 10:40:21', '2026-10-02 17:04:33'),
(31, 2, 'jvghc', 't', '2026-09-30', 'medium', 'pending', 0, '2026-10-02 10:43:03', '2026-10-02 11:24:57'),
(32, 2, 'tydf', 'jvgf', '2026-09-28', 'medium', 'pending', 0, '2026-10-02 10:43:09', '2026-10-02 11:24:55'),
(33, 2, 'bnv', 'hvchgxdz', '2026-09-30', 'medium', 'pending', 0, '2026-10-02 10:43:23', '2026-10-02 11:24:53'),
(34, 2, 'ljnjgvcf', 'gvh', '2026-09-28', 'medium', 'done', 0, '2026-10-02 11:23:20', '2026-10-02 11:24:52'),
(35, 2, 'ttfhdfd', 'fthfgdrtdrd', '2026-09-27', 'high', 'done', 0, '2026-10-02 16:54:21', '2026-10-02 17:15:44');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `theme` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'light',
  `timezone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UTC',
  `week_start` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monday'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `email_verified_at`, `password`, `remember_token`, `created_at`, `updated_at`, `theme`, `timezone`, `week_start`) VALUES
(1, 'husyn', 'mr.hussein.ceng@gmail.com', NULL, '$2y$12$ZmpBYVxv9hMKTEF/xHKqZe3gAAmDKbeZaFuXWg0oUMFR0zZWWLERG', NULL, '2026-09-29 07:09:23', '2026-09-29 07:09:23', 'light', 'UTC', 'monday'),
(2, 'Husyn0', 'test@example.com', NULL, '$2y$12$yZMj/GAjund/mfNVDASefOQ.95wMLYESq3icJajuO3h/n1yV6dBJW', NULL, '2026-09-29 07:41:52', '2026-10-02 18:07:29', 'dark', 'Asia/Beirut', 'monday'),
(3, 'Test User', 'test_1790680534@example.com', NULL, '$2y$12$4tQUGE7PDcpf/qtyYH/lpOGo36nMSpPsGuYRFqxo3hbhcIc2lo/mK', NULL, '2026-09-29 08:15:35', '2026-09-29 08:15:35', 'light', 'UTC', 'monday'),
(4, 'Test User', 'test2@example.com', NULL, '$2y$12$QZ0fo6B9gkago7R3yyze7OoSCp3SA9Z926is6Tu3koxUPpo9cDHdS', NULL, '2026-09-29 08:22:04', '2026-09-29 08:22:04', 'light', 'UTC', 'monday'),
(5, 'Test User', 'test_1790681376@example.com', NULL, '$2y$12$3NYpJKlvopHvS97r17ZMeegVfDvueNVmA55JbVTgwM.BmSJTSiHK.', NULL, '2026-09-29 08:29:36', '2026-09-29 08:29:37', 'dark', 'UTC', 'sunday'),
(6, 'test', 'test@test.com', NULL, '$2y$12$GyGTONEqpR1WNH2GasvZZu.BsaHbcX5PPCni4gbe3h0RZVrdr9u2.', NULL, '2026-09-29 08:40:13', '2026-09-29 08:40:13', 'light', 'UTC', 'monday'),
(7, 'Test User', 'testk@example.com', NULL, '$2y$12$Ebin.NN7rLlQGsFy9HRiieEm9jsl7rbIjAG28XV08n34IXEEgcm4q', NULL, '2026-09-29 08:41:23', '2026-09-29 08:41:23', 'light', 'UTC', 'monday'),
(8, 'Other', 'other@example.com', NULL, '$2y$12$ScpWCl1Ea40g90rzzp5S1.kDCLvUyXufLkg7prkGUQ0BAgmXB4py2', NULL, '2026-09-29 08:51:50', '2026-09-29 08:51:50', 'light', 'UTC', 'monday');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  ADD KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `password_reset_tokens`
--
ALTER TABLE `password_reset_tokens`
  ADD PRIMARY KEY (`email`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  ADD KEY `personal_access_tokens_expires_at_index` (`expires_at`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sessions_user_id_index` (`user_id`),
  ADD KEY `sessions_last_activity_index` (`last_activity`);

--
-- Indexes for table `tasks`
--
ALTER TABLE `tasks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tasks_user_id_due_date_index` (`user_id`,`due_date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_email_unique` (`email`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `tasks`
--
ALTER TABLE `tasks`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `tasks`
--
ALTER TABLE `tasks`
  ADD CONSTRAINT `tasks_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
