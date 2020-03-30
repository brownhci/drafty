package com.ajobs.view.grid;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.ajobs.AjobsUI;
import com.ajobs.domain.Edit;
import com.ajobs.domain.SuggestionType;
import com.ajobs.services.AliasCorrectionService;
import com.ajobs.services.InteractionService;
import com.vaadin.data.provider.ListDataProvider;

public class GridService {

	private AliasCorrectionService aliasCorrService = new AliasCorrectionService();
	private InteractionService interactionService = new InteractionService();
	private String blank = "[Blank]";
	//private String selectSuggestions = "SELECT * FROM Suggestions ORDER BY idUniqueID, idSuggestionType, confidence desc";
	
	private String selectSuggestionsAjobs = 
			"SELECT * " + 
			"FROM Suggestions " + 
			"WHERE idProfile = 2 " + 
			"OR (idSuggestionType = 11 AND idProfile = ?) " + 
			"OR (idSuggestionType = 14 AND idProfile = ?) " + 
			"OR (idSuggestionType != 11 AND idSuggestionType != 14) " +
			"AND active = 1 " +
			"ORDER BY idUniqueID, idSuggestionType, confidence desc";
	
	private String selectSuggestionsProfs = "SELECT * " + 
			"FROM Suggestions WHERE active = 1 ORDER BY idUniqueID, idSuggestionType, confidence desc";
	
