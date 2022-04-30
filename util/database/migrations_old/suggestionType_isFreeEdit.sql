-- only for CS Profs dbs
ALTER TABLE SuggestionType ADD isFreeEdit TINYINT(1) NOT NULL DEFAULT '1' AFTER canBeBlank;

UPDATE SuggestionType SET isFreeEdit = '0' 
WHERE idSuggestionType = 7
OR idSuggestionType = 8
OR idSuggestionType = 9
OR idSuggestionType = 10
OR idSuggestionType = 12
OR idSuggestionType = 14;