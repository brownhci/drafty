package com.ajobs.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.Map;
import java.util.Map.Entry;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.apache.commons.text.similarity.JaroWinklerDistance;
import org.apache.commons.text.similarity.LevenshteinDistance;

import com.ajobs.AjobsUI;
import com.ajobs.domain.Aliases;
import com.ajobs.domain.Suggestion;

public class AliasCorrectionService {
	
	private InteractionService intService = new InteractionService();
	private static final int threshold = 5;
	
	/*
	 * Finds similarity between two strings and returns the distance
	 */
	private int findLev(String left, String right) {
		int score = 0;
		try {
			score = LevenshteinDistance.getDefaultInstance().apply(left, right);
			System.out.println("Lev score of " + left + " and " + right +":" + score);
			// Set threshold so we can disregard the new one.
			if (score >= threshold) {
				score = -1;
			}

		} catch(IllegalArgumentException i){
			System.out.println("Please provide legal char sequence:" + i.getMessage());
			score = -1;
		} 
		
		return score;
	}
	
	/*
	 * Finds similarity between two strings and returns the distance
	 */
	private Double findJR(String left, String right) {
		Double score = 0.0;
		try {
			//score = LevenshteinDistance.getDefaultInstance().apply(left, right);
			
			JaroWinklerDistance distance = new JaroWinklerDistance();
			score = distance.apply(left, right);
			//System.out.println("JR score of " + left + " and " + right +":" + score);

		} catch(IllegalArgumentException i){
			System.out.println("Please provide legal char sequence:" + i.getMessage());
			score = -1.0;
		} 
		
		return score;
	}
	
	public void testAliasCorrectionService() {
		findLev("1","1");
		
		findLev("1","");
		findLev("12","1");
		findLev("123","1");
		findLev("1234","1");
		//
		findJR("1","1");
		
		findJR("1","");
		findJR("12","1");
		findJR("123","1");
		findJR("1234","1");
		//
		findLev("Brown","nowrB");
		findJR("Brown","nowrB");
		
		findJR("BrownBrown","BrownBrow");
		findJR("BrownBrownBrownBrown","BrownBrownBrownBrow");
		findJR("BrownBrownBrownBrown","BrownBroBrownBrown");
	}
	
	/*
	 *  Retrieves a Map of <sugID, linked list of all aliases for that sugID> from Aliases
	 *  
	 *  For same suggestionID, there could be multiple edits, in turn multiple alias IDs.
	 *  But we don't care about alias IDs, but actual aliases.
	 */
	private Map<Integer, LinkedList<String>> retrieveAliases(int idSuggestion) {
		Map<Integer, LinkedList<String>> sugIDAndAliases = new HashMap<Integer, LinkedList<String>>();
		
		for (Entry<Integer, Aliases> entry : AjobsUI.getApi().getAliases().entrySet()) {
			
			Integer suggID = entry.getValue().getIdSuggestion();
			String alias = entry.getValue().getAlias();
			
			LinkedList<String> values = null;
			
			if(suggID.equals(idSuggestion)) { 
				values = sugIDAndAliases.get(suggID); 
				if(values == null) {
					values = new LinkedList<String>();
				}
				
		        values.add(alias);
				sugIDAndAliases.put(suggID, values);
			}
    		}
		return sugIDAndAliases;
	}
	
	/*
	 * Retrieves the count for a particular alias and idSuggestion
	 */
	private Integer getAliasCount(Integer idSuggestion, String alias) {
		int count = 0;
		for(Entry<Integer, Aliases> e : AjobsUI.getApi().getAliases().entrySet()) {
			Aliases a = e.getValue();
			if(a.getAlias().equals(alias)) {
				count = a.getCount();
				break;
			}
		}
		return count;
	}
	
	/*
	 *  For all entries in sugIDAndAliases, finds the best match by comparing each alias with new suggestion 
	 *  Returns best matched suggestion.
	 */
	private String findBestMatch(Map<Integer, LinkedList<String>> sugIDAndAliases, String newSugg ) {
		
		//TODO logic is flawed here. This function will return whatever value from the alias table 
		//has a the best similarity score there is no threshold set; 
		//For example what if the first value entered was a bad value? 
		//We would then be changing a potentially more accurate value with a bad value
		
		String bestMatch = newSugg; //by default we assume the user has inputed the correct value
		//System.out.println("Actual suggestion:" + newSugg);
		
		for (Entry<Integer, LinkedList<String>> entry : sugIDAndAliases.entrySet()) {
			LinkedList<String> values = entry.getValue();

			Iterator<String> iter = values.iterator();
			int score = 9999; // Default maximum
			
	        while(iter.hasNext()){
	        		String toMatch = iter.next();
	        		// System.out.println("New suggestion toMatch:" + toMatch);
	            int scoreCalculated = findLev(newSugg, toMatch);
	            // System.out.println("Score calculated:" + scoreCalculated);
	            if(scoreCalculated < score && scoreCalculated != -1) {
	            		bestMatch = toMatch;
	            		score = scoreCalculated;
	            }
	        }
		}
		return bestMatch;
	}

	private String findBestMatch2(Map<Integer, LinkedList<String>> sugIDAndAliases, String newSugg ) {
		
		String bestMatch = newSugg; //by default we assume the user has inputed the correct value
		
		for (Entry<Integer, LinkedList<String>> entry : sugIDAndAliases.entrySet()) {
			for(String alias : entry.getValue()) {
				if(isSpellingFix(newSugg, alias)) {
					bestMatch = alias;
				}
			}
		}
		return bestMatch;
	}
	
