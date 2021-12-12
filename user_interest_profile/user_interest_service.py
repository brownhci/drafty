import argparse
import itertools
import os
import sys
import pandas as pd
import drafty_sql as sql
import pymysql

def get_row_values(cursor, data):
    cursor.execute(sql.sql_rowvalues, data)
    row_values = cursor.fetchall()
    if row_values == ():
        return {'rowvalues': None}
    else:
        return row_values[0]

def column_order_test(cursor):
    cursor.execute(sql.sql_col_order)
    rows = cursor.fetchall()
    print(rows,'\n')
    return rows

def click_test(cursor, profileID):
    cursor.execute(sql.sql_click, profileID)
    rows = cursor.fetchall()
    return rows

def double_click_test(cursor, profileID):
    cursor.execute(sql.sql_double_click, profileID)
    rows = cursor.fetchall()
    return rows

#gets interaction history for a specific profile ID, get last row value 
#with get row values
#note: still need to figure out iduniqueid stuff, and figure out how to deal with none row interactions
def all_interactions_test(cursor, profileID):
    cursor.execute(sql.sql_all_interactions, profileID)
    rows = cursor.fetchall()
    all_row_values = []
    for row in rows:
        row_values ={}
        #checks if interaction is currently supported
        if row['interaction'] not in sql.supported_interactions:
            continue
        #if the interaction is one that has to do with rows, get the rowvalue from the last click
        if row['interaction'] in sql.row_value_interactions:
            row_id = sql.interaction_to_rowID[row['interaction']]
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
                        self.columns[search_col][matched_value] += sql.interactionWeights[interact['interaction']]
                    except:
                        self.columns[search_col][matched_value] = sql.interactionWeights[interact['interaction']]
            if interact['rowvalues'] != None:
                row = interact['rowvalues'].split('|')
                i = 0
                for key in self.columns.keys():
                    try:
                        self.columns[key][row[i]] += sql.interactionWeights[interact['interaction']]
                    except:
                        self.columns[key][row[i]] = sql.interactionWeights[interact['interaction']]
                    i+=1
            else:
                print(interact)

    def genUserRec(self, profArr, emptyCount):
        profArr['Inst. Score'] = profArr['University']
        profArr['Subf. Score'] = profArr['SubField']
        profArr['Inst. Score'] = profArr['Inst. Score'].apply(lambda x: instScoreAggregate(self, x, sql.uni_col_names))
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

def getDBConn(args):
    db_user,db_pass = sql.get_db_creds(args.host)
    print(db_user,db_pass)
    db = pymysql.connect(host=args.host, user=db_user,
                         password=db_pass,
                         db=args.database, charset='utf8mb4',
                         cursorclass=pymysql.cursors.DictCursor)
    return db

def genIntHist(args, profileID):
    try:
        db = getDBConn(args)
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
    try:
        db = getDBConn(args)
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
    # python3 main.py --host 64.154.38.46 --database csprofessors
    parser = argparse.ArgumentParser(description='')
    parser.add_argument('--host', default='localhost',
                        help='The host of the MySQL database')
    parser.add_argument('--database', default='csprofessors',
                        help='The database to be outputtted')
    args = parser.parse_args()
    main(args)