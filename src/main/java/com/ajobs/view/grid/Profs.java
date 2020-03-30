package com.ajobs.view.grid;

import java.util.HashMap;
import java.util.Map;

public class Profs {
	
	private String idUniqueID;
	private String FullName;
	private String University;
	private String Bachelors;
	private String Masters;
	private String Doctorate;
	private String PostDoc;
	private String JoinYear;
	private String Rank;
	private String Subfield;
	private String Gender;
	private String PhotoUrl;
	private String Sources;
	private String createdBy;
	private String lastUpdated;
	private Map<Integer, Integer> idSuggestions = new HashMap<Integer, Integer>();
	private Map<Integer, String> suggestions = new HashMap<Integer, String>();
	
	public void addNewField(String valToUpdate, Integer idSuggestionType) {
		suggestions.put(idSuggestionType, valToUpdate);
		if(idSuggestionType == 1) { 
			this.FullName = valToUpdate;
		} else if(idSuggestionType == 2) {
			this.University = valToUpdate;
		} else if(idSuggestionType == 3) {
			this.Bachelors = valToUpdate;
		} else if(idSuggestionType == 4) {
			this.Masters = valToUpdate;
		} else if(idSuggestionType == 5) {
			this.Doctorate = valToUpdate;
		} else if(idSuggestionType == 6) {
			this.PostDoc = valToUpdate;
		} else if(idSuggestionType == 7) {
			this.JoinYear = valToUpdate;
		} else if(idSuggestionType == 8) {
			this.Rank = valToUpdate;
		} else if(idSuggestionType == 9) {
			this.Subfield = valToUpdate;
		} else if(idSuggestionType == 10) {
			this.Gender = valToUpdate;
		} else if(idSuggestionType == 11) {
			this.PhotoUrl = valToUpdate;
		} else if(idSuggestionType == 12) {
			this.Sources = valToUpdate;
		} else if(idSuggestionType == 13) {
			this.createdBy = valToUpdate;
		} else if(idSuggestionType == 14) {
			this.lastUpdated = valToUpdate;
		} else {
			this.idUniqueID = valToUpdate;
		}
	}
	
	public Map<Integer, String> getSuggestions() {
		return suggestions;
	}
	
	public String getSuggestion(Integer idSuggestionType) {
		if(idSuggestionType == 1) { 
		    return FullName;
		} else if(idSuggestionType == 2) {
		    return University;
		} else if(idSuggestionType == 3) {
		    return Bachelors;
		} else if(idSuggestionType == 4) {
		    return Masters;
		} else if(idSuggestionType == 5) {
		    return Doctorate;
		} else if(idSuggestionType == 6) {
		    return PostDoc;
		} else if(idSuggestionType == 7) {
		    return JoinYear;
		} else if(idSuggestionType == 8) {
		    return Rank;
		} else if(idSuggestionType == 9) {
		    return Subfield;
		} else if(idSuggestionType == 10) {
		    return Gender;
		} else if(idSuggestionType == 11) {
		    return PhotoUrl;
		} else if(idSuggestionType == 12) {
		    return Sources;
		} else if(idSuggestionType == 13) {
		    return createdBy;
		} else if(idSuggestionType == 14) {
		    return lastUpdated;
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
		return idUniqueID + "|" + FullName + "|" + University + "|" + Bachelors + "|" + Masters + "|" + Doctorate + "|" + PostDoc + "|"
				+ JoinYear + "|" + Rank + "|" + Subfield + "|" + Gender + "|" + PhotoUrl + "|" + Sources;
	}
	public String getIdUniqueID() {
		return idUniqueID;
	}
	public void setIdUniqueID(String idUniqueID) {
		this.idUniqueID = idUniqueID;
	}
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
	public String getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(String createdBy) {
		this.createdBy = createdBy;
	}
	public String getLastUpdated() {
		return lastUpdated;
	}
	public void setLastUpdated(String lastUpdated) {
		this.lastUpdated = lastUpdated;
	}
}
