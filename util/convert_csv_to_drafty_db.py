import pandas as pd 
import argparse
import pymysql
import csv
import sys
import os

from pymysql.constants import CLIENT

# GLOBAL VARS

columns = {} # name_in_csv: idSuggestionType in DB
newRows = {}
newSuggestions = {}

# bad unis for 
bad_unis = ['Drexel University','Gonzaga University','Illinois Institute of Technology','McMaster University','New Jersey Institute of Technology','New York University Shanghai','Northern Arizona University','Peking University','University of California, Merced','University of Rhode Island','University of South Florida','Augusta University','Australian National University','Bocconi University','California State Polytechnic University, Pomona','ETH Zurich','Free University of Brussels','Goldsmiths, University of London','Hebrew University of Jerusalem','Indian Institute of Science','Indian Institute of Technology Bombay','Indian Institute of Technology Delhi','Indian Institute of Technology Madras','KAIST','King Abdullah University of Science and Technology','Max Planck Society','National Cheng Kung University','National University of Singapore','Qatar Computing Research Institute','Singapore University of Technology and Design','University College London','University of Amsterdam','University of Cambridge','University of Edinburgh','University of Hamburg','University of Lugano','University of Science and Technology of China','University of St Andrews','University of Surrey','University of York','École normale supérieure','École polytechnique fédérale de Lausanne']

# SQL

sql_check_db_exists = "SELECT count(*) as ct FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME LIKE %s"
sql_col_order = "SELECT * FROM SuggestionType st ORDER BY st.columnOrder"  

sql_insert_row = "INSERT INTO UniqueId (idUniqueID, active) VALUES (%s, %s) "
sql_insert_suggestion = "INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) VALUES (%s, %s, %s, 2, %s, 10);" # sw: 2 is the system user idProfile

# UTIL functions

def get_db_creds():
    dbuser = ''
    dbpass = ''
    with open('../backend/.env', 'r') as fh:
        for line in fh.readlines():
            kv = line.strip().split('=')
            k = kv[0]
            if k == 'DB_USER':
                dbuser = kv[1]
            if k == 'DB_PASSWORD':
                dbpass = kv[1]
    return dbuser, dbpass

def get_data_pd(file_location, index):
    return pd.read_csv(file_location, index_col = index)

def create_new_db(new_db_name):
    command = "mysqldump drafty_seed | mysqldump " + new_db_name # COPY drafty seed db
    os.popen(command)

def check_if_db_exists(db_check_name,db_user,db_pass):
    db_exists = 0
    try:
        db = pymysql.connect(host='localhost', 
                         user=db_user, password=db_pass,
                         charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
        with db.cursor() as cursor:
            cursor.execute(sql_check_db_exists, db_check_name)
        db_exists = cursor.fetchall()[0]['ct']
    except Exception as e:
        print('\nERROR check_if_db_exists()...')
        print(e)
        exc_type, exc_obj, exc_tb = sys.exc_info()
        fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
        print(exc_type)
        print(fname)
        print(exc_tb.tb_lineno)
        exit()
    finally:
        db.close()
        return db_exists
    
def get_columns(csv_name):
    with open(csv_name) as csvfile:
        reader = csv.reader(csvfile)
        header = next(reader)
        for name in header:
            columns[name] = {'id':-1,'inCSV':1,'inDB':-1}
    #print(columns)

def check_headers_cols(db):
    with db.cursor() as cursor:
        cursor.execute(sql_col_order)
        for row in cursor.fetchall():
            idSuggestionType = row['idSuggestionType']
            name = row['name']
            if name in columns:
                columns[name]['id'] = idSuggestionType
                columns[name]['inDB'] = 1
            else:
                columns[name] = {'id':idSuggestionType,'inCSV':0,'inDB':1}


def print_test(idRow,idSuggestion,idSuggestionType,suggestion):
    print('idRow: ', idRow)
    print('idSuggestion: ', idSuggestion)
    print('idSuggestionType: ', idSuggestionType)
    print('suggestion: ', suggestion,'\n')


def get_sql_from_file(filename):
    """
    Get the SQL instruction from a file

    :return: a list of each SQL query whithout the trailing ";"
    """
    from os import path

    # File did not exists
    if path.isfile(filename) is False:
        print("File load error : {}".format(filename))
        return False

    else:
        with open(filename, "r") as sql_file:
            # Split file in list
            ret = sql_file.read().split(';')
            # drop last empty entry
            ret.pop()
            return ret


def create_new_seed_db(filename): 
    request_list = get_sql_from_file()
    if request_list is not False:
        for idx, sql_request in enumerate(request_list):
            message = MSG['request'].format(idx, sql_request)
            cursor.execute(sql_request + ';')


def insert_new_row(db,idRow,active):
    try:
        with db.cursor() as cursor:
            cursor.execute(sql_insert_row, (idRow,active))
    except Exception as e:
        print(f"insert_new_row error '{e}' ")
        exit()

def insert_new_suggestion(db,idSuggestion, idSuggestionType, idRow, suggestion):
    try:
        with db.cursor() as cursor:
            cursor.execute(sql_insert_suggestion, (idSuggestion, idSuggestionType, idRow, suggestion))
    except Exception as e:
        print(f"insert_new_suggestion error '{e}' ")
        exit()

# loop through csv
def convert_data(csv_name,db):
    print('1',len(columns))
    idRow = 0
    idSuggestion = 0
    try:
        with open(csv_name) as csvfile:
            reader = csv.DictReader(csvfile)
            for row in reader:
                idRow += 1
                active  = 1
                if row['University'] in bad_unis:
                    active = 0
                print('2',len(columns))
                insert_new_row(db, idRow, active)
                print('3',len(columns))
                for k,v in columns.items():
                    idSuggestionType = v['id']
                    if v['inCSV']:
                        idSuggestion += 1
                        suggestion = row[k]
                        print_test(idRow,idSuggestion,idSuggestionType,suggestion)
                        # idSuggestion, idSuggestionType, idUniqueID, suggestion
                        insert_new_suggestion(db, idSuggestion, idSuggestionType, idRow, suggestion)
    except Exception as e:
        print('Error convert_data: ' + e)
    finally:
        return


##########################

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Convert tabular data to drafty db.')
    parser.add_argument('--csv', default='import_me.csv',
                        help='The name of the csv file')
    parser.add_argument('--database', default='new_db_from_csv',
                        help='The new database name')
    args = parser.parse_args()

    #df = pd.read_csv(args.csv)
    db_user, db_pass = get_db_creds()
    
    if check_if_db_exists(args.database,db_user,db_pass):
        print('db_exists\n')
        db = pymysql.connect(host='localhost', db=args.database,  
                        user=db_user, password=db_pass, 
                        client_flag=CLIENT.MULTI_STATEMENTS,
                        charset='utf8mb4', cursorclass=pymysql.cursors.DictCursor)
    else:
        print('Exiting...db does not exist')
        exit()

    try:
        get_columns(args.csv)
        check_headers_cols(db)
        convert_data(args.csv,db)
        # db connection is not autocommit by default. So you must commit to save changes.
        db.commit()
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
