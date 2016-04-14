
package drafty.services;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Random;

import drafty.views._MainUI;

public class ExperimentService {
	
	public static void checkExperimentProfile() {
		try {
			String experiment_id = null;
			String count = null;
			
			String sql = "SELECT COUNT(*) as count, idExperiment FROM Experiment_Profile WHERE idProfile = ?";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(1, _MainUI.getApi().getProfile().getIdProfile());
	        
        	ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				count = rs.getString("count");
				if(!count.equals("0")) {
					experiment_id = rs.getString("idExperiment");
		        }
			}
	        
	        stmt.getConnection().close();
	        stmt.close();
	        
	        if(count.equals("0")) {
	        	newExperimentProfile(); 
	        } else {
	        	//System.out.println("SET EXISTING idExperiment = " + experiment_id);
	        	_MainUI.getApi().getProfile().setIdExperiment(experiment_id);
	        }
		} catch (SQLException e) {
			System.out.println("ERROR checkExperimentProfile(): " + e);
		}
	}
	
	private static void newExperimentProfile() {
		try {
			String new_experiment_id = null;
	        
			String sql = "SELECT * FROM Experiment_Profile ORDER BY date_created LIMIT 1";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	  
        	ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				new_experiment_id = rs.getString("idExperiment");
			}
				
	        stmt.getConnection().close();
	        stmt.close();
	        
	        sql = "INSERT INTO Experiment_Profile VALUES (?, ?, CURRENT_TIMESTAMP)";
	        stmt =  _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(1, new_experiment_id);
	        stmt.setString(2,  _MainUI.getApi().getProfile().getIdProfile());
	       
	        try {
	        	Integer new_id = stmt.executeUpdate();
	        	//System.out.println("SET NEW idExperiment = " + new_id);
	        	_MainUI.getApi().getProfile().setIdExperiment(Integer.toString(new_id));
	        } catch (SQLException e) {
				System.out.println(e.getMessage());
			}
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR newExperimentProfile(): " + e);
		}
	}
	
	public static void insertExperimentValidation(String validation_id) {
		try {
			String sql = "INSERT INTO Experiment_Validation VALUES (?, ?, CURRENT_TIMESTAMP)";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(2, _MainUI.getApi().getProfile().getIdExperiment());
	        stmt.setString(2, validation_id);
	        
	        stmt.executeUpdate();
	        
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR insertExperimentValidation(): " + e);
		}
	}
	
	public static String getSuggestionWithMaxConf(String idPerson, String SuggestionType) {

		String suggestion = null;
		
		try {
			String sql = "SELECT * "
					+	"FROM Suggestion "
					+	"WHERE idPerson = ? "
					+ 	"AND idSuggestionType = (SELECT idSuggestionType FROM SuggestionType WHERE type = ?) "
					+	"ORDER BY confidence DESC";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(1, idPerson);
	        stmt.setString(2, SuggestionType);
	        
        	ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				suggestion = rs.getString("suggestion");
				break;
			}
	        
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR getSuggestionWithMaxConf(): " + e);
		}
		
		return suggestion; 
	}
	
	public static String getRandomSuggestionType() {
		Random ran = new Random();
		//int row_or_col = ran.nextInt(2);
		int col = ran.nextInt(7);
		
		String idSuggestionType = "";
		
		if(col == 0) {
			idSuggestionType = "University";
		} else if(col == 1) {
			idSuggestionType = "Bachelors";
		} else if(col == 2) {
			idSuggestionType = "Masters";
		} else if(col == 3) {
			idSuggestionType = "Doctorate";
		} else if(col == 4) {
			idSuggestionType = "JoinYear";
		} else if(col == 5) {
			idSuggestionType = "Rank";
		} else if(col == 6) {
			idSuggestionType = "Subfield";
		} 
		
		return idSuggestionType;
	}
}
