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


CREATE TABLE `DataBaitVisit` (
  `IdInteraction` int(11) NOT NULL,
  `idDataBait` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

ALTER TABLE `DataBaitVisit`
  ADD UNIQUE KEY `_unique_id_interaction_databaitvisit` (`IdInteraction`),
  ADD KEY `_fk_idDataBait_DataBaitVisit_b123gda` (`idDataBait`);

ALTER TABLE `DataBaitVisit`
  ADD CONSTRAINT `_fk_idDataBait_DataBaitVisit_b123gda` FOREIGN KEY (`idDataBait`) REFERENCES `Databaits` (`idDatabait`),
  ADD CONSTRAINT `_fk_idInteraction_DataBaitVisit_asdhjk16341` FOREIGN KEY (`IdInteraction`) REFERENCES `Interaction` (`idInteraction`);

