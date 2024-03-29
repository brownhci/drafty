drop table if exists HelpUs;
create table HelpUs
(
    idHelpUs        int(11) auto_increment,
    idInteraction   int(11) not null,
    idUniqueID      int(11) not null,
    helpUsType      varchar(200)  not null,
    question        varchar(2500) not null,
    answer	        varchar(2500),
    start           timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    answered        timestamp,
    showAnother     timestamp,
    closed          timestamp,
    constraint HelpUs_pk
        primary key (idHelpUs),
    constraint HelpUs___fk_interaction_idInteraction
        foreign key (idInteraction) references Interaction (idInteraction),
    constraint HelpUs___fk_interaction_idUniqueID
        foreign key (idUniqueID) references UniqueId (idUniqueID)
);

INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (39, 'helpUs-create');
INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (40, 'helpUs-closed');
INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (41, 'helpUs-showAnother');
INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (42, 'helpUs-answered');
