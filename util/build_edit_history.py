import argparse
import itertools
import os
import sys

import pymysql
from atomicwrites import atomic_write

db_user = 'test'
db_pass = 'test'

# sw: there are different variations of the sql, how the first sql runs everything in one goroutine
# thus making the python code simplistic
limit = 100
sql = f"""
select 
i.timestamp,
us.idProfile, 
i.idSession, 
e1.idUniqueID as idRow, 
'edit cell' as editType, 
name.suggestion as FullName, 
uni.suggestion as University, 
CONCAT(name.suggestion,' (',uni.suggestion,')') as who, 
e1.name as columnName,
e2.suggestion as previous,
e1.suggestion as chosen

from Interaction i
inner join users.Session us on us.idSession = i.idSession
inner join Edit e on e.IdInteraction = i.idInteraction
inner join (
    select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_Suggestion es
    inner join Suggestions s on s.idSuggestion = es.idSuggestion
    inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
    where isChosen = 1
) e1 on e1.idEdit = e.idEdit
inner join (
    select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_Suggestion es
    inner join Suggestions s on s.idSuggestion = es.idSuggestion
    inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
    where isPrevSuggestion = 1
) e2 on e2.idEdit = e.idEdit
inner join (
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
        select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
        from csprofessors.Suggestions
        where idSuggestionType = 1 and active = 1
        group by idUniqueID, idSuggestionType
    ) as mx
    inner join csprofessors.Suggestions s
    on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
) name on name.idUniqueID = e1.idUniqueID
inner join (
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
        select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
        from csprofessors.Suggestions
        where idSuggestionType = 2 and active = 1
        group by idUniqueID, idSuggestionType
    ) as mx
    inner join csprofessors.Suggestions s
    on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
) uni on uni.idUniqueID = e1.idUniqueID

UNION

select 

i.timestamp,
us.idProfile, 
i.idSession, 
e1.idUniqueID as idRow, 
'new row' as editType, 
name.suggestion as FullName, 
uni.suggestion as University, 
CONCAT(name.suggestion,' (',uni.suggestion,')') as who, 
e1.name as columnName,
'' as previous,
e1.suggestion as chosen

from Interaction i
inner join users.Session us on us.idSession = i.idSession
inner join Edit e on e.IdInteraction = i.idInteraction
inner join (
    select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_NewRow es
    inner join Suggestions s on s.idSuggestion = es.idSuggestion
    inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
) e1 on e1.idEdit = e.idEdit
inner join (
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
        select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
        from csprofessors.Suggestions
        where idSuggestionType = 1 and active = 1
        group by idUniqueID, idSuggestionType
    ) as mx
    inner join csprofessors.Suggestions s
    on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
) name on name.idUniqueID = e1.idUniqueID
inner join (
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
        select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
        from csprofessors.Suggestions
        where idSuggestionType = 2 and active = 1
        group by idUniqueID, idSuggestionType
    ) as mx
    inner join csprofessors.Suggestions s
    on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
) uni on uni.idUniqueID = e1.idUniqueID
order by timestamp desc limit {limit};
"""

sql_edits_online = """
    select us.idProfile, i.idSession, e1.idUniqueID as idRow, 'edit cell' as editType, name.suggestion as FullName, uni.suggestion as University, e1.name as columnName, e1.suggestion as chosen, e2.suggestion as previous,i.timestamp
    from Interaction i
    inner join users.Session us on us.idSession = i.idSession
    inner join Edit e on e.IdInteraction = i.idInteraction
    inner join (
        select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_Suggestion es
        inner join Suggestions s on s.idSuggestion = es.idSuggestion
        inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
        where isChosen = 1
    ) e1 on e1.idEdit = e.idEdit
    inner join (
        select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_Suggestion es
        inner join Suggestions s on s.idSuggestion = es.idSuggestion
        inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
        where isPrevSuggestion = 1
    ) e2 on e2.idEdit = e.idEdit
    inner join (
        select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
        from (
            select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
            from csprofessors.Suggestions
            where idSuggestionType = 1 and active = 1
            group by idUniqueID, idSuggestionType
        ) as mx
        inner join csprofessors.Suggestions s
        on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
    ) name on name.idUniqueID = e1.idUniqueID
    inner join (
        select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
        from (
            select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
            from csprofessors.Suggestions
            where idSuggestionType = 2 and active = 1
            group by idUniqueID, idSuggestionType
        ) as mx
        inner join csprofessors.Suggestions s
        on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
    ) uni on uni.idUniqueID = e1.idUniqueID
    order by i.timestamp desc;
"""

