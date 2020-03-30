package com.ajobs.domain;

public class Leaderboard {
	String username;
	Integer newRecords;
	Integer Edits;
	
	public Leaderboard(String username, Integer newRecords, Integer edits) {
		super();
		this.username = username;
		this.newRecords = newRecords;
		Edits = edits;
	}
	public String getUsername() {
		return username;
	}
	public void setUsername(String username) {
		this.username = username;
	}
	public Integer getNewRecords() {
		return newRecords;
	}
	public void setNewRecords(Integer newRecords) {
		this.newRecords = newRecords;
	}
	public Integer getEdits() {
		return Edits;
	}
	public void setEdits(Integer edits) {
		Edits = edits;
	}
}
