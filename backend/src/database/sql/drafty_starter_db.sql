-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 02, 2020 at 03:45 AM
-- Server version: 5.7.23
-- PHP Version: 7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `2300profs`
--
CREATE DATABASE IF NOT EXISTS `2300profs` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `2300profs`;

-- --------------------------------------------------------

--
-- Table structure for table `Alias`
--

CREATE TABLE `Alias` (
  `idAlias` int(11) NOT NULL,
  `idSuggestion` int(11) NOT NULL,
  `alias` varchar(500) DEFAULT NULL,
  `count` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Alias`
--

INSERT INTO `Alias` (`idAlias`, `idSuggestion`, `alias`, `count`) VALUES
(1, 20201, 'Yale University', 0),
(2, 424584, '7965', 0),
(3, 402073, 'Stanford University', 0),
(4, 426996, '6964', 0),
(5, 15501, 'University of Michigan', 0),
(6, 404085, 'Massachusetts Institute of Technology - USA', 0),
(7, 404086, 'University of Michigan - USA', 0),
(8, 15502, '', 0),
(9, 423580, '7965', 0),
(10, 391477, 'Jadavpur University', 0),
(11, 70, '', 0),
(12, 391473, 'Male', 0),
(13, 420234, '2', 0),
(14, 420248, '8010', 0),
(15, 420380, '1062', 0),
(16, 420276, '1062', 0),
(17, 422344, '1231', 0),
(18, 420330, '2', 0),
(19, 391146, '2014', 0),
(20, 426008, '1799', 0),
(27, 402077, 'Graphics', 0),
(28, 391364, 'Other', 0),
(29, 426038, '2', 0),
(30, 391506, 'Other', 0),
(31, 426058, '8429', 0),
(32, 391046, 'Other', 0),
(33, 426000, '2', 0),
(34, 391250, 'Other', 0),
(35, 426024, '2', 0),
(36, 391384, 'Other', 0),
(37, 426040, '2', 0),
(38, 391446, 'Other', 0),
(39, 426050, '2', 0),
(41, 426050, '8', 0),
(42, 3, 'Full', 0),
(43, 420220, '3459', 0),
(44, 414930, 'Security & Privacy', 0),
(45, 415819, '', 0),
(46, 427683, '1', 0),
(47, 416214, '', 0),
(48, 427729, 'Associate', 0),
(49, 427734, 'swallace', 0),
(51, 427699, 'swallace', 0),
(52, 391025, 'Assistant', 0),
(53, 425996, 'system', 0),
(54, 387400, 'Hong Kong University of Science and Technology - Hong Kong', 0),
(55, 391405, 'Graphics', 0),
(56, 426044, 'system', 0),
(57, 391312, 'Graphics', 0),
(58, 426030, 'system', 0),
(60, 426030, '8', 0),
(61, 391188, 'Assistant', 0),
(62, 426014, 'anonymous_user31537938', 0),
(64, 391144, 'Arizona State University', 0),
(65, 391762, 'Boston University', 0),
(66, 426080, 'anonymous_user53838135', 0),
(67, 506, 'University of Illinois at Urbana-Champaign - USA', 0),
(68, 387399, 'Hong Kong University of Science and Technology - Hong Kong', 0),
(69, 508, 'University of Washington - USA', 0),
(71, 399643, 'University of Illinois at Urbana-Champaign - USA', 0),
(72, 387398, 'Nanjing University - China', 0),
(74, 427752, 'University of Calgary - Canada', 0);

-- --------------------------------------------------------

--
-- Table structure for table `Click`
--

CREATE TABLE `Click` (
  `idInteraction` int(11) NOT NULL,
  `idSuggestion` int(11) NOT NULL,
  `rowvalues` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Comment`
--

CREATE TABLE `Comment` (
  `idComment` int(11) NOT NULL,
  `idInteraction` int(11) NOT NULL,
  `idUniqueID` int(11) NOT NULL,
  `idSuggestion` int(11) NOT NULL,
  `idProfile` int(11) NOT NULL,
  `active` tinyint(1) NOT NULL,
  `comment` text,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Copy`
--

CREATE TABLE `Copy` (
  `idInteraction` int(11) NOT NULL,
  `idSuggestion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `CopyColumn`
--

CREATE TABLE `CopyColumn` (
  `idInteraction` int(11) NOT NULL,
  `idSuggestionType` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `DataType`
--

CREATE TABLE `DataType` (
  `idDataType` int(11) NOT NULL,
  `type` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `DataType`
--

INSERT INTO `DataType` (`idDataType`, `type`) VALUES
(1, 'free_text'),
(2, 'dropdown'),
(3, 'dropdown_free_text'),
(4, 'preset'),
(5, 'last_edited_user'),
(6, 'last_edited_date');

-- --------------------------------------------------------

--
-- Table structure for table `DoubleClick`
--

CREATE TABLE `DoubleClick` (
  `idInteraction` int(11) NOT NULL,
  `idSuggestion` int(11) NOT NULL,
  `rowvalues` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Edit`
--

CREATE TABLE `Edit` (
  `IdInteraction` int(11) NOT NULL,
  `idEdit` int(11) NOT NULL,
  `idEntryType` int(11) NOT NULL,
  `mode` varchar(25) NOT NULL DEFAULT 'normal',
  `isCorrect` tinyint(1) DEFAULT '2'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Edit_Suggestion`
--

CREATE TABLE `Edit_Suggestion` (
  `idEdit` int(11) NOT NULL,
  `idSuggestion` int(11) NOT NULL,
  `isPrevSuggestion` tinyint(1) NOT NULL,
  `isNew` tinyint(1) NOT NULL,
  `isChosen` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `EntryType`
--

CREATE TABLE `EntryType` (
  `idEntryType` int(11) NOT NULL,
  `type` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `EntryType`
--

INSERT INTO `EntryType` (`idEntryType`, `type`) VALUES
(1, 'NewRow'),
(2, 'EditOnline'),
(3, 'System'),
(4, 'API'),
(5, 'Import-Profs-Spring-2014'),
(6, 'Import-Profs-Spring-2015'),
(7, 'Import-Profs-Spring-2018');

-- --------------------------------------------------------

--
-- Table structure for table `Experiment`
--

CREATE TABLE `Experiment` (
  `idExperiment` int(11) NOT NULL,
  `experiment` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Experiment_Session`
--

CREATE TABLE `Experiment_Session` (
  `idSession` int(11) NOT NULL,
  `idExperiment` int(11) NOT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Interaction`
--

CREATE TABLE `Interaction` (
  `idInteraction` int(11) NOT NULL,
  `idSession` int(11) NOT NULL,
  `idInteractionType` int(11) NOT NULL,
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `InteractionType`
--

CREATE TABLE `InteractionType` (
  `idInteractionType` int(11) NOT NULL,
  `interaction` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `InteractionType`
--

INSERT INTO `InteractionType` (`idInteractionType`, `interaction`) VALUES
(1, 'click'),
(2, 'selectRange'),
(3, 'viewChange'),
(4, 'sort'),
(5, 'newRecord'),
(6, 'editRecord'),
(7, 'search'),
(8, 'copy'),
(9, 'paste'),
(10, 'doubleClick'),
(11, 'searchMulti'),
(12, 'doubleClick'),
(13, 'searchClear'),
(14, 'copyColumn');

-- --------------------------------------------------------

--
-- Table structure for table `NewRow`
--

CREATE TABLE `NewRow` (
  `idInteraction` int(11) NOT NULL,
  `idSuggestion` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Paste`
--

CREATE TABLE `Paste` (
  `idInteraction` int(11) NOT NULL,
  `idSuggestionBefore` int(11) NOT NULL,
  `idSuggestionAfter` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Profile`
--

CREATE TABLE `Profile` (
  `idProfile` int(11) NOT NULL,
  `idRole` int(11) NOT NULL DEFAULT '2',
  `username` varchar(45) DEFAULT NULL,
  `email` varchar(45) DEFAULT NULL,
  `password` varchar(500) DEFAULT NULL,
  `passwordRaw` varchar(100) DEFAULT NULL,
  `date_created` datetime DEFAULT CURRENT_TIMESTAMP,
  `date_updated` datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Profile`
--

INSERT INTO `Profile` (`idProfile`, `idRole`, `username`, `email`, `password`, `passwordRaw`, `date_created`, `date_updated`) VALUES
(1, 1, 'swallace', 'shaun_wallace@brown.edu', '$2a$10$yNLWB88HUCX5Gthz9jA9WOE8bkRcEkfVfOUKF4VTmMKMtJiTtuHYG', 'q1w2e3r4', '2017-09-27 16:29:38', '2017-09-27 16:29:38'),
(2, 1, 'system', 'sw90@cs.brown.edu', '$2a$10$yNLWB88HUCX5Gthz9jA9WOE8bkRcEkfVfOUKF4VTmMKMtJiTtuHYG', 'q1w2e3r4', '2017-09-27 16:29:38', '2017-09-27 16:29:38'),
(3, 2, 'anonymous_user', NULL, '$2a$10$yNLWB88HUCX5Gthz9jA9WOE8bkRcEkfVfOUKF4VTmMKMtJiTtuHYG', 'q1w2e3r4', '2018-05-12 00:00:00', '2018-05-12 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `Role`
--

CREATE TABLE `Role` (
  `idRole` int(11) NOT NULL,
  `role` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `Role`
--

INSERT INTO `Role` (`idRole`, `role`) VALUES
(1, 'admin'),
(2, 'normal');

-- --------------------------------------------------------

--
-- Table structure for table `Search`
--

CREATE TABLE `Search` (
  `idInteraction` int(11) NOT NULL,
  `idSuggestionType` int(11) NOT NULL,
  `idSearchType` int(11) NOT NULL DEFAULT '3',
  `isPartial` tinyint(1) NOT NULL DEFAULT '1',
  `isMulti` int(1) NOT NULL DEFAULT '0',
  `isFromUrl` int(1) NOT NULL DEFAULT '0',
  `value` varchar(150) DEFAULT NULL,
  `matchedValues` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `SearchMulti`
--

CREATE TABLE `SearchMulti` (
  `idInteraction` int(11) NOT NULL,
  `idSuggestionType` int(11) NOT NULL,
  `idSearchType` int(11) NOT NULL DEFAULT '3',
  `value` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `SearchType`
--

CREATE TABLE `SearchType` (
  `idSearchType` int(11) NOT NULL,
  `type` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `SearchType`
--

INSERT INTO `SearchType` (`idSearchType`, `type`) VALUES
(1, 'equals'),
(2, 'does not equals'),
(3, 'like');

-- --------------------------------------------------------

--
-- Table structure for table `SelectRange`
--

CREATE TABLE `SelectRange` (
  `idInteraction` int(11) NOT NULL,
  `idSuggestion` int(11) NOT NULL,
  `rowvalues` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Session`
--

CREATE TABLE `Session` (
  `idSession` int(11) NOT NULL,
  `idProfile` int(11) DEFAULT NULL,
  `start` datetime DEFAULT NULL,
  `end` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `sessions`
--

CREATE TABLE `sessions` (
  `session_id` varchar(128) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL,
  `expires` int(11) UNSIGNED NOT NULL,
  `data` text CHARACTER SET utf8mb4 COLLATE utf8mb4_bin
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Sort`
--

CREATE TABLE `Sort` (
  `idInteraction` int(11) NOT NULL,
  `idSuggestionType` int(11) NOT NULL,
  `isAsc` tinyint(1) NOT NULL DEFAULT '1',
  `isTrigger` tinyint(1) NOT NULL DEFAULT '1',
  `isMulti` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `Suggestions`
--

CREATE TABLE `Suggestions` (
  `idSuggestion` int(11) NOT NULL,
  `idSuggestionType` int(11) NOT NULL,
  `idUniqueID` int(11) NOT NULL,
  `idProfile` int(11) NOT NULL DEFAULT '2',
  `suggestion` varchar(1500) NOT NULL DEFAULT '',
  `active` tinyint(1) NOT NULL DEFAULT '1',
  `confidence` bigint(255) DEFAULT NULL,
  `last_updated` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `SuggestionType`
--

CREATE TABLE `SuggestionType` (
  `idSuggestionType` int(11) NOT NULL,
  `idDataType` int(11) NOT NULL,
  `name` varchar(45) DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `regex` varchar(150) NOT NULL DEFAULT '.*',
  `makesRowUnique` tinyint(1) DEFAULT '0',
  `canBeBlank` tinyint(1) NOT NULL DEFAULT '0',
  `isDate` tinyint(1) NOT NULL DEFAULT '0',
  `isLink` tinyint(1) NOT NULL DEFAULT '0',
  `isCurrency` tinyint(1) NOT NULL DEFAULT '0',
  `isEditable` int(11) NOT NULL DEFAULT '1',
  `isPrivate` int(11) NOT NULL DEFAULT '0',
  `columnOrder` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `SuggestionType`
--

INSERT INTO `SuggestionType` (`idSuggestionType`, `idDataType`, `name`, `isActive`, `regex`, `makesRowUnique`, `canBeBlank`, `isDate`, `isLink`, `isCurrency`, `isEditable`, `isPrivate`, `columnOrder`) VALUES
(1, 1, 'FullName', 1, '.*', 1, 0, 0, 0, 0, 1, 0, 11),
(2, 3, 'University', 1, '.*', 1, 0, 0, 0, 0, 1, 0, 22),
(3, 3, 'Bachelors', 1, '.*', 0, 1, 0, 0, 0, 1, 0, 66),
(4, 3, 'Masters', 1, '.*', 0, 1, 0, 0, 0, 1, 0, 77),
(5, 3, 'Doctorate', 1, '.*', 0, 1, 0, 0, 0, 1, 0, 88),
(6, 3, 'PostDoc', 1, '.*', 0, 1, 0, 0, 0, 1, 0, 99),
(7, 1, 'JoinYear', 1, '.*', 0, 1, 0, 0, 0, 1, 0, 33),
(8, 4, 'Rank', 1, '.*', 0, 1, 0, 0, 0, 1, 0, 44),
(9, 2, 'SubField', 1, '.*', 0, 1, 0, 0, 0, 1, 0, 55),
(10, 4, 'Gender', 1, '.*', 0, 1, 0, 0, 0, 1, 0, 110),
(11, 1, 'PhotoURL', 1, '.*', 0, 1, 0, 1, 0, 1, 0, 120),
(12, 1, 'Sources', 1, '.*', 0, 1, 0, 1, 0, 1, 0, 130),
(13, 5, 'Last Updated By', 0, '.*', 0, 0, 0, 0, 0, 0, 0, 140),
(14, 6, 'Last Updated', 0, '.*', 0, 0, 1, 0, 0, 0, 0, 150);

-- --------------------------------------------------------

--
-- Table structure for table `SuggestionTypeValues`
--

CREATE TABLE `SuggestionTypeValues` (
  `idSuggestionType` int(11) NOT NULL,
  `value` varchar(150) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `SuggestionTypeValues`
--

INSERT INTO `SuggestionTypeValues` (`idSuggestionType`, `value`) VALUES
(2, 'Arizona State University'),
(2, 'Boston University'),
(2, 'Brandeis University'),
(2, 'Brown University'),
(2, 'California Institute of Technology'),
(2, 'Carnegie Mellon University'),
(2, 'Case Western Reserve University'),
(2, 'Clemson University'),
(2, 'Colorado State University'),
(2, 'Columbia University'),
(2, 'Cornell University'),
(2, 'Dartmouth College'),
(2, 'Duke University'),
(2, 'Florida State University'),
(2, 'George Mason University'),
(2, 'Georgia Institute of Technology'),
(2, 'Harvard University'),
(2, 'Indiana University Bloomington'),
(2, 'Iowa State University'),
(2, 'Johns Hopkins University'),
(2, 'Massachusetts Institute of Technology'),
(2, 'McGill University'),
(2, 'Michigan State University'),
(2, 'Naval Postgraduate University'),
(2, 'New York University'),
(2, 'North Carolina State University'),
(2, 'Northeastern University (USA)'),
(2, 'Northwestern University'),
(2, 'Ohio State University'),
(2, 'Oregon State University'),
(2, 'Pennsylvania State University'),
(2, 'Polytechnic Institute of New York University'),
(2, 'Princeton University'),
(2, 'Purdue University'),
(2, 'Rensselaer Polytechnic Institute'),
(2, 'Rice University'),
(2, 'Rutgers - State University of New Jersey - New Brunswick'),
(2, 'Simon Fraser University (Canada)'),
(2, 'Stanford University'),
(2, 'Stony Brook University'),
(2, 'Texas A&M University'),
(2, 'Tufts University'),
(2, 'University of Alberta'),
(2, 'University of Arizona'),
(2, 'University of British Columbia'),
(2, 'University of Calgary'),
(2, 'University of California - Berkeley'),
(2, 'University of California - Davis'),
(2, 'University of California - Irvine'),
(2, 'University of California - Los Angeles'),
(2, 'University of California - Riverside'),
(2, 'University of California - San Diego'),
(2, 'University of California - Santa Barbara'),
(2, 'University of California - Santa Cruz'),
(2, 'University of Chicago'),
(2, 'University of Colorado Boulder'),
(2, 'University of Delaware'),
(2, 'University of Florida'),
(2, 'University of Illinois at Chicago'),
(2, 'University of Illinois at Urbana-Champaign'),
(2, 'University of Iowa'),
(2, 'University of Maryland - Baltimore County'),
(2, 'University of Maryland - College Park'),
(2, 'University of Massachusetts - Amherst'),
(2, 'University of Michigan'),
(2, 'University of Minnesota - Twin Cities'),
(2, 'University of Nebraska - Lincoln'),
(2, 'University of North Carolina - Chapel Hill'),
(2, 'University of Notre Dame'),
(2, 'University of Oregon'),
(2, 'University of Pennsylvania'),
(2, 'University of Pittsburgh'),
(2, 'University of Rochester'),
(2, 'University of Southern California'),
(2, 'University of Tennessee - Knoxville'),
(2, 'University of Texas - Austin'),
(2, 'University of Texas - Dallas'),
(2, 'University of Toronto'),
(2, 'University of Tulsa'),
(2, 'University of Utah'),
(2, 'University of Virginia'),
(2, 'University of Washington'),
(2, 'University of Waterloo'),
(2, 'University of Wisconsin - Madison'),
(2, 'Vanderbilt University'),
(2, 'Virginia Polytechnic Institute and State University'),
(2, 'Washington State University'),
(2, 'Washington University - St. Louis'),
(2, 'William & Mary'),
(2, 'Yale University'),
(3, 'Alexandria University - Egypt'),
(3, 'American University of Beirut - Lebanon'),
(3, 'Amherst College - USA'),
(3, 'Aristotle University of Thessaloniki - Greece'),
(3, 'Arizona State University - USA'),
(3, 'Bar-Ilan University - Israel'),
(3, 'Ben-Gurion University of the Negev - Israel'),
(3, 'Bilkent University - Turkey'),
(3, 'Birla Institute of Technology and Science - Pilani - India'),
(3, 'Bogaziçi University - Turkey'),
(3, 'Boston University - USA'),
(3, 'Brandeis University - USA'),
(3, 'Brigham Young University - USA'),
(3, 'Brooklyn College - USA'),
(3, 'Brown University - USA'),
(3, 'Cairo University - Cairo - Egypt'),
(3, 'California Institute of Technology - USA'),
(3, 'California Polytechnic State University - USA'),
(3, 'Carleton College - USA'),
(3, 'Carnegie Institute of Technology - USA'),
(3, 'Carnegie Mellon University - USA'),
(3, 'Case Western Reserve University - USA'),
(3, 'Chinese University of Hong Kong - Hong Kong'),
(3, 'City College of New York - USA'),
(3, 'City University of New York - USA'),
(3, 'Clarkson University - USA'),
(3, 'College of William and Mary - USA'),
(3, 'Columbia University - USA'),
(3, 'Cornell University'),
(3, 'Cornell University - USA'),
(3, 'Dartmouth College - USA'),
(3, 'Duke University - USA'),
(3, 'Florida State University - USA'),
(3, 'Fudan University - Shanghai - China'),
(3, 'Georgia Institute of Technology - USA'),
(3, 'Harvard College - USA'),
(3, 'Harvard University - USA'),
(3, 'Hebrew University of Jerusalem - Israel'),
(3, 'Indian Institute of Science - Bangalore - India'),
(3, 'Indian Institute of Technology - Bombay - India'),
(3, 'Indian Institute of Technology - Delhi - India'),
(3, 'Indian Institute of Technology - Kanpur - India'),
(3, 'Indian Institute of Technology - Kharagpur - India'),
(3, 'Indian Institute of Technology - Madras - India'),
(3, 'Indian Institute of Technology - Roorkee - India'),
(3, 'Indiana University - USA'),
(3, 'Instituto Superior Tecnico - Lisbon - Portugal'),
(3, 'Iowa State University - USA'),
(3, 'Jadavpur University - India'),
(3, 'Johns Hopkins University - USA'),
(3, 'Kansas State University - USA'),
(3, 'Karlsruhe Institute of Technology - Germany'),
(3, 'Korea Advanced Institute of Science and Technology - South Korea'),
(3, 'Lehigh University - USA'),
(3, 'Louisiana State University - USA'),
(3, 'Luther College - USA'),
(3, 'M.I.T'),
(3, 'Massachusetts Institute of Technology'),
(3, 'Massachusetts Institute of Technology - USA'),
(3, 'McGill University - Montreal - Canada'),
(3, 'McMaster University - Canada'),
(3, 'Michigan State University - USA'),
(3, 'Middle East Technical University - Ankara - Turkey'),
(3, 'Middle East Technical University - Turkey'),
(3, 'Monterrey Institute of Technology and Higher Education - Mexico'),
(3, 'Moscow Institute of Physics and Technology - Russia'),
(3, 'Moscow State University - Russia'),
(3, 'Nanjing University - China'),
(3, 'National Taiwan University - Taipei - Taiwan'),
(3, 'National Technical University of Athens - Greece'),
(3, 'National University of Singapore - Singapore'),
(3, 'New York University - USA'),
(3, 'None of the below'),
(3, 'North Carolina State University - USA'),
(3, 'Northwestern University - USA'),
(3, 'Oberlin College - USA'),
(3, 'Ohio State University - USA'),
(3, 'Oregon State University - USA'),
(3, 'Peking University - Beijing - China'),
(3, 'Pennsylvania State University - USA'),
(3, 'Polytechnic University of Bucharest - Romania'),
(3, 'Princeton University - USA'),
(3, 'Purdue University - USA'),
(3, 'Queen\'s University - Canada'),
(3, 'Queen\'s University - Ontario - Canada'),
(3, 'Reed College - USA'),
(3, 'Rensselaer Polytechnic Institute - USA'),
(3, 'Rice University - USA'),
(3, 'Royal Institute of Technology - Stockholm - Sweden'),
(3, 'Rutgers - State University of New Jersey - New Brunswick - USA'),
(3, 'Seoul National University - Seoul - Korea'),
(3, 'Shanghai Jiao Tong University - Shanghai - China'),
(3, 'Shanghai Jiaotong University - China'),
(3, 'Sharif University of Technology - Tehran - Iran'),
(3, 'Simon Fraser University - Canada'),
(3, 'Smith College - USA'),
(3, 'Stanford University - USA'),
(3, 'State University of New York - Buffalo - USA'),
(3, 'Stony Brook University - USA'),
(3, 'Swarthmore College - USA'),
(3, 'Swiss Federal Institute of Technology (ETH) - Switzerland'),
(3, 'Technical University of Berlin - Germany'),
(3, 'Technical University of Cluj-Napoca - Romania'),
(3, 'Technical University of Crete - Greece'),
(3, 'Technion-Israel Institute of Technology - Israel'),
(3, 'Tel Aviv University - Israel'),
(3, 'Tel-Aviv University - Israel'),
(3, 'Texas A&M University - USA'),
(3, 'Tsinghua University - Beijing - China'),
(3, 'Tufts University - USA'),
(3, 'Tulane University - USA'),
(3, 'Universidade Federal do Rio Grande do Sul - Brazil'),
(3, 'University of Alberta - Canada'),
(3, 'University of Arizona - USA'),
(3, 'University of Athens - Greece'),
(3, 'University of Belgrade - Serbia'),
(3, 'University of British Columbia - Canada'),
(3, 'University of Bucharest - Romania'),
(3, 'University of Calgary - Canada'),
(3, 'University of California - Berkeley - USA'),
(3, 'University of California - Davis - USA'),
(3, 'University of California - Irvine - USA'),
(3, 'University of California - Los Angeles'),
(3, 'University of California - Los Angeles - USA'),
(3, 'University of California - San Diego - USA'),
(3, 'University of California - Santa Cruz - USA'),
(3, 'University of Cambridge - United Kingdom'),
(3, 'University of Chicago - USA'),
(3, 'University of Crete - Greece'),
(3, 'University of Delaware - USA'),
(3, 'University of Florida - USA'),
(3, 'University of Illinois at Urbana-Champaign - USA'),
(3, 'University of Madras - India'),
(3, 'University of Maryland - Baltimore - USA'),
(3, 'University of Maryland - College Park - USA'),
(3, 'University of Massachusetts - Amherst - USA'),
(3, 'University of Michigan - USA'),
(3, 'University of Milan - Italy'),
(3, 'University of Minnesota - Twin Cities - USA'),
(3, 'University of Minnesota - USA'),
(3, 'University of North Carolina - Chapel Hill - USA'),
(3, 'University of Notre Dame - USA'),
(3, 'University of Oxford - United Kingdom'),
(3, 'University of Padua - Italy'),
(3, 'University of Patras - Greece'),
(3, 'University of Pennsylvania - USA'),
(3, 'University of Pisa - Italy'),
(3, 'University of Pittsburgh - USA'),
(3, 'University of Richmond - USA'),
(3, 'University of Rochester - USA'),
(3, 'University of Science and Technology of China - China'),
(3, 'University of South Dakota - USA'),
(3, 'University of Southern California - USA'),
(3, 'University of Tehran - Iran'),
(3, 'University of Tennessee - USA'),
(3, 'University of Texas - Austin - USA'),
(3, 'University of the Witwatersrand - South Africa'),
(3, 'University of Toronto - Canada'),
(3, 'University of Tulsa - USA'),
(3, 'University of Utah - USA'),
(3, 'University of Virginia - USA'),
(3, 'University of Washington - USA'),
(3, 'University of Waterloo - Ontario - Canada'),
(3, 'University of Western Ontario - Canada'),
(3, 'University of Wisconsin - Madison - USA'),
(3, 'University of Wisconsin-Madison - USA'),
(3, 'Vienna University of Technology - Austria'),
(3, 'Virginia Polytechnic Institute and State University - USA'),
(3, 'Washington State University - USA'),
(3, 'Washington University - St. Louis - USA'),
(3, 'Wayne State University - USA'),
(3, 'Wesleyan University - USA'),
(3, 'Williams College - USA'),
(3, 'Xi\'an Jiaotong University - China'),
(3, 'Yale University - USA'),
(3, 'Zhejiang University - Hangzhou - China'),
(4, 'Aalborg University - Denmark'),
(4, 'Aarhus University - Denmark'),
(4, 'Alexandria University - Egypt'),
(4, 'Arizona State University - USA'),
(4, 'Bilkent University - Turkey'),
(4, 'Birla Institute of Technology and Science - Pilani - India'),
(4, 'Boston University - USA'),
(4, 'Brandeis University - USA'),
(4, 'Brown University - USA'),
(4, 'California Institute of Technology - USA'),
(4, 'Carnegie Mellon University - USA'),
(4, 'Case Western Reserve University - USA'),
(4, 'Chinese Academy of Sciences - China'),
(4, 'Columbia University - USA'),
(4, 'Cornell University - USA'),
(4, 'Duke University - USA'),
(4, 'Eotvos University - Budapest - Hungary'),
(4, 'Fudan University - Shanghai - China'),
(4, 'Georgia Institute of Technology'),
(4, 'Georgia Institute of Technology - USA'),
(4, 'Harvard University - USA'),
(4, 'Hebrew University of Jerusalem - Israel'),
(4, 'Hong Kong University of Science and Technology - Hong Kong'),
(4, 'Indian Institute of Science - Bangalore - India'),
(4, 'Indian Institute of Technology - Kanpur - India'),
(4, 'Indian Institute of Technology - Kharagpur - India'),
(4, 'Indian Institute of Technology - Madras - India'),
(4, 'Iowa State University - USA'),
(4, 'Johns Hopkins University - USA'),
(4, 'Kyoto University - Japan'),
(4, 'Massachusetts Institute of Technology'),
(4, 'Massachusetts Institute of Technology - USA'),
(4, 'McGill University - Montreal - Canada'),
(4, 'Michigan State University - USA'),
(4, 'Moscow State University - Russia'),
(4, 'New York University - USA'),
(4, 'None of the below'),
(4, 'North Carolina State University - USA'),
(4, 'Northwestern University - USA'),
(4, 'Ohio State University - USA'),
(4, 'Peking University - Beijing - China'),
(4, 'Pennsylvania State University - USA'),
(4, 'Polytechnic University of Bucharest - Romania'),
(4, 'Princeton University - USA'),
(4, 'Purdue University - USA'),
(4, 'Rensselaer Polytechnic Institute - USA'),
(4, 'Rice University - USA'),
(4, 'Royal Institute of Technology - Stockholm - Sweden'),
(4, 'Rutgers - State University of New Jersey - New Brunswick - USA'),
(4, 'Southeast University - Nanjing - China'),
(4, 'Stanford University'),
(4, 'Stanford University - USA'),
(4, 'State University of New York - Buffalo - USA'),
(4, 'Stevens Institute of Technology - USA'),
(4, 'Stony Brook University - USA'),
(4, 'Swiss Federal Institute of Technology (ETH) - Switzerland'),
(4, 'Syracuse University - USA'),
(4, 'Technion-Israel Institute of Technology - Israel'),
(4, 'Tel Aviv University - Israel'),
(4, 'Texas A&M University - USA'),
(4, 'Tsinghua University - Beijing - China'),
(4, 'University of Alberta - Canada'),
(4, 'University of Arizona - USA'),
(4, 'University of British Columbia - Canada'),
(4, 'University of Bucharest - Romania'),
(4, 'University of Calgary - Canada'),
(4, 'University of California - Berkeley - USA'),
(4, 'University of California - Davis - USA'),
(4, 'University of California - Irvine - USA'),
(4, 'University of California - Los Angeles'),
(4, 'University of California - Los Angeles - USA'),
(4, 'University of California - San Diego - USA'),
(4, 'University of California - Santa Barbara - USA'),
(4, 'University of California - Santa Cruz - USA'),
(4, 'University of Cambridge - United Kingdom'),
(4, 'University of Chicago - USA'),
(4, 'University of Colorado Boulder - USA'),
(4, 'University of Edinburgh - United Kingdom'),
(4, 'University of Florida - USA'),
(4, 'University of Illinois'),
(4, 'University of Illinois at Chicago - USA'),
(4, 'University of Illinois at Urbana-Champaign - USA'),
(4, 'University of Iowa - USA'),
(4, 'University of Maryland - Baltimore - USA'),
(4, 'University of Maryland - College Park - USA'),
(4, 'University of Massachusetts - Amherst - USA'),
(4, 'University of Michigan - USA'),
(4, 'University of Minnesota - Twin Cities - USA'),
(4, 'University of Minnesota - USA'),
(4, 'University of North Carolina - Chapel Hill - USA'),
(4, 'University of Notre Dame - USA'),
(4, 'University of Oregon - USA'),
(4, 'University of Oxford - United Kingdom'),
(4, 'University of Pennsylvania - USA'),
(4, 'University of Pittsburgh - USA'),
(4, 'University of Rochester - USA'),
(4, 'University of Rome - La Sapienza - Italy'),
(4, 'University of Science and Technology of China - China'),
(4, 'University of Southern California - USA'),
(4, 'University of Tennessee - USA'),
(4, 'University of Texas - Austin - USA'),
(4, 'University of Texas - Dallas - USA'),
(4, 'University of Texas - San Antonio - USA'),
(4, 'University of Toronto - Canada'),
(4, 'University of Utah - USA'),
(4, 'University of Virginia - USA'),
(4, 'University of Washington - USA'),
(4, 'University of Waterloo - Ontario - Canada'),
(4, 'University of Wisconsin - Madison - USA'),
(4, 'University of Wisconsin-Madison - USA'),
(4, 'Vanderbilt University - USA'),
(4, 'Vienna University of Technology - Austria'),
(4, 'Virginia Polytechnic Institute and State University - USA'),
(4, 'Warsaw University - Poland'),
(4, 'Washington University - St. Louis - USA'),
(4, 'Wayne State University - USA'),
(4, 'Weizmann Institute of Science - Israel'),
(4, 'Yale University - USA'),
(4, 'Zhejiang University - Hangzhou - China'),
(5, 'Aalborg University - Denmark'),
(5, 'Arizona State University'),
(5, 'Arizona State University - USA'),
(5, 'Boston University - USA'),
(5, 'Brandeis University - USA'),
(5, 'Brown University - USA'),
(5, 'California Institute of Technology'),
(5, 'California Institute of Technology - USA'),
(5, 'Carnegie Mellon University'),
(5, 'Carnegie Mellon University - USA'),
(5, 'Case Western Reserve University - USA'),
(5, 'College of William and Mary - USA'),
(5, 'Columbia University - USA'),
(5, 'Cornell University'),
(5, 'Cornell University - USA'),
(5, 'Dartmouth College - USA'),
(5, 'Duke University - USA'),
(5, 'École Polytechnique Fédérale de Lausanne - Switzerland'),
(5, 'Eidgenossische Technische Hochschule - Zurich - Switzerland'),
(5, 'George Mason University - USA'),
(5, 'Georgia Institute of Technology'),
(5, 'Georgia Institute of Technology - USA'),
(5, 'Harvard University'),
(5, 'Harvard University - USA'),
(5, 'Hebrew University of Jerusalem - Israel'),
(5, 'Imperial College - United Kingdom'),
(5, 'Indiana University - USA'),
(5, 'Iowa State University - USA'),
(5, 'Johns Hopkins University - USA'),
(5, 'Kyoto University - Japan'),
(5, 'M.I.T'),
(5, 'Massachusetts Institute of Technology'),
(5, 'Massachusetts Institute of Technology - USA'),
(5, 'McGill University - Montreal - Canada'),
(5, 'Michigan State University - USA'),
(5, 'New York University - USA'),
(5, 'North Carolina State University - USA'),
(5, 'Northwestern University - USA'),
(5, 'Ohio State University - USA'),
(5, 'Pennsylvania State University - USA'),
(5, 'Princeton University'),
(5, 'Princeton University - USA'),
(5, 'Purdue University - USA'),
(5, 'Rice University - USA'),
(5, 'Rutgers - State University of New Jersey - New Brunswick - USA'),
(5, 'Simon Fraser University - Canada'),
(5, 'Stanford University'),
(5, 'Stanford University - USA'),
(5, 'State University of New York - Buffalo - USA'),
(5, 'Stony Brook University - USA'),
(5, 'Swiss Federal Institute of Technology (ETH) - Switzerland'),
(5, 'Syracuse University - USA'),
(5, 'Technion-Israel Institute of Technology - Israel'),
(5, 'Tel Aviv University - Israel'),
(5, 'Texas A&M University - USA'),
(5, 'University of Alberta - Canada'),
(5, 'University of Arizona - USA'),
(5, 'University of British Columbia - Canada'),
(5, 'University of Calgary - Canada'),
(5, 'University of California - Berkeley - USA'),
(5, 'University of California - Davis - USA'),
(5, 'University of California - Irvine - USA'),
(5, 'University of California - Los Angeles'),
(5, 'University of California - Los Angeles - USA'),
(5, 'University of California - Riverside - USA'),
(5, 'University of California - San Diego - USA'),
(5, 'University of California - Santa Barbara - USA'),
(5, 'University of California - Santa Cruz - USA'),
(5, 'University of Cambridge - United Kingdom'),
(5, 'University of Central Florida'),
(5, 'University of Chicago - USA'),
(5, 'University of Colorado Boulder - USA'),
(5, 'University of Edinburgh - United Kingdom'),
(5, 'University of Florida - USA'),
(5, 'University of Illinois'),
(5, 'University of Illinois at Chicago - USA'),
(5, 'University of Illinois at Urbana-Champaign'),
(5, 'University of Illinois at Urbana-Champaign - USA'),
(5, 'University of Iowa - USA'),
(5, 'University of Louisiana at Lafayette - USA'),
(5, 'University of Maryland'),
(5, 'University of Maryland - Baltimore - USA'),
(5, 'University of Maryland - College Park - USA'),
(5, 'University of Massachusetts - Amherst - USA'),
(5, 'University of Michigan - USA'),
(5, 'University of Minnesota - Twin Cities - USA'),
(5, 'University of Minnesota - USA'),
(5, 'University of North Carolina - Chapel Hill - USA'),
(5, 'University of Notre Dame - USA'),
(5, 'University of Oxford - United Kingdom'),
(5, 'University of Pennsylvania - USA'),
(5, 'University of Pittsburgh - USA'),
(5, 'University of Rochester'),
(5, 'University of Rochester - USA'),
(5, 'University of Rome - La Sapienza - Italy'),
(5, 'University of Southern California - USA'),
(5, 'University of Texas - Austin - USA'),
(5, 'University of Texas at Austin'),
(5, 'University of Toronto'),
(5, 'University of Toronto - Canada'),
(5, 'University of Utah - USA'),
(5, 'University of Virginia - USA'),
(5, 'University of Washington'),
(5, 'University of Washington - USA'),
(5, 'University of Waterloo - Ontario - Canada'),
(5, 'University of Wisconsin - Madison - USA'),
(5, 'University of Wisconsin-Madison - USA'),
(5, 'Vanderbilt University - USA'),
(5, 'Washington University - St. Louis - USA'),
(5, 'Wayne State University - USA'),
(5, 'Weizmann Institute of Science - Israel'),
(5, 'Yale University - USA'),
(6, 'Bell Laboratories - USA'),
(6, 'California Institute of Technology - USA'),
(6, 'Carnegie Mellon University - USA'),
(6, 'Cornell University - USA'),
(6, 'Harvard University - USA'),
(6, 'IBM Thomas J. Watson Research Center - USA'),
(6, 'Massachusetts Institute of Technology - USA'),
(6, 'Microsoft Research - USA'),
(6, 'Princeton University - USA'),
(6, 'Stanford University - USA'),
(6, 'University of California - Berkeley - USA'),
(6, 'University of California - San Diego - USA'),
(6, 'University of Illinois at Urbana-Champaign - USA'),
(6, 'University of Massachusetts - Amherst - USA'),
(6, 'University of Pennsylvania - USA'),
(6, 'University of Southern California - USA'),
(6, 'University of Toronto - Canada'),
(6, 'University of Washington - USA'),
(7, '1950'),
(7, '1967'),
(7, '1968'),
(7, '1969'),
(7, '1970'),
(7, '1971'),
(7, '1972'),
(7, '1973'),
(7, '1974'),
(7, '1975'),
(7, '1976'),
(7, '1977'),
(7, '1978'),
(7, '1979'),
(7, '1980'),
(7, '1981'),
(7, '1982'),
(7, '1983'),
(7, '1984'),
(7, '1985'),
(7, '1986'),
(7, '1987'),
(7, '1988'),
(7, '1989'),
(7, '1990'),
(7, '1991'),
(7, '1992'),
(7, '1993'),
(7, '1994'),
(7, '1995'),
(7, '1996'),
(7, '1997'),
(7, '1998'),
(7, '1999'),
(7, '2000'),
(7, '2001'),
(7, '2002'),
(7, '2003'),
(7, '2004'),
(7, '2005'),
(7, '2006'),
(7, '2007'),
(7, '2008'),
(7, '2009'),
(7, '2010'),
(7, '2011'),
(7, '2012'),
(7, '2013'),
(7, '2014'),
(7, '2015'),
(7, '2016'),
(8, 'Assistant'),
(8, 'Associate'),
(8, 'Full'),
(9, ''),
(9, 'Algorithms & Theory'),
(9, 'Artificial Intelligence'),
(9, 'Bioinformatics & Computational Biology'),
(9, 'Computer Education'),
(9, 'Computer Vision'),
(9, 'Data Mining'),
(9, 'Databases'),
(9, 'Distributed & Parallel Computing'),
(9, 'Graphics'),
(9, 'Hardware & Architecture'),
(9, 'Human-Computer Interaction'),
(9, 'Information Retrieval'),
(9, 'Machine Learning & Pattern Recognition'),
(9, 'Multimedia'),
(9, 'Natural Language & Speech'),
(9, 'Networks & Communications'),
(9, 'Operating Systems'),
(9, 'Programming Languages'),
(9, 'Real-Time & Embedded Systems'),
(9, 'Scientific Computing'),
(9, 'Security & Privacy'),
(9, 'Simulation'),
(9, 'Software Engineering'),
(9, 'World Wide Web'),
(10, 'Decline to Report'),
(10, 'Female'),
(10, 'Male');

-- --------------------------------------------------------

--
-- Table structure for table `UniqueId`
--

CREATE TABLE `UniqueId` (
  `idUniqueID` int(11) NOT NULL,
  `active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `ViewChange`
--

CREATE TABLE `ViewChange` (
  `idInteraction` int(11) NOT NULL,
  `viewname` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Alias`
--
ALTER TABLE `Alias`
  ADD PRIMARY KEY (`idAlias`),
  ADD UNIQUE KEY `unique_index` (`idSuggestion`,`alias`(250)) USING BTREE,
  ADD KEY `fk_Alias_Suggestion1_idx` (`idSuggestion`);

--
-- Indexes for table `Click`
--
ALTER TABLE `Click`
  ADD PRIMARY KEY (`idInteraction`),
  ADD KEY `fk_Click_Interaction1_idx` (`idInteraction`),
  ADD KEY `fk_Click_Suggestion1_idx` (`idSuggestion`);

--
-- Indexes for table `Comment`
--
ALTER TABLE `Comment`
  ADD PRIMARY KEY (`idComment`),
  ADD KEY `fk_Comment_Profile1_idx` (`idProfile`),
  ADD KEY `index_idInteraction_2368917` (`idInteraction`),
  ADD KEY `index_idUniqueID_2368917` (`idUniqueID`),
  ADD KEY `index_idSuggestion_2368917` (`idSuggestion`);

--
-- Indexes for table `Copy`
--
ALTER TABLE `Copy`
  ADD PRIMARY KEY (`idInteraction`,`idSuggestion`),
  ADD KEY `_fk_idSuggestion_4417654` (`idSuggestion`);

--
-- Indexes for table `CopyColumn`
--
ALTER TABLE `CopyColumn`
  ADD PRIMARY KEY (`idInteraction`,`idSuggestionType`),
  ADD KEY `_fk_idSuggestionType_CopyColumn_alsdfh12356` (`idSuggestionType`);

--
-- Indexes for table `DataType`
--
ALTER TABLE `DataType`
  ADD PRIMARY KEY (`idDataType`);

--
-- Indexes for table `DoubleClick`
--
ALTER TABLE `DoubleClick`
  ADD PRIMARY KEY (`idInteraction`),
  ADD KEY `fk_DoubleClick_Interaction1_idx` (`idInteraction`),
  ADD KEY `fk_DoubleClick_Suggestion1_idx` (`idSuggestion`);

--
-- Indexes for table `Edit`
--
ALTER TABLE `Edit`
  ADD PRIMARY KEY (`idEdit`),
  ADD KEY `idInteraction_index_adfhj126` (`IdInteraction`),
  ADD KEY `_fk_idEntryType_from_edit_asllhg1233` (`idEntryType`);

--
-- Indexes for table `Edit_Suggestion`
--
ALTER TABLE `Edit_Suggestion`
  ADD UNIQUE KEY `_index_edit_suggestion_idEdit_agsdh1872dg` (`idEdit`),
  ADD KEY `_index_edit_suggestion_idSuggestion_agsdh1872dg` (`idSuggestion`);

--
-- Indexes for table `EntryType`
--
ALTER TABLE `EntryType`
  ADD PRIMARY KEY (`idEntryType`);

--
-- Indexes for table `Experiment`
--
ALTER TABLE `Experiment`
  ADD PRIMARY KEY (`idExperiment`);

--
-- Indexes for table `Interaction`
--
ALTER TABLE `Interaction`
  ADD PRIMARY KEY (`idInteraction`),
  ADD KEY `fk_Interaction_InteractionType1_idx` (`idInteractionType`),
  ADD KEY `fk_Interaction_Session1_idx` (`idSession`);

--
-- Indexes for table `InteractionType`
--
ALTER TABLE `InteractionType`
  ADD PRIMARY KEY (`idInteractionType`);

--
-- Indexes for table `NewRow`
--
ALTER TABLE `NewRow`
  ADD KEY `_index_newRow_idInteraction` (`idInteraction`),
  ADD KEY `_index_newRow_idSuggestion` (`idSuggestion`);

--
-- Indexes for table `Paste`
--
ALTER TABLE `Paste`
  ADD PRIMARY KEY (`idInteraction`,`idSuggestionBefore`),
  ADD KEY `_fk_idSuggestionBefore_2217654` (`idSuggestionBefore`),
  ADD KEY `_fk_idSuggestionAfter_2217654` (`idSuggestionAfter`);

--
-- Indexes for table `Profile`
--
ALTER TABLE `Profile`
  ADD PRIMARY KEY (`idProfile`),
  ADD UNIQUE KEY `unique_email_profile` (`email`),
  ADD UNIQUE KEY `unique_username_profile` (`username`),
  ADD KEY `index_idRole_profileTable` (`idRole`) USING BTREE;

--
-- Indexes for table `Role`
--
ALTER TABLE `Role`
  ADD PRIMARY KEY (`idRole`);

--
-- Indexes for table `Search`
--
ALTER TABLE `Search`
  ADD KEY `fk_Search_Interaction1_idx` (`idInteraction`),
  ADD KEY `_fk_idSuggestionType_12835gv` (`idSuggestionType`),
  ADD KEY `_index_idSearchType_182356` (`idSearchType`);

--
-- Indexes for table `SearchMulti`
--
ALTER TABLE `SearchMulti`
  ADD PRIMARY KEY (`idInteraction`,`idSuggestionType`),
  ADD KEY `fk_SearchMulti_Interaction1_idx` (`idInteraction`),
  ADD KEY `_fk_idSuggestionType_12835gv` (`idSuggestionType`),
  ADD KEY `_index_idSearchType_182356` (`idSearchType`);

--
-- Indexes for table `SearchType`
--
ALTER TABLE `SearchType`
  ADD PRIMARY KEY (`idSearchType`);

--
-- Indexes for table `SelectRange`
--
ALTER TABLE `SelectRange`
  ADD KEY `fk_Click_Interaction2_idx` (`idInteraction`) USING BTREE,
  ADD KEY `fk_Click_Suggestion2_idx` (`idSuggestion`) USING BTREE;

--
-- Indexes for table `Session`
--
ALTER TABLE `Session`
  ADD PRIMARY KEY (`idSession`),
  ADD KEY `fk_Session_Profile1_idx` (`idProfile`);

--
-- Indexes for table `sessions`
--
ALTER TABLE `sessions`
  ADD PRIMARY KEY (`session_id`);

--
-- Indexes for table `Sort`
--
ALTER TABLE `Sort`
  ADD PRIMARY KEY (`idInteraction`,`idSuggestionType`),
  ADD KEY `fk_Sort_SuggestionType1_idx` (`idSuggestionType`),
  ADD KEY `fk_Sort_Interaction1_idx` (`idInteraction`);

--
-- Indexes for table `Suggestions`
--
ALTER TABLE `Suggestions`
  ADD PRIMARY KEY (`idSuggestion`),
  ADD UNIQUE KEY `idSuggestion` (`idSuggestion`),
  ADD KEY `fk_Suggestion_UniqueID_idx` (`idUniqueID`),
  ADD KEY `fk_Suggestion_SuggestionType1_idx` (`idSuggestionType`),
  ADD KEY `_INDEX_idProfile_Suggestions_1208736` (`idProfile`),
  ADD KEY `idSuggestion_2` (`idSuggestion`);

--
-- Indexes for table `SuggestionType`
--
ALTER TABLE `SuggestionType`
  ADD PRIMARY KEY (`idSuggestionType`),
  ADD KEY `fk_SuggestionType_DataType1_idx` (`idDataType`);

--
-- Indexes for table `SuggestionTypeValues`
--
ALTER TABLE `SuggestionTypeValues`
  ADD UNIQUE KEY `PRIMARY_id_and_value` (`idSuggestionType`,`value`),
  ADD KEY `fk_idSuggestioType_1827635` (`idSuggestionType`) USING BTREE;

--
-- Indexes for table `UniqueId`
--
ALTER TABLE `UniqueId`
  ADD PRIMARY KEY (`idUniqueID`);

--
-- Indexes for table `ViewChange`
--
ALTER TABLE `ViewChange`
  ADD PRIMARY KEY (`idInteraction`,`viewname`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Alias`
--
ALTER TABLE `Alias`
  MODIFY `idAlias` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=75;

--
-- AUTO_INCREMENT for table `Comment`
--
ALTER TABLE `Comment`
  MODIFY `idComment` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `DataType`
--
ALTER TABLE `DataType`
  MODIFY `idDataType` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `Edit`
--
ALTER TABLE `Edit`
  MODIFY `idEdit` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `EntryType`
--
ALTER TABLE `EntryType`
  MODIFY `idEntryType` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `Experiment`
--
ALTER TABLE `Experiment`
  MODIFY `idExperiment` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Interaction`
--
ALTER TABLE `Interaction`
  MODIFY `idInteraction` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `InteractionType`
--
ALTER TABLE `InteractionType`
  MODIFY `idInteractionType` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `Profile`
--
ALTER TABLE `Profile`
  MODIFY `idProfile` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Role`
--
ALTER TABLE `Role`
  MODIFY `idRole` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `SearchType`
--
ALTER TABLE `SearchType`
  MODIFY `idSearchType` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `Session`
--
ALTER TABLE `Session`
  MODIFY `idSession` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `Suggestions`
--
ALTER TABLE `Suggestions`
  MODIFY `idSuggestion` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `SuggestionType`
--
ALTER TABLE `SuggestionType`
  MODIFY `idSuggestionType` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `UniqueId`
--
ALTER TABLE `UniqueId`
  MODIFY `idUniqueID` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `Comment`
--
ALTER TABLE `Comment`
  ADD CONSTRAINT `fk_Comment_Profile1` FOREIGN KEY (`idProfile`) REFERENCES `profile` (`idProfile`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_idInteraction_4236` FOREIGN KEY (`idInteraction`) REFERENCES `Interaction` (`idInteraction`),
  ADD CONSTRAINT `fk_idSuggestion_4236` FOREIGN KEY (`idSuggestion`) REFERENCES `Suggestions` (`idSuggestion`),
  ADD CONSTRAINT `fk_idUniqueID_1147` FOREIGN KEY (`idUniqueID`) REFERENCES `UniqueId` (`idUniqueID`);

--
-- Constraints for table `Copy`
--
ALTER TABLE `Copy`
  ADD CONSTRAINT `_fk_idInteraction_4447654` FOREIGN KEY (`idInteraction`) REFERENCES `Interaction` (`idInteraction`),
  ADD CONSTRAINT `_fk_idSuggestion_4417654` FOREIGN KEY (`idSuggestion`) REFERENCES `Suggestions` (`idSuggestion`);

--
-- Constraints for table `CopyColumn`
--
ALTER TABLE `CopyColumn`
  ADD CONSTRAINT `_fk_idInteraction_CopyColumn_alsdfh12356` FOREIGN KEY (`idInteraction`) REFERENCES `Interaction` (`idInteraction`),
  ADD CONSTRAINT `_fk_idSuggestionType_CopyColumn_alsdfh12356` FOREIGN KEY (`idSuggestionType`) REFERENCES `SuggestionType` (`idSuggestionType`);

--
-- Constraints for table `Edit`
--
ALTER TABLE `Edit`
  ADD CONSTRAINT `_fk_idEntryType_from_edit_asllhg1233` FOREIGN KEY (`idEntryType`) REFERENCES `EntryType` (`idEntryType`),
  ADD CONSTRAINT `_fk_idInteraction_from_edit_asdlhg1235` FOREIGN KEY (`IdInteraction`) REFERENCES `Interaction` (`idInteraction`);

--
-- Constraints for table `Edit_Suggestion`
--
ALTER TABLE `Edit_Suggestion`
  ADD CONSTRAINT `_fk_idEdit_from_Edit_Sugg_asdkl123` FOREIGN KEY (`idEdit`) REFERENCES `Edit` (`idEdit`),
  ADD CONSTRAINT `_fk_idSuggestion_from_Edit_Sugg_asdkl123` FOREIGN KEY (`idSuggestion`) REFERENCES `Suggestions` (`idSuggestion`);

--
-- Constraints for table `NewRow`
--
ALTER TABLE `NewRow`
  ADD CONSTRAINT `_fk_newRow_idInteraction` FOREIGN KEY (`idInteraction`) REFERENCES `Interaction` (`idInteraction`),
  ADD CONSTRAINT `_fk_newRow_idSuggestion` FOREIGN KEY (`idInteraction`) REFERENCES `Suggestions` (`idSuggestion`);

--
-- Constraints for table `Paste`
--
ALTER TABLE `Paste`
  ADD CONSTRAINT `_fk_idInteraction_2247443` FOREIGN KEY (`idInteraction`) REFERENCES `Interaction` (`idInteraction`),
  ADD CONSTRAINT `_fk_idSuggestionAfter_2217654` FOREIGN KEY (`idSuggestionAfter`) REFERENCES `Suggestions` (`idSuggestion`),
  ADD CONSTRAINT `_fk_idSuggestionBefore_2217654` FOREIGN KEY (`idSuggestionBefore`) REFERENCES `Suggestions` (`idSuggestion`);

--
-- Constraints for table `Search`
--
ALTER TABLE `Search`
  ADD CONSTRAINT `fk_Search_Interaction1` FOREIGN KEY (`idInteraction`) REFERENCES `Interaction` (`idInteraction`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_id_search_type_1` FOREIGN KEY (`idSearchType`) REFERENCES `SearchType` (`idSearchType`),
  ADD CONSTRAINT `search_ibfk_1` FOREIGN KEY (`idSuggestionType`) REFERENCES `SuggestionType` (`idSuggestionType`);

--
-- Constraints for table `SearchMulti`
--
ALTER TABLE `SearchMulti`
  ADD CONSTRAINT `SearchMulti_ibfk_11231` FOREIGN KEY (`idSuggestionType`) REFERENCES `SuggestionType` (`idSuggestionType`),
  ADD CONSTRAINT `fk_SearchMulti_Interaction112312` FOREIGN KEY (`idInteraction`) REFERENCES `Interaction` (`idInteraction`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_id_Search_type_112312` FOREIGN KEY (`idSearchType`) REFERENCES `SearchType` (`idSearchType`);

--
-- Constraints for table `Sort`
--
ALTER TABLE `Sort`
  ADD CONSTRAINT `_fk_idInteraction_1827365` FOREIGN KEY (`idInteraction`) REFERENCES `Interaction` (`idInteraction`),
  ADD CONSTRAINT `_fk_idSuggestionType_2827365` FOREIGN KEY (`idSuggestionType`) REFERENCES `SuggestionType` (`idSuggestionType`);

--
-- Constraints for table `Suggestions`
--
ALTER TABLE `Suggestions`
  ADD CONSTRAINT `fk_Suggestion_IdProfile_idx` FOREIGN KEY (`idProfile`) REFERENCES `Profile` (`idProfile`),
  ADD CONSTRAINT `fk_idSuggestionType_123687` FOREIGN KEY (`idSuggestionType`) REFERENCES `SuggestionType` (`idSuggestionType`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
