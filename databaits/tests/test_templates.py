"""Tests to ensure that values returned fit templates"""
from databaits.src import *

def test_databait_1(df, column, label, time_column, time_type):
    # TODO: ideally we would replace these hardcoded strings with a csv lookup
    template = "The total number of CS professors hired by {label} " + \
        "increased {rate} percent in the past {time_range} {time_type}."
    special_template = "The total number of CS professors hired " + \
        "by {label} {growth_word} in the past {time_range} {time_type}."
    special_rates = {1.0: "doubled", 2.0: "tripled", 3.0: "quadrupled"}
    # TODO: take into account 100+% cases (~ times)
    
    time_range, rate = databait_1(df, column, label, time_column, time_type)
    if rate in special_rates:
        return special_template.format(label=label, growth_word=special_rates[rate], \
            time_range=time_range, time_type=time_type.lower()) 
    else:
        return template.format(label=label, rate=int(rate*100), time_range=time_range, \
            time_type=time_type.lower())

# TODO: test databait 2

def test_databait_3(df, column1, label1, column2, label2, time_column, time_type):
    template = "The total number of CS professors in {label2} hired by {label1} " + \
        "increased {rate} percent in the past {time_range} {time_type}."
    special_template = "The total number of CS professors in {label2} hired " + \
        "by {label1} {growth_word} in the past {time_range} {time_type}."
    special_rates = {1.0: "doubled", 2.0: "tripled", 3.0: "quadrupled"}

    time_range, rate = databait_3(df, column1, label1, column2, label2, time_column, time_type)

    if rate in special_rates:
        return special_template.format(label2=label2, label1 = label1, \
            growth_word=special_rates[rate], time_range=time_range, time_type=time_type.lower()) 
    else:
        return template.format(label2=label2, label1=label1, rate=int(rate*100), \
            time_range=time_range, time_type=time_type.lower())

# TODO: test databait 4

def test_databait_5(df, column, time_column, time_type, time_point):
    template = "{max} hired {gap} times as many CS professors as the average university in {time_point}."
    max_label, gap = databait_5(df, column, time_column, time_type, time_point)
    return template.format(max=max_label, gap=int(gap), time_point=time_point)

def test_databait_6(df, column, time_column, time_type, time_point):
    template = "{rate} percent of CS professors hired in {time_point} were {label}."
    max_label, rate = databait_6(df, column, time_column, time_type, time_point)
    return template.format(rate=int(rate*100), time_point=time_point, label=max_label)

def test_databait_8(df, column1, column2):
    # TODO: figure out template for this one??
    # TODO: I should eventually make functions that actually generate the sentences
    # and pass the phrases into the functions
    template = "{ratio} percent of CS professors went to the same university for " + \
        "their undergraduate and graduate degrees."
    ratio = databait_8(df, column1, column2)
    return template.format(ratio=round(ratio*100, 3))
    

if __name__ == '__main__':
    df = get_data('../data/professors.csv', None)
    print("\n----------Sample Databaits----------")
    print("\n[[Databait 1]]")
    print(test_databait_1(df, "University", "Cornell University", "JoinYear", "Years"))
    print(test_databait_1(df, "University", "Brown University", "JoinYear", "Years"))
    
    print("\n[[Databait 3]]")
    print(test_databait_3(df, "University", "University of California - Berkeley", \
        "SubField", "Artificial Intelligence", "JoinYear", "Years"))
    print(test_databait_3(df, "University", "Brown University", \
        "SubField", "Artificial Intelligence", "JoinYear", "Years"))
    
    print("\n[[Databait 5]]")
    print(test_databait_5(df, "University", "JoinYear", "Year", "2016"))
    print(test_databait_5(df, "University", "JoinYear", "Year", "1990"))

    print("\n[[Databait 6]]")
    print(test_databait_6(df, "Gender", "JoinYear", "Year", "2016"))
    print(test_databait_6(df, "Gender", "JoinYear", "Year", "1990"))

    print("\n[[Databait 8]]")
    print(test_databait_8(df, "Bachelors", "Doctorate"))

