package drafty.data;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import drafty.views._MainUI;

public class GeneralCleaner {
	
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	public void generalClean() {
		
		try {
			Context initialContext = new InitialContext();
		      
		    DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		    
		    Connection conn = datasource.getConnection();
		    
			String sql1 = "UPDATE Suggestion SET suggestion = 'Full' WHERE suggestion = 'full'";				
			String sql2 = "UPDATE Suggestion SET suggestion = 'Associate' WHERE suggestion = 'associate'";
			String sql3 = "UPDATE Suggestion SET suggestion = 'Assistant' WHERE suggestion = 'assistant'";
			String sql4 = "UPDATE Suggestion SET suggestion = '' WHERE suggestion = 'select one'";	
			String sql5 = "UPDATE Suggestion SET suggestion = '' WHERE suggestion = 'Cannot Find'";	
			String sql6 = "UPDATE Suggestion SET suggestion = REPLACE(suggestion,'9d','') WHERE idSuggestionType != 11 AND idSuggestionType != 12 ";
			String sql7 = "INSERT Suggestion (idSuggestion, idPerson, idProfile, idEntryType, idSuggestionType, suggestion, suggestion_original, comment, date, confidence) VALUES (NULL, '14044', NULL, '3', '2', 'Naval Postgraduate University', NULL, NULL, '2015-10-08 20:51:36', '7')";
			String sql8 = "DELETE FROM Suggestion WHERE idPerson = 14030";
			String sql9 = "UPDATE Suggestion SET suggestion = 'University of California - Davis - USA'  WHERE suggestion LIKE '%Davis%' AND idSuggestionType != 11 AND idSuggestionType != 12 AND idSuggestionType != 2 AND suggestion != 'University of California - Davis - USA'";
			String sql10 = "UPDATE Suggestion SET suggestion = 'University of California - Berkeley - USA'  WHERE suggestion LIKE '%Berkel%' AND idSuggestionType != 11 AND idSuggestionType != 12 AND idSuggestionType != 2 AND suggestion != 'University of California - Berkeley - USA' AND suggestion != 'Lawrence Berkeley National Laboratory - USA'";
			String sql11 = "UPDATE Suggestion SET suggestion = 'University of Colorado Boulder - USA' WHERE suggestion = 'University of Colorado Boulder'";	
			String sql12 = "UPDATE Suggestion SET suggestion = '' WHERE suggestion = 'Did not receive'";
			String sql13 = "UPDATE Suggestion SET suggestion = 'Massachusetts Institute of Technology - USA' WHERE suggestion = 'MIT' ";
			String sql14 = "UPDATE Suggestion SET suggestion = 'Carnegie Mellon University - USA' WHERE suggestion = 'CMU' ";
			String sql15 = "UPDATE Suggestion SET suggestion = 'University of California - Los Angeles - USA' WHERE suggestion = 'UCLA' ";
			 
			
			PreparedStatement ps1 = conn.prepareStatement(sql1);
			PreparedStatement ps2 = conn.prepareStatement(sql2);
			PreparedStatement ps3 = conn.prepareStatement(sql3);
			PreparedStatement ps4 = conn.prepareStatement(sql4);
			PreparedStatement ps5 = conn.prepareStatement(sql5);
			PreparedStatement ps6 = conn.prepareStatement(sql6);
			PreparedStatement ps7 = conn.prepareStatement(sql7);
			PreparedStatement ps8 = conn.prepareStatement(sql8);
			PreparedStatement ps9 = conn.prepareStatement(sql9);
			PreparedStatement ps10 = conn.prepareStatement(sql10);
			PreparedStatement ps11 = conn.prepareStatement(sql11);
			PreparedStatement ps12 = conn.prepareStatement(sql12);
			PreparedStatement ps13 = conn.prepareStatement(sql13);
			PreparedStatement ps14 = conn.prepareStatement(sql14);
			PreparedStatement ps15 = conn.prepareStatement(sql15);
			
			ps1.executeUpdate();
			ps2.executeUpdate();
			ps3.executeUpdate();
			ps4.executeUpdate();
			ps5.executeUpdate();
			ps6.executeUpdate();
			ps7.executeUpdate();
			ps8.executeUpdate();
			ps9.executeUpdate();
			ps10.executeUpdate();
			ps11.executeUpdate();
			ps12.executeUpdate();
			ps13.executeUpdate();
			ps14.executeUpdate();
			ps15.executeUpdate();
			
			conn.close();
		} catch (NamingException | SQLException e) {
			System.out.println("Error general cleaning: " + e);
		}
	}
	
	/* Only run once

	START TRANSACTION;

	UPDATE Suggestion
	SET idSuggestionType = 5
	WHERE ((idPerson >= 14315 AND idPerson <= 14356) OR (idPerson = 1421 AND date = '2015-10-08 20:51:38'))
	AND idSuggestionType = 4;

	UPDATE Suggestion
	SET idSuggestionType = 4
	WHERE ((idPerson >= 14315 AND idPerson <= 14356) OR (idPerson = 1421 AND date = '2015-10-08 20:51:38'))
	AND idSuggestionType = 3;

	UPDATE Suggestion
	SET idSuggestionType = 3
	WHERE ((idPerson >= 14315 AND idPerson <= 14356) OR (idPerson = 1421 AND date = '2015-10-08 20:51:38'))
	AND idSuggestionType = 9;

	UPDATE Suggestion
	SET idSuggestionType = 9
	WHERE ((idPerson >= 14315 AND idPerson <= 14356) OR (idPerson = 1421 AND date = '2015-10-08 20:51:38'))
	AND idSuggestionType = 8;

	UPDATE Suggestion
	SET idSuggestionType = 8
	WHERE ((idPerson >= 14315 AND idPerson <= 14356) OR (idPerson = 1421 AND date = '2015-10-08 20:51:38'))
	AND idSuggestionType = 7;

	UPDATE Suggestion
	SET idSuggestionType = 7
	WHERE ((idPerson >= 14315 AND idPerson <= 14356) OR (idPerson = 1421 AND date = '2015-10-08 20:51:38'))
	AND idSuggestionType = 10;

	COMMIT;
	*/
}