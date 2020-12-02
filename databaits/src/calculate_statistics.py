import sys
import argparse
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import datetime

pd.options.mode.chained_assignment = None  # default='warn'

# Search at most this many years into the past
MAX_YEAR_RANGE = 30


def load_csv(file_location, index_col):
    return pd.read_csv(file_location, index_col=index_col)


def generate_databait_1(df, data_column, label, time_column):
    """
    #Categorical, #Time

    Template: Over the past <time_range> years, the total number of <entry phrase> <pronoun>
    <column phrase> <label> <growth phrase>.  
    
    Sample: Over the past 25 years, the total number of CS professors who 
    specialized in Human-Computer Interaction more than quadrupled.
    
    Returns:
        Dict including time range with the highest % growth for label 
    """
    # Create series that maps year to # of times label appears in year
    rows_with_label = df.loc[df[data_column] == label][time_column].dropna()
    time_formatted = rows_with_label.astype("int32")
    time_counts = time_formatted.value_counts().sort_index(ascending=False)

    current_year = datetime.datetime.now().year
    earliest_year = time_counts.index[-1]
    optimal_range = 0
    optimal_rate = 0

    # Finds time range with the greatest rate of growth (%)
    for decrement in range(5, min(MAX_YEAR_RANGE, current_year - earliest_year + 1), 5):
        pivot_year = current_year - decrement
        before_pivot = time_counts.loc[time_counts.index < pivot_year].sum()
        if before_pivot == 0: # Moving further back won't get us any additional values
            break
        after_pivot = time_counts.loc[time_counts.index >= pivot_year].sum()
        if after_pivot / before_pivot > optimal_rate:
            optimal_range = decrement
            optimal_rate = after_pivot / before_pivot
    
    if optimal_range == 0:
        raise ValueError("DataBait 1: No values within the last %d years for %s." % (MAX_YEAR_RANGE, label))
    return {
        "label": label,
        "column": data_column,
        "time_range": optimal_range,
        "rate": optimal_rate * 100,
    }

def generate_databait_1a(df, label_column, label, count_column, time_column):
    """
    #Numerical, #Time
    
    Sample: Over the past 25 years, the total number of global sales for games from Nintendo 
    increased x%. 
    
    Returns:
        Dict including time range with the highest % growth in count_column for label 
    """
    rows_with_label = df.loc[df[label_column] == label][[count_column, time_column]].dropna()
    rows_formatted = rows_with_label.astype({time_column: "int32", count_column: "float32"})
    counts_by_year = rows_formatted.groupby([time_column]).sum().sort_index(ascending=False)
    
    current_year = datetime.datetime.now().year
    earliest_year = counts_by_year.index[-1]
    optimal_range = 0
    optimal_rate = 0

    # Finds time range with the greatest rate of growth (%)
    for decrement in range(5, min(MAX_YEAR_RANGE, current_year - earliest_year + 1), 5):
        pivot_year = current_year - decrement
        before_pivot = counts_by_year.loc[counts_by_year.index < pivot_year][count_column].sum()
        if before_pivot == 0: # Moving further back won't get us any additional values
            break
        after_pivot = counts_by_year.loc[counts_by_year.index >= pivot_year][count_column].sum()
        if after_pivot / before_pivot > optimal_rate:
            optimal_range = decrement
            optimal_rate = after_pivot / before_pivot
    
    if optimal_range == 0:
        raise ValueError("DataBait 1: No values within the last %d years for %s." % (MAX_YEAR_RANGE, label))
    return {
        "label": label,
        "label_column": label_column,
        "count_column": count_column,
        "time_range": optimal_range,
        "rate": optimal_rate * 100,
    }


