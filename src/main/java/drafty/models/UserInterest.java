package drafty.models;

import java.util.HashMap;

public class UserInterest {

	private HashMap<Integer, String> university = new HashMap<Integer, String>();
	private HashMap<Integer, String> joinYear = new HashMap<Integer, String>();
	private HashMap<Integer, String> rank = new HashMap<Integer, String>();
	private HashMap<Integer, String> subfield = new HashMap<Integer, String>();
	private HashMap<Integer, String> bachelors = new HashMap<Integer, String>();
	private HashMap<Integer, String> masters = new HashMap<Integer, String>();
	private HashMap<Integer, String> doctorate = new HashMap<Integer, String>();
	private HashMap<Integer, String> postdoc = new HashMap<Integer, String>();
	
	//probably not as useful 
	private HashMap<Integer, String> gender = new HashMap<Integer, String>();
	private HashMap<Integer, String> photoUrl = new HashMap<Integer, String>();
	private HashMap<Integer, String> sources = new HashMap<Integer, String>();
	
	
	
	public UserInterest(HashMap<Integer, String> university, HashMap<Integer, String> joinYear,
			HashMap<Integer, String> rank, HashMap<Integer, String> subfield, HashMap<Integer, String> bachelors,
			HashMap<Integer, String> masters, HashMap<Integer, String> doctorate, HashMap<Integer, String> postdoc,
			HashMap<Integer, String> gender, HashMap<Integer, String> photoUrl, HashMap<Integer, String> sources) {
		super();
		this.university = university;
		this.joinYear = joinYear;
		this.rank = rank;
		this.subfield = subfield;
		this.bachelors = bachelors;
		this.masters = masters;
		this.doctorate = doctorate;
		this.postdoc = postdoc;
		this.gender = gender;
		this.photoUrl = photoUrl;
		this.sources = sources;
	}

	
	public HashMap<Integer, String> getUniversity() {
		return university;
	}

	public void setUniversity(HashMap<Integer, String> university) {
		this.university = university;
	}

	public HashMap<Integer, String> getJoinYear() {
		return joinYear;
	}

	public void setJoinYear(HashMap<Integer, String> joinYear) {
		this.joinYear = joinYear;
	}

	public HashMap<Integer, String> getRank() {
		return rank;
	}

	public void setRank(HashMap<Integer, String> rank) {
		this.rank = rank;
	}

	public HashMap<Integer, String> getSubfield() {
		return subfield;
	}

	public void setSubfield(HashMap<Integer, String> subfield) {
		this.subfield = subfield;
	}

	public HashMap<Integer, String> getBachelors() {
		return bachelors;
	}

	public void setBachelors(HashMap<Integer, String> bachelors) {
		this.bachelors = bachelors;
	}

	public HashMap<Integer, String> getMasters() {
		return masters;
	}

	public void setMasters(HashMap<Integer, String> masters) {
		this.masters = masters;
	}

	public HashMap<Integer, String> getDoctorate() {
		return doctorate;
	}

	public void setDoctorate(HashMap<Integer, String> doctorate) {
		this.doctorate = doctorate;
	}

	public HashMap<Integer, String> getPostdoc() {
		return postdoc;
	}

	public void setPostdoc(HashMap<Integer, String> postdoc) {
		this.postdoc = postdoc;
	}

	public HashMap<Integer, String> getGender() {
		return gender;
	}

	public void setGender(HashMap<Integer, String> gender) {
		this.gender = gender;
	}

	public HashMap<Integer, String> getPhotoUrl() {
		return photoUrl;
	}

	public void setPhotoUrl(HashMap<Integer, String> photoUrl) {
		this.photoUrl = photoUrl;
	}

	public HashMap<Integer, String> getSources() {
		return sources;
	}

	public void setSources(HashMap<Integer, String> sources) {
		this.sources = sources;
	}
}