	public Integer updateAliasesWithSuggestions(String oldSugg, String newSugg, Integer oldIdSuggestion, Integer idUniqueID, Integer idSuggestionType) {
		//if new is in alias table  -> increment new in alias
		//if new not in alias table -> insert new in alias
		updateAlias(oldSugg, oldIdSuggestion);
		
		if(isSpellingFix(newSugg, oldSugg)) { 
			updateSuggestionValue(newSugg, oldIdSuggestion); // update suggestion with best value
			return oldIdSuggestion; // was just a spelling mistake; which means old value was correct just misspelled
		} else {
			return insertSuggestion(newSugg, oldIdSuggestion, idUniqueID, idSuggestionType);
		}
	}
	
	private boolean isSpellingFix(String newSugg, String oldSugg) {
		if(findJR(newSugg, oldSugg) > 0.92) { //Jaro Winkler has a threshold that scales better for bigger words
			return true;
		} else {
			return false;
		}
	}
	
	public void updateAlias(String sugg, int IdSugg) {
	 	try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
    		PreparedStatement stmt = conn.prepareStatement(
    					"INSERT INTO Alias (idSuggestion, alias, count) VALUES(?, ?, 1) " + 
    					"ON DUPLICATE KEY UPDATE count = count + 1");
		) {
			stmt.setInt(1, IdSugg); 
			stmt.setString(2, sugg);
	    		
			stmt.executeUpdate();
		} catch (SQLException | NamingException e) {
			AjobsUI.getApi().logError(e);
	    }
	 	AjobsUI.getApi().refreshAliases();
	}
	
	private Integer insertSuggestion(String newSuggestion, Integer oldIdSuggestion, Integer idUniqueID, Integer idSuggestionType) {
		//System.out.println("AliasCorrectionService - INSERT INTO Suggestions");
		Integer newIdSuggestion = -1;
	 	try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
	 			PreparedStatement stmt =  conn.prepareStatement("INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) "
	 														  + "VALUES (NULL, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS);
	 			PreparedStatement stmtMaxConf =  conn.prepareStatement("SELECT *  FROM Suggestions WHERE idSuggestionType = ? AND idUniqueID = ? ORDER BY confidence DESC LIMIT 1");
	 		) {
	 		
	 		Suggestion oldSugg = AjobsUI.getApiNew().getSuggestionByIdSuggestion(oldIdSuggestion);
	 		Integer confidence = oldSugg.getConfidence() + 1;
	 		// idUniqueID, idEntryType, suggestion, confidence
			stmt.setInt(1, oldSugg.getIdSuggestionType()); 
			stmt.setInt(2, oldSugg.getIdUniqueID());
			stmt.setInt(3, AjobsUI.getApi().getProfileSession().getIdProfile());
			stmt.setString(4, newSuggestion.trim()); 
			stmt.setInt(5, confidence); 
			
			stmt.executeUpdate();
			ResultSet rs = stmt.getGeneratedKeys();
			while (rs.next()) { newIdSuggestion = rs.getInt(1); }
			
			/*
			Suggestion newSugg = new Suggestion(newIdSuggestion, oldSugg.getIdSuggestionType(), oldSugg.getIdUniqueID(),
												newSuggestion, confidence, AjobsUI.getApi().getProfileSession().getIdProfile());
			
			System.out.println("AliasCorrectionService - INSERT INTO Suggestions: old ID = " + oldIdSuggestion + ", new ID = " + newSugg.getIdSuggestion());
			System.out.println("AliasCorrectionService - INSERT INTO Suggestions: old Suggestion = " + AjobsUI.getApi().getSuggestions().get(oldIdSuggestion).getSuggestion());
			System.out.println("AliasCorrectionService - INSERT INTO Suggestions: new Suggestion = " + newSugg.getSuggestion());
			*/
		} catch (SQLException | NamingException e) {
			System.out.println("AliasCorrectionService (error) insertSuggestion = " + oldIdSuggestion);
			AjobsUI.getApi().logError(e);
	    }
	 	return newIdSuggestion;
	}
	
	public void updateSuggestionMaxConf(Integer idSuggestionChosen) {
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
	 			PreparedStatement stmtMaxConf = conn.prepareStatement("SELECT *  " + 
						"FROM (SELECT idUniqueID, idSuggestionType FROM Suggestions WHERE idSuggestion = ?) as s1 " + 
						"INNER JOIN Suggestions s2 ON s1.idUniqueID = s2.idUniqueID AND s1.idSuggestionType = s2.idSuggestionType " + 
						"ORDER BY confidence DESC LIMIT 1");
	 			PreparedStatement stmtUpdateMaxConf = conn.prepareStatement("UPDATE Suggestions SET confidence = ? WHERE idSuggestion = ? ") 
	 		) {
	 		
	 		// will update max confidence of selecting pre-existing edit
	 		stmtMaxConf.setInt(1, idSuggestionChosen);
			ResultSet rsMaxConf = stmtMaxConf.executeQuery();
			while(rsMaxConf.next()) {
				stmtUpdateMaxConf.setInt(1, rsMaxConf.getInt("confidence"));
				stmtUpdateMaxConf.setInt(2, idSuggestionChosen);
				stmtUpdateMaxConf.executeUpdate();
			}
		} catch (SQLException | NamingException e) {
			AjobsUI.getApi().logError(e);
	    }
	}
	
	private boolean updateSuggestionValue(String newSugg, int oldIdSuggestion) {
		boolean status = true;
	 	try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
	 			PreparedStatement stmt = conn.prepareStatement("UPDATE Suggestions SET suggestion = ? WHERE idSuggestion = ?;")
	 		) {
				stmt.setString(1, newSugg); 
				stmt.setInt(2, oldIdSuggestion);
		    		
				stmt.executeUpdate();
		} catch (SQLException | NamingException e) {
			AjobsUI.getApi().logError(e);
	    }
	 	return status;
	}	
}
