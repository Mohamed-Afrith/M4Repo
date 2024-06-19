-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jan 10, 2024 at 01:42 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lms`
--

-- --------------------------------------------------------

--
-- Table structure for table `lmsgameassets_copy`
--

CREATE TABLE `lmsgameassets` (
  `gasId` int(100) NOT NULL,
  `gasAssetType` varchar(100) NOT NULL,
  `gasAssetName` varchar(100) NOT NULL,
  `gasAssetImage` varchar(100) NOT NULL,
  `gasCreatedUserId` int(100) DEFAULT NULL,
  `gasEditedUserId` int(100) DEFAULT NULL,
  `gasCreatedDate` datetime DEFAULT NULL,
  `gasEditedDate` datetime DEFAULT NULL,
  `gasStatus` enum('Active','Inactive') NOT NULL DEFAULT 'Active',
  `gasDeleteStatus` enum('NO','YES') NOT NULL DEFAULT 'NO' COMMENT 'YES for delete data',
  `gasIpAddress` varchar(100) NOT NULL,
  `gasDeviceType` varchar(100) NOT NULL,
  `gasUserAgent` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `lmsgameassets_copy`
--

INSERT INTO `lmsgameassets_copy` (`gasId`, `gasAssetType`, `gasAssetName`, `gasAssetImage`, `gasCreatedUserId`, `gasEditedUserId`, `gasCreatedDate`, `gasEditedDate`, `gasStatus`, `gasDeleteStatus`, `gasIpAddress`, `gasDeviceType`, `gasUserAgent`) VALUES
(1, '1', 'Forest', 'uploads/background/41524_1701765021527.jpg', 1, NULL, '2023-12-05 08:30:21', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(2, '1', 'Desert forest', 'uploads/background/nwbu_b6ga_210426_1701765781732.jpg', 1, NULL, '2023-12-05 08:43:02', NULL, 'Active', 'NO', '192.168.1.71', 'desktop', '0'),
(3, '1', 'MindMaze', 'uploads/background/LearningLegends Arena_1701771492504.jpg', 1, NULL, '2023-12-05 10:18:12', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(4, '1', ' LearningLegends Arena', 'uploads/background/MindMaze_1701771297751.jpg', 1, NULL, '2023-12-05 10:14:57', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(5, '1', 'StudySphere Quest', 'uploads/background/StudySphere Quest_1701766610025.jpg', 1, NULL, '2023-12-05 08:56:50', NULL, 'Active', 'NO', '192.168.1.71', 'desktop', '0'),
(6, '1', 'EduGaming Odyssey', 'uploads/background/2301.w026.n002.3007B.p1.3007_1701771339446.jpg', 1, NULL, '2023-12-05 10:15:39', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(7, '1', 'The Park ', 'uploads/background/32084_1701771637864.jpg', 1, NULL, '2023-12-05 10:20:37', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(8, '1', 'Edutainment Galaxy', 'uploads/background/StudySphere Quest_1701771155886.jpg', 1, NULL, '2023-12-05 10:12:36', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(9, '1', 'Factory', 'uploads/background/29977_1701772077260.jpg', 1, NULL, '2023-12-05 10:27:57', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(10, '1', 'Village Store Room', 'uploads/background/45102_1701771834872.jpg', 1, NULL, '2023-12-05 10:23:54', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(12, '4', 'Gold Shield', 'uploads/badges/1_1701772450271.png', 1, NULL, '2023-12-05 10:34:10', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(13, '4', 'Gold Star', 'uploads/badges/2_1701772530865.png', 1, NULL, '2023-12-05 10:35:30', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(14, '4', 'Gold semi Finalist', 'uploads/badges/3_1701772562396.png', 1, NULL, '2023-12-05 10:36:02', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(15, '4', 'Gold Finalist', 'uploads/badges/4_1701772587032.png', 1, NULL, '2023-12-05 10:36:27', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(16, '4', 'contrast', 'uploads/badges/21_1701772616956.png', 1, NULL, '2023-12-05 10:36:56', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(17, '4', 'Ring', 'uploads/badges/download (1)_1701772648105.png', 1, NULL, '2023-12-05 10:37:28', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(18, '4', 'Double Ring', 'uploads/badges/download (2)_1701772767335.png', 1, NULL, '2023-12-05 10:39:27', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(19, '4', 'Red Stone Ring', 'uploads/badges/download (3)_1701772783999.png', 1, NULL, '2023-12-05 10:39:44', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(20, '4', 'Wings Ring', 'uploads/badges/download (4)_1701772805774.png', 1, NULL, '2023-12-05 10:40:05', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(21, '4', 'King Wings ', 'uploads/badges/download (5)_1701772821246.png', 1, NULL, '2023-12-05 10:40:21', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(22, '2', 'tinu', 'uploads/nonPlayer/32243_1701774393536.png', 1, NULL, '2023-12-05 11:06:33', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(23, '2', 'carcy', 'uploads/nonPlayer/32307_1701774414704.png', 1, NULL, '2023-12-05 11:06:54', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(24, '2', 'kiya', 'uploads/nonPlayer/ddan_tqpa_190728_1701774429767.png', 1, NULL, '2023-12-05 11:07:09', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(25, '2', 'buttu', 'uploads/nonPlayer/fun-3d-illustration-cartoon-kid-with-vr-helmet_1701774444635.png', 1, NULL, '2023-12-05 11:07:24', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(26, '2', 'Jiju', 'uploads/nonPlayer/fun-backpacker-german-shepherd-dog-cartoon-character_1701774462822.png', 1, NULL, '2023-12-05 11:07:42', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(27, '2', 'jhon', 'uploads/nonPlayer/fun-backpacker-with-walking-sticks-3d-illustration_1701774472201.png', 1, NULL, '2023-12-05 11:07:52', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(28, '2', 'Rock', 'uploads/nonPlayer/fun-illustration-3d-cartoon-backpacker_1701774485283.png', 1, NULL, '2023-12-05 11:08:05', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(29, '2', 'Mavreik', 'uploads/nonPlayer/roman-soldier-3d-illustration_1701774510066.png', 1, NULL, '2023-12-05 11:08:30', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(30, '2', 'Little Boss', 'uploads/nonPlayer/soldier-boy-character-videogame_1701774532258.png', 1, NULL, '2023-12-05 11:08:52', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(31, '2', 'Monstar', 'uploads/nonPlayer/tvia_lfxq_220617_1701774566625.png', 1, NULL, '2023-12-05 11:09:26', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(32, '5', 'Gold Shower', 'uploads/Welcome/2060_1701775517461.jpg', 1, NULL, '2023-12-05 11:25:17', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(33, '5', 'volcano', 'uploads/Welcome/hdd2_zm3z_201030_1701775561976.jpg', 1, NULL, '2023-12-05 11:26:02', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(34, '5', 'farming', 'uploads/Welcome/p7ww_39x9_220613_1701775586509.jpg', 1, NULL, '2023-12-05 11:26:26', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(35, '6', 'River Side', 'uploads/Reflection/40942_1701775996787.jpg', 1, NULL, '2023-12-05 11:33:17', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(36, '6', 'River Side', 'uploads/Reflection/mount_1701776068667.jpg', 1, NULL, '2023-12-05 11:34:28', NULL, 'Active', 'NO', '192.168.1.51', 'desktop', '0'),
(37, '4', 'Emerald', 'uploads/badges/badges_2_1702634631429.png', 1, NULL, '2023-12-15 10:03:51', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(38, '4', 'Steel', 'uploads/badges/badges_2_1702634704015.png', 1, NULL, '2023-12-15 10:05:04', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(39, '4', 'Bronze', 'uploads/badges/badges_4_1702634766654.png', 1, NULL, '2023-12-15 10:06:06', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(40, '4', 'Bronze', 'uploads/badges/badges_4_1702634804687.png', 1, NULL, '2023-12-15 10:06:44', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(41, '4', 'set', 'uploads/badges/badges_3_1702634863160.png', 1, NULL, '2023-12-15 10:07:43', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(42, '4', 'set', 'uploads/badges/badges_1_1702635032350.jpeg', 1, NULL, '2023-12-15 10:10:32', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(43, '4', 'set', 'uploads/badges/badges_2_1702635125281.png', 1, NULL, '2023-12-15 10:12:05', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(44, '4', 'emerald', 'uploads/badges/badges_2_1702635175116.png', 1, NULL, '2023-12-15 10:12:55', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(45, '4', 'emerald', 'uploads/badges/badges_3_1702635521817.png', 1, NULL, '2023-12-15 10:18:41', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(46, '7', 'intro', 'uploads/audios/46.mp3', NULL, NULL, '2023-12-15 12:53:15', NULL, 'Active', 'NO', '192.168.1.67', 'phone', '0'),
(47, '7', 'intro', 'uploads/audios/47.mp3', NULL, NULL, '2023-12-15 12:54:14', NULL, 'Active', 'NO', '192.168.1.67', 'phone', '0'),
(48, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702975893308.mp3', NULL, NULL, '2023-12-15 13:56:59', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(49, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702713733503.mp3', 1, NULL, '2023-12-16 08:02:13', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(50, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702719878600.mp3', 1, NULL, '2023-12-16 09:44:38', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(51, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702721007135.mp3', 1, NULL, '2023-12-16 10:03:27', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(52, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702721086135.mp3', 1, NULL, '2023-12-16 10:04:46', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(53, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702721800416.mp3', 1, NULL, '2023-12-16 10:16:40', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(54, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702723423417.mp3', 1, NULL, '2023-12-16 10:43:43', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(55, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702724443514.mp3', 1, NULL, '2023-12-16 11:00:43', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(56, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702724915897.mp3', 1, NULL, '2023-12-16 11:08:36', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(57, '4', 'badges', 'uploads/badges/images (1)_1702881112759.png', 1, NULL, '2023-12-18 06:31:52', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(58, '4', 'badges', 'uploads/badges/images (1)_1702881203681.png', 1, NULL, '2023-12-18 06:33:23', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(59, '4', 'badges', 'uploads/badges/images (1)_1702881237597.png', 1, NULL, '2023-12-18 06:33:57', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(60, '4', 'badges', 'uploads/badges/images (1)_1702881241446.png', 1, NULL, '2023-12-18 06:34:01', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(61, '4', 'badges', 'uploads/badges/images (1)_1702881242811.png', 1, NULL, '2023-12-18 06:34:02', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(62, '4', 'badges', 'uploads/badges/aboutaps_1702881268100.jpg', 1, NULL, '2023-12-18 06:34:28', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(63, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702881299810.mp3', 1, NULL, '2023-12-18 06:35:00', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(64, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702881500340.mp3', 1, NULL, '2023-12-18 06:38:20', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(65, '4', 'badges', 'uploads/badges/WhatsApp Image 2023-12-16 at 7.09.56 PM_1702881980249.jpeg', 1, NULL, '2023-12-18 06:46:20', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(66, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702881998748.mp3', 1, NULL, '2023-12-18 06:46:38', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(67, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702959589080.mp3', 1, NULL, '2023-12-19 04:19:49', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', '0'),
(68, '7', 'Intro', 'uploads/audios/mixkit-kids-786_1704455468094.mp3', 1, NULL, '2023-12-19 07:28:51', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(69, '4', 'badges', 'uploads/badges/WhatsApp Image 2023-12-16 at 7.10.08 PM_1702970957634.jpeg', 1, NULL, '2023-12-19 07:29:17', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(70, '7', 'Intro', 'uploads/audios/mixkit-kids-786_1704455531366.mp3', 1, NULL, '2023-12-19 07:31:17', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(71, '4', 'badges', 'uploads/badges/WhatsApp Image 2023-12-16 at 7.09.56 PM (2)_1702975735901.jpeg', 1, NULL, '2023-12-19 08:48:55', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(72, '7', 'Intro', 'uploads/audios/mixkit-lo-fi-01-763_1704455244148.mp3', 1, NULL, '2023-12-19 08:51:33', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(73, '7', 'Intro', 'uploads/audios/mixkit-kids-786_1704455468094.mp3', 1, NULL, '2023-12-19 08:54:47', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(74, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1702976627713.mp3', 1, NULL, '2023-12-19 09:03:47', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(75, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1703150795362.mp3', 1, NULL, '2023-12-21 09:26:35', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(76, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1704168807891.mp3', 1, NULL, '2024-01-02 04:13:27', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(77, '7', 'Intro', 'uploads/audios/enchanted-chimes-177906_1704168850726.mp3', 1, NULL, '2024-01-02 04:14:10', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(78, '7', 'Intro', 'uploads/audios/drive-breakbeat-173062_1704431203816.mp3', 1, NULL, '2024-01-05 05:06:43', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(79, '7', 'Intro', 'uploads/audios/mixkit-kids-786_1704455531366.mp3', 1, NULL, '2024-01-05 06:15:07', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(80, '7', 'Intro', 'uploads/audios/Nicole_1703909465507.mp3', 1, NULL, '2024-01-05 11:49:51', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(81, '7', 'Intro', 'uploads/audios/mixkit-lo-fi-01-763_1704455437013.mp3', 1, NULL, '2024-01-05 11:50:37', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(82, '7', 'Intro', 'uploads/audios/mixkit-kids-786_1704455468094.mp3', 1, NULL, '2024-01-05 11:51:08', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(83, '7', 'Intro', 'uploads/audios/mixkit-alter-ego-481_1704455480942.mp3', 1, NULL, '2024-01-05 11:51:20', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(84, '7', 'Intro', 'uploads/audios/mixkit-kids-786_1704455531366.mp3', 1, NULL, '2024-01-05 11:52:11', NULL, 'Active', 'NO', '192.168.1.67', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(85, '7', 'Intro', 'uploads/audios/drive-breakbeat-173062_1704699103720.mp3', 1, NULL, '2024-01-08 07:31:43', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(86, '7', 'Intro', 'uploads/audios/drive-breakbeat-173062_1704699313238.mp3', 1, NULL, '2024-01-08 07:35:13', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(87, '7', 'Intro', 'uploads/audios/drive-breakbeat-173062_1704704163382.mp3', 1, NULL, '2024-01-08 08:56:03', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(88, '7', 'Intro', 'uploads/audios/drive-breakbeat-173062_1704706312537.mp3', 1, NULL, '2024-01-08 09:31:52', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(89, '7', 'Intro', 'uploads/audios/drive-breakbeat-173062_1704707302808.mp3', 1, NULL, '2024-01-08 09:48:22', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(90, '7', 'Intro', 'uploads/audios/drive-breakbeat-173062_1704707840371.mp3', 1, NULL, '2024-01-08 09:57:21', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(91, '7', 'Intro', 'uploads/audios/drive-breakbeat-173062_1704708610253.mp3', 1, NULL, '2024-01-08 10:10:10', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(92, '7', 'Intro', 'uploads/audios/drive-breakbeat-173062_1704708884850.mp3', 1, NULL, '2024-01-08 10:14:44', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(93, '7', 'Intro', 'uploads/audios/file_example_MP3_700KB_1704708904186.mp3', 1, NULL, '2024-01-08 10:15:04', NULL, 'Active', 'NO', '192.168.1.23', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'),
(94, '7', 'Intro', 'uploads/audios/drive-breakbeat-173062_1704709123842.mp3', 1, NULL, '2024-01-08 10:18:43', NULL, 'Active', 'NO', '192.168.1.98', 'desktop', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `lmsgameassets_copy`
--
ALTER TABLE `lmsgameassets_copy`
  ADD PRIMARY KEY (`gasId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `lmsgameassets_copy`
--
ALTER TABLE `lmsgameassets_copy`
  MODIFY `gasId` int(100) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=95;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
