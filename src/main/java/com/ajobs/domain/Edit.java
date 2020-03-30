package com.ajobs.domain;

public class Edit {
	private Integer chosenSugg;
	private Integer newSugg;
	public Edit(Integer chosenSugg, Integer newSugg) {
		super();
		this.chosenSugg = chosenSugg;
		this.newSugg = newSugg;
	}
	public Integer getIsChosen() {
		return chosenSugg;
	}
	public Integer getIsNew() {
		return newSugg;
	}
}
