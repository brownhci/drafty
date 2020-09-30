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
        dict["rate"] = abs(dict["rate"])
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
        dict["rate"] = abs(dict["rate"])
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
        dict["rate"] = abs(dict["rate"])
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
        dict["rate"] = abs(dict["rate"])
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
        dict["rate"] = abs(dict["rate"])
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
        dict["max_label"],
    )


def create_sentence_7(dict, count_phrase):
    """
    Original sentence: [Label count in a column] has risen/fallen [rate]% since [year],
    when [event] occurred.

    Template: The <args-count_phrase> <dict-label> has <risen OR fallen> <dict-rate> percent
    since <dict-year>, when <dict-event>.
    """
    if dict["rate"] > 0:
        growth_word = "risen"
    else:
        growth_word = "fallen"
        dict["rate"] = abs(dict["rate"])
    return "The %s %s has %s %d percent since %d, when %s." % (
        count_phrase,
        dict["label"],
        growth_word,
        dict["rate"],
        dict["year"],
        dict["event"],
    )


def create_sentence_8(dict, count_phrase, relationship_phrase):
    """
    Original sentence: [Proportion]% of entries share values for [column1] and [column2].

    Template: <dict-proportion> percent of <args-count phrase> <args-relationship phrase>
    for <dict-column1> and <dict-column2>.
    """
    return "%d percent of %s %s for %s and %s." % (
        dict["proportion"],
        count_phrase,
        relationship_phrase,
        dict["column1"],
        dict["column2"],
    )


def create_sentence_9(dict, count_phrase):
    """
    Original sentence: [Label]'s share of [column] dropped/rose from [rate1]% in [year1] to [rate2%] in [year2].

    Template: <dict-label>'s share of <args-count phrase> <dropped OR rose>
    from <dict-rate1> percent in <dict-year1> to <dict-rate2> percent in <dict-year2>.
    """
    if dict["start"] < dict["end"]:
        growth_word = "rose"
    else:
        growth_word = "dropped"
    return "%s's share of %s %s from %d percent in %d to %d percent in %d." % (
        dict["label"],
        count_phrase,
        growth_word,
        dict["start"],
        dict["oldest_year"],
        dict["end"],
        dict["latest_year"],
    )


def create_sentence_10(dict, count_phrase, pronoun_phrase):
    """
    Original sentence: [Labels] went up, and [Labels] went down from [year] to [year].

    Template: The <args-count phrase> <dict-up_labels> went up,
    and <args-pronoun phrase> <dict-down_labels> went down,
    from <dict-oldest year> to <dict-latest year>.
    """
    # TODO: throw error when up_labels or down_labels == size 0?

    def convert_label_list_to_string(labels):
        labels = [x[0] for x in labels]
        if len(labels) <= 2:
            return " and ".join(labels)

        res = ""
        for i in range(len(labels) - 1):
            res += labels[i]
            res += ", "
        res += "and "
        res += labels[-1]
        return res

    return "The %s %s went up, and %s %s went down, from %d to %d." % (
        count_phrase,
        convert_label_list_to_string(dict["up_labels"]),
        pronoun_phrase,
        convert_label_list_to_string(dict["down_labels"]),
        dict["oldest_year"],
        dict["latest_year"],
    )

# TODO: is there a way we can generalize column phrases for a DB so that 
# dict[comp_column] can map to a column phrase for that col? 
def create_sentence_11(dict, column_phrase):
    """
    Original sentence: [Column1] showed the highest correlation with [column2].

    Template: The <args-column_phrase1> <dict-base_column> showed the highest
    correlation with <args-column_phrase2> <dict-comp_column>.
    """
    return "The %s showed the highest correlation with %s." % (
        dict["comp_column"],
        column_phrase
    )

def create_sentence_12(dict):
    """
    Original sentence: [Label] was the most often associated with [Column1, column2, … (related)].

    Template: <dict-entry> was the most common in columns that show <dict-columns>.
    # NOTE: Ultimately, each column in dict-columns should be translated into a column phrase
    """
    def convert_columns_to_phrases(columns):
        if len(columns) <= 2:
            return " and ".join(columns)
        
        res = ""
        for i in range(len(columns) - 1):
            res += columns[i]
            res += ", "
        res += "and "
        res += columns[-1]
        return res
        
    return "%s was the most common in columns that show %s." % (
        dict["entry"],
        convert_columns_to_phrases(dict["columns"])
    )

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate DataBaits from CSV file")
    parser.add_argument(
        "--csv", default="../data/professors.csv", help="The CSV to read data from"
    )
    parser.add_argument("--index", help="the index column for the pandas dataframe")
    args = parser.parse_args()
    df = cs.load_csv(args.csv, args.index)
    df2 = cs.load_csv("../data/iris.csv", args.index)

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

    # dict6 = cs.generate_databait_6(df, "University", "JoinYear")
    # print(create_sentence_6(dict6, "CS professors hired"))

    # dict7 = cs.generate_databait_7(
    #     df,
    #     "SubField",
    #     "Artificial Intelligence",
    #     "JoinYear",
    #     "IBM's Deep Blue beat Garry Kasparov",
    #     1997,
    # )
    # print(create_sentence_7(dict7, "number of CS professors who specialize in"))

    # dict8 = cs.generate_databait_8(df, "Bachelors", "Doctorate")
    # print(create_sentence_8(dict8, "CS professors", "went to the same school for their"))

    # dict9 = cs.generate_databait_9(df, "University", "JoinYear", 30)
    # print(create_sentence_9(dict9, "all CS professors hired in a year"))

    # dict10 = cs.generate_databait_10(df, "SubField", "JoinYear", 20)
    # print(
    #     create_sentence_10(
    #         dict10,
    #         "number of newly hired CS professors who specialize in",
    #         "that of those who specialize in",
    #     )
    # )
    
    # dict11 = cs.generate_databait_11(
    #         df2, "sepal.length", ["sepal.width", "petal.length", "petal.width"]
    #     )
    # print(create_sentence_11(dict11, "sepal length of iris flowers"))

    # dict12 = cs.generate_databait_12(df, columns=["University","Bachelors", "Masters", "Doctorate"])
    # print(create_sentence_12(dict12))
