/***/

  /*
  * Each Edit is one of 3 possible scenarios:
  * 1. The suggested value already exists, therefore we need to increment the confidence
  * 2. It is a new suggestion for that row/column (idUniqueId/idSuggestionType)
  * 3. It is an Alias: the edit is similar to an existing suggestion for that row/column (idUniqueId/idSuggestionType)
  * FINALLY: record the edit happened and return the idSuggestion if #1
  */

DELIMITER $$
CREATE PROCEDURE new_suggestion(
    INOUT  idSuggestion_var INT, 
    IN  suggestion_var VARCHAR(1000),
    IN idProfile_var INT
)
BEGIN

    DECLARE sugg_exists INT DEFAULT 0;
    DECLARE alias_exists INT DEFAULT 0;
    DECLARE idSuggestionType_var INT;
    DECLARE idUniqueId_var INT;
    DECLARE confidence_var INT DEFAULT 1;

START TRANSACTION;  
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
        SET idSuggestion_var = (SELECT LAST_INSERT_ID());
    END IF;
COMMIT;
END $$
 
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
END $$
 
DELIMITER ;