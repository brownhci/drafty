"""Tests to ensure that calculations performed by databaits are correct"""
import pytest
from databaits.src import *

@pytest.fixture
def df():
    return get_data('../data/professors.csv', None)

def test_databait_1(df):
    time_range, rate = databait_1(df, "University", "Cornell University", "JoinYear", "Years")
    assert time_range == 15
    assert rate == 1.0

def test_databait_2(df):
    # TODO: implement after discussing logic 
    pass 

def test_databait_3(df):
    time_range, rate = databait_3(df, "University", "University of California - Berkeley", \
        "SubField", "Artificial Intelligence", "JoinYear", "Years")
    assert time_range == 20
    assert rate == 1.0