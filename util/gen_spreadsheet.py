import pymysql, html
from bs4 import BeautifulSoup
from lxml.html import tostring, html5parser
import html.entities as fix

init_num_rows = 3
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
        WHERE s.active = 1 AND st.isActive = 1 AND idUniqueID < 10000000000000 \
        ORDER BY idUniqueID, st.columnOrder, confidence desc"

# replace beautiful soup add-ins
def replace_bad_html(val):
    return val.replace('<html>', '').replace('</html>', '').replace('<body>', '').replace('</body>', '').replace(' <body>', '').replace(' </body>', '')

def col_group(rows):
    colGroup = '<colgroup>'
    for col in rows[0]:
        colGroup += '<col>'
    colGroup += '</colgroup>'
    return colGroup

def new_row(idRow):
    return '<tr id=\"' + str(idRow) + '>'

def new_cell(idSugg, sugg):
    #html = tostring(html5parser.fromstring(str(sugg))).decode("utf-8")

    #print(html)
    #html = sugg.encode("utf-8")
    html = fix.html5(sugg)
    return '<td id=' + str(idSugg) + '>' + str(html) + '</td>'

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
print(row)

for r in rows:
    idSugg = r[0]
    idCol  = r[1]
    idRow  = r[2]
    sugg   = r[3]

    #print(str(idRow) + ' == ' + str(idRowPrev))

    if idRow != idRowPrev: # new row?
        #print(str(idRow) + ' :: ' +  str(row) + '\n')
        if i <= init_num_rows:
            table_display += row + '</tr>'
        else:
            table_hidden += row + '</tr>'
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
    
    #soup = BeautifulSoup(final_html, 'lxml')
    #html = soup.prettify()
    #html = replace_bad_html(html)
    #print(html)
    
    f.write(html)

# disconnect from server
db.close()