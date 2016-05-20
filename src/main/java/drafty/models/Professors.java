package drafty.models;

import java.util.ArrayList;
import java.util.HashMap;

public class Professors {
	
	private HashMap<Integer, ArrayList<String>> hm;
	private int _maxID;
	
	public Professors() {
		hm = new HashMap<Integer, ArrayList<String>>();
		_maxID = 0;
	}
		
	public void newProf(String profID, ArrayList<String> entryList) {
		int intID = Integer.parseInt(profID);
		hm.put(intID, entryList);
		if (intID > _maxID) {
			_maxID = intID;
		}
	}
	
	public HashMap<Integer, ArrayList<String>> getHM() {
		return hm;
	}
	
	public int getMaxProf() {
		return _maxID;
	}
	
	public boolean profExists(Integer profID) {
		return hm.containsKey(profID);
	}
	
	public String getProfName(Integer profID) {
		return hm.get(profID).get(1);
	}
	
	public String getProfUni(Integer profID) {
		return hm.get(profID).get(2);
	}
	
	public String getProfBach(Integer profID) {
		return hm.get(profID).get(3);
	}
	
	public String getProfMast(Integer profID) {
		return hm.get(profID).get(4);
	}
	
	public String getProfDoct(Integer profID) {
		return hm.get(profID).get(5);
	}
	
	public String getProfPostDoc(Integer profID) {
		return hm.get(profID).get(6);
	}
	
	public String getProfJoinYear(Integer profID) {
		return hm.get(profID).get(7);
	}
	
	public String getProfRank(Integer profID) {
		return hm.get(profID).get(8);
	}
	
	public String getProfField(Integer profID) {
		return hm.get(profID).get(9);
	}
	
	public String getProfGender(Integer profID) {
		return hm.get(profID).get(10);
	}
	
	public String getProfPhotoURL(Integer profID) {
		return hm.get(profID).get(11);
	}
	
	public String getProfSources(Integer profID) {
		return hm.get(profID).get(12);
	}
	
}
