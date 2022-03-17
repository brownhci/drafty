INSERT INTO `InteractionType` (`idInteractionType`, `interaction`)
VALUES (NULL, 'databait-visit');
INSERT INTO `InteractionType` (`idInteractionType`, `interaction`)
VALUES (NULL, 'databait-create-right-click');
INSERT INTO `InteractionType` (`idInteractionType`, `interaction`)
VALUES (NULL, 'databait-create-edit');
INSERT INTO `InteractionType` (`idInteractionType`, `interaction`)
VALUES (NULL, 'databait-create-new-row');
INSERT INTO `InteractionType` (`idInteractionType`, `interaction`)
VALUES (NULL, 'databait-create-delete-row');
INSERT INTO `InteractionType` (`idInteractionType`, `interaction`)
VALUES (NULL, 'databait-create-navbar-menu');
INSERT INTO `InteractionType` (`idInteractionType`, `interaction`)
VALUES (NULL, 'databait-create-modal-like');
INSERT INTO `InteractionType` (`idInteractionType`, `interaction`)
VALUES (NULL, 'databait-create-modal-random');
INSERT INTO `InteractionType` (`idInteractionType`, `interaction`)
VALUES (NULL, 'databait-tweet');
INSERT INTO `InteractionType` (`idInteractionType`, `interaction`)
VALUES (NULL, 'select-databait-value-search');

DROP TABLE IF EXISTS `Databaits`;
DROP TABLE IF EXISTS `DatabaitTweet`;
DROP TABLE IF EXISTS `DatabaitVisit`;
DROP TABLE IF EXISTS `DatabaitTemplateType`;
DROP TABLE IF EXISTS `DatabaitCreateType`;

