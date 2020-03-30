package com.ajobs.domain;

public class SuggestionTypeValues {
	
	private Integer idSuggestionType;
	private String suggestionType;
	private String value;
	
	public SuggestionTypeValues(Integer idSuggestionType, String suggestionType, String value) {
		super();
		this.idSuggestionType = idSuggestionType;
		this.suggestionType = suggestionType.replaceAll("_", " ");
		this.value = value;
	}

	public Integer getIdSuggestionType() {
		return idSuggestionType;
	}

	public void setIdSuggestionType(Integer idSuggestionType) {
		this.idSuggestionType = idSuggestionType;
	}

	public String getSuggestionType() {
		return suggestionType;
	}

	public void setSuggestionType(String suggestionType) {
		this.suggestionType = suggestionType.replaceAll("_", " ");
	}

	public String getValue() {
		return value;
	}

	public void setValue(String value) {
		this.value = value;
	}
}
