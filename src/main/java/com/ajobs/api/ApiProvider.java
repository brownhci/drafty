package com.ajobs.api;

import java.sql.PreparedStatement;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;

import com.ajobs.domain.Aliases;
import com.ajobs.domain.CellKey;
import com.ajobs.domain.Profile;
import com.ajobs.domain.Suggestion;
import com.ajobs.domain.SuggestionType;
import com.ajobs.domain.Users;

/**
 * Ajobs backend API.
 */
public interface ApiProvider {
	
	/**
     * @return JNDI name for Wildfly DataSource
     */
    String getJNDI();
    
    /**
     * @return Prints error to main log 
     */
    void logError(Exception e);
    
    /**
     * @param userName
     * @param password
     * @return Authenticated used.
     */
    void insertSession();
    void updateSession();
    void endSession();
    boolean authenticate(String userName, String password);
    String hashPassword(String password);
    boolean signUp(String username, String email, String password);
    
    /**
     * @return data layers
     */
    
    Profile getProfileSession();
    void setProfileSession(Profile profile);
    
    void refreshUsers();
    void refreshAliases();
    
    HashMap<Integer, String> getEntryType();
    void setEntryType(HashMap<Integer, String> entryType);
	
    HashMap<Integer, String> getInteractionType();
	void setInteractionType(HashMap<Integer, String> interactionType);
	
	HashMap<Integer, Users> getUsers();
	void setUsers(HashMap<Integer, Users> users);
	
	/**
     * @return Deletes from DB
     */
	boolean deleteFromDB(String tableName, String idName, String id);
	
	/**
     * @return Welcome Message
     */
	void welcomeMessage();
	
	/**
     * @return DB Error Message
     */
	void dbErrorMessage();

	PreparedStatement getConnStmt(String sql);

	HashMap<Integer, Aliases> getAliases();
	
	void updateEditedProfileInDB(Profile editedProfile);

	/**
	 * @return if String is null
	 */
	boolean isStringNull(String str);
}
