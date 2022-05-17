create table Visit
(
    idVisit       int auto_increment,
    idInteraction int          not null,
    src           varchar(500) null,
    searchCol     varchar(50)  null,
    searchVal     varchar(500) null,
    constraint Visit_pk
        primary key (idVisit),
    constraint Visit___fk_interaction
        foreign key (idInteraction) references Interaction (idInteraction)
);

create unique index Visit_idVisit_uindex
    on Visit (idVisit);

INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (38, 'visit');
