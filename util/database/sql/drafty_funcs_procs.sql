create
    definer = root@localhost function csprofessors.get_idSuggestionType(idSuggestion_var int) returns int
BEGIN
  DECLARE idSuggestionType_rt INT DEFAULT 0;
  SELECT idSuggestionType INTO idSuggestionType_rt FROM Suggestions WHERE idSuggestion = idSuggestion_var;
  RETURN idSuggestionType_rt;
END;

create
    definer = root@localhost function csprofessors.get_idUniqueID(idSuggestion_var int) returns int
BEGIN
  DECLARE idUniqueID_rt INT DEFAULT 0;
  SELECT idUniqueID INTO idUniqueID_rt FROM Suggestions WHERE idSuggestion = idSuggestion_var;
  RETURN idUniqueID_rt;
END;

create
    definer = root@localhost procedure csprofessors.insert_edit_suggestions(IN idSuggestionPrev_var int,
                                                                            IN idSuggestionChosen_var int,
                                                                            IN idSession_var int,
                                                                            IN idInteractionType_var int,
                                                                            IN idEntryType_var int,
                                                                            IN mode_var varchar(25),
                                                                            IN idProfile_var int)
BEGIN
    DECLARE finished INTEGER DEFAULT 0;
    DECLARE idEdit_var INTEGER;
    DECLARE idSugg_var INTEGER;
    DECLARE isPrevSugg_var INTEGER DEFAULT 0;
    DECLARE isNewSugg_var INTEGER DEFAULT 0;
    DECLARE isChosen_var INTEGER DEFAULT 0;
    DECLARE idSuggestion_username INTEGER;
    DECLARE idSuggestion_lastupdated INTEGER;

    -- declare cursor for suggestions
    DEClARE cursorIdSuggs
        CURSOR FOR
            SELECT idSuggestion FROM Suggestions WHERE idSuggestionType = (SELECT idSuggestionType FROM Suggestions WHERE idSuggestion = idSuggestionChosen_var) AND idUniqueID = (SELECT idUniqueID FROM Suggestions WHERE idSuggestion = idSuggestionChosen_var);

    -- declare NOT FOUND handler
    DECLARE CONTINUE HANDLER
        FOR NOT FOUND SET finished = 1;

START TRANSACTION;
    -- insert data into Edit and Edit_Suggestion
    INSERT INTO Edit (idInteraction, idEntryType, mode) VALUES (insert_interaction(idSession_var,idInteractionType_var), idEntryType_var, mode_var);
    SET idEdit_var = (SELECT LAST_INSERT_ID());

    SELECT count(*) as ct INTO isNewSugg_var FROM Edit_Suggestion WHERE idSuggestion = idSuggestionChosen_var;

    -- open previous cursor to loop results
    OPEN cursorIdSuggs;

    insertEditSugg: LOOP
        -- prep loop and check if loop is finished
        FETCH cursorIdSuggs INTO idSugg_var;
        IF finished = 1 THEN
            LEAVE insertEditSugg;
        END IF;

        -- run checks on values
        IF idSugg_var = idSuggestionPrev_var THEN
            SET isPrevSugg_var = 1;
        ELSE
            SET isPrevSugg_var = 0;
        END IF;

        IF idSugg_var = idSuggestionChosen_var THEN
            SET isChosen_var = 1;
            -- check if this was the first time this idSuggested has been edited
            IF isNewSugg_var > 0 THEN
                SET isNewSugg_var = 1;
            ELSE
                SET isNewSugg_var = 0;
            END IF;
        ELSE
            SET isChosen_var = 0;
        END IF;

        -- insert new edit edit_suggestion
        INSERT INTO Edit_Suggestion (idEdit,idSuggestion,isPrevSuggestion,isNew,isChosen) VALUES (idEdit_var,idSugg_var,isPrevSugg_var,isNewSugg_var,isChosen_var);

    END LOOP insertEditSugg;

    SELECT s.idSuggestion INTO idSuggestion_username FROM Suggestions s INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType WHERE s.idSuggestionType = (SELECT idSuggestionType FROM SuggestionType WHERE idDatatype = 5) AND s.idUniqueID = (SELECT idUniqueID FROM Suggestions WHERE idSuggestion = idSuggestionChosen_var) ORDER BY confidence DESC LIMIT 1;
    SELECT s.idSuggestion INTO idSuggestion_lastupdated FROM Suggestions s INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType WHERE s.idSuggestionType = (SELECT idSuggestionType FROM SuggestionType WHERE idDatatype = 6) AND s.idUniqueID = (SELECT idUniqueID FROM Suggestions WHERE idSuggestion = idSuggestionChosen_var) ORDER BY confidence DESC LIMIT 1;

    UPDATE Suggestions SET suggestion = idProfile_var WHERE idSuggestion = idSuggestion_username;
    UPDATE Suggestions SET suggestion = CURRENT_TIMESTAMP WHERE  idSuggestion = idSuggestion_lastupdated;

    CLOSE cursorIdSuggs;
COMMIT;
END;

create
    definer = root@localhost function csprofessors.insert_interaction(idSession_var int, idInteractionType_var int) returns int
BEGIN
    DECLARE idInteraction_new INT;
    INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, idSession_var, idInteractionType_var);
    SET idInteraction_new = (SELECT LAST_INSERT_ID());
    RETURN idInteraction_new;
END;

create
    definer = root@localhost procedure csprofessors.new_edit(IN idSuggestion_var int, IN suggestion_var varchar(1000),
                                                             IN idProfile_var int, OUT idSuggestion_new int)
BEGIN

    DECLARE sugg_exists INT DEFAULT 0;
    DECLARE alias_exists INT DEFAULT 0;
    DECLARE idSuggestionType_var INT;
    DECLARE idUniqueId_var INT;
    DECLARE confidence_var INT DEFAULT 1;

