"""Given outputs from functions in calculate_statistics.py, form full sentences"""

import calculate_statistics as cs
import argparse


def capitalize_first_word(sentence):
    first_char = sentence[0].upper()
    first_char += sentence[1:]
    return first_char


def phrase_numbers_for_change(number):
    """Phrases big numbers in a more intuitive way"""
    if number < 0:
        return "decreased by %d percent" % (number)
    if number == 0:
        return "did not change"

    # Number < 100
    if 0 < number < 100:
        return "increased by %d percent" % (number)

    # Simple cases
    simple_words = {
        100: "doubled",
        200: "tripled",
        300: "quadrupled",
    }
    if number in simple_words:
        return simple_words[number]

    # Between doubled and quadrupled
    if 100 < number and number <= 150:
        return "more than doubled"
    elif 150 < number and number < 200:
        return "nearly tripled"
    elif 200 < number and number <= 250:
        return "more than tripled"
    elif 250 < number and number < 300:
        return "nearly quadrupled"
    elif 300 < number and number < 400:
        return "more than quadrupled"

    # Number too big
    if number >= 400:
        return "increased %d times" % (number/100 + 1)


def phrase_numbers_for_comparisons(number):
    """Phrases big numbers in a more intuitive way"""

    # Number < 100
    if 0 < number < 100:
        return "%d%% as many" % (number)

    # Simple cases
    simple_words = {
        100: "twice",
        200: "three times",
        300: "four times",
    }
    if number in simple_words:
        return "%s as many" % (simple_words[number]) 

    # Between doubled and quadrupled
    if 100 < number and number <= 150:
        return "more than twice as many"
    elif 150 < number and number < 200:
        return "almost three times as many"
    elif 200 < number and number <= 250:
        return "more than three times as many"
    elif 250 < number and number < 300:
        return "almost four times as many"
    elif 300 < number and number < 400:
        return "more than four times as many"

    # Number too big
    if number >= 400:
        return "%d times as many" % (number / 100 + 1)



def create_setence_1(dict, entry_phrase, pronoun, column_phrase):
    """
    Sample: Over the past 25 years, the total number of CS professors who 
    specialized in Human-Computer Interaction more than quadrupled.

    Template: Over the past <time_range> years, the total number of <entry phrase> <pronoun>
    <column phrase> <label> <growth phrase>.  
    """
    rate_phrase = phrase_numbers_for_change(dict["rate"])

    sentence = "Over the past %d years, the total number of %s %s %s %s %s." % (
         dict["time_range"],
         entry_phrase,
         pronoun,
        " ".join(column_phrase[dict["column"]]),
        dict["label"],
        rate_phrase
    )
    return capitalize_first_word(sentence)


def create_setence_2(dict, entry_phrase, column_phrase):
    """
    Sample: 5 times as many CS professors were hired by 
    Carnegie Mellon University than by Brown University in the past 25 years.

    Template: <growth phrase> <entry phrase> <column phrase> <max label> 
    than by <min label> in the past <time range>. 
    """
    rate_phrase = phrase_numbers_for_comparisons(dict["rate"])

    sentence = "%s %s %s %s than %s %s in the past %d years." % (
        rate_phrase,
        entry_phrase,
        " ".join(column_phrase[dict["column"]]),
        dict["bigger_label"],
        column_phrase[dict["column"]][1],
        dict["smaller_label"],
        dict["time_range"]
    )
    return capitalize_first_word(sentence)


def create_sentence_3(dict, entry_phrase, pronoun, column_phrase):
    """
    Sample: Over the past 20 years, the total number of CS professors who 
    were hired by Brown University and specialized in Databases tripled.

    Template: Over the past <time_range> years, the total number of <entry phrase>
    <pronoun> <column phrase1> <label1> <column phrase2> <label2> <growth phrase>. 
    """
    rate_phrase = phrase_numbers_for_change(dict["rate"])
    sentence = "Over the past %d years, the total number of %s %s %s %s and %s %s %s." % (
        dict["time_range"],
        entry_phrase,
        pronoun, 
        " ".join(column_phrase[dict["column1"]]),
        dict["label1"],
        " ".join(column_phrase[dict["column2"]]),
        dict["label2"],
        rate_phrase,
    )
    return capitalize_first_word(sentence)


