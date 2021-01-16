import argparse
import itertools
import os
import sys

import pymysql
from atomicwrites import atomic_write

sql_edits_online = """
    select us.idProfile, i.idSession, e1.idUniqueID, e1.name as column_name, e1.suggestion as chosen, e2.suggestion as previous,i.timestamp
    from Interaction i
    inner join users.Session us on us.idSession = i.idSession
    inner join Edit e on e.IdInteraction = i.idInteraction
    inner join (
        select es.idEdit, s.suggestion, s.idUniqueID from Edit_Suggestion es
        inner join Suggestions s on s.idSuggestion = es.idSuggestion
        where isChosen = 1
    ) e1 on e1.idEdit = e.idEdit
    inner join (
        select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_Suggestion es
        inner join Suggestions s on s.idSuggestion = es.idSuggestion
        inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
        where isPrevSuggestion = 1
    ) e2 on e2.idEdit = e.idEdit
    order by i.timestamp desc;
"""

sql_edits_new = """
    select us.idProfile, i.idSession, e1.idUniqueID, e1.name as column_name, e1.suggestion as chosen, '' as previous,i.timestamp
    from Interaction i
    inner join users.Session us on us.idSession = i.idSession
    inner join Edit e on e.IdInteraction = i.idInteraction
    inner join (
        select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_NewRow es
        inner join Suggestions s on s.idSuggestion = es.idSuggestion
        inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
    ) e1 on e1.idEdit = e.idEdit
    order by i.timestamp desc;
"""

sql_row_identifier = """
    
"""