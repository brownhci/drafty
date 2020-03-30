package com.ajobs.util.clean;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.DateFormat;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedList;
import java.util.List;
import java.util.Map.Entry;
import java.util.Random;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.ajobs.AjobsUI;

public class ProfDbMigrate {
	private String jndiOld = "java:/MySqlDS_drafty";
	private String jndiNew = "java:/MySqlDS_profs"; 
	
	private Integer idInteraction = 1;
	private Integer idSession = 1;
	
	private HashMap<Integer, HashMap<Integer, Date>> profileInteractionDates = new HashMap<Integer, HashMap<Integer, Date>>(); //<idProfile, <idInteraction, timestamp>>
	private HashMap<Integer, Integer> idInteractionIdInteractionType = new HashMap<Integer, Integer>(); //<idInteraction, idInteractionType>>
	private HashMap<Integer, Session> idSessionSession = new HashMap<Integer, Session>();
	private HashMap<Integer, Integer> idInteractionExperiment = new HashMap<Integer, Integer>();
	
	private HashMap<Integer, HashMap<String, Integer>> idSuggestionTypeValueCount = new HashMap<Integer, HashMap<String, Integer>>(); //idSuggestionType, <suggestion, count>
	private HashMap<Integer, Integer> idProfileLogins = new HashMap<Integer, Integer>(); //idProfle, number of logins per profile
	private HashMap<Integer, Integer> idPersonIdEntryType = new HashMap<Integer, Integer>(); 
	private HashMap<Integer, Integer> idSuggestionIdEntryType = new HashMap<Integer, Integer>();
	
	private String insertIntoSuggestions = "INSERT INTO Suggestions "
					+ "(idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) "
					+ "VALUES (?, ?, ?, ?, ?, ?)";
	private String insertIntoClick = "INSERT INTO Click (idInteraction, idSuggestion, rowvalues) VALUES (?, ?, ?);";
	
	public void runMigration() {
		try (Connection connO = ((DataSource) new InitialContext().lookup(jndiOld)).getConnection();
			 Connection connN = ((DataSource) new InitialContext().lookup(jndiNew)).getConnection();
			) {
				disableForeignKeyChecks(connN);
				connN.setAutoCommit(false);
				
				//functions
				uniqueRowId(connO, connN);
				suggestionType(connO, connN);
				suggestions(connO, connN);
				suggestionTypeValues(connO, connN);
				individualInteractions(connO, connN);
				profiles(connO, connN);
				sessionsAndFinalInteractions(connO, connN);
				suggestionsCreatedByLastUpdated(connO, connN);
				
				connN.commit();
				connN.setAutoCommit(true);
				enableForeignKeyChecks(connN);
			} catch(SQLException | NamingException e) {
				System.out.println(e);
			} finally {
				System.out.println("finished... runMigration() ");
			}
	}
	
	public void resetDb() {
		System.out.println("starting... resetDb()");
		try (Connection connN = ((DataSource) new InitialContext().lookup(jndiNew)).getConnection();
				PreparedStatement stmtAlias = connN.prepareStatement("TRUNCATE Alias ");
				PreparedStatement stmtClick = connN.prepareStatement("TRUNCATE Click ");
				PreparedStatement stmtCopy = connN.prepareStatement("TRUNCATE Copy ");
				PreparedStatement stmtEdit = connN.prepareStatement("TRUNCATE Edit ");
				PreparedStatement stmtExperiment_Session = connN.prepareStatement("TRUNCATE Experiment_Session ");
				PreparedStatement stmtInteraction = connN.prepareStatement("TRUNCATE Interaction ");
				PreparedStatement stmtProfile = connN.prepareStatement("TRUNCATE Profile ");
				PreparedStatement stmtSearch = connN.prepareStatement("TRUNCATE Search ");
				PreparedStatement stmtSession = connN.prepareStatement("TRUNCATE Session ");
				PreparedStatement stmtSort = connN.prepareStatement("TRUNCATE Sort ");
				PreparedStatement stmtSuggestions = connN.prepareStatement("TRUNCATE Suggestions ");
				PreparedStatement stmtSuggestionType = connN.prepareStatement("TRUNCATE SuggestionType ");
				PreparedStatement stmtSuggestionTypeValues = connN.prepareStatement("TRUNCATE SuggestionTypeValues ");
				PreparedStatement stmtUniqueId = connN.prepareStatement("TRUNCATE UniqueId ");
				PreparedStatement stmViewChange = connN.prepareStatement("TRUNCATE ViewChange ");
			) {
				disableForeignKeyChecks(connN);
				connN.setAutoCommit(false);
				
				//empty table name
				stmtAlias.executeUpdate();
				stmtClick.executeUpdate();
				stmtCopy.executeUpdate();
				stmtEdit.executeUpdate();
				stmtExperiment_Session.executeUpdate();
				stmtInteraction.executeUpdate();
				stmtProfile.executeUpdate();
				stmtSearch.executeUpdate();
				stmtSession.executeUpdate();
				stmtSort.executeUpdate();
				stmtSuggestions.executeUpdate();
				stmtSuggestionType.executeUpdate();
				stmtSuggestionTypeValues.executeUpdate();
				stmtUniqueId.executeUpdate();
				stmViewChange.executeUpdate();
				
				connN.commit();
				connN.setAutoCommit(true);
				enableForeignKeyChecks(connN);
			} catch(SQLException | NamingException e) {
				System.out.println("ERROR resetDb(): " + e);
				e.printStackTrace();
				System.out.println("::::::::::::::::::::::::::::::::");
			}
		System.out.println("done... resetDb()");
	}
	
