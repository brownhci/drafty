import argparse
import itertools
import os
import sys

import pymysql
from atomicwrites import atomic_write

db_name = ''
db_user = 'test'
db_pass = 'test'

sql_col_order = "SELECT * FROM SuggestionType st WHERE isActive = 1 ORDER BY st.columnOrder"
sql_col_widths = '''
                SELECT s.idSuggestionType, (ROUND(AVG(LENGTH(s.suggestion))) * 6.6) + 140 as avg_length
                FROM Suggestions s
                INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType
                WHERE st.isActive = 1
                GROUP BY s.idSuggestionType
                '''
sql_suggestions = '''
                SELECT s.idSuggestion, s.idSuggestionType, s.idUniqueID, s.suggestion, smax.columnOrder
                FROM (SELECT idUniqueID FROM UniqueId WHERE active = 1) u
                INNER JOIN Suggestions s ON s.idUniqueID = u.idUniqueID
                INNER JOIN (
                    SELECT idUniqueID, st.idSuggestionType, st.columnOrder, MAX(confidence) max_conf
                    FROM Suggestions s
                    INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType
                    WHERE s.active = 1 AND st.isActive = 1
                    GROUP BY s.idUniqueID, s.idSuggestionType, st.columnOrder
                    ORDER BY st.columnOrder
                ) smax ON smax.idUniqueID = s.idUniqueID AND smax.idSuggestionType = s.idSuggestionType AND smax.max_conf = s.confidence
                ORDER BY s.idUniqueId, smax.columnOrder
                '''

sql_comments = "SELECT idUniqueID, count(*) as ct FROM Comments GROUP BY idUniqueID;"
comments = []

def build_comments():
    cursor.execute(sql_comments)
    rows = cursor.fetchall()
    for r in rows:
        comments.append(r['idUniqueID'])


def build_column_width(row, column_index, column_widths):
    idSuggestionType = row['idSuggestionType']
    width = column_widths[idSuggestionType]
    if db_name == 'csprofessors':
        if idSuggestionType in [2,3,5] and width <= 300:
            width = 300
        elif idSuggestionType in [7]:
            width = 130
    return f'<col id="col{column_index}" data-width="{width}">\n'


def build_colgroup(column_widths):
    cursor.execute(sql_col_order)
    rows = cursor.fetchall()
    number_of_cols = len(rows)
    return f'<colgroup>{"".join(build_column_width(row, i, column_widths) for i, row in enumerate(rows))}</colgroup>\n'


num_columns = None # set below
def get_column_widths(cursor):
    cursor.execute(sql_col_widths)
    rows = cursor.fetchall()
    global num_columns
    num_columns = len(rows)
    return {row['idSuggestionType']: row['avg_length'] for row in rows}


def build_column_label_cell(row, column_index):
    id_suggestion_type = row['idSuggestionType']
    colname = row['name']
    if row['isEditable']:
        content_editable = ""
    else:
        noneditable_indices.append(column_index)
        content_editable = 'contenteditable="false"'
    free_edit = 'false' if row['isFreeEdit'] else 'true'
    return f'<th id="column-label{column_index}" data-id-suggestion-type="{id_suggestion_type}" data-autocomplete-only="{free_edit}" tabindex="-1" scope="col" class="column-label" {content_editable}><span class="column-label-text">{colname}</span><button class="sort-btn"><span class="sr-only sr-only-focusable" aria-label="sort-{colname}"></span></button></th>\n'


def build_column_labels_row(cursor):
    cursor.execute(sql_col_order)
    rows = cursor.fetchall()
    return f'<tr id="column-label-row">{"".join(build_column_label_cell(row, i) for i, row in enumerate(rows))}</tr>'


def build_column_search_row():
    # &#xF002; is the looking glass icon to use as a palceholder
    search_input = '''<th id="column-search{column_search_index}" class="column-search" scope="col" tabindex="-1">
                        <label for="column-search-input{column_search_index}" class="sr-only sr-only-focusable" placeholder="search">
                            Search in Column
                        </label>
                        <input id="column-search-input{column_search_index}" type="search" placeholder="&#xF002;" autocomplete="off">
                      </th>'''
    cursor.execute(sql_col_order)
    rows = cursor.fetchall()
    search_row = f'\n<tr id="column-search-row">\n'
    return f'\n<tr id="column-search-row">\n{"".join(search_input.format(column_search_index=i) for i, row in enumerate(rows))}\n</tr>\n'


