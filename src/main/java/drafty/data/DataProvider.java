package drafty.data;

import java.sql.SQLException;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;

import drafty.models.DraftyNotification;

/**
 * Drafty Global backend API.
 */
public interface DataProvider {

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
	String getIdSuggestion(String person_id, String value, String column) throws SQLException;
	
	/**
     * @return clean university name of - USA, - Canada, (USA), (Canada)
     */
	String cleanUniversityName(String name);
}

