/***/

  /*
  * Each Edit is one of 3 possible scenarios:
  * 1. The suggested value already exists, therefore we need to increment the confidence
  * 2. It is a new suggestion for that row/column (idUniqueId/idSuggestionType)
  * 3. It is an Alias: the edit is similar to an existing suggestion for that row/column (idUniqueId/idSuggestionType)
  * FINALLY: record the edit happened and return the idSuggestion if #1
  */

/*
DELIMITER $$
CREATE PROCEDURE new_edit(
    IN  idSuggestion_var INT, 
    IN  suggestion_var VARCHAR(1000),
    IN idProfile_var INT,
    OUT  idSuggestion_new INT
)
BEGIN
    DECLARE sugg_unchanged INT DEFAULT 0;
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

    SELECT count(*) as ct INTO sugg_unchanged
    FROM Suggestions WHERE idSuggestion = idSuggestion_var AND suggestion = suggestion_var;

    SELECT count(*) as ct INTO sugg_exists, idSuggestion INTO idSuggestion_new
    FROM Suggestions WHERE idSuggestionType = idSuggestionType_var AND idUniqueId = idUniqueId_var AND suggestion = suggestion_var;
    
    IF sugg_unchanged > 0 THEN

    ELSEIF alias_exists > 0 THEN
        UPDATE Suggestions s SET s.suggestion = suggestion_var WHERE s.idSuggestion = idSuggestion_var; 
        UPDATE Alias a SET count = count + 1 WHERE a.idSuggestion = idSuggestion_var AND a.alias = suggestion_var;
    ELSEIF sugg_exists > 0 THEN    
        UPDATE Suggestions s SET s.confidence = confidence_var WHERE s.idSuggestion = idSuggestion_new;
    ELSE
        INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (null, idSuggestionType_var, idUniqueId_var, idProfile_var, suggestion_var, confidence_var);
        SET idSuggestion_new = (SELECT LAST_INSERT_ID());
    END IF;
COMMIT;
END $$
 
DELIMITER ;
*/

/* LOOP THROUGH ROWS https://www.mysqltutorial.org/mysql-cursor/ */

DELIMITER $$
CREATE FUNCTION get_idUniqueID(idSuggestion_var INT) RETURNS int(11)
BEGIN
  DECLARE idUniqueID_rt INT DEFAULT 0;
  SELECT idUniqueID INTO idUniqueID_rt FROM Suggestions WHERE idSuggestion = idSuggestion_var;
  RETURN idUniqueID_rt;
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION get_idSuggestionType(idSuggestion_var INT) RETURNS int(11)
BEGIN
  DECLARE idSuggestionType_rt INT DEFAULT 0;
  SELECT idSuggestionType INTO idSuggestionType_rt FROM Suggestions WHERE idSuggestion = idSuggestion_var;
  RETURN idSuggestionType_rt;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE new_edit(
    IN  idSuggestion_var INT, 
    IN  suggestion_var VARCHAR(1000),
    IN idProfile_var INT,
    OUT  idSuggestion_new INT
)
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
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE insert_edit_suggestions(
    IN idSuggestionPrev_var INT,
    IN idSuggestionChosen_var INT,
    IN idSession_var INT,
    IN idInteractionType_var INT,
    IN idEntryType_var INT,
    IN mode_var VARCHAR(25)
)
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
            END IF;
        ELSE
            SET isChosen_var = 0;
        END IF;

        -- insert new edit edit_suggestion
        INSERT INTO Edit_Suggestion (idEdit,idSuggestion,isPrevSuggestion,isNew,isChosen) VALUES (idEdit_var,idSugg_var,isPrevSugg_var,isNewSugg_var,isChosen_var);
    
    END LOOP insertEditSugg;

    SELECT s.idSuggestion INTO idSuggestion_username FROM Suggestions s INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType WHERE s.idSuggestionType = (SELECT idSuggestionType FROM SuggestionType WHERE idDatatype = 5) AND s.idUniqueID = (SELECT idUniqueID FROM Suggestions WHERE idSuggestion = idSuggestionChosen_var) ORDER BY confidence DESC LIMIT 1;
    SELECT s.idSuggestion INTO idSuggestion_lastupdated FROM Suggestions s INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType WHERE s.idSuggestionType = (SELECT idSuggestionType FROM SuggestionType WHERE idDatatype = 6) AND s.idUniqueID = (SELECT idUniqueID FROM Suggestions WHERE idSuggestion = idSuggestionChosen_var) ORDER BY confidence DESC LIMIT 1;

    UPDATE Suggestions SET suggestion = (SELECT username FROM Profile p INNER JOIN Session s ON s.idProfile = p.idProfile WHERE s.idSession = idSession_var) WHERE idSuggestion = idSuggestion_username;
    UPDATE Suggestions SET suggestion = CURRENT_TIME WHERE  idSuggestion = idSuggestion_lastupdated;

    CLOSE cursorIdSuggs;
COMMIT;
END$$
DELIMITER ;

DELIMITER $$
CREATE FUNCTION insert_interaction(idSession_var INT, idInteractionType_var INT) RETURNS int(11)
    DETERMINISTIC
BEGIN
    DECLARE idInteraction_new INT; 
    INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, idSession_var, idInteractionType_var); 
    SET idInteraction_new = (SELECT LAST_INSERT_ID());
    RETURN idInteraction_new;
END$$
DELIMITER ;

DELIMITER $$
CREATE PROCEDURE new_suggestion(
    INOUT  idSuggestion_var INT, 
    IN  suggestion_var VARCHAR(1000),
    IN idProfile_var INT
)
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
    END IF;
COMMIT;
END$$
DELIMITER ;