import csv

profs = {}
universities = ["Carnegie Mellon University","Massachusetts Institute of Technology","Univ. of Illinois at Urbana-Champaign","Stanford University","University of California - Berkeley","University of Washington","Cornell University","University of Michigan","University of California - San Diego","University of Maryland - College Park","Georgia Institute of Technology","University of Wisconsin - Madison","Columbia University","Northeastern University","University of Pennsylvania","University of California - Los Angeles","University of Texas at Austin","Purdue University","New York University","Princeton University","University of Southern California","University of Massachusetts Amherst","Rutgers University","University of California - Irvine","Harvard University","Pennsylvania State University","Stony Brook University","University of California - Santa Barbara","Northwestern University","Texas A&M University","Duke University","Ohio State University","University of Chicago","University of Colorado Boulder","University of Utah","University of California - Riverside","University of Illinois at Chicago","University of Minnesota","University of Virginia","Yale University","Boston University","Brown University","Johns Hopkins University","Oregon State University","University of California - Santa Cruz","University of North Carolina","University of California - Davis","University of Central Florida","University at Buffalo","Virginia Tech","Rice University","University of Texas at Dallas","North Carolina State University","Arizona State University","Indiana University","George Mason University","University of Pittsburgh","Washington University in St. Louis","University of Rochester","University of Notre Dame","University of Texas at Arlington","University of Florida","Binghamton University","California Institute of Technology","Florida State University","Dartmouth College","Michigan State University","University of Connecticut","University of Iowa","College of William and Mary","Colorado School of Mines","Georgetown University","Rensselaer Polytechnic Institute","Stevens Institute of Technology","Tufts University","University of Arizona","University of Houston","University of Tennessee","Worcester Polytechnic Institute","Univ. of Maryland - Baltimore County","Case Western Reserve University","Vanderbilt University","Brandeis University","University of Tulsa","University of Oregon","Simon Fraser University","Colorado State University","University of Delaware","Naval Postgraduate School","Clemson University","George Washington University","Iowa State University","McGill University","University of Nebraska","University of Alberta","University of Montreal","University of Toronto","Washington State University","University of British Columbia","University of Waterloo"]

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

        if affiliation in universities:
            if scholarid in profs:
                if len(name) < len(profs[scholarid]['name']):
                    profs[scholarid]['name'] = name
            else:
                profs[scholarid] = {'name': name, 'affiliation': affiliation}


cols = ['1','2','3','4','5','6','7','8','9','10','11','12','13','14']
idRow = 16000 # current max is 15798
idSuggestion = 900000 # 1, current max is 717460
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