def build_table_head(cursor):
    return f'<thead>{build_column_labels_row(cursor)}{build_column_search_row()}</thead>\n'


# make FullName (index 0) and University (index 1) required fields for new row insertion
required_column_indices = {0, 1}


def build_table_foot_cell(column_index):
    required_str = " required" if column_index in required_column_indices else ""
    return f'<th id="foot-cell-{column_index}" scope="col" tabindex="-1"><input id="add-new-row-input{column_index}" type="text" {required_str} autocomplete="off"></th>'


def build_table_foot():
    controls = '''
    <th scope="col" tabindex="-1">
        
    </th>
    '''
    return f'<tfoot><tr>{"".join(build_table_foot_cell(column_index) for column_index in range(num_columns))}</tr><tr>{controls}</tr></tfoot>'


def build_placeholder_table(cursor):
    column_widths = get_column_widths(cursor)
    return f'<table id="table">{build_colgroup(column_widths)}{build_table_head(cursor)}<tbody id="view"></tbody>{build_table_foot()}</table>\n'


noneditable_indices = []


def build_table_datarow_cell(row, cellindex):
    id_suggestion = row['idSuggestion']
    suggestion = row['suggestion']
    #  id_suggestion_type = row['idSuggestionType']
    suggestion = ''.join(chr(c) for c in suggestion.encode('ascii', 'xmlcharrefreplace') if c != 0)
    content_editable = 'contenteditable="false"' if cellindex in noneditable_indices else ""
    return f'<td id="{id_suggestion}" tabindex="-1" {content_editable}>{suggestion}</td>'


def build_table_cell(idSuggestion, suggestion, column_index, comment):
    suggestion = ''.join(chr(c) for c in suggestion.encode('ascii', 'xmlcharrefreplace') if c != 0)
    content_editable = 'contenteditable="false"' if column_index in noneditable_indices else ""
    return f'<td id="{idSuggestion}" tabindex="-1" {content_editable}>{suggestion}{comment}</td>'


def pad_iterator(orig_iter, filler, target_len):
    padded_iter = itertools.chain(orig_iter, itertools.repeat(filler))
    return itertools.islice(padded_iter, target_len)


def build_table_data_sections(cursor):
    cursor.execute(sql_suggestions)
    rows = cursor.fetchall()
    data_rows = []
    current_row = ''
    for i in range(0, len(rows), num_columns):
        idRow = rows[i]['idUniqueID']
        current_row = ''
        lookup = i + num_columns
        column_index = 0
        for row in rows[i:lookup]:
            idSuggestion = row['idSuggestion']
            suggestion = row['suggestion']
            comment = ''
            if idRow in comments and row['idSuggestionType'] == 1:
                comment = '<div id="comment-indicator-' + str(idRow) + '" class="triangle-comments"/>'
            new_cell = build_table_cell(idSuggestion,suggestion,column_index,comment)
            current_row += new_cell
            column_index += 1
        data_rows.append(f'<tr data-id="{idRow}">{current_row}</tr>')
    return f'<template id="table-data"><tbody>{"".join(data_rows)}</tbody></template>'


def build_table_file(cursor):
    table_placeholder  = build_placeholder_table(cursor)
    table_data_sections = build_table_data_sections(cursor)
    return f'{table_placeholder}{table_data_sections}'


def save_to_file(output_file, cursor):
    build_comments()
    with atomic_write(output_file, overwrite=True) as f:
        f.write(build_table_file(cursor))


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
    # python3 build_spreadsheet.py --host localhost --database 2300profs 2300profs.handlebars
    # python3 build_spreadsheet.py --host localhost --database csprofessors csprofessors.handlebars
    parser = argparse.ArgumentParser(description='Write database data to table HTML file.')
    parser.add_argument('--host', default='localhost',
                        help='The host of the MySQL database')
    parser.add_argument('--database', default='csprofessors',
                        help='The database to be outputtted')
    parser.add_argument('outfile',
                        help='where the HTML markup will be written to')
    args = parser.parse_args()

    db_name = args.database
    db_user, db_pass = get_db_creds()
    db = pymysql.connect(host=args.host, user=db_user,
                         password=db_pass,
                         db=args.database, charset='utf8mb4',
                         cursorclass=pymysql.cursors.DictCursor)

    try:
        with db.cursor() as cursor:
            filepath = f'../backend/views/partials/sheets/{args.outfile}'
            save_to_file(filepath, cursor)
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
