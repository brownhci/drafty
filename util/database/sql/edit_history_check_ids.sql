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

from Interaction i
inner join (select * from users.Session where idProfile in (3758056,3761895,3775301,3801736,3806156,3806346,3806322,3811145,3811638,3811633,3813394,3813485,3813414,3813586,3822642,3822673,3822740,3822748,3823797,3825258,2777796,3840574,3840682,3840780,3840828,3840818,3840841,3840874,3842827,3842765,3842901,3842980,3850890,3866029,3874702,3874766,3874835,3874923,3874917,3874913,3874919,3875422,3883598,3883559,3883633,3889784,3893163,3893264,3894212,3902471,3902526,3902688,3902659,3902786,3902920,3902903,3902949,3902915,3902925,3904093,3904586,3904710,3904698,3904676,3905088,3912307,3912379,3912385,3912273,3912633,3912774,3912505,3912778,3913694,3913997,3026077,3933657,3933788,3933729,3933694,3934076,3885823,3902816,3943554,3912588,3912377,3904548,3904969,4049285,4089262,4102341,4107747,4142059,4144846,4150166,4164499,4180768,4195639,4209200)) us on us.idSession = i.idSession
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

from Interaction i
inner join (select * from users.Session where idProfile in (3758056,3761895,3775301,3801736,3806156,3806346,3806322,3811145,3811638,3811633,3813394,3813485,3813414,3813586,3822642,3822673,3822740,3822748,3823797,3825258,2777796,3840574,3840682,3840780,3840828,3840818,3840841,3840874,3842827,3842765,3842901,3842980,3850890,3866029,3874702,3874766,3874835,3874923,3874917,3874913,3874919,3875422,3883598,3883559,3883633,3889784,3893163,3893264,3894212,3902471,3902526,3902688,3902659,3902786,3902920,3902903,3902949,3902915,3902925,3904093,3904586,3904710,3904698,3904676,3905088,3912307,3912379,3912385,3912273,3912633,3912774,3912505,3912778,3913694,3913997,3026077,3933657,3933788,3933729,3933694,3934076,3885823,3902816,3943554,3912588,3912377,3904548,3904969,4049285,4089262,4102341,4107747,4142059,4144846,4150166,4164499,4180768,4195639,4209200)) us on us.idSession = i.idSession
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

from Interaction i
inner join (select * from users.Session where idProfile in (3758056,3761895,3775301,3801736,3806156,3806346,3806322,3811145,3811638,3811633,3813394,3813485,3813414,3813586,3822642,3822673,3822740,3822748,3823797,3825258,2777796,3840574,3840682,3840780,3840828,3840818,3840841,3840874,3842827,3842765,3842901,3842980,3850890,3866029,3874702,3874766,3874835,3874923,3874917,3874913,3874919,3875422,3883598,3883559,3883633,3889784,3893163,3893264,3894212,3902471,3902526,3902688,3902659,3902786,3902920,3902903,3902949,3902915,3902925,3904093,3904586,3904710,3904698,3904676,3905088,3912307,3912379,3912385,3912273,3912633,3912774,3912505,3912778,3913694,3913997,3026077,3933657,3933788,3933729,3933694,3934076,3885823,3902816,3943554,3912588,3912377,3904548,3904969,4049285,4089262,4102341,4107747,4142059,4144846,4150166,4164499,4180768,4195639,4209200)) us on us.idSession = i.idSession
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