def generate_databait_2(df, data_column, label1, label2, time_column):
    """
    #Categorical, #Time

    Sample: 5 times as many CS professors were hired by 
    Carnegie Mellon University than by Brown University in the past 25 years.

    Returns:
        dictionary of bigger_label, smaller_label, rate, and time_range

    """
    # Create two series that count how many times year values appear
    rows_with_label1 = df.loc[df[data_column] == label1][time_column]
    rows_with_label1.dropna(inplace=True)
    time_formatted1 = rows_with_label1.astype("int32")
    time_counts1 = time_formatted1.value_counts().sort_index(ascending=False)

    rows_with_label2 = df.loc[df[data_column] == label2][time_column]
    rows_with_label2.dropna(inplace=True)
    time_formatted2 = rows_with_label2.astype("int32")
    time_counts2 = time_formatted2.value_counts().sort_index(ascending=False)

    # Search for optimal time range by iterating through time ranges,
    # increasing by 5 years, up to 30 years
    current_year = datetime.datetime.now().year
    earliest_year = max(time_counts1.index[-1], time_counts2.index[-1])
    optimal_range = 0
    optimal_rate = 0
    bigger_label = None
    smaller_label = None
    for decrement in range(5, min(MAX_YEAR_RANGE, current_year - earliest_year + 1), 5):
        pivot_year = current_year - decrement
        added_values1 = time_counts1.loc[time_counts1.index >= pivot_year].sum()
        added_values2 = time_counts2.loc[time_counts2.index >= pivot_year].sum()

        diff = abs(added_values1 - added_values2) / min(added_values1, added_values2)
        if diff > abs(optimal_rate):
            optimal_range = decrement
            optimal_rate = diff
            if added_values1 > added_values2:
                bigger_label, smaller_label = label1, label2
            else:
                bigger_label, smaller_label = label2, label1
    return {
        "bigger_label": bigger_label,
        "smaller_label": smaller_label,
        "column": data_column,
        "rate": optimal_rate * 100,
        "time_range": optimal_range,
    }


def generate_databait_2a(df, label_column, label1, label2, count_column, time_column):
    """
    #Numerical, #Time 

    Sample: In the past x years, games categorized as Action had x% more Global Sales than
    those categorized as Sports.  
    """
    rows_with_label1 = df.loc[df[label_column] == label1][[count_column, time_column]].dropna()
    rows_formatted1 = rows_with_label1.astype({time_column: "int32", count_column: "float32"})
    counts_by_year1 = rows_formatted1.groupby([time_column]).sum().sort_index(ascending=False)

    rows_with_label2 = df.loc[df[label_column] == label2][[count_column, time_column]].dropna()
    rows_formatted2 = rows_with_label2.astype({time_column: "int32", count_column: "float32"})
    counts_by_year2 = rows_formatted2.groupby([time_column]).sum().sort_index(ascending=False)

    current_year = datetime.datetime.now().year
    earliest_year = max(counts_by_year1.index[-1], counts_by_year2.index[-1])
    optimal_range = 0
    optimal_rate = 0
    bigger_label = None
    smaller_label = None

    for decrement in range(5, min(MAX_YEAR_RANGE, current_year - earliest_year + 1), 5):
        pivot_year = current_year - decrement
        added_values1 = counts_by_year1.loc[counts_by_year1.index >= pivot_year].sum()
        added_values2 = counts_by_year2.loc[counts_by_year2.index >= pivot_year].sum()

        diff = abs(added_values1 - added_values2) / min(added_values1, added_values2)
        if diff > abs(optimal_rate):
            optimal_range = decrement
            optimal_rate = diff
            if added_values1 > added_values2:
                bigger_label, smaller_label = label1, label2
            else:
                bigger_label, smaller_label = label2, label1
    return {
        "bigger_label": bigger_label,
        "smaller_label": smaller_label,
        "column": count_column,
        "rate": optimal_rate * 100,
        "time_range": optimal_range,
    }


def generate_databait_3(df, column1, label1, column2, label2, time_column):
    """
    #Categorical, #Time

    Sample: Over the past 20 years, the total number of CS professors who 
    were hired by Brown University and specialized in Databases tripled.

    Template: Over the past <time_range> years, the total number of <entry phrase>
    <pronoun> <column phrase1> <label1> <column phrase2> <label2> <growth phrase>. 
    """
    # Create a series that counts how many times a year entries with label1 and 2 appear
    rows_with_label = df.loc[df[column1] == label1].loc[df[column2] == label2][
        time_column
    ].dropna()
    time_formatted = rows_with_label.astype("int32")
    time_counts = time_formatted.value_counts().sort_index(ascending=False)

    # Search for optimal time range
    current_year = datetime.datetime.now().year
    earliest_year = time_counts.index[-1]
    optimal_range = 0
    optimal_rate = 0
    for decrement in range(5, min(MAX_YEAR_RANGE, current_year - earliest_year + 1), 5):
        pivot_year = current_year - decrement
        previous_sum = time_counts.loc[time_counts.index < pivot_year].sum()
        if previous_sum == 0:
            break
        added_values = time_counts.loc[time_counts.index >= pivot_year].sum()
        if abs(added_values / previous_sum) > abs(optimal_rate):
            optimal_range = decrement
            optimal_rate = added_values / previous_sum
    return {
        "label1": label1,
        "label2": label2,
        "column1": column1,
        "column2": column2,
        "rate": optimal_rate * 100,
        "time_range": optimal_range,
    }

