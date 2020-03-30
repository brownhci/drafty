package com.ajobs.domain;

public class SuggestionType {

	private Integer idSuggestionType;
	private Integer idDataType; 
	private String name; 
	private Boolean isActive;
	private Boolean makesRowUnique; 
	private Boolean canBeBlank; 
	private Boolean isDate; 
	private Boolean isLink;
	private Boolean isCurrency;
	private Boolean isEditable;
	private Boolean isPrivate;
	private Integer columnOrder;
	
	public SuggestionType(Integer idSuggestionType, Integer idDataType, String name, Boolean isActive,
			Boolean makesRowUnique, Boolean canBeBlank, Boolean isDate, Boolean isLink, Boolean isCurrency,
			Boolean isEditable, Boolean isPrivate, Integer columnOrder) {
		super();
		this.idSuggestionType = idSuggestionType;
		this.idDataType = idDataType;
		this.name = name.replaceAll("_", " ");
		this.isActive = isActive;
		this.makesRowUnique = makesRowUnique;
		this.canBeBlank = canBeBlank;
		this.isDate = isDate;
		this.isLink = isLink;
		this.isCurrency = isCurrency;
		this.isEditable = isEditable;
		this.isPrivate = isPrivate;
		this.columnOrder = columnOrder;
	}
	public Integer getIdSuggestionType() {
		return idSuggestionType;
	}
	public void setIdSuggestionType(Integer idSuggestionType) {
		this.idSuggestionType = idSuggestionType;
	}
	public Integer getIdDataType() {
		return idDataType;
	}
	public void setIdDataType(Integer idDataType) {
		this.idDataType = idDataType;
	}
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name.replaceAll("_", " ");
	}
	public Boolean getIsActive() {
		return isActive;
	}
	public void setIsActive(Boolean isActive) {
		this.isActive = isActive;
	}
	public Boolean getMakesRowUnique() {
		return makesRowUnique;
	}
	public void setMakesRowUnique(Boolean makesRowUnique) {
		this.makesRowUnique = makesRowUnique;
	}
	public Boolean getCanBeBlank() {
		return canBeBlank;
	}
	public void setCanBeBlank(Boolean canBeBlank) {
		this.canBeBlank = canBeBlank;
	}
	public Boolean getIsDate() {
		return isDate;
	}
	public void setIsDate(Boolean isDate) {
		this.isDate = isDate;
	}
	public Boolean getIsLink() {
		return isLink;
	}
	public void setIsLink(Boolean isLink) {
		this.isLink = isLink;
	}
	public Boolean getIsCurrency() {
		return isCurrency;
	}
	public void setIsCurrency(Boolean isCurrency) {
		this.isCurrency = isCurrency;
	}
	public Boolean getIsEditable() {
		return isEditable;
	}
	public void setIsEditable(Boolean isEditable) {
		this.isEditable = isEditable;
	}
	public Boolean getIsPrivate() {
		return isPrivate;
	}
	public void setIsPrivate(Boolean isPrivate) {
		this.isPrivate = isPrivate;
	}
	public Integer getColumnOrder() {
		return columnOrder;
	}
	public void setColumnOrder(Integer columnOrder) {
		this.columnOrder = columnOrder;
	}
	public boolean allowNew() {
		if(idDataType != 4 && idDataType != 2) {
			return true;
		} else {
			return false;
		}
	}
}
