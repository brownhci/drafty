package drafty.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import drafty._MainUI;

public class InteractionService {
	
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	private Date click_time_flag = new Timestamp(new java.util.Date().getTime());
	
	public void recordClick(String person_id, String name, String value, String column, String doubleclick, String idProfile, String rowValues) {
		String idSuggestion = null;
		
		idSuggestion = _MainUI.getApi().getIdSuggestion(person_id, value, column);
		
		if (idSuggestion != null) {
			if(doubleclick.equals("1")) {
				updateDblClick(idSuggestion, idProfile);
			} else {
				insertClick(column, idSuggestion, doubleclick, idProfile, rowValues);
			}
		}
	}
	
	public void insertClick(String column, String idSuggestion, String doubleclick, String idProfile, String rowValues) { 
		java.util.Date date = new java.util.Date();
		Date click_current_time = new Timestamp(date.getTime());
		
		try {
	      Context initialContext = new InitialContext();
	      
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null && !click_time_flag.equals(click_current_time)) {
	        Connection conn = datasource.getConnection();
	        String sql = "INSERT INTO Click (idProfile, idSuggestionType, idSuggestion, doubleclick, rowvalues) VALUES (?, (SELECT idSuggestionType FROM SuggestionType WHERE type = ?), ?, ?, ?); ";
	        PreparedStatement stmt = conn.prepareStatement(sql);
	     
	        stmt.setString(1, idProfile);
	        stmt.setString(2, column);
	        stmt.setString(3, idSuggestion);
	        stmt.setString(4, doubleclick);
	        stmt.setString(5, rowValues);
	        
		    stmt.executeUpdate();
	        stmt.close();
	        conn.close();
	      }
	    }
      catch (SQLException | NamingException ex)
      {
      	System.out.println("Exception: insertClick(String column, String idSuggestion, String doubleclick, String idProfile) = " + ex);
      }
	
		click_time_flag = new Timestamp(date.getTime());
    }
	
	public void updateDblClick(String idSuggestion, String idProfile) {
		
		try {
			String sql = 
					"UPDATE Click "
					+ "SET doubleclick = 1 "
					+ "WHERE idProfile = ? AND idSuggestion = ? AND doubleclick = 0 "
					+ "ORDER BY idClick DESC "
					+ "LIMIT 1";
			PreparedStatement stmt = _MainUI.getApi().getConnStmt(sql);
			
			stmt.setString(1, idProfile);
			stmt.setString(2, idSuggestion);
			
			stmt.executeUpdate();
			
		} catch(Exception e) {
			System.out.println("ERROR updateDblClick(String idSuggestion, String idProfile): " + e);
		}
	}
	
	public void recordClickPerson(String person_id, String doubleclick, String idProfile, String rowValues) { 
		java.util.Date date = new java.util.Date();
		Date click_current_time = new Timestamp(date.getTime());

		try {
	      Context initialContext = null;
		  initialContext = new InitialContext();
	      
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null && !click_time_flag.equals(click_current_time)) {
	        Connection conn = datasource.getConnection();
	        String sql = "INSERT INTO ClickPerson (idProfile, idPerson, doubleclick, rowvalues) VALUES (?, ?, ?, ?); ";
	        PreparedStatement stmt = conn.prepareStatement(sql);
	     
	        stmt.setString(1, idProfile);
	        stmt.setString(2, person_id);
	        stmt.setString(3, doubleclick);
	        stmt.setString(4, rowValues);
	        
	        stmt.executeUpdate();
	        stmt.close();
	        conn.close();
	      }
	    }
      catch (SQLException | NamingException ex)
      {
      	System.out.println("Exception: recordClickPerson(String person_id, String doubleclick, String idProfile) = " + ex);
      }
	
		click_time_flag = new Timestamp(date.getTime());
    }
	
	public void updateDblClickPerson(String person_id, String idProfile) {
		
		try {
			String sql = 
					"UPDATE ClickPerson "
					+ "SET doubleclick = 1 "
					+ "WHERE idProfile = ? AND idPerson = ? AND doubleclick = 0 "
					+ "ORDER BY idClickPerson DESC "
					+ "LIMIT 1";
			PreparedStatement stmt = _MainUI.getApi().getConnStmt(sql);
			
			stmt.setString(1, idProfile);
			stmt.setString(2, person_id);
			
			stmt.executeUpdate();
			
		} catch(Exception e) {
			System.out.println("ERROR updateDblClickPerson(String person_id, String idProfile): " + e);
		}
	}
	
	public void recordSort(String suggestionType, String idProfile) {
		
		try {
			String sql = 
					"INSERT INTO Sort (idSort, idProfile, idSuggestionType, date) "
					+ "VALUES (NULL, ?, (SELECT idSuggestionType FROM SuggestionType WHERE type = ?), CURRENT_TIMESTAMP)";
			PreparedStatement stmt = _MainUI.getApi().getConnStmt(sql);
			
			stmt.setString(1, idProfile);
			stmt.setString(2, suggestionType);
			
			stmt.executeUpdate();
			
		} catch(Exception e) {
			System.out.println("ERROR recordSort(String suggestionType, String idProfile): " + e);
		}
	}
}
