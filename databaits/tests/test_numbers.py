"""Tests to ensure that calculations performed by databaits are correct"""
from databaits.src import get_data, databait_1

def test_databait_1():
    df = get_data('../data/professors.csv', None)
    time_range, rate = databait_1(df, "University", "Brown University", "JoinYear", "Year")

test_databait_1()