UPDATE SuggestionTypeValues 
SET active = 0
WHERE value LIKE '% - USA%';

UPDATE SuggestionTypeValues 
SET active = 0
WHERE value LIKE '% - CANADA%';

UPDATE SuggestionTypeValues 
SET active = 0
WHERE value LIKE '% (CANADA)%';