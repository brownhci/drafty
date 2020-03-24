import argparse
import itertools

import pymysql
from atomicwrites import atomic_write

NROWS_IN_SECTION = 50 # sw90: number of rows per <template>; the lower the number the better the performance

sql_col_widths = "SELECT idSuggestionType, (ROUND(AVG(LENGTH(suggestion))) * 6.6) + 100 as avg_length FROM Suggestions GROUP BY idSuggestionType"
sql_col_order = "SELECT * FROM SuggestionType st WHERE isActive = 1 ORDER BY st.columnOrder"
sql_suggestions = '''
            SELECT s.idSuggestion, s.idSuggestionType, s.idUniqueID, s.suggestion, st.columnOrder
            FROM Suggestions s
            INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType
            INNER JOIN UniqueId u ON u.idUniqueID = s.idUniqueID
            WHERE s.active = 1 AND st.isActive = 1 AND u.active = 1
            ORDER BY idUniqueID, st.columnOrder, confidence desc
          '''


def build_column_width(row, column_index, column_widths):
    width = column_widths[row['idSuggestionType']]
    return f'<col id="col{column_index}" style="width:{width}px" >\n'


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
    return f'<th id="column-label{column_index}" data-id-suggestion-type="{id_suggestion_type}" tabindex="-1" class="column-label">{colname}<button class="sort-btn"></button></th>\n'


def build_column_labels_row(cursor):
    cursor.execute(sql_col_order)
    rows = cursor.fetchall()
    return f'<tr id="column-label-row">{"".join(build_column_label_cell(row, i) for i, row in enumerate(rows))}</tr>'


def build_column_search_row():
    # &#xF002; is the looking glass icon to use as a palceholder
    search_input = '''<th id="column-search{column_search_index}" class="column-search" scope="col" tabindex="-1"><input type="search" placeholder="&#xF002;"></th>'''
    cursor.execute(sql_col_order)
    rows = cursor.fetchall()
    return f'\n<tr id="column-search-row">\n{"".join(search_input.format(column_search_index=i) for i, row in enumerate(rows))}</tr>\n'


def build_table_head(cursor, column_widths):
    return f'<thead>{build_column_labels_row(cursor)}{build_column_search_row()}</thead>\n'


def build_placeholder_table(cursor):
    column_widths = get_column_widths(cursor)
    return f'<table id="table">{build_colgroup(column_widths)}{build_table_head(cursor, column_widths)}</table>\n'


def build_table_datarow_cell(row):
    id_suggestion = row['idSuggestion']
    suggestion = row['suggestion']
    #  id_suggestion_type = row['idSuggestionType']
    suggestion = ''.join(chr(c) for c in suggestion.encode('ascii', 'xmlcharrefreplace') if c != 0)
    return f'<td id="{id_suggestion}" tabindex="-1">{suggestion}</td>'


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
    datarow_cell_iter = pad_iterator(
        map(build_table_datarow_cell, tablecell_rows_iter),
        '<td tabindex="-1"></td>',
        num_columns)
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


if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Write database data to table HTML file.')
    parser.add_argument('--host', default='localhost',
                        help='The host of the MySQL database')
    parser.add_argument('--username', default='testuser',
                        help='The user of the MySQL database')
    parser.add_argument('--password', default='testpassword',
                        help='The password of the MySQL database')
    parser.add_argument('--database', default='profs',
                        help='The database to be outputtted')
    parser.add_argument('--nrows', default=NROWS_IN_SECTION, type=int,
                        dest='nrows_in_section',
                        help='how many data row in each section')
    parser.add_argument('outfile',
                        help='where the HTML markup will be written to')
    args = parser.parse_args()

    try:
        db = pymysql.connect(host=args.host, user=args.username,
                             password=args.password,
                             db=args.database, charset='utf8mb4',
                             cursorclass=pymysql.cursors.DictCursor)
        with db.cursor() as cursor:
            NROWS_IN_SECTION = args.nrows_in_section
            filepath = f'../backend/views/partials/sheets/{args.outfile}'
            save_to_file(filepath, cursor)
    finally:
        db.close()
