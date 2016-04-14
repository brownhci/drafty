package drafty.data;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;
/**
import drafty.util.commons.text.names.HumanNameParser;
import drafty.util.commons.text.names.Name;
import drafty.util.commons.text.similarity.JaroWrinklerDistance;
import drafty.util.commons.text.similarity.LevenshteinDistance;
**/
import drafty.views._MainUI;

public class DuplicateNameChecker {
	
	static String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	static ArrayList<String> allNames = new ArrayList<String>();
	//static Map<String, Name> parsedNames = new HashMap<String, Name>();
	static Map<String, String> fnNames = new HashMap<String, String>();
/**
	public static void nameCheck() {
		getAllNames();
		
		LevenshteinDistance levDist = new LevenshteinDistance();
		JaroWrinklerDistance jwDist = new JaroWrinklerDistance();
		
		for(Map.Entry<String, String> entry : fnNames.entrySet()) {
			String fullName = entry.getValue();
			for(Map.Entry<String, String> entryCheck : fnNames.entrySet()) {
				if(!entry.getKey().equals(entryCheck.getKey())) {
					String fullNameCheck = entryCheck.getValue();
					Integer lev = levDist.apply(fullName, fullNameCheck);
					Double jw = jwDist.apply(fullName, fullNameCheck);
					
					String nameMatch = entry.getKey() + " " + entry.getValue() + " = " + entryCheck.getKey() + " " + entryCheck.getValue();
					
					if(lev <= 2) {
						System.out.println("MATCH Lev = " + lev + ", " + nameMatch);
					}
					
					if(jw >= 0.9) {
						//System.out.println("MATCH JaW = " + lev + ", " + nameMatch);
					}	
				}
			}
		}
	}
	
	public static void getAllNames() {
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = 
		        		"SELECT * FROM Person";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						//allNames.add(rs.getString("name"));
						
						HumanNameParser parser = new HumanNameParser();
						Name parsedName = parser.parse(rs.getString("name"));
						//parsedNames.put(rs.getString("idPerson"), parsedName);
						
						fnNames.put(rs.getString("idPerson"), parsedName.getFirstName() + " " + parsedName.getLastName());
					}
		        } catch (SQLException e) {
					System.out.println("Error: 1 getAllNames(): " + e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Error: 2 getAllNames():  " + ex);
	        }
	}
	**/
}
