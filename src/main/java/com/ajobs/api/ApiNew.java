package com.ajobs.api;

import java.util.HashMap;
import java.util.Set;

import com.ajobs.domain.Suggestion;
import com.ajobs.domain.SuggestionType;
import com.ajobs.domain.Url.Dataset;
import com.ajobs.domain.Users;
import com.ajobs.util.Messages;

public interface ApiNew {

	/**
     * @return JNDI name for Wildfly DataSource
     */
	String getJNDI();
	
	/**
     * @return Initialize Data Models
     */
	void initDataModels();
	
	/**
     * @return data sources
     */
	HashMap<Integer, Set<String>>  getIdSuggestionType_Values();
	HashMap<Integer, SuggestionType> getIdSuggestionType_SuggestionType();
	HashMap<Integer, Users> getIdUser_Users();
	
	/**
     * prints verbose error
     */
	void logError(Exception e);
	
	/**
     * @return class containing system messages
     */
	Messages getMessages();
	
	/**
	 * @return boolean - checks if string is null
	 */
	boolean isStringNull(String str);
	
	/**
	 * @return Suggestion
	 */
	Suggestion getSuggestionByIdSuggestion(Integer idSuggestion);

	/**
	 * @return Dataset
	 */
	Dataset getDataset();
}
