import argparse
import itertools
import os
import sys

import pymysql
from atomicwrites import atomic_write

db_user = 'test'
db_pass = 'test'

# sw90: number of rows per <template>; the lower the number the better the performance
NROWS_IN_SECTION = 50


sql_col_order = "SELECT * FROM SuggestionType st WHERE isActive = 1 ORDER BY st.columnOrder"
sql_col_widths = '''
                SELECT s.idSuggestionType, (ROUND(AVG(LENGTH(s.suggestion))) * 6.6) + 140 as avg_length
                FROM Suggestions s
                INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType
                WHERE st.isActive = 1
                GROUP BY s.idSuggestionType
                '''
sql_suggestions = '''
            SELECT s.idSuggestion, s.idSuggestionType, s.idUniqueID, s.suggestion, st.columnOrder
            FROM Suggestions s
            INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType
            INNER JOIN UniqueId u ON u.idUniqueID = s.idUniqueID
            WHERE s.active = 1 AND st.isActive = 1 AND u.active = 1
            ORDER BY idUniqueID, st.columnOrder, confidence desc
          '''


def build_column_width(row, column_index, column_widths):
    idSuggestionType = row['idSuggestionType']
    width = column_widths[idSuggestionType]
    if idSuggestionType in [2,3,5] and width <= 300:
        width = 300
    elif idSuggestionType in [7] and width <= 240:
        width = 240
    return f'<col id="col{column_index}" data-width="{width}">\n'


def build_colgroup(column_widths):
    cursor.execute(sql_col_order)
    rows = cursor.fetchall()
    return f'<colgroup>{"".join(build_column_width(row, i, column_widths) for i, row in enumerate(rows))}</colgroup>\n'


num_columns = None


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
    return f'<th id="column-label{column_index}" data-id-suggestion-type="{id_suggestion_type}" data-autocomplete-only="{free_edit}" tabindex="-1" class="column-label" {content_editable}><span class="column-label-text">{colname}</span><button class="sort-btn"><span class="sr-only sr-only-focusable">Sort</span></button></th>\n'


def build_column_labels_row(cursor):
    cursor.execute(sql_col_order)
    rows = cursor.fetchall()
    return f'<tr id="column-label-row">{"".join(build_column_label_cell(row, i) for i, row in enumerate(rows))}</tr>'


def build_column_search_row():
    # &#xF002; is the looking glass icon to use as a palceholder
    search_input = '''<th id="column-search{column_search_index}" class="column-search" scope="col" tabindex="-1">
                        <label for="column-search-input{column_search_index}" class="sr-only sr-only-focusable">
                            Search in Column
                        </label>
                        <input id="column-search-input{column_search_index}" type="search" placeholder="&#xF002;">
                      </th>'''
    cursor.execute(sql_col_order)
    rows = cursor.fetchall()
    search_row = f'\n<tr id="column-search-row">\n'
    return f'\n<tr id="column-search-row">\n{"".join(search_input.format(column_search_index=i) for i, row in enumerate(rows))}\n</tr>\n'


def build_table_head(cursor, column_widths):
    return f'<thead>{build_column_labels_row(cursor)}{build_column_search_row()}</thead>\n'


def build_placeholder_table(cursor):
    column_widths = get_column_widths(cursor)
    return f'<table id="table">{build_colgroup(column_widths)}{build_table_head(cursor, column_widths)}</table>\n'


noneditable_indices = []


def build_table_datarow_cell(row, cellindex):
    id_suggestion = row['idSuggestion']
    suggestion = row['suggestion']
    #  id_suggestion_type = row['idSuggestionType']
    suggestion = ''.join(chr(c) for c in suggestion.encode('ascii', 'xmlcharrefreplace') if c != 0)
    content_editable = 'contenteditable="false"' if cellindex in noneditable_indices else ""
    return f'<td id="{id_suggestion}" tabindex="-1" {content_editable}>{suggestion}</td>'


def pad_iterator(orig_iter, filler, target_len):
    padded_iter = itertools.chain(orig_iter, itertools.repeat(filler))
    return itertools.islice(padded_iter, target_len)


def build_table_row(rows_iter):
    # TODO  optimize with manual loop
    rows_iter1, rows_iter2 = itertools.tee(rows_iter)
    first_tablecell = next(rows_iter1)
    id_unique_id = first_tablecell['idUniqueID']
    first_id_suggetion_type = first_tablecell['idSuggestionType']
    id_suggestion_types = set([first_id_suggetion_type])

    def best_in_type(row):
        """
        Gets the first cell with new idSuggestionType field
        (most confident one)
        """
        if row['idSuggestionType'] not in id_suggestion_types:
            id_suggestion_types.add(row['idSuggestionType'])
            return True
        return False

    same_row = lambda row: row['idUniqueID'] == id_unique_id
    tablecell_rows_iter = itertools.chain([first_tablecell],
                                          filter(best_in_type, itertools.takewhile(same_row, rows_iter1)))
    rest_rows_iter = itertools.dropwhile(same_row, rows_iter2)
    datarow_cell_iter = (build_table_datarow_cell(row, i) for i, row in enumerate(
        pad_iterator(
            tablecell_rows_iter,
            filler={'suggestion': ''},
            target_len=num_columns)))
    return f'<tr data-id="{id_unique_id}">{"".join(datarow_cell_iter)}</tr>', rest_rows_iter


def build_table_data_section(rows_iter):
    data_rows = []
    try:
        for _ in range(NROWS_IN_SECTION):
            data_row, rows_iter = build_table_row(rows_iter)
            data_rows.append(data_row)
    except StopIteration:
        rows_iter = None
    return f'<template><tbody>{"".join(data_rows)}</tbody></template>', rows_iter


def build_table_data_sections(cursor):
    cursor.execute(sql_suggestions)
    rows = cursor.fetchall()
    rows_iter = iter(rows)
    data_sections = []
    while True:
        data_section, rows_iter = build_table_data_section(rows_iter)
        data_sections.append(data_section)
        if rows_iter is None:
            break
    return f'<div id="table-data">{"".join(data_sections)}</div>'


def build_table_file(cursor):
    table_placeholder = build_placeholder_table(cursor)
    table_data_sections = build_table_data_sections(cursor)
    return f'{table_placeholder}{table_data_sections}'


def save_to_file(output_file, cursor):
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
    # python3 build_spreadsheet.py --host localhost --database 2300profs --nrows 40 2300profs.hbs
    parser = argparse.ArgumentParser(description='Write database data to table HTML file.')
    parser.add_argument('--host', default='localhost',
                        help='The host of the MySQL database')
    parser.add_argument('--database', default='profs',
                        help='The database to be outputtted')
    parser.add_argument('--nrows', default=NROWS_IN_SECTION, type=int,
                        dest='nrows_in_section',
                        help='how many data row in each section')
    parser.add_argument('outfile',
                        help='where the HTML markup will be written to')
    args = parser.parse_args()

    db_user, db_pass = get_db_creds()
    db = pymysql.connect(host=args.host, user=db_user,
                         password=db_pass,
                         db=args.database, charset='utf8mb4',
                         cursorclass=pymysql.cursors.DictCursor)

    try:
        with db.cursor() as cursor:
            NROWS_IN_SECTION = args.nrows_in_section
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
