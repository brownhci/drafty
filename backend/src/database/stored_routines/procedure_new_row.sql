--
-- 1. first create new row; return idUniqueId
-- 2. create interaction and edit, return idEdit
--
-- LOOP - new suggestions
-- 
-- 3. (PROCEDURE) create new suggestions and edit_suggestion, return idSuggestion
-- 4. (PROCEDURE) create suggestions for user and last_updated
--

DELIMITER $$
CREATE PROCEDURE new_suggestion_from_new_row(
    IN  suggestion_var VARCHAR(1000),
    IN idEdit_var INT,
    IN idProfile_var INT,
    IN idSuggestionType_var INT,
    IN idUniqueId_var INT,
    OUT idSuggestion INT
)
BEGIN
    DECLARE confidence_var INT DEFAULT 1;

START TRANSACTION;  
    --- insert new suggestion
    INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (null, idSuggestionType_var, idUniqueId_var, idProfile_var, suggestion_var, confidence_var);
    --- get new idSuggestion
    SET idSuggestion_var = (SELECT LAST_INSERT_ID());

    --- insert last updated - idProfile
    INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (null, idSuggestionType_var, idUniqueId_var, idProfile_var, idProfile_var, confidence_var);

    --- insert last updated by - CURRENT_TIMESTAMP
    INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (null, idSuggestionType_var, idUniqueId_var, idProfile_var, CURRENT_TIMESTAMP, confidence_var);

    --- insert into edit_suggestions
    INSERT INTO Edit_Suggestion (idEdit,idSuggestion,isPrevSuggestion,isNew,isChosen) VALUES (idEdit_var,idSuggestion_var,0,1,1);
COMMIT;
END$$
DELIMITER ;