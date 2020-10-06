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

interactionWeights = {
    "click": 2,
    "doubleClick": 3,
    "filterBlur": 2,
    "sorting": 1,
    "domain": 4,
    "suggestion": 4,
    "validation": 3,
    "verification_correctness": 7,
    "copy_paste": 5,
    "scrolling": 2,
    "dwell_time": 2,
    "highlight_duration": 2

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



intIDDict = {
    '1' : click_test,
    '2' : double_click_test,
}



class userInterestService():
    def __init__(self):
        self.university = {}
        self.subfield = {}
        self.bachelors = {}
        self.doctorate = {}


    def genUserScore(self, hist):
        for interact in hist:
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
        print(self.university)
        

    def genUserRec(self, profArr):
        profArr['Inst. Score'] = profArr['University']
        profArr['Subf. Score'] = profArr['SubField']
        profArr['Inst. Score'] = profArr['Inst. Score'].apply(lambda x: instScoreAggregate(x, self.university, self.bachelors, self.subfield))
        profArr['Subf. Score'] = profArr['Subf. Score'].apply(lambda x: subfScoreAggregate(x, self.subfield))
        profArr['Score'] = profArr['Subf. Score'] + profArr['Inst. Score']
        profArr.sort_values(by = ['Score'], ascending = False)
        profArr = profArr[profArr.isnull().any(axis = 1)]
        print(profArr.sort_values(by = ['Score'], ascending = False, na_position ='first'))


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

def genIntHist(args, profileID, interID):
    db_user,db_pass = get_db_creds()
    db = pymysql.connect(host=args.host, user=db_user,
                         password=db_pass,
                         db=args.database, charset='utf8mb4',
                         cursorclass=pymysql.cursors.DictCursor)

    try:
        with db.cursor() as cursor:
            #return double_click_test(cursor)
            return intIDDict[str(interID)](cursor, profileID)
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
    hist = []
    for key in list(intIDDict.keys()):
        hist += genIntHist(args, 66430, key)
    user = userInterestService()
    click = user.genUserScore(hist)
    user.genUserRec(profArr)
    #print(click)
    

if __name__ == '__main__':
    # python3 main.py --host 128.148.36.16 --database csprofessors
    parser = argparse.ArgumentParser(description='Write database data to table HTML file.')
    parser.add_argument('--host', default='localhost',
                        help='The host of the MySQL database')
    parser.add_argument('--database', default='csprofessors',
                        help='The database to be outputtted')
    args = parser.parse_args()
    main(args)