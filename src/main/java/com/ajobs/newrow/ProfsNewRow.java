package com.ajobs.newrow;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class ProfsNewRow {
	
	@NotNull
	@Size(min = 1, max = 500, message = "Must be between 1 and 500 characters")
	private String FullName;
	@NotNull
	@Size(min = 1, max = 1500, message = "Must be between 1 and 1500 characters")
	private String University;
	@Size(min = 1, max = 1500, message = "Must be between 1 and 1500 characters")
	private String Bachelors;
	@Size(min = 1, max = 1500, message = "Must be between 1 and 1500 characters")
	private String Masters;
	@Size(min = 1, max = 1500, message = "Must be between 1 and 1500 characters")
	private String Doctorate;
	@Size(min = 1, max = 1500, message = "Must be between 1 and 1500 characters")
	private String PostDoc;
	@Size(min = 1, max = 4, message = "Must be between 1 and 4 characters")
	private String JoinYear;
	private String Rank;
	private String Subfield;
	private String Gender;
	@Size(min = 1, max = 1500, message = "Must be between 1 and 1500 characters")
	private String PhotoUrl;
	@Size(min = 1, max = 1500, message = "Must be between 1 and 1500 characters")
	private String Sources;
	
	public String getFullName() {
		return FullName;
	}
	public void setFullName(String fullName) {
		FullName = fullName;
	}
	public String getUniversity() {
		return University;
	}
	public void setUniversity(String university) {
		University = university;
	}
	public String getBachelors() {
		return Bachelors;
	}
	public void setBachelors(String bachelors) {
		Bachelors = bachelors;
	}
	public String getMasters() {
		return Masters;
	}
	public void setMasters(String masters) {
		Masters = masters;
	}
	public String getDoctorate() {
		return Doctorate;
	}
	public void setDoctorate(String doctorate) {
		Doctorate = doctorate;
	}
	public String getPostDoc() {
		return PostDoc;
	}
	public void setPostDoc(String postDoc) {
		PostDoc = postDoc;
	}
	public String getJoinYear() {
		return JoinYear;
	}
	public void setJoinYear(String joinYear) {
		JoinYear = joinYear;
	}
	public String getRank() {
		return Rank;
	}
	public void setRank(String rank) {
		Rank = rank;
	}
	public String getSubfield() {
		return Subfield;
	}
	public void setSubfield(String subfield) {
		Subfield = subfield;
	}
	public String getGender() {
		return Gender;
	}
	public void setGender(String gender) {
		Gender = gender;
	}
	public String getPhotoUrl() {
		return PhotoUrl;
	}
	public void setPhotoUrl(String photoUrl) {
		PhotoUrl = photoUrl;
	}
	public String getSources() {
		return Sources;
	}
	public void setSources(String sources) {
		Sources = sources;
	}
}
