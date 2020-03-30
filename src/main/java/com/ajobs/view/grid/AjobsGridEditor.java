package com.ajobs.view.grid;

import com.vaadin.ui.ComboBox;
import com.vaadin.ui.Component;
import com.vaadin.ui.TextField;

public class AjobsGridEditor {
	private ComboBox<String> myStatusEditField = new ComboBox<>();
	private ComboBox<String> universityEditField = new ComboBox<>();
	private ComboBox<String> fieldEditField = new ComboBox<>();
	//private ComboBox<String> classificationEditField = new ComboBox<>();
	private ComboBox<String> subfieldEditField = new ComboBox<>();
	private ComboBox<String> positionTypeEditField = new ComboBox<>();
	private ComboBox<String> positionStatusEditField = new ComboBox<>();
	private TextField deadlineEditField = new TextField();
	private TextField myNotesEditField = new TextField();
	private TextField linkToApplyEditField = new TextField();
	private TextField whoIsInterviewingEditField = new TextField();
	//private TextField createdByEditField = new TextField(); //auto-generated
	private TextField searchChairEditField = new TextField();
	private TextField searchEmailEditField = new TextField();
	
	public AjobsGridEditor() {
		myStatusEditField.setId("14");
		universityEditField.setId("1");
		fieldEditField.setId("2");
		//classificationEditField.setId("3");
		subfieldEditField.setId("6");
		positionTypeEditField.setId("5");
		positionStatusEditField.setId("4");
		deadlineEditField.setId("7");
		myNotesEditField.setId("11");
		linkToApplyEditField.setId("8");
		whoIsInterviewingEditField.setId("12");
		//createdByEditField.setId("13");
		searchChairEditField.setId("9");
		searchEmailEditField.setId("10");		
	}
	
	public Component getComponent(Integer idSuggestionType) {
		if(idSuggestionType == 14) {
			return myStatusEditField;
		} else if(idSuggestionType == 1) {
			return universityEditField;
		} else if(idSuggestionType == 2) {
			return fieldEditField;
		} else if(idSuggestionType == 3) {
			//return classificationEditField;
		} else if(idSuggestionType == 6) {
			return subfieldEditField;
		} else if(idSuggestionType == 5) {
			return positionTypeEditField;
		} else if(idSuggestionType == 4) {
			return positionStatusEditField;
		} else if(idSuggestionType == 7) {
			return deadlineEditField;
		} else if(idSuggestionType == 11) {
			return myNotesEditField;
		} else if(idSuggestionType == 8) {
			return linkToApplyEditField;
		} else if(idSuggestionType == 12) {
			return whoIsInterviewingEditField;
		} else if(idSuggestionType == 13) {
			//return createdByEditField;
		} else if(idSuggestionType == 9) {
			return searchChairEditField;
		} else if(idSuggestionType == 10) {
			return searchEmailEditField;
		}
		return null;
	}
	
	public ComboBox<String> getMyStatusEditField() {
		return myStatusEditField;
	}
	public void setMyStatusEditField(ComboBox<String> myStatusEditField) {
		this.myStatusEditField = myStatusEditField;
	}
	public ComboBox<String> getUniversityEditField() {
		return universityEditField;
	}
	public void setUniversityEditField(ComboBox<String> universityEditField) {
		this.universityEditField = universityEditField;
	}
	public ComboBox<String> getFieldEditField() {
		return fieldEditField;
	}
	public void setFieldEditField(ComboBox<String> fieldEditField) {
		this.fieldEditField = fieldEditField;
	}
	public ComboBox<String> getSubfieldEditField() {
		return subfieldEditField;
	}
	public void setSubfieldEditField(ComboBox<String> subfieldEditField) {
		this.subfieldEditField = subfieldEditField;
	}
	public ComboBox<String> getPositionTypeEditField() {
		return positionTypeEditField;
	}
	public void setPositionTypeEditField(ComboBox<String> positionTypeEditField) {
		this.positionTypeEditField = positionTypeEditField;
	}
	public ComboBox<String> getPositionStatusEditField() {
		return positionStatusEditField;
	}
	public void setPositionStatusEditField(ComboBox<String> positionStatusEditField) {
		this.positionStatusEditField = positionStatusEditField;
	}
	public TextField getDeadlineEditField() {
		return deadlineEditField;
	}
	public void setDeadlineEditField(TextField deadlineEditField) {
		this.deadlineEditField = deadlineEditField;
	}
	public TextField getMyNotesEditField() {
		return myNotesEditField;
	}
	public void setMyNotesEditField(TextField myNotesEditField) {
		this.myNotesEditField = myNotesEditField;
	}
	public TextField getLinkToApplyEditField() {
		return linkToApplyEditField;
	}
	public void setLinkToApplyEditField(TextField linkToApplyEditField) {
		this.linkToApplyEditField = linkToApplyEditField;
	}
	public TextField getWhoIsInterviewingEditField() {
		return whoIsInterviewingEditField;
	}
	public void setWhoIsInterviewingEditField(TextField whoIsInterviewingEditField) {
		this.whoIsInterviewingEditField = whoIsInterviewingEditField;
	}
	public TextField getSearchChairEditField() {
		return searchChairEditField;
	}
	public void setSearchChairEditField(TextField searchChairEditField) {
		this.searchChairEditField = searchChairEditField;
	}
	public TextField getSearchEmailEditField() {
		return searchEmailEditField;
	}
	public void setSearchEmailEditField(TextField searchEmailEditField) {
		this.searchEmailEditField = searchEmailEditField;
	}
}
