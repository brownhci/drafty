"""Given outputs from functions in calculate_statistics.py, form full sentences"""

import calculate_statistics as cs
import argparse

COUNT_PHRASE = "number of CS professors hired by"


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


def create_setence_2(dict, count_phrase):
    """
    Original sentence: The total number of [max(label1, label2) in column]
    grew/shrank [rate]% more than [min(label1, label2) in column] in [time range].

    Template: The <arg-count phrase> <dict-bigger_label> <grew OR shrank>
    <dict-rate> percent more than <arg-count pharse> <dict-smaller_label>
    in the past <dict-time_range> years.
    """
    if dict["rate"] > 0:
        growth_word = "grew"
    else:
        growth_word = "shrank"
    return "The %s %s %s %d percent more than the %s %s in the past %d years." % (
        count_phrase,
        dict["bigger_label"],
        growth_word,
        dict["rate"],
        count_phrase,
        dict["smaller_label"],
        dict["time_range"],
    )


def create_sentence_3(dict, count_phrase1, count_phrase2):
    """
    Original sentence: The total number of
    [label1 in column1, filtered by label2 in column2]
    grew/shrank [rate]% in the past [time range].

    Template: The <arg-count phrase1> <dict-label1>
    <arg-count phrase2> <dict-label2> <grew OR shrank>
    <dict-rate> percent in the past <dict-time_range> years.
    """
    if dict["rate"] > 0:
        growth_word = "grew"
    else:
        growth_word = "shrank"
    return "The %s %s %s %s %s %d percent in the past %d years." % (
        count_phrase1,
        dict["label1"],
        count_phrase2,
        dict["label2"],
        growth_word,
        dict["rate"],
        dict["time_range"],
    )


def create_sentence_4(dict, count_phrase1, count_phrase2):
    """
    Original sentence: The number of rows with [shared label in column1]
    and [label A in column2] grew/shrank [rate]% more than
    those with [shared label in column1] and [label B in column2]
    in the past [time range].

    Template: The <arg-count phrase1> <dict-shared_label>
    <arg-count phrase2> <dict-bigger_label>
    <grew OR shrank> <dict-rate> percent more than
    those <arg-count phrase 2> <dict-smaller_label>
    in the past <dict-time_range> years.
    """
    if dict["rate"] > 0:
        growth_word = "grew"
    else:
        growth_word = "shrank"
    return (
        "The %s %s %s %s %s %d percent more than those %s %s in the past %d years."
        % (
            count_phrase1,
            dict["shared_label"],
            count_phrase2,
            dict["bigger_label"],
            growth_word,
            dict["rate"],
            count_phrase2,
            dict["smaller_label"],
            dict["time_range"],
        )
    )

# IDEA: If rate > 100, use times instead of percent? 
def create_sentence_5(dict, count_phrase, short_count_phrase, column_phrase):
    """
    Original sentence: [Max/min label] was [rate]% higher/lower than
    the average [column] in the past [time range].
    **only supports max for now

    Template: The <count_phrase> <dict-max_label> was
    <dict-rate> percent <higher OR lower> than that of those
    <short_count_phrase> the average <column_phrase> in the past <dict-time_range> years.
    """
    if dict["rate"] > 0:
        growth_word = "higher"
    else:
        growth_word = "lower"
    return "The %s %s was %d percent %s than that of those %s the average %s in the past %d years." % (
        count_phrase,
        dict["max_label"],
        dict["rate"],
        growth_word,
        short_count_phrase,
        column_phrase,
        dict["time_range"],
    )

def create_sentence_6(dict, count_phrase):
    """
    Original sentence: [Proportion]% of [column] in the past 
    [time_range] comes from [label].

    Template: <dict-proportion> percent of <count_phrase>
    in the past <dict-time_range> comes from <dict-max_label>.
    """
    return "%d percent of %s in the past %d years comes from %s." % (
        dict["proportion"],
        count_phrase,
        dict["time_range"],
        dict["max_label"]
    )


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate DataBaits from CSV file")
    parser.add_argument(
        "--csv", default="../data/professors.csv", help="The CSV to read data from"
    )
    parser.add_argument("--index", help="the index column for the pandas dataframe")
    args = parser.parse_args()
    df = cs.load_csv(args.csv, args.index)

    # dict1 = cs.generate_databait_1(df, "University", "Brown University", "JoinYear")
    # print(create_setence_1(dict1, COUNT_PHRASE))

    # dict2 = cs.generate_databait_2(df, "University", "Brown University", "Carnegie Mellon University", "JoinYear")
    # print(create_setence_2(dict2, COUNT_PHRASE))

    # dict3 = cs.generate_databait_3(df, "University", "Brown University", "SubField", "Databases", "JoinYear")
    # print(create_sentence_3(dict3, COUNT_PHRASE, "who specialize in"))

    # dict4 = cs.generate_databait_4(
    #     df,
    #     "SubField",
    #     "Databases",
    #     "University",
    #     "Brown University",
    #     "Carnegie Mellon University",
    #     "JoinYear",
    # )
    # print(
    #     create_sentence_4(
    #         dict4, "number of CS professors who specialize in", "hired by"
    #     )
    # )

    # dict5 = cs.generate_databait_5(df, "University", "JoinYear")
    # print(create_sentence_5(dict5, COUNT_PHRASE, "hired by", "university"))

    dict6 = cs.generate_databait_6(df, "University", "JoinYear")
    print(create_sentence_6(dict6, "CS professors hired"))