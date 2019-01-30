package drafty.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import drafty._MainUI;
import drafty.models.NewProfessor;
import drafty.models.ProfNameUni;

public class NewProfessorServices {

	public HashMap<String, ProfNameUni> searchForProf(String name) {
		HashMap<String, ProfNameUni> profs = new HashMap<String, ProfNameUni>();
		String uni = "xxAAxxBBxxCC"; //init string that won't match
		
		try {
			String sql = "SELECT p.idPerson, p.name, s.suggestion, JARO_WINKLER_SIMILARITY(?, p.name) as jaro "
						+ "FROM Person p "	 
						+ "INNER JOIN Suggestion s ON s.idPerson = p.idPerson "
						+ "WHERE s.idSuggestionType = 2 && JARO_WINKLER_SIMILARITY(?, p.name) > 0.9 "
						+ "ORDER BY jaro  DESC, suggestion ASC";
			
			PreparedStatement stmt = _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(1, name);
	        stmt.setString(2, name);
	        
	        Integer count = 0;
	        
	    	ResultSet rs = stmt.executeQuery();
	    	if (!rs.isBeforeFirst() ) {   
	    		ProfNameUni pnu = new ProfNameUni("no", "data");
	    		profs.put("no", pnu);
	    	} else {
	    		while (rs.next()) {
					if(!rs.getString("suggestion").contains(uni)) {
						ProfNameUni pnu = new ProfNameUni(rs.getString("name"), rs.getString("suggestion"));
						profs.put(count.toString(), pnu);
						count++;
					}
					
					uni = rs.getString("suggestion");
				}
	    	}
			
			stmt.getConnection().close();
	        stmt.close();	
		} catch(SQLException | NullPointerException e) {
			System.out.println("ERROR searchForProf(): " + e);
		} 
		
		return profs;
	}
	
	public String insertNewProf(String name) {
		String idPerson = null;
		
		try {
			Context initialContext = new InitialContext();
			DataSource datasource = (DataSource) initialContext.lookup(_MainUI.getApi().getJNDI());
			Connection conn = null;	
			PreparedStatement stmt = null;
			
			if (datasource != null) {	
				String sql = "INSERT INTO Person (idPerson, name, status) VALUES (NULL, ?, '1');";
				
				conn = datasource.getConnection();
				
				stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
		        stmt.setString(1, name);
		        
		        int affectedRows = stmt.executeUpdate();
				
	            if (affectedRows == 0) {
	            	throw new SQLException("Insert Prof failed - No affectedRows");
	            } else {
	            	ResultSet generatedKeys = stmt.getGeneratedKeys();
	            	if (generatedKeys.next()) {
	            		idPerson = generatedKeys.getString(1);
	            	} 
	            }
				
				stmt.getConnection().close();
		        stmt.close();	
			}
		} catch(SQLException | NullPointerException | NamingException e) {
			System.out.println("ERROR String insertNewProf(String name): " + e);
		} 
		
		return idPerson;
	}
	
	public boolean insertNewSuggestions(NewProfessor newProf) {
		boolean success = false;
		HashMap<String, String> newSuggs = buildNewSuggestions(newProf);
		
		try {
			String sql = "INSERT INTO Suggestion "
					+ "(idSuggestion, idPerson, idProfile, idEntryType, idSuggestionType, suggestion, suggestion_original, comment, date, confidence) "
					+ "VALUES (NULL, ?, ?, '11', ?, ?, NULL, NULL, CURRENT_TIMESTAMP, '7')";
			
			PreparedStatement stmt = _MainUI.getApi().getConnStmt(sql);
			stmt.getConnection().setAutoCommit(false);
			
			for (Map.Entry<String, String> entry : newSuggs.entrySet()) {
				System.out.println("new prof value: " + entry.getKey() + " :: " + entry.getValue());
				
				stmt.setString(1, newProf.getPerson_id()); //idPerson
		        stmt.setString(2, _MainUI.getApi().getIdProfile()); //profile id
		        stmt.setString(3, entry.getKey()); //suggestion type id
		        stmt.setString(4, entry.getValue()); //suggestion
		        stmt.addBatch();
			}    
	        
			stmt.executeBatch();
			
			stmt.getConnection().commit();
			stmt.getConnection().setAutoCommit(true);
	        
	        stmt.getConnection().close();
	        stmt.close();
	        success = true;
	        
		} catch(SQLException | NullPointerException e) {
			_MainUI.getApi().logError(e);
		} 
		
		return success;
	}
	
