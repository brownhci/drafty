import requests
import io
import re
import pandas as pd

DRAFTY_ENDPOINT = "http://drafty.cs.brown.edu/data/csv/csprofessors/csprofessors_93318b344889ccef41d46b5f83d63de5"

name_uni = {}

def sqlUpdate(id,idDel):
    return f""" 
            UPDATE csprofessors.UniqueId  
            SET active = 0, notes = 'duplicate of {id}' 
            WHERE idUniqueID = {idDel};
        """

def cleanName(name):
    cleaned = name.replace('.','')
    cleaned = re.sub("\s[A-Za-z]\s", " ", cleaned)
    cleaned_by_name = cleaned.split(' ')
    cleaned = cleaned_by_name[0] + cleaned_by_name[(len(cleaned_by_name)-1)]
    return cleaned

def checkIfNameBachMatch(df):
    df.sort_values(by=['Bachelors','FullName'], inplace=True)

    prevId = ''
    prevName = ''
    prevBach = ''
    for index, row in df.iterrows():
        id = row['UniqueId']
        nm   = row['FullName']
        name = cleanName(nm)
        uni  = row['University']
        bach = row['Bachelors']

        if name not in name_uni:
            name_uni[name] = [id,uni]
        else:
            prof1 = f'({id}) {uni}'
            prof2 = f'({name_uni[name][0]}) {name_uni[name][1]}'
            print(f'NameDup for {nm} ',prof1,' :: ',prof2)

        """ sw -> already checked
        if name == prevName:
            print('NAME/BACH',name,bach,id,prevId)
        """

        prevId = id
        prevName = name
        prevBach = bach   # we can just check names given the sorting 


usecols = ["UniqueId","FullName","University","JoinYear","SubField","Bachelors","Doctorate"]
data = requests.get(DRAFTY_ENDPOINT).content
df = pd.read_csv(io.StringIO(data.decode('utf-8')), usecols=usecols)
checkIfNameBachMatch(df)