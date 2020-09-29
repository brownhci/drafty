"""Given outputs from functions in calculate_statistics.py, form full sentences"""

import calculate_statistics as cs
import argparse

def create_setence_1(dict, count_phrase):
    """
    Original sentence: The total number of [label in column] grew/shrank
    [rate]% in the past [time range].
    Template: The <arg-count phrase> <dict-label> <grew OR shrank> <dict-rate> %
    in the past <dict-time_range> years.
    """
    if dict["rate"] > 0:
        growth_word = "grew"
    else:
        growth_word = "shrank"
    return "The %s %s %s %d percent in the past %d years." % (
        count_phrase,
        dict["label"],
        growth_word,
        dict["rate"],
        dict["time_range"],
    )

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate DataBaits from CSV file")
    parser.add_argument(
        "--csv", default="../data/professors.csv", help="The CSV to read data from"
    )
    parser.add_argument("--index", help="the index column for the pandas dataframe")
    args = parser.parse_args()
    df = cs.load_csv(args.csv, args.index)

    dict1 = cs.generate_databait_1(df, "University", "Brown University", "JoinYear")
    print(create_setence_1(dict1, "number of CS professors hired by"))