package drafty.models;

public class CellSelection {

	private String person_id;
	private String person_name;
	private String person_university;
	private String origSuggestion;
	private String origSuggestionId;
	private String origSuggestionTypeId;
	private String rowValues;
	
	/**
	 * @param person_id
	 * @param person_name
	 * @param origSuggestion
	 * @param origSuggestionId
	 * @param origSuggestionType
	 * @param rowValues 
	 */
	public void setCellSelection(String person_id, String person_name, String person_university, String origSuggestion, String origSuggestionId, String origSuggestionType, String rowValues) {
		this.person_id = person_id;
		this.person_name = person_name;
		this.person_university = person_university;
		this.origSuggestion = origSuggestion;
		this.origSuggestionId = origSuggestionId;
		this.origSuggestionTypeId = origSuggestionType;
		this.rowValues = rowValues;
		
		System.out.println("CS: idSuggestion = " + origSuggestionId + " - " + origSuggestion);
		System.out.println("CS: idPerson = " + person_id + " - " + person_name);
	}


	public String getPerson_id() {
		return person_id;
	}


	public void setPerson_id(String person_id) {
		this.person_id = person_id;
	}


	public String getPerson_name() {
		return person_name;
	}


	public void setPerson_name(String person_name) {
		this.person_name = person_name;
	}

	
	public String getPerson_university() {
		return person_university;
	}

	public void setPerson_university(String person_university) {
		this.person_university = person_university;
	}


	public String getOrigSuggestion() {
		return origSuggestion;
	}


	public void setOrigSuggestion(String origSuggestion) {
		this.origSuggestion = origSuggestion;
	}


	public String getOrigSuggestionId() {
		return origSuggestionId;
	}


	public void setOrigSuggestionId(String origSuggestionId) {
		this.origSuggestionId = origSuggestionId;
	}


	public String getOrigSuggestionTypeId() {
		return origSuggestionTypeId;
	}


	public void setOrigSuggestionTypeId(String origSuggestionTypeId) {
		this.origSuggestionTypeId = origSuggestionTypeId;
	}


	public String getRowValues() {
		return rowValues;
	}


	public void setRowValues(String rowValues) {
		this.rowValues = rowValues;
	}
}
