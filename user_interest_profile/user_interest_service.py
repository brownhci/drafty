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
    "highlight_duration": 2
}

supported_interactions = ['doubleClick', 'click', 'editRecord', 'copy', 'paste']

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
    for r in rows:
        print(r['idSuggestionType'],r['name'])

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
        if row['interaction'] not in supported_interactions:
            continue
        row_id = interaction_to_rowID[row['interaction']]
        row_values = get_row_values(cursor, (row['idProfile'], row[row_id], row['timestamp']))
        row_values['interaction'] = row['interaction']
        # adds relevant dict entry to row_values
        #row_values[interaction_to_value[row['interaction']]] = row[interaction_to_value[row['interaction']]]
        all_row_values.append(row_values)
    return(all_row_values)
        


class userInterestService():
    def __init__(self):
        self.university = {}
        self.subfield = {}
        self.bachelors = {}
        self.doctorate = {}


    def genUserScore(self, hist):
        for interact in hist:
            if interact['rowvalues'] != None:
                row = interact['rowvalues'].split('|')
                try:
                    self.university[row[1]]+= interactionWeights[interact['interaction']]
                except:
                    self.university[row[1]] = interactionWeights[interact['interaction']]
                try:
                    self.subfield[row[3]]+= interactionWeights[interact['interaction']]
                except:
                    self.subfield[row[3]] = interactionWeights[interact['interaction']]
                try:
                    self.bachelors[row[4]]+= interactionWeights[interact['interaction']]
                except:
                    self.bachelors[row[4]] = interactionWeights[interact['interaction']]
                try:
                    self.doctorate[row[5]]+= interactionWeights[interact['interaction']]
                except:
                    self.doctorate[row[5]] = interactionWeights[interact['interaction']]
            else:
                print(interact)

    def genUserRec(self, profArr, emptyCount):
        profArr['Inst. Score'] = profArr['University']
        profArr['Subf. Score'] = profArr['SubField']
        profArr['Inst. Score'] = profArr['Inst. Score'].apply(lambda x: instScoreAggregate(x, self.university, self.bachelors, self.subfield))
        profArr['Subf. Score'] = profArr['Subf. Score'].apply(lambda x: subfScoreAggregate(x, self.subfield))
        profArr['Score'] = profArr['Subf. Score'] + profArr['Inst. Score']
        profArr.sort_values(by = ['Score'], ascending = False)
        #profArr = profArr[profArr.isnull().any(axis = 1)]
        profArr['Empty Count'] = profArr.isnull().sum(axis=1)
        profArr.to_csv('createProfArr.csv')
        profArr = profArr.loc[profArr['Empty Count'] == emptyCount]
        #profArr.to_csv('createProfArr.csv')
       # print(profArr.sort_values(by = ['Score'], ascending = False, na_position ='first'))


def instScoreAggregate(x, uni, bach, doct):
    try: 
        uniScore = uni[x]
    except:
        uniScore = 0
    try: 
        bachScore = bach[x]
    except:
        bachScore = 0
    try:
        doctScore = doct[x]
    except:
        doctScore = 0
    return uniScore + bachScore + doctScore

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

def main(args):
    profArr = pd.read_csv('finalProfs.csv')
    profArr = profArr.drop(labels = ['JoinYear'], axis = 1)
    #profArr = profArr.dropna()
    hist = genIntHist(args, 140368)
    #print(hist)
    #hist = genIntHist(args, 66430 , 'poo')
    #print(hist[0:5])
    user = userInterestService()
    click = user.genUserScore(hist)
    user.genUserRec(profArr, 0)
    print(user.bachelors)
    

if __name__ == '__main__':
    # python3 main.py --host 128.148.36.16 --database csprofessors
    parser = argparse.ArgumentParser(description='Write database data to table HTML file.')
    parser.add_argument('--host', default='localhost',
                        help='The host of the MySQL database')
    parser.add_argument('--database', default='csprofessors',
                        help='The database to be outputtted')
    args = parser.parse_args()
    main(args)