	public ListDataProvider<Ajobs> generateAjobsDataProvider() {
		List<Ajobs> datasource = new ArrayList<Ajobs>();
		
		// SELECT * FROM Suggestions ORDER BY idUniqueID, idSuggestionType, confidence desc
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
			 PreparedStatement stmt = conn.prepareStatement(selectSuggestionsAjobs)
			) {
				Integer idProfile = AjobsUI.getApi().getProfileSession().getIdProfile();
				stmt.setInt(1, idProfile);
				stmt.setInt(2, idProfile);
				ResultSet rs = stmt.executeQuery();
				
				Ajobs row = new Ajobs();
				Integer oldIdUniqueID = -1; //just to start
				Integer oldIdSuggestionType = -1;
				while(rs.next()) {
					Integer idProfileFromSugg = rs.getInt("idProfile");
					Integer idSuggestionType = rs.getInt("idSuggestionType");
					boolean isPrivate = AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType).getIsPrivate();
					if(!isPrivate || (isPrivate && idProfile.equals(idProfileFromSugg))) {
						Integer idUniqueID = rs.getInt("idUniqueID");
						Integer idSuggestion = rs.getInt("idSuggestion");
						String suggestion = userColCheck(rs.getString("suggestion"), idSuggestionType);
						
						if(!oldIdSuggestionType.equals(idSuggestionType)  && AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType).getIsActive()) {
							if(!oldIdUniqueID.equals(idUniqueID)) {
								if(!oldIdUniqueID.equals(-1)) {
									datasource.add(row);
									/*
									System.out.println("NEW ROW :: " + oldIdUniqueID + " != " + idUniqueID);
									System.out.println(row.getRowValues());
									System.out.println("        :: ");
									*/
								}
								row = new Ajobs();
								row.addNewField(idUniqueID.toString(), -1); //-1 so model knows it is writing idUniqueID
							}
							row.addNewField(suggestion, idSuggestionType);
							row.setIdSuggestion(idSuggestionType, idSuggestion);
						}
						oldIdUniqueID = idUniqueID;
						oldIdSuggestionType = idSuggestionType;
						
						if(rs.isLast()) { // sw - checks if last row
							row.addNewField(suggestion, idSuggestionType);
							row.setIdSuggestion(idSuggestionType, idSuggestion);
							datasource.add(row);
						}
					}
				}
			} catch (SQLException | NamingException e) {
		        AjobsUI.getApi().logError(e);
		    }
		
		return new ListDataProvider<>(datasource);
	}
	
	public ListDataProvider<Profs> generateProfsDataProvider() {
		List<Profs> datasource = new ArrayList<Profs>();
		
		// SELECT * FROM Suggestions ORDER BY idUniqueID, idSuggestionType, confidence desc
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
			 PreparedStatement stmt = conn.prepareStatement(selectSuggestionsProfs)
			) {
				Integer idProfile = AjobsUI.getApi().getProfileSession().getIdProfile();
				ResultSet rs = stmt.executeQuery();
				
				Profs row = new Profs();
				Integer oldIdUniqueID = -1; //just to start
				Integer oldIdSuggestionType = -1;
				while(rs.next()) {
					Integer idProfileFromSugg = rs.getInt("idProfile");
					Integer idSuggestionType = rs.getInt("idSuggestionType");
					boolean isPrivate = AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType).getIsPrivate();
					if(!isPrivate || (isPrivate && idProfile.equals(idProfileFromSugg))) {
						Integer idUniqueID = rs.getInt("idUniqueID");
						Integer idSuggestion = rs.getInt("idSuggestion");
						String suggestion = userColCheck(rs.getString("suggestion"), idSuggestionType);
						
						if(!oldIdSuggestionType.equals(idSuggestionType)  && AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType).getIsActive()) {
							if(!oldIdUniqueID.equals(idUniqueID)) {
								if(!oldIdUniqueID.equals(-1)) {
									datasource.add(row);
									/*
									System.out.println("NEW ROW :: " + oldIdUniqueID + " != " + idUniqueID);
									System.out.println(row.getRowValues());
									System.out.println("        :: ");
									*/
								}
								row = new Profs();
								row.addNewField(idUniqueID.toString(), -1); //-1 so model knows it is writing idUniqueID
							}
							row.addNewField(suggestion, idSuggestionType);
							row.setIdSuggestion(idSuggestionType, idSuggestion);
						}
						oldIdUniqueID = idUniqueID;
						oldIdSuggestionType = idSuggestionType;
						
						if(rs.isLast()) { // sw - checks if last row
							row.addNewField(suggestion, idSuggestionType);
							row.setIdSuggestion(idSuggestionType, idSuggestion);
							datasource.add(row);
						}
					}
				}
			} catch (SQLException | NamingException e) {
		        AjobsUI.getApi().logError(e);
		    }
		
		return new ListDataProvider<>(datasource);
	}
	
	private String userColCheck(String val, Integer idSuggestionType) {
		try {
			if(AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType).getName().equals("Created By")
			   || AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType).getName().equals("Last Updated By")
			) {
				Integer idProfile = Integer.valueOf(val);
				return AjobsUI.getApiNew().getIdUser_Users().get(idProfile).getUsername();
			}
		} catch (Exception e) {
			// TODO: handle exception
		}
		
		return val;
	}
	
	public Integer getIdSuggestion(Integer idUniqueID, Integer idSuggestionType, String suggestion) {
		Integer idSuggestion = -1;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				 PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Suggestions WHERE idUniqueID = ? AND idSuggestionType = ? ORDER BY confidence DESC LIMIT 1");
			) {
				stmt.setInt(1, idUniqueID);
				stmt.setInt(2, idSuggestionType);
				ResultSet rs = stmt.executeQuery();
				while(rs.next()) {
					if(rs.getString("suggestion").equals(suggestion)) {
						idSuggestion = rs.getInt("idSuggestion");
					}
				}
		} catch (SQLException | NamingException e) {
	        AjobsUI.getApi().logError(e);
	    }
		return idSuggestion;
	}
	
	//idUniqueId_idSuggestionType_ListIdSuggestion
	private HashMap<Integer, HashMap<Integer, List<Integer>>> idUniqueId_idSuggestionType_ListIdSuggestion = new HashMap<Integer, HashMap<Integer, List<Integer>>>();
	
	public List<Integer> getIdSuggestionsPerCell(Integer idUniqueID, Integer idSuggestionType) {
		return idUniqueId_idSuggestionType_ListIdSuggestion.get(idUniqueID).get(idSuggestionType);
	}
	
	public List<String> getSuggestionsPerCell(Integer idUniqueID, Integer idSuggestionType) {
		List<String> suggestions = new ArrayList<String>();
		
		for(Integer idSuggestion : idUniqueId_idSuggestionType_ListIdSuggestion.get(idUniqueID).get(idSuggestionType)) {
			System.out.println(idUniqueID + " " + idSuggestionType + " " + idSuggestion);
			String suggestion = AjobsUI.getApiNew().getSuggestionByIdSuggestion(idSuggestion).getSuggestion();
			if(suggestion.isEmpty()) {
				//suggestion = blank;
				suggestion = "";
			}
			suggestions.add(suggestion);
		}

		return suggestions;
	}
	
	public List<String> getPreviousSuggestionsPerRow(Integer idUniqueID, Integer idSuggestionType) {
		List<String> suggestions = new ArrayList<String>();
		/*
		 * SELECT *  FROM Suggestions WHERE idSuggestionType = 1 AND idUniqueID = 1 ORDER BY Suggestions.suggestion ASC	
		 */
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				 PreparedStatement stmtSugg = conn.prepareStatement("SELECT * FROM Suggestions WHERE idUniqueID = ? ORDER BY suggestion ASC");
				PreparedStatement stmtSuggTypeValues = conn.prepareStatement("SELECT * FROM SuggestionTypeValues WHERE idSuggestionType = ? ORDER BY value ASC ");
			) {
				stmtSugg.setInt(1, idUniqueID);
				ResultSet rsSugg = stmtSugg.executeQuery();
				while(rsSugg.next()) {
					
				}
		} catch (SQLException | NamingException e) {
	        AjobsUI.getApi().logError(e);
	    }
		return suggestions;
	}
	
	private HashMap<Integer, HashMap<Integer, String>> idSuggestionType_idSuggestion_Suggestion = new HashMap<Integer, HashMap<Integer, String>>();
	
	public void getAllSuggestionsPerRow(String idUniqueID) {
		idSuggestionType_idSuggestion_Suggestion = new HashMap<Integer, HashMap<Integer, String>>();
		Integer idProfile = AjobsUI.getApi().getProfileSession().getIdProfile();
		//SELECT * FROM Suggestions WHERE idUniqueID = 1 ORDER BY idSuggestionType ASC, confidence DESC
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Suggestions WHERE idUniqueID = ? GROUP BY suggestion, idSuggestionType ORDER BY idSuggestionType ASC");
			) {
			
			stmt.setString(1, idUniqueID);
			ResultSet rs = stmt.executeQuery();
			while(rs.next()) {
				Integer idSuggestionType = rs.getInt("idSuggestionType");
				boolean isPrivate = AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType).getIsPrivate();
				Integer idSuggestion  = rs.getInt("idSuggestion");
				String suggestion     = rs.getString("suggestion");
				Integer idProfileSugg = rs.getInt("idProfile");
				
				if(!isPrivate || (isPrivate && idProfile.equals(idProfileSugg))) { //doesn't add private suggestions from other users
					if(idSuggestionType_idSuggestion_Suggestion.containsKey(idSuggestionType)) {
						idSuggestionType_idSuggestion_Suggestion.get(idSuggestionType).put(idSuggestion, suggestion);
					} else {
						HashMap<Integer, String> suggs = new HashMap<Integer, String>();
						suggs.put(idSuggestion, suggestion);
						idSuggestionType_idSuggestion_Suggestion.put(idSuggestionType, suggs);
					}
				}
			}
		} catch (Exception e) {
			AjobsUI.getApiNew().logError(e);
		}
	}
	
	public Set<String> getSuggestionTypeValuesList(Integer idSuggestionType) {
		Set<String> values = new LinkedHashSet<String>();
		SuggestionType suggType = AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType);
		HashMap<Integer, Set<String>> suggTypeValues = AjobsUI.getApiNew().getIdSuggestionType_Values();
		
		if(suggType.getIdDataType() != 2 && suggType.getIdDataType() != 4) { // 2 is drop down, 4 is preset list
			if(idSuggestionType_idSuggestion_Suggestion.containsKey(idSuggestionType)) {
				for(String sugg : idSuggestionType_idSuggestion_Suggestion.get(idSuggestionType).values()) {
					values.add(sugg);
				}
			}
			
			values.add("(Other Suggestions)");
		} 
		
		if(suggTypeValues.containsKey(idSuggestionType)) {
			for(String sugg : suggTypeValues.get(idSuggestionType)) {
				values.add(sugg);
			}	
		}
		
		if(suggType.getCanBeBlank()) {
			values.add(blank);
		}
		
		return values;
	}
	
	public void saveEdit(Integer idUniqueID, HashMap<Integer, String> rowEdits, Map<Integer, String> currentRowValues, Map<Integer, Integer> currentRowIds) {
		for(Entry<Integer, String> edit : rowEdits.entrySet()) {
			HashMap<Integer, Edit> idSuggestion_Chosen = new HashMap<Integer, Edit>(); // shows values user looked at
			Integer idSuggestionType = edit.getKey();
			Integer newIdSuggestion = null;
			String newSuggestion = cleanBlanks(edit.getValue());
			Integer oldIdSuggestion = currentRowIds.get(idSuggestionType);
			String oldSuggestion = cleanBlanks(currentRowValues.get(idSuggestionType));
			
			// check if suggestion has changed
			if(!newSuggestion.equals(oldSuggestion) && !AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType).getName().equals("Created By")) {
				
				System.out.println("");
				System.out.println("idSuggestionType = " + idSuggestionType + " " + AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType).getName());
				System.out.println("newSuggestion = " + newSuggestion);
				System.out.println("oldSuggestion = " + oldSuggestion);
				System.out.println("");
				
				// check if suggestion is new; and populate all possible values for column
				boolean isNew = true;
				for(Entry<Integer, String> e : idSuggestionType_idSuggestion_Suggestion.get(idSuggestionType).entrySet()) {
					Integer idSuggestion = e.getKey();
					String suggestion = e.getValue();
					Integer chosen = 0;
					if(newSuggestion.equals(suggestion)) { 
						newIdSuggestion = e.getKey();
						chosen = 1; // 1 = Yes, chosen, 0 = Not new
						isNew = false;
					}
					Edit newEdit = new Edit(chosen, 0); // 0 = No, not chosen, 0 = Not new
					idSuggestion_Chosen.put(idSuggestion, newEdit);
					//System.out.println("idSuggestion_Chosen :: " + chosen + ",0 :: " + idSuggestion + ", sugg = " + suggestion);
				}
				
				// 
				if(isNew) { // run full alias
					newIdSuggestion = aliasCorrService.updateAliasesWithSuggestions(oldSuggestion, newSuggestion, oldIdSuggestion, idUniqueID, idSuggestionType);
					Edit newEdit = new Edit(1, 1); // 1 = Yes, chosen, 1 = new
					idSuggestion_Chosen.put(newIdSuggestion, newEdit);
					//System.out.println("idSuggestion_Chosen :: 1,1 :: " + newIdSuggestion + ", sugg = " + newSuggestion);
				} else { //increment aliases
					aliasCorrService.updateAlias(newSuggestion, newIdSuggestion);
					aliasCorrService.updateSuggestionMaxConf(newIdSuggestion);
				}
				
				// create new interaction
					// add edits
				if(newIdSuggestion > -1) {
					System.out.println("");
					interactionService.insertEdit(idSuggestion_Chosen, 2); // 2 = EditOnline
				}
			}
		}
	}
	
	public void updateProfEdits(Integer idUniqueID) {
		/*
		    setSuggestions(13, AjobsUI.getApi().getProfileSession().getIdProfile().toString()); // last updated by
			LocalDate currentDate = LocalDate.now();
			setSuggestions(14, currentDate.toString()); // date last updated
		 */
		
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
			PreparedStatement stmtGetIds = conn.prepareStatement("SELECT idSuggestion, idSuggestionType FROM Suggestions WHERE idUniqueID = ? AND (idSuggestionType = 13 OR idSuggestionType = 14)");
			PreparedStatement stmtUpdate = conn.prepareStatement("UPDATE Suggestions SET suggestion = ? WHERE idSuggestion = ?");
		) {
			// Autocommit is true by default,
			// so setting it to false as we are manually committing later
			conn.setAutoCommit(false);
			stmtGetIds.setInt(1, idUniqueID);
			ResultSet rs = stmtGetIds.executeQuery();
			while (rs.next()) { 
				Integer idSuggestion = rs.getInt("idSuggestion");
				Integer idSuggestionType = rs.getInt("idSuggestionType");
				
				if(idSuggestionType.equals(13)) {
					stmtUpdate.setString(1, AjobsUI.getApi().getProfileSession().getIdProfile().toString());
					stmtUpdate.setInt(2, idSuggestion);
					stmtUpdate.addBatch();
				} else if(idSuggestionType.equals(14)) {
					LocalDate currentDate = LocalDate.now();
					stmtUpdate.setString(1, currentDate.toString());
					stmtUpdate.setInt(2, idSuggestion);
					stmtUpdate.addBatch();
				}
			}
			
			/////////////////////////////////////////////////
			
			stmtUpdate.executeBatch();
			
			/////////////////////////////////////////////////

			conn.commit();
			conn.setAutoCommit(true);
		} catch (SQLException | NamingException e) {
	        AjobsUI.getApi().logError(e);
	    }
	}
	
	public String cleanBlanks(String str) {
		if(str == null || str.isEmpty()) { // is null
			return "";
		} else if(str.equals(blank)) {
			return "";
		} else {
			return str;
		}
	}
}
