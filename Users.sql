-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Apr 26, 2026 at 02:39 PM
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
  `departmentId` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `employeeId`, `password`, `firstName`, `lastName`, `role`, `department`, `isActive`, `position`, `overtimeHourlyRate`, `createdAt`, `updatedAt`, `dailySalary`, `departmentId`) VALUES
(11, 'ADMIN-001', '$2b$10$8bvPL1wn0mc4MyYjg7UnFOdKF2do7JRRf5BuOvIlHmF5pNh/Rg2pa', 'Admin', 'User', 'admin', 'HR', 1, 'System Administrator', 0.00, '2026-04-01 04:41:22', '2026-04-02 01:37:03', 450.00, 1),
(14, 'EMP-002', '$2b$10$egRcZZWQ5K2xWJOXc8.Kl.bJbt0MyCAEPwu/qjKGojPIUDZNSgfJW', 'Marshyll', 'Aniano', 'employee', 'HR', 1, 'HR', 75.00, '2026-04-02 02:00:30', '2026-04-02 02:12:14', 600.00, NULL),
(15, 'EMP-003', '$2b$10$xD10JZ9IlmRpcflJs.BqROqyvQefDF.gQkDaoKKlZjgodzEPc.tL6', 'Juliana Marie', 'Rodrigo', 'employee', 'HR', 1, 'HR', 62.50, '2026-04-02 02:11:12', '2026-04-08 01:33:07', 500.00, NULL),
(16, 'EMP-004', '$2b$10$Kyw/ytQho51pioIa4V8Br.mq0gHwmVWSHqKkqBadhj3NmrSTqhIya', 'Jenky', 'Capito', 'employee', 'HR', 1, 'HR', 56.88, '2026-04-02 02:14:10', '2026-04-08 01:34:08', 455.00, NULL),
(17, 'EMP-005', '$2b$10$8w8sLuDwtnNZBXjpXiQjVeIAjKpqck7PvaU35uul6cgUROAlCZAgi', 'Ray Rendel', 'Serrano', 'employee', 'IT', 1, 'Intern', 0.00, '2026-04-07 01:23:22', '2026-04-07 01:24:54', 0.00, NULL),
(18, 'EMP-006', '$2b$10$LhAYYhBxKxjsImU94D/Ykeh6QcPz7ogzEed8F5qceLj1DixPM4cN2', 'Test', 'Test', 'employee', 'IT', 1, 'Test', 0.00, '2026-04-07 09:09:37', '2026-04-07 09:09:37', 400.00, NULL);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `employeeId` (`employeeId`),
  ADD UNIQUE KEY `employeeId_2` (`employeeId`),
  ADD UNIQUE KEY `employeeId_3` (`employeeId`),
  ADD UNIQUE KEY `employeeId_4` (`employeeId`),
  ADD UNIQUE KEY `employeeId_5` (`employeeId`),
  ADD UNIQUE KEY `employeeId_6` (`employeeId`),
  ADD UNIQUE KEY `employeeId_7` (`employeeId`),
  ADD UNIQUE KEY `employeeId_8` (`employeeId`),
  ADD UNIQUE KEY `employeeId_9` (`employeeId`),
  ADD UNIQUE KEY `employeeId_10` (`employeeId`),
  ADD UNIQUE KEY `employeeId_11` (`employeeId`),
  ADD UNIQUE KEY `employeeId_12` (`employeeId`),
  ADD UNIQUE KEY `employeeId_13` (`employeeId`),
  ADD UNIQUE KEY `employeeId_14` (`employeeId`),
  ADD UNIQUE KEY `employeeId_15` (`employeeId`),
  ADD UNIQUE KEY `employeeId_16` (`employeeId`),
  ADD UNIQUE KEY `employeeId_17` (`employeeId`),
  ADD UNIQUE KEY `employeeId_18` (`employeeId`),
  ADD UNIQUE KEY `employeeId_19` (`employeeId`),
  ADD UNIQUE KEY `employeeId_20` (`employeeId`),
  ADD UNIQUE KEY `employeeId_21` (`employeeId`),
  ADD UNIQUE KEY `employeeId_22` (`employeeId`),
  ADD UNIQUE KEY `employeeId_23` (`employeeId`),
  ADD UNIQUE KEY `employeeId_24` (`employeeId`),
  ADD UNIQUE KEY `employeeId_25` (`employeeId`),
  ADD UNIQUE KEY `employeeId_26` (`employeeId`),
  ADD UNIQUE KEY `employeeId_27` (`employeeId`),
  ADD UNIQUE KEY `employeeId_28` (`employeeId`),
  ADD UNIQUE KEY `employeeId_29` (`employeeId`),
  ADD UNIQUE KEY `employeeId_30` (`employeeId`),
  ADD UNIQUE KEY `employeeId_31` (`employeeId`),
  ADD UNIQUE KEY `employeeId_32` (`employeeId`),
  ADD UNIQUE KEY `employeeId_33` (`employeeId`),
  ADD UNIQUE KEY `employeeId_34` (`employeeId`),
  ADD UNIQUE KEY `employeeId_35` (`employeeId`),
  ADD UNIQUE KEY `employeeId_36` (`employeeId`),
  ADD UNIQUE KEY `employeeId_37` (`employeeId`),
  ADD UNIQUE KEY `employeeId_38` (`employeeId`),
  ADD UNIQUE KEY `employeeId_39` (`employeeId`),
  ADD UNIQUE KEY `employeeId_40` (`employeeId`),
  ADD UNIQUE KEY `employeeId_41` (`employeeId`),
  ADD UNIQUE KEY `employeeId_42` (`employeeId`),
  ADD UNIQUE KEY `employeeId_43` (`employeeId`),
  ADD UNIQUE KEY `employeeId_44` (`employeeId`),
  ADD UNIQUE KEY `employeeId_45` (`employeeId`),
  ADD UNIQUE KEY `employeeId_46` (`employeeId`),
  ADD UNIQUE KEY `employeeId_47` (`employeeId`),
  ADD UNIQUE KEY `employeeId_48` (`employeeId`),
  ADD UNIQUE KEY `employeeId_49` (`employeeId`),
  ADD UNIQUE KEY `employeeId_50` (`employeeId`),
  ADD UNIQUE KEY `employeeId_51` (`employeeId`),
  ADD UNIQUE KEY `employeeId_52` (`employeeId`),
  ADD UNIQUE KEY `employeeId_53` (`employeeId`),
  ADD UNIQUE KEY `employeeId_54` (`employeeId`),
  ADD UNIQUE KEY `employeeId_55` (`employeeId`),
  ADD UNIQUE KEY `employeeId_56` (`employeeId`),
  ADD UNIQUE KEY `employeeId_57` (`employeeId`),
  ADD UNIQUE KEY `employeeId_58` (`employeeId`),
  ADD UNIQUE KEY `employeeId_59` (`employeeId`),
  ADD UNIQUE KEY `employeeId_60` (`employeeId`),
  ADD UNIQUE KEY `employeeId_61` (`employeeId`),
  ADD UNIQUE KEY `employeeId_62` (`employeeId`),
  ADD KEY `departmentId` (`departmentId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Users`
--
ALTER TABLE `Users`
  ADD CONSTRAINT `Users_ibfk_1` FOREIGN KEY (`departmentId`) REFERENCES `departments` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
