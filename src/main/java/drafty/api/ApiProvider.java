package drafty.api;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import drafty.models.CellSelection;
import drafty.models.DraftyNotification;
import drafty.models.Professors;
import drafty.models.Profile;
import drafty.services.UserInterestService;

/**
 * Drafty Global backend API.
 */
public interface ApiProvider {

    /**
     * @return The number of unread notifications for the current user.
     */
    int getUnreadNotificationsCount();

    /**
     * @return Notifications for the current user.
     */
    Collection<DraftyNotification> getNotifications();

    /**
     * @return JNDI for JDBC
     */
	String getJNDI();
	
	/**
     * @return only Universities from USA + Can
     */
	List<String> getUniversitiesUSACan();
	
	/**
     * @return all Universities
     */
	List<String> getUniversities();
	
	/**
     * @return all subfields
     */
	List<String> getSubfields();
	
	/**
	 * @return domains and associated university names
	 */
	HashMap<String,String> getDomains();
	
	/**
     * @return idSuggestion, limit 1, returns w/ highest conf level; protects against duplicates from old data import
	 * @throws SQLException 
     */
	String getIdSuggestion(String person_id, String value, String column);
	
	/**
     * @return clean university name of - USA, - Canada, (USA), (Canada)
     */
	String cleanUniversityName(String name);
	
	/**
	 * @return User Interest Service / Additive Model 
	 */
	UserInterestService getUIService();
	void setUIService();
	
	/**
	 * @return List of Professors  
	 */
	Professors getProfessors();
	
	/**
	 * @return Profile 
	 */
	Profile getProfile();
	
	/**
	 * @return CellSelection 
	 */
	CellSelection getCellSelection();
	
	/**
	 * @return connection and statement
	 */
	PreparedStatement getConnStmt(String sql);

	/**
	 * @return counts the number of interactions
	 */
	int getInteractionCount();
	void setInteractionCount(int interactionCount);
	int getInteractionScore();
	void setInteractionScore(int interactionScore);
	int getInteractionCountTot();
	void setInteractionCountTot(int interactionCountTot);
	void incrementInteractionCountTot();
	int getInteractionScoreTot();
	void setInteractionScoreTot(int interactionScoreTot);
	void incrementInteractionScoreTot(int score);	
	
	/**
	 * @return profileId
	 */
	void setIdProfile(String idProfile);
	String getIdProfile();

	/**
	 * @return random number in given range
	 */
	int getRandom(int min, int max);

	int getIntAsk();
	void resetIntAsk();	
}

