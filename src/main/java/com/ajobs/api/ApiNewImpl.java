package com.ajobs.api;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Set;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.ajobs.domain.Suggestion;
import com.ajobs.domain.SuggestionType;
import com.ajobs.domain.Url;
import com.ajobs.domain.Url.Dataset;
import com.ajobs.domain.Users;
import com.ajobs.util.Messages;
import com.vaadin.server.VaadinSession;

public class ApiNewImpl implements ApiNew {
	
	public ApiNewImpl() {
		initDataModels();
	}
	
	private String jndi = getJNDI();
	
	//Master Map of Suggestions
	//idSuggestion -> Suggestions
	private Integer countSuggestions = 0;
	private HashMap<Integer, Suggestion> idSugestion_Suggestion = new HashMap<Integer, Suggestion>(countSuggestions); 

	//Filtered/Sorted Values <- idUniqueID returned from DB, quickest to leverage DB
	
	//Spreadsheet datasource
	//idUniqueID -> idSuggestionType -> idSuggestion
	//private Integer countRows = 0;
	//private HashMap<Integer, HashMap<Integer, Integer>> idUniqueID_idSuggestionType_Suggestion = new HashMap<Integer, HashMap<Integer, Integer>>(countRows); 
	
	//All suggestions for a particular cell
	//idUniqueId -> idSuggestionType -> idSuggestion
	//private HashMap<Integer, HashMap<Integer, List<Integer>>> idUniqueId_idSuggestionType_ListIdSuggestion = new HashMap<Integer, HashMap<Integer, List<Integer>>>(countRows); 
	
	//Master Map of SuggestionsTypeValues
	private Integer countSuggestionTypeValues = 0;
	private HashMap<Integer, Set<String>> idSuggestionType_Values = new HashMap<Integer, Set<String>>(countSuggestionTypeValues);
	public HashMap<Integer, Set<String>> getIdSuggestionType_Values() {
		return idSuggestionType_Values;
	}
	
	//Master Map of SuggestionsType
	private Integer countSuggestionType = 0;
	private HashMap<Integer, SuggestionType> idSuggestionType_SuggestionType = new HashMap<Integer, SuggestionType>(countSuggestionType);
	public HashMap<Integer, SuggestionType> getIdSuggestionType_SuggestionType() {
		return idSuggestionType_SuggestionType;
	}
	
	//Profiles / Users
	Integer countProfiles = 0;
	private HashMap<Integer, Users> users = new HashMap<Integer, Users>(countProfiles); //idProfile, Users
	public HashMap<Integer, Users> getIdUser_Users() {
		return users;
	}

	// Messages
	private Messages msg = new Messages();
	public Messages getMessages() { return msg; };
	
	@Override
	public String getJNDI() {
		Url urlSession = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
    	return urlSession.getDataset().getJNDI();
	}
	
	@Override
	public Dataset getDataset() {
		Url urlSession = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
    	return urlSession.getDataset();
	}
	
	@Override
	public void logError(Exception e) {
		System.out.println("********** LOGGED ERROR START");
		System.out.println("Error Message: " + e.getMessage() + " |");
		System.out.println("Stack Trace: ");
		e.printStackTrace();
		System.out.println("********** LOGGED ERROR END");
		msg.errorMessage();
	}
	
	public void initDataModels() {
		populateDataModels();
	}
	
