import sys
import argparse
import pandas as pd
import matplotlib.pyplot as plt
import datetime


def load_csv(file_location, index_col):
    return pd.read_csv(file_location, index_col=index_col)


def generate_databait_1(df, data_column, label, time_column):
    """
    #Categorical, #Time

    Template:
    The total number of [labe in column] grew/shrank [rate]% in the past [time range].

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
    for decrement in range(5, min(30, current_year - earliest_year + 1), 5):
        # NOTE: This should look differently if the data itself is cumulative
        pivot_year = current_year - decrement
        previous_sum = time_counts.loc[time_counts.index < pivot_year].sum()
        if previous_sum == 0:
            break
        added_values = time_counts.loc[time_counts.index >= pivot_year].sum()
        if abs(added_values / previous_sum) > abs(optimal_rate):
            optimal_range = decrement
            optimal_rate = added_values / previous_sum
    return {"label": label, "rate": optimal_rate * 100, "time_range": optimal_range}


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
    for decrement in range(5, min(30, current_year - earliest_year + 1), 5):
        # NOTE: This should look differently if the data itself is cumulative
        pivot_year = current_year - decrement
        previous_sum1 = time_counts1.loc[time_counts1.index < pivot_year].sum()
        added_values1 = time_counts1.loc[time_counts1.index >= pivot_year].sum()
        previous_sum2 = time_counts2.loc[time_counts2.index < pivot_year].sum()
        added_values2 = time_counts2.loc[time_counts2.index >= pivot_year].sum()
        if previous_sum1 == 0 or previous_sum2 == 0:
            break
        change_rate1 = added_values1 / previous_sum1
        change_rate2 = added_values2 / previous_sum2
        diff = abs(change_rate1 - change_rate2) / min(change_rate1, change_rate2)
        if diff > abs(optimal_rate):
            optimal_range = decrement
            optimal_rate = diff
            if change_rate1 > change_rate2:
                bigger_label, smaller_label = label1, label2
            else:
                bigger_label, smaller_label = label2, label1
    return {
        "bigger_label": bigger_label,
        "smaller_label": smaller_label,
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
    for decrement in range(5, min(30, current_year - earliest_year + 1), 5):
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
    valid_year_filter = [year.isnumeric() for year in cleaned_df[time_column]]
    cleaned_df = cleaned_df[valid_year_filter]
    cleaned_df = cleaned_df.astype({time_column: "int32"})

    now = datetime.datetime.now()
    current_year = now.year
    optimal_range = 0
    optimal_rate = 0
    optimal_label = None
    # Search for optimal time range by iterating through time ranges,
    # increasing by 5 years, up to 30 years
    for decrement in range(5, 30, 5):
        pivot_year = current_year - decrement
        entries_in_time_range = cleaned_df.loc[cleaned_df[time_column] >= pivot_year][
            data_column
        ]
        counts = entries_in_time_range.value_counts()

        max_label, max_count = counts.idxmax(), counts.max()
        avg_of_others = (counts.sum() - max_count) / (len(counts.index) - 1)
        diff = (max_count - avg_of_others) / avg_of_others

        if diff > optimal_rate:
            optimal_rate = diff
            optimal_range = decrement
            optimal_label = max_label
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
    valid_year_filter = [year.isnumeric() for year in cleaned_df[time_column]]
    cleaned_df = cleaned_df[valid_year_filter]
    cleaned_df = cleaned_df.astype({time_column: "int32"})

    now = datetime.datetime.now()
    current_year = now.year
    optimal_range = 0
    optimal_proportion = 0
    optimal_label = None
    # Search for optimal time range by iterating through time ranges,
    # increasing by 5 years, up to 30 years
    for decrement in range(5, 30, 5):
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


def generate_databait_8(df, column1, column2):
    """
    #Categorical, #Numerical

    Template:
    [Proportion]% of entries share values for [column1] and [column2].
    e.g.) 13% of CS professors went to the same university for their undergraduate and doctorate degrees.

    Returns:
        dictionary of proportion, column1, and column2
    """
    cleaned_df = df.dropna(subset=[column1, column2])
    total_rows = len(cleaned_df)
    rows_with_labels = cleaned_df.loc[cleaned_df[column1] == cleaned_df[column2]]
    matching_rows = len(rows_with_labels)
    return {
        "proportion": matching_rows / total_rows * 100,
        "column1": column1,
        "column2": column2,
    }


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate DataBaits from CSV file")
    parser.add_argument(
        "--csv", default="../data/professors.csv", help="The CSV to read data from"
    )
    parser.add_argument("--index", help="the index column for the pandas dataframe")
    args = parser.parse_args()
    df = load_csv(args.csv, args.index)
    # print(generate_databait_1(df, "University", "Brown University", "JoinYear"))
    # print(generate_databait_1(df, "University", "Carnegie Mellon University", "JoinYear"))
    # print(generate_databait_2(df, "University", "Brown University", "Carnegie Mellon University", "JoinYear"))
    # print(generate_databait_3(df, "University", "Brown University",
    #     "SubField", "Databases", "JoinYear"))
    # print(generate_databait_5(df, "University", "JoinYear"))
    # print(generate_databait_6(df, "University", "JoinYear"))
    print(generate_databait_8(df, "Bachelors", "Doctorate"))
