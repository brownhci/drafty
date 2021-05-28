INSERT INTO `InteractionType` (`idInteractionType`, `interaction`) VALUES (NULL, 'databait_visit');

CREATE TABLE `Databaits` (
  `idDatabait` int(11) NOT NULL,
  `idDatabaitTemplate` int(11) NOT NULL,
  `databait` varchar(1500) NOT NULL,
  `columns` varchar(1500) DEFAULT NULL,
  `vals` varchar(1500) DEFAULT NULL,
  `created` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `Databaits`
  ADD PRIMARY KEY (`idDatabait`);

ALTER TABLE `Databaits`
  MODIFY `idDatabait` int(11) NOT NULL AUTO_INCREMENT;