def create_sentence_4(dict, entry_phrase, pronoun, column_phrase):
    """
    Sample: Twice as many CS professors who specialized in Databases 
    were hired by Brown University than by Carnegie Mellon University in the past 20 years.

    Template: <comparison phrase> <entry phrase> <pronoun> <column1 phrase> <label1>
    <column2 phrase> <bigger label> than <column2 phrase-short> <smaller label>
    in the past <time_range> years.
    """
    
    rate_phrase = phrase_numbers_for_comparisons(dict["rate"])

    sentence = "%s %s %s %s %s %s %s than %s %s in the past %d years." % (
        rate_phrase,
        entry_phrase,
        pronoun,
        " ".join(column_phrase[dict["column1"]]),
        dict["shared_label"],
        " ".join(column_phrase[dict["column2"]]),
        dict["bigger_label"],
        column_phrase[dict["column2"]][1],
        dict["smaller_label"],
        dict["time_range"]
    )
    return capitalize_first_word(sentence)


def create_sentence_5(dict, entry_phrase, column_phrase):
    """
    Sample:  More than four times as many CS professors were hired by 
    Carnegie Mellon University than by the average university in the past 25 years.

    Template: <growth phrase> <entry phrase> <column phrase> <max label> 
    than <column phrase-short> the average <column name.lower()> in the past <time_range> years. 
    """
    growth_phrase = phrase_numbers_for_comparisons(dict["rate"])

    sentence = "%s %s %s %s than %s the average %s in the past %d years." % (
        growth_phrase,
        entry_phrase,
        " ".join(column_phrase[dict["column"]]),
        dict["max_label"],
        column_phrase[dict["column"]][1],
        dict["column"].lower(),
        dict["time_range"]        
    )
    return capitalize_first_word(sentence)

def create_sentence_6(dict, entry_phrase, column_phrase):
    """
    Sample: 13% of all new CS professors from the past 5 years specialized in Security & Privacy.

    Template: <proportion>% of all new <entry phrase> in the past <time_range> years 
    <column phrase> <max label>. 
    """
    return "%d%% of all new %s from the past %d years %s %s." % (
        dict["proportion"],
        entry_phrase,
        dict["time_range"],
        " ".join(column_phrase[dict["column"]]),
        dict["max_label"]
    )


def create_sentence_7(dict, entry_phrase, pronoun, column_phrase):
    """
    Original sentence: The total number of CS professors who specialized in 
    Artificial Intelligence nearly tripled since 1997, when IBM's Deep Blue beat Garry Kasparov.

    Template: The total number of <entry phrase> <pronoun> <column phrase> <label>
    <growth phrase> since <year>, when <event>.
    """
    growth_phrase = phrase_numbers_for_change(dict["rate"])
    sentence = "The total number of %s %s %s %s %s since %d, when %s." % (
        entry_phrase,
        pronoun,
        " ".join(column_phrase[dict["column"]]),
        dict["label"],
        growth_phrase,
        dict["year"],
        dict["event"]
    )
    return capitalize_first_word(sentence)


def create_sentence_8(dict, entry_phrase, column_phrase, column_descriptor):
    """
    Original sentence: [Proportion]% of entries share values for [column1] and [column2].

    25% of CS professors got their undergraduate degrees and doctorate degrees at the same university. 
    went to the same university for their undergraduate and graduate degrees

    got their undergraduate degrees at and  got their graduate degrees
    did undergrad at and got their graduate degrees at the same university.


    Template: <dict-proportion> percent of <column phrase for total> in the database share values for
    the column about <column phrase for dict[column1]> and that about <column phrase for dict[column2]>.
    """
    return "%d%% of %s %s and %s the same %s." % (
        dict["proportion"],
        entry_phrase,
        " ".join(column_phrase[dict["column1"]]),
        " ".join(column_phrase[dict["column2"]]),
        column_descriptor[dict["column1"]]
    )


def create_sentence_9(dict, entry_phrase, column_phrase):
    """
    Sample: 11% of all CS professors specialized in Algorithms & Theory in 2017, compared to 17% in 1988.

    Template: <end-portion> of all <entry phrase> <column phrase> <label> in <end year>,
    compared to <start-portion> in <start year>.
    """

    sentence = "%d%% of all %s %s %s in %d, compared to %d%% in %d." % (
        dict["end"],
        entry_phrase,
        " ".join(column_phrase[dict["column"]]),
        dict["label"],
        dict["latest_year"],
        dict["start"],
        dict["oldest_year"]
    )
    return capitalize_first_word(sentence)


