import pandas as pd 
import matplotlib.pyplot as plt

def databait_1(column, label, time_column, time_type):
    """
    For DataBait 1
    Given a column and a label to count, creates a distribution over time.

    :params:
    :column: a string, column name
    :label: a string, the label to count
    :time_column: a string, name of column with time data
    :time_type: a string, will work with years for now but would like to be more flexible

    :returns:
    :years: a distribution of those categories over time
    """
    # NOTE: below is for when there are multiple columns =============
    #
    # error checking inputs
    # num_cols = len(columns)
    # if num_cols > 2:
    #     raise ValueError("You can only analyze up to 2 columns")
    # if len(categories) != num_cols:
    #     raise ValueError("You need to enter one category for each column")
    
    # criteria = zip(columns, categories)
    # df = pd.read_csv("data/professors.csv", index_col = "UniqueId")

    # filter by criteria inputted
    # for col, cat in criteria:f
    #     df = df.loc[df[col] == cat]
    # pd.set_option('display.max_rows', None)
    #
    # ===============================================================
    df = pd.read_csv("data/professors.csv", index_col = "UniqueId")
    df = df.loc[df[column] == label]

    years = df[time_column].dropna().astype('int32')
    years.hist()

    counts = years.value_counts(sort=False).sort_index(ascending=False)
    print(counts)
    most_recent_yr = counts.index[0]

    # TODO: code once we decide how to choose year range
    return counts

def databait_2(column, label1, label2, time_column, time_type):
    """
    For DataBait 2
    Does the same thing as for Databait 1, but for two labels and 
    produces a comparison between their rates of growth
    """
    dist1 = databait_1(column, label1, time_column, time_type)
    dist2 = databait_1(column, label2, time_column, time_type)
    # TODO: code once we decide how to choose year range

    return None

def databait_3(column1, label1, column2, label2, time_column, time_type):
    """
    For DataBait 3
    Does the same thing as for Databait 1, but counts across two columns
    """
    df = pd.read_csv("data/professors.csv", index_col = "UniqueId")
    big_df = df.loc[df[column1] == label1]
    small_df = big_df.loc[df[column2] == label2]

    years = df[time_column].dropna().astype('int32')
    counts = years.value_counts(sort=False).sort_index(ascending=False)

    # TODO: code once we decide how to choose year range
    return years

def databait_4():
    # TODO: code once we decide how to choose year range
    return None

def databait_5(column, time_column, time_type, time_point):
    """
    For Databait 5
    Compare the max of a column with the avg of all other values
    """
    df = pd.read_csv("data/professors.csv", index_col = "UniqueId")
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

def databait_6(column, time_column, time_point):
    """
    For Databait 6
    Finds the proportion of a column comprised of the most common value

    :returns:
    :max_label: most frequently occuring label
    :ratio: frequency of max_label
    """
    # TODO: decide whether to do time point/range
    df = pd.read_csv("data/professors.csv", index_col = "UniqueId")
    time_df = df.loc[df[time_column] == time_point]
    labels = time_df[column].dropna()
    counts = labels.value_counts(sort=False)

    max_label = counts.idxmax()
    max_count = counts.max()
    return max_label, max_count / counts.count()

def databait_8(column1, column2):
    """
    For Databait 8
    Calculates proportion of overlap between two columns with recurring labels
    """
    df = pd.read_csv("data/professors.csv", index_col = "UniqueId")
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
    # databait_1("University", "Brown University", "JoinYear", "Year")
    # print(databait_5("University", "JoinYear", "Year", "2016"))
    print(databait_8("University", "Bachelors"))

