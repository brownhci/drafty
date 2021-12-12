def get_db_creds(host):
    dbuser, dbpass = 'test', 'test'
    with open('../backend/.env', 'r') as fh:
        for line in fh.readlines():
            kv = line.strip().split('=')
            k = kv[0]
            if host == 'localhost':
                if k == 'DB_USER':
                    dbuser = kv[1]
                if k == 'DB_PASSWORD':
                    dbpass = kv[1]
            else:
                if k == 'DB_USER_PROD':
                    dbuser = kv[1]
                if k == 'DB_PASS_PROD':
                    dbpass = kv[1]
    return dbuser, dbpass

sql_col_order = """
                SELECT * FROM SuggestionType st WHERE isActive = 1 ORDER BY st.columnOrder
                """

sql_click = """
SELECT i.timestamp, i.idInteractionType, it.interaction, i.idSession, ses.idProfile, c.*
FROM Interaction i
INNER JOIN users.Session ses ON ses.idSession = i.idSession
INNER JOIN InteractionType it ON it.idInteractionType = i.idInteractionType
INNER JOIN Click c on i.idInteraction = c.idInteraction
WHERE ses.idProfile = %s;
"""

sql_double_click = """
SELECT i.timestamp, i.idInteractionType, it.interaction, i.idSession, ses.idProfile, dc.*
FROM Interaction i
INNER JOIN users.Session ses ON ses.idSession = i.idSession
INNER JOIN InteractionType it ON it.idInteractionType = i.idInteractionType
INNER JOIN DoubleClick dc on i.idInteraction = dc.idInteraction
WHERE ses.idProfile = %s;
"""