def create_sentence_10(dict, entry_phrase, column_phrase):
    """
    Sample: Less new CS professors specialized in Graphics in 2017 than in 1998, 
    while more specialized in Security & Privacy. 

    Template: Less new <entry phrase> <column phrase> <down labels> from year to year,
    while more <column phrase> <up labels>. 
    """

    sentence = "Less new %s %s %s in %d than in %d, while more %s %s." % (
        entry_phrase,
        " ".join(column_phrase[dict["column"]]),
        " and ".join(dict["down_labels"]),
        dict["latest_year"],
        dict["oldest_year"],
        " ".join(column_phrase[dict["column"]]),
        " and ".join(dict["up_labels"])
    )
    return capitalize_first_word(sentence)


def create_sentence_11(dict, column_phrases):
    """
    Original sentence: [Column1] showed the highest correlation with [column2].

    Template: <column phrase for dict[comp column]> showed the highest
    correlation with <column phrase for dict[base column]>.
    """
    sentence = "%s showed the highest correlation with %s." % (
        column_phrases[dict["comp_column"]],
        column_phrases[dict["base_column"]],
    )
    return capitalize_first_word(sentence)

def create_sentence_12(dict, entry_phrase, column_phrase):
    """
    Original sentence: [Label] was the most often associated with [Column1, column2, … (related)].

    Template: <dict-entry> was the most common value in
    columns that show <column phrase for each column in dict[columns]>.
    # NOTE: We can also just have one phrase inserted that describes all of the columns
    """

    sentence = "The greatest number of %s %s, or %s %s. " % (
        entry_phrase,
        ", ".join([" ".join(column_phrase[col]) for col in dict["columns"][:-1]]),
        " ".join(column_phrase[dict["columns"][-1]]),
        dict["max_label"],
    )
    return capitalize_first_word(sentence)

# TODO: this should be "total trump votes in 2016"... incorporate column descriptors?
def create_sentence_13(dict, entry_phrase):
    """
    Sample: Arizona had the highest variance in Total Trump Votes among its counties, 
    and Vermont had the lowest. 
    """
    sentence = "%s had the highest variance in %s among its %s, and %s had the lowest. " % (
        dict["max_label"],
        dict["column2"],
        entry_phrase,
        dict["min_label"]
    )
    return capitalize_first_word(sentence)

# TODO: what about trillion+?
def phrase_big_numbers(number):
    if number >= 10**9:
        return "%d billion" % (number / 10**9)
    elif number >= 10**6:
        return "%d million" % (number / 10**6)
    elif number >= 10**3:
        return "%d thousand" % (number / 10**3)
    else:
        return int(number)

