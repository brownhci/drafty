import pymysql, html, re

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

def insert(sugg):
    try:
        cursor.execute(sql, ('webmaster@python.org', 'very-secret'))
        db.commit()
    except ConnectionError as e:
        pass

def new_cell(sugg):
    new_val = ''
    for x in sugg.encode('ascii','xmlcharrefreplace'):
        if x != 0:
            new_val += chr(x)
    #sugg.encode('ascii','xmlcharrefreplace').strip(b'\x00').decode("utf-8"))
    return '\"' + str(new_val) + '\",'       

# execute SQL query using execute() method.
cursor.execute(sqlSuggType)
rows = cursor.fetchall()
header  = '\"UniqueId\",'
for r in rows:
    idSuggType = r[0]
    colName = r[2]
    header += '\"' + str(colName) + '\",'
header = header[:-1]

# execute SQL query using execute() method.
cursor.execute(sql)
rows = cursor.fetchall()

idSugg    = rows[0][0]
idColPrev = rows[0][1]
idRowPrev = rows[0][2]
sugg      = rows[0][3]
row = '\"' + str(idRowPrev) + '\",' + new_cell(sugg)
body = ''

blanks = 0

for r in rows:
    idSugg = r[0]
    idCol  = r[1]
    idRow  = r[2]
    sugg   = r[3]

    if idRow != idRowPrev: # new row?
        if blanks < 10:
            body += row[:-1] + '\n'
        row = '\"' + str(idRow) + '\",'
        blanks = 0
    if idCol != idColPrev: # new cell?
        sugg = str(sugg).strip()
        row +=  new_cell(sugg)
        if sugg == '':
            blanks += 1

    idColPrev = idCol
    idRowPrev = idRow


with open('professors.csv', 'r+') as f:
    final = header + '\n' + body
    f.write(final)

# disconnect from server
db.close()