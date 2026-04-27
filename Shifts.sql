-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 26, 2026 at 02:42 PM
-- Server version: 8.4.7-7
-- PHP Version: 8.1.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `dtr`
--

-- --------------------------------------------------------

--
-- Table structure for table `Shifts`
--

CREATE TABLE `Shifts` (
  `id` int NOT NULL,
  `employeeId` int NOT NULL,
  `date` date NOT NULL,
  `morningTimeIn` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `morningTimeOut` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `morningHours` float DEFAULT '0',
  `afternoonTimeIn` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `afternoonTimeOut` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `afternoonHours` float DEFAULT '0',
  `overtimeTimeIn` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `overtimeTimeOut` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `overtimeHours` float DEFAULT '0',
  `totalHours` float DEFAULT '0',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `notes` text COLLATE utf8mb4_general_ci,
  `isHoliday` tinyint(1) DEFAULT '0',
  `holidayType` enum('regular','special_non_working','special_working') COLLATE utf8mb4_general_ci DEFAULT NULL,
  `holidayName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Shifts`
--

INSERT INTO `Shifts` (`id`, `employeeId`, `date`, `morningTimeIn`, `morningTimeOut`, `morningHours`, `afternoonTimeIn`, `afternoonTimeOut`, `afternoonHours`, `overtimeTimeIn`, `overtimeTimeOut`, `overtimeHours`, `totalHours`, `createdAt`, `updatedAt`, `notes`, `isHoliday`, `holidayType`, `holidayName`) VALUES
(21, 16, '2026-04-01', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-02 05:23:20', '2026-04-02 05:23:20', 'Training (Job monitoring and replying Facebook messenger), scanned workers documents', 0, NULL, NULL),
(22, 15, '2026-04-01', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-02 05:24:19', '2026-04-02 05:26:58', 'Job monitoring, train new hire, collect reports/issues encountered, edit calendar (schedule)', 0, NULL, NULL),
(23, 14, '2026-04-01', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-02 05:30:02', '2026-04-02 05:30:02', 'Reply Facebook messenger, monitor workers registration, and input report/issues encountered both for workers and customers in process documentation sheets', 0, NULL, NULL),
(24, 14, '2026-04-02', '08:00', '12:00', 4, '13:00', '17:00', 4, NULL, NULL, 0, 8, '2026-04-02 05:33:28', '2026-04-03 07:37:26', 'Job monitoring, reply Facebook messenger, monitor workers registration, created a step-by-step guide on how to book through Trabahadoor app', 1, 'regular', 'Maundy Thursday'),
(25, 14, '2026-04-03', '08:00', '12:00', 4, '13:00', '17:00', 4, NULL, NULL, 0, 8, '2026-04-02 23:55:26', '2026-04-03 07:37:42', NULL, 1, 'regular', 'Good Friday'),
(26, 16, '2026-04-06', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:00:39', '2026-04-06 01:00:39', NULL, 0, NULL, NULL),
(27, 15, '2026-04-04', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:01:25', '2026-04-06 01:01:25', 'Job monitoring, reply Facebook messenger', 1, 'special_non_working', 'Black Saturday'),
(28, 15, '2026-04-05', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:01:45', '2026-04-06 01:01:45', 'Job monitoring, reply Facebook messenger', 0, NULL, NULL),
(29, 15, '2026-04-06', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:02:07', '2026-04-06 01:02:07', 'Job monitoring, reply Facebook messenger', 0, NULL, NULL),
(30, 14, '2026-04-06', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:02:38', '2026-04-06 01:02:38', NULL, 0, NULL, NULL),
(31, 16, '2026-03-25', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:08:12', '2026-04-06 01:11:34', 'Training', 0, NULL, NULL),
(32, 16, '2026-03-26', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:09:06', '2026-04-06 01:09:06', 'Training', 0, NULL, NULL),
(33, 16, '2026-03-27', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:10:36', '2026-04-06 01:10:36', 'Training', 0, NULL, NULL),
(34, 16, '2026-03-28', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:10:47', '2026-04-06 01:10:47', 'Training', 0, NULL, NULL),
(35, 16, '2026-03-30', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:11:15', '2026-04-06 01:11:15', 'Training', 0, NULL, NULL),
(36, 16, '2026-03-31', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:12:05', '2026-04-06 01:12:05', 'Scanned workers documents', 0, NULL, NULL),
(37, 16, '2026-04-07', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 01:10:36', '2026-04-07 09:02:01', 'Job monitoring (guided), scanned workers documents', 0, NULL, NULL),
(38, 15, '2026-04-07', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 01:11:49', '2026-04-07 09:12:22', 'Guide intern (Job monitoring, scanned workers documents), message customer (piso winner and marketing purposes)', 0, NULL, NULL),
(39, 14, '2026-04-07', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 01:12:21', '2026-04-07 09:10:07', 'Onboard, monitor workers registration, reply Facebook messenger', 0, NULL, NULL),
(40, 17, '2026-04-07', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-07 01:24:03', '2026-04-07 01:24:03', NULL, 0, NULL, NULL),
(41, 17, '2026-04-01', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-07 01:25:11', '2026-04-07 01:25:11', NULL, 0, NULL, NULL),
(42, 17, '2026-04-06', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-07 01:25:29', '2026-04-07 01:25:29', NULL, 0, NULL, NULL),
(45, 18, '2026-04-07', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 21:29:30', '2026-04-07 21:29:30', NULL, 0, NULL, NULL),
(46, 18, '2026-04-06', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 21:36:40', '2026-04-07 21:36:40', NULL, 0, NULL, NULL),
(47, 18, '2026-04-08', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 21:41:27', '2026-04-07 21:41:27', NULL, 0, NULL, NULL),
(48, 18, '2026-04-09', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 21:43:12', '2026-04-07 21:43:12', NULL, 1, 'regular', 'Araw ng Kagitingan'),
(49, 15, '2026-04-08', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-08 01:35:27', '2026-04-08 01:35:27', NULL, 0, NULL, NULL),
(50, 16, '2026-04-08', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-08 01:36:15', '2026-04-08 09:09:38', '-reply messages on messenger\n-job monitoring\n-call for laundry shops for travi\n-monitor workers registration calls and messages', 0, NULL, NULL),
(51, 14, '2026-04-08', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-08 01:45:59', '2026-04-08 01:45:59', NULL, 0, NULL, NULL),
(52, 17, '2026-04-08', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-08 09:02:18', '2026-04-08 09:02:18', NULL, 0, NULL, NULL),
(53, 14, '2026-04-09', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-09 01:35:17', '2026-04-09 01:35:17', NULL, 1, 'regular', 'Araw ng Kagitingan'),
(54, 16, '2026-04-09', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-09 01:35:51', '2026-04-09 01:35:51', NULL, 1, 'regular', 'Araw ng Kagitingan'),
(55, 15, '2026-04-09', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-09 01:39:25', '2026-04-09 01:39:25', NULL, 1, 'regular', 'Araw ng Kagitingan'),
(56, 17, '2026-04-09', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-09 01:40:23', '2026-04-10 01:16:59', NULL, 1, 'regular', 'Araw ng Kagitingan'),
(57, 17, '2026-04-10', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-10 01:16:19', '2026-04-10 01:16:19', NULL, 0, NULL, NULL),
(58, 16, '2026-04-10', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-10 01:24:26', '2026-04-10 01:24:26', NULL, 0, NULL, NULL),
(59, 15, '2026-04-10', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-10 01:25:16', '2026-04-10 01:25:16', NULL, 0, NULL, NULL),
(60, 14, '2026-04-10', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-10 01:25:58', '2026-04-10 01:25:58', NULL, 0, NULL, NULL),
(61, 15, '2026-04-11', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-11 01:06:59', '2026-04-11 01:06:59', NULL, 0, NULL, NULL),
(62, 16, '2026-04-11', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-11 01:09:15', '2026-04-11 01:09:15', NULL, 0, NULL, NULL),
(63, 15, '2026-04-12', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-12 00:04:08', '2026-04-12 00:04:08', NULL, 0, NULL, NULL),
(64, 17, '2026-04-13', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-13 01:25:12', '2026-04-13 01:25:12', NULL, 0, NULL, NULL),
(65, 16, '2026-04-13', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-13 01:25:36', '2026-04-13 01:25:36', NULL, 0, NULL, NULL),
(66, 14, '2026-04-13', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-13 01:25:52', '2026-04-13 01:25:52', NULL, 0, NULL, NULL),
(67, 16, '2026-04-14', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-14 01:23:53', '2026-04-14 01:23:53', NULL, 0, NULL, NULL),
(68, 15, '2026-04-13', NULL, NULL, 0, '13:00', '17:00', 4, NULL, NULL, 0, 4, '2026-04-14 01:26:22', '2026-04-14 01:26:22', NULL, 0, NULL, NULL),
(69, 14, '2026-04-14', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-14 01:27:04', '2026-04-14 01:27:04', NULL, 0, NULL, NULL),
(70, 15, '2026-04-14', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-14 01:27:26', '2026-04-14 01:27:26', NULL, 0, NULL, NULL),
(71, 15, '2026-04-15', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-15 01:33:18', '2026-04-15 01:33:18', NULL, 0, NULL, NULL),
(72, 14, '2026-04-15', '07:00', '12:00', 5, '13:00', '18:00', 5, NULL, NULL, 0, 10, '2026-04-15 10:06:30', '2026-04-15 10:06:30', NULL, 0, NULL, NULL),
(73, 16, '2026-04-15', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-15 10:07:19', '2026-04-15 10:07:19', NULL, 0, NULL, NULL),
(74, 15, '2026-04-16', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-16 01:22:45', '2026-04-16 01:22:45', NULL, 0, NULL, NULL),
(75, 14, '2026-04-16', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-16 01:23:40', '2026-04-16 01:23:40', NULL, 0, NULL, NULL),
(76, 17, '2026-04-14', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-17 08:05:25', '2026-04-17 08:05:25', NULL, 0, NULL, NULL),
(77, 17, '2026-04-15', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-17 08:06:00', '2026-04-17 08:06:00', NULL, 0, NULL, NULL),
(78, 17, '2026-04-16', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-17 08:06:11', '2026-04-17 08:06:11', NULL, 0, NULL, NULL),
(79, 17, '2026-04-17', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-17 08:06:23', '2026-04-17 08:06:23', NULL, 0, NULL, NULL),
(80, 15, '2026-04-17', NULL, NULL, 0, '13:00', '18:00', 5, NULL, NULL, 0, 5, '2026-04-17 08:06:58', '2026-04-17 08:07:15', NULL, 0, NULL, NULL),
(81, 14, '2026-04-17', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-17 08:08:00', '2026-04-17 08:08:00', NULL, 0, NULL, NULL),
(82, 15, '2026-04-18', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-18 09:56:26', '2026-04-18 09:56:26', NULL, 0, NULL, NULL),
(83, 14, '2026-04-18', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-18 09:56:48', '2026-04-18 09:56:48', NULL, 0, NULL, NULL),
(84, 15, '2026-04-19', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-19 00:08:55', '2026-04-19 00:08:55', NULL, 0, NULL, NULL),
(85, 17, '2026-04-20', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-20 08:57:12', '2026-04-20 08:57:12', NULL, 0, NULL, NULL),
(86, 16, '2026-04-20', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-20 08:57:52', '2026-04-20 08:57:52', NULL, 0, NULL, NULL),
(87, 15, '2026-04-20', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-20 08:58:31', '2026-04-20 08:58:31', NULL, 0, NULL, NULL),
(88, 14, '2026-04-20', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-20 08:59:10', '2026-04-20 08:59:10', NULL, 0, NULL, NULL),
(89, 16, '2026-04-21', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-21 01:03:02', '2026-04-21 01:03:02', NULL, 0, NULL, NULL),
(90, 14, '2026-04-21', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-21 01:03:55', '2026-04-21 01:03:55', NULL, 0, NULL, NULL),
(91, 17, '2026-04-22', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-22 09:24:34', '2026-04-22 09:24:34', NULL, 0, NULL, NULL),
(92, 17, '2026-04-21', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-22 09:24:56', '2026-04-22 09:24:56', NULL, 0, NULL, NULL),
(93, 16, '2026-04-22', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-22 09:26:25', '2026-04-22 09:26:25', NULL, 0, NULL, NULL),
(94, 15, '2026-04-22', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-22 09:27:21', '2026-04-22 09:27:21', NULL, 0, NULL, NULL),
(95, 14, '2026-04-22', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-22 09:27:44', '2026-04-22 09:27:44', NULL, 0, NULL, NULL),
(96, 16, '2026-04-23', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-23 09:50:14', '2026-04-23 09:50:14', NULL, 0, NULL, NULL),
(97, 14, '2026-04-23', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-23 09:54:35', '2026-04-23 09:54:35', NULL, 0, NULL, NULL),
(98, 16, '2026-04-25', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-25 08:56:36', '2026-04-25 08:56:36', NULL, 0, NULL, NULL),
(99, 15, '2026-04-25', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-25 08:57:27', '2026-04-25 08:57:27', NULL, 0, NULL, NULL),
(100, 16, '2026-04-26', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-26 09:48:57', '2026-04-26 09:48:57', NULL, 0, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Shifts`
--
ALTER TABLE `Shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employeeId` (`employeeId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Shifts`
--
ALTER TABLE `Shifts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=101;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Shifts`
--
ALTER TABLE `Shifts`
  ADD CONSTRAINT `Shifts_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
