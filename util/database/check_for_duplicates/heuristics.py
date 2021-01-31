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
    return cleaned

def checkIfNameBachMatch(df):
    df.sort_values(by=['Bachelors','FullName'], inplace=True)

    toDeactivate = []

    prevId = ''
    prevName = ''
    prevBach = ''
    for index, row in df.iterrows():
        id = row['UniqueId']
        name = cleanName(row['FullName'])
        bach = row['Bachelors']
        
        if name == prevName:
            print(name,bach)
            #print(sqlUpdate(id,prevId))

        prevId = id
        prevName = name
        prevBach = bach   # we can just check names given the sorting 


usecols = ["UniqueId","FullName","University","JoinYear","SubField","Bachelors","Doctorate"]
data = requests.get(DRAFTY_ENDPOINT).content
df = pd.read_csv(io.StringIO(data.decode('utf-8')), usecols=usecols)
checkIfNameBachMatch(df)