	/*
	private void tempalteSmall(Connection connO, Connection connN) {
		System.out.println("starting...");
		
		// extract all the information from FILE1 (Drafty)
		try (
			PreparedStatement stmtO = connO.prepareStatement("");
			PreparedStatement stmtN = connN.prepareStatement("");
		) {
			ResultSet rs = stmtO.executeQuery();
			
			while(rs.next()) {
				stmtN.setInt(1, rs.getInt(""));
				stmtN.addBatch();
			}

			stmtN.executeBatch();
		} catch(SQLException e) {
			System.out.println(e);
		}
	}
	
	private void templateFull() {
		System.out.println("");
		
		// extract all the information from FILE1 (Drafty)
		try (
			Connection connO = ((DataSource) new InitialContext().lookup(jndiOld)).getConnection();
			PreparedStatement stmtO = connO.prepareStatement("");
				
			Connection connN = ((DataSource) new InitialContext().lookup(jndiNew)).getConnection();
			PreparedStatement stmtN = connN.prepareStatement("");
		) {
			connN.setAutoCommit(false);
			
			ResultSet rs = stmtO.executeQuery();
			
			while(rs.next()) {
				stmtN.setInt(1, rs.getInt(""));
				stmtN.addBatch();
			}

			stmtN.executeBatch(); 
			connN.commit();
			connN.setAutoCommit(true);
		} catch(SQLException | NamingException e) {
			System.out.println(e);
		}
	}
	*/
	
	private void suggestionType(Connection connO, Connection connN) {
		System.out.println("starting... suggestionType");
		
		try (PreparedStatement stmt2 = connN.prepareStatement(
				"INSERT INTO SuggestionType "
		 		+ "(idSuggestionType,idDataType,name,makesRowUnique,canBeBlank,"
		 		+ "isDate,isLink,isCurrency,isEditable,columnOrder) "
				+ "VALUES (?,?,?,?,?,?,?,?,?,?);");
		) { 
			connN.setAutoCommit(false);
			
			stmt2.setInt(1, 1); //idSuggestionType
			stmt2.setInt(2, 1); //idDataType
			stmt2.setString(3, "FullName"); //type name (i.e. University)
			stmt2.setInt(4, 1); //makesRowUnique 
			stmt2.setInt(5, 0); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable  
			stmt2.setInt(10, 11); //columnOrder
			stmt2.addBatch(); 	
			
			stmt2.setInt(1, 2); //idSuggestionType
			stmt2.setInt(2, 3); //idDataType
			stmt2.setString(3, "University"); //type name (i.e. University)
			stmt2.setInt(4, 1); //makesRowUnique 
			stmt2.setInt(5, 0); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable  
			stmt2.setInt(10, 22); //columnOrder
			stmt2.addBatch(); 
			
			stmt2.setInt(1, 3); //idSuggestionType
			stmt2.setInt(2, 3); //idDataType
			stmt2.setString(3, "Bachelors"); //type name (i.e. University)
			stmt2.setInt(4, 0); //makesRowUnique 
			stmt2.setInt(5, 1); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable  
			stmt2.setInt(10, 66); //columnOrder
			stmt2.addBatch();
			
			stmt2.setInt(1, 4); //idSuggestionType
			stmt2.setInt(2, 3); //idDataType
			stmt2.setString(3, "Masters"); //type name (i.e. University)
			stmt2.setInt(4, 0); //makesRowUnique 
			stmt2.setInt(5, 1); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 0); //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1); //isEditable  
			stmt2.setInt(10, 77); //columnOrder
			stmt2.addBatch(); 	
			
			stmt2.setInt(1, 5); //idSuggestionType
			stmt2.setInt(2, 3); //idDataType
			stmt2.setString(3, "Doctorate"); //type name (i.e. University)
			stmt2.setInt(4, 0); //makesRowUnique 
			stmt2.setInt(5, 1); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable  
			stmt2.setInt(10, 88); //columnOrder
			stmt2.addBatch(); 
			
			stmt2.setInt(1, 6); //idSuggestionType
			stmt2.setInt(2, 3); //idDataType
			stmt2.setString(3, "PostDoc"); //type name (i.e. University)
			stmt2.setInt(4, 0); //makesRowUnique 
			stmt2.setInt(5, 1); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable  
			stmt2.setInt(10, 99); //columnOrder
			stmt2.addBatch();
			
			stmt2.setInt(1, 7); //idSuggestionType
			stmt2.setInt(2, 1); //idDataType
			stmt2.setString(3, "JoinYear"); //type name (i.e. University)
			stmt2.setInt(4, 0); //makesRowUnique 
			stmt2.setInt(5, 1); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable  
			stmt2.setInt(10, 33); //columnOrder
			stmt2.addBatch(); 	
			
			stmt2.setInt(1, 8); //idSuggestionType
			stmt2.setInt(2, 4); //idDataType
			stmt2.setString(3, "Rank"); //type name (i.e. University)
			stmt2.setInt(4, 0); //makesRowUnique 
			stmt2.setInt(5, 1); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable  
			stmt2.setInt(10, 44); //columnOrder
			stmt2.addBatch(); 
			
			stmt2.setInt(1, 9); //idSuggestionType
			stmt2.setInt(2, 2); //idDataType
			stmt2.setString(3, "SubField"); //type name (i.e. University)
			stmt2.setInt(4, 0); //makesRowUnique 
			stmt2.setInt(5, 1); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable  
			stmt2.setInt(10, 55); //columnOrder
			stmt2.addBatch();
			
			stmt2.setInt(1, 10); //idSuggestionType
			stmt2.setInt(2, 4); //idDataType
			stmt2.setString(3, "Gender"); //type name (i.e. University)
			stmt2.setInt(4, 0); //makesRowUnique 
			stmt2.setInt(5, 1); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable  
			stmt2.setInt(10, 110); //columnOrder
			stmt2.addBatch(); 	
			
			stmt2.setInt(1, 11); //idSuggestionType
			stmt2.setInt(2, 1); //idDataType
			stmt2.setString(3, "PhotoURL"); //type name (i.e. University)
			stmt2.setInt(4, 0); //makesRowUnique 
			stmt2.setInt(5, 1); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 1);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable 
			stmt2.setInt(10, 120); //columnOrder
			stmt2.addBatch(); 
			
