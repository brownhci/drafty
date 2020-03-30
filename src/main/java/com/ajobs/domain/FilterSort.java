package com.ajobs.domain;

public class FilterSort {
	
	private Integer columnToSort = 1; //default column to sort
	private boolean isSortAsc = true;
	private Integer idSuggestionTypeToFilter = 1;
	private String  valueToSearch = "";
	private Integer lastSearchID;
	private SearchOperator searchOp =  SearchOperator.LIKE;
	private enum SearchOperator {
		LIKE("LIKE"),
		EQUALS("="),
		DOESNOTEQUAL("!=");
		
		private String op;

	    SearchOperator(String op) {
	        this.op = op;
	    }

	    public String op() {
	        return op;
	    }
	}
	
	public Integer getColumnToSort() {
		return columnToSort;
	}
	public void setColumnToSort(Integer columnToSort) {
		this.columnToSort = columnToSort;
	}
	public boolean isSortAsc() {
		return isSortAsc;
	}
	public void setSortAsc(boolean isSortAsc) {
		this.isSortAsc = isSortAsc;
	}
	public Integer getIdSuggestionTypeToFilter() {
		return idSuggestionTypeToFilter;
	}
	public void setIdSuggestionTypeToFilter(Integer idSuggestionTypeToFilter) {
		this.idSuggestionTypeToFilter = idSuggestionTypeToFilter;
	}
	public String getValueToSearch() {
		return valueToSearch;
	}
	public void setValueToSearch(String valueToSearch) {
		this.valueToSearch = valueToSearch;
	}
	public SearchOperator getSearchOp() {
		return searchOp;
	}
	public void setSearchOp(SearchOperator searchOp) {
		this.searchOp = searchOp;
	}
	public Integer getLastSearchID() {
		return lastSearchID;
	}
	public void setLastSearchID(Integer lastSearchID) {
		this.lastSearchID = lastSearchID;
	}
}
