import argparse
import itertools
import os
import sys

import pymysql
from atomicwrites import atomic_write

# sw: there are different variations of the sql, how the first sql runs everything in one goroutine
# thus making the python code simplistic
sql = """
select us.idProfile, i.idSession, e1.idUniqueID as idRow, 'edit cell' as editType, name.suggestion as FullName, uni.suggestion as University, e1.name as columnName, e1.suggestion as chosen, e2.suggestion as previous,i.timestamp
from Interaction i
inner join users.Session us on us.idSession = i.idSession
inner join Edit e on e.IdInteraction = i.idInteraction
inner join (
    select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_Suggestion es
    inner join Suggestions s on s.idSuggestion = es.idSuggestion
    inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
    where isChosen = 1
) e1 on e1.idEdit = e.idEdit
inner join (
    select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_Suggestion es
    inner join Suggestions s on s.idSuggestion = es.idSuggestion
    inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
    where isPrevSuggestion = 1
) e2 on e2.idEdit = e.idEdit
inner join (
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
        select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
        from csprofessors.Suggestions
        where idSuggestionType = 1 and active = 1
        group by idUniqueID, idSuggestionType
    ) as mx
    inner join csprofessors.Suggestions s
    on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
) name on name.idUniqueID = e1.idUniqueID
inner join (
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
        select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
        from csprofessors.Suggestions
        where idSuggestionType = 2 and active = 1
        group by idUniqueID, idSuggestionType
    ) as mx
    inner join csprofessors.Suggestions s
    on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
) uni on uni.idUniqueID = e1.idUniqueID
UNION
select us.idProfile, i.idSession, e1.idUniqueID as idRow, 'new row' as editType, name.suggestion as FullName, uni.suggestion as University, e1.name as columnName, e1.suggestion as chosen, '' as previous,i.timestamp
from Interaction i
inner join users.Session us on us.idSession = i.idSession
inner join Edit e on e.IdInteraction = i.idInteraction
inner join (
    select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_NewRow es
    inner join Suggestions s on s.idSuggestion = es.idSuggestion
    inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
) e1 on e1.idEdit = e.idEdit
inner join (
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
        select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
        from csprofessors.Suggestions
        where idSuggestionType = 1 and active = 1
        group by idUniqueID, idSuggestionType
    ) as mx
    inner join csprofessors.Suggestions s
    on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
) name on name.idUniqueID = e1.idUniqueID
inner join (
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
        select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
        from csprofessors.Suggestions
        where idSuggestionType = 2 and active = 1
        group by idUniqueID, idSuggestionType
    ) as mx
    inner join csprofessors.Suggestions s
    on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
) uni on uni.idUniqueID = e1.idUniqueID
order by timestamp desc;
"""

sql_edits_online = """
    select us.idProfile, i.idSession, e1.idUniqueID as idRow, 'edit cell' as editType, name.suggestion as FullName, uni.suggestion as University, e1.name as columnName, e1.suggestion as chosen, e2.suggestion as previous,i.timestamp
    from Interaction i
    inner join users.Session us on us.idSession = i.idSession
    inner join Edit e on e.IdInteraction = i.idInteraction
    inner join (
        select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_Suggestion es
        inner join Suggestions s on s.idSuggestion = es.idSuggestion
        inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
        where isChosen = 1
    ) e1 on e1.idEdit = e.idEdit
    inner join (
        select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_Suggestion es
        inner join Suggestions s on s.idSuggestion = es.idSuggestion
        inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
        where isPrevSuggestion = 1
    ) e2 on e2.idEdit = e.idEdit
    inner join (
        select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
        from (
            select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
            from csprofessors.Suggestions
            where idSuggestionType = 1 and active = 1
            group by idUniqueID, idSuggestionType
        ) as mx
        inner join csprofessors.Suggestions s
        on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
    ) name on name.idUniqueID = e1.idUniqueID
    inner join (
        select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
        from (
            select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
            from csprofessors.Suggestions
            where idSuggestionType = 2 and active = 1
            group by idUniqueID, idSuggestionType
        ) as mx
        inner join csprofessors.Suggestions s
        on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
    ) uni on uni.idUniqueID = e1.idUniqueID
    order by i.timestamp desc;
"""

sql_edits_new = """
    select us.idProfile, i.idSession, e1.idUniqueID as idRow, 'new row' as editType, name.suggestion as FullName, uni.suggestion as University, e1.name as columnName, e1.suggestion as chosen, '' as previous,i.timestamp
    from Interaction i
    inner join users.Session us on us.idSession = i.idSession
    inner join Edit e on e.IdInteraction = i.idInteraction
    inner join ( 
        select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_NewRow es
        inner join Suggestions s on s.idSuggestion = es.idSuggestion
        inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
    ) e1 on e1.idEdit = e.idEdit
    inner join (
        select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
        from (
            select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
            from csprofessors.Suggestions
            where idSuggestionType = 1 and active = 1
            group by idUniqueID, idSuggestionType
        ) as mx
        inner join csprofessors.Suggestions s
        on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
    ) name on name.idUniqueID = e1.idUniqueID
    inner join (
        select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
        from (
            select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
            from csprofessors.Suggestions
            where idSuggestionType = 2 and active = 1
            group by idUniqueID, idSuggestionType
        ) as mx
        inner join csprofessors.Suggestions s
        on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
    ) uni on uni.idUniqueID = e1.idUniqueID
    order by i.timestamp desc;
"""

sql_row_identifier = """
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
        select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
        from csprofessors.Suggestions
        where (idSuggestionType = 1 or idSuggestionType = 2) and active = 1
        group by idUniqueID, idSuggestionType
    ) as mx
    inner join csprofessors.Suggestions s
    on s.idUniqueID = mx.idUniqueID
    and s.idSuggestionType = mx.idSuggestionType
    and s.confidence = mx.maxconf;
"""