package drafty.data.fixes;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map.Entry;

import drafty._MainUI;

public class blankCellFix {

	static HashMap<Integer, Pair> suggTypes = new HashMap<Integer, Pair>();
	
	static class Pair {
		
		private String idPerson;
		private String suggType;
		
		public Pair() {
			
		}
		
		public String getIdPerson() {
			return idPerson;
		}
		public void setIdPerson(String idPerson) {
			this.idPerson = idPerson;
		}
		public String getSuggType() {
			return suggType;
		}
		public void setSuggType(String suggType) {
			this.suggType = suggType;
		}
	}
	
	public static void createSuggTypeMap() {
		String sArray[] = new String[] {"3", "4", "5", "6", "7", "8", "9", "10", "11", "12"};
		List<String> suggTypesCheck = Arrays.asList(sArray);
		
		int count = 0;
		
		try {
			
			String sql = 
	        		"SELECT s.idPerson, GROUP_CONCAT(idSuggestionType) as types "
					+ "FROM (SELECT * FROM Person WHERE status = 1) as p "
					+ "INNER JOIN Suggestion s ON s.idPerson = p.idPerson "
					+ "GROUP BY s.idPerson ";
			
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        
        	ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				for (String typeCheck : suggTypesCheck) {
					if(!rs.getString("types").contains(typeCheck)) {
						//System.out.println(rs.getString("idPerson") + " - " + typeCheck);
						Pair pair = new Pair();
						pair.setIdPerson(rs.getString("idPerson"));
						pair.setSuggType(typeCheck);
						suggTypes.put(count, pair);
						count++;
					}
				}
			}
	        
			System.out.println("COUNT createSuggTypeMap() = " + count);
			
			System.out.println("SIZE: " + suggTypes.entrySet().size());
			
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR createSuggTypeMap(): " + e);
		}
	}
	
	public static void createnNewEntries() {
		int count = 0;
		
		try {
    		String sql = "INSERT INTO Suggestion " +
  	        		"(idSuggestion, idPerson, idProfile, idEntryType, idSuggestionType, suggestion, suggestion_original, comment, confidence) " + 
  	        		"VALUES(NULL, ?, NULL, 1, ?, '', NULL, NULL, 5)";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        stmt.getConnection().setAutoCommit(false);
	        
	        System.out.println("SIZE: " + suggTypes.entrySet().size());
	        
	        for (Entry<Integer, Pair> entry : suggTypes.entrySet()) {
		        stmt.setString(1, entry.getValue().getIdPerson());
		        stmt.setString(2, entry.getValue().getSuggType());
		        stmt.addBatch();
		        count++;
	    	}
	        
	        System.out.println("COUNT createnNewEntries() = " + count);
			
			stmt.executeBatch();
			
			stmt.getConnection().commit();
			stmt.getConnection().setAutoCommit(true);
	        
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR createnNewEntries(): " + e);
		}
	}
}
