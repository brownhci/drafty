from re import split
import pymysql
import argparse
import os
import sys
import json

sqlSelectSessionCookie = f"""
    select * from users.sessions where data like '%@%' and data like '%"passport":%'
"""
sqlSelectTest = f"""
    SELECT session_id, data FROM users.sessions WHERE session_id in ('4G440Xow2UubaVX8yUwlM33QOSLPANil', '33MvYKO97O92hCD44zxZBPtSIUOqgZvf', 'ZL_m0t6K8vtb54SAEbJB2IVGuvSEB9Uy');
"""

def sqlUpdateSessionCookie(session_id, new_cookie):
    return f""" 
            UPDATE users.sessions SET data = '{new_cookie}' WHERE session_id = '{session_id}';
        """

def printJSON(json_data):
    try:
        json_object = json.loads(json_data)
        json_formatted_str = json.dumps(json_object, indent=2)
        print(json_formatted_str)
    except Exception as e:
        report_error(e)

def check_cookies(cursor):
    try:
        cursor.execute(sqlSelectSessionCookie)
        for row in cursor.fetchall():
            session_id = row['session_id']
            #cookie = row['data']
            cookieJSON = json.loads(row['data'])
            new_cookie = '{'
            for i, (k, v) in enumerate(cookieJSON.items()):
                if k == 'flash':
                    new_cookie += '\"flash\": {}'
                elif k == 'passport':
                    user = json.dumps(cookieJSON[k]).split('@')
                    new_cookie += f""" "{k}":{user[0]}"}} """
                else:
                    new_cookie += f""" "{k}":{json.dumps(cookieJSON[k])} """
                
                if i == len(cookieJSON)-1:
                    pass
                else:
                    new_cookie += ","
            new_cookie += "}"
            cursor.execute(sqlUpdateSessionCookie(session_id, new_cookie))
    except Exception as e:
        report_error(e)

def report_error(e):
    print('ERROR exiting...')
    print(e)
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    print(exc_type)
    print(fname)
    print(exc_tb.tb_lineno)


def get_db_creds():
    with open('../../../backend/.env', 'r') as fh:
        for line in fh.readlines():
            kv = line.strip().split('=')
            k = kv[0]
            if k == 'DB_USER_PROD':
                dbuser = kv[1]
            if k == 'DB_PASS_PROD':
                dbpass = kv[1]
    return dbuser, dbpass


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Write database data to table HTML file.')
    parser.add_argument('--host', default='localhost',
                        help='The host of the MySQL database')
    parser.add_argument('--database', default='csprofessors',
                        help='The database to be outputtted')
    args = parser.parse_args()

    db_name = args.database
    db_user, db_pass = get_db_creds()
    db = pymysql.connect(host=args.host,user=db_user, password=db_pass,
                         db=args.database, charset='utf8mb4',
                         cursorclass=pymysql.cursors.DictCursor,
                         autocommit=True)
    try:
        with db.cursor() as cursor:
            check_cookies(cursor)
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