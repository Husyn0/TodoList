-- ============================================================
--  todolist.sql  —  Clean rebuild
--  Union of: original todolist.sql + Laravel migrations
--  Adds: users.week_end, tasks.period
--  Rebuilds: migrations table (so artisan migrate:status works)
-- ============================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

DROP DATABASE IF EXISTS `todolist`;
CREATE DATABASE `todolist`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE `todolist`;

-- ============================================================
-- 1. users
-- ============================================================
CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email_verified_at` timestamp NULL DEFAULT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `theme` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'light',
  `timezone` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'UTC',
  `week_start` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monday',
  `week_end`   varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'sunday',
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `users`
(`id`,`name`,`email`,`email_verified_at`,`password`,`remember_token`,`created_at`,`updated_at`,`theme`,`timezone`,`week_start`,`week_end`) VALUES
(1,'husyn','mr.hussein.ceng@gmail.com',NULL,'$2y$12$ZmpBYVxv9hMKTEF/xHKqZe3gAAmDKbeZaFuXWg0oUMFR0zZWWLERG',NULL,'2026-09-29 07:09:23','2026-09-29 07:09:23','light','UTC','monday','sunday'),
(2,'Test User Renamed','test@example.com',NULL,'$2y$12$yZMj/GAjund/mfNVDASefOQ.95wMLYESq3icJajuO3h/n1yV6dBJW',NULL,'2026-09-29 07:41:52','2026-10-05 05:14:22','light','Asia/Beirut','sunday','sunday'),
(3,'Test User','test_1790680534@example.com',NULL,'$2y$12$4tQUGE7PDcpf/qtyYH/lpOGo36nMSpPsGuYRFqxo3hbhcIc2lo/mK',NULL,'2026-09-29 08:15:35','2026-09-29 08:15:35','light','UTC','monday','sunday'),
(4,'Test User','test2@example.com',NULL,'$2y$12$QZ0fo6B9gkago7R3yyze7OoSCp3SA9Z926is6Tu3koxUPpo9cDHdS',NULL,'2026-09-29 08:22:04','2026-09-29 08:22:04','light','UTC','monday','sunday'),
(5,'Test User','test_1790681376@example.com',NULL,'$2y$12$3NYpJKlvopHvS97r17ZMeegVfDvueNVmA55JbVTgwM.BmSJTSiHK.',NULL,'2026-09-29 08:29:36','2026-09-29 08:29:37','dark','UTC','sunday','sunday'),
(6,'test','test@test.com',NULL,'$2y$12$GyGTONEqpR1WNH2GasvZZu.BsaHbcX5PPCni4gbe3h0RZVrdr9u2.',NULL,'2026-09-29 08:40:13','2026-09-29 08:40:13','light','UTC','monday','sunday'),
(7,'Test User','testk@example.com',NULL,'$2y$12$Ebin.NN7rLlQGsFy9HRiieEm9jsl7rbIjAG28XV08n34IXEEgcm4q',NULL,'2026-09-29 08:41:23','2026-09-29 08:41:23','light','UTC','monday','sunday'),
(8,'Other','other@example.com',NULL,'$2y$12$ScpWCl1Ea40g90rzzp5S1.kDCLvUyXufLkg7prkGUQ0BAgmXB4py2',NULL,'2026-09-29 08:51:50','2026-09-29 08:51:50','light','UTC','monday','sunday'),
(9,'Other2','other2@example.com',NULL,'$2y$12$6xP5rkpcJCLIDlFgl3FbPuvQT0bvErHRU.eowjCpWwO3pWLcOJXlG',NULL,'2026-10-03 18:42:04','2026-10-03 18:42:04','light','UTC','monday','sunday'),
(10,'Other3','other3@example.com',NULL,'$2y$12$9Ju2zldRon1Fmi54eKZ7peApjwKReJef/gGmEUMi4BwlrYp3mtVsG',NULL,'2026-10-03 18:48:37','2026-10-03 18:48:37','light','UTC','monday','sunday'),
(11,'Test User','test1@example.com',NULL,'$2y$12$B5ppLqKJeIuy8j.uDzSpOObjCH.rvq2pdqluLnUMhwlQLeSVDZANe',NULL,'2026-10-03 19:12:10','2026-10-03 19:12:10','light','UTC','monday','sunday'),
(12,'Renamed','test+1791066411@example.com',NULL,'$2y$12$YvKb36T.FcoqayfuxUlW/.bQf4RJO.m.ePIyWdPm2sU5UuyKukc8S',NULL,'2026-10-03 19:26:52','2026-10-03 19:28:49','dark','Asia/Beirut','sunday','sunday'),
(13,'Other','other+1791066542@example.com',NULL,'$2y$12$AlDX/6WYza0hzCURcCivl.GFFKjCwS9jep6GGcRStdWNxR/saYTRa',NULL,'2026-10-03 19:29:03','2026-10-03 19:29:03','light','UTC','monday','sunday'),
(14,'Track Tester','tracks+1791066589@example.com',NULL,'$2y$12$nUBeI.be286MDC8S4S99COV1Qr9Vs1nZ.UjCGb9KFhb6aD4wYkE9K',NULL,'2026-10-03 19:29:49','2026-10-03 19:29:49','light','UTC','monday','sunday'),
(15,'Other','other+1791066665@example.com',NULL,'$2y$12$he4HUkM18zhoBixgDwi5XuyZn12wESIzylHD0VM6XzMM.oUXoD19K',NULL,'2026-10-03 19:31:05','2026-10-03 19:31:05','light','UTC','monday','sunday'),
(16,'Test User','test+1791066939@example.com',NULL,'$2y$12$gqBns/h8ewAGxCyOtHwtAeUSOZa6YaguVH.j1jXAk.HiCsbj.qLiC',NULL,'2026-10-03 19:35:39','2026-10-03 19:35:39','light','UTC','monday','sunday'),
(17,'V1','verify1+1791128631@example.com',NULL,'$2y$12$b9T6/vncz2H5jVBqplccfut4z1H/GivlkChfz8zqu0MO.RNlFShT.',NULL,'2026-10-04 12:43:51','2026-10-04 12:43:51','light','UTC','monday','sunday'),
(18,'Test 1791131081','verify+1791131081@example.com',NULL,'$2y$12$AlioQjSWPfM5tMhyVQOSJecNOZuby9AjcA96wlGTfGasdzjumrO9S',NULL,'2026-10-04 13:24:41','2026-10-04 13:24:41','light','UTC','monday','sunday'),
(19,'Test 1791131225','verify+1791131225@example.com',NULL,'$2y$12$XS75od3/u3ncYZV.HH0jYOliOjrMRFG1UnsxEGk6ngjr6vhf8J6f.',NULL,'2026-10-04 13:27:05','2026-10-04 13:27:05','light','UTC','monday','sunday'),
(20,'Test 1791131484','verify+1791131484@example.com',NULL,'$2y$12$hi/58k9ir6/zsVmfQsJi0ODkN75N7DU6aI2uF4OLm8KCJGZDqR65O',NULL,'2026-10-04 13:31:24','2026-10-04 13:31:24','light','UTC','monday','sunday'),
(21,'Test 1791131695','verify+1791131695@example.com',NULL,'$2y$12$bU0N3TiAX9BKzOr/hTskgele3ltwUHIPbVTjOuqKNr/Qj6SbaouaC',NULL,'2026-10-04 13:34:55','2026-10-04 13:34:55','light','UTC','monday','sunday'),
(22,'Test User','test+1791131713@example.com',NULL,'$2y$12$r/3dfz1oWIKdWjJe4vpD4uAEa8c7eRZFveVBE7A5xxxo83FqaRuvW',NULL,'2026-10-04 13:35:18','2026-10-04 13:35:18','light','UTC','monday','sunday'),
(23,'R 1791131826','resend+1791131826@example.com',NULL,'$2y$12$divJXXAdLq0KRLW1ZjMU9uxeq6bKLEa1JEajeAeGt.owOE7hIsbGu',NULL,'2026-10-04 13:37:06','2026-10-04 13:37:06','light','UTC','monday','sunday'),
(24,'Test 1791146578','verify+1791146578@example.com',NULL,'$2y$12$Bm3WrmvTQQ7.jRbMWb.siOd54Vh..UkGGdO8esCDDZMZHNgjqSeqC',NULL,'2026-10-04 17:42:58','2026-10-04 17:42:58','light','UTC','monday','sunday'),
(25,'R 1791146751','resend+1791146751@example.com',NULL,'$2y$12$/B/K4eVzBlFu1OzS85mF0..EM37cvNU3PSDR2ywsCHzvrAZdocwwO',NULL,'2026-10-04 17:45:51','2026-10-04 17:45:51','light','UTC','monday','sunday'),
(26,'Renamed','test+1791146953@example.com',NULL,'$2y$12$iftkUl/zsHQoBCoV0FNwv.PAc2OV8SK8meR/uMrSB954PUnwkg2gS',NULL,'2026-10-04 17:49:24','2026-10-04 17:50:46','dark','Asia/Beirut','sunday','sunday'),
(27,'Other','other+1791147059@example.com',NULL,'$2y$12$mLw5bUbz0SzUQi//9EMXrel1ocLTR6FFUeDTze1aluAn.Lh0ona.6',NULL,'2026-10-04 17:50:59','2026-10-04 17:50:59','light','UTC','monday','sunday'),
(28,'M','m+1791147088@example.com',NULL,'$2y$12$/1AmJikevyDdP.cZS7Nca.zxCEgOQ0p6bizyFf9E9kxKsA7RpSr4W',NULL,'2026-10-04 17:51:28','2026-10-04 17:51:28','light','UTC','monday','sunday'),
(29,'Track Tester','tracks+1791147202@example.com',NULL,'$2y$12$jzQCxydE6OwKeYBGEbc.5uOfEKzV99Fh4OqXtuVGLV3l4zuqH7py.',NULL,'2026-10-04 17:53:22','2026-10-04 17:53:22','light','UTC','monday','sunday'),
(30,'Other','other+1791147277@example.com',NULL,'$2y$12$0Q2edk5czNLySTUswno1WOuhViAU/no3VlMBWy1KovDooKNmzLwlu',NULL,'2026-10-04 17:54:37','2026-10-04 17:54:37','light','UTC','monday','sunday'),
(31,'Test 1791149083','verify+1791149083@example.com','2026-10-04 18:24:45','$2y$12$DHFWGQJRHkFhmJrPZ/kMS.EA27s1pB8CPLma4Vfzcxua8YqbU4b3y','HBuZOqx2CWAmnPQVQyp6kzXEbdxx4PSMPyVyjFI1KXSyBBRx9yKoiPXDDrzP','2026-10-04 18:24:43','2026-10-04 18:24:46','light','UTC','monday','sunday'),
(32,'Test 1791149136','verify+1791149136@example.com','2026-10-04 18:25:54','$2y$12$45ldbCcw1mPsdnU.V1tgw.O8P4b54N4ydQJdMT463eR99nPQOUtRC','xbyGFC9B6Rr68eH0GlSyw1YC0v1XR95QcjZhesxK7uOYlRaPx8dfBBGX9ujm','2026-10-04 18:25:36','2026-10-04 18:28:10','light','UTC','monday','sunday'),
(33,'R 1791149210','resend+1791149210@example.com',NULL,'$2y$12$r3.U4tBppwhEvUoWF02HwunxE1MjlVf/pNuHdnrTiO.RN8GPBCm.u',NULL,'2026-10-04 18:26:50','2026-10-04 18:26:50','light','UTC','monday','sunday'),
(34,'test','debugdevtest0@gmail.com','2026-10-08 16:34:49','$2y$12$Jd7ZfjuPeFbgCTVkmqFkNOmVYlD7e5rBJVFHdnqdPdb6fxNqmt3ei','VWmQl0JT40Y8nkJ0eMMnxB4wuxdUqWJnDLzNzk85u5rTt4Xamn3yiApHvP91','2026-10-06 04:28:35','2026-10-08 16:59:11','light','UTC','monday','sunday'),
(35,'V1','verify1+1791402461@example.com',NULL,'$2y$12$EdBNpW3i7YuhVZW8tQF5duMq2eXqWNTdmLooyjMu6WJ0tsc5H7rDi',NULL,'2026-10-07 16:47:42','2026-10-07 16:47:42','light','UTC','monday','sunday'),
(36,'Test 1791402851','verify+1791402851@example.com',NULL,'$2y$12$Ty4AXj/dtZ0BpbM0BRaxkuoInZ6MLjNTpmv5o03pV3srWAeQhPws.',NULL,'2026-10-07 16:54:11','2026-10-07 16:54:11','light','UTC','monday','sunday');

-- ============================================================
-- 2. password_reset_tokens
-- ============================================================
CREATE TABLE `password_reset_tokens` (
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `password_reset_tokens` (`email`,`token`,`created_at`) VALUES
('m+1791147088@example.com','$2y$12$F7lEOVanly3DxMlgqKNKq.cMRU7kEGgP5aXpFoVDUnCd2REbgIpqe','2026-10-04 17:51:30'),
('mr.hussein.ceng@gmail.com','$2y$12$xLokQKtjbCogEbP77V.Hd.TOkLqeU29.TRFAoUSSFOzfNGPi7MbzG','2026-10-06 04:20:33'),
('test+1791131713@example.com','$2y$12$CY.sw67v4fYBYkCl57KfbOqAep/VCJUSAk2x3mq/Mvs/u5ypEWjES','2026-10-04 13:37:44'),
('verify+1791146578@example.com','$2y$12$75oV/wcOP.9YW2dn/SN0xuV9EQEA9BgoqeqEOUDPiM4AH9oR9.o0K','2026-10-04 17:46:03');

-- ============================================================
-- 3. sessions
-- ============================================================
CREATE TABLE `sessions` (
  `id` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` bigint UNSIGNED DEFAULT NULL,
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `user_agent` text COLLATE utf8mb4_unicode_ci,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `last_activity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `sessions_user_id_index` (`user_id`),
  KEY `sessions_last_activity_index` (`last_activity`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `sessions` (`id`,`user_id`,`ip_address`,`user_agent`,`payload`,`last_activity`) VALUES
('A2sDzxuUFTl4OkX6eLqGlJJGhjRpHmC95HYT3KGA',NULL,'127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/60.5 Safari/605.1.15','eyJfdG9rZW4iOiIwOUlTTHdVa2FnbEd2dDJHVjR2djJwdUNOczYwaGlpbkh6aXU4QkREIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19',1791276766),
('C3D8O3EAwfXFh2JVVmiFKb7eT25UR1h3SH0IWooY',NULL,'127.0.0.1','curl/8.5.0','eyJfdG9rZW4iOiJJUUNpTVdSd0xhV0thSGllQ0ozb2JpeXBpSzBJbGswY1BSUUJ2RFlEIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19',1791148625),
('QMYoaudVTTkxOiFCYRxoSPNY6WcaqgADEw6Hxg5A',NULL,'127.0.0.1','Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/60.5 Safari/605.1.15','eyJfdG9rZW4iOiJlV2RGUVI5ZWh3Rms0MFJ0M3FZT1JyUzZLUW1DTTRBTjdGV1dCRWhyIiwiX3ByZXZpb3VzIjp7InVybCI6Imh0dHA6XC9cL2xvY2FsaG9zdDo4MDAwIiwicm91dGUiOm51bGx9LCJfZmxhc2giOnsib2xkIjpbXSwibmV3IjpbXX19',1791275636);

-- ============================================================
-- 4. cache
-- ============================================================
CREATE TABLE `cache` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 5. cache_locks
-- ============================================================
CREATE TABLE `cache_locks` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `owner` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `expiration` bigint NOT NULL,
  PRIMARY KEY (`key`),
  KEY `cache_locks_expiration_index` (`expiration`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 6. jobs / job_batches / failed_jobs
-- ============================================================
CREATE TABLE `jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `attempts` smallint UNSIGNED NOT NULL,
  `reserved_at` int UNSIGNED DEFAULT NULL,
  `available_at` int UNSIGNED NOT NULL,
  `created_at` int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  KEY `jobs_queue_index` (`queue`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  `finished_at` int DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `failed_jobs` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `uuid` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `connection` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `queue` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `payload` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `exception` longtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`),
  KEY `failed_jobs_connection_queue_failed_at_index` (`connection`,`queue`,`failed_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- 7. tasks
-- ============================================================
CREATE TABLE `tasks` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `title` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `due_date` date NOT NULL,
  `priority` enum('low','medium','high') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'medium',
  `status` enum('pending','in_progress','done') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `position` int UNSIGNED NOT NULL DEFAULT '0',
  `repeat_preset` enum('none','daily','weekly','custom') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'none',
  `repeat_days` json DEFAULT NULL,
  `meeting_time` time DEFAULT NULL,
  `period` enum('morning','afternoon','evening','night') COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `tasks_user_id_due_date_index` (`user_id`,`due_date`),
  CONSTRAINT `tasks_user_id_foreign`
      FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `tasks`
(`id`,`user_id`,`title`,`description`,`due_date`,`priority`,`status`,`position`,`repeat_preset`,`repeat_days`,`meeting_time`,`period`,`created_at`,`updated_at`) VALUES
(4,2,'frw','rf','2026-10-01','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 08:35:35','2026-09-29 17:08:38'),
(5,2,'hbhk','hbhk','2026-09-27','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 08:35:44','2026-10-02 17:15:33'),
(7,2,'hbjg','gjf','2026-10-04','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 08:36:01','2026-10-04 18:50:35'),
(8,2,'vhgvgv','jbhvjhcfh','2026-10-01','medium','in_progress',0,'none',NULL,NULL,NULL,'2026-09-29 08:36:10','2026-10-02 11:25:15'),
(9,2,'jkhgyjh','nbmv','2026-09-28','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 08:36:20','2026-10-02 11:25:07'),
(11,2,'Write project spec','Draft the initial requirements doc','2026-10-02','high','pending',0,'none',NULL,NULL,NULL,'2026-09-29 08:43:38','2026-10-02 11:25:21'),
(12,2,'test','test sat','2026-10-05','medium','pending',0,'none',NULL,NULL,NULL,'2026-09-29 17:06:42','2026-10-05 04:15:07'),
(13,2,'test1','test1','2026-10-02','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 17:07:22','2026-09-29 17:07:22'),
(14,2,'gugv','bvjghg','2026-10-01','medium','pending',0,'none',NULL,NULL,NULL,'2026-09-29 17:07:45','2026-09-29 17:07:45'),
(15,2,'d','d','2026-10-02','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 17:08:08','2026-10-02 17:04:22'),
(16,2,'dew','ew','2026-10-01','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 17:09:07','2026-09-29 17:09:07'),
(17,2,'mon','monday','2026-10-01','medium','pending',0,'none',NULL,NULL,NULL,'2026-09-29 17:11:17','2026-10-02 17:29:20'),
(20,2,'TodoList','complete todolist web app','2026-09-30','high','in_progress',0,'none',NULL,NULL,NULL,'2026-09-29 17:14:16','2026-10-02 11:25:04'),
(21,2,'Rechart','put radar chart in dashboard from rechart','2026-09-29','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 17:15:00','2026-10-02 11:23:59'),
(22,2,'backend','create laravel backend for todolist','2026-09-29','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 17:15:46','2026-10-02 11:24:36'),
(23,2,'frontend','create frontend for todolist','2026-10-02','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 17:16:49','2026-10-02 10:43:36'),
(24,2,'Automotors backend','finish testing Memory management feature','2026-09-29','medium','done',0,'none',NULL,NULL,NULL,'2026-09-29 17:18:09','2026-10-02 11:24:33'),
(25,2,'Automotors','Add sanctum=>laravel=>cookies','2026-09-28','low','pending',0,'none',NULL,NULL,NULL,'2026-09-29 17:19:53','2026-10-02 11:24:59'),
(26,2,'Automotors','Reset password feature','2026-09-30','low','pending',0,'none',NULL,NULL,NULL,'2026-09-29 17:20:39','2026-10-02 11:25:00'),
(27,2,'Automotors','Verify email','2026-09-29','low','pending',0,'none',NULL,NULL,NULL,'2026-09-29 17:22:16','2026-09-29 17:22:16'),
(28,2,'Exercise','Do exercise in morning and get rest the remaining of day','2026-10-05','high','pending',0,'none',NULL,NULL,NULL,'2026-09-29 17:26:13','2026-10-05 05:10:50'),
(29,2,'test','test btn position','2026-09-27','high','done',0,'none',NULL,NULL,NULL,'2026-10-02 10:40:21','2026-10-02 17:04:33'),
(31,2,'jvghc','t','2026-09-30','medium','pending',0,'none',NULL,NULL,NULL,'2026-10-02 10:43:03','2026-10-02 11:24:57'),
(32,2,'tydf','jvgf','2026-09-28','medium','pending',0,'none',NULL,NULL,NULL,'2026-10-02 10:43:09','2026-10-02 11:24:55'),
(34,2,'ljnjgvcf','gvh','2026-09-28','medium','done',0,'none',NULL,NULL,NULL,'2026-10-02 11:23:20','2026-10-02 11:24:52'),
(35,2,'ttfhdfd','fthfgdrtdrd','2026-09-27','high','done',0,'none',NULL,NULL,NULL,'2026-10-02 16:54:21','2026-10-02 17:15:44'),
(43,2,'Write project spec','Draft the initial requirements doc','2026-10-01','high','pending',0,'none',NULL,NULL,NULL,'2026-10-03 19:13:08','2026-10-03 19:13:08'),
(44,2,'Review PRs',NULL,'2026-09-29','medium','pending',0,'none',NULL,NULL,NULL,'2026-10-03 19:13:19','2026-10-03 19:13:19'),
(45,12,'Task A (updated)','first','2026-10-02','medium','in_progress',5,'none',NULL,NULL,NULL,'2026-10-03 19:28:07','2026-10-03 19:28:35'),
(48,26,'Task A (updated)','first','2026-10-02','medium','in_progress',5,'none',NULL,NULL,NULL,'2026-10-04 17:49:52','2026-10-04 17:50:31'),
(51,32,'regression',NULL,'2026-10-05','medium','pending',0,'none',NULL,NULL,NULL,'2026-10-04 18:28:42','2026-10-04 18:28:42'),
(52,2,'bhjvgh','hjvhcf','2026-10-05','medium','done',0,'none',NULL,NULL,NULL,'2026-10-04 18:51:30','2026-10-05 04:15:19'),
(53,2,'meeting','weekly meeting','2026-10-06','medium','pending',0,'daily',NULL,NULL,NULL,'2026-10-05 04:47:05','2026-10-05 04:47:15'),
(54,2,'jhuiyug','kbhjvghc','2026-10-08','medium','pending',0,'none',NULL,NULL,NULL,'2026-10-05 05:09:51','2026-10-05 05:09:51'),
(55,2,'kugjfr','ghjhf','2026-10-04','medium','done',0,'custom','["monday", "wednesday"]',NULL,NULL,'2026-10-05 05:16:16','2026-10-05 05:18:23'),
(56,34,',nn bhk','jnjk','2026-10-07','medium','pending',0,'none',NULL,NULL,NULL,'2026-10-08 16:33:09','2026-10-08 16:33:09'),
(57,34,'fc','vj','2026-10-08','medium','pending',0,'none',NULL,NULL,NULL,'2026-10-08 16:33:21','2026-10-08 16:33:21'),
(58,34,'mbhjb','h hbhb','2026-10-15','medium','pending',0,'none',NULL,NULL,NULL,'2026-10-08 17:06:59','2026-10-08 17:06:59');

-- ============================================================
-- 8. task_tracks
-- ============================================================
CREATE TABLE `task_tracks` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` bigint UNSIGNED NOT NULL,
  `task_id` bigint UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `status` enum('pending','in_progress','done') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `meeting_time` time DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `task_tracks_task_id_date_unique` (`task_id`,`date`),
  KEY `task_tracks_user_id_date_index` (`user_id`,`date`),
  CONSTRAINT `task_tracks_task_id_foreign`
      FOREIGN KEY (`task_id`) REFERENCES `tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `task_tracks_user_id_foreign`
      FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `task_tracks` (`id`,`user_id`,`task_id`,`date`,`status`,`meeting_time`,`created_at`,`updated_at`) VALUES
(14,2,28,'2026-10-03','done',NULL,'2026-10-04 18:50:27','2026-10-04 18:50:27'),
(17,2,12,'2026-10-05','pending',NULL,'2026-10-05 04:14:50','2026-10-05 04:14:50'),
(18,2,55,'2026-10-04','done',NULL,'2026-10-05 05:16:53','2026-10-05 05:16:53');

-- ============================================================
-- 9. personal_access_tokens
-- ============================================================
CREATE TABLE `personal_access_tokens` (
  `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT,
  `tokenable_type` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `tokenable_id` bigint UNSIGNED NOT NULL,
  `name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `token` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `abilities` text COLLATE utf8mb4_unicode_ci,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`),
  KEY `personal_access_tokens_expires_at_index` (`expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `personal_access_tokens`
(`id`,`tokenable_type`,`tokenable_id`,`name`,`token`,`abilities`,`last_used_at`,`expires_at`,`created_at`,`updated_at`) VALUES
(1,'App\\Models\\User',2,'auth','a79b051dd3758dada5df61a875ad8825ad3d1545fe720f5212ffe2d428ccbee9','["*"]','2026-10-03 18:29:22',NULL,'2026-10-03 18:29:05','2026-10-03 18:29:22'),
(2,'App\\Models\\User',2,'auth','4e927f5fefada85ed4447cab938448422cd786ffdd1e6b22ec9a263c7e143c36','["*"]','2026-10-03 18:42:27',NULL,'2026-10-03 18:37:28','2026-10-03 18:42:27'),
(3,'App\\Models\\User',9,'auth','77c0e1fc9d0d1361e666bc90034305973732814b439284ad7d54d1d2976c8d50','["*"]',NULL,NULL,'2026-10-03 18:42:04','2026-10-03 18:42:04'),
(4,'App\\Models\\User',2,'auth','afeda271f43d6070a90e5ac9ae18d62b7c314324ca0c096c1c36e4b2e4e150c6','["*"]','2026-10-03 18:48:56',NULL,'2026-10-03 18:47:17','2026-10-03 18:48:56'),
(5,'App\\Models\\User',10,'auth','ca4a98c658f1e9e7acc34b2a76681c2225d823dddf26f35169b20f3fd8aab788','["*"]','2026-10-03 18:48:37',NULL,'2026-10-03 18:48:37','2026-10-03 18:48:37'),
(6,'App\\Models\\User',11,'auth','e95a8de22ad8491525b705e056e83989591c24517d6047bdc116a724a9c6e89a','["*"]',NULL,NULL,'2026-10-03 19:12:10','2026-10-03 19:12:10'),
(8,'App\\Models\\User',12,'auth','f68f59f161850116866f683b9d65d2ed13fc1350c6e2ba30fef323e9246406dc','["*"]',NULL,NULL,'2026-10-03 19:26:52','2026-10-03 19:26:52'),
(10,'App\\Models\\User',12,'auth','757531fcf43f13f5461066304b2fd8704abcc5a9d99935ab8d8012b6fe18f386','["*"]',NULL,NULL,'2026-10-03 19:28:49','2026-10-03 19:28:49'),
(11,'App\\Models\\User',13,'auth','8a67409b67466630eb09c140c32c7a61f3171c99564c5374f930226ea3b55a8c','["*"]','2026-10-03 19:29:03',NULL,'2026-10-03 19:29:03','2026-10-03 19:29:03'),
(12,'App\\Models\\User',14,'auth','d59221d4a3e54ca68fb1ad02a32db336bca62ae112c0f53b19054e691cefec6e','["*"]','2026-10-03 19:31:18',NULL,'2026-10-03 19:29:49','2026-10-03 19:31:18'),
(13,'App\\Models\\User',15,'auth','d67e36192a1c8dd697ede1c88f3bb9da5602908ec1457528b27be4c44adff475','["*"]','2026-10-03 19:31:05',NULL,'2026-10-03 19:31:05','2026-10-03 19:31:05'),
(14,'App\\Models\\User',16,'auth','b7159e8d0db90ea5ba91bd4f1e1224926a7b8193f53c2bd7040b8e5655044398','["*"]',NULL,NULL,'2026-10-03 19:35:39','2026-10-03 19:35:39'),
(15,'App\\Models\\User',16,'auth','2be3e34c5b72527a828eb8c2822f7f6b5b8488a2a8681063fc8ec9c289e85717','["*"]',NULL,NULL,'2026-10-03 19:35:49','2026-10-03 19:35:49'),
(16,'App\\Models\\User',17,'auth','ca3896397efd6f99f8aa5b47ddf65fce776dc22419bb733dca6aeb8a7b3ccd8a','["*"]',NULL,NULL,'2026-10-04 12:43:51','2026-10-04 12:43:51'),
(17,'App\\Models\\User',24,'auth','3ddb2b4841b7f4d89ecad497f5e6667ed4b6e74cffbebd0773edfcadc2d330cd','["*"]','2026-10-04 17:48:02',NULL,'2026-10-04 17:43:01','2026-10-04 17:48:02'),
(18,'App\\Models\\User',25,'auth','eb030c7f97b7a31344a105eab25c80237dba9740c1f68bb636698b2db4c7c66f','["*"]','2026-10-04 17:45:53',NULL,'2026-10-04 17:45:53','2026-10-04 17:45:53'),
(19,'App\\Models\\User',24,'auth','8262c9a5688a3d6c63dd89c836628edcc5536e748b79be0a98babf0f4f62a90e','["*"]',NULL,NULL,'2026-10-04 17:47:55','2026-10-04 17:47:55'),
(20,'App\\Models\\User',26,'auth','bbfa88418e499adf38ce6b4d78532d74ede76be5e13b6d275602c3df6bf37e75','["*"]',NULL,NULL,'2026-10-04 17:49:26','2026-10-04 17:49:26'),
(22,'App\\Models\\User',26,'auth','5202f3962b5023ecf76ae0c16448f2449df1eb1bfe73fce209440068785b6111','["*"]',NULL,NULL,'2026-10-04 17:50:46','2026-10-04 17:50:46'),
(23,'App\\Models\\User',27,'auth','0b13296a598285ffa865d0c48330007d13b4b26f956062a98a022a80ecca1007','["*"]','2026-10-04 17:51:01',NULL,'2026-10-04 17:51:01','2026-10-04 17:51:01'),
(24,'App\\Models\\User',28,'auth','1371b92c1bbadb67c4cf4610ffc9585f445fcef02ddf80f6ad5e8ee609b1b80f','["*"]','2026-10-04 17:51:30',NULL,'2026-10-04 17:51:30','2026-10-04 17:51:30'),
(25,'App\\Models\\User',29,'auth','7b98952ba9f2f2d21f7e7e52a9c35d627ad6088e052412e6bc855060568636d8','["*"]','2026-10-04 17:54:55',NULL,'2026-10-04 17:53:24','2026-10-04 17:54:55'),
(26,'App\\Models\\User',30,'auth','6fad523d0aab2aedb7fe8ed0517eedd1f596e0a313739eae2555769e4d3d3389','["*"]','2026-10-04 17:54:39',NULL,'2026-10-04 17:54:39','2026-10-04 17:54:39'),
(28,'App\\Models\\User',31,'auth','ee563635981d65c3f990d1aa9bdea140a48a86cbd340ca237d2695fc0d674628','["*"]',NULL,NULL,'2026-10-04 18:24:47','2026-10-04 18:24:47'),
(30,'App\\Models\\User',33,'auth','2a98afbee5e19c4df04328465d2810af8318584865ffabf4f3e921ac9dd34fd2','["*"]','2026-10-04 18:26:52',NULL,'2026-10-04 18:26:52','2026-10-04 18:26:52'),
(31,'App\\Models\\User',32,'auth','beeb2f3e12057c709bb2ed14974c9195ba2e0c9149e459485c2dcac64267f6b2','["*"]',NULL,NULL,'2026-10-04 18:28:17','2026-10-04 18:28:17'),
(32,'App\\Models\\User',32,'auth','c30977cb119ff2b0ea6529eaa07c0d4b6c3fa0e22fbe22d1ebeda5169e576491','["*"]','2026-10-04 18:28:42',NULL,'2026-10-04 18:28:42','2026-10-04 18:28:42'),
(46,'App\\Models\\User',35,'auth','9b78b40308dcd1cf5abe9e8ffe5f094cfaf73096696cb7188255f6748e4bd3b5','["*"]',NULL,NULL,'2026-10-07 16:47:44','2026-10-07 16:47:44'),
(47,'App\\Models\\User',36,'auth','45260734c6d4f9bd174873c5c9d93c8528849222d0bcf0abf05976e59eafe21b','["*"]',NULL,NULL,'2026-10-07 16:54:14','2026-10-07 16:54:14'),
(48,'App\\Models\\User',34,'auth','694d577566650bb0b6b616a186b0b9807f0b13da040dd2f534c082ab6f07f0af','["*"]','2026-10-07 17:08:08',NULL,'2026-10-07 17:05:36','2026-10-07 17:08:08'),
(50,'App\\Models\\User',34,'auth','6615e984a129f9267bec7a1d55dfd63314d119dc9ab6a06a73eb89dfe1e59f04','["*"]','2026-10-08 16:47:39',NULL,'2026-10-08 16:47:39','2026-10-08 16:47:39'),
(51,'App\\Models\\User',34,'auth','f54e8b780126b8b9586ed4a73d1093fea8ec0b3e0fa13eae5b7b9996c5833ec4','["*"]','2026-10-08 17:07:11',NULL,'2026-10-08 16:58:31','2026-10-08 17:07:11');

-- ============================================================
-- 10. migrations  (CRITICAL — makes artisan migrate:status work)
-- ============================================================
CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `migrations` (`id`,`migration`,`batch`) VALUES
(1,'0001_01_01_000000_create_users_table',1),
(2,'0001_01_01_000001_create_cache_table',1),
(3,'0001_01_01_000002_create_jobs_table',1),
(4,'2026_09_29_085154_create_personal_access_tokens_table',2),
(5,'1_create_users_table',3),
(6,'2_create_tasks_table',3),
(7,'3_create_task_tracks_table',3),
(8,'4_add_repeat_and_meeting_to_tasks_table',3),
(9,'5_add_week_end_and_period',3);

SET FOREIGN_KEY_CHECKS = 1;