def generate_databait_3a(df, column1, label1, column2, label2, count_column, time_column):
    """
    #Numerical, Time

    Sample: Over the past 20 years, the total Global Sales for games 
    categorized as Action and released by Nintendo grew x times. 

    Template: Over the past <time_range> years, the total <count column> for <entry phrase>
    <column phrase1> <label1> and <column phrase2> <label2> <growth phrase>. 
    """
    # Create a series that sums counts by year for entries satisfying both labels 1 and 2
    rows_with_label = df.loc[df[column1] == label1].loc[df[column2] == label2][
        [count_column, time_column]
    ].dropna()
    data_formatted = rows_with_label.astype({time_column: "int32", count_column: "float32"})
    time_counts = data_formatted.groupby([time_column]).sum().sort_index(ascending=False)

    # Search for optimal time range
    current_year = datetime.datetime.now().year
    earliest_year = time_counts.index[-1]
    optimal_range = 0
    optimal_rate = 0
    for decrement in range(5, min(MAX_YEAR_RANGE, current_year - earliest_year + 1), 5):
        pivot_year = current_year - decrement
        previous_sum = time_counts.loc[time_counts.index < pivot_year][count_column].sum()
        if previous_sum == 0:
            break
        added_values = time_counts.loc[time_counts.index >= pivot_year][count_column].sum()
        if abs(added_values / previous_sum) > abs(optimal_rate):
            optimal_range = decrement
            optimal_rate = added_values / previous_sum
    return {
        "label1": label1,
        "label2": label2,
        "column1": column1,
        "column2": column2,
        "count_column": count_column,
        "rate": optimal_rate * 100,
        "time_range": optimal_range,
    }


def generate_databait_4(
    df, column1, shared_label, column2, label_a, label_b, time_column
):
    """
    #Categorical, #Time

    Template:
    The number of rows with [shared label in column1] and [label A in column2]
    grew/shrank [rate]% more than those with [shared label in column1] and
    [label B in column2] in the past [time range].
    """
    cleaned_df = df.dropna(subset=[time_column])
    # valid_year_filter = [year.isnumeric() for year in cleaned_df[time_column]]
    # cleaned_df = cleaned_df[valid_year_filter]
    cleaned_df = cleaned_df.astype({time_column: "int32"})

    rows_with_shared_label = cleaned_df.loc[cleaned_df[column1] == shared_label]
    rows_with_a = rows_with_shared_label.loc[cleaned_df[column2] == label_a][
        time_column
    ]
    rows_with_b = rows_with_shared_label.loc[cleaned_df[column2] == label_b][
        time_column
    ]
    a_counts = rows_with_a.value_counts().sort_index(ascending=False)
    b_counts = rows_with_b.value_counts().sort_index(ascending=False)

    # Search for optimal time range by iterating through time ranges,
    # increasing by 5 years, up to 30 years
    now = datetime.datetime.now()
    current_year = now.year

    if len(a_counts) == 0:
        raise ValueError("There are no values in the time range for %s" % label_a)
    if len(b_counts) == 0:
        raise ValueError("There are no values in the time range for %s" % label_b)

    earliest_year = max(a_counts.index[-1], b_counts.index[-1])
    optimal_range = 0
    optimal_rate = 0
    bigger_label = None
    smaller_label = None

    for decrement in range(5, min(MAX_YEAR_RANGE, current_year - earliest_year + 1), 5):
        pivot_year = current_year - decrement
        added_values_a = a_counts.loc[a_counts.index >= pivot_year].sum()
        added_values_b = b_counts.loc[b_counts.index >= pivot_year].sum()
        if min(added_values_a, added_values_b) == 0:
            continue 
        diff = abs(added_values_a - added_values_b) / min(
            added_values_a, added_values_b
        )

        if diff > optimal_rate:
            optimal_rate = diff
            optimal_range = decrement
            bigger_label = label_a if added_values_a >= added_values_b else label_b
            smaller_label = label_a if bigger_label == label_b else label_b
    
    # TODO: make more detailed error (which input is the problem?)
    if bigger_label is None:
        raise ValueError("Not enough entries for the inputs for DataBait 4 occur in overlapping time intervals")

    return {
        "shared_label": shared_label,
        "column1": column1,
        "bigger_label": bigger_label,
        "smaller_label": smaller_label,
        "column2": column2,
        "rate": optimal_rate * 100,
        "time_range": optimal_range,
    }


