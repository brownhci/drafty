package com.ajobs.newrow;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Pattern;
import javax.validation.constraints.Size;

public class AjobsNewRow {
	
	@Size(min = 1, max = 250, message = "Must be between 1 and 250 characters")
	private String YourStatus = "Not Applicable";
	@NotNull @Pattern(regexp = "^[A-Za-z0-9]+$")
	@Size(min = 1, max = 500, message = "Must be between 1 and 500 characters")
	private String University;
	@NotNull @Pattern(regexp = "^[A-Za-z0-9]+$")
	@Size(min = 1, max = 250, message = "Must be between 1 and 250 characters")
	private String Field;
	@NotNull
	@Size(min = 1, max = 250, message = "Must be between 1 and 250 characters")
	private String Classification;
	@NotNull
	@Size(min = 1, max = 250, message = "Must be between 1 and 250 characters")
	private String Status = "Open";
	private String Position_Type;
	@Size(min = 1, max = 250, message = "Must be between 1 and 250 characters")
	private String Subfield;
	private String AdditionalInformation;
	//@NotNull
	//@Size(min = 1, max = 250, message = "Must be between 1 and 250 characters")
	private String Deadline;
	@NotNull
	@Size(min = 1, max = 500, message = "Must be between 1 and 500 characters")
	private String Link_to_Apply;
	private String SearchChair_Name;
	private String SearchChair_Email;
	private String Notes;
	private String WhoIsInterviewing;
	
	public String getUniversity() {
		return University;
	}
	public void setUniversity(String university) {
		University = university;
	}
	public String getField() {
		return Field;
	}
	public void setField(String field) {
		Field = field;
	}
	public String getClassification() {
		return Classification;
	}
	public void setClassification(String classification) {
		Classification = classification;
	}
	public String getStatus() {
		return Status;
	}
	public void setStatus(String status) {
		Status = status;
	}
	public String getPostion_Type() {
		return Position_Type;
	}
	public void setPosition_Type(String type) {
		Position_Type = type;
	}
	public String getSubfield() {
		return Subfield;
	}
	public void setSubfield(String subfield) {
		this.Subfield = subfield;
	}
	public String getAdditionalInformation() {
		return AdditionalInformation;
	}
	public void setAdditionalInformation(String additionalInformation) {
		this.AdditionalInformation = additionalInformation;
	}
	public String getDeadline() {
		return Deadline;
	}
	public void setDeadline(String deadline) {
		Deadline = deadline;
	}
	public String getLink_to_Apply() {
		return Link_to_Apply;
	}
	public void setLink_to_Apply(String link_to_Apply) {
		Link_to_Apply = link_to_Apply;
	}
	public String getSearchChair_Name() {
		return SearchChair_Name;
	}
	public void setSearchChair_Name(String searchChair_Name) {
		SearchChair_Name = searchChair_Name;
	}
	public String getSearchChair_Email() {
		return SearchChair_Email;
	}
	public void setSearchChair_Email(String searchChair_Email) {
		SearchChair_Email = searchChair_Email;
	}
	public String getNotes() {
		return Notes;
	}
	public void setNotes(String notes) {
		Notes = notes;
	}
	public String getWhoIsInterviewing() {
		return WhoIsInterviewing;
	}
	public void setWhoIsInterviewing(String WhoIsInterviewing) {
		this.WhoIsInterviewing = WhoIsInterviewing;
	}
	public String getYourStatus() {
		return YourStatus;
	}
	public void setYourStatus(String yourStatus) {
		YourStatus = yourStatus;
	}
}