			stmt2.setInt(1, 12); //idSuggestionType
			stmt2.setInt(2, 1); //idDataType
			stmt2.setString(3, "Sources"); //type name (i.e. University)
			stmt2.setInt(4, 0); //makesRowUnique 
			stmt2.setInt(5, 1); //canBeBlank
			stmt2.setInt(6, 0); //isDate
			stmt2.setInt(7, 1);  //isLink
			stmt2.setInt(8, 0); //isCurrency
			stmt2.setInt(9, 1);  //isEditable 
			stmt2.setInt(10, 130); //columnOrder
			stmt2.addBatch();
			
			stmt2.setInt(1, 13); //idSuggestionType
			stmt2.setInt(2, 1); //idDataType
			stmt2.setString(3, "Last_Updated_By"); //type name (i.e. University)
			stmt2.setInt(4, 0);  //makesRowUnique 
			stmt2.setInt(5, 0);  //canBeBlank
			stmt2.setInt(6, 0);  //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0);  //isCurrency
			stmt2.setInt(9, 0);  //isEditable  
			stmt2.setInt(10, 140); //columnOrder
			stmt2.addBatch();
			
			stmt2.setInt(1, 14); //idSuggestionType
			stmt2.setInt(2, 1); //idDataType
			stmt2.setString(3, "Last_Updated"); //type name (i.e. University)
			stmt2.setInt(4, 0);  //makesRowUnique 
			stmt2.setInt(5, 0);  //canBeBlank
			stmt2.setInt(6, 1);  //isDate
			stmt2.setInt(7, 0);  //isLink
			stmt2.setInt(8, 0);  //isCurrency
			stmt2.setInt(9, 0);  //isEditable  
			stmt2.setInt(10, 150); //columnOrder
			stmt2.addBatch();
			
