import csv

profs = {}
universities = ["Carnegie Mellon University"]

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

cmu_file = open('cmu.csv','w')
for k,v in profs.items():
    name = v['name'] 
    university = v['affiliation']
    row = '\"' + name + '\",\"' + university + '\"\n'
    cmu_file.write(row)

cmu_file.close()