START TRANSACTION;
    SET idSuggestion_new = idSuggestion_var;

    SELECT idSuggestionType INTO idSuggestionType_var FROM Suggestions WHERE idSuggestion = idSuggestion_var;
    SELECT idUniqueId INTO idUniqueId_var FROM Suggestions WHERE idSuggestion = idSuggestion_var;
    SELECT MAX(confidence) + 1 INTO confidence_var FROM Suggestions WHERE idSuggestionType = idSuggestionType_var AND idUniqueId = idUniqueId_var;

    SELECT count(*) as ct INTO sugg_exists
    FROM Suggestions WHERE idSuggestionType = idSuggestionType_var AND idUniqueId = idUniqueId_var AND suggestion = suggestion_var;

    SELECT count(*) as ct INTO sugg_exists
    FROM Suggestions WHERE idSuggestionType = idSuggestionType_var AND idUniqueId = idUniqueId_var AND suggestion = suggestion_var;

    IF alias_exists > 0 THEN
        UPDATE Suggestions s SET s.suggestion = suggestion_var WHERE s.idSuggestion = idSuggestion_var;
        UPDATE Alias a SET count = count + 1 WHERE a.idSuggestion = idSuggestion_var AND a.alias = suggestion_var;
    ELSEIF sugg_exists > 0 THEN
        UPDATE Suggestions s SET s.confidence = confidence_var WHERE s.idSuggestion = idSuggestion_var;
    ELSE
        INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (null, idSuggestionType_var, idUniqueId_var, idProfile_var, suggestion_var, confidence_var);
        SET idSuggestion_new = (SELECT LAST_INSERT_ID());
    END IF;
COMMIT;
END;

create
    definer = root@localhost procedure csprofessors.new_suggestion(INOUT idSuggestion_var int,
                                                                   IN suggestion_var varchar(1000),
                                                                   IN idProfile_var int, OUT isNewSuggestion int)
BEGIN
    DECLARE sugg_unchanged INT DEFAULT 0;
    DECLARE sugg_exists INT DEFAULT 0;
    DECLARE alias_exists INT DEFAULT 0;
    DECLARE idSuggestionType_var INT;
    DECLARE idUniqueId_var INT;
    DECLARE confidence_var INT DEFAULT 1;

START TRANSACTION;
    SELECT idSuggestionType INTO idSuggestionType_var FROM Suggestions WHERE idSuggestion = idSuggestion_var;
    SELECT idUniqueId INTO idUniqueId_var FROM Suggestions WHERE idSuggestion = idSuggestion_var;
    SELECT MAX(confidence) + 1 INTO confidence_var FROM Suggestions WHERE idSuggestionType = idSuggestionType_var AND idUniqueId = idUniqueId_var;

    SELECT count(*) as ct INTO sugg_unchanged
    FROM Suggestions WHERE idSuggestion = idSuggestion_var AND suggestion = suggestion_var;

    SELECT count(*) as ct INTO sugg_exists
    FROM Suggestions WHERE idSuggestionType = idSuggestionType_var AND idUniqueId = idUniqueId_var AND suggestion = suggestion_var;

    IF sugg_unchanged > 0 THEN
        /* do nothing */
        SELECT idSuggestion FROM Suggestions LIMIT 1;
    ELSEIF alias_exists > 0 THEN
        UPDATE Suggestions s SET s.suggestion = suggestion_var WHERE s.idSuggestion = idSuggestion_var;
        UPDATE Alias a SET count = count + 1 WHERE a.idSuggestion = idSuggestion_var AND a.alias = suggestion_var;
    ELSEIF sugg_exists > 0 THEN
        SELECT idSuggestion INTO idSuggestion_var FROM Suggestions WHERE idSuggestionType = idSuggestionType_var AND idUniqueId = idUniqueId_var AND suggestion = suggestion_var;
        UPDATE Suggestions s SET s.confidence = confidence_var WHERE s.idSuggestion = idSuggestion_var;
    ELSE
        INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (null, idSuggestionType_var, idUniqueId_var, idProfile_var, suggestion_var, confidence_var);
        SET idSuggestion_var = (SELECT LAST_INSERT_ID());
        SET isNewSuggestion = 1;
    END IF;
COMMIT;
END;

create
    definer = root@localhost procedure csprofessors.new_suggestion_new_row(IN suggestion_var varchar(1000),
                                                                           IN idEdit_var int, IN idProfile_var int,
                                                                           IN idSuggestionType_var int,
                                                                           IN idUniqueId_var int,
                                                                           OUT idSuggestion_new int)
BEGIN
    DECLARE idSuggestion_var INT;
    DECLARE confidence_var INT DEFAULT 1;

START TRANSACTION;

    INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (null, idSuggestionType_var, idUniqueId_var, idProfile_var, suggestion_var, confidence_var);

    SET idSuggestion_new = (SELECT LAST_INSERT_ID());


    INSERT INTO Edit_NewRow (idEdit,idSuggestion) VALUES (idEdit_var,idSuggestion_new);
COMMIT;
END;

create
    definer = root@localhost procedure csprofessors.new_user_credit_suggestion_new_row(IN idProfile_var int, IN idUniqueId_var int)
BEGIN
    DECLARE confidence_var INT DEFAULT 1;

START TRANSACTION;

    INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (null, (SELECT idSuggestionType FROM SuggestionType WHERE idDataType = 5), idUniqueId_var, idProfile_var, idProfile_var, confidence_var);


    INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (null, (SELECT idSuggestionType FROM SuggestionType WHERE idDataType = 6), idUniqueId_var, idProfile_var, CURRENT_TIMESTAMP, confidence_var);
COMMIT;
END;

