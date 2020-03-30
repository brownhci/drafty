package com.ajobs.domain;

public class Suggestion {
	
	private Integer idSuggestion;
	private Integer idSuggestionType;
	private Integer idUniqueID;
	private String  suggestion;
	private Integer confidence;
	private Integer idProfile;
	

	public Suggestion(Integer idSuggestion, Integer idSuggestionType, Integer idUniqueID,
			String suggestion, Integer confidence, Integer idProfile) {
		
		super();
		this.idSuggestion = idSuggestion;
		this.idSuggestionType = idSuggestionType;
		this.idUniqueID = idUniqueID;
		this.suggestion = suggestion;
		this.confidence = confidence;
		this.idProfile = idProfile;
	}

	public Integer getIdSuggestion() {
		return idSuggestion;
	}

	public void setIdSuggestion(Integer idSuggestion) {
		this.idSuggestion = idSuggestion;
	}

	public Integer getIdSuggestionType() {
		return idSuggestionType;
	}

	public void setIdSuggestionType(Integer idSuggestionType) {
		this.idSuggestionType = idSuggestionType;
	}

	public Integer getIdUniqueID() {
		return idUniqueID;
	}

	public void setIdUniqueID(Integer idUniqueID) {
		this.idUniqueID = idUniqueID;
	}

	public String getSuggestion() {
		return suggestion;
	}

	public void setSuggestion(String suggestion) {
		this.suggestion = suggestion;
	}

	public Integer getConfidence() {
		return confidence;
	}

	public void setConfidence(Integer confidence) {
		this.confidence = confidence;
	}

	public Integer getIdProfile() {
		return idProfile;
	}

	public void setIdProfile(Integer idProfile) {
		this.idProfile = idProfile;
	}
}
