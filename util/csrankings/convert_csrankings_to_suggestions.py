import csv

profs = {}
universities = []

def insertRow(idRow):
    return str(idRow) + ',1\n'

def insertSuggestion(row):
    row_out = ''
    for r in row:
        row_out += '\"' + r + '\",'
    row_out = row_out[:-1] + '\n'
    return row_out

# name,affiliation,homepage,scholarid
with open('csrankings.csv') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        name = row['name']
        affiliation = row['affiliation']
        homepage = row['homepage']
        scholarid = row['scholarid']

        if scholarid in profs:
            if len(name) < len(profs[scholarid]['name']):
                profs[scholarid]['name'] = name
        else:
            profs[scholarid] = {'name': name, 'affiliation': affiliation}


cols = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14']
idRow = 1
idSuggestion = 1
rows_file = open('UniqueId.csv','w')
suggs_file = open('Suggestions.csv','w')
for k,v in profs.items():
    rows_file.write(insertRow(idRow))
    name = v['name'] 
    university = v['affiliation']
    for idCol in cols:
        val = ''
        isActive = '1'
        if idCol == '1':
            val = name
        if idCol == '2':
            val = university
        if idCol == '13':
            val = ''
            isActive = '0'
        if idCol == '14':
            val = '2020-03-01 10:00:00'
            isActive = '0'

        row_vals = [str(idSuggestion),idCol,str(idRow),'2',val,isActive,'0']
        suggs_file.write(insertSuggestion(row_vals))

        idSuggestion += 1
    idRow += 1

rows_file.close()
suggs_file.close()