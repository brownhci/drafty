drop table if exists RemoveUserData;

create table RemoveUserData
(
    id_removeuserdata int auto_increment,
    id_profile        int                           not null,
    id_session        int                           not null,
    timestamp         TIMESTAMP default CURRENT_TIMESTAMP null,
    constraint RemoveUserData_pk
        primary key (id_removeuserdata)
);

