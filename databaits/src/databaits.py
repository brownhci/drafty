import sys
import argparse
import pandas as pd 
import matplotlib.pyplot as plt
import datetime

def get_data(file_location, index):
    return pd.read_csv(file_location, index_col = index)

def databait_1(df, column, label, time_column, time_type):
    """
    For DataBait 1: 
    > The total number of [label in column] grew [stat]% in the past [time range].
    Given a column and a label to count, creates a distribution over time.

    :params:
    :column: a string, column name
    :label: a string, the label to count
    :time_column: a string, name of column with time data
    :time_type: a string, will work with years for now but would like to be more flexible

    :returns:
    :years: a distribution of those categories over time
    """
    df = df.loc[df[column] == label]
    years = df[time_column].dropna().astype('int32')
    years.hist()

    counts = years.value_counts(sort=False).sort_index(ascending=False)
    now = datetime.datetime.now()

    # TODO: write cases for other types of time
    best_range = 0
    best_rate = 0

    if time_type == "Year":
        year = now.year
        earliest_year = counts.index[-1]
        # NOTE: is the past 15-20 years still interesting? should we limit it to 5-10?
        # (or other more recent ranges)
        for i in range(5, min(20, year - earliest_year), 5):
            new = counts.loc[counts.index >= year - i].sum()
            old = counts.loc[counts.index < year - i].sum()
            if new/old > best_rate:
                best_rate = new/old
                best_range = i
    print(best_range, best_rate)
    return best_range, best_rate

def databait_2(df, column, label1, label2, time_column, time_type):
    """
    For DataBait 2
    > [Label 1 in column] grew [#]% more than [label 2 in same column] 
    > in the past [time range]. 
    Does the same thing as for Databait 1, but for two labels and 
    produces a comparison between their rates of growth
    """
    df1 = df.loc[df[column] == label1]
    years1 = df1[time_column].dropna().astype('int32')
    counts1 = years1.value_counts(sort=False).sort_index(ascending=False)
    
    df2 = df.loc[df[column] == label2]
    years2 = df2[time_column].dropna().astype('int32')
    counts2 = years2.value_counts(sort=False).sort_index(ascending=False)
    now = datetime.datetime.now()

    # TODO: write cases for other types of time
    best_range = 0
    best_rate = 0
    bigger = None
    smaller = None

    if time_type == "Year":
        year = now.year
        earliest_year = max(counts1.index[-1], counts2.index[-1])
        for i in range(5, min(20, year - earliest_year), 5):
            # NOTE: Can we put this logic into a helper function? 
            new1 = counts1.loc[counts1.index >= year - i].sum()
            old1 = counts1.loc[counts1.index < year - i].sum()
            roc1 = new1 / old1
            
            new2 = counts2.loc[counts2.index >= year - i].sum()
            old2 = counts2.loc[counts2.index < year - i].sum()
            roc2 = new2 / old2
            diff = (max(roc1, roc2) - min(roc1, roc2)) / min(roc1, roc2)
            if  diff > best_rate:
                best_rate = diff
                best_range = i
                if roc1 > roc2: 
                    bigger = label1
                    smaller = label2
                else:
                    bigger = label2
                    smaller = label1
    
    print(best_range, best_rate, bigger, smaller)
    return best_range, best_rate, bigger, smaller

def databait_3(df, column1, label1, column2, label2, time_column, time_type):
    """
    For DataBait 3
    Does the same thing as for Databait 1, but counts across two columns
    """
    big_df = df.loc[df[column1] == label1]
    small_df = big_df.loc[df[column2] == label2]

    years = small_df[time_column].dropna().astype('int32')
    counts = years.value_counts(sort=False).sort_index(ascending=False)
    print(counts)
    # TODO: implement error checking in case there is no such data
    now = datetime.datetime.now()

    # TODO: write cases for other types of time
    best_range = 0
    best_rate = 0

    if time_type == "Year":
        year = now.year
        earliest_year = counts.index[-1]
        # NOTE: is the past 15-20 years still interesting? should we limit it to 5-10?
        # (or other more recent ranges) + sidenote: it's interesting if the ROC is really small
        for i in range(5, min(25, year - earliest_year), 5):
            new = counts.loc[counts.index >= year - i].sum()
            old = counts.loc[counts.index < year - i].sum()
            print(new, old)
            if new/old > best_rate:
                best_rate = new/old
                best_range = i
    print(best_range, best_rate)
    return best_range, best_rate

def databait_4(df):
    # TODO: code once we decide how to choose year range
    return None

def databait_5(df, column, time_column, time_type, time_point):
    """
    For Databait 5
    Compare the max of a column with the avg of all other values
    """
    time_df = df.loc[df[time_column] == time_point]
    labels = time_df[column].dropna()
    counts = labels.value_counts(sort=False)
    
    # find column max and compare with avg of the rest
    max_label = counts.idxmax()
    max_count = counts.max()
    others = counts.drop(labels=max_label)
    avg = others.mean()
    delta = max_count - avg / avg
    # return the times by which max is higher than avg (% gets too high)
    return max_label, delta 

def databait_6(df, column, time_column, time_point):
    """
    For Databait 6
    Finds the proportion of a column comprised of the most common value

    :returns:
    :max_label: most frequently occuring label
    :ratio: frequency of max_label
    """
    time_df = df.loc[df[time_column] == time_point]
    labels = time_df[column].dropna()
    counts = labels.value_counts(sort=False)

    max_label = counts.idxmax()
    max_count = counts.max()
    return max_label, max_count / counts.count()

def databait_8(df, column1, column2):
    """
    For Databait 8
    Calculates proportion of overlap between two columns with recurring labels
    """
    c1 = df[column1].dropna().value_counts()
    c2 = df[column2].dropna().value_counts().index
    total = 0
    overlap = 0
    for x in c1.index:
        if x in c2:
            overlap += c1[x]
        total += c1[x]
    return overlap / total


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Generate DataBaits from CSV file')
    parser.add_argument('--csv', default='../data/professors.csv',
                        help='The CSV to read data from')
    parser.add_argument('--index',
                        help='the index column for the pandas dataframe')
    args = parser.parse_args()
    df = get_data(args.csv,args.index)
    databait_1(df, "University", "Brown University", "JoinYear", "Year")
    # databait_2(df, "University", "Carnegie Mellon University", "Cornell University", "JoinYear", "Year")
    # databait_1(df, "University", "Brown University", "JoinYear", "Year")
    # print(databait_5(df, "University", "JoinYear", "Year", "2016"))
    # print(databait_8(df, "University", "Bachelors"))

