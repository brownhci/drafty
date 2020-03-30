package com.ajobs.domain;

public class PasteHistory {
	private Integer idInteraction;
	private Integer idSuggestionBefore;
	private Integer idSuggestionAfter;
	
	public PasteHistory(Integer idInteraction, Integer idSuggestionBefore, Integer idSuggestionAfter) {
		super();
		this.idInteraction = idInteraction;
		this.idSuggestionBefore = idSuggestionBefore;
		this.idSuggestionAfter = idSuggestionAfter;
	}

	public Integer getIdInteraction() {
		return idInteraction;
	}

	public void setIdInteraction(Integer idInteraction) {
		this.idInteraction = idInteraction;
	}

	public Integer getIdSuggestionBefore() {
		return idSuggestionBefore;
	}

	public void setIdSuggestionBefore(Integer idSuggestionBefore) {
		this.idSuggestionBefore = idSuggestionBefore;
	}

	public Integer getIdSuggestionAfter() {
		return idSuggestionAfter;
	}

	public void setIdSuggestionAfter(Integer idSuggestionAfter) {
		this.idSuggestionAfter = idSuggestionAfter;
	}
}
