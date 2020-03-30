package com.ajobs.domain;

//import com.joestelmach.natty.DateGroup;
//import com.joestelmach.natty.Parser;

public class DateParsed {
	private Integer year = null;
	private Integer month = null;
	private Integer day = null;
	private String date_parsed;
	
	public String getDate_parsed() {
		return date_parsed;
	}
	public void setDate_parsed(String date_parsed) {
		this.date_parsed = date_parsed;
	}
	public Integer getYear() {
		return year;
	}
	public void setYear(Integer year) {
		this.year = year;
	}
	public boolean isYearNullorZero(){
		return isNullorZero(year);
	}
	public Integer getMonth() {
		return month;
	}
	public void setMonth(Integer month) {
		this.month = month;
	}
	public boolean isMonthNullorZero(){
		return isNullorZero(month);
	}
	public Integer getDay() {
		return day;
	}
	public void setDay(Integer day) {
		this.day = day;
	}
	public boolean isDayNullorZero(){
		return isNullorZero(day);
	}
	private  boolean isNullorZero(Integer i) {
	    return 0 == ( i == null ? 0 : i);
	}
	
	/*
	public String parseDate(String date_to_parse,  boolean parseAll) {
		String new_date = date_to_parse;
		Parser parser = new Parser();
		List<DateGroup> dates = parser.parse(date_to_parse);
		
		if(parseAll) {
			try {
				if(dates.size() > 0) {
					String month = dates.get(0).getSyntaxTree().getChild(0).getChild(0).getChild(0).getChild(0).toString(); //month
					if(month.length() == 1) {
						month = "0" + month;
					}
					String day = dates.get(0).getSyntaxTree().getChild(0).getChild(0).getChild(1).getChild(0).toString(); //day
					String year = dates.get(0).getSyntaxTree().getChild(0).getChild(0).getChild(2).getChild(0).toString(); //year
					new_date = year + "-" + month + "-" + day;
				}
			} catch (Exception e) {
				new_date = date_to_parse;
			}
		} else {
			if(dates.size() > 0) {
				try {
					String month = dates.get(0).getSyntaxTree().getChild(0).getChild(0).getChild(0).getChild(0).toString(); //month
					if(month.length() == 1) {
						month = "0" + month;
					}
					this.month = Integer.valueOf(month);
				} catch (Exception e) {
					this.month = 00;
				}
				
				try {
					String day = dates.get(0).getSyntaxTree().getChild(0).getChild(0).getChild(1).getChild(0).toString(); //day
					this.day = Integer.valueOf(day);
				} catch (Exception e) {
					this.day = 00;
				}

				try {
					String year = dates.get(0).getSyntaxTree().getChild(0).getChild(0).getChild(2).getChild(0).toString(); //year
					this.year = Integer.valueOf(year);
				} catch (Exception e) {
					this.year = 0000;
				}
				
				new_date = this.year + "-" + this.month + "-" + this.day;
			} else {
				new_date = date_to_parse;
			}
			
		}
		
		date_parsed = new_date;
		
		return new_date;
	}
	*/
}
