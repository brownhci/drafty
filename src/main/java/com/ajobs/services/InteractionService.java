package com.ajobs.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.Map.Entry;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.ajobs.AjobsUI;
import com.ajobs.domain.Edit;
import com.ajobs.domain.Sort;
import com.ajobs.domain.Suggestion;

public class InteractionService {
	String DATASOURCE_CONTEXT = AjobsUI.getApi().getJNDI(); //"java:/MySqlDS_ajobs"
	
	private void checkIdProfile(String function) {
		Integer idProfile = AjobsUI.getApi().getProfileSession().getIdProfile();
		Integer idSession = AjobsUI.getApi().getProfileSession().getIdSession();
		if(idProfile == null) {
			System.out.println("checkIdProfile(): " + function + " :: idSession = " + idSession + " :: idProfile = " + AjobsUI.getApi().getProfileSession().getIdProfile());
		}
	}
	
	public void newView(String viewname) {
		String id = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
			 PreparedStatement stmtID = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", Statement.RETURN_GENERATED_KEYS);
			 PreparedStatement stmtV = conn.prepareStatement("INSERT INTO ViewChange VALUES (?, ?)")
		) {
			checkIdProfile("newView");
			// Autocommit is true by default,
			// so setting it to false as we are manually committing later
			conn.setAutoCommit(false);
			stmtID.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
	        stmtID.setInt(2, 3); //viewChange idInteractionType = 1
			stmtID.executeUpdate();
			ResultSet rsID = stmtID.getGeneratedKeys();
			while (rsID.next()) { id = rsID.getString(1); }
			
			/////////////////////////
			stmtV.setString(1, id);
			stmtV.setString(2, viewname);
			stmtV.addBatch();
			stmtV.executeBatch();

			conn.commit();
			conn.setAutoCommit(true);
		} catch (SQLException | NamingException e) {
	        AjobsUI.getApi().logError(e);
	        AjobsUI.getApi().deleteFromDB("Interaction", "idInteraction", id);
	    }
	}
	
	public Integer insertInteraction(Integer idInteractionType) {
		Integer id = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				 PreparedStatement stmt = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) "
																+ "VALUES (null, ?, ?);", Statement.RETURN_GENERATED_KEYS)
			) {
				checkIdProfile("createInteraction");
				System.out.println("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) " + "VALUES (null, " + AjobsUI.getApi().getProfileSession().getIdSession() + ", " + idInteractionType + ")");
				
		        stmt.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
		        stmt.setInt(2, idInteractionType);
		        stmt.executeUpdate();
		        ResultSet rs = stmt.getGeneratedKeys();
    			while (rs.next()) { id = rs.getInt(1); }
    				
	      } catch (SQLException | NamingException e) {
	    	  		AjobsUI.getApi().logError(e);
	      }
		
		return id;
	}
	
	public void insertClick(Integer idSuggestion, String rowValues) { 
		String id = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmtID = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", Statement.RETURN_GENERATED_KEYS);
				PreparedStatement stmtC = conn.prepareStatement("INSERT INTO Click (idInteraction, idSuggestion, rowvalues) VALUES (?, ?, ?);")
			) {
				checkIdProfile("insertClick");
				conn.setAutoCommit(false);
				stmtID.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
		        stmtID.setInt(2, 1); //click idInteractionType = 1
				stmtID.executeUpdate();
				ResultSet rsID = stmtID.getGeneratedKeys();
				while (rsID.next()) { id = rsID.getString(1); }
				
				/////////////////////////			
				stmtC.setString(1, id);
				stmtC.setInt(2, idSuggestion);
				stmtC.setString(3, rowValues);
				stmtC.addBatch();
				stmtC.executeBatch();
				
				conn.commit();
				conn.setAutoCommit(true);
	      } catch (SQLException | NamingException e) {
    	  		AjobsUI.getApi().logError(e);
    	  		AjobsUI.getApi().deleteFromDB("Interaction", "idInteraction", id);
	      }
    }
	
	public void insertDoubleClick(Integer idSuggestion, String rowValues) { 
		String id = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmtID = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", Statement.RETURN_GENERATED_KEYS);
				PreparedStatement stmtC = conn.prepareStatement("INSERT INTO DoubleClick (idInteraction, idSuggestion, rowvalues) VALUES (?, ?, ?);")
			) {
				checkIdProfile("insertClick");
				conn.setAutoCommit(false);
				stmtID.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
		        stmtID.setInt(2, 12); // double click idInteractionType = 12
				stmtID.executeUpdate();
				ResultSet rsID = stmtID.getGeneratedKeys();
				while (rsID.next()) { id = rsID.getString(1); }
				
				/////////////////////////			
				stmtC.setString(1, id);
				stmtC.setInt(2, idSuggestion);
				stmtC.setString(3, rowValues);
				stmtC.addBatch();
				stmtC.executeBatch();
				
				conn.commit();
				conn.setAutoCommit(true);
	      } catch (SQLException | NamingException e) {
    	  		AjobsUI.getApi().logError(e);
    	  		AjobsUI.getApi().deleteFromDB("Interaction", "idInteraction", id);
	      }
    }
	
	public void insertSort(Map<String, Sort> sorts) { 
		String idInteraction = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmtID = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", Statement.RETURN_GENERATED_KEYS);
				PreparedStatement stmtS = conn.prepareStatement("INSERT INTO Sort (idInteraction, idSuggestionType, isAsc, isTrigger, isMulti) VALUES (?, ?, ?, ?, ?);")
			) {
				checkIdProfile("insertSort");
				conn.setAutoCommit(false);
				stmtID.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
		        stmtID.setInt(2, 4); //click idInteractionType = 4 sort
				stmtID.executeUpdate();
				ResultSet rsID = stmtID.getGeneratedKeys();
				while (rsID.next()) { idInteraction = rsID.getString(1); }
				
				/////////////////////////
				for(Entry<String, Sort> e : sorts.entrySet()) {
					Sort sort = e.getValue();
					
					stmtS.setString(1, idInteraction);
					stmtS.setString(2, sort.getIdSuggestionType());
					stmtS.setInt(3, sort.getIsAsc());
					stmtS.setInt(4, sort.getIsTrigger());
					stmtS.setInt(5, sort.getIsMulti());
					stmtS.addBatch();
					stmtS.executeBatch();
				}
				
				conn.commit();
				conn.setAutoCommit(true);
	      } catch (SQLException | NamingException e) {
	    	  		AjobsUI.getApi().logError(e);
	    	  		AjobsUI.getApi().deleteFromDB("Interaction", "idInteraction", idInteraction);
	      }
    }
	
	public void insertSelectionRange(HashMap<Integer, String> selection) { 
		String id = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmtID = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", Statement.RETURN_GENERATED_KEYS);
				PreparedStatement stmtSR = conn.prepareStatement("INSERT INTO SelectRange (idInteraction, idSuggestion, rowvalues) VALUES (?, ?, ?);")
			) {
				//checkIdProfile("insertSelectionRange");
				conn.setAutoCommit(false);
				stmtID.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
		        stmtID.setInt(2, 2); //selectRange idInteractionType = 2
				stmtID.executeUpdate();
				ResultSet rsID = stmtID.getGeneratedKeys();
				while (rsID.next()) { id = rsID.getString(1); }
				
				/////////////////////////		
				for(Entry<Integer, String> entry : selection.entrySet()) {
					stmtSR.setString(1, id);
					stmtSR.setInt(2, entry.getKey());      //idSuggestion
					stmtSR.setString(3, entry.getValue()); //rowValues
					stmtSR.addBatch();
				}
				stmtSR.executeBatch();
				
				conn.commit();
				conn.setAutoCommit(true);
	      } catch (SQLException | NamingException e) {
	    	  		AjobsUI.getApi().logError(e);
	    	  		AjobsUI.getApi().deleteFromDB("Interaction", "idInteraction", id);
	      }
    }
	
	public void insertCopy(ArrayList<Integer> selection) { 
		String id = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmtID = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", Statement.RETURN_GENERATED_KEYS);
				PreparedStatement stmtC = conn.prepareStatement("INSERT INTO Copy (idInteraction, idSuggestion) VALUES (?, ?);")
			) {
				//checkIdProfile("insertSelectionRange");
				conn.setAutoCommit(false);
				stmtID.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
		        stmtID.setInt(2, 8); //copy idInteractionType = 8
				stmtID.executeUpdate();
				ResultSet rsID = stmtID.getGeneratedKeys();
				while (rsID.next()) { id = rsID.getString(1); }
				
				/////////////////////////		
				for(Integer idSugg : selection) {
					System.out.println("INSERT INTO Copy (idInteraction, idSuggestion) VALUES (" + id + "," + idSugg + ")");
					stmtC.setString(1, id);
					stmtC.setInt(2, idSugg);
					stmtC.addBatch();
				}
				stmtC.executeBatch();
				
				conn.commit();
				conn.setAutoCommit(true);
	      } catch (SQLException | NamingException e) {
	    	  		AjobsUI.getApi().logError(e);
	    	  		AjobsUI.getApi().deleteFromDB("Interaction", "idInteraction", id);
	      }
    }
	
	public void insertEdit(HashMap<Integer, Edit> edits, Integer idEntryType) { 
		String id = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmtID = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", Statement.RETURN_GENERATED_KEYS);
				PreparedStatement stmtE = conn.prepareStatement("INSERT INTO Edit (idInteraction, idSuggestion, idEntryType, chosen, new) VALUES (?, ?, ?, ?, ?);");
			) {
				checkIdProfile("insertEdit");
				conn.setAutoCommit(false);
				stmtID.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
		        stmtID.setInt(2, 6); //editRecord idInteractionType = 6
				stmtID.executeUpdate();
				ResultSet rsID = stmtID.getGeneratedKeys();
				while (rsID.next()) { id = rsID.getString(1); }
				
				/////////////////////////
				Integer idSuggestionChosen = -1;
				for(Entry<Integer, Edit> entry : edits.entrySet()) {
					Integer isChosen = entry.getValue().getIsChosen();
					Integer isNew = entry.getValue().getIsNew();
					Integer idSuggestion = entry.getKey();
					
					//System.out.println("InteractionService: " + idSuggestion + ", chosen = " + isChosen  + ", new = " + isNew);
					
					stmtE.setString(1, id);
					stmtE.setInt(2, entry.getKey());   //idSuggestion
					stmtE.setInt(3, idEntryType);   //idEntryType
					stmtE.setInt(4, isChosen); //chosen
					stmtE.setInt(5, isNew);    //new
					stmtE.addBatch();
					if(isChosen == 1) {
						idSuggestionChosen = idSuggestion;
					}
				}
				stmtE.executeBatch();
				
				conn.commit();
				conn.setAutoCommit(true);
	      } catch (SQLException | NamingException e) {
	    	  	AjobsUI.getApi().logError(e);
	    	  	AjobsUI.getApi().deleteFromDB("Interaction", "idInteraction", id);
	      }
    }
	
	public void updateSuggestion(Suggestion suggestion) {
		System.out.println("InteractionService - updateSuggestion - idSuggestion = " + suggestion.getIdSuggestion());
		Integer confidence = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				 	PreparedStatement stmtConf = conn.prepareStatement("SELECT confidence FROM Suggestions " + 
				 													   "WHERE idUniqueID = ? AND idSuggestionType = ? " + 
				 													   "ORDER BY confidence DESC LIMIT 1");
					PreparedStatement stmtSugg = conn.prepareStatement("UPDATE Suggestions SET confidence = ? WHERE idSuggestion = ?")
				) {
			
				checkIdProfile("updateSuggestion");
				conn.setAutoCommit(false);
				
				/////////////////////////
				stmtConf.setInt(1, suggestion.getIdUniqueID());
				stmtConf.setInt(2, suggestion.getIdSuggestionType());
				ResultSet rsConf = stmtConf.executeQuery();
				while (rsConf.next()) { confidence = rsConf.getInt("confidence"); }
				confidence++; //increment confidence by 1
				suggestion.setConfidence(confidence);
				
				/////////////////////////
				
				stmtSugg.setInt(1, suggestion.getConfidence());
				stmtSugg.setInt(2, suggestion.getIdSuggestion());
				
				stmtSugg.executeUpdate();
	
				conn.commit();
				conn.setAutoCommit(true);
				
				//AjobsUI.getApi().getNewSuggestionEntered().getSuggestion().setConfidence(confidence);
		} catch (SQLException | NamingException e) {
			AjobsUI.getApi().logError(e);
		}
	}
	
	public Integer insertNewSuggestion(Integer idSuggestionType, Integer idUniqueID, Integer idEntryType, String suggestion) {
		System.out.println("InteractionService - INSERT INTO Suggestions");
		Integer idSuggestion = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
					PreparedStatement stmtS = conn.prepareStatement("INSERT INTO Suggestions "
								+ "(idSuggestion, idSuggestionType, idUniqueID, suggestion, confidence, idProfile) "
								+ "VALUES (NULL, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS)
				) {
			
				checkIdProfile("insertNewSuggestion");
				conn.setAutoCommit(false);
				
				/////////////////////////
				Integer confidence = 0;
				
				stmtS.setLong(1, idSuggestionType);		//idSuggestionType
    			stmtS.setInt(2, idUniqueID);	     	//idUniqueID
    			stmtS.setString(3, suggestion.trim());
    			stmtS.setInt(4, confidence);			//will automatically be adjusted later
    			stmtS.setInt(5, AjobsUI.getApi().getProfileSession().getIdProfile());
				
				stmtS.executeUpdate();
    			ResultSet rsID = stmtS.getGeneratedKeys();
    			while (rsID.next()) { idSuggestion = rsID.getInt(1); }
	
				conn.commit();
				conn.setAutoCommit(true);
		} catch (SQLException | NamingException e) {
			AjobsUI.getApi().logError(e);
		} 
		return idSuggestion;
	}
	
	private Integer lastIdInteractionSearch = null;
	public void insertSearch(Integer idSuggestionType, String valSearch, Integer isFromUrl, Map<Integer, String> idSuggestionTypeValueSearched) {
		Integer idInteraction = null;
		
		
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmtID = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", Statement.RETURN_GENERATED_KEYS);
				PreparedStatement stmtSearch = conn.prepareStatement("INSERT INTO Search (idInteraction, idSuggestionType, idSearchType, isPartial, isMulti, isFromUrl, value, matchedValues) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
				PreparedStatement stmtSearchMulti = conn.prepareStatement("INSERT INTO SearchMulti (idInteraction, idSuggestionType, idSearchType, value) VALUES (?, ?, ?, ?)");
			) {
				stmtID.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
		        stmtID.setInt(2, 7); //search idInteractionType = 7
				stmtID.executeUpdate();
				ResultSet rsID = stmtID.getGeneratedKeys();
				while (rsID.next()) { idInteraction = rsID.getInt(1); }
				lastIdInteractionSearch = idInteraction;
				///////////////////////////////////////////////////////	
				
				Integer isMulti = 0;
				if(idSuggestionTypeValueSearched.size() > 1) {
					isMulti = 1;
				}
				
				// first insert main search
				//idInteraction, idSuggestionType, idSearchType, isPartial, isMulti, isFromUrl, value, matchedValues
				stmtSearch.setInt(1, idInteraction);
				stmtSearch.setInt(2, idSuggestionType);
				stmtSearch.setInt(3, 1); //idSearchType, 1 = equals
				stmtSearch.setInt(4, 1); //isPartial, always true initially, will be updated blur event
				stmtSearch.setInt(5, isMulti);
				stmtSearch.setInt(6, isFromUrl);
				stmtSearch.setString(7, valSearch);
				stmtSearch.setString(8, ""); //will be updated once grid is filtered (i.e. finished searching)
				stmtSearch.executeUpdate();
				
				///////////////////////////////////////////////////////	
				
				// then if search is multi; enter in other values
				if(isMulti == 1) {
					for(Entry<Integer, String> e : idSuggestionTypeValueSearched.entrySet()) {
						Integer idSuggestionTypeMulti = e.getKey();
						String searchValueMulti = e.getValue();
						
						//idInteraction, idSuggestionType, idSearchType, value
						stmtSearchMulti.setInt(1, idInteraction);
						stmtSearchMulti.setInt(2, idSuggestionTypeMulti);
						stmtSearchMulti.setInt(3, 1); //idSearchType, 1 = equals
						stmtSearchMulti.setString(4, searchValueMulti);
						stmtSearchMulti.addBatch();
					}
				}
				stmtSearchMulti.executeBatch();
	      } catch (SQLException | NamingException e) {
	    	  	AjobsUI.getApi().logError(e);
	    }
	}
	
	public void updatePartialSearch() {
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmtSearchPartial = conn.prepareStatement("UPDATE Search SET isPartial = 0 WHERE idInteraction = ?;")
			) {
				stmtSearchPartial.setInt(1, lastIdInteractionSearch);
				stmtSearchPartial.executeUpdate();
				///////////////////////////////////////////	

	      } catch (SQLException | NamingException e) {
	    	  	AjobsUI.getApi().logError(e);
	    }
	}
	
	public void updateSearchMatchedValues(String matchedValues) {
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmt = conn.prepareStatement("UPDATE Search SET matchedValues = ? WHERE idInteraction = ?;")
			) {
				stmt.setString(1, matchedValues);
				stmt.setInt(2, lastIdInteractionSearch);
				stmt.executeUpdate();
				///////////////////////////////////////////	

	      } catch (SQLException | NamingException e) {
	    	  	AjobsUI.getApi().logError(e);
	    }
	}
	
	public void insertClearSearch() {
		//System.out.println("insertClearSearch()");
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				PreparedStatement stmtID = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", Statement.RETURN_GENERATED_KEYS);
			) {
				stmtID.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
		        stmtID.setInt(2, 13); //search clear = 13
				stmtID.executeUpdate();
				///////////////////////////////////////////	

	      } catch (SQLException | NamingException e) {
	    	  	AjobsUI.getApi().logError(e);
	    }
	}
	
	public Integer getIdSuggestionFromPaste(Integer idInteraction) {
		Integer idSuggestionAfter = -1;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
				 	PreparedStatement stmt = conn.prepareStatement("SELECT * FROM Paste WHERE idInteraction = ? ")
				) {
				
				/////////////////////////
				stmt.setInt(1, idInteraction);
				ResultSet rs = stmt.executeQuery();
				while (rs.next()) { 
					System.out.println(rs.getInt("idSuggestionAfter"));
					idSuggestionAfter = rs.getInt("idSuggestionAfter"); 
				}
				
				/////////////////////////
		} catch (SQLException | NamingException e) {
			AjobsUI.getApi().logError(e);
		}
		
		return idSuggestionAfter;
	}
}