	private void populateDataModels() {
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
				PreparedStatement stmtCountProfiles = conn.prepareStatement("SELECT count(*) as ct FROM Profile ");
				PreparedStatement stmtCountRows = conn.prepareStatement("SELECT count(*) as ct FROM UniqueId ");
				PreparedStatement stmtCountSuggs = conn.prepareStatement("SELECT count(*) as ct FROM Suggestions ");
				PreparedStatement stmtCountSuggType = conn.prepareStatement("SELECT count(*) as ct FROM SuggestionType ");
				PreparedStatement stmtCountSuggTypeValues = conn.prepareStatement("SELECT count(*) as ct FROM SuggestionTypeValues");
				PreparedStatement stmtProfiles = conn.prepareStatement("SELECT * FROM Profile ");
				PreparedStatement stmtSuggs = conn.prepareStatement("SELECT * FROM Suggestions ORDER BY idUniqueID, idSuggestionType, confidence desc ");
				PreparedStatement stmtSuggestionType = conn.prepareStatement("SELECT * FROM SuggestionType");
				PreparedStatement stmtSuggestionTypeValues = conn.prepareStatement("SELECT * FROM SuggestionTypeValues");
				PreparedStatement stmtUsers = conn.prepareStatement("SELECT * FROM Profile ");
			) {
				ResultSet rsCountRows = stmtCountRows.executeQuery();
				while(rsCountRows.next()) {
					//countRows = rsCountRows.getInt("ct");
				}
				ResultSet rsCountSuggs = stmtCountSuggs.executeQuery();
				while(rsCountSuggs.next()) {
					countSuggestions = rsCountSuggs.getInt("ct");
				}
				ResultSet rsCountSuggType = stmtCountSuggType.executeQuery();
				while(rsCountSuggType.next()) {
					countSuggestionType = rsCountSuggType.getInt("ct");
				}
				ResultSet rsCountSuggTypeValues = stmtCountSuggTypeValues.executeQuery();
				while(rsCountSuggTypeValues.next()) {
					countSuggestionTypeValues = rsCountSuggTypeValues.getInt("ct");
				}
				ResultSet rsCountProfiles = stmtCountProfiles.executeQuery();
				while(rsCountProfiles.next()) {
					countProfiles = rsCountProfiles.getInt("ct");
				}
				
				//helps improve performance
				idSugestion_Suggestion = new HashMap<Integer, Suggestion>(countSuggestions);
				users = new HashMap<Integer, Users>(countProfiles);
				
				//Populate Models
				
				Integer oldIdUniqueID = -1;
				Integer oldIdSuggestionType = -1;
				ResultSet rsSuggs = stmtSuggs.executeQuery();
				while(rsSuggs.next()) {
					Integer idSuggestion = rsSuggs.getInt("idSuggestion");
					Integer idUniqueID = rsSuggs.getInt("idUniqueID");
					Integer idSuggestionType = rsSuggs.getInt("idSuggestionType");
					String  suggestion = rsSuggs.getString("suggestion");
					Integer confidence = rsSuggs.getInt("confidence");
					Integer idProfile = rsSuggs.getInt("idProfile");

					Suggestion sugg = new Suggestion(idSuggestion, idSuggestionType, idUniqueID, suggestion, confidence, idProfile);
					idSugestion_Suggestion.put(idSuggestion, sugg);
				}
				
				ResultSet rsSuggType = stmtSuggestionType.executeQuery();
				while(rsSuggType.next()) {
					Integer idSuggestionType = rsSuggType.getInt("idSuggestionType");
					SuggestionType suggType = new SuggestionType(
							rsSuggType.getInt("idSuggestionType"), rsSuggType.getInt("idDataType"), rsSuggType.getString("name"), intToBool(rsSuggType.getInt("isActive")),
							intToBool(rsSuggType.getInt("makesRowUnique")), intToBool(rsSuggType.getInt("canBeBlank")), intToBool(rsSuggType.getInt("isDate")), 
							intToBool(rsSuggType.getInt("isLink")), intToBool(rsSuggType.getInt("isCurrency")),  intToBool(rsSuggType.getInt("isEditable")), 
							intToBool(rsSuggType.getInt("isPrivate")), rsSuggType.getInt("columnOrder")
						);
					idSuggestionType_SuggestionType.put(idSuggestionType, suggType);
				}
				
				ResultSet rsSuggTypeValues = stmtSuggestionTypeValues.executeQuery();
				while(rsSuggTypeValues.next()) {
					Integer idSuggestionType = rsSuggTypeValues.getInt("idSuggestionType");
					String suggestion = rsSuggTypeValues.getString("value");
					
					if(idSuggestionType_Values.containsKey(idSuggestionType)) {
						idSuggestionType_Values.get(idSuggestionType).add(suggestion);
					} else {
						Set<String> suggs = new HashSet<String>();
						suggs.add(suggestion);
						idSuggestionType_Values.put(idSuggestionType, suggs);
					}
				}
				
				ResultSet rsUsers = stmtUsers.executeQuery();
				while(rsUsers.next()) {
					//String username, String email, Integer editsNew, Integer edits, Integer spellingFixes
					Integer idProfile = rsUsers.getInt("idProfile");
					String username = rsUsers.getString("username");
					String email = rsUsers.getString("email");
					Integer editsNew = 0;
					Integer edits = 0; 
					Integer spellingFixes = 0;
					Users user = new Users(username, email, editsNew, edits, spellingFixes);
					users.put(idProfile, user);
				}
			} catch (SQLException | NamingException e) {
		        logError(e);
		    }
	}
	
	@Override
	public Suggestion getSuggestionByIdSuggestion(Integer idSuggestion) {
		Suggestion suggestion = null; 
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
				PreparedStatement stmt = conn.prepareStatement("SELECT *, count(*) as ct FROM Suggestions WHERE idSuggestion = ? ");
			) {
				stmt.setInt(1, idSuggestion);
				ResultSet rs = stmt.executeQuery();
				while(rs.next()) {
					if(rs.getInt("ct") == 1) {
						Integer idSuggestionType = rs.getInt("idSuggestionType");
						Integer idUniqueID = rs.getInt("idUniqueID");
						String  suggestionValue = rs.getString("suggestion");
						Integer confidence = rs.getInt("confidence");
						Integer idProfile = rs.getInt("idProfile");
						suggestion = new Suggestion(idSuggestion, idSuggestionType, idUniqueID, suggestionValue, confidence, idProfile);
					}
				}
			} catch (SQLException | NamingException e) {
		        logError(e);
		    }
		return suggestion;
	}
	
	private boolean intToBool(Integer num) {
		if(num == 1) {
			return true;
		} else {
			return false;
		}
	}
	
	@Override
	public boolean isStringNull(String str) {
		if(str != null && !str.isEmpty()) { 
			return false;
		} else {
			return true;
		}
	}
}