UPDATE SuggestionTypeValues 
SET active = 0
WHERE value LIKE '% - USA%'
AND (idSuggestionType = 3 OR idSuggestionType = 4 OR idSuggestionType = 5);

UPDATE SuggestionTypeValues 
SET active = 0
WHERE value LIKE '% - CANADA%'
AND (idSuggestionType = 3 OR idSuggestionType = 4 OR idSuggestionType = 5);

UPDATE SuggestionTypeValues 
SET active = 0
WHERE value LIKE '% (CANADA)%'
AND (idSuggestionType = 3 OR idSuggestionType = 4 OR idSuggestionType = 5);

UPDATE SuggestionTypeValues 
SET active = 0
WHERE value LIKE '% (USA)%'
AND (idSuggestionType = 3 OR idSuggestionType = 4 OR idSuggestionType = 5);

---

UPDATE SuggestionTypeValues 
SET value = REPLACE(value, " - USA", "")
WHERE value LIKE '% - USA%'
AND (idSuggestionType = 3 OR idSuggestionType = 4 OR idSuggestionType = 5);

UPDATE SuggestionTypeValues 
SET value = REPLACE(value, " - CANADA", "")
WHERE value LIKE '% - CANADA%'
AND (idSuggestionType = 3 OR idSuggestionType = 4 OR idSuggestionType = 5);

UPDATE SuggestionTypeValues 
SET value = REPLACE(value, " (CANADA)", "")
WHERE value LIKE '% (CANADA)%'
AND (idSuggestionType = 3 OR idSuggestionType = 4 OR idSuggestionType = 5);

UPDATE SuggestionTypeValues 
SET value = REPLACE(value, " (USA)", "")
WHERE value LIKE '% (USA)%'
AND (idSuggestionType = 3 OR idSuggestionType = 4 OR idSuggestionType = 5);