create or replace table Experiment
(
    idExperiment int auto_increment
        primary key,
    experiment   varchar(45)          null,
    active       tinyint(1) default 0 not null,
    dataset      varchar(25)          null
)
    charset = utf8;

create or replace table ExperimentRole
(
    idExperimentRole int auto_increment
        primary key,
    idExperiment     int                                     not null,
    role             varchar(25)                             not null,
    active           smallint(1) default 0                   not null,
    created          datetime    default current_timestamp() not null,
    constraint _fk_experimentrole__experiment_ahsdgf163
        foreign key (idExperiment) references Experiment (idExperiment)
)
    charset = utf8;

create or replace table Experiment_Role_Session
(
    idSession        int                                  not null,
    idExperiment     int                                  not null,
    idExperimentRole int                                  not null,
    created          datetime default current_timestamp() null,
    constraint unique_index
        unique (idSession, idExperimentRole, idExperiment),
    constraint _fk_experiment
        foreign key (idExperiment) references Experiment (idExperiment),
    constraint _fk_experimentrole
        foreign key (idExperimentRole) references ExperimentRole (idExperimentRole)
)
    charset = utf8;

create or replace index _index_idExperiment_81o2ygradfv
    on Experiment_Role_Session (idExperiment);

create or replace table Profile
(
    idProfile    int auto_increment
        primary key,
    idRole       int      default 2                   not null,
    username     varchar(45)                          null,
    email        varchar(45)                          null,
    password     varchar(500)                         null,
    passwordRaw  varchar(100)                         null,
    date_created datetime default current_timestamp() null,
    date_updated datetime default current_timestamp() null,
    constraint unique_email_profile
        unique (email),
    constraint unique_username_profile
        unique (username)
)
    charset = utf8;

create or replace index index_idRole_profileTable
    on Profile (idRole);

create or replace table Role
(
    idRole int auto_increment
        primary key,
    role   varchar(20) not null
)
    charset = utf8;

create or replace table Session
(
    idSession        int auto_increment
        primary key,
    idProfile        int                                  null,
    idExpressSession varchar(255)                         null,
    start            datetime default current_timestamp() null,
    end              datetime                             null
)
    charset = utf8;

create or replace index fk_Session_Profile1_idx
    on Session (idProfile);

create or replace table Traffic
(
    idTraffic int auto_increment
        primary key,
    url       varchar(250)                         not null,
    fullUrl   varchar(1500)                        null,
    host      varchar(250)                         null,
    origin    varchar(250)                         null,
    sid       varchar(1500)                        null,
    timestamp datetime default current_timestamp() not null
)
    charset = utf8;

create or replace table ViewChange
(
    idViewChange int auto_increment
        primary key,
    idSession    int                                  not null,
    origin       varchar(255)                         null,
    view         varchar(255)                         null,
    time         datetime default current_timestamp() not null
)
    charset = utf8;

create or replace table sessions
(
    session_id varchar(128) collate utf8mb4_bin not null
        primary key,
    expires    int(11) unsigned                 not null,
    data       mediumtext collate utf8mb4_bin   null
)
    charset = utf8;



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
