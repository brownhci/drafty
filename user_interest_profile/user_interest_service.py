import argparse
import itertools
import os
import sys
import pandas as pd

import pymysql

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


sql_all_interactions = """
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

    es.Edit_Suggestion_isCorrect, es.Edit_Suggestion_Suggestion,es.Edit_Suggestion_isPrevSuggestion,es.Edit_Suggestion_isNew,es.Edit_Suggestion_isChosen,es.edit_rowId

FROM csprofessors.Interaction i
INNER JOIN csprofessors.InteractionType it on it.idInteractionType = i.idInteractionType

INNER JOIN users.Session s ON s.idSession = i.idSession

LEFT JOIN csprofessors.Click c on c.idInteraction = i.idInteraction
LEFT JOIN csprofessors.Suggestions cs on cs.idSuggestion = c.idSuggestion
LEFT JOIN csprofessors.SuggestionType cst on cst.idSuggestionType = cs.idSuggestionType

LEFT JOIN csprofessors.DoubleClick dc on dc.idInteraction = i.idInteraction
LEFT JOIN csprofessors.Suggestions dcs on dcs.idSuggestion = dc.idSuggestion
LEFT JOIN csprofessors.SuggestionType dcst on dcst.idSuggestionType = dcs.idSuggestionType

LEFT JOIN csprofessors.Search se on(se.idInteraction = i.idInteraction)
LEFT JOIN csprofessors.SuggestionType sest on(sest.idSuggestionType = se.idSuggestionType)

LEFT JOIN csprofessors.Sort so on(so.idInteraction = i.idInteraction)
LEFT JOIN csprofessors.SuggestionType sost on(sost.idSuggestionType = so.idSuggestionType)

LEFT JOIN csprofessors.SearchGoogle sg on(sg.idInteraction = i.idInteraction)
LEFT JOIN csprofessors.Suggestions sgs on sgs.idSuggestion = sg.idSuggestion

LEFT JOIN csprofessors.Copy co on(co.idInteraction = i.idInteraction)
LEFT JOIN csprofessors.Suggestions cos on cos.idSuggestion = co.idSuggestion

LEFT JOIN csprofessors.CopyColumn coc on(coc.idInteraction = i.idInteraction)
LEFT JOIN csprofessors.SuggestionType cocst on(cocst.idSuggestionType = coc.idSuggestionType)

LEFT JOIN (
    SELECT idInteraction, group_concat(st.name separator '|') as SearchMulti_ColNames, group_concat(value separator '|') as SearchMulti_SearchValues
    FROM SearchMulti sm INNER JOIN SuggestionType st on sm.idSuggestionType = st.idSuggestionType
    GROUP BY sm.idInteraction
) as sm ON sm.idInteraction = i.idInteraction

LEFT JOIN (SELECT e.IdInteraction, e.isCorrect as Edit_Suggestion_isCorrect,
       group_concat(ess.suggestion separator '|') as Edit_Suggestion_Suggestion,
       group_concat(es.isPrevSuggestion separator '|') as Edit_Suggestion_isPrevSuggestion,
       group_concat(es.isNew separator '|') as Edit_Suggestion_isNew,
       group_concat(es.isChosen separator '|') as Edit_Suggestion_isChosen,
       ess.idUniqueId as edit_rowId
FROM csprofessors.Edit e
INNER JOIN csprofessors.Edit_Suggestion es ON es.idEdit = e.idEdit
INNER JOIN csprofessors.Suggestions ess ON ess.idSuggestion = es.idSuggestion
GROUP BY e.idEdit) as es ON es.IdInteraction = i.idInteraction

LEFT JOIN csprofessors.Paste p ON p.idInteraction = i.idInteraction
LEFT JOIN csprofessors.Suggestions ps ON ps.idSuggestion = p.pasteCellIdSuggestion

WHERE i.idInteractionType IN (1,10,5,6,4,7,8,9,11,14,15,16,18) AND s.idProfile = %s

ORDER BY i.timestamp ASC
"""
# add this to lookup by a user: AND s.idProfile = %s;

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

#function that calls sql_rowvalues needs to pass in three arguments, idprofil, iduniqueid, and time stamp

interactionWeights = {
    "click": 2,
    "doubleClick": 3,
    "editRecord" : 7,
    "filterBlur": 2,
    "sorting": 1,
    "domain": 4,
    "suggestion": 4,
    "validation": 3,
    "verification_correctness": 7,
    "copy": 5,
    "paste" : 5,
    "scrolling": 2,
    "dwell_time": 2,
    "highlight_duration": 2,
    #preliminary value
    "searchGoogle": 5,
    "search-full": 4
}

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
def get_db_creds():
    dbuser, dbpass = 'test', 'test'
    with open('../backend/.env', 'r') as fh:
        for line in fh.readlines():
            kv = line.strip().split('=')
            k = kv[0]
            #if k == 'DB_USER':
            if k == 'DB_USER_PROD':
                dbuser = kv[1]
            #if k == 'DB_PASSWORD':
            if k == 'DB_PASS_PROD':
                dbpass = kv[1]
    return dbuser, dbpass

def get_row_values(cursor, data):
    cursor.execute(sql_rowvalues, data)
    row_values = cursor.fetchall()
    if row_values == ():
        return {'rowvalues': None}
    else:
        return row_values[0]

def column_order_test(cursor):
    cursor.execute(sql_col_order)
    rows = cursor.fetchall()
    print(rows,'\n')
    return rows

