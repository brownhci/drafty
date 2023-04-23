select
i.idInteraction,
i.timestamp,
us.idProfile as 'editor',
i.idSession,
e1.idUniqueID as idRow,
'edit cell' as editType,
name.suggestion as FullName,
uni.suggestion as University,
e1.name as columnName,
e2.suggestion as previous,
e1.suggestion as chosen

from (select * from Interaction where timestamp > '2023-03-01') i
inner join users.Session us on us.idSession = i.idSession
inner join users.Profile p on p.idProfile = us.idProfile
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

select
i.idInteraction,
i.timestamp,
us.idProfile as 'editor',
i.idSession,
e1.idUniqueID as idRow,
'new row' as editType,
name.suggestion as FullName,
uni.suggestion as University,
e1.name as columnName,
'' as previous,
e1.suggestion as chosen

from (select * from Interaction where timestamp > '2023-03-01') i
inner join users.Session us on us.idSession = i.idSession
inner join users.Profile p on p.idProfile = us.idProfile
inner join Edit e on e.IdInteraction = i.idInteraction
inner join (
    select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_NewRow es
    inner join Suggestions s on s.idSuggestion = es.idSuggestion
    inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
    where isCorrect < 3
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

UNION

select
i.idInteraction,
i.timestamp,
us.idProfile as 'editor',
i.idSession,
e1.idUniqueID as idRow,
'del row' as editType,
name.suggestion as FullName,
uni.suggestion as University,
'' as columnName,
CONCAT(name.suggestion,' (',uni.suggestion,')') as previous,
'[row deleted]'    as chosen

from (select * from Interaction where timestamp > '2023-03-01') i
inner join users.Session us on us.idSession = i.idSession
inner join users.Profile p on p.idProfile = us.idProfile
inner join Edit e on e.IdInteraction = i.idInteraction
inner join (
    select es.idEdit, es.idUniqueID
    from Edit_DelRow es
) e1 on e1.idEdit = e.idEdit
         inner join (
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
             select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
             from csprofessors.Suggestions
             where idSuggestionType = 1
               and active = 1
             group by idUniqueID, idSuggestionType
         ) as mx
             inner join csprofessors.Suggestions s
                        on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and
                           s.confidence = mx.maxconf
) name on name.idUniqueID = e1.idUniqueID
         inner join (
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
             select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
             from csprofessors.Suggestions
             where idSuggestionType = 2
               and active = 1
             group by idUniqueID, idSuggestionType
         ) as mx
             inner join csprofessors.Suggestions s
                        on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and
                           s.confidence = mx.maxconf
) uni on uni.idUniqueID = e1.idUniqueID
order by idInteraction