			stmt2.executeBatch(); 
		} catch(SQLException e) {
			System.out.println("ERROR suggestionType: " + e);
			e.printStackTrace();
			System.out.println("::::::::::::::::::::::::::::::::::");
		}
	}
	
	private void suggestionTypeValues(Connection connO, Connection connN) {
		System.out.println("starting... suggestionTypeValues");

		try (
			PreparedStatement stmtSuggestonCount = connO.prepareStatement(
															"SELECT idSuggestionType, suggestion, count(*) as ct " + 
															"FROM Suggestion  " + 
															"WHERE suggestion IS NOT NULL " + 
															"AND suggestion != '' and idSuggestionType < 8 " + 
															"GROUP BY suggestion, idSuggestionType " + 
															"ORDER BY ct  DESC");
			PreparedStatement stmtSubField = connO.prepareStatement("SELECT * FROM SubfieldName ");
			PreparedStatement stmtST = connN.prepareStatement("INSERT INTO SuggestionTypeValues (idSuggestionType, value) VALUES (?, ?) ");
		) {
			for (Entry<Integer, HashMap<String, Integer>> e1 : idSuggestionTypeValueCount.entrySet()) {
				Integer idSuggestionType = e1.getKey();
				for(Entry<String, Integer> e2 : e1.getValue().entrySet()) {
					if(e2.getValue() >= 5 && idSuggestionType < 8 && !AjobsUI.getApi().isStringNull(e2.getKey())) { //count and do include URLs
						stmtST.setInt(1, idSuggestionType); //idSuggestionType
						stmtST.setString(2, e2.getKey()); //suggested value
						stmtST.addBatch();
						//System.out.println(idSuggestionType + " :: " + e2.getValue() + " :: " + e2.getKey());
					}
				}
			}

			stmtST.setInt(1, 8); //idSuggestionType
			stmtST.setString(2, "Assistant"); //suggested value
			stmtST.addBatch();
			stmtST.setInt(1, 8); 
			stmtST.setString(2, "Associate"); 
			stmtST.addBatch();
			stmtST.setInt(1, 8); 
			stmtST.setString(2, "Full"); 
			stmtST.addBatch();
			
			ResultSet rsSubfieldName = stmtSubField.executeQuery();
			while(rsSubfieldName.next()) {
				stmtST.setInt(1, 9); //idSuggestionType
				stmtST.setString(2, rsSubfieldName.getString("name")); //suggested value
				stmtST.addBatch();
			}
			
			stmtST.setInt(1, 10); //idSuggestionType
			stmtST.setString(2, "Male"); //suggested value
			stmtST.addBatch();
			stmtST.setInt(1, 10); 
			stmtST.setString(2, "Female"); 
			stmtST.addBatch();
			stmtST.setInt(1, 10); 
			stmtST.setString(2, "Decline to Report"); 
			stmtST.addBatch();
			
			stmtST.executeBatch();
		} catch(SQLException e) {
			System.out.println("ERROR suggestionTypeValues: " + e);
			e.printStackTrace();
			System.out.println("::::::::::::::::::::::::::::::::::");
		}
	}
	
	private void suggestions(Connection connO, Connection connN) {
		System.out.println("starting... suggestions");
		
		// extract all the information from FILE1 (Drafty)
		try (
			PreparedStatement stmtO = connO.prepareStatement("SELECT * FROM Suggestion");
			PreparedStatement stmtN = connN.prepareStatement(insertIntoSuggestions);
		) {
			ResultSet rs = stmtO.executeQuery();
			while(rs.next()) {
				String suggestion = rs.getString("suggestion").trim();
				Integer idSuggestionType = rs.getInt("idSuggestionType");
				suggestion = cleanUniversityName(suggestion, idSuggestionType);
				//(idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) 
				stmtN.setInt(1, rs.getInt("idSuggestion")); //idSuggestion
				stmtN.setInt(2, idSuggestionType); //idSuggestionType
				stmtN.setInt(3, rs.getInt("idPerson")); //idUniqueID <- grabbing old person id
				stmtN.setInt(4, rs.getInt("idProfile")); //idProfile
				stmtN.setString(5, suggestion);
				stmtN.setInt(6,rs.getInt("confidence"));
				stmtN.addBatch();
				
				idSuggestionIdEntryType.put(rs.getInt("idSuggestion"), getEntryType(rs.getInt("idEntryType")));
				addNewIdSuggestionTypeValueCount(rs.getInt("idSuggestionType"), rs.getString("suggestion").trim());
			}

			stmtN.executeBatch();
		} catch(SQLException e) {
			System.out.println("ERROR suggestions: " + e);
			e.printStackTrace();
			System.out.println("::::::::::::::::::::::::::::::::::");
		}
	}
	
	private void uniqueRowId(Connection connO, Connection connN) {
		System.out.println("starting... uniqueRowId");
		
		// extract all the information from FILE1 (Drafty)
		try (
			PreparedStatement stmtMaxIdSuggestion = connO.prepareStatement("SELECT idSuggestion FROM Suggestion ORDER BY idSuggestion DESC LIMIT 1");
			PreparedStatement stmtPerson = connO.prepareStatement("SELECT idPerson, name, status FROM Person");
			PreparedStatement stmtPersonEntryType = connO.prepareStatement("SELECT idPerson, idEntryType FROM Suggestion GROUP BY idPerson");
			PreparedStatement stmtClickPerson = connO.prepareStatement("SELECT idClickPerson, idProfile, idPerson, rowValues, date, doubleclick FROM ClickPerson WHERE idPerson = ?");
			PreparedStatement stmtUniqueId = connN.prepareStatement("INSERT INTO UniqueId (idUniqueID, active) VALUES (?, ?)");
			PreparedStatement stmtSugg = connN.prepareStatement(insertIntoSuggestions);
			PreparedStatement stmtClick = connN.prepareStatement(insertIntoClick);
		) {
			//get max id suggestion, so all suggestions for prof names are different
			Integer idSuggestion = 0;
			ResultSet rsMaxIdSuggestion = stmtMaxIdSuggestion.executeQuery();
			while(rsMaxIdSuggestion.next()) {
				idSuggestion = rsMaxIdSuggestion.getInt("idSuggestion") + 1;
			}
			
			//get idEntryTypes for each professor
			ResultSet rsPersonEntryType = stmtPersonEntryType.executeQuery();
			while(rsPersonEntryType.next()) {
				Integer idEntryType = getEntryType(rsPersonEntryType.getInt("idEntryType"));
				idPersonIdEntryType.put(rsPersonEntryType.getInt("idPerson"), idEntryType);
			}
			
			//create new uniqueRowIds + new suggestions from professors
			ResultSet rsPerson = stmtPerson.executeQuery();
			while(rsPerson.next()) {
				stmtUniqueId.setInt(1, rsPerson.getInt("idPerson"));
				stmtUniqueId.setInt(2, rsPerson.getInt("status"));
				stmtUniqueId.addBatch();
				
				//(idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence)
				stmtSugg.setInt(1, idSuggestion); 	  
    			stmtSugg.setInt(2, 1); //idSuggestionType
    			stmtSugg.setInt(3, rsPerson.getInt("idPerson")); //idUniqueID
    			stmtSugg.setInt(4, 2); //system id
    			stmtSugg.setString(5, rsPerson.getString("name")); //suggestion
    			stmtSugg.setInt(6, 10);
    			stmtSugg.addBatch();
				
    			//gets all click for prof, and then adds entries to click table + stores interactions
    			stmtClickPerson.setInt(1, rsPerson.getInt("idPerson"));
    			ResultSet rsClickPerson = stmtClickPerson.executeQuery();
    			while(rsClickPerson.next()) {
    				//(idInteraction, idSuggestion, rowvalues)
    				stmtClick.setInt(1, idInteraction);
    				stmtClick.setInt(2, idSuggestion);
    				stmtClick.setString(3, rsClickPerson.getString("rowValues"));
    				stmtClick.addBatch();
    				
    				Integer idInteractionType = 1;
    				if(rsClickPerson.getInt("doubleclick") == 1) { idInteractionType = 10; }
    				idInteraction = addNewInteraction(rsClickPerson.getInt("idProfile"), rsClickPerson.getString("date"), idInteractionType, idInteraction); //idInteractionType = click 1, dbl click 10
    			}		
    			
				idSuggestion++;
			}

			stmtUniqueId.executeBatch();
			stmtSugg.executeBatch();
			stmtClick.executeBatch();
		} catch(SQLException e) {
			System.out.println("ERROR uniqueRowId: " + e);
			e.printStackTrace();
			System.out.println("::::::::::::::::::::::::::::::::::");
		}
	}
	
	private void individualInteractions(Connection connO, Connection connN) {
		System.out.println("starting... individualInteractions");
		
		// extract all the information from FILE1 (Drafty)
		try (
			PreparedStatement stmtClick = connO.prepareStatement("SELECT idClick, idProfile, idSuggestionType, idSuggestion, rowvalues, date, doubleclick FROM Click");
			PreparedStatement stmtFilter = connO.prepareStatement("SELECT idFilter, idProfile, idSuggestionType, filter, date, blur, matchedValues FROM Filter");
			PreparedStatement stmtSort = connO.prepareStatement("SELECT idSort, idProfile, idSuggestionType, date FROM Sort");
			PreparedStatement stmtValidation = connO.prepareStatement("SELECT idValidation, idProfile, idExperiment, mode, date, date_completed FROM Validation ");
			PreparedStatement stmtValSugg = connO.prepareStatement("SELECT idValidation, idSuggestion, new, chosen FROM Validation_Suggestion");
			
			PreparedStatement stmtClickInsert = connN.prepareStatement("INSERT INTO Click (idInteraction, idSuggestion, rowvalues) VALUES (?, ?, ?);");
			PreparedStatement stmtSearchInsert = connN.prepareStatement("INSERT INTO Search (idInteraction, idSuggestionType, idSearchType, isPartial, value, matchedValues) VALUES (?, ?, ?, ?, ?, ?)");
			PreparedStatement stmtSortInsert = connN.prepareStatement("INSERT INTO Sort (idInteraction, idSuggestionType) VALUES (?, ?);");
			PreparedStatement stmtEdit = connN.prepareStatement("INSERT INTO Edit (idInteraction, idSuggestion, idEntryType, chosen) VALUES (?, ?, ?, ?);");
		) {
			// CLICK //
			System.out.println("   click   ");
			ResultSet rsClick = stmtClick.executeQuery();
			while(rsClick.next()) {
				//OLD: idClick, idProfile, idSuggestionType, idSuggestion, rowvalues, date, doubleclick
				stmtClickInsert.setInt(1, idInteraction); //idInteraction
				stmtClickInsert.setInt(2, rsClick.getInt("idSuggestion")); //idSuggestion
				stmtClickInsert.setString(3, rsClick.getString("rowvalues")); //rowvalues
				stmtClickInsert.addBatch();
				
				Integer idInteractionType = 1;
				if(rsClick.getInt("doubleclick") == 1) { idInteractionType = 10; }
				idInteraction = addNewInteraction(rsClick.getInt("idProfile"), rsClick.getString("date"), idInteractionType, idInteraction); //idInteractionType = click 1, dbl click 10
			}
			
			// FILTER //
			System.out.println("   filter   ");
			ResultSet rsFilter = stmtFilter.executeQuery();
			while(rsFilter.next()) {
				
				Integer isPartial = 0;
				if(rsFilter.getInt("blur") == 0) { isPartial = 1; } //blur = 1; means completed search
				
				//OLD: idFilter, idProfile, idSuggestionType, filter, date, blur, matchedValues
				stmtSearchInsert.setInt(1, idInteraction); //idInteraction
				stmtSearchInsert.setInt(2, rsFilter.getInt("idSuggestionType")); //idSuggestionType
				stmtSearchInsert.setInt(3, 1); //idSearchType; 1 = 'equals'
				stmtSearchInsert.setInt(4, isPartial); //isPartial
				stmtSearchInsert.setString(5, rsFilter.getString("filter")); //value
				stmtSearchInsert.setString(6, rsFilter.getString("matchedValues")); //matchedValues
				stmtSearchInsert.addBatch();
				
				idInteraction = addNewInteraction(rsFilter.getInt("idProfile"), rsFilter.getString("date"), 7, idInteraction); //idInteractionType = search
			}
			
			// SORT //
			System.out.println("   sort   ");
			ResultSet rsSort = stmtSort.executeQuery();
			while(rsSort.next()) {
				//OLD: idSort, idProfile, idSuggestionType, date
				stmtSortInsert.setInt(1, idInteraction); //idInteraction
				stmtSortInsert.setInt(2, rsSort.getInt("idSuggestionType")); //idSuggestionType
				
				idInteraction = addNewInteraction(rsSort.getInt("idProfile"), rsSort.getString("date"), 1, idInteraction); //idInteractionType = sort
			}
			
			// VALIDATIONS //
			System.out.println("   validations   ");
			HashMap<Integer, Validation> validations =  new HashMap<Integer, Validation>();
			ResultSet rsValidation = stmtValidation.executeQuery();
			while(rsValidation.next()) {
				//OLD: idValidation, idProfile, date, date_completed
				Validation validation = new Validation();
				validation.setIdProfile(rsValidation.getInt("idProfile"));
				validation.setIdInteraction(idInteraction);
				if(rsValidation.getString("date").equals(rsValidation.getString("date_completed"))) {
					validation.setIdEntryType(1); 		// new row
					validation.setIdInteractionType(5); // new row
				} else {
					validation.setIdEntryType(2); 		// edit online
					validation.setIdInteractionType(6); // edit online	
				}
				validation.setDate(rsValidation.getString("date"));
				
				if(rsValidation.getString("mode").equals("experiment")) {
					idInteractionExperiment.put(idInteraction, rsValidation.getInt("idExperiment"));
				}
				
				validations.put(rsValidation.getInt("idValidation"), validation);
				
				idInteraction = addNewInteraction(validation.getIdProfile(), validation.getDate(), validation.getIdInteractionType(), idInteraction);
			}
			
			// VALIDATIONS SUGGESTIONS //
			System.out.println("   validation suggestions   ");
			ResultSet rsValSugg = stmtValSugg.executeQuery();
			while(rsValSugg.next()) {
				Validation validation = validations.get(rsValSugg.getInt("idValidation"));

				//OLD: idValidation, idSuggestion, new, chosen
				if(validation.getIdEntryType().equals(1)) { //new row
					stmtEdit.setInt(1, validation.getIdInteraction()); //idInteraction
					stmtEdit.setInt(2, rsValSugg.getInt("idSuggestion")); //idSuggestion
					stmtEdit.setInt(3, validation.getIdEntryType());//idEntryType
					stmtEdit.setInt(4, 1);//chosen bc new entry
					stmtEdit.addBatch();
				} else {
					stmtEdit.setInt(1, validation.getIdInteraction()); //idInteraction
					stmtEdit.setInt(2, rsValSugg.getInt("idSuggestion")); //idSuggestion
					stmtEdit.setInt(3, validation.getIdEntryType());//idEntryType
					stmtEdit.setInt(4, rsValSugg.getInt("chosen"));//chosen
					stmtEdit.addBatch();
				}
			}
			
			stmtClickInsert.executeBatch();
			stmtSearchInsert.executeBatch();
			stmtSortInsert.executeBatch();
			stmtEdit.executeBatch();
		} catch(SQLException e) {
			System.out.println("ERROR individualInteractions: " + e);
			e.printStackTrace();
			System.out.println("::::::::::::::::::::::::::::::::::");
		}
	}  
	
	
	private void profiles(Connection connO, Connection connN) {
		System.out.println("starting... profiles");
		
		// extract all the information from FILE1 (Drafty)
		try (
			PreparedStatement stmtProfile = connO.prepareStatement("SELECT idProfile, name, email, date_created, date_updated, logins FROM Profile WHERE idProfile > 1");
			PreparedStatement stmtProfileInsert = connN.prepareStatement("INSERT INTO Profile (idProfile, idRole, username, email, password, passwordRaw) VALUES (?, '2', ?, null, null, null);");
			PreparedStatement stmtProfileSystem2 = connN.prepareStatement("INSERT IGNORE INTO Profile (idProfile, idRole, username, email, password, passwordRaw, date_created, date_updated) VALUES ('2', '1', 'system', 'sw90@cs.brown.edu', '$2a$10$yNLWB88HUCX5Gthz9jA9WOE8bkRcEkfVfOUKF4VTmMKMtJiTtuHYG', 'q1w2e3r4', '2017-09-27 16:29:38', '2017-09-27 16:29:38')");
			PreparedStatement stmtProfileSystem1 = connN.prepareStatement("INSERT IGNORE INTO Profile (idProfile, idRole, username, email, password, passwordRaw, date_created, date_updated) VALUES ('1', '1', 'swallace', 'shaun_wallace@brown.edu', '$2a$10$yNLWB88HUCX5Gthz9jA9WOE8bkRcEkfVfOUKF4VTmMKMtJiTtuHYG', 'q1w2e3r4', '2017-09-27 16:29:38', '2017-09-27 16:29:38')");
			PreparedStatement stmtProfileSystem3 = connN.prepareStatement("INSERT IGNORE INTO Profile (idProfile, idRole, username, email, password, passwordRaw, date_created, date_updated) VALUES ('3', '2', 'anonymous_user', null, '$2a$10$yNLWB88HUCX5Gthz9jA9WOE8bkRcEkfVfOUKF4VTmMKMtJiTtuHYG', 'q1w2e3r4', '2018-05-12 00:00:00', '2018-05-12 00:00:00')");
			PreparedStatement stmtViewChangeInsert = connN.prepareStatement("INSERT INTO ViewChange (idInteraction, viewname) VALUES (?, 'spreadsheet');");
		) {
			ResultSet rsProfile = stmtProfile.executeQuery();
			while(rsProfile.next()) {
				//INSERT PROFILES
				Random rand = new Random();
				Integer n1 = rand.nextInt(5000) + 1;
				Integer n2 = rand.nextInt(5000) + n1;
				
				stmtProfileInsert.setInt(1, rsProfile.getInt("idProfile"));
				stmtProfileInsert.setString(2, "anonymous_user" + rsProfile.getString("idProfile") + n2);
				stmtProfileInsert.addBatch();
				
				//idProfileLogins use to guess how many sessions there should be. 
				idProfileLogins.put(rsProfile.getInt("idProfile"), rsProfile.getInt("logins"));
				
				//viewChange interaction <- only have data to assume when session is created
				stmtViewChangeInsert.setInt(1, idInteraction);
				stmtViewChangeInsert.addBatch();
				
				idInteraction = addNewInteraction(rsProfile.getInt("idProfile"), rsProfile.getString("date_created"), 3, idInteraction); //viewChange idInteractionType = 3
				
				if((rsProfile.getDate("date_created") != rsProfile.getDate("date_updated")) && (!AjobsUI.getApi().isStringNull(rsProfile.getString("date_updated"))) ) {
					stmtViewChangeInsert.setInt(1, idInteraction);
					stmtViewChangeInsert.addBatch();
					
					idInteraction = addNewInteraction(rsProfile.getInt("idProfile"), rsProfile.getString("date_updated"), 3, idInteraction); //viewChange idInteractionType = 3
				}
			}
			
			stmtProfileSystem1.executeUpdate();
			stmtProfileSystem2.executeUpdate();
			stmtProfileSystem3.executeUpdate();
			
			stmtProfileInsert.executeBatch();
			stmtViewChangeInsert.executeBatch();
		} catch(SQLException e) {
			System.out.println("ERROR profiles: " + e);
			e.printStackTrace();
			System.out.println("::::::::::::::::::::::::::::::::::");
		}
	}
	
	private void sessionsAndFinalInteractions(Connection connO, Connection connN) {
		System.out.println("starting... sessionsAndFinalInteractions");
		
		// extract all the information from FILE1 (Drafty)
		try (
			PreparedStatement stmtInteractionInsert = connN.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType, timestamp) VALUES (?, ?, ?, ?)");
			PreparedStatement stmtSessionInsert = connN.prepareStatement("INSERT INTO Session (idSession, idProfile, start, end) VALUES (?, ?, ?, ?)");
			PreparedStatement stmtExperimentSessionInsert = connN.prepareStatement("INSERT INTO Experiment_Session (idExperiment, idSession, date_created) VALUES (?, ?, ?)");
		) {
			Integer minDateDiff = 15; //minutes
			for(Entry<Integer, HashMap<Integer, Date>> e1 : profileInteractionDates.entrySet()) {
				HashMap<Integer, Date> idInteractionDate = sortByValue(e1.getValue(), true); //sorts dates
				Integer idProfile = e1.getKey();
				Entry<Integer, Date> entryIdInteractionDate = idInteractionDate.entrySet().iterator().next();
				Date oldDate = entryIdInteractionDate.getValue(); //make first date
				
				boolean isNewProfile = true;
				for(Entry<Integer, Date> e2 : idInteractionDate.entrySet()) {	
					Integer idInteraction = e2.getKey();
					Date newDate = e2.getValue();
					if(idInteraction != 59598) { //59598 throws some weird error when it is written for idInteractionType 3
						Integer minutesDiff = (int) getDateDiff(oldDate, newDate, TimeUnit.MINUTES);
						if(isNewProfile) {
							addNewSession(idProfile, newDate);
							isNewProfile = false;
						} else if(minutesDiff >= minDateDiff) {
							//create new session (first: update end date for previous session)
							if(idSessionSession.containsKey(idSession)) {
								Session oldSession = idSessionSession.get(idSession);
								idSessionSession.remove(idSession);
								oldSession.setEnd(convertDateToString(oldDate));
								idSessionSession.put(idSession, oldSession);
							}
							addNewSession(idProfile, newDate);
						}
						
						//idInteraction, idSession, idInteractionType, timestamp
						stmtInteractionInsert.setInt(1, idInteraction); //idInteraction
						stmtInteractionInsert.setInt(2, idSession);     //idSession
						stmtInteractionInsert.setInt(3, idInteractionIdInteractionType.get(idInteraction)); //idInteractionType
						stmtInteractionInsert.setString(4, convertDateToString(newDate)); //timestamp
						stmtInteractionInsert.addBatch();
						
						//idExperiment, idSession, date_created
						if(idInteractionExperiment.containsKey(idInteraction)) {
							stmtExperimentSessionInsert.setInt(1, idInteractionExperiment.get(idInteraction)); //idExperiment
							stmtExperimentSessionInsert.setInt(2, idSession); //idSession
							stmtExperimentSessionInsert.setString(3, convertDateToString(newDate)); //date_created
							stmtExperimentSessionInsert.addBatch();
						}
						
						oldDate = newDate;
					}
				}
			}
			
			//add sessions to
			for(Entry<Integer, Session> e : idSessionSession.entrySet()) {
				Session session = e.getValue();
				stmtSessionInsert.setInt(1, session.getIdSession()); //idSession
				stmtSessionInsert.setInt(2, session.getIdProfile()); //idProfile
				stmtSessionInsert.setString(3, session.getStart()); //start
				stmtSessionInsert.setString(4, session.getEnd()); //end
				stmtSessionInsert.addBatch();
			}
			
			stmtInteractionInsert.executeBatch();
			stmtSessionInsert.executeBatch();
			stmtExperimentSessionInsert.executeBatch();
		} catch(SQLException e) {
			System.out.println("ERROR sessionsAndFinalInteractions: " + e);
			e.printStackTrace();
			System.out.println("::::::::::::::::::::::::::::::::::");
			
			System.out.println(idInteraction);;
		}
	}
	
	
	/*
	 * SELECT * FROM Suggestion ORDER BY idPerson ASC, date DESC
	 */
	private void suggestionsCreatedByLastUpdated(Connection connO, Connection connN) {
		System.out.println("starting... suggestionsCreatedByLastUpdated");
		
		// extract all the information from FILE1 (Drafty)
		try (
			PreparedStatement stmtOldSuggs = connO.prepareStatement("SELECT idSuggestion, idPerson, IF(max(idProfile) IS NULL, 2, max(idProfile)) as max_idProfile, IF(max(idProfile) IS NULL, 2, min(idProfile)) as min_idProfile, max(DATE_FORMAT(date, '%Y-%m-%d')) as date_fmt  FROM Suggestion GROUP BY idPerson ORDER BY idSuggestion ASC");
			PreparedStatement stmtInsert = connN.prepareStatement(insertIntoSuggestions);
		) {
			ResultSet rs = stmtOldSuggs.executeQuery();
			while(rs.next()) {
				Integer idPerson = rs.getInt("idPerson");
				String max_idProfile = rs.getString("max_idProfile");
				String min_idProfile = rs.getString("min_idProfile");
				
				// last edited
				stmtInsert.setString(1, null); //idSuggestion
				stmtInsert.setInt(2, 13); //idSuggestionType
				stmtInsert.setInt(3, idPerson); //idUniqueID <- grabbing old person id
				stmtInsert.setString(4, min_idProfile); //idProfile
				stmtInsert.setString(5, max_idProfile); // <- latest person who updated the row
				stmtInsert.setInt(6, 10);
				stmtInsert.addBatch();
				
				// last updated
				stmtInsert.setString(1, null); //idSuggestion
				stmtInsert.setInt(2, 14); //idSuggestionType
				stmtInsert.setInt(3, idPerson); //idUniqueID <- grabbing old person id
				stmtInsert.setString(4, min_idProfile); //idProfile
				stmtInsert.setString(5, rs.getString("date_fmt"));
				stmtInsert.setInt(6, 10);
				stmtInsert.addBatch();
			}
			
			stmtInsert.executeBatch();
		} catch(SQLException e) {
			System.out.println("ERROR profiles: " + e);
			e.printStackTrace();
			System.out.println("::::::::::::::::::::::::::::::::::");
		}
	}
	
	
	////UTILITY FUNCTIONS////
	private HashMap<Integer, Date> sortByValue(HashMap<Integer, Date> unsortMap, boolean isASC) {
        List<Entry<Integer, Date>> list = new LinkedList<>(unsortMap.entrySet());
        // Sorting the list based on values
        list.sort((o1, o2) -> isASC ? o1.getValue().compareTo(o2.getValue()) == 0
                ? o1.getKey().compareTo(o2.getKey())
                : o1.getValue().compareTo(o2.getValue()) : o2.getValue().compareTo(o1.getValue()) == 0
                ? o2.getKey().compareTo(o1.getKey())
                : o2.getValue().compareTo(o1.getValue()));
        return list.stream().collect(Collectors.toMap(Entry::getKey, Entry::getValue, (a, b) -> b, LinkedHashMap::new));
    }
	
	private void disableForeignKeyChecks(Connection connN) throws SQLException {
		Statement stmt = connN.createStatement();
		stmt.execute("SET FOREIGN_KEY_CHECKS=0");
		stmt.close();
	}
	
	private void enableForeignKeyChecks(Connection connN) throws SQLException {
		Statement stmt = connN.createStatement();
		stmt.execute("SET FOREIGN_KEY_CHECKS=1");
		stmt.close();
	}
	
	private Integer addNewInteraction(Integer idProfile, String timestamp, Integer idInteractionType, Integer idInteractionOld) {
		idInteractionIdInteractionType.put(idInteractionOld, idInteractionType);
		HashMap<Integer, Date> interactions = new HashMap<Integer, Date>();
		if(profileInteractionDates.containsKey(idProfile)) {
			interactions = profileInteractionDates.get(idProfile);
		} 
		Date date = convertStringToDate(timestamp);
		interactions.put(idInteractionOld, date);
		profileInteractionDates.put(idProfile, interactions);
		
		idInteractionOld++;
		return idInteractionOld;
	}
	
	private void addNewIdSuggestionTypeValueCount(Integer idSuggestionType, String value) {
		
		//cleans out country identifiers for University column
		value = cleanUniversityName(value, idSuggestionType);
		
		if(idSuggestionTypeValueCount.containsKey(idSuggestionType)) {
			HashMap<String, Integer> valueCount = idSuggestionTypeValueCount.get(idSuggestionType);
			if(idSuggestionTypeValueCount.get(idSuggestionType).containsKey(value)) {
				Integer count = idSuggestionTypeValueCount.get(idSuggestionType).get(value) + 1;
				valueCount.put(value, count);
				idSuggestionTypeValueCount.put(idSuggestionType, valueCount);
			} else {
				valueCount.put(value, 1);
				idSuggestionTypeValueCount.put(idSuggestionType, valueCount);
			}
		} else {
			HashMap<String, Integer> valueCount = new HashMap<String, Integer>();
			valueCount.put(value, 1);
			idSuggestionTypeValueCount.put(idSuggestionType, valueCount);
		}
	}
	
	private String cleanUniversityName(String value, Integer idSuggestionType) {
		if(idSuggestionType.equals(2)) { //University
			value = value.replaceAll(" - USA", "");
			value = value.replaceAll(" - Canada", "");
			value = value.replaceAll(" (USA)", "");
			value = value.replaceAll(" (Canada)", "");
		}
		return value.trim();
	}
	
	private void addNewSession(Integer idProfile, Date newDate) {
		idSession++; 
		Session newSession = new Session();
		newSession.setIdSession(idSession);
		newSession.setIdProfile(idProfile);
		newSession.setStart(convertDateToString(newDate));
		idSessionSession.put(idSession, newSession);
	}
	
	private Integer getEntryType(Integer oldEntryType) throws SQLException {
		Integer newEntryType = 1;
		//1 NewRow
		//2 EditOnline
		//3 System
		//4 API
		//5 Import-Profs-Spring-2014
		//6 Import-Profs-Spring-2015
		//7 Import-Profs-Spring-2018
		
		if(oldEntryType.equals(1)) {
			newEntryType = 3;
		} else if(oldEntryType.equals(2)) {
			newEntryType = 5;
		} else if(oldEntryType.equals(3)) {
			newEntryType = 6;
		} else if(oldEntryType.equals(4)) {
			newEntryType = 2;
		} else if(oldEntryType.equals(5)) {
			newEntryType = 2;
		} else if(oldEntryType.equals(6)) {
			newEntryType = 2;
		} else if(oldEntryType.equals(7)) {
			newEntryType = 2;
		} else if(oldEntryType.equals(8)) {
			newEntryType = 2;
		} else if(oldEntryType.equals(9)) {
			newEntryType = 2;
		} else if(oldEntryType.equals(10)) {
			newEntryType = 2;
		} else if(oldEntryType.equals(11)) {
			newEntryType = 1;
		}
		return newEntryType;
	}
	
	/**
	 * Get a diff between two dates
	 * @param date1 the oldest date
	 * @param date2 the newest date
	 * @param timeUnit the unit in which you want the diff
	 * @return the diff value, in the provided unit
	 */
	public long getDateDiff(Date date1, Date date2, TimeUnit timeUnit) {
	    long diffInMillies = date2.getTime() - date1.getTime();
	    return timeUnit.convert(diffInMillies,TimeUnit.MILLISECONDS);
	}
	
	private Date convertStringToDate(String dateInString) {
		SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		Date date = null;
        try {
            date = formatter.parse(dateInString);
            //System.out.println(date);
        } catch (Exception e) {
        	//do nothing not a good date
            e.printStackTrace();
        }
        
        return date;
	}
	
	private String convertDateToString(Date dateAsDate) {
		DateFormat df = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
		String date = null;
        try {
            date = df.format(dateAsDate);
            //System.out.println(date);
        } catch (Exception e) {
        	//do nothing not a good date
            e.printStackTrace();
        }
        
        return date;
	}
	
	private class Validation {
		private Integer idProfile;
		private Integer idEntryType;
		private Integer idInteraction;
		private Integer idInteractionType;
		private String date;
		
		public Integer getIdProfile() {
			return idProfile;
		}
		public void setIdProfile(Integer idProfile) {
			this.idProfile = idProfile;
		}
		public Integer getIdEntryType() {
			return idEntryType;
		}
		public void setIdEntryType(Integer idEntryType) {
			this.idEntryType = idEntryType;
		}
		public Integer getIdInteraction() {
			return idInteraction;
		}
		public void setIdInteraction(Integer idInteraction) {
			this.idInteraction = idInteraction;
		}
		public Integer getIdInteractionType() {
			return idInteractionType;
		}
		public void setIdInteractionType(Integer idInteractionType) {
			this.idInteractionType = idInteractionType;
		}
		public String getDate() {
			return date;
		}
		public void setDate(String date) {
			this.date = date;
		}
	}
	
	private class Session {
		private Integer idSession;
		private Integer idProfile;
		private String start;
		private String end;
		
		public Integer getIdSession() {
			return idSession;
		}
		public void setIdSession(Integer idSession) {
			this.idSession = idSession;
		}
		public Integer getIdProfile() {
			return idProfile;
		}
		public void setIdProfile(Integer idProfile) {
			this.idProfile = idProfile;
		}
		public String getStart() {
			return start;
		}
		public void setStart(String start) {
			this.start = start;
		}
		public String getEnd() {
			return end;
		}
		public void setEnd(String end) {
			this.end = end;
		}
	}
}
