create table HelpUs
(
    idInteraction   int(11) not null,
    idUniqueID      int(11) not null,
    helpUsType      varchar(200)  not null,
    question        varchar(2500) not null,
    nextAction      varchar(200),
    answer	        varchar(2500),
    start           timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    end             timestamp,
    constraint HelpUs___fk_interaction_idInteraction
        foreign key (idInteraction) references Interaction (idInteraction),
    constraint HelpUs___fk_interaction_idUniqueID
        foreign key (idUniqueID) references UniqueId (idUniqueID)
);

INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (39, 'helpUs-create');
INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (40, 'helpUs-end');
