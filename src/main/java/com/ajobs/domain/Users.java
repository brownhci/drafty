package com.ajobs.domain;

public class Users {
	private String username;
	private String email;
	
	//for leaderboards
	private Integer editsNew;
	private Integer edits;
	private Integer spellingFixes;
	
	public Users(String username, String email, Integer editsNew, Integer edits, Integer spellingFixes) {
		super();
		this.username = username;
		this.email = email;
		this.editsNew = editsNew;
		this.edits = edits;
		this.spellingFixes = spellingFixes;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Integer getEditsNew() {
		return editsNew;
	}

	public void setEditsNew(Integer editsNew) {
		this.editsNew = editsNew;
	}

	public Integer getEdits() {
		return edits;
	}

	public void setEdits(Integer edits) {
		this.edits = edits;
	}

	public Integer getSpellingFixes() {
		return spellingFixes;
	}

	public void setSpellingFixes(Integer spellingFixes) {
		this.spellingFixes = spellingFixes;
	}
}