sql_edits_new = """
    select us.idProfile, i.idSession, e1.idUniqueID as idRow, 'new row' as editType, name.suggestion as FullName, uni.suggestion as University, e1.name as columnName, e1.suggestion as chosen, '' as previous,i.timestamp
    from Interaction i
    inner join users.Session us on us.idSession = i.idSession
    inner join Edit e on e.IdInteraction = i.idInteraction
    inner join ( 
        select es.idEdit, s.suggestion, s.idUniqueID, st.name from Edit_NewRow es
        inner join Suggestions s on s.idSuggestion = es.idSuggestion
        inner join SuggestionType st on st.idSuggestionType = s.idSuggestionType
    ) e1 on e1.idEdit = e.idEdit
    inner join (
        select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
        from (
            select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
            from csprofessors.Suggestions
            where idSuggestionType = 1 and active = 1
            group by idUniqueID, idSuggestionType
        ) as mx
        inner join csprofessors.Suggestions s
        on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
    ) name on name.idUniqueID = e1.idUniqueID
    inner join (
        select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
        from (
            select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
            from csprofessors.Suggestions
            where idSuggestionType = 2 and active = 1
            group by idUniqueID, idSuggestionType
        ) as mx
        inner join csprofessors.Suggestions s
        on s.idUniqueID = mx.idUniqueID and s.idSuggestionType = mx.idSuggestionType and s.confidence = mx.maxconf
    ) uni on uni.idUniqueID = e1.idUniqueID
    order by i.timestamp desc;
"""

sql_row_identifier = """
    select s.idSuggestion, s.idUniqueID, s.idSuggestionType, s.suggestion, s.confidence
    from (
        select idUniqueID, idSuggestionType, suggestion, confidence, max(confidence) as maxconf
        from csprofessors.Suggestions
        where (idSuggestionType = 1 or idSuggestionType = 2) and active = 1
        group by idUniqueID, idSuggestionType
    ) as mx
    inner join csprofessors.Suggestions s
    on s.idUniqueID = mx.idUniqueID
    and s.idSuggestionType = mx.idSuggestionType
    and s.confidence = mx.maxconf;
"""

def report_error(e):
    print('ERROR exiting...')
    print(e)
    exc_type, exc_obj, exc_tb = sys.exc_info()
    fname = os.path.split(exc_tb.tb_frame.f_code.co_filename)[1]
    print(exc_type)
    print(fname)
    print(exc_tb.tb_lineno)

def create_thead():
    cssClass = 'column-label'
    cssBoxShadow = ''
    thead = f"""
    <colgroup>
        <col id="col6" style="width: 185px;">
        <col id="col0" style="width: 86px;">
        <col id="col1" style="width: 86px;">
        <col id="col2" style="width: 300px;">
        <col id="col3" style="width: 120px;">
        <col id="col4" style="width: 400px;">
        <col id="col5" style="width: 400px;">
    </colgroup>
    <thead>
        <tr>
            <th class="{cssClass}" style="{cssBoxShadow}">Timestamp</th>
            <th class="{cssClass}" style="{cssBoxShadow}">Editor</th>
            <th class="{cssClass}" style="{cssBoxShadow}">Action</th>
            <th class="{cssClass}" style="{cssBoxShadow}">Who was Edited?</th>
            <th class="{cssClass}" style="{cssBoxShadow}">Column</th>
            <th class="{cssClass}" style="{cssBoxShadow}">Prev Value</th>
            <th class="{cssClass}" style="{cssBoxShadow}">New Value</th>
        </tr>
    </thead>
    """
    return thead

def newRowStyle(cssRow):
    cssRowLight = 'tr-light'
    cssRowDark = 'tr-dark'
    if cssRow == cssRowLight:
        return cssRowDark
    else:
         return cssRowLight

def build_table_file(cursor):
    try:
        idRowPrev = -1
        cssRowClass = 'tr-dark'
        cursor.execute(sql)
        table = '<table>'
        table += create_thead()
        table += '<tbody>\n'
        columns_to_ignore = ['idSession','idRow','FullName','University']
        for row in cursor.fetchall():
            if idRowPrev != row['idRow']:
                cssRowClass = newRowStyle(cssRowClass) 
            table += f"""<tr class="{cssRowClass}">\n"""
            for k,v in row.items():
                if k not in columns_to_ignore:
                    cell = v
                    dataValue = ''
                    if k == 'who':
                        if idRowPrev == row['idRow']:
                            cell = ''
                        dataValue = row['FullName'].replace(' ', '%20')
                        print(dataValue)
                        
                    table += f"""
                                \t<td id="{k}" data-value={dataValue}>
                                    {cell}
                                </td>\n
                            """
            table += '</tr>\n'
            idRowPrev = row['idRow']
        table += '</tbody>\n</table>\n'
        return table
    except Exception as e:
        report_error(e)

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
    # python3 build_edit_history.py --host=localhost --database=csprofessors csprofessors.hbs
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
            filepath = f'../backend/views/partials/edit_history/{args.outfile}'
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