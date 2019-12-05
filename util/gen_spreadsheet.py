import pymysql, html
from bs4 import BeautifulSoup

table = ''
row = ''

# Open database connection
db = pymysql.connect("localhost","gensheet","chi2020","profs" )

# prepare a cursor object using cursor() method
cursor = db.cursor()

sqlSuggType = "SELECT * FROM SuggestionType st WHERE isActive = 1 ORDER BY st.columnOrder"

sql = "SELECT s.idSuggestion, s.idSuggestionType, s.idUniqueID, s.suggestion, st.columnOrder \
        FROM Suggestions s \
        INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType \
        WHERE s.active = 1 AND st.isActive = 1 \
        ORDER BY idUniqueID, st.columnOrder, confidence desc"

def new_row(idRow,i):
    if i > 200:
        style = 'style=\"display:none\"'
    else:
        style = ''
    return '<tr id=\"' + str(idRow) + '\" ' + style + '>'

def new_cell(idSugg, sugg):
    return '<td id=' + str(idSugg) + '>' + str(sugg) + '</td>'

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


    #return '<th id=\"' + str(idSuggType) + '\"><input type="text"></th>'

# execute SQL query using execute() method.
cursor.execute(sqlSuggType)
rows = cursor.fetchall()
header  = ''
search  = '<tr>'
for r in rows:
    idSuggType = r[0]
    colName = r[2]
    header += '<th>' + str(colName) + '</th>'
    search += new_search(idSuggType)

table += '<thead>' + header + '</thead>' + search + '</tr>'

# execute SQL query using execute() method.
cursor.execute(sql)
rows = cursor.fetchall()

i = 0
idSugg = rows[0][0]
idColPrev = rows[0][1]
idRowPrev = rows[0][2]
sugg   = rows[0][3]
row = new_row(idRowPrev,i)
row += new_cell(idSugg, sugg)

for r in rows:
    idSugg = r[0]
    idCol  = r[1]
    idRow  = r[2]
    sugg   = r[3]
    if idRow != idRowPrev: # new row?
        table += row + '</tr>'
        row = new_row(idRow,i)
        i += 1
    if idCol != idColPrev: # new cell?
        row += new_cell(idSugg, sugg)
    idColPrev = idCol
    idRowPrev = idRow

def replace_bad_html(val):
    return val.replace('<html>', '').replace('</html>', '').replace('<body>', '').replace('</body>', '').replace(' <body>', '').replace(' </body>', '')

with open('../backend/views/partials/sheets/professors.hbs', 'r+') as f:
    soup = BeautifulSoup(table, 'lxml')
    html = soup.prettify()
    html = replace_bad_html(html)
    print(html)
    f.write(html)

# disconnect from server
db.close()