package drafty.services;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.HashMap;

import drafty._MainUI;

public class NewProfessorServices {

	public HashMap<String, String> searchForProf(String name) {
		HashMap<String, String> profs = new HashMap<String, String>();
		String uni = null;
		
		try {
			String sql = "SELECT p.idPerson, p.name, s.suggestion, JARO_WINKLER_SIMILARITY(?, p.name) as jaro "
						+ "FROM Person p "	 
						+ "INNER JOIN Suggestion s ON s.idPerson = p.idPerson "
						+ "WHERE s.idSuggestionType = 2 && JARO_WINKLER_SIMILARITY(?, p.name) > 0.9 "
						+ "ORDER BY jaro  DESC, suggestion ASC";
			
			PreparedStatement stmt = _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(1, name);
	        stmt.setString(2, name);
	        
	    	ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				if(!rs.getString("suggestion").contains(uni)) {
					profs.put(rs.getString("name"), rs.getString("suggestion"));
				}
				
				uni = rs.getString("suggestion");
			}
			
			stmt.getConnection().close();
	        stmt.close();	
		} catch(Exception e) {
			System.out.println("ERROR searchForProf(): " + e);
		} 
		
		return profs;
	}
}
