package com.ajobs.util.clean;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.HashMap;
import java.util.Map.Entry;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.ajobs.AjobsUI;
import com.ajobs.domain.Users;

public class PopulatePrivateFields {
	public void populatePrivateFieldsOldUsers() {
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
	   			PreparedStatement stmtProfPriv = conn.prepareStatement("SELECT s.* FROM Profile p " + 
				    					"INNER JOIN Suggestions s ON s.idProfile = p.idProfile " + 
				    					"INNER JOIN SuggestionType st ON st.idSuggestionType = s.idSuggestionType " + 
				    					"WHERE st.isPrivate = 1 ");
    			PreparedStatement stmtUniqueId = conn.prepareStatement("SELECT * FROM UniqueId");
				PreparedStatement stmtUsers = conn.prepareStatement("SELECT * FROM Profile");
    			PreparedStatement stmtSug =  conn.prepareStatement("INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) "
						  + "VALUES (NULL, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS);
		) {
    		// Autocommit is true by default,
   			// so setting it to false as we are manually committing later
   			conn.setAutoCommit(false);
   			
   			/////////////////////////////////////////////////
   			Integer confidence = 0;
   			
   			HashMap<Integer, HashMap<Integer, Integer>> hasPrivateStatus = new HashMap<Integer, HashMap<Integer, Integer>>(); //idProfile_uniqueId_idSuggType
   			HashMap<Integer, HashMap<Integer, Integer>> hasPrivateNotes = new HashMap<Integer, HashMap<Integer, Integer>>(); //idProfile_uniqueId_idSuggType
   					
   			ResultSet rsProfPriv = stmtProfPriv.executeQuery();
   			while(rsProfPriv.next()) {
   				Integer idProf = rsProfPriv.getInt("idProfile");
   				Integer uniqueId = rsProfPriv.getInt("idUniqueID");
   				Integer idSuggType = rsProfPriv.getInt("idSuggestionType");
   				
   				HashMap<Integer, Integer> temp = new HashMap<Integer, Integer>();
   				temp.put(uniqueId, idSuggType);
   				
   				if(idSuggType.equals(14)) {
   					hasPrivateStatus.put(idProf, temp);
   					if(idProf.equals(1)) {
   	   					System.out.println("priv status " + uniqueId + " :: " + idSuggType);
   	   				}
   				}
   				if(idSuggType.equals(11)) {
   					hasPrivateNotes.put(idProf, temp);
   					if(idProf.equals(1)) {
   	   					System.out.println("priv notes " + uniqueId + " :: " + idSuggType);
   	   				}
   				}
   			}
   			
   			
   			ResultSet rsUsers = stmtUsers.executeQuery();	
    		while(rsUsers.next()) {
   				Integer idProfile = rsUsers.getInt("idProfile");
   				
   				ResultSet rsUniqueId = stmtUniqueId.executeQuery();	
	    		while(rsUniqueId.next()) {
	    			Integer idUniqueID = rsUniqueId.getInt("idUniqueID");
	    			if(needsPrivateField(hasPrivateStatus, idProfile, idUniqueID, 14)) {
	    				// idUniqueID, idEntryType, suggestion, confidence
		    			stmtSug.setInt(1, 14); // status
		    			stmtSug.setInt(2, idUniqueID);	   // unique id
		    			stmtSug.setInt(3, idProfile);
		    			stmtSug.setString(4, "Not Applied"); 
		    			stmtSug.setInt(5, confidence); 
		    			stmtSug.addBatch();
	    			}
	    			
	    			if(needsPrivateField(hasPrivateNotes, idProfile, idUniqueID, 11)) {
	    				stmtSug.setInt(1, 11); // notes
		    			stmtSug.setInt(2, idUniqueID);	   // unique id
		    			stmtSug.setInt(3, idProfile);
		    			stmtSug.setString(4, ""); 
		    			stmtSug.setInt(5, confidence); 
		    			stmtSug.addBatch();
	    			}
	    		}
   			}
			
			stmtSug.executeBatch();
			
			conn.commit();
			conn.setAutoCommit(true);
		} catch (SQLException | NamingException e) {
	        AjobsUI.getApiNew().logError(e);
	        AjobsUI.getApi().dbErrorMessage();
	    }
		
		System.out.println("DONE with fixing private fields");
	}
	
	private boolean needsPrivateField(HashMap<Integer, HashMap<Integer, Integer>> hash, Integer idProfile, Integer idUniqueID, Integer idSuggestionType) {
		if(idProfile.equals(1)) {
			System.out.println("needsPrivateField = " + idUniqueID + " :: " + idSuggestionType);
		}
		
		if(hash.containsKey(idProfile)) {
			if(hash.get(idProfile).containsKey(idUniqueID)) {
				return false;
			} else {
				return true;
			}
		} else {
			return true;
		}
	}
}