	private List<String> getNewSuggestions(String idPerson) {
		List<String> idSuggsList = new ArrayList<String>();
		
		try {
			String sql = "SELECT * FROM Suggestion WHERE idPerson = ?";
			
			PreparedStatement stmt = _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(1, idPerson);
	        
	    	ResultSet rs = stmt.executeQuery();
	    	while (rs.next()) {
	    		idSuggsList.add(rs.getString("idSuggestion"));
			}
			
			stmt.getConnection().close();
	        stmt.close();	
		} catch(SQLException | NullPointerException e) {
			_MainUI.getApi().logError(e);
		} 
		
		return idSuggsList;
	}
	
	public boolean insertNewValidations(String idPerson) {
		boolean success = false;
		
		try {
			String sql = "INSERT INTO Validation (idValidation, idSuggestion, idProfile, idExperiment, mode, "
	        		+ "interaction_count, interaction_score, interaction_count_total, interaction_score_total, visits, date, date_completed) "
	        		+ "VALUES (NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);";
	        
			PreparedStatement stmt = _MainUI.getApi().getConnStmt(sql);
			stmt.getConnection().setAutoCommit(false);
			
			for (String val : getNewSuggestions(idPerson)) {
				System.out.println("value: " + val);
				
				stmt.setString(1, val);
		        stmt.setString(2, _MainUI.getApi().getIdProfile());
		        stmt.setString(3, _MainUI.getApi().getProfile().getIdExperiment());
		        stmt.setString(4, "new");
		        stmt.setInt(5, _MainUI.getApi().getInteractionCount());
		        stmt.setInt(6, _MainUI.getApi().getInteractionScore());
		        stmt.setInt(7, _MainUI.getApi().getInteractionCountTot());
		        stmt.setInt(8, _MainUI.getApi().getInteractionScoreTot());
		        stmt.setString(9,  _MainUI.getApi().getProfile().getVisits());
		        
		        stmt.addBatch();
			}    
	        
			stmt.executeBatch();
			
			stmt.getConnection().commit();
			stmt.getConnection().setAutoCommit(true);
	        
	        stmt.getConnection().close();
	        stmt.close();
	        success = true;
	        
		} catch(SQLException | NullPointerException e) {
			_MainUI.getApi().logError(e);
		} 
		
		return success;
	}
	
	private HashMap<String, String> getNewValidations(String idPerson) {
		HashMap<String, String> validations = new HashMap<String, String>();
		
		try {
			String sql = "SELECT v.idSuggestion, idPerson, idValidation "
					   + "FROM Suggestion s	"
					   + "INNER JOIN Validation v ON v.idSuggestion = s.idSuggestion "
					   + "WHERE s.idPerson = ?";
			
			PreparedStatement stmt = _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(1, idPerson);
	        
	    	ResultSet rs = stmt.executeQuery();
	    	while (rs.next()) {
	    		validations.put(rs.getString("idValidation"), rs.getString("idSuggestion"));
			}
			
			stmt.getConnection().close();
	        stmt.close();	
		} catch(SQLException | NullPointerException e) {
			_MainUI.getApi().logError(e);
		} 
		
		return validations;
	}
	
	public boolean insertNewValidationSuggestions(String idPerson) {
		boolean success = false;
		
		try {
			String sql = "INSERT INTO Validation_Suggestion " +
	        		"(idValidation, idSuggestion, new, chosen) VALUES (?, ?, ?, ?)";
			
			PreparedStatement stmt = _MainUI.getApi().getConnStmt(sql);
			stmt.getConnection().setAutoCommit(false);
			
			for (Map.Entry<String, String> entry : getNewValidations(idPerson).entrySet()) {
				
				stmt.setString(1, entry.getKey());
		        stmt.setString(2, entry.getValue());
		        stmt.setString(3, "1");
		        stmt.setString(4, "1");
		        
		        stmt.addBatch();
			}    
	        
			stmt.executeBatch();
			
			stmt.getConnection().commit();
			stmt.getConnection().setAutoCommit(true);
	        
	        stmt.getConnection().close();
	        stmt.close();
	        success = true;
	        
		} catch(SQLException | NullPointerException e) {
			_MainUI.getApi().logError(e);
		} 
		
		return success;
	}
	
	private HashMap<String, String> buildNewSuggestions(NewProfessor newProf) {
		HashMap<String, String> newSuggs = new HashMap<String, String>();
		
		newSuggs.put("2", newProf.getUniversity());
		newSuggs.put("3", newProf.getBachelors());
		newSuggs.put("4", newProf.getMasters());
		newSuggs.put("5", newProf.getDoctorate());
		newSuggs.put("6", newProf.getPostdoc());
		newSuggs.put("7", newProf.getJoin_year());
		newSuggs.put("8", newProf.getRank());
		newSuggs.put("9", newProf.getSubfield());
		newSuggs.put("10", newProf.getGender());
		newSuggs.put("11", newProf.getPhotoURL());
		newSuggs.put("12", newProf.getSource());
		
		return newSuggs;
	}
}
