import sys
import argparse
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import datetime

pd.options.mode.chained_assignment = None  # default='warn'

# Will search at most this many years into the past
MAX_YEAR_RANGE = 30


def load_csv(file_location, index_col):
    return pd.read_csv(file_location, index_col=index_col)


def generate_databait_1(df, data_column, label, time_column):
    """
    #Categorical, #Time

    Template:
    The total number of [label in column] grew/shrank [rate]% in the past [time range].

    Params:
        data_column: column to search for label in
        label: label to find in column
        time_column: name of column with time data

    Returns:
        dictionary of label, growth (in percentage), and time range
    """
    # Create a series that counts how many times a year value appears
    rows_with_label = df.loc[df[data_column] == label][time_column]
    rows_with_label.dropna(inplace=True)
    # TODO: Write a general method to format dates. This is just for CS professors dataset.
    time_formatted = rows_with_label.astype("int32")
    time_counts = time_formatted.value_counts().sort_index(ascending=False)
    # Search for optimal time range by iterating through time ranges,
    # increasing by 5 years, up to 30 years
    now = datetime.datetime.now()
    current_year = now.year
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
        "label": label,
        "column": data_column,
        "rate": optimal_rate * 100,
        "time_range": optimal_range,
    }


def generate_databait_2(df, data_column, label1, label2, time_column):
    """
    #Categorical, #Time

    Template:
    The total number of [max(label1, label2) in column] grew/shrank [rate]% more than
    [min(label1, label2) in column] in [time range].

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
    now = datetime.datetime.now()
    current_year = now.year
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


def generate_databait_3(df, column1, label1, column2, label2, time_column):
    """
    #Categorical, #Time

    Template:
    The total number of [label1 in column1, filtered by label2 in column2]
    grew/shrank [rate]% in the past [time range].
    e.g.) The total number of HCI professors at Brown University grew ...

    Returns:
        dictionary of label1, label2, rate, time_range

    """
    # Create a series that counts how many times a year value appears
    rows_with_label = df.loc[df[column1] == label1].loc[df[column2] == label2][
        time_column
    ]
    rows_with_label.dropna(inplace=True)
    # TODO: Write a general method to format dates. This is just for CS professors dataset.
    time_formatted = rows_with_label.astype("int32")
    time_counts = time_formatted.value_counts().sort_index(ascending=False)
    # Search for optimal time range by iterating through time ranges,
    # increasing by 5 years, up to 30 years
    now = datetime.datetime.now()
    current_year = now.year
    earliest_year = time_counts.index[-1]
    optimal_range = 0
    optimal_rate = 0
    for decrement in range(5, min(MAX_YEAR_RANGE, current_year - earliest_year + 1), 5):
        # NOTE: This should look differently if the data itself is cumulative
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
    
    if bigger_label is None:
        raise ValueError("There are no entries in the database that match the inputs for DataBait 4")

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

    Template:
    [max/min label] was [rate]% higher/lower than the average [column] in the past [time range].
    **only supports max for now

    """
    # Preprocess data to remove NaN and non-numeric time column (year) values
    cleaned_df = df.dropna(subset=[time_column])[[time_column, data_column]]
    # valid_year_filter = [year.isnumeric() for year in cleaned_df[time_column]]
    # cleaned_df = cleaned_df[valid_year_filter]
    cleaned_df = cleaned_df.astype({time_column: "int32"})

    now = datetime.datetime.now()
    current_year = now.year
    optimal_range = 0
    optimal_rate = 0
    optimal_label = None
    # Search for optimal time range by iterating through time ranges,
    # increasing by 5 years, up to 30 years
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


def generate_databait_6(df, data_column, time_column):
    """
    #Categorical, #Time

    Template:
    [Proportion]% of [column] in the past [time_range] comes from [label].

    """
    # Preprocess data to remove NaN and non-numeric time column (year) values
    cleaned_df = df.dropna(subset=[time_column])[[time_column, data_column]]
    # valid_year_filter = [year.isnumeric() for year in cleaned_df[time_column]]
    # cleaned_df = cleaned_df[valid_year_filter]
    cleaned_df = cleaned_df.astype({time_column: "int32"})

    now = datetime.datetime.now()
    current_year = now.year
    optimal_range = 0
    optimal_proportion = 0
    optimal_label = None
    # Search for optimal time range by iterating through time ranges,
    # increasing by 5 years, up to 30 years
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
    count_at_event = len(rows_with_label.loc[rows_with_label[time_column] <= year])
    if count_at_event == 0:
        raise ValueError(
            "Please change inputs for DataBait 5.  \
                There are no records for the input label prior to the year of the input event."
        )
    latest_year = rows_with_label[time_column].max()
    count_at_present = len(
        rows_with_label.loc[rows_with_label[time_column] <= latest_year]
    )
    rate_of_change = (count_at_present - count_at_event) / count_at_event
    return {
        "label": label,
        "column": data_column,
        "event": event,
        "year": year,
        "latest_year": latest_year,
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
    # print(generate_databait_1(df, "University", "Brown University", "JoinYear"))
    # print(generate_databait_1(df, "University", "Carnegie Mellon University", "JoinYear"))
    # print(generate_databait_2(df, "University", "Brown University", "Carnegie Mellon University", "JoinYear"))
    # print(generate_databait_3(df, "University", "Brown University",
    #     "SubField", "Databases", "JoinYear"))
    # print(generate_databait_4(df, "SubField", "Databases", "University", "Brown University", "Carnegie Mellon University", "JoinYear"))
    # print(generate_databait_5(df, "University", "JoinYear"))
    # print(generate_databait_6(df, "University", "JoinYear"))
    # print(
    #     generate_databait_7(
    #         df,
    #         "SubField",
    #         "Artificial Intelligence",
    #         "JoinYear",
    #         "IBM's Deep Blue beat Garry Kasparov",
    #         1997,
    #     )
    # )
    # print(generate_databait_8(df, "Bachelors", "Doctorate"))
    # print(generate_databait_9(df, "University", "JoinYear", 30))
    # print(generate_databait_10(df, "SubField", "JoinYear", 20))
    # print(
    #     generate_databait_11(
    #         df2, "sepal.length", ["sepal.width", "petal.length", "petal.width"]
    #     )
    # )
    # print(generate_databait_12(df, columns=["University","Bachelors", "Masters", "Doctorate"]))
    # print(generate_databait_13(df2, "State", "Trump votes by county"))
    print(generate_databait_14(df2, "State", "Total Trump Votes"))