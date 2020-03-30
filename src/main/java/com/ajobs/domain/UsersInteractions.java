package com.ajobs.domain;


public class UsersInteractions {
	
	private Integer idInteraction;
	private Integer idInteractionType;
	private Integer idProfile;
	private String username;
	
	public UsersInteractions(Integer idInteraction, Integer idInteractionType,
			Integer idProfile, String username) {
		super();
		this.idInteraction = idInteraction;
		this.idInteractionType = idInteractionType;
		this.idProfile = idProfile;
		this.username = username;

	}

	public Integer getidInteraction() {
		return idInteraction;
	}

	public void setidInteraction(Integer idInteraction) {
		this.idInteraction = idInteraction;
	}

	public Integer getidInteractionType() {
		return idInteractionType;
	}

	public void setidInteractionType(Integer idInteractionType) {
		this.idInteractionType = idInteractionType;
	}

	public Integer getidProfile() {
		return idProfile;
	}

	public void setidSession(Integer idProfile) {
		this.idProfile = idProfile;
	}

	public String getUsername() {
		return username;
	}

	public void setUsername(String username) {
		this.username = username;
	}


}
