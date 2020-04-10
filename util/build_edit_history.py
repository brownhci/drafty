import argparse
import itertools
import os

import pymysql
from atomicwrites import atomic_write

db_user = 'test'
db_pass = 'test'

sql = '''
    SELECT p.email, su.suggestion, sut.name as col, i.timestamp, sname.suggestion as prof_name, suni.suggestion as university
    FROM Edit e
    INNER JOIN (SELECT idEdit, idSuggestion FROM Edit_Suggestion WHERE isChosen = 1) es ON es.idEdit = e.idEdit
    INNER JOIN Suggestions su ON su.idSuggestion = es.idSuggestion
    INNER JOIN SuggestionType sut ON sut.idSuggestionType = su.idSuggestionType
    INNER JOIN (SELECT * FROM Suggestions WHERE idSuggestionType = 1 GROUP BY idUniqueId) sname ON sname.idUniqueId = su.idUniqueId
    INNER JOIN (SELECT * FROM Suggestions WHERE idSuggestionType = 2 GROUP BY idUniqueId) suni ON suni.idUniqueId = su.idUniqueId
    INNER JOIN Interaction i ON i.idInteraction = e.IdInteraction
    INNER JOIN users.Session s ON s.idSession = i.idSession
    INNER JOIN (SELECT * FROM users.Profile) p on p.idProfile = s.idProfile 
    '''
    # (1139, "Got error 'repetition-operator operand invalid' from regexp")
    # INNER JOIN (SELECT * FROM users.Profile WHERE email REGEXP '^((?!@).)*$') p on p.idProfile = s.idProfile  

def build_csv_file(cursor):
    cursor.execute(sql)
    out = ''
    for row in cursor.fetchall():
        email = row['email']
        if '@' not in email:
            out += '\"' + email
            out += '\",\"' + row['suggestion']
            out += '\",\"' + row['col']
            out += '\",\"' + str(row['timestamp'])
            out += '\",\"' + row['prof_name']
            out += '\",\"' + row['university'] + '\"\n'
    return out


def save_to_file(output_file, cursor):
    with atomic_write(output_file, overwrite=True) as f:
        f.write('\"worker_id\",\"edit\",\"column\",\"timestamp\",\"professor_name\",\"university\"\n')
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
    # python3 build_spreadsheet.py --host localhost --database 2300profs --nrows 40 2300profs.hbs
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
        print('ERROR exiting...')
        print(e)
    finally:
        db.close()
