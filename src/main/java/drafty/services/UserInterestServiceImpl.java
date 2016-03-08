package drafty.services;

public interface UserInterestServiceImpl {

	
	/*
	 * 
	 * generate user interest scores
	 * 
	 */
	public void genUserInterest(String user_id);
	
	
	/*
	 * 
	 * generate individual user interest scores
	 * 
	 */
	public void genUserIntUni(String user_id);
	
	public void genUserIntJoinYear(String user_id);
	
	public void genUserIntRank(String user_id);
	
	public void genUserIntSubfield(String user_id);
	
	public void genUserIntBach(String user_id);
	
	public void genUserIntMast(String user_id);
	
	public void genUserIntDoct(String user_id);
	
	public void genUserIntPostDoc(String user_id);
	
	public void genUserIntGender(String user_id);
	
	public void genUserIntPhotoUrl(String user_id);
	
	public void genUserIntSources(String user_id);
}
