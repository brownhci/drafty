package drafty.models;

public class SurveyRename {
		
	private String idSurvey;
	private String idProfile;
	private String startTime;
	private String endTime;
	private String task1;
	private String task2;
	private String task3;
	private String firstName;
	private String lastName;
	private String email;
	private String age;
	private String occupation;
	private String subfieldPrimary;
	private String subfield2nd;
	private String subfield3rd;
	
	
	/**
	 * @param idSurvey
	 * @param idProfile
	 * @param startTime
	 * @param endTime
	 * @param task1
	 * @param task2
	 * @param task3
	 * @param firstName
	 * @param lastName
	 * @param email
	 * @param age
	 * @param occupation
	 * @param subfieldPrimary
	 * @param subfield2nd
	 * @param subfield3rd
	 */
	public SurveyRename(String idSurvey, String idProfile, String startTime, String endTime, String task1, String task2,
			String task3, String firstName, String lastName, String email, String age, String occupation,
			String subfieldPrimary, String subfield2nd, String subfield3rd) {
		super();
		this.idSurvey = idSurvey;
		this.idProfile = idProfile;
		this.startTime = startTime;
		this.endTime = endTime;
		this.task1 = task1;
		this.task2 = task2;
		this.task3 = task3;
		this.firstName = firstName;
		this.lastName = lastName;
		this.email = email;
		this.age = age;
		this.occupation = occupation;
		this.subfieldPrimary = subfieldPrimary;
		this.subfield2nd = subfield2nd;
		this.subfield3rd = subfield3rd;
	}
	
	
	public String getIdSurvey() {
		return idSurvey;
	}
	public void setIdSurvey(String idSurvey) {
		this.idSurvey = idSurvey;
	}
	public String getIdProfile() {
		return idProfile;
	}
	public void setIdProfile(String idProfile) {
		this.idProfile = idProfile;
	}
	public String getStartTime() {
		return startTime;
	}
	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}
	public String getEndTime() {
		return endTime;
	}
	public void setEndTime(String endTime) {
		this.endTime = endTime;
	}
	public String getTask1() {
		return task1;
	}
	public void setTask1(String task1) {
		this.task1 = task1;
	}
	public String getTask2() {
		return task2;
	}
	public void setTask2(String task2) {
		this.task2 = task2;
	}
	public String getTask3() {
		return task3;
	}
	public void setTask3(String task3) {
		this.task3 = task3;
	}
	public String getFirstName() {
		return firstName;
	}
	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}
	public String getLastName() {
		return lastName;
	}
	public void setLastName(String lastName) {
		this.lastName = lastName;
	}
	public String getEmail() {
		return email;
	}
	public void setEmail(String email) {
		this.email = email;
	}
	public String getAge() {
		return age;
	}
	public void setAge(String age) {
		this.age = age;
	}
	public String getOccupation() {
		return occupation;
	}
	public void setOccupation(String occupation) {
		this.occupation = occupation;
	}
	public String getSubfieldPrimary() {
		return subfieldPrimary;
	}
	public void setSubfieldPrimary(String subfieldPrimary) {
		this.subfieldPrimary = subfieldPrimary;
	}
	public String getSubfield2nd() {
		return subfield2nd;
	}
	public void setSubfield2nd(String subfield2nd) {
		this.subfield2nd = subfield2nd;
	}
	public String getSubfield3rd() {
		return subfield3rd;
	}
	public void setSubfield3rd(String subfield3rd) {
		this.subfield3rd = subfield3rd;
	}
}
