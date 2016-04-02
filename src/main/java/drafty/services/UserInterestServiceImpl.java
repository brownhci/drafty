package drafty.services;

import java.util.HashMap;
import java.util.List;

public interface UserInterestServiceImpl {
	
	/*
	 * 
	 * generate user interest scores
	 * 
	 */
	public void genUserInterest(String user_id);
	
	public void genUserIntCols(String user_id);
	
	public void genUserIntRow(String user_id);
	
	public void genUserInt(String user_id, HashMap<String, Integer> hm, String suggType);
	
	public void addToHM(HashMap<String, Integer> hm, List<String> list, int weight);
	
	public void addToPQ(List<String> list, HashMap<String, Integer> hm);
	
	public List<String> getClickCol(String user_id, String dclick);
	
	public List<String> getSuggCol(String user_id, String val);
	
	public List<String> getFilterCol(String user_id, String val);
	
	public List<String> getClickRow(String user_id, String dclick);
	
	public List<String> getSuggRow(String user_id, String val);
	
	public List<String> getClickTypes(String user_id, String dclick, String sugg_id);
	
	public List<String> getSuggTypes(String user_id, String sugg_id, String val);
	
	public List<String> getFilterTypes(String user_id, String bfilter, String sugg_id);
	
}