def generate_databait_5(df, data_column, time_column):
    """
    #Categorical, #Time

    Sample:  More than four times as many CS professors were hired by 
    Carnegie Mellon University than by the average university in the past 25 years.

    Template: <growth phrase> <entry phrase> <column phrase> <max label> 
    than <column phrase-short> the average <column> in the past <time_range> years. 
    """

    # Preprocess data to remove NaN and non-numeric time column (year) values
    cleaned_df = df.dropna(subset=[time_column])[[time_column, data_column]]
    cleaned_df = cleaned_df.astype({time_column: "int32"})

    current_year = datetime.datetime.now().year
    optimal_range = 0
    optimal_rate = 0
    optimal_label = None
    # Search for optimal time range
    for decrement in range(5, MAX_YEAR_RANGE, 5):
        pivot_year = current_year - decrement
        entries_in_time_range = cleaned_df.loc[cleaned_df[time_column] >= pivot_year][
            data_column
        ]
        counts = entries_in_time_range.value_counts()

        max_label, max_count = counts.idxmax(), counts.max()
        avg_of_others = (counts.sum() - max_count) / (len(counts.index) - 1)
        if avg_of_others == 0:
            continue
        diff = (max_count - avg_of_others) / avg_of_others
        if diff > optimal_rate:
            optimal_rate = diff
            optimal_range = decrement
            optimal_label = max_label

    if optimal_label is None:
        raise ValueError("Please pick different inputs for DataBait 5")

    return {
        "max_label": optimal_label,
        "column": data_column,
        "rate": optimal_rate * 100,
        "time_range": optimal_range,
    }

def generate_databait_5a(df, label_column, count_column, time_column):
    """
    #Numerical, #Time

    Sample: In the past 25 years, games released by Nintendo had 
    7 times higher Global Sales than those released by the average company. 

    Template: In the past <time range> years, <entry phrase> <label_column_phrase> <max_label>
    had <rate phrase> higher <count column> than those <label_column_phrase> the average
    <label>.
    """
    # Preprocess data to remove NaN and non-numeric time column (year) values
    cleaned_df = df.dropna(subset=[time_column])[[time_column, label_column, count_column]]
    cleaned_df = cleaned_df.astype({time_column: "int32", count_column: "float32"})

    current_year = datetime.datetime.now().year
    optimal_range = 0
    optimal_rate = 0
    optimal_label = None
    # Search for optimal time range
    for decrement in range(5, MAX_YEAR_RANGE, 5):
        pivot_year = current_year - decrement
        entries_in_time_range = cleaned_df.loc[cleaned_df[time_column] >= pivot_year][[label_column, count_column]]
        counts = entries_in_time_range.groupby([label_column]).sum()

        max_label, max_count = counts.idxmax(), counts.max()
        avg_of_others = (counts.sum() - max_count) / (len(counts.index) - 1)
        if avg_of_others == 0:
            continue
        diff = (max_count - avg_of_others) / avg_of_others
        if diff > optimal_rate:
            optimal_rate = diff
            optimal_range = decrement
            optimal_label = max_label

    if optimal_label is None:
        raise ValueError("Please pick different inputs for DataBait 5")

    return {
        "max_label": optimal_label,
        "label_column": label_column,
        "count_column": count_column,
        "rate": optimal_rate * 100,
        "time_range": optimal_range,
    }


