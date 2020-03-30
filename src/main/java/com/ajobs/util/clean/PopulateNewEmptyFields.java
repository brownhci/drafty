package com.ajobs.util.clean;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.ajobs.AjobsUI;

public class PopulateNewEmptyFields {
	
	public void profsInsertEmptyFieldsForSuggestionType() {
		System.out.println("Starting profsInsertEmptyFieldsForSuggestionType...");
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
   			PreparedStatement stmtInsert = conn.prepareStatement("INSERT INTO Suggestions "
   			 											+ "(idSuggestion, idSuggestionType, idUniqueID, suggestion, confidence, idProfile) "
   			 											+ "VALUES (NULL, ?, ?, ?, ?, ?)");
			PreparedStatement stmtSuggs = conn.prepareStatement("SELECT * FROM Suggestions s WHERE active = 1 ORDER BY idUniqueID, idSuggestionType");
			PreparedStatement stmtUID = conn.prepareStatement("SELECT * FROM UniqueId WHERE active = 1");
		) {
   			// Autocommit is true by default,
   			// so setting it to false as we are manually committing later
   			conn.setAutoCommit(false);
   			
   			/////////////////////////////////////////////////
   			
   			List<String> existingSuggs = new ArrayList<String>();
   			List<Integer> suggestionTypes = new ArrayList<Integer>();
   			suggestionTypes.add(3);
   			suggestionTypes.add(4);
   			suggestionTypes.add(5);
   			suggestionTypes.add(6);
   			suggestionTypes.add(7);
   			suggestionTypes.add(8);
   			suggestionTypes.add(9);
   			suggestionTypes.add(10);
   			suggestionTypes.add(11);
   			suggestionTypes.add(12);
   			String sep = "|*|";
   			
   			ResultSet rsSuggs = stmtSuggs.executeQuery();
   			while(rsSuggs.next()) {
   				Integer idUniqueID = rsSuggs.getInt("idUniqueID");
   				Integer idSuggestionType = rsSuggs.getInt("idSuggestionType");
   				String lookup = idUniqueID + sep + idSuggestionType;
   				existingSuggs.add(lookup);
   			}
   			
   			ResultSet rs2 = stmtUID.executeQuery();
   			while(rs2.next()) {
   				Integer idUniqueID = rs2.getInt("idUniqueID");
   				for(Integer idSuggestionType : suggestionTypes) {
   					String key = idUniqueID.toString() + sep + idSuggestionType.toString();
   					if(!existingSuggs.contains(key)) {
   	   					stmtInsert.setInt(1, idSuggestionType); 	//idSuggestionType
   	   		  			stmtInsert.setInt(2, idUniqueID);	  		//idUniqueID
   	   		  			stmtInsert.setString(3, "");
   	   		  			stmtInsert.setInt(4, 0);
   	   		  			stmtInsert.setInt(5, 2); //id 1 is Shaun's profile, 2 will act as the system profile
   	   		  			stmtInsert.addBatch();
   	   				}
   				}
   			}
   			
   			/////////////////////////////////////////////////
   			stmtInsert.executeBatch();

			conn.commit();
			conn.setAutoCommit(true);
   		} catch (SQLException | NamingException e) {
   	        AjobsUI.getApi().logError(e);
   	    }
		System.out.println("Done with profsInsertEmptyFieldsForSuggestionType");
	}
}
