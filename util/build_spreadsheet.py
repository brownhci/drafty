import argparse
import itertools

import pymysql
from atomicwrites import atomic_write


def build_colgroup(nrows):
    """
    >>> build_colgroup(2)
    '<colgroup><col><col></colgroup>'
    """
    return f'<colgroup>{"".join(itertools.repeat("<col>", nrows))}</colgroup>'


def get_column_widths(cursor):
    sql = "SELECT idSuggestionType, (ROUND(AVG(LENGTH(suggestion))) * 6) + 100 as avg_length FROM Suggestions GROUP BY idSuggestionType"
    cursor.execute(sql)
    rows = cursor.fetchall()
    return {row['idSuggestionType']: row['avg_length'] for row in rows}


def build_column_label_cell(row, column_widths):
    id_suggestion_type = row['idSuggestionType']
    colname = row['name']
    width = column_widths[id_suggestion_type]
    return f'<th style="width:{width}px" id="{id_suggestion_type}" class="column-label">{colname}<button class="sort-btn"></button></th>'


def build_column_labels_row(cursor, column_widths):
    sql = "SELECT * FROM SuggestionType st WHERE isActive = 1 ORDER BY st.columnOrder"
    cursor.execute(sql)
    rows = cursor.fetchall()
    return f'<tr id="column-label-row">{"".join(build_column_label_cell(row, column_widths) for row in rows)}</tr>'


def build_column_search_row():
    return '''
<tr id="column-search-row">
  {{#times 14}}
      {{> sheets/column-search }}
  {{/times}}
</tr>
           '''


def build_table_head(cursor, column_widths):
    return f'<thead>{build_column_labels_row(cursor, column_widths)}{build_column_search_row()}</thead>'


def build_placeholder_table(cursor):
    column_widths = get_column_widths(cursor)
    nrows = len(column_widths)
    return f'<table id="table">{build_colgroup(nrows)}{build_table_head(cursor, column_widths)}</table>'


def build_table_datarow_cell(row):
    id_suggestion = row['idSuggestion']
    suggestion = row['suggestion']
    id_suggestion_type = row['idSuggestionType']
    suggestion = ''.join(chr(c) for c in suggestion.encode('ascii', 'xmlcharrefreplace') if c != 0)
    return f'<td id="{id_suggestion}" tabindex="-1">{suggestion}</td>'


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
    return f'<tr id="{id_unique_id}">{"".join(map(build_table_datarow_cell, tablecell_rows_iter))}</tr>', rest_rows_iter


NROWS_IN_SECTION = 1000


def build_table_data_section(rows_iter, nrows_in_section=NROWS_IN_SECTION):
    data_rows = []
    try:
        for _ in range(nrows_in_section):
            data_row, rows_iter = build_table_row(rows_iter)
            data_rows.append(data_row)
    except StopIteration:
        rows_iter = None
    return f'<template><tbody>{"".join(data_rows)}</tbody></template>', rows_iter


def build_table_data_sections(cursor):
    sql = '''
<<<<<<< HEAD
            SELECT s.idSuggestion, s.idSuggestionType, s.idUniqueID, s.suggestion, st.columnOrder 
            FROM Suggestions s 
            INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType 
            INNER JOIN UniqueId u ON u.idUniqueID = s.idUniqueID 
            WHERE s.active = 1 AND st.isActive = 1 AND u.active = 1
            ORDER BY idUniqueID, st.columnOrder, confidence desc
=======
SELECT s.idSuggestion, s.idSuggestionType, s.idUniqueID, s.suggestion, st.columnOrder
            FROM Suggestions s
            INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType
            INNER JOIN UniqueId u ON u.idUniqueID = s.idUniqueID
            WHERE s.active = 1 AND st.isActive = 1 AND s.idUniqueID > 0
            ORDER BY s.idUniqueID, st.columnOrder, confidence desc
>>>>>>> ed2c05aa97be5902f07763bd8194ca31f2eaa480
          '''
    cursor.execute(sql)
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
    parser.add_argument('--nrows', default=1000, type=int,
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
            save_to_file(args.outfile, cursor)
    finally:
        db.close()