def generate_databait_6(df, data_column, time_column):
    """
    #Categorical #Time

    Sample: 13% of all new CS professors from the past 5 years specialized in Security & Privacy.

    Template: <proportion>% of all new <entry phrase> in the past <time_range> years 
    <column phrase> <max label>. 
    """
    # Preprocess data to remove NaN and non-numeric time column (year) values
    cleaned_df = df.dropna(subset=[time_column])[[time_column, data_column]]
    cleaned_df = cleaned_df.astype({time_column: "int32"})

    now = datetime.datetime.now()
    current_year = now.year
    optimal_range = 0
    optimal_proportion = 0
    optimal_label = None
    # Search for optimal time range
    for decrement in range(5, MAX_YEAR_RANGE, 5):
        pivot_year = current_year - decrement
        entries_in_time_range = cleaned_df.loc[cleaned_df[time_column] >= pivot_year][
            data_column
        ]
        counts = entries_in_time_range.value_counts()
        max_label, max_count = counts.idxmax(), counts.max()
        total_counts = counts.sum()
        proportion = max_count / total_counts
        if proportion > optimal_proportion:
            optimal_range = decrement
            optimal_proportion = proportion
            optimal_label = max_label

    return {
        "proportion": optimal_proportion * 100,
        "column": data_column,
        "time_range": optimal_range,
        "max_label": optimal_label,
    }

def generate_databait_6a(df, label_column, count_column, time_column):
    """
    #Numerical #Time
    
    Sample: 13% of all new games from the past 5 years were released by Nintendo.

    Template: <proportion>% of all new <entry phrase> in the past <time_range> years 
    <column phrase> <max label>. 
    """
    
    # Preprocess data to remove NaN and non-numeric time column (year) values
    cleaned_df = df.dropna(subset=[time_column])[[time_column, label_column, count_column]]
    cleaned_df = cleaned_df.astype({time_column: "int32", count_column: "float32"})

    current_year = datetime.datetime.now().year
    optimal_range = 0
    optimal_proportion = 0
    optimal_label = None
    # Search for optimal time range
    for decrement in range(5, MAX_YEAR_RANGE, 5):
        pivot_year = current_year - decrement
        entries_in_time_range = cleaned_df.loc[cleaned_df[time_column] >= pivot_year][
            [label_column, count_column]
        ]
        counts = entries_in_time_range.groupby([label_column]).sum()
        max_label, max_count = counts.idxmax(), counts.max()
        total_counts = counts.sum()
        proportion = max_count / total_counts
        if proportion > optimal_proportion:
            optimal_range = decrement
            optimal_proportion = proportion
            optimal_label = max_label

    return {
        "proportion": optimal_proportion * 100,
        "label_column": label_column,
        "count_column": count_column,
        "time_range": optimal_range,
        "max_label": optimal_label,
    }

def generate_databait_7(df, data_column, label, time_column, event, year):
    """
    #Categorical, #Numerical (not implemented), #Time

    Template:
    [Label count in a column] has risen/fallen [rate]% since [year],
    when [event] occurred.

    """
    rows_with_label = (
        df.loc[df[data_column] == label]
        .dropna(subset=[time_column])
        .astype({time_column: "int32"})
    )
    before = len(rows_with_label.loc[rows_with_label[time_column] < year])
    if before == 0:
        raise ValueError(
            "Please change inputs for DataBait 7.  \
                There are no records for the input label prior to the year of the input event."
        )
    change = len(
        rows_with_label.loc[rows_with_label[time_column] >= year]
    )
    rate_of_change = change / before
    return {
        "label": label,
        "column": data_column,
        "event": event,
        "year": year,
        "rate": rate_of_change * 100,
    }

def generate_databait_7a(df, label_column, label, count_column, time_column, event, year):
    """
    #Numerical #Time 

    Sample: The total Global Sales of games released by Nintendo nearly tripled since 
    x, when the first Super Mario game was released. 

    Template: The total <count column> of <entry phrase> <label column phrase> <label>
    <growth phrase> since <year> when <event>. 

    """
    rows_with_label = (
        df.loc[df[label_column] == label]
        .dropna(subset=[time_column])
        .astype({time_column: "int32", count_column: "float32"})
    )
    before = rows_with_label.loc[rows_with_label[time_column] < year][count_column].sum()
    if before == 0:
        raise ValueError(
            "Please change inputs for DataBait 7a.  \
                There are no records for the input label prior to the year of the input event."
        )
    change = rows_with_label.loc[rows_with_label[time_column] >= year][count_column].sum()
    rate_of_change = change / before 
    return {
        "label": label,
        "label_column": label_column,
        "count_column": count_column,
        "event": event,
        "year": year,
        "rate": rate_of_change * 100,
    }

