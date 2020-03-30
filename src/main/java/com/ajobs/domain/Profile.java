package com.ajobs.domain;

public final class Profile {
	
	private Integer idProfile;
    private String  username;
    private String  email;
    private String  role;
    private Integer idRole;
    private String  experiment;
    private Integer idExperiment;
    private boolean isLoggedIn = false; //init false, since application just starts-ups
    private boolean isNewUser = false; 
    
    private Integer idSession;
    private String sessionStart;
    private String sessionEnd;
    
	public void updateProfile(Integer idProfile, String username, String email, String role, Integer idRole, String experiment,
			Integer idExperiment, boolean isLoggedIn, boolean isNewUser) {
		
		this.idProfile = idProfile;
		this.username = username;
		this.email = email;
		this.role = role;
		this.idRole = idRole;
		this.experiment = experiment;
		this.idExperiment = idExperiment;
		this.isLoggedIn = isLoggedIn;
		this.isNewUser = isNewUser;
	}

	public Integer getIdProfile() {
		return idProfile;
	}

	public void setIdProfile(Integer idProfile) {
		this.idProfile = idProfile;
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

	public String getRole() {
		return role;
	}

	public void setRole(String role) {
		this.role = role;
	}

	public Integer getIdRole() {
		return idRole;
	}

	public void setIdRole(Integer idRole) {
		this.idRole = idRole;
	}

	public String getExperiment() {
		return experiment;
	}

	public void setExperiment(String experiment) {
		this.experiment = experiment;
	}

	public Integer getIdExperiment() {
		return idExperiment;
	}

	public void setIdExperiment(Integer idExperiment) {
		this.idExperiment = idExperiment;
	}

	public boolean isLoggedIn() {
		return isLoggedIn;
	}

	public void setLoggedIn(boolean isLoggedIn) {
		this.isLoggedIn = isLoggedIn;
	}

	public Integer getIdSession() {
		return idSession;
	}

	public void setIdSession(Integer idSession) {
		this.idSession = idSession;
	}

	public String getSessionStart() {
		return sessionStart;
	}

	public void setSessionStart(String sessionStart) {
		this.sessionStart = sessionStart;
	}

	public String getSessionEnd() {
		return sessionEnd;
	}

	public void setSessionEnd(String sessionEnd) {
		this.sessionEnd = sessionEnd;
	}
	
	public boolean isNewUser() {
		return isNewUser;
	}

	public void setNewUser(boolean isNewUser) {
		this.isNewUser = isNewUser;
	}

	@Override
	public String toString() {
		return "Profile [idProfile=" + idProfile + ", username=" + username + ", email=" + email + ", role=" + role
				+ ", idRole=" + idRole + ", experiment=" + experiment + ", idExperiment=" + idExperiment + ", " + isNewUser
				+ ", isLoggedIn=" + isLoggedIn + ", idSession=" + idSession + ", sessionStart=" + sessionStart
				+ ", sessionEnd=" + sessionEnd + "]";
	}
}