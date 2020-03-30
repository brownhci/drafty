package com.ajobs.domain;

public class IdCell {
	
	private Integer uniqueID;
	private String value;
	
	public IdCell(Integer uniqueID, String value) {
		super();
		this.uniqueID = uniqueID;
		this.value = value;
	}
	public Integer getUniqueID() {
		return uniqueID;
	}
	public void setUniqueID(Integer uniqueID) {
		this.uniqueID = uniqueID;
	}
	public String getValue() {
		return value;
	}
	public void setValue(String value) {
		this.value = value;
	}
}
