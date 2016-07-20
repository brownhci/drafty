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
			insertClick(column, idSuggestion, doubleclick, idProfile, rowValues);
		}
	}
	
	public void insertClick(String column, String idSuggestion, String doubleclick, String idProfile, String rowValues) { 
		java.util.Date date = new java.util.Date();
		Date click_current_time = new Timestamp(date.getTime());
		
		try {
	      Context initialContext = new InitialContext();
	      
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null && (!click_time_flag.equals(click_current_time) && doubleclick.equals("0"))) {
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
	
	public void recordClickPerson(String person_id, String doubleclick, String idProfile, String rowValues) { 
		java.util.Date date = new java.util.Date();
		Date click_current_time = new Timestamp(date.getTime());

		try {
	      Context initialContext = null;
		  initialContext = new InitialContext();
	      
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null || (!click_time_flag.equals(click_current_time) && doubleclick.equals("0"))) {
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
}
