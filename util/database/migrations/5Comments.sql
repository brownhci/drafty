create table Comments
(
    idComment     int                                 auto_increment,
    idInteraction int                                 not null,
    idUniqueID    int                                 not null,
    comment       longtext                            not null,
    voteUp        int default 0                       not null,
    voteDown      int default 0                       not null,
    constraint Comments_pk
        primary key (idComment),
    constraint Comments___fk_idInteraction_ksjdfba87aidsb
        foreign key (idInteraction) references Interaction (idInteraction),
    constraint Comments___fk_iduniqid_oq83eyfgqwuyofhba
        foreign key (idUniqueID) references UniqueId (idUniqueID)
);

INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (19,'comment');
INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (20,'commentVoteUp');
INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (21,'commentVoteDown');
INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (22,'commentVoteUp-deselect');
INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (23,'commentVoteDown-deselect');
INSERT INTO csprofessors.InteractionType (idInteractionType, interaction) VALUES (24,'commentView');

create table CommentsView
(
    idCommentsView int auto_increment,
    idUniqueID     int null,
    idInteraction  int null,
    constraint CommentsView_pk
        primary key (idCommentsView),
    constraint CommentsView___fk_comments_alksdhfga1231
        foreign key (idUniqueID) references UniqueId (idUniqueID),
    constraint CommentsView___fk_interaction_aljhsdfg5123
        foreign key (idInteraction) references Interaction (idInteraction)
);

drop table CommentVote;
create table CommentVote
(
    idCommentVote int auto_increment
        primary key,
    idInteraction int         not null,
    idComment     int         not null,
    vote          varchar(20) not null,
    constraint table_name___fk_comments_akhsdfashjld
        foreign key (idComment) references Comments (idComment),
    constraint table_name___fk_interaction_akdhfa
        foreign key (idInteraction) references Interaction (idInteraction),
    constraint voteType
        check (`vote` in ('voteUp', 'voteUp-deselect', 'voteDown', 'voteDown-deselect'))
);
