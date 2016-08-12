package drafty.data.fixes;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.HashMap;
import java.util.Map.Entry;

import drafty._MainUI;

public class ValidationExperimentProfileFix {
	static HashMap<String, String> profiles = new HashMap<String, String>();
		
	public static void createProfilesTypeMap() {

		int count = 0;
		
		try {
			
			String sql = "SELECT * FROM Experiment_Profile ";
			
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        
        	ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				profiles.put(rs.getString("idProfile"), rs.getString("idExperiment"));
				count++;
			}
	        
			System.out.println("COUNT createProfilesTypeMap() = " + count);
			
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR createProfilesTypeMap(): " + e);
		}
	}
	
	public static void updateValidationEntries() {
		int count = 0;
		
		try {
    		String sql = "UPDATE Validation SET idExperiment = ? WHERE idProfile = ?";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        stmt.getConnection().setAutoCommit(false);
	        
	        System.out.println("SIZE: " + profiles.entrySet().size());
	        
	        for (Entry<String, String> entry : profiles.entrySet()) {
		        stmt.setString(1, entry.getValue()); //idExperiment
		        stmt.setString(2, entry.getKey());   //idProfile
		        stmt.addBatch();
		        count++;
	    	}
	        
	        System.out.println("COUNT updateValidationEntries() = " + count);
			
			stmt.executeBatch();
			
			stmt.getConnection().commit();
			stmt.getConnection().setAutoCommit(true);
	        
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR updateValidationEntries(): " + e);
		}
	}
}
