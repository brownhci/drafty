import pymysql, html, re

init_num_rows = 5
table_header = '<table id="table" class="mb-0 sticky-top">'
table_display = '<div id="scrollArea" class="clusterize-scroll"><table id="drafty-table"><tbody id="contentArea" class="clusterize-content">'
table_hidden = '<table id="drafty-table-hidden" class="hidden"><tbody>'

# Open database connection
db = pymysql.connect("localhost","gensheet","chi2020","profs" )

# prepare a cursor object using cursor() method
cursor = db.cursor()

sqlSuggType = "SELECT * FROM SuggestionType st WHERE isActive = 1 ORDER BY st.columnOrder"

sql = "SELECT s.idSuggestion, s.idSuggestionType, s.idUniqueID, s.suggestion, st.columnOrder \
        FROM Suggestions s \
        INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType \
        WHERE s.active = 1 AND st.isActive = 1 AND idUniqueID > 0 \
        ORDER BY idUniqueID, st.columnOrder, confidence desc"
    #AND idUniqueID < 10000000000000
    # 15223 is a bad field

def col_group(rows):
    colGroup = '<colgroup>'
    for col in rows[0]:
        colGroup += '<col>'
    colGroup += '</colgroup>'
    return colGroup

def new_row(idRow):
    return '\n<tr id=' + str(idRow) + '>'

def new_cell(idSugg, sugg):
    new_val = ''
    for x in sugg.encode('ascii','xmlcharrefreplace'):
        if x != 0:
            new_val += chr(x)
    #sugg.encode('ascii','xmlcharrefreplace').strip(b'\x00').decode("utf-8"))
    return '<td id=' + str(idSugg) + '>' + str(new_val) + '</td>\n'

def new_search(idSuggType):
    return ' \
            <th id="{}"> \
                <div class="input-group"> \
                    <input class="form-control py-2 border-right-0 border" type="search" value="" id="{}"> \
                    <span class="input-group-append"> \
                        <div class="input-group-text bg-transparent" style="padding: 0px 4px;"><i class="fa fa-search"></i></div> \
                    </span> \
                </div> \
            </th> \
        '.format(idSuggType, idSuggType)
        

# execute SQL query using execute() method.
cursor.execute(sqlSuggType)
rows = cursor.fetchall()
header  = '<tr>'
search  = '<tr>'
for r in rows:
    idSuggType = r[0]
    colName = r[2]
    header += '<th scope="col" tabindex="-1">' + str(colName) + '</th>'
    search += new_search(idSuggType)

table_header +=  col_group(rows)  + '<thead id="headerArea">' + header + '</tr>' + search + '</tr>' + '</thead></table>'

# execute SQL query using execute() method.
cursor.execute(sql)
rows = cursor.fetchall()

i = 0
idSugg    = rows[0][0]
idColPrev = rows[0][1]
idRowPrev = rows[0][2]
sugg      = rows[0][3]
row = new_row(idRowPrev) + new_cell(idSugg, sugg)


for r in rows:
    idSugg = r[0]
    idCol  = r[1]
    idRow  = r[2]
    sugg   = r[3]

    if idRow != idRowPrev: # new row?
        if i <= init_num_rows:
            table_display += row + '</tr>\n'
        else:
            table_hidden += row + '</tr>\n'
        row = new_row(idRow)
        i += 1
    if idCol != idColPrev: # new cell?
        row += new_cell(idSugg, sugg)

    idColPrev = idCol
    idRowPrev = idRow

table_display += '</tbody></table></div>'
table_hidden  += '</tbody></table>'
#print(table_display)


with open('../backend/views/partials/sheets/professors.hbs', 'r+') as f:
    html = table_header + table_display + table_hidden
    f.write(html)

# disconnect from server
db.close()