CREATE TABLE `Databaits`
(
    `idDatabait`             int(11)       NOT NULL,
    `idInteraction`          int(11) NOT NULL,
    `idUniqueID`             int(11),
    `idDatabaitTemplateType` int(11)       NOT NULL,
    `idDatabaitCreateType`   int(11)       NOT NULL,
    `databait`               varchar(1500) NOT NULL,
    `columns`                varchar(1500) DEFAULT NULL,
    `vals`                   varchar(1500) DEFAULT NULL,
    `notes`                  varchar(5000) NOT NULL,
    `created`                timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `closed`                 timestamp,
    `nextAction`             int(11)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

CREATE TABLE `DatabaitTweet`
(
    `idDatabaitTweet`        int(11)       NOT NULL,
    `idInteraction`          int(11)       NOT NULL,
    `idDatabait`             int(11)       NOT NULL,
    `url`                    varchar(2500) NOT NULL,
    `likes`                  int(11),
    `retweets`               int(11),
    `created`                timestamp     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `nextAction`             int(11)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

CREATE TABLE `DatabaitVisit`
(
    `idInteraction` int(11) NOT NULL,
    `idDatabait`    int(11) NOT NULL,
    `source`        varchar(200),
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

CREATE TABLE `DatabaitTemplateType`
(
    idDatabaitTemplateType int auto_increment primary key,
    template               varchar(50) null
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

INSERT INTO `DatabaitTemplateType` (`idDatabaitTemplateType`, `template`)
VALUES (1, 1);
INSERT INTO `DatabaitTemplateType` (`idDatabaitTemplateType`, `template`)
VALUES (2, 2);
INSERT INTO `DatabaitTemplateType`(`idDatabaitTemplateType`, `template`)
VALUES (3, 3);
INSERT INTO `DatabaitTemplateType` (`idDatabaitTemplateType`, `template`)
VALUES (4, 4);
INSERT INTO `DatabaitTemplateType` (`idDatabaitTemplateType`, `template`)
VALUES (5, 5);
INSERT INTO `DatabaitTemplateType` (`idDatabaitTemplateType`, `template`)
VALUES (6, 6);
INSERT INTO `DatabaitTemplateType` (`idDatabaitTemplateType`, `template`)
VALUES (7, 7);
INSERT INTO `DatabaitTemplateType`(`idDatabaitTemplateType`, `template`)
VALUES (8, 8);
INSERT INTO `DatabaitTemplateType` (`idDatabaitTemplateType`, `template`)
VALUES (9, 9);
INSERT INTO `DatabaitTemplateType` (`idDatabaitTemplateType`, `template`)
VALUES (10, 10);

CREATE TABLE `DatabaitCreateType`
(
    idDatabaitCreateType int auto_increment primary key,
    type                 varchar(50) null
) ENGINE = InnoDB DEFAULT CHARSET = utf8;

CREATE TABLE `DatabaitNextAction`
(
    idDatabaitNextAction int auto_increment primary key,
    action                 varchar(50) null
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8;

ALTER TABLE `Databaits`
    ADD CONSTRAINT _fk_idDatabaitTemplateType_b6345das FOREIGN KEY (idDatabaitTemplateType) REFERENCES DatabaitTemplateType (idDatabaitTemplateType),
    ADD CONSTRAINT _fk_idDatabaitCreateType_b6345das FOREIGN KEY (idDatabaitCreateType) REFERENCES DatabaitCreateType (idDatabaitCreateType),
    ADD CONSTRAINT _fk_databaits_nextAction_b6345das FOREIGN KEY (nextAction) REFERENCES DatabaitNextAction (idDatabaitNextAction),
    ADD CONSTRAINT _fk_idInteraction_Databaits_a6a3344 FOREIGN KEY (idInteraction) REFERENCES Interaction (idInteraction),
    ADD CONSTRAINT _fk_idUniqueID_Databaits_b111edss FOREIGN KEY (idUniqueID) REFERENCES UniqueId (idUniqueID);

ALTER TABLE `Databaits`
    ADD PRIMARY KEY (`idDatabait`),
    MODIFY `idDatabait` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `DatabaitTweet`
    ADD PRIMARY KEY (`idDatabaitTweet`),
    MODIFY `idDatabaitTweet` int(11) NOT NULL AUTO_INCREMENT,
    ADD CONSTRAINT _fk_idInteraction_DatabaitTweet_t615das FOREIGN KEY (idInteraction) REFERENCES Interaction (idInteraction),
    ADD CONSTRAINT _fk_nextAction_DatabaitTweet_t615das FOREIGN KEY (nextAction) REFERENCES DatabaitNextAction (idDatabaitNextAction);

ALTER TABLE `DatabaitVisit`
    ADD UNIQUE KEY `_unique_id_interaction_databaitvisit` (`idInteraction`),
    ADD KEY `_fk_idDatabait_DatabaitVisit_b123gda` (`idDatabait`),
    ADD CONSTRAINT `_fk_idDatabait_DatabaitVisit_b123gda` FOREIGN KEY (`idDatabait`) REFERENCES `Databaits` (`idDatabait`),
    ADD CONSTRAINT `_fk_idInteraction_DatabaitVisit_asdhjk16341` FOREIGN KEY (`idInteraction`) REFERENCES `Interaction` (`idInteraction`);

INSERT INTO `DatabaitCreateType` (`type`) VALUES ('modal-like');
INSERT INTO `DatabaitCreateType` (`type`) VALUES ('modal-random');
INSERT INTO `DatabaitCreateType` (`type`) VALUES ('right-click');
INSERT INTO `DatabaitCreateType` (`type`) VALUES ('edit');
INSERT INTO `DatabaitCreateType` (`type`) VALUES ('new-row');
INSERT INTO `DatabaitCreateType` (`type`) VALUES ('delete-row');
INSERT INTO `DatabaitCreateType` (`type`) VALUES ('navbar-menu');
INSERT INTO `DatabaitCreateType` (`type`) VALUES ('welcome-modal');
INSERT INTO `DatabaitCreateType` (`type`) VALUES ('system-random');
INSERT INTO `DatabaitCreateType` (`type`) VALUES ('system-recent-edit');

INSERT INTO `DatabaitNextAction` (`action`) VALUES ('modal-like');
INSERT INTO `DatabaitNextAction` (`action`) VALUES ('modal-random');
INSERT INTO `DatabaitNextAction` (`action`) VALUES ('right-click');
INSERT INTO `DatabaitNextAction` (`action`) VALUES ('edit');
INSERT INTO `DatabaitNextAction` (`action`) VALUES ('new-row');
INSERT INTO `DatabaitNextAction` (`action`) VALUES ('delete-row');
INSERT INTO `DatabaitNextAction` (`action`) VALUES ('navbar-menu');
INSERT INTO `DatabaitNextAction` (`action`) VALUES ('window-closed');
INSERT INTO `DatabaitNextAction` (`action`) VALUES ('select-databait-value-search');
