import argparse
import itertools
import os
import sys

import pymysql
from atomicwrites import atomic_write

db_user = 'test'
db_pass = 'test'

sql = '''
    SELECT p.email as user_MTurkID, su.suggestion, sut.name as col, i.timestamp, sname.suggestion as prof_name, suni.suggestion as university, 
    p.idProfile as user_id_profile, s.idSession as user_id_session, s.idExpressSession as user_id_session_hash, es.data as user_data_dump
    FROM Edit e
    INNER JOIN (SELECT idEdit, idSuggestion FROM Edit_Suggestion WHERE isChosen = 1) es ON es.idEdit = e.idEdit
    INNER JOIN Suggestions su ON su.idSuggestion = es.idSuggestion
    INNER JOIN SuggestionType sut ON sut.idSuggestionType = su.idSuggestionType
    INNER JOIN (SELECT * FROM Suggestions WHERE idSuggestionType = 1 GROUP BY idUniqueId) sname ON sname.idUniqueId = su.idUniqueId
    INNER JOIN (SELECT * FROM Suggestions WHERE idSuggestionType = 2 GROUP BY idUniqueId) suni ON suni.idUniqueId = su.idUniqueId
    INNER JOIN Interaction i ON i.idInteraction = e.IdInteraction
    INNER JOIN users.Session s ON s.idSession = i.idSession
    INNER JOIN users.sessions es ON es.session_id = s.idExpressSession
    INNER JOIN (SELECT * FROM users.Profile) p on p.idProfile = s.idProfile
    '''
    # WHERE suni.suggestion != 'University of Montreal' 
    # (1139, "Got error 'repetition-operator operand invalid' from regexp")
    # INNER JOIN (SELECT * FROM users.Profile WHERE email REGEXP '^((?!@).)*$') p on p.idProfile = s.idProfile  

def report_error(e):
    print('ERROR exiting...')
    print(e)
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    print(exc_type)
    print(fname)
    print(exc_tb.tb_lineno)

def checkNone(s):
    if s is None:
        return ''
    return str(s)

def build_csv_file(cursor):
    try:
        cursor.execute(sql)
        out = ''
        for row in cursor.fetchall():
            email = checkNone(row['user_MTurkID']) # sw: email is field in db
            if 'brown' not in email:
                out += '\"' + email
                out += '\",\"' + row['suggestion']
                out += '\",\"' + row['col']
                out += '\",\"' + str(row['timestamp'])
                out += '\",\"' + row['prof_name']
                out += '\",\"' + row['university']
                out += '\",\"' + str(row['user_id_profile'])
                out += '\",\"' + str(row['user_id_session'])
                out += '\",\"' + str(row['user_id_session_hash'])
                out += '\",\"' + row['user_data_dump']
                out += '\"\n'
        return out
    except Exception as e:
        report_error(e)


def save_to_file(output_file, cursor):
    with atomic_write(output_file, overwrite=True) as f:
        f.write('\"worker_id\",\"edit\",\"column\",\"timestamp\",\"professor_name\",\"university\",\"user_id_profile\",\"user_id_session\",\"user_id_session_hash\",\"user_data_dump\"\n')
        f.write(build_csv_file(cursor))


def get_db_creds():
    with open('../backend/.env', 'r') as fh:
        for line in fh.readlines():
            kv = line.strip().split('=')
            k = kv[0]
            if k == 'DB_USER':
                dbuser = kv[1]
            if k == 'DB_PASSWORD':
                dbpass = kv[1]
    return dbuser, dbpass


if __name__ == '__main__':
    # python3 build_edit_history.py --host localhost --database 2300profs 2300profs.hbs
    parser = argparse.ArgumentParser(description='Write database data to table HTML file.')
    parser.add_argument('--database', default='2300profs',
                        help='The database to be outputtted')
    parser.add_argument('outfile',
                        help='where the HTML markup will be written to')
    args = parser.parse_args()

    db_user, db_pass = get_db_creds()
    db = pymysql.connect(host='localhost', user=db_user,
                         password=db_pass,
                         db=args.database, charset='utf8mb4',
                         cursorclass=pymysql.cursors.DictCursor)

    try:
        with db.cursor() as cursor:
            filepath = f'../backend/data_sharing/{args.outfile}'
            save_to_file(filepath, cursor)
    except Exception as e:
        report_error(e)
    finally:
        db.close()