def generate_databait_8(df, column1, column2):
    """
    #Categorical, #Numerical

    Template:
    [Proportion]% of entries share values for [column1] and [column2].
    e.g.) 13% of CS professors went to the same university for their undergraduate and doctorate degrees.

    Returns:
        dictionary of proportion, column1, and column2
    """
    total_rows = len(df)
    cleaned_df = df.dropna(subset=[column1, column2])
    rows_with_labels = cleaned_df.loc[cleaned_df[column1] == cleaned_df[column2]]
    matching_rows = len(rows_with_labels)
    return {
        "proportion": matching_rows / total_rows * 100,
        "column1": column1,
        "column2": column2,
    }


def generate_databait_9(df, data_column, time_column, time_range):
    """
    #Categorical, #Time

    Template:
    [Label]'s share of [column] dropped/rose from [rate1]% in [year1] to [rate2%] in [year2].

    Returns:
    Dictionary of the optimal label, the proportion at the starting and end years, and the starting and end years
    """
    # Approach 1: Given time range, find optimal label => Implemented now
    # Approach 2: Given label, find optimal time range
    cleaned_df = df.dropna(subset=[time_column])[[time_column, data_column]]
    # valid_year_filter = [year.isnumeric() for year in cleaned_df[time_column]]
    # cleaned_df = cleaned_df[valid_year_filter]
    cleaned_df = cleaned_df.astype({time_column: "int32"})

    latest_year = cleaned_df[time_column].max()
    latest_entries = cleaned_df.loc[cleaned_df[time_column] <= latest_year][data_column]
    latest_counts = latest_entries.value_counts()
    latest_total = latest_counts.values.sum()

    years = cleaned_df[time_column]
    oldest_year = years.where(years > latest_year - time_range).min()
    oldest_entries = cleaned_df.loc[cleaned_df[time_column] <= oldest_year][data_column]
    oldest_counts = oldest_entries.value_counts()
    oldest_total = oldest_counts.values.sum()

    all_entries = set(latest_entries.array).union(set(oldest_entries.array))

    optimal_label = None
    optimal_diff = float("-inf")
    optimal_start = None
    optimal_end = None

    for entry in all_entries:
        if entry in latest_counts.index:
            latest_portion = latest_counts[entry] / latest_total * 100
        else:
            latest_portion = 0
        if entry in oldest_counts.index:
            oldest_portion = oldest_counts[entry] / oldest_total * 100
        else:
            oldest_portion = 0
        diff = abs(latest_portion - oldest_portion)
        if diff > optimal_diff:
            optimal_diff = diff
            optimal_start, optimal_end = oldest_portion, latest_portion
            optimal_label = entry

    return {
        "label": optimal_label,
        "column": data_column,
        "start": optimal_start,
        "end": optimal_end,
        "oldest_year": oldest_year,
        "latest_year": latest_year,
    }


def generate_databait_10(df, data_column, time_column, time_range):
    """
    #Categorical, #Numerical, #Time

    Template:
    [Labels] went up, and [Labels] went down from [year] to [year].
    """
    # The part below is repeated from DB 9 - move into a helper function ==========
    cleaned_df = df.dropna(subset=[time_column])[[time_column, data_column]]
    # valid_year_filter = [year.isnumeric() for year in cleaned_df[time_column]]
    # cleaned_df = cleaned_df[valid_year_filter]
    cleaned_df = cleaned_df.astype({time_column: "int32"})

    latest_year = cleaned_df[time_column].max()
    latest_entries = cleaned_df.loc[cleaned_df[time_column] == latest_year][data_column]
    latest_counts = latest_entries.value_counts()
    latest_total = latest_counts.values.sum()

    years = cleaned_df[time_column]
    oldest_year = years.where(years > latest_year - time_range).min()
    oldest_entries = cleaned_df.loc[cleaned_df[time_column] == oldest_year][data_column]
    oldest_counts = oldest_entries.value_counts()
    oldest_total = oldest_counts.values.sum()

    all_entries = set(latest_entries.array).union(set(oldest_entries.array))
    # Helper function end ==========

    up_labels = []
    down_labels = []

    for entry in all_entries:
        # NOTE: we could compare the values individually, or as shares of the total
        # latest_count = 0 if entry not in latest_counts.index else latest_counts[entry]
        # oldest_count = 0 if entry not in oldest_counts.index else oldest_counts[entry]
        # diff = (latest_count - oldest_count)

        # NOTE: we could use the abs difference, or % difference (divide by zero error)
        if entry in latest_counts.index:
            latest_portion = latest_counts[entry] / latest_total * 100
        else:
            latest_portion = 0
        if entry in oldest_counts.index:
            oldest_portion = oldest_counts[entry] / oldest_total * 100
        else:
            oldest_portion = 0
        diff = latest_portion - oldest_portion

        if diff > 0:
            up_labels.append((entry, diff))
        elif diff < 0:
            down_labels.append((entry, diff))

    up_labels.sort(key=lambda x: x[1], reverse=True)
    down_labels.sort(key=lambda x: x[1])

    return {
        "up_labels": [x[0] for x in up_labels[:1]], # TODO: tune number of labels returned
        "down_labels": [x[0] for x in down_labels[:1]],
        "column": data_column,
        "oldest_year": oldest_year,
        "latest_year": latest_year,
    }


