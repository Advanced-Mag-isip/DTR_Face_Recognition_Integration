-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 27, 2026 at 04:17 PM
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
-- Table structure for table `departments`
--

CREATE TABLE `departments` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `isActive` tinyint(1) DEFAULT '1',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `departments`
--

INSERT INTO `departments` (`id`, `name`, `description`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'IT', 'Information Technology', 1, '2026-04-01 04:41:22', '2026-04-01 04:41:22'),
(2, 'HR', 'Human Resources', 1, '2026-04-01 04:41:22', '2026-04-01 04:41:22'),
(3, 'Marketing', 'Marketing and Communications', 1, '2026-04-01 04:41:22', '2026-04-01 04:41:22');

-- --------------------------------------------------------

--
-- Table structure for table `Holidays`
--

CREATE TABLE `Holidays` (
  `id` int NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `date` date NOT NULL,
  `type` enum('regular','special_non_working','special_working') COLLATE utf8mb4_general_ci NOT NULL,
  `description` text COLLATE utf8mb4_general_ci,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Holidays`
--

INSERT INTO `Holidays` (`id`, `name`, `date`, `type`, `description`, `createdAt`, `updatedAt`) VALUES
(1, 'Araw ng Kagitingan', '2026-04-09', 'regular', NULL, '2026-04-01 04:16:15', '2026-04-01 04:16:15'),
(2, 'Black Saturday', '2026-04-04', 'special_non_working', NULL, '2026-04-01 05:09:33', '2026-04-01 05:09:33'),
(3, 'Maundy Thursday', '2026-04-02', 'regular', '', '2026-04-03 07:34:56', '2026-04-03 07:36:35'),
(4, 'Good Friday', '2026-04-03', 'regular', '', '2026-04-03 07:35:20', '2026-04-03 07:36:45');

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
  `holidayName` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `isPaid` tinyint(1) DEFAULT '0',
  `paidAt` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Shifts`
--

INSERT INTO `Shifts` (`id`, `employeeId`, `date`, `morningTimeIn`, `morningTimeOut`, `morningHours`, `afternoonTimeIn`, `afternoonTimeOut`, `afternoonHours`, `overtimeTimeIn`, `overtimeTimeOut`, `overtimeHours`, `totalHours`, `createdAt`, `updatedAt`, `notes`, `isHoliday`, `holidayType`, `holidayName`, `isPaid`, `paidAt`) VALUES
(21, 16, '2026-04-01', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-02 05:23:20', '2026-04-02 05:23:20', 'Training (Job monitoring and replying Facebook messenger), scanned workers documents', 0, NULL, NULL, 0, NULL),
(22, 15, '2026-04-01', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-02 05:24:19', '2026-04-02 05:26:58', 'Job monitoring, train new hire, collect reports/issues encountered, edit calendar (schedule)', 0, NULL, NULL, 0, NULL),
(23, 14, '2026-04-01', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-02 05:30:02', '2026-04-02 05:30:02', 'Reply Facebook messenger, monitor workers registration, and input report/issues encountered both for workers and customers in process documentation sheets', 0, NULL, NULL, 0, NULL),
(24, 14, '2026-04-02', '08:00', '12:00', 4, '13:00', '17:00', 4, NULL, NULL, 0, 8, '2026-04-02 05:33:28', '2026-04-03 07:37:26', 'Job monitoring, reply Facebook messenger, monitor workers registration, created a step-by-step guide on how to book through Trabahadoor app', 1, 'regular', 'Maundy Thursday', 0, NULL),
(25, 14, '2026-04-03', '08:00', '12:00', 4, '13:00', '17:00', 4, NULL, NULL, 0, 8, '2026-04-02 23:55:26', '2026-04-03 07:37:42', NULL, 1, 'regular', 'Good Friday', 0, NULL),
(26, 16, '2026-04-06', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:00:39', '2026-04-06 01:00:39', NULL, 0, NULL, NULL, 0, NULL),
(27, 15, '2026-04-04', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:01:25', '2026-04-06 01:01:25', 'Job monitoring, reply Facebook messenger', 1, 'special_non_working', 'Black Saturday', 0, NULL),
(28, 15, '2026-04-05', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:01:45', '2026-04-06 01:01:45', 'Job monitoring, reply Facebook messenger', 0, NULL, NULL, 0, NULL),
(29, 15, '2026-04-06', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:02:07', '2026-04-06 01:02:07', 'Job monitoring, reply Facebook messenger', 0, NULL, NULL, 0, NULL),
(30, 14, '2026-04-06', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:02:38', '2026-04-06 01:02:38', NULL, 0, NULL, NULL, 0, NULL),
(31, 16, '2026-03-25', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:08:12', '2026-04-06 01:11:34', 'Training', 0, NULL, NULL, 0, NULL),
(32, 16, '2026-03-26', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:09:06', '2026-04-06 01:09:06', 'Training', 0, NULL, NULL, 0, NULL),
(33, 16, '2026-03-27', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:10:36', '2026-04-06 01:10:36', 'Training', 0, NULL, NULL, 0, NULL),
(34, 16, '2026-03-28', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:10:47', '2026-04-06 01:10:47', 'Training', 0, NULL, NULL, 0, NULL),
(35, 16, '2026-03-30', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:11:15', '2026-04-06 01:11:15', 'Training', 0, NULL, NULL, 0, NULL),
(36, 16, '2026-03-31', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-06 01:12:05', '2026-04-06 01:12:05', 'Scanned workers documents', 0, NULL, NULL, 0, NULL),
(37, 16, '2026-04-07', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 01:10:36', '2026-04-07 09:02:01', 'Job monitoring (guided), scanned workers documents', 0, NULL, NULL, 0, NULL),
(38, 15, '2026-04-07', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 01:11:49', '2026-04-07 09:12:22', 'Guide intern (Job monitoring, scanned workers documents), message customer (piso winner and marketing purposes)', 0, NULL, NULL, 0, NULL),
(39, 14, '2026-04-07', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 01:12:21', '2026-04-07 09:10:07', 'Onboard, monitor workers registration, reply Facebook messenger', 0, NULL, NULL, 0, NULL),
(40, 17, '2026-04-07', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-07 01:24:03', '2026-04-07 01:24:03', NULL, 0, NULL, NULL, 0, NULL),
(41, 17, '2026-04-01', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-07 01:25:11', '2026-04-07 01:25:11', NULL, 0, NULL, NULL, 0, NULL),
(42, 17, '2026-04-06', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-07 01:25:29', '2026-04-07 01:25:29', NULL, 0, NULL, NULL, 0, NULL),
(45, 18, '2026-04-07', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 21:29:30', '2026-04-27 11:53:13', NULL, 0, NULL, NULL, 1, '2026-04-27 11:53:13'),
(46, 18, '2026-04-06', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 21:36:40', '2026-04-27 11:53:13', NULL, 0, NULL, NULL, 1, '2026-04-27 11:53:13'),
(47, 18, '2026-04-08', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 21:41:27', '2026-04-27 11:53:13', NULL, 0, NULL, NULL, 1, '2026-04-27 11:53:13'),
(48, 18, '2026-04-09', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-07 21:43:12', '2026-04-27 11:55:16', NULL, 1, 'regular', 'Araw ng Kagitingan', 1, '2026-04-27 11:55:16'),
(49, 15, '2026-04-08', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-08 01:35:27', '2026-04-08 01:35:27', NULL, 0, NULL, NULL, 0, NULL),
(50, 16, '2026-04-08', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-08 01:36:15', '2026-04-08 09:09:38', '-reply messages on messenger\n-job monitoring\n-call for laundry shops for travi\n-monitor workers registration calls and messages', 0, NULL, NULL, 0, NULL),
(51, 14, '2026-04-08', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-08 01:45:59', '2026-04-08 01:45:59', NULL, 0, NULL, NULL, 0, NULL),
(52, 17, '2026-04-08', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-08 09:02:18', '2026-04-08 09:02:18', NULL, 0, NULL, NULL, 0, NULL),
(53, 14, '2026-04-09', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-09 01:35:17', '2026-04-09 01:35:17', NULL, 1, 'regular', 'Araw ng Kagitingan', 0, NULL),
(54, 16, '2026-04-09', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-09 01:35:51', '2026-04-09 01:35:51', NULL, 1, 'regular', 'Araw ng Kagitingan', 0, NULL),
(55, 15, '2026-04-09', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-09 01:39:25', '2026-04-09 01:39:25', NULL, 1, 'regular', 'Araw ng Kagitingan', 0, NULL),
(56, 17, '2026-04-09', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-09 01:40:23', '2026-04-10 01:16:59', NULL, 1, 'regular', 'Araw ng Kagitingan', 0, NULL),
(57, 17, '2026-04-10', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-10 01:16:19', '2026-04-10 01:16:19', NULL, 0, NULL, NULL, 0, NULL),
(58, 16, '2026-04-10', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-10 01:24:26', '2026-04-10 01:24:26', NULL, 0, NULL, NULL, 0, NULL),
(59, 15, '2026-04-10', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-10 01:25:16', '2026-04-10 01:25:16', NULL, 0, NULL, NULL, 0, NULL),
(60, 14, '2026-04-10', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-10 01:25:58', '2026-04-10 01:25:58', NULL, 0, NULL, NULL, 0, NULL),
(61, 15, '2026-04-11', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-11 01:06:59', '2026-04-11 01:06:59', NULL, 0, NULL, NULL, 0, NULL),
(62, 16, '2026-04-11', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-11 01:09:15', '2026-04-11 01:09:15', NULL, 0, NULL, NULL, 0, NULL),
(63, 15, '2026-04-12', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-12 00:04:08', '2026-04-12 00:04:08', NULL, 0, NULL, NULL, 0, NULL),
(64, 17, '2026-04-13', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-13 01:25:12', '2026-04-13 01:25:12', NULL, 0, NULL, NULL, 0, NULL),
(65, 16, '2026-04-13', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-13 01:25:36', '2026-04-13 01:25:36', NULL, 0, NULL, NULL, 0, NULL),
(66, 14, '2026-04-13', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-13 01:25:52', '2026-04-13 01:25:52', NULL, 0, NULL, NULL, 0, NULL),
(67, 16, '2026-04-14', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-14 01:23:53', '2026-04-14 01:23:53', NULL, 0, NULL, NULL, 0, NULL),
(68, 15, '2026-04-13', NULL, NULL, 0, '13:00', '17:00', 4, NULL, NULL, 0, 4, '2026-04-14 01:26:22', '2026-04-14 01:26:22', NULL, 0, NULL, NULL, 0, NULL),
(69, 14, '2026-04-14', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-14 01:27:04', '2026-04-14 01:27:04', NULL, 0, NULL, NULL, 0, NULL),
(70, 15, '2026-04-14', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-14 01:27:26', '2026-04-14 01:27:26', NULL, 0, NULL, NULL, 0, NULL),
(71, 15, '2026-04-15', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-15 01:33:18', '2026-04-15 01:33:18', NULL, 0, NULL, NULL, 0, NULL),
(72, 14, '2026-04-15', '07:00', '12:00', 5, '13:00', '18:00', 5, NULL, NULL, 0, 10, '2026-04-15 10:06:30', '2026-04-15 10:06:30', NULL, 0, NULL, NULL, 0, NULL),
(73, 16, '2026-04-15', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-15 10:07:19', '2026-04-15 10:07:19', NULL, 0, NULL, NULL, 0, NULL),
(74, 15, '2026-04-16', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-16 01:22:45', '2026-04-16 01:22:45', NULL, 0, NULL, NULL, 0, NULL),
(75, 14, '2026-04-16', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-16 01:23:40', '2026-04-16 01:23:40', NULL, 0, NULL, NULL, 0, NULL),
(76, 17, '2026-04-14', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-17 08:05:25', '2026-04-17 08:05:25', NULL, 0, NULL, NULL, 0, NULL),
(77, 17, '2026-04-15', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-17 08:06:00', '2026-04-17 08:06:00', NULL, 0, NULL, NULL, 0, NULL),
(78, 17, '2026-04-16', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-17 08:06:11', '2026-04-17 08:06:11', NULL, 0, NULL, NULL, 0, NULL),
(79, 17, '2026-04-17', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-17 08:06:23', '2026-04-17 08:06:23', NULL, 0, NULL, NULL, 0, NULL),
(80, 15, '2026-04-17', NULL, NULL, 0, '13:00', '18:00', 5, NULL, NULL, 0, 5, '2026-04-17 08:06:58', '2026-04-17 08:07:15', NULL, 0, NULL, NULL, 0, NULL),
(81, 14, '2026-04-17', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-17 08:08:00', '2026-04-17 08:08:00', NULL, 0, NULL, NULL, 0, NULL),
(82, 15, '2026-04-18', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-18 09:56:26', '2026-04-18 09:56:26', NULL, 0, NULL, NULL, 0, NULL),
(83, 14, '2026-04-18', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-18 09:56:48', '2026-04-18 09:56:48', NULL, 0, NULL, NULL, 0, NULL),
(84, 15, '2026-04-19', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-19 00:08:55', '2026-04-19 00:08:55', NULL, 0, NULL, NULL, 0, NULL),
(85, 17, '2026-04-20', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-20 08:57:12', '2026-04-20 08:57:12', NULL, 0, NULL, NULL, 0, NULL),
(86, 16, '2026-04-20', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-20 08:57:52', '2026-04-20 08:57:52', NULL, 0, NULL, NULL, 0, NULL),
(87, 15, '2026-04-20', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-20 08:58:31', '2026-04-20 08:58:31', NULL, 0, NULL, NULL, 0, NULL),
(88, 14, '2026-04-20', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-20 08:59:10', '2026-04-20 08:59:10', NULL, 0, NULL, NULL, 0, NULL),
(89, 16, '2026-04-21', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-21 01:03:02', '2026-04-21 01:03:02', NULL, 0, NULL, NULL, 0, NULL),
(90, 14, '2026-04-21', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-21 01:03:55', '2026-04-21 01:03:55', NULL, 0, NULL, NULL, 0, NULL),
(91, 17, '2026-04-22', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-22 09:24:34', '2026-04-22 09:24:34', NULL, 0, NULL, NULL, 0, NULL),
(92, 17, '2026-04-21', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-22 09:24:56', '2026-04-22 09:24:56', NULL, 0, NULL, NULL, 0, NULL),
(93, 16, '2026-04-22', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-22 09:26:25', '2026-04-22 09:26:25', NULL, 0, NULL, NULL, 0, NULL),
(94, 15, '2026-04-22', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-22 09:27:21', '2026-04-22 09:27:21', NULL, 0, NULL, NULL, 0, NULL),
(95, 14, '2026-04-22', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-22 09:27:44', '2026-04-22 09:27:44', NULL, 0, NULL, NULL, 0, NULL),
(96, 16, '2026-04-23', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-23 09:50:14', '2026-04-23 09:50:14', NULL, 0, NULL, NULL, 0, NULL),
(97, 14, '2026-04-23', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-23 09:54:35', '2026-04-23 09:54:35', NULL, 0, NULL, NULL, 0, NULL),
(98, 16, '2026-04-25', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-25 08:56:36', '2026-04-25 08:56:36', NULL, 0, NULL, NULL, 0, NULL),
(99, 15, '2026-04-25', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-25 08:57:27', '2026-04-25 08:57:27', NULL, 0, NULL, NULL, 0, NULL),
(100, 16, '2026-04-26', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-26 09:48:57', '2026-04-26 09:48:57', NULL, 0, NULL, NULL, 0, NULL),
(101, 16, '2026-04-24', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-27 06:37:25', '2026-04-27 06:37:25', NULL, 0, NULL, NULL, 0, NULL),
(102, 16, '2026-04-27', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-27 06:37:41', '2026-04-27 06:37:41', NULL, 0, NULL, NULL, 0, NULL),
(103, 15, '2026-04-26', NULL, NULL, 0, '12:00', '19:00', 7, NULL, NULL, 0, 7, '2026-04-27 06:40:14', '2026-04-27 06:40:14', NULL, 0, NULL, NULL, 0, NULL),
(104, 14, '2026-04-27', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-27 06:40:50', '2026-04-27 06:40:50', NULL, 0, NULL, NULL, 0, NULL),
(105, 14, '2026-04-26', NULL, NULL, 0, '12:00', '19:00', 7, NULL, NULL, 0, 7, '2026-04-27 06:41:34', '2026-04-27 06:41:34', NULL, 0, NULL, NULL, 0, NULL),
(106, 14, '2026-04-24', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-27 06:41:59', '2026-04-27 06:41:59', NULL, 0, NULL, NULL, 0, NULL),
(107, 17, '2026-04-23', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-27 06:42:29', '2026-04-27 06:44:13', NULL, 0, NULL, NULL, 0, NULL),
(108, 17, '2026-04-24', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-27 06:42:57', '2026-04-27 06:45:03', NULL, 0, NULL, NULL, 0, NULL),
(109, 17, '2026-04-27', '09:00', '12:00', 3, '13:00', '15:00', 2, NULL, NULL, 0, 5, '2026-04-27 06:43:14', '2026-04-27 06:45:25', NULL, 0, NULL, NULL, 0, NULL),
(110, 18, '2026-04-27', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-27 11:57:49', '2026-04-27 11:57:49', NULL, 0, NULL, NULL, 0, NULL),
(111, 18, '2026-04-26', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-27 11:58:29', '2026-04-27 11:58:29', NULL, 0, NULL, NULL, 0, NULL),
(112, 18, '2026-04-25', '09:00', '12:00', 3, '13:00', '18:00', 5, NULL, NULL, 0, 8, '2026-04-27 12:02:03', '2026-04-27 12:02:03', NULL, 0, NULL, NULL, 0, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `id` int NOT NULL,
  `employeeId` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `firstName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `lastName` varchar(255) COLLATE utf8mb4_general_ci NOT NULL,
  `role` varchar(255) COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'employee',
  `department` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT '1',
  `position` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `overtimeHourlyRate` decimal(10,2) DEFAULT '0.00',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `dailySalary` decimal(10,2) DEFAULT '0.00',
  `hourlyRate` decimal(10,2) DEFAULT '0.00',
  `monthlySalary` decimal(12,2) DEFAULT '0.00',
  `paymentType` enum('monthly','hourly') COLLATE utf8mb4_general_ci DEFAULT 'hourly',
  `paymentMethod` enum('cash','gcash','bank_transfer') COLLATE utf8mb4_general_ci DEFAULT 'gcash',
  `paymentDetails` varchar(255) COLLATE utf8mb4_general_ci DEFAULT NULL,
  `payrollNotes` text COLLATE utf8mb4_general_ci,
  `departmentId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `employeeId`, `password`, `firstName`, `lastName`, `role`, `department`, `isActive`, `position`, `overtimeHourlyRate`, `createdAt`, `updatedAt`, `dailySalary`, `hourlyRate`, `monthlySalary`, `paymentType`, `paymentMethod`, `paymentDetails`, `payrollNotes`, `departmentId`) VALUES
(11, 'ADMIN-001', '$2b$10$8bvPL1wn0mc4MyYjg7UnFOdKF2do7JRRf5BuOvIlHmF5pNh/Rg2pa', 'Admin', 'User', 'admin', 'HR', 1, 'System Administrator', 0.00, '2026-04-01 04:41:22', '2026-04-02 01:37:03', 450.00, 56.25, 0.00, 'hourly', 'gcash', NULL, NULL, 1),
(14, 'EMP-002', '$2b$10$egRcZZWQ5K2xWJOXc8.Kl.bJbt0MyCAEPwu/qjKGojPIUDZNSgfJW', 'Marshyll', 'Aniano', 'employee', 'HR', 1, 'HR', 75.00, '2026-04-02 02:00:30', '2026-04-02 02:12:14', 600.00, 75.00, 0.00, 'hourly', 'gcash', NULL, NULL, NULL),
(15, 'EMP-003', '$2b$10$xD10JZ9IlmRpcflJs.BqROqyvQefDF.gQkDaoKKlZjgodzEPc.tL6', 'Juliana Marie', 'Rodrigo', 'employee', 'HR', 1, 'HR', 62.50, '2026-04-02 02:11:12', '2026-04-27 11:13:07', 500.00, 62.50, 0.00, 'hourly', 'gcash', NULL, '', NULL),
(16, 'EMP-004', '$2b$10$Kyw/ytQho51pioIa4V8Br.mq0gHwmVWSHqKkqBadhj3NmrSTqhIya', 'Jenky', 'Capito', 'employee', 'HR', 1, 'HR', 56.88, '2026-04-02 02:14:10', '2026-04-08 01:34:08', 455.00, 56.88, 0.00, 'hourly', 'gcash', NULL, NULL, NULL),
(17, 'EMP-005', '$2b$10$8w8sLuDwtnNZBXjpXiQjVeIAjKpqck7PvaU35uul6cgUROAlCZAgi', 'Ray Rendel', 'Serrano', 'employee', 'IT', 1, 'Intern', 0.00, '2026-04-07 01:23:22', '2026-04-07 01:24:54', 0.00, 0.00, 0.00, 'hourly', 'gcash', NULL, NULL, NULL),
(18, 'EMP-006', '$2b$10$LhAYYhBxKxjsImU94D/Ykeh6QcPz7ogzEed8F5qceLj1DixPM4cN2', 'Test', 'Test', 'employee', 'IT', 1, 'Test', 0.00, '2026-04-07 09:09:37', '2026-04-07 09:09:37', 400.00, 50.00, 0.00, 'hourly', 'gcash', NULL, NULL, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `departments`
--
ALTER TABLE `departments`
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
  ADD UNIQUE KEY `name_34` (`name`);

--
-- Indexes for table `Holidays`
--
ALTER TABLE `Holidays`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `date` (`date`),
  ADD UNIQUE KEY `date_2` (`date`),
  ADD UNIQUE KEY `date_3` (`date`),
  ADD UNIQUE KEY `date_4` (`date`),
  ADD UNIQUE KEY `date_5` (`date`),
  ADD UNIQUE KEY `date_6` (`date`),
  ADD UNIQUE KEY `date_7` (`date`),
  ADD UNIQUE KEY `date_8` (`date`),
  ADD UNIQUE KEY `date_9` (`date`),
  ADD UNIQUE KEY `date_10` (`date`),
  ADD UNIQUE KEY `date_11` (`date`),
  ADD UNIQUE KEY `date_12` (`date`),
  ADD UNIQUE KEY `date_13` (`date`),
  ADD UNIQUE KEY `date_14` (`date`);

--
-- Indexes for table `Shifts`
--
ALTER TABLE `Shifts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `employeeId` (`employeeId`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employeeId` (`employeeId`),
  ADD KEY `departmentId` (`departmentId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `departments`
--
ALTER TABLE `departments`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `Holidays`
--
ALTER TABLE `Holidays`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `Shifts`
--
ALTER TABLE `Shifts`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=113;

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Shifts`
--
ALTER TABLE `Shifts`
  ADD CONSTRAINT `Shifts_ibfk_1` FOREIGN KEY (`employeeId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Users`
--
ALTER TABLE `Users`
  ADD CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