def create_sentence_14(dict):
    """
    Sample: The average State had about 1 million Total Trump Votes. 
    Texas had the most with about 4 million Total Trump Votes, and Vermont had 
    the least with about 95 thousand Total Trump Votes.
    """ 
    sentence = "The average %s had about %s %s. %s had the most with about %s %s, and %s had the least with about %s %s." % (
        dict["column1"],
        phrase_big_numbers(dict["avg_count"]),
        dict["column2"],
        dict["max_label"],
        phrase_big_numbers(dict["max_count"]),
        dict["column2"],
        dict["min_label"],
        phrase_big_numbers(dict["min_count"]),
        dict["column2"]
    )
    return capitalize_first_word(sentence)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate DataBaits from CSV file")
    parser.add_argument(
        "--csv", default="../data/csprofessors_20201028.csv", help="The CSV to read data from"
    )
    parser.add_argument("--index", help="the index column for the pandas dataframe")
    args = parser.parse_args()
    df = cs.load_csv(args.csv, args.index)

    # entry_phrase = "CS professors"
    # pronoun = "who"

    # column_phrase = {
    #     "University": ("were hired", "by"), 
    #     "SubField": ("specialized", "in"),
    #     "Bachelors": ("got their bachelor's degrees", "from"),
    #     "Doctorate": ("got their doctorate degrees", "from")
    # }

    # column_descriptor = {
    #     "University": "university", 
    #     "SubField": "subfield",
    #     "Bachelors": "university",
    #     "Doctorate": "university"       
    # }

    # dict1 = cs.generate_databait_1(df, "University", "Brown University", "JoinYear")
    # print("(1) " + create_setence_1(dict1, entry_phrase, pronoun, column_phrase))

    # dict1a = cs.generate_databait_1(
    #     df, "SubField", "Human-Computer Interaction", "JoinYear"
    # )
    # print("(1) " + create_setence_1(dict1a, entry_phrase, pronoun, column_phrase))

    # dict1b = cs.generate_databait_1(df, "SubField", "Machine Learning & Data Mining", "JoinYear")
    # print("(1) " + create_setence_1(dict1b, entry_phrase, pronoun, column_phrase))

    # dict2 = cs.generate_databait_2(
    #     df, "University", "Brown University", "Carnegie Mellon University", "JoinYear"
    # )
    # print("(2) " + create_setence_2(dict2, entry_phrase, column_phrase))

    # dict2a = cs.generate_databait_2(
    #     df, "SubField", "Human-Computer Interaction", "Artificial Intelligence", "JoinYear"
    # )
    # print("(2) " + create_setence_2(dict2a, entry_phrase, column_phrase))

    # dict3 = cs.generate_databait_3(
    #     df, "University", "Brown University", "SubField", "Databases", "JoinYear"
    # )
    # print("(3) " + create_sentence_3(dict3, entry_phrase, pronoun, column_phrase))

    # dict3a = cs.generate_databait_3(
    #     df, "SubField", "Machine Learning & Data Mining", "University", "Carnegie Mellon University", "JoinYear"
    # )
    # print("(3) " + create_sentence_3(dict3a, entry_phrase, pronoun, column_phrase))

    # dict4 = cs.generate_databait_4(
    #     df,
    #     "SubField",
    #     "Databases",
    #     "University",
    #     "Brown University",
    #     "Carnegie Mellon University",
    #     "JoinYear",
    # )
    # print("(4) " +
    #     create_sentence_4(dict4, entry_phrase, pronoun, column_phrase)
    # )

    # dict4a = cs.generate_databait_4(
    #     df,
    #     "SubField",
    #     "Artificial Intelligence",
    #     "University",
    #     "Massachusetts Institute of Technology",
    #     "Carnegie Mellon University",
    #     "JoinYear",
    # )

    # print(
    #     "(4) "
    #     + create_sentence_4(
    #         dict4a, entry_phrase, pronoun, column_phrase
    #     )
    # )

    # dict5 = cs.generate_databait_5(df, "University", "JoinYear")
    # print("(5) " + create_sentence_5(dict5, entry_phrase, column_phrase))

    # dict5a = cs.generate_databait_5(df, "SubField", "JoinYear")
    # print("(5) " + create_sentence_5(dict5a, entry_phrase, column_phrase))

    # dict6 = cs.generate_databait_6(df, "University", "JoinYear")
    # print("(6) " + create_sentence_6(dict6, entry_phrase, column_phrase))

    # dict6a = cs.generate_databait_6(df, "SubField", "JoinYear")
    # print("(6) " + create_sentence_6(dict6a, entry_phrase, column_phrase))

    # dict7 = cs.generate_databait_7(
    #     df,
    #     "SubField",
    #     "Artificial Intelligence",
    #     "JoinYear",
    #     "IBM's Deep Blue beat Garry Kasparov",
    #     1997,
    # )
    # print("(7) " + create_sentence_7(dict7, entry_phrase, pronoun, column_phrase))

    # dict8 = cs.generate_databait_8(df, "Bachelors", "Doctorate")
    # print("(8) " + create_sentence_8(dict8, entry_phrase, column_phrase, column_descriptor))

    # dict9 = cs.generate_databait_9(df, "University", "JoinYear", 30)
    # print("(9) " + create_sentence_9(dict9, entry_phrase, column_phrase))

    # dict9a = cs.generate_databait_9(df, "SubField", "JoinYear", 30)
    # print("(9) " + create_sentence_9(dict9a, entry_phrase, column_phrase))

    # dict10 = cs.generate_databait_10(df, "SubField", "JoinYear", 20)
    # print("(10) " +
    #     create_sentence_10(
    #         dict10,
    #         entry_phrase,
    #         column_phrase
    #     )
    # )
    # dict10a = cs.generate_databait_10(df, "Bachelors", "JoinYear", 20)
    # print("(10) " +
    #     create_sentence_10(
    #         dict10a,
    #         entry_phrase,
    #         column_phrase
    #     )
    # )

    # dict12 = cs.generate_databait_12(
    #     df, columns=["University", "Bachelors", "Doctorate"]
    # )
    # print("(12) " + create_sentence_12(dict12, entry_phrase, column_phrase))

    entry_phrase = "counties"
    pronoun = "which"
    df2 = cs.load_csv("../data/elections.csv", args.index)

    # dict13 = cs.generate_databait_13(df2, "State", "Total Trump Votes")
    # print("(13) " + create_sentence_13(dict12, entry_phrase))
    dict14 = cs.generate_databait_14(df2, "State", "Total Trump Votes")
    print("(14) " + create_sentence_14(dict14))