def click_test(cursor, profileID):
    cursor.execute(sql_click, profileID)
    rows = cursor.fetchall()
    return rows

def double_click_test(cursor, profileID):
    cursor.execute(sql_double_click, profileID)
    rows = cursor.fetchall()
    return rows

#gets interaction history for a specific profile ID, get last row value 
#with get row values
#note: still need to figure out iduniqueid stuff, and figure out how to deal with none row interactions
def all_interactions_test(cursor, profileID):
    cursor.execute(sql_all_interactions, profileID)
    rows = cursor.fetchall()
    all_row_values = []
    for row in rows:
        row_values ={}
        #checks if interaction is currently supported
        if row['interaction'] not in supported_interactions:
            continue
        #if the interaction is one that has to do with rows, get the rowvalue from the last click
        if row['interaction'] in row_value_interactions:
            row_id = interaction_to_rowID[row['interaction']]
            row_values = get_row_values(cursor, (row['idProfile'], row[row_id], row['timestamp']))
        #if interaction is searchGoogle set searchGoogle values as row values
        elif row['interaction'] == 'searchGoogle':
            row_values['rowvalues'] = row['searchGoogle_searchValues']
        #if interaction is search
        elif row['interaction'] == 'search-full':
            row_values['rowvalues'] = None
            row_values['search_matchedValues'] = str(row['search_matchedValues'])[1:]
            row_values['search_colName'] = row['search_colName']
        elif row['interaction'] == 'sort':
            print(row)
        row_values['interaction'] = row['interaction']
        # adds relevant dict entry to row_values
        all_row_values.append(row_values)
    return(all_row_values)
        


class userInterestService():
    def __init__(self, columns):
        self.columns = columns



# this potentially doesn't count edits if a person has never clicked on the row before, but I'm not sure how that's possible
    def genUserScore(self, hist):
        for interact in hist:
            if interact['interaction'] == 'search-full':
                search_matchedValues = interact['search_matchedValues'].split('|')
                search_col = interact['search_colName']
                for matched_value in search_matchedValues:
                    try:
                        self.columns[search_col][matched_value] += interactionWeights[interact['interaction']]
                    except:
                        self.columns[search_col][matched_value] = interactionWeights[interact['interaction']]
            if interact['rowvalues'] != None:
                row = interact['rowvalues'].split('|')
                i = 0
                for key in self.columns.keys():
                    try:
                        self.columns[key][row[i]] += interactionWeights[interact['interaction']]
                    except:
                        self.columns[key][row[i]] = interactionWeights[interact['interaction']]
                    i+=1
            else:
                print(interact)

    def genUserRec(self, profArr, emptyCount):
        profArr['Inst. Score'] = profArr['University']
        profArr['Subf. Score'] = profArr['SubField']
        profArr['Inst. Score'] = profArr['Inst. Score'].apply(lambda x: instScoreAggregate(self, x, uni_col_names))
        profArr['Subf. Score'] = profArr['Subf. Score'].apply(lambda x: subfScoreAggregate(x, self.columns['SubField']))
        profArr['Score'] = profArr['Subf. Score'] + profArr['Inst. Score']
        profArr.sort_values(by = ['Score'], ascending = False)
        profArr['Empty Count'] = profArr.isnull().sum(axis=1)
        profArr.to_csv('createProfArr.csv')
        profArr = profArr.loc[profArr['Empty Count'] == emptyCount]


def instScoreAggregate(uip, x, uni_col_names):
    total = 0
    for i in range(len(uni_col_names)):
        try: 
            total += uip.columns[uni_col_names[i]]
        except:
            total += 0
    return total

def subfScoreAggregate(x, subfield):
    try:
        return subfield[x]
    except: 
        return 0

def genIntHist(args, profileID):
    db_user,db_pass = get_db_creds()
    db = pymysql.connect(host=args.host, user=db_user,
                         password=db_pass,
                         db=args.database, charset='utf8mb4',
                         cursorclass=pymysql.cursors.DictCursor)

    try:
        with db.cursor() as cursor:
            #return double_click_test(cursor)
            #return intIDDict[str(interID)](cursor, profileID)
            return all_interactions_test(cursor, profileID)
    except Exception as e:
        print('ERROR exiting...')
        print(e)
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(exc_type)
        print(fname)
        print(exc_tb.tb_lineno)
    finally:
        db.close()

def getCols():
    db_user,db_pass = get_db_creds()
    db = pymysql.connect(host=args.host, user=db_user,
                         password=db_pass,
                         db=args.database, charset='utf8mb4',
                         cursorclass=pymysql.cursors.DictCursor)

    try:
        with db.cursor() as cursor:
            return column_order_test(cursor)
    except:
        print('didnt work')
        pass

def main(args):
    profArr = pd.read_csv('finalProfs.csv')
    profArr = profArr.drop(labels = ['JoinYear'], axis = 1)
    # gets whatever the columns are and creates dictionary using those column names
    cols = getCols()
    uip_columns = {}
    for dic in cols:
        uip_columns[dic['name']] = {}
    hist = genIntHist(args, 140368)
    user = userInterestService(uip_columns)
    user.genUserScore(hist)
    user.genUserRec(profArr, 0)
    

if __name__ == '__main__':
    # python3 main.py --host 128.148.36.16 --database csprofessors
    parser = argparse.ArgumentParser(description='Write database data to table HTML file.')
    parser.add_argument('--host', default='localhost',
                        help='The host of the MySQL database')
    parser.add_argument('--database', default='csprofessors',
                        help='The database to be outputtted')
    args = parser.parse_args()
    main(args)