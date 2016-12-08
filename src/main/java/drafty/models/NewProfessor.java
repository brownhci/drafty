package drafty.models;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;

public class NewProfessor {
	
	
	private String person_id;
	
	@NotNull(message = "First Name is required")
	private String first_name = "";
	
	@NotNull(message = "Last Name is required")
	private String last_name = "";
	
	@NotNull(message = "University is required")
	private String university = "";
	
	@NotNull(message = "Join Year for University is required")
	@Size(min = 4, max = 4, message = "Must be 4 characters")
	private String join_year = "";
	
	@NotNull(message = "First Name is required")
	private String rank = "";
	
	private String subfield = "";
	
	private String bachelors = "";
	
	private String masters = "";
	
	private String doctorate = "";
	
	private String postdoc = "";
	
	private String gender = "";
	
	private String photoURL = "";
	
	private String source = "";
	
	public String getFullName() {
		return first_name + " " + last_name; 
	}
	public String getPerson_id() {
		return person_id;
	}
	public void setPerson_id(String person_id) {
		this.person_id = person_id;
	}
	public String getFirst_name() {
		return first_name;
	}
	public void setFirst_name(String first_name) {
		this.first_name = first_name;
	}
	public String getLast_name() {
		return last_name;
	}
	public void setLast_name(String last_name) {
		this.last_name = last_name;
	}
	public String getUniversity() {
		return university;
	}
	public void setUniversity(String university) {
		this.university = university;
	}
	public String getJoin_year() {
		return join_year;
	}
	public void setJoin_year(String join_year) {
		this.join_year = join_year;
	}
	public String getRank() {
		return rank;
	}
	public void setRank(String rank) {
		this.rank = rank;
	}
	public String getSubfield() {
		return subfield;
	}
	public void setSubfield(String subfield) {
		this.subfield = subfield;
	}
	public String getBachelors() {
		return bachelors;
	}
	public void setBachelors(String bachelors) {
		this.bachelors = bachelors;
	}
	public String getMasters() {
		return masters;
	}
	public void setMasters(String masters) {
		this.masters = masters;
	}
	public String getDoctorate() {
		return doctorate;
	}
	public void setDoctorate(String doctorate) {
		this.doctorate = doctorate;
	}
	public String getPostdoc() {
		return postdoc;
	}
	public void setPostdoc(String postdoc) {
		this.postdoc = postdoc;
	}
	public String getGender() {
		return gender;
	}
	public void setGender(String gender) {
		this.gender = gender;
	}
	public String getPhotoURL() {
		return photoURL;
	}
	public void setPhotoURL(String photoURL) {
		this.photoURL = photoURL;
	}
	public String getSource() {
		return source;
	}
	public void setSource(String source) {
		this.source = source;
	}
}
