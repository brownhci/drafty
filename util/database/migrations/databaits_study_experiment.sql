-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 07, 2021 at 03:15 AM
-- Server version: 5.7.23
-- PHP Version: 7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `users`
--

-- --------------------------------------------------------

--
-- Table structure for table `Experiment`
--

DROP TABLE IF EXISTS `ExperimentRole_Session`;
DROP TABLE IF EXISTS `Experiment_Role_Session`;
DROP TABLE IF EXISTS `ExperimentRole`;
DROP TABLE IF EXISTS `Experiment`;

CREATE TABLE `Experiment` (
  `idExperiment` int(11) NOT NULL,
  `experiment` varchar(45) DEFAULT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '0',
  `dataset` varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Experiment`
--

INSERT INTO `Experiment` (`idExperiment`, `experiment`, `active`, `dataset`) VALUES
(1, 'databaits_pilot', 1, 'csprofessors'),
(3, 'databaits', 1, 'csprofessors');

-- --------------------------------------------------------

--
-- Table structure for table `ExperimentRole`
--

CREATE TABLE `ExperimentRole` (
  `idExperimentRole` int(11) NOT NULL,
  `idExperiment` int(11) NOT NULL,
  `role` varchar(25) NOT NULL,
  `active` smallint(1) NOT NULL DEFAULT '0',
  `created` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `ExperimentRole`
--

INSERT INTO `ExperimentRole` (`idExperimentRole`, `idExperiment`, `role`, `active`, `created`) VALUES
(1, 1, 'active_after_every_edit', 1, '2021-11-26 12:46:51'),
(2, 1, 'normal_no_experiment', 1, '2021-11-26 12:47:12'),
(3, 3, 'active_after_every_edit', 1, '2021-12-05 13:03:13'),
(4, 3, 'normal_no_experiment', 1, '2021-12-05 13:03:33');

-- --------------------------------------------------------

--
-- Table structure for table `Experiment_Role_Session`
--

CREATE TABLE `Experiment_Role_Session` (
  `idSession` int(11) NOT NULL,
  `idExperiment` int(11) NOT NULL,
  `idExperimentRole` int(11) NOT NULL,
  `created` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Experiment`
--
ALTER TABLE `Experiment`
  ADD PRIMARY KEY (`idExperiment`);

--
-- Indexes for table `ExperimentRole`
--
ALTER TABLE `ExperimentRole`
  ADD PRIMARY KEY (`idExperimentRole`),
  ADD KEY `_fk_experimentrole__experiment_ahsdgf163` (`idExperiment`);

--
-- Indexes for table `Experiment_Role_Session`
--
ALTER TABLE `Experiment_Role_Session`
  ADD UNIQUE KEY `unique_index` (`idSession`,`idExperimentRole`,`idExperiment`) USING BTREE,
  ADD KEY `_fk_experimentrole` (`idExperimentRole`),
  ADD KEY `_index_idExperiment_81o2ygradfv` (`idExperiment`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Experiment`
--
ALTER TABLE `Experiment`
  MODIFY `idExperiment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `ExperimentRole`
--
ALTER TABLE `ExperimentRole`
  MODIFY `idExperimentRole` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ExperimentRole`
--
ALTER TABLE `ExperimentRole`
  ADD CONSTRAINT `_fk_experimentrole__experiment_ahsdgf163` FOREIGN KEY (`idExperiment`) REFERENCES `Experiment` (`idExperiment`);

--
-- Constraints for table `Experiment_Role_Session`
--
ALTER TABLE `Experiment_Role_Session`
  ADD CONSTRAINT `_fk_experiment` FOREIGN KEY (`idExperiment`) REFERENCES `Experiment` (`idExperiment`),
  ADD CONSTRAINT `_fk_experimentrole` FOREIGN KEY (`idExperimentRole`) REFERENCES `ExperimentRole` (`idExperimentRole`);
