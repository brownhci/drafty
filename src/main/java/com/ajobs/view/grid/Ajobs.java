package com.ajobs.view.grid;

import java.util.HashMap;
import java.util.Map;

public class Ajobs {
	
	private String idUniqueID;
	private String myStatus;
	private String university;
	private String field;
	private String classification;
	private String subfield;
	private String additionalInfo;
	private String positionType;
	private String positionStatus;
	private String deadline;
	private String myNotes;
	private String linkToApply;
	private String whoIsInterviewing;
	private String createdBy;
	private String searchChair;
	private String searchEmail;
	private Map<Integer, Integer> idSuggestions = new HashMap<Integer, Integer>();
	
	public void addNewField(String valToUpdate, Integer idSuggestionType) {
		if(idSuggestionType == 14) {
			this.myStatus = valToUpdate;
		} else if(idSuggestionType == 1) {
			this.university = valToUpdate;
		} else if(idSuggestionType == 2) {
			this.field = valToUpdate;
		} else if(idSuggestionType == 3) {
			this.classification = valToUpdate;
		} else if(idSuggestionType == 6) {
			this.subfield = valToUpdate;
		} else if(idSuggestionType == 5) {
			this.positionType = valToUpdate;
		} else if(idSuggestionType == 4) {
			this.positionStatus = valToUpdate;
		} else if(idSuggestionType == 15) {
			this.additionalInfo = valToUpdate;
		} else if(idSuggestionType == 7) {
			this.deadline = valToUpdate;
		} else if(idSuggestionType == 11) {
			this.myNotes = valToUpdate;
		} else if(idSuggestionType == 8) {
			this.linkToApply = valToUpdate;
		} else if(idSuggestionType == 12) {
			this.whoIsInterviewing = valToUpdate;
		} else if(idSuggestionType == 13) {
			this.createdBy = valToUpdate;
		} else if(idSuggestionType == 9) {
			this.searchChair = valToUpdate;
		} else if(idSuggestionType == 10) {
			this.searchEmail = valToUpdate;
		} else {
			this.idUniqueID = valToUpdate;
		}
	}
	
	public String getSuggestion(Integer idSuggestionType) {
		if(idSuggestionType == 14) {
			return myStatus;
		} else if(idSuggestionType == 1) {
			return university;
		} else if(idSuggestionType == 2) {
			return field;
		} else if(idSuggestionType == 3) {
			return classification;
		} else if(idSuggestionType == 6) {
			return subfield;
		} else if(idSuggestionType == 5) {
			return positionType;
		} else if(idSuggestionType == 4) {
			return positionStatus;
		} else if(idSuggestionType == 15) {
			return additionalInfo;
		} else if(idSuggestionType == 7) {
			return deadline;
		} else if(idSuggestionType == 11) {
			return myNotes;
		} else if(idSuggestionType == 8) {
			return linkToApply;
		} else if(idSuggestionType == 12) {
			return whoIsInterviewing;
		} else if(idSuggestionType == 13) {
			return createdBy;
		} else if(idSuggestionType == 9) {
			return searchChair;
		} else if(idSuggestionType == 10) {
			return searchEmail;
		} else {
			return idUniqueID;
		}
	}
	
	public void setIdSuggestion(Integer idSuggestionType, Integer idSuggestion) {
		idSuggestions.put(idSuggestionType, idSuggestion);
	}
	
	public Integer getIdSuggestion(Integer idSuggestionType) {
		return idSuggestions.get(idSuggestionType);
	}
	
	public Map<Integer, Integer> getIdSuggestions() {
		return idSuggestions;
	}
	
	public String getRowValues() {
		return idUniqueID + "|" + myStatus + "|" + university + "|" + field + "|" + classification + "|" + subfield + "|" 
				+ additionalInfo + "|" + positionType + "|" + positionStatus + "|" + deadline + "|" + myNotes + "|" 
				+ linkToApply + "|" + whoIsInterviewing + "|" + createdBy + "|" + searchChair + "|" + searchEmail;
	}

	public String getIdUniqueID() {
		return idUniqueID;
	}

	public void setIdUniqueID(String idUniqueID) {
		this.idUniqueID = idUniqueID;
	}
	
	public String getMyStatus() {
		return myStatus;
	}

	public void setMyStatus(String myStatus) {
		this.myStatus = myStatus;
	}

	public String getUniversity() {
		return university;
	}

	public void setUniversity(String university) {
		this.university = university;
	}

	public String getClassification() {
		return classification;
	}

	public void setClassification(String classification) {
		this.classification = classification;
	}

	public String getField() {
		return field;
	}

	public void setField(String field) {
		this.field = field;
	}

	public String getSubfield() {
		return subfield;
	}

	public void setSubfield(String subfield) {
		this.subfield = subfield;
	}

	public String getAdditionalInfo() {
		return additionalInfo;
	}

	public void setAdditionalInfo(String additionalInfo) {
		this.additionalInfo = additionalInfo;
	}

	public String getPositionType() {
		return positionType;
	}

	public void setPositionType(String positionType) {
		this.positionType = positionType;
	}

	public String getPositionStatus() {
		return positionStatus;
	}

	public void setPositionStatus(String positionStatus) {
		this.positionStatus = positionStatus;
	}

	public String getDeadline() {
		return deadline;
	}

	public void setDeadline(String deadline) {
		this.deadline = deadline;
	}

	public String getMyNotes() {
		return myNotes;
	}

	public void setMyNotes(String myNotes) {
		this.myNotes = myNotes;
	}

	public String getLinkToApply() {
		return linkToApply;
	}

	public void setLinkToApply(String linkToApply) {
		this.linkToApply = linkToApply;
	}

	public String getWhoIsInterviewing() {
		return whoIsInterviewing;
	}

	public void setWhoIsInterviewing(String whoIsInterviewing) {
		this.whoIsInterviewing = whoIsInterviewing;
	}

	public String getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}

	public String getSearchChair() {
		return searchChair;
	}

	public void setSearchChair(String searchChair) {
		this.searchChair = searchChair;
	}

	public String getSearchEmail() {
		return searchEmail;
	}

	public void setSearchEmail(String searchEmail) {
		this.searchEmail = searchEmail;
	}
}
