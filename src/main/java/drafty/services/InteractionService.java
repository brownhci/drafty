package drafty.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.Date;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import drafty.views._MainUI;

public class InteractionService {
	
	String DATASOURCE_CONTEXT = _MainUI.getDataProvider().getJNDI();
	
	private Date click_time_flag = new Timestamp(new java.util.Date().getTime());
	
	public void recordClick(String person_id, String name, String value, String column, String doubleclick, String idProfile) {
		String idSuggestion = null;
		try {
			idSuggestion = _MainUI.getDataProvider().getIdSuggestion(person_id, value, column);
		} catch (SQLException e) {
			System.out.println("Exception getIdSuggestion() " + e);
		}
		if (idSuggestion != null) {
			try {
				insertClick(column, idSuggestion, doubleclick, idProfile);
			} catch (SQLException e) {
				System.out.println("Exception  insertClick() " + e);
			}	
		}
	}
	
	public void insertClick(String column, String idSuggestion, String doubleclick, String idProfile) throws SQLException { 
		java.util.Date date = new java.util.Date();
		Date click_current_time = new Timestamp(date.getTime());

		try {
	      Context initialContext = new InitialContext();
	      
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null || (click_time_flag.equals(click_current_time) && doubleclick.equals("0"))) {
	        Connection conn = datasource.getConnection();
	        String sql = "INSERT INTO Click (idProfile, idSuggestionType, idSuggestion, doubleclick) VALUES (?, (SELECT idSuggestionType FROM SuggestionType WHERE type = ?), ?, ?); ";
	        PreparedStatement stmt = conn.prepareStatement(sql);
	     
	        stmt.setString(1, idProfile);
	        stmt.setString(2, column);
	        stmt.setString(3, idSuggestion);
	        stmt.setString(4, doubleclick);
	        
	        try {
		        stmt.executeUpdate();
	        } catch (SQLException e) {
				System.out.println(e.getMessage());
			}
	        stmt.close();
	        conn.close();
	      }
	    }
      catch (Exception ex)
      {
      	System.out.println("Exception" + ex);
      }
	
		click_time_flag = new Timestamp(date.getTime());
    }
}
