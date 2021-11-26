SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";

--
-- Database: `users`
--

-- --------------------------------------------------------

--
-- Table structure for table `Experiment`
--

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
(1, 'databaits_pilot', 0, 'csprofessors');

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
(2, 1, 'normal_no_experiment', 1, '2021-11-26 12:47:12');

-- --------------------------------------------------------

--
-- Table structure for table `ExperimentRole_Session`
--

CREATE TABLE `ExperimentRole_Session` (
  `idSession` int(11) NOT NULL,
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
-- Indexes for table `ExperimentRole_Session`
--
ALTER TABLE `ExperimentRole_Session`
  ADD KEY `_fk_experimentrole` (`idExperimentRole`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Experiment`
--
ALTER TABLE `Experiment`
  MODIFY `idExperiment` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `ExperimentRole`
--
ALTER TABLE `ExperimentRole`
  MODIFY `idExperimentRole` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `ExperimentRole`
--
ALTER TABLE `ExperimentRole`
  ADD CONSTRAINT `_fk_experimentrole__experiment_ahsdgf163` FOREIGN KEY (`idExperiment`) REFERENCES `Experiment` (`idExperiment`);

--
-- Constraints for table `ExperimentRole_Session`
--
ALTER TABLE `ExperimentRole_Session`
  ADD CONSTRAINT `_fk_experimentrole` FOREIGN KEY (`idExperimentRole`) REFERENCES `ExperimentRole` (`idExperimentRole`);

--
-- Unique Index for table `ExperimentRole_Session`
--
ALTER TABLE ExperimentRole_Session ADD UNIQUE unique_index(idSession, idExperimentRole);