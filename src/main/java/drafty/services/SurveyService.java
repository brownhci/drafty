package drafty.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import drafty._MainUI;

public class SurveyService {
	
	
	public String insertNewSurvey() {
		String idSurvey = null;
		
		try {
		      Context initialContext = new InitialContext();
		      
		      DataSource datasource = (DataSource)initialContext.lookup(_MainUI.getApi().getJNDI());
		      
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "INSERT INTO Profile (date_created, date_updated, logins) VALUES (?, ?, ); ";
		        
		        PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
		        stmt.setString(1, );
		        stmt.setString(2,  );
		        
		        try {
			        int affectedRows = stmt.executeUpdate();
			        
			        if (affectedRows == 0) {
			            throw new SQLException("Creating failed, no rows affected.");
			        }
			        try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
			            if (generatedKeys.next()) {
			        		idSurvey = generatedKeys.getString(1);
			            } else {
			                throw new SQLException("Creating idSurvey failed, no ID obtained.");
			            }
			        }
		        } catch (SQLException e) {
		        	_MainUI.getApi().logError(e);
				}
		        stmt.close();
		        conn.close();
		      }
		    } catch (Exception ex) {
		    	_MainUI.getApi().logError(ex);
		    }
		
		return idSurvey;
	}
	
	public void insertNewSurveyQuestion() {
		try {
	        String sql = "INSERT INTO Survey VALUES ()";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(1, );
	        stmt.setString(2,  );
	       
	        try {
	        	stmt.executeUpdate();
	        } catch (SQLException e) {
				_MainUI.getApi().logError(e);;
			}
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			_MainUI.getApi().logError(e);
		}
	}
}
