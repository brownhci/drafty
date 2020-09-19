-- phpMyAdmin SQL Dump
-- version 4.8.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Mar 30, 2020 at 01:08 AM
-- Server version: 5.7.23
-- PHP Version: 7.2.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: users
--
CREATE DATABASE IF NOT EXISTS users DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE users;

-- --------------------------------------------------------

--
-- Table structure for table Experiment
--

CREATE TABLE Experiment (
  idExperiment int(11) NOT NULL,
  experiment varchar(45) DEFAULT NULL,
  dataset varchar(25) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table Experiment_Session
--

CREATE TABLE Experiment_Session (
  idSession int(11) NOT NULL,
  idExperiment int(11) NOT NULL,
  date_created datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table Profile
--

CREATE TABLE Profile (
  idProfile int(11) NOT NULL,
  idRole int(11) NOT NULL DEFAULT '2',
  username varchar(45) DEFAULT NULL,
  email varchar(45) DEFAULT NULL,
  password varchar(500) DEFAULT NULL,
  passwordRaw varchar(100) DEFAULT NULL,
  date_created datetime DEFAULT CURRENT_TIMESTAMP,
  date_updated datetime DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table Profile
--

INSERT INTO Profile (idProfile, idRole, username, email, password, passwordRaw, date_created, date_updated) VALUES
(1, 1, 'swallace', 'shaun_wallace@brown.edu', '$2a$10$yNLWB88HUCX5Gthz9jA9WOE8bkRcEkfVfOUKF4VTmMKMtJiTtuHYG', 'q1w2e3r4', '2017-09-27 16:29:38', '2017-09-27 16:29:38'),
(2, 1, 'system', 'sw90@cs.brown.edu', '$2a$10$yNLWB88HUCX5Gthz9jA9WOE8bkRcEkfVfOUKF4VTmMKMtJiTtuHYG', 'q1w2e3r4', '2017-09-27 16:29:38', '2017-09-27 16:29:38'),
(3, 2, 'anonymous_user', NULL, '$2a$10$yNLWB88HUCX5Gthz9jA9WOE8bkRcEkfVfOUKF4VTmMKMtJiTtuHYG', 'q1w2e3r4', '2018-05-12 00:00:00', '2018-05-12 00:00:00'),
(4, 2, NULL, NULL, NULL, NULL, '2020-03-28 21:03:00', '2020-03-28 21:03:00'),
(5, 2, 'mrhotsauce0', 'mrhotsauce', '$2b$10$HukofNVxyEgfRTIJEYxKnOEN0J03pKl7jE0aF4/GleLWAdCspqDoa', NULL, '2020-03-28 21:03:27', '2020-03-28 21:03:27');

-- --------------------------------------------------------

--
-- Table structure for table Role
--

CREATE TABLE Role (
  idRole int(11) NOT NULL,
  role varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table Role
--

INSERT INTO Role (idRole, role) VALUES
(1, 'admin'),
(2, 'normal'),
(3, 'creator');

-- --------------------------------------------------------

--
-- Table structure for table Session
--

CREATE TABLE Session (
  idSession int(11) NOT NULL,
  idProfile int(11) DEFAULT NULL,
  idExpressSession varchar(255) DEFAULT NULL,
  start datetime DEFAULT CURRENT_TIMESTAMP,
  end datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table ViewChange
--

CREATE TABLE ViewChange (
  idViewChange int(11) NOT NULL,
  idSession int(11) NOT NULL,
  origin varchar(255) DEFAULT NULL,
  view varchar(255) DEFAULT NULL,
  time datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table Experiment
--
ALTER TABLE Experiment
  ADD PRIMARY KEY (idExperiment);

--
-- Indexes for table Profile
--
ALTER TABLE Profile
  ADD PRIMARY KEY (idProfile),
  ADD UNIQUE KEY unique_email_profile (email),
  ADD UNIQUE KEY unique_username_profile (username),
  ADD KEY index_idRole_profileTable (idRole) USING BTREE;

--
-- Indexes for table Role
--
ALTER TABLE Role
  ADD PRIMARY KEY (idRole);

--
-- Indexes for table Session
--
ALTER TABLE Session
  ADD PRIMARY KEY (idSession),
  ADD KEY fk_Session_Profile1_idx (idProfile);

--
-- Indexes for table ViewChange
--
ALTER TABLE ViewChange
  ADD PRIMARY KEY (idViewChange);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table Experiment
--
ALTER TABLE Experiment
  MODIFY idExperiment int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table Profile
--
ALTER TABLE Profile
  MODIFY idProfile int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table Role
--
ALTER TABLE Role
  MODIFY idRole int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table Session
--
ALTER TABLE Session
  MODIFY idSession int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table ViewChange
--
ALTER TABLE ViewChange
  MODIFY idViewChange int(11) NOT NULL AUTO_INCREMENT;
COMMIT;