def generate_databait_11(df, column_name, columns_to_compare=[]):
    """
    #Numerical

    Template:
    [Column1] showed the highest correlation with [column2].
    """
    if len(columns_to_compare) <= 1:
        raise ValueError
    coefficients = []
    base_column = df[column_name]
    for col in columns_to_compare:
        coefficients.append(abs(base_column.corr(df[col])))
    coefficients = np.array(coefficients)
    idx = np.argmax(coefficients)
    highest_corr_col = columns_to_compare[idx]
    return {
        "base_column": column_name,
        "comp_column": highest_corr_col,
        "corr": coefficients[idx],
    }


def generate_databait_12(df, columns=[]):
    """
    #Categorical

    Template:
    Currently - [Label] was the most often associated with [Column1, column2, … (related)].
    Goal - [Share]% of [Column1, column2, … (related)] are [label].
    """
    all_entries = set()
    for col in columns:
        entries = set(df[col])
        all_entries.update(entries)

    counts = []
    total_counts = 0
    for col in columns:
        counts.append(df[col].value_counts())
        total_counts += df[col].value_counts().sum()

    max_count = float("-inf")
    max_entry = None
    for entry in all_entries:
        count = 0
        for i in range(len(columns)):
            if entry in counts[i].index:
                count += counts[i][entry]
        if count > max_count:
            max_count = count
            max_entry = entry

    return {
        "max_label": max_entry,
        "share": max_count / total_counts * 100,
        "columns": columns,
    }


def generate_databait_13(df, column1, column2):
    """
    #Numerical

    Template:
    [max_label] is the most diverse [column1] in [column2] and [min_label] is the least diverse. 
    """

    max_variance = float("-inf")
    max_label = None 
    min_variance = float("inf")
    min_label = None 

    all_labels= set(df[column1])
    for label in all_labels:
        variance = df.loc[df[column1] == label][column2].var()
        if variance >= max_variance:
            max_label = label
            max_variance = variance 
        if variance <= min_variance:
            min_label = label
            min_variance = variance 

    return {
        "max_label": max_label,
        "min_label": min_label,
        "column1": column1,
        "column2": column2
    }

def generate_databait_14(df, column1, column2):
    max_count = float("-inf")
    max_label = None 
    min_count = float("inf")
    min_label = None 
    total_count = 0

    all_labels= set(df[column1])
    for label in all_labels:
        count = df.loc[df[column1] == label][column2].sum()
        if count >= max_count:
            max_label = label
            max_count = count 
        if count <= min_count:
            min_label = label
            min_count = count 
        total_count += count 

    return {
        "max_label": max_label,
        "min_label": min_label,
        "max_count": max_count,
        "min_count": min_count,
        "avg_count": total_count / len(all_labels),
        "column1": column1,
        "column2": column2
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate DataBaits from CSV file")
    parser.add_argument(
        "--csv", default="../data/professors.csv", help="The CSV to read data from"
    )
    parser.add_argument("--index", help="the index column for the pandas dataframe")
    args = parser.parse_args()
    df = load_csv(args.csv, args.index)
    df2 = load_csv("../data/elections.csv", args.index)
    df3 = load_csv("../data/vgsales.csv", args.index)
    print(generate_databait_1a(df3, "Publisher", "Nintendo", "Global_Sales", "Year"))
    print(generate_databait_1(df, "University", "Brown University", "JoinYear"))
































































