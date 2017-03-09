package drafty.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import drafty._MainUI;

public class UserBehaviorService {
	
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	
	public List<String[]> getClickRow(String dclick) {
		
		//col sort interest
		List<String[]> rowList = new ArrayList<String[]>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * FROM Click c "
		        		+ "INNER JOIN Suggestion s ON c.idSuggestion = s.idSuggestion "
		        		+ "WHERE c.idProfile = ? AND c.doubleclick = ? ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, _MainUI.getApi().getProfile().getIdProfile());
		        stmt.setString(2,  dclick);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						String[] row = new String[3];
						row[0] = rs.getString("idSuggestionType");
						row[1] = rs.getString("rowvalues");
						row[2] = rs.getString("suggestion");
						rowList.add(row);
					}
		        } catch (SQLException e) {
					System.out.println("ERROR getClickRow(): " + e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception getClickRow() " + ex);
	        }
		return rowList;
	}
	
	public List<String> getClickTypes(String dclick, String sugg_id) {
		
		//uni sort interest
		List<String> interestList = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql;
		        PreparedStatement stmt;
		        if (!(sugg_id.equals("1"))) {
		        	sql = "SELECT * "
		        		+ "FROM Click c "
		        		+ "INNER JOIN Suggestion s ON s.idSuggestion = c.idSuggestion "
		        		+ "WHERE c.idProfile = ? AND c.idSuggestionType = ? AND doubleclick = ? ";
			        stmt = conn.prepareStatement(sql);
			        stmt.setString(1, _MainUI.getApi().getProfile().getIdProfile());
			        stmt.setString(2, sugg_id);
			        stmt.setString(3, dclick);
		        } else {
		        	sql = "SELECT * "
			        		+ "FROM ClickPerson "
			        		+ "WHERE idProfile = ? AND doubleclick = ? ";
			        stmt = conn.prepareStatement(sql);
			        stmt.setString(1, _MainUI.getApi().getProfile().getIdProfile());
			        stmt.setString(2, dclick); 	
		        }
		        
		        //Execute Result
	        	ResultSet rs = stmt.executeQuery();
	        	
	        	String getCol = "idPerson";
	        	if (!(sugg_id.equals("1"))) {
	        		getCol = "suggestion";
	        	} 
        		while (rs.next()) {
        			interestList.add(rs.getString(getCol));
        		}
        		
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception getClickTypes() get suggestion " + ex);
	        }
		return interestList;
	}
	
	public List<String> getSuggTypes(String sugg_id, String val) {
		//uni sort interest
		List<String> uniList = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * FROM Validation "
		        	+ "INNER JOIN Validation_Suggestion ON Validation.idValidation = Validation_Suggestion.idValidation "
		        	+ "INNER JOIN Suggestion ON Suggestion.idSuggestion = Validation_Suggestion.idSuggestion "
		        	+ "WHERE Validation.idProfile = ? AND Validation_Suggestion.chosen = ? AND idSuggestionType = ? "
		        	+ "AND date_completed IS NOT NULL ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, _MainUI.getApi().getProfile().getIdProfile());
		        stmt.setString(2, val);
		        stmt.setString(3, sugg_id);
		        
		        ResultSet rs = stmt.executeQuery();
				while (rs.next()) {
					uniList.add(rs.getString("suggestion"));
				}
				
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception getSuggType() get suggestion " + ex);
	        }
		return uniList;
	}
	
	public List<String> getFilterTypes(String bfilter, String sugg_id) {
		
		//uni sort interest
		List<String> matchedList = new ArrayList<String>();
		//List<String> idList = this.getSeparateFilterList(bfilter, sugg_id);

		//for each individual filter, retrieve the matchedValues
		try {
	      Context initialContext = new InitialContext();
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null) {
	        Connection conn = datasource.getConnection();
	        
	        String sql = "SELECT * FROM Filter WHERE idSuggestionType = ? AND idProfile = ? AND blur = ?";
	        PreparedStatement stmt = conn.prepareStatement(sql);
	        stmt.setString(1, sugg_id);
	        stmt.setString(2, _MainUI.getApi().getProfile().getIdProfile());
	        stmt.setString(3, bfilter);
	        //System.out.println("UserBehaviorService getFilterTypes = " + _MainUI.getApi().getIdProfile());
        	ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				String fullList = rs.getString("matchedValues");
				//the separate value
				String curr = "";
				for (char c: fullList.toCharArray()) {
					if (!(c == ',')) {
						curr += c;
					}
					else if (c == ',') {
						matchedList.add(curr);
						curr = "";
					}
				}
				if (!curr.equals("")) {
					matchedList.add(curr);
				}
			}
	        stmt.close();
	        conn.close();
	      }
	    }
        catch (NullPointerException | SQLException | NamingException ex)
        {
        	System.out.println("Exception getFilterTypes() get suggestion " + ex);
        }
		return matchedList;
	}
	
	public String getProfName(String prof_id) {
		List<String> prof = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * FROM Person "
		        	+ "WHERE idPerson = ?";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, prof_id);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						prof.add(rs.getString("name"));
					}
		        } catch (SQLException e) {
					System.out.println("ERROR getProfName(): " + e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception getClickType() get suggestion " + ex);
	        }
		return prof.get(0);
	}
	
	public boolean checkNoInterest(int randCol, int randPerson) {
		
		List<String> row = new ArrayList<String>();
		List<String> col = new ArrayList<String>();
		
		String rCol = Integer.toString(randCol);
		String rPerson = Integer.toString(randPerson);
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * FROM Suggestion WHERE idProfile = ? ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, _MainUI.getApi().getProfile().getIdProfile());
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						row.add(rs.getString("idPerson"));
						col.add(rs.getString("idSuggestionType"));
					}
		        } catch (SQLException e) {
					System.out.println("ERROR checkNoInterest(): " + e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception checkNoInterest() " + ex);
	        }
		
		for (int i = 0; i < row.size(); i++) {
			if (row.get(i) == rPerson && col.get(i) == rCol) {
				return true;
			}
		}
		
		return false;
	}
	
	public String getHighestPersonNum() {
		
		List<String> prof = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT MAX(idPerson) FROM Person ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						prof.add(rs.getString("MAX(idPerson)"));
					}
		        } catch (SQLException e) {
					System.out.println("ERROR getHighestPersonNum(): " + e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception getClickType() get suggestion " + ex);
	        }
		return prof.get(0);
	}
}