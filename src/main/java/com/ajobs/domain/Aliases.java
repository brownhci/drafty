package com.ajobs.domain;

public class Aliases {
	private Integer idAlias;
	private Integer idSuggestion;
	private String  alias;
	private Integer count;
	
	public Aliases(Integer idAlias, Integer idSuggestion, String alias, Integer count) {
		super();
		this.idAlias = idAlias;
		this.idSuggestion = idSuggestion;
		this.alias = alias;
		this.count = count;
	}

	public Integer getIdSuggestion() {
		return idSuggestion;
	}

	public void setIdSuggestion(Integer idSuggestion) {
		this.idSuggestion = idSuggestion;
	}
	
	public Integer getIdAlias() {
		return idAlias;
	}

	public void setIdAlias(Integer idAlias) {
		this.idAlias = idAlias;
	}

	public String getAlias() {
		return alias;
	}

	public void setAlias(String alias) {
		this.alias = alias;
	}

	public Integer getCount() {
		return count;
	}

	public void setCount(Integer count) {
		this.count = count;
	}
}
