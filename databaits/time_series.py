import pandas as pd 
import matplotlib.pyplot as plt

# df = pd.read_csv("data/professors.csv", index_col = "UniqueId")
# brown = df.loc[df["University"] == "Brown University"]
# brown_sorted = brown.sort_values("JoinYear")
# brown_sorted.loc[brown_sorted]
# print(brown_sorted)

def get_distribution(columns, categories):
    """
    Given a list of columns (and categories in those columns), creates a distribution of
    frequency over time. 

    :params:
    :columns: a list of string column names (should be length 1 or 2); the "wider" category shouldc come first
    :categories: a list of categories (should be same length as columns) to look for in those columns

    :returns:
    :years: a distribution of those categories over time (years)
    """
    # error checking inputs
    num_cols = len(columns)
    if num_cols > 2:
        raise ValueError("You can only analyze up to 2 columns")
    if len(categories) != num_cols:
        raise ValueError("You need to enter one category for each column")

    criteria = zip(columns, categories)
    df = pd.read_csv("data/professors.csv", index_col = "UniqueId")

    # filter by criteria inputted
    for col, cat in criteria:
        df = df.loc[df[col] == cat]
    pd.set_option('display.max_rows', None)

    # create histogram by year
    years = df["JoinYear"].dropna().astype('int32')
    # years.hist()
    # plt.show()
    return years

def find_statistic(distribution, columns, categories):
    """
    Finds the start year that renders the greatest % change statistic, given a 
    time series distribution of column values

    :params:
    :distribution: distribution over different year values (returned by get_distribution)
    :columns: same as get_distribution
    :categories: same as get_distribution

    :returns:
    :end_year: most recent year in database
    :time_range: time range of greatest % change 
    :stat: the rate of change
    """
    # TODO: throw error if distribution is empty 
    # count number of hires for each year, and sort them from most recent to oldest
    counts = distribution.value_counts(sort=False).sort_index(ascending=False)
    num_rows = len(counts)
    end_year = counts.index[0]
    earliest = counts.index[-1]
    timespan = end_year - earliest + 1

    # compare past 5, 10, 15, ... years (for as much as data is available)
    for i in range(0, timespan, 5):
        pass
    pass

def generate_databait(categories_lst, stat, year1, year2):
    # given the above information, fits it into a tempalte and returns the string
    pass 

if __name__ == '__main__':
    years = get_distribution(["University"], ["Brown University"])
    find_statistic(years, ["University"], ["Brown University"])

