package com.ajobs.domain;

public class Sort {
	private String idSuggestionType;
	private Integer isAsc;
	private Integer isTrigger;
	private Integer isMulti;
	
	
	public Sort(String idSuggestionType, Integer isAsc, Integer isTrigger, Integer isMulti) {
		super();
		this.idSuggestionType = idSuggestionType;
		this.isAsc = isAsc;
		this.isTrigger = isTrigger;
		this.isMulti = isMulti;
	}
	
	public String getIdSuggestionType() {
		return idSuggestionType;
	}
	public void setIdSuggestionType(String idSuggestionType) {
		this.idSuggestionType = idSuggestionType;
	}
	public Integer getIsAsc() {
		return isAsc;
	}
	public void setIsAsc(Integer isAsc) {
		this.isAsc = isAsc;
	}
	public Integer getIsTrigger() {
		return isTrigger;
	}
	public void setIsTrigger(Integer isTrigger) {
		this.isTrigger = isTrigger;
	}
	public Integer getIsMulti() {
		return isMulti;
	}
	public void setIsMulti(Integer isMulti) {
		this.isMulti = isMulti;
	}
}
