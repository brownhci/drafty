package drafty.models;

public class ProfNameUni {
	
	private String name;
	private String university;
	
	public ProfNameUni(String name, String uni) {
		this.name = name;
		this.university = uni;
	}
	
	public String getName() {
		return name;
	}
	public void setName(String name) {
		this.name = name;
	}
	public String getUniversity() {
		return university;
	}
	public void setUniversity(String university) {
		this.university = university;
	}
	
}
