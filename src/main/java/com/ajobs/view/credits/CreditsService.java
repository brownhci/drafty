package com.ajobs.view.credits;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.LinkedList;
import java.util.List;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.ajobs.AjobsUI;
import com.ajobs.domain.Leaderboard;

public class CreditsService {
	
	public List<Leaderboard> getData() {
		List<Leaderboard> data = new LinkedList<Leaderboard>();
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmt = conn.prepareStatement("SELECT i.idInteractionType, p.idProfile, p.username " + 
																"FROM Interaction i " + 
																"INNER JOIN Session s ON s.idSession = i.idSession " + 
																"INNER JOIN Profile p ON p.idProfile = s.idProfile " + 
																"WHERE (idInteractionType = 5 OR idInteractionType = 6) " + 
																//"AND p.email IS NOT NULL " + // will pull everyone
																"ORDER BY p.idProfile");
			) {
				ResultSet rs = stmt.executeQuery();
				String username = "";
				Integer newRecords = 0; // idInteraction = 5
				Integer edits = 0; // idInteraction = 6
				while (rs.next()) { 
					String usernameCheck = rs.getString("username");
					Integer idInteraction = rs.getInt("idInteractionType");
					
					if(username.equals(usernameCheck)) {
						if(idInteraction == 5) {
							newRecords++;
						} else {
							edits++;
						}
					} else {
						// save old user's data
						if(!username.equals("")) {
							//System.out.println("username = " + username + ", newRecords = " + newRecords + ", edits = " + edits);
							Leaderboard lb = new Leaderboard(username, newRecords, edits);
							data.add(lb);
						}
						
						// create new user
						username = usernameCheck;
						newRecords = 0; // idInteraction = 5
						edits = 0; // idInteraction = 6
					}
				}

	      } catch (SQLException | NamingException e) {
	    	  	AjobsUI.getApi().logError(e);
	    }
		return data;
	}
}
