import argparse
import os
import sys
import pandas as pd
import drafty_sql as sql
import pymysql

def column_order_test(cursor):
    cursor.execute(sql.sql_col_order)
    rows = cursor.fetchall()
    print(rows,'\n')
    for r in rows:
        print(r['idSuggestionType'],r['name'])

def click_test(cursor):
    example_idProfile = 66430
    cursor.execute(sql.sql_all_interactions, (example_idProfile))
    rows = cursor.fetchall()
    print(rows,'\n')
    return rows
    # for r in rows:
    #     print(r)

def double_click_test(cursor):
    example_idProfile = 66430
    cursor.execute(sql.sql_double_click, (example_idProfile))
    rows = cursor.fetchall()
    #print(rows,'\n')
    for r in rows:
        print(r)

if __name__ == '__main__':
    # python3 main.py --host 64.154.38.46 --database csprofessors
    parser = argparse.ArgumentParser(description='Write database data to table HTML file.')
    parser.add_argument('--host', default='localhost',
                        help='The host of the MySQL database')
    parser.add_argument('--database', default='csprofessors',
                        help='The database to be outputtted')
    args = parser.parse_args()

    db_user,db_pass = sql.get_db_creds(args.host)
    db = pymysql.connect(host=args.host, user=db_user,
                         password=db_pass,
                         db=args.database, charset='utf8mb4',
                         cursorclass=pymysql.cursors.DictCursor)
    try:
        with db.cursor() as cursor:
            #column_order_test(cursor)
            click_test(cursor)
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