def sql_all_interactions(idProfile = ''):
    if(idProfile):
        idProfile = f'AND idProfile = {idProfile}'
    sql_all_interactions = f"""
    SELECT
        s.idProfile AS idProfile,i.idSession AS idSession,
        i.idInteraction AS idInteraction,it.interaction AS interaction,i.timestamp AS timestamp,

        cs.idSuggestion AS click_idSuggestion,cs.suggestion AS click_suggestion, cst.name AS click_colName, cs.idUniqueID AS click_rowID, c.rowvalues AS click_rowValues,

        dcs.idSuggestion AS doubleClick_idSuggestion,dcs.suggestion AS doubleClick_suggestion,dcst.name AS doubleClick_colName,dcs.idUniqueID AS doubleClick_rowID,dc.rowvalues AS doubleClick_rowValues,

        se.value AS search_value, sest.name as search_colName, se.matchedValues AS search_matchedValues,

        sost.name AS sort_colName,

        sg.idSuggestion AS searchGoogle_idSuggestion, sg.idUniqueID AS searchGoogle_rowId,sgs.suggestion AS searchGoogle_suggestion, sg.searchValues as searchGoogle_searchValues,

        cos.idSuggestion AS copy_idSuggestion, cos.suggestion AS copy_suggestion,cos.idUniqueID as copy_rowId,

        cocst.name AS copyColumn_colName,

        p.pasteValue as paste_pasteValue, p.copyCellValue as paste_copyCellValue,IF(p.pasteValue = p.copyCellValue,1,0) as paste_copiedFromDrafty, p.pasteCellValue as paste_pasteCellValue,ps.idUniqueID as paste_rowId,

        sm.SearchMulti_ColNames, sm.SearchMulti_SearchValues,

        es.Edit_Suggestion_isCorrect, es.Edit_Suggestion_Suggestion,es.Edit_Suggestion_isPrevSuggestion,es.Edit_Suggestion_isNew,es.Edit_Suggestion_isChosen,es.Edit_RowId,

        esnr.Edit_NewRow_Suggestion_isCorrect, esnr.Edit_NewRow_Suggestion , esnr.Edit_NewRow_RowId,

        esdr.Edit_DelRow_Suggestion_isCorrect, esdr.Edit_DelRow_RowId

    FROM csprofessors.Interaction i
    INNER JOIN csprofessors.InteractionType it on it.idInteractionType = i.idInteractionType

    INNER JOIN users.Session s ON s.idSession = i.idSession

    -- CLICK
    LEFT JOIN csprofessors.Click c on c.idInteraction = i.idInteraction
    LEFT JOIN csprofessors.Suggestions cs on cs.idSuggestion = c.idSuggestion
    LEFT JOIN csprofessors.SuggestionType cst on cst.idSuggestionType = cs.idSuggestionType

    -- DOUBLE-CLICK
    LEFT JOIN csprofessors.DoubleClick dc on dc.idInteraction = i.idInteraction
    LEFT JOIN csprofessors.Suggestions dcs on dcs.idSuggestion = dc.idSuggestion
    LEFT JOIN csprofessors.SuggestionType dcst on dcst.idSuggestionType = dcs.idSuggestionType

    -- SEARCH
    LEFT JOIN csprofessors.Search se on(se.idInteraction = i.idInteraction)
    LEFT JOIN csprofessors.SuggestionType sest on(sest.idSuggestionType = se.idSuggestionType)

    -- SORT
    LEFT JOIN csprofessors.Sort so on(so.idInteraction = i.idInteraction)
    LEFT JOIN csprofessors.SuggestionType sost on(sost.idSuggestionType = so.idSuggestionType)

    -- SEARCH GOOGLE
    LEFT JOIN csprofessors.SearchGoogle sg on(sg.idInteraction = i.idInteraction)
    LEFT JOIN csprofessors.Suggestions sgs on sgs.idSuggestion = sg.idSuggestion

    -- COPY
    LEFT JOIN csprofessors.Copy co on(co.idInteraction = i.idInteraction)
    LEFT JOIN csprofessors.Suggestions cos on cos.idSuggestion = co.idSuggestion

    -- COPY COLUMN
    LEFT JOIN csprofessors.CopyColumn coc on(coc.idInteraction = i.idInteraction)
    LEFT JOIN csprofessors.SuggestionType cocst on(cocst.idSuggestionType = coc.idSuggestionType)

    -- SEARCH MULTIPLE COLS
    LEFT JOIN (
        SELECT idInteraction, group_concat(st.name separator '|') as SearchMulti_ColNames, group_concat(value separator '|') as SearchMulti_SearchValues
        FROM SearchMulti sm INNER JOIN SuggestionType st on sm.idSuggestionType = st.idSuggestionType
        GROUP BY sm.idInteraction
    ) as sm ON sm.idInteraction = i.idInteraction

    -- EDIT CELL
    LEFT JOIN (SELECT e.IdInteraction, e.isCorrect as Edit_Suggestion_isCorrect,
        group_concat(ess.suggestion separator '|') as Edit_Suggestion_Suggestion,
        group_concat(es.isPrevSuggestion separator '|') as Edit_Suggestion_isPrevSuggestion,
        group_concat(es.isNew separator '|') as Edit_Suggestion_isNew,
        group_concat(es.isChosen separator '|') as Edit_Suggestion_isChosen,
        ess.idUniqueId as Edit_RowId
    FROM csprofessors.Edit e
    INNER JOIN csprofessors.Edit_Suggestion es ON es.idEdit = e.idEdit
    INNER JOIN csprofessors.Suggestions ess ON ess.idSuggestion = es.idSuggestion
    GROUP BY e.idEdit) as es ON es.IdInteraction = i.idInteraction

    -- EDIT NEW ROW
    LEFT JOIN (SELECT e.IdInteraction, e.isCorrect as Edit_NewRow_Suggestion_isCorrect,
            ess.suggestion as Edit_NewRow_Suggestion,
            ess.idUniqueId as Edit_NewRow_RowId
        FROM csprofessors.Edit e
        INNER JOIN csprofessors.Edit_NewRow enr ON enr.idEdit = e.idEdit
        INNER JOIN csprofessors.Suggestions ess ON ess.idSuggestion = enr.idSuggestion
    ) as esnr ON esnr.IdInteraction = i.idInteraction

    -- EDIT DEL ROW
    LEFT JOIN (
        SELECT e.IdInteraction, e.isCorrect as Edit_DelRow_Suggestion_isCorrect,
        edr.idUniqueId as Edit_DelRow_RowId
        FROM csprofessors.Edit e
        INNER JOIN csprofessors.Edit_DelRow edr ON edr.idEdit = e.idEdit
    ) as esdr ON esdr.IdInteraction = i.idInteraction

    -- PASTE
    LEFT JOIN csprofessors.Paste p ON p.idInteraction = i.idInteraction
    LEFT JOIN csprofessors.Suggestions ps ON ps.idSuggestion = p.pasteCellIdSuggestion

    WHERE i.idInteractionType IN (1,10,5,6,4,7,8,9,11,14,15,16,18) {idProfile}

    ORDER BY i.timestamp ASC
    """
    # add this to lookup by a user: AND s.idProfile = %s;
    return sql_all_interactions

sql_rowvalues = '''
select rowvalues
from Interaction i
inner join users.Session us on us.idSession = i.idSession
inner join Click c on i.idInteraction = c.idInteraction
inner join Suggestions s on s.idSuggestion = c.idSuggestion
where us.idProfile = %s
and s.idUniqueId = %s
and (i.timestamp <= %s)
order by i.timestamp DESC
limit 1
'''

supported_interactions = ['doubleClick', 'click', 'editRecord', 'copy', 'paste', 'searchGoogle', 'search-full']
row_value_interactions = ['doubleClick', 'click', 'copy', 'paste', 'editRecord']
uni_col_names = ['University', 'Bachelors', 'Doctorate']

interaction_to_value = {
    'click' : 'click_rowValues',
    'doubleClick' : 'doubleClick_rowValues',
    'search-full' : 'search_matchedValues',
}

interaction_to_rowID = {
    'click' : 'click_rowID',
    'doubleClick' : 'doubleClick_rowID',
    'paste' : 'paste_rowId',
    'copy' : 'copy_rowId',
    'editRecord' : 'edit_rowId',
    'searchGoogle' : 'searchGoogle_rowId'
}
