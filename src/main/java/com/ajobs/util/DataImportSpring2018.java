package com.ajobs.util;

import java.io.FileReader;
import java.io.IOException;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.text.DecimalFormat;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map.Entry;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.ajobs.AjobsUI;
import com.ajobs.util.similarity.JaroWinkler;
import com.opencsv.CSVReader;

public class DataImportSpring2018 {
	
	private String jndi = "java:/MySqlDS_profs";
	private String jndi2018 = "java:/MySqlDS_crowdsourcing_spring2018";
	private JaroWinkler jaroWinkler = new JaroWinkler();
	private DecimalFormat decimalFormat = new DecimalFormat("#.00");
	private String sep = ":::";
	
	/*
	 *  clean all data
	 *  	1. clean for entry
	 *  	2. clean for looking up
	 * 
	 *  does row not exist?
	 *  	add new row
	 *  if exists
	 *  	check each suggestion
	 *  		if does not exist
	 *  			add suggestion
	 *  
	 */
	
	// key: profName|*|universityName
	private HashMap<String, ProfsSp2018Dmn> newDataOrig = new HashMap<String, ProfsSp2018Dmn>();
	private HashMap<String, ProfsSp2018Dmn> newDataClnd = new HashMap<String, ProfsSp2018Dmn>();
	private HashMap<String, ProfsSp2018Dmn> newDataLook = new HashMap<String, ProfsSp2018Dmn>();
	
	// key: profName|*|universityName -> idUniqueID
	private HashMap<String, String> draftyDataProfNameUniqueID = new HashMap<String, String>();
	
	// key: idUniqueID|*|idSuggestionType -> values as list
	//private HashMap<String, List<String>> oldDataLook = new HashMap<String, List<String>>();
	// key: idUniqueID|*|idSuggestionType -> values as list
	private HashMap<String, LinkedHashMap<String, String>> profsDataLookup = new HashMap<String, LinkedHashMap<String, String>>();
				
	// for writing to db
	private HashMap<String, ProfsSp2018Dmn> extraProfs = new HashMap<String, ProfsSp2018Dmn>();
	private HashMap<String, ProfsSp2018Dmn> existProfs = new HashMap<String, ProfsSp2018Dmn>();
	
	public DataImportSpring2018() {
		
	}
	
	public void runDataMatch() {
		populateImportData();
		populateProfsData();
		compareData();
	}
	
	private void populateProfsData() {
		System.out.println("start populateProfsData()...");
		// read from DB
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
				PreparedStatement stmt = conn.prepareStatement("SELECT s.* FROM Suggestions s INNER JOIN UniqueId u ON u.idUniqueID = s.idUniqueID WHERE s.active != 0 AND u.active != 0 ORDER BY s.idUniqueID, s.idSuggestionType, s.confidence desc");
			) {
			ResultSet rs = stmt.executeQuery();
			
			/*
			 * populate lookup for Prof Name + University
			 * populate 
			 */
			
			String key = "";
			String old_idUniqueID = "";
			String old_idSuggestionType = "";
			String profName = "";
			String profUni  = "";
			boolean addNewProf = true;
			while(rs.next()) {
				 String idUniqueID       = rs.getString("idUniqueID");
				 String idSuggestion     = rs.getString("idSuggestion");
				 String idSuggestionType = rs.getString("idSuggestionType");
				 String suggestion       = rs.getString("suggestion");
				 
				 if(!idUniqueID.equals(old_idUniqueID) && idSuggestionType.equals("1")) { //new professor
					 profName = suggestion;
					 profName = cleanName(profName, false); 
					 profName = cleanNameLookup(profName);
					 addNewProf = true;
				 } else if(idSuggestionType.equals("2") && addNewProf) { //new university
					 profUni = prepLookup(suggestion);
					 //profUni = prepLookup(profUni); //causes null pointer? :/
					 addNewProf = false;
					 
					 key = profName + sep + profUni;
					 draftyDataProfNameUniqueID.put(key, idUniqueID);
				 }
				 
				 if(!idSuggestionType.equals(old_idSuggestionType) && Integer.valueOf(idSuggestionType) > 2) { //new column
					 String keySuggs = idUniqueID + sep + idSuggestionType;
					 suggestion = prepLookup(suggestion);
					 if(profsDataLookup.containsKey(keySuggs)) {
						 profsDataLookup.get(keySuggs).put(idSuggestion, suggestion);
					 } else {
						 LinkedHashMap<String, String> newSuggs = new LinkedHashMap<String, String>();
						 newSuggs.put(idSuggestion, suggestion);
						 profsDataLookup.put(keySuggs, newSuggs);
					 }
				 }
				 
				 old_idUniqueID = idUniqueID;
				 old_idSuggestionType = idSuggestionType;
			}
		} catch (SQLException | NamingException e) {
	        System.out.println(e);
	    }
	}

	private void compareData() {
		System.out.println("starting compareData...");
		// if prof does not exist
			// add to missing table + create new prof
		// else 
			// add to exists table 
			// if suggestion exists (check each suggestion)
				// increment count/edit
			// else
				// add new suggestion
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi2018)).getConnection();
				PreparedStatement stmtEmpty1 = conn.prepareStatement("TRUNCATE spring2018_matched ");
				PreparedStatement stmtEmpty2 = conn.prepareStatement("TRUNCATE spring2018_suggestion_match ");
				PreparedStatement stmtInsRow = conn.prepareStatement("INSERT INTO spring2018_matched (id, NameSpring18, UniversitySpring18, NameOldDrafty, UniversityOldDrafty, jaroProf, jaroUniv, idUniqueID, matched) "
																	+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);");
				PreparedStatement stmtInsMatch = conn.prepareStatement("INSERT INTO spring2018_suggestion_match (idSpring2018Import, idUniqueID, idSuggestionType, SuggSpring18, SuggOldDrafty, idSuggOldDrafty, jaro, rank, matched) "
																	+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?);");
			) {
				conn.setAutoCommit(false);
				stmtEmpty1.execute();
				stmtEmpty2.execute();
				
				for(Entry<String, ProfsSp2018Dmn> e : newDataLook.entrySet()) {
					String newProfUnivNames = e.getKey();
					String[] keySplit = newProfUnivNames.split(sep);
					String newProfName = keySplit[0];
					String newUnivName = keySplit[1];
					ProfsSp2018Dmn newProfLook = e.getValue();
					
					String[] profMatch = doesProfExist(newProfName, newUnivName);
					String exists = profMatch[0];
					String idUniqueID = profMatch[1];
					String NameOldDrafty = profMatch[2];
					String UniversityOldDrafty = profMatch[3];
					String jaroProf = profMatch[4];
					String jaroUniv = profMatch[5];
					
					String matchedProf = "do_not_know";
					if(!exists.equals("does_not_exist")) {
						matchedProf = "matched";
						
						// prof exists, need to check each suggestion
						for(Entry<Integer, String> v : newProfLook.getSuggestions().entrySet()) {
							String idSuggestionType = v.getKey().toString();
							
							if(!idSuggestionType.equals("1") && !idSuggestionType.equals("2")) {
								String suggNew = v.getValue();
								
								String matchedDefault = "do_not_know";
								String suggMatched = checkColumnsForDefaults(matchedDefault, idSuggestionType, suggNew);
								if(suggMatched.equals("incorrect")) {
									//idSpring2018Import, idUniqueID, idSuggestionType, SuggSpring18, SuggOldDrafty, idSuggOldDrafty, jaro, rank, matched
									stmtInsMatch.setString(1, newProfLook.getId());
									stmtInsMatch.setString(2, idUniqueID);
									stmtInsMatch.setString(3, idSuggestionType);
									stmtInsMatch.setString(4, suggNew);
									stmtInsMatch.setString(5, null);
									stmtInsMatch.setString(6, null);
									stmtInsMatch.setString(7, null); //jaro
									stmtInsMatch.setString(8, "1"); //rank
									stmtInsMatch.setString(9, suggMatched);     //matched
									stmtInsMatch.addBatch();
								} else {
									Integer rank = 1;
									
									String key = idUniqueID + sep + idSuggestionType;
									HashMap<String, String> oldSuggs = profsDataLookup.get(key);
									for(Entry<String, String> oldSugg : oldSuggs.entrySet()) {
										String idSuggOld = oldSugg.getKey();
										String suggOld = oldSugg.getValue();
										double jaro = jaroWinkler.similarity(suggNew, suggOld);
										
										if(jaro >= 0.95) { 
											suggMatched = "matched"; 
										} else if (jaro < 0.8) {
											suggMatched = "incorrect"; 
										}
										
										suggMatched = checkCorrectColumnsForDefaults(suggMatched, idSuggestionType, suggNew, suggOld);
										
										//idUniqueID, idSuggestionType, SuggSpring18, SuggOldDrafty, idSuggOldDrafty, jaro, rank, matched
										stmtInsMatch.setString(1, newProfLook.getId());
										stmtInsMatch.setString(2, idUniqueID);
										stmtInsMatch.setString(3, idSuggestionType); // TODO: coming up '' here?
										stmtInsMatch.setString(4, suggNew);
										stmtInsMatch.setString(5, suggOld);
										stmtInsMatch.setString(6, idSuggOld);
										stmtInsMatch.setString(7, decimalFormat.format(jaro));
										stmtInsMatch.setString(8, rank.toString()); //rank
										stmtInsMatch.setString(9, suggMatched);     //matched
										stmtInsMatch.addBatch();
										
										rank++;
									}
								}
							}
						}
					} else {
						// prof does not exist, need to record
						for(Entry<Integer, String> v : newProfLook.getSuggestions().entrySet()) {
							String idSuggestionType = v.getKey().toString();
							
							if(!idSuggestionType.equals("1") && !idSuggestionType.equals("2")) {
								String suggNew = v.getValue();
								// no match
								stmtInsMatch.setString(1, newProfLook.getId());
								stmtInsMatch.setString(2, null);
								stmtInsMatch.setString(3, idSuggestionType); // TODO: coming up '' here?
								stmtInsMatch.setString(4, suggNew);
								stmtInsMatch.setString(5, null);
								stmtInsMatch.setString(6, null);
								stmtInsMatch.setString(7, "0.00");
								stmtInsMatch.setString(8, "1"); //rank
								stmtInsMatch.setString(9, "do_not_know");     //matched
								stmtInsMatch.addBatch();
							}
						}
					}
					
					//id, NameSpring18, UniversitySpring18, NameOldDrafty, UniversityOldDrafty, jaroProf, jaorUniv, idUniqueID, matched
					stmtInsRow.setString(1, newProfLook.getId());
					stmtInsRow.setString(2, newProfLook.getFullName());
					stmtInsRow.setString(3, newProfLook.getUniversity());
					stmtInsRow.setString(4, NameOldDrafty);
					stmtInsRow.setString(5, UniversityOldDrafty);
					stmtInsRow.setString(6, jaroProf);
					stmtInsRow.setString(7, jaroUniv);
					stmtInsRow.setString(8, idUniqueID);
					stmtInsRow.setString(9, matchedProf);
					stmtInsRow.addBatch();
				}
				
				stmtInsRow.executeBatch();
				stmtInsMatch.executeBatch();
				
				conn.commit();
				conn.setAutoCommit(true);
		} catch (Exception e) {
			AjobsUI.getApi().logError(e);
	    } 
		System.out.println("Done with compareData");
	}
	
	private String checkColumnsForDefaults(String matched, String idSuggestionType, String newVal) {
		if(AjobsUI.getApiNew().isStringNull(newVal)) {
			if(idSuggestionType.equals("3") || idSuggestionType.equals("5") || idSuggestionType.equals("7") || idSuggestionType.equals("8") || idSuggestionType.equals("9") || idSuggestionType.equals("10")) {
				matched = "incorrect";
			} 
		}
		
		if(idSuggestionType.equals("8")) {
			if(newVal.equals("assistant") || newVal.equals("associate") || newVal.equals("full")) {
				// do nothing
			} else {
				matched = "incorrect";
			}
		}
		
		return matched;
	}
	
	private String checkCorrectColumnsForDefaults(String matched, String idSuggestionType, String newVal, String oldVal) {
		// fields in Drafty that should not be null, so lets trust the crowdworker
		if(AjobsUI.getApiNew().isStringNull(oldVal)) {
			if(idSuggestionType.equals("3") || idSuggestionType.equals("5") || idSuggestionType.equals("7") || idSuggestionType.equals("8") || idSuggestionType.equals("9") || idSuggestionType.equals("10")) {
				matched = "correct";
			} 
		}
		
		// the crowdworker identified gender, but drafty did not
		if(idSuggestionType.equals("10")) {
			if(AjobsUI.getApiNew().isStringNull(oldVal)) {
				matched = "correct";
			}
		}
		
		// join year must match exactly
		if(idSuggestionType.equals("7")) {
			if(newVal.equals(oldVal)) {
				matched = "correct";
			} else {
				matched = "incorrect";
			}
		}
		
		return matched;
	}
	
	private String[] doesProfExist(String newProfName, String newUnivName) {
		String[] draftyProf = {"does_not_exist","0","","","0.00","0.00"};
		for(Entry<String, String> e : draftyDataProfNameUniqueID.entrySet()) {
			String[] keySplit = e.getKey().split(sep);
			String oldProfName = keySplit[0];
			String oldUnivName = keySplit[1];
			double jaroProf = jaroWinkler.similarity(newProfName, oldProfName);
			
			if(jaroProf >= 0.95) {
				double jaroUniv = jaroWinkler.similarity(newUnivName, oldUnivName);
				
				if(jaroUniv >= 0.95) {
					// it's a match!
					//System.out.println(e.getValue() + " --- " + newProfName + " = " + oldProfName + " >" + jaroProf + " :: " + newUnivName  + " = " + oldUnivName + " >" + jaroUniv );
					draftyProf[0] = "matched"; //
					draftyProf[1] = e.getValue(); //idUniqueID
					draftyProf[2] = oldProfName;
					draftyProf[3] = oldUnivName;
					draftyProf[4] = decimalFormat.format(jaroProf);
					draftyProf[5] = decimalFormat.format(jaroUniv);
					break;
				}
			}
		}
		
		return draftyProf;
	}

	private void populateImportData() {
		System.out.println("starting populateImportData()...");
		
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi2018)).getConnection();
				PreparedStatement stmtCleaned = conn.prepareStatement("SELECT * FROM spring2018_cleaned");
				PreparedStatement stmtLookup = conn.prepareStatement("SELECT * FROM spring2018_lookup");
			) {
				ResultSet rsCleaned = stmtCleaned.executeQuery();
				
				while(rsCleaned.next()) {
					ProfsSp2018Dmn profOrig = new ProfsSp2018Dmn();
					
					profOrig.setId(rsCleaned.getString(1));
					profOrig.addNewField(rsCleaned.getString("Name"), 1); //FullName
					profOrig.addNewField(rsCleaned.getString("University"), 2); //University
					profOrig.addNewField(rsCleaned.getString("JoinYear"), 7);
					profOrig.addNewField(rsCleaned.getString("Rank"), 8);
					profOrig.addNewField(rsCleaned.getString("Subfield"), 9);
					profOrig.addNewField(rsCleaned.getString("Bachelors"), 3);
					profOrig.addNewField(rsCleaned.getString("Masters"), 4);
					profOrig.addNewField(rsCleaned.getString("Doctorate"), 5);
					profOrig.addNewField(rsCleaned.getString("PostDoc"), 6);
					profOrig.addNewField(rsCleaned.getString("Gender"), 10);
					profOrig.addNewField(rsCleaned.getString("PhotoUrl"), 11);
					profOrig.addNewField(rsCleaned.getString("Sources"), 12);
					
					newDataClnd.put(rsCleaned.getString(2)+sep+rsCleaned.getString(3), profOrig);
				}
				
				ResultSet rsLookup = stmtLookup.executeQuery();
				while(rsLookup.next()) {
					ProfsSp2018Dmn profLook = new ProfsSp2018Dmn();
					
					profLook.setId(rsLookup.getString(1));
					profLook.addNewField(rsLookup.getString("Name"), 1); //FullName
					profLook.addNewField(rsLookup.getString("University"), 2); //University
					profLook.addNewField(rsLookup.getString("JoinYear"), 7);
					profLook.addNewField(rsLookup.getString("Rank"), 8);
					profLook.addNewField(rsLookup.getString("Subfield"), 9);
					profLook.addNewField(rsLookup.getString("Bachelors"), 3);
					profLook.addNewField(rsLookup.getString("Masters"), 4);
					profLook.addNewField(rsLookup.getString("Doctorate"), 5);
					profLook.addNewField(rsLookup.getString("PostDoc"), 6);
					profLook.addNewField(rsLookup.getString("Gender"), 10);
					profLook.addNewField(rsLookup.getString("PhotoUrl"), 11);
					profLook.addNewField(rsLookup.getString("Sources"), 12);

					newDataLook.put(rsLookup.getString(2)+sep+rsLookup.getString(3), profLook);
				}
			} catch (SQLException | NamingException e) {
		        System.out.println(e);
		    }
		
		System.out.println("done populateOldData()");
	}
	
	public void writeCurDataFromDB() {
		System.out.println("starting populateCurData()...");
		
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi2018)).getConnection();
			PreparedStatement stmtSpring2018 = conn.prepareStatement("SELECT * FROM spring2018 ");
			PreparedStatement stmtEmpty1 = conn.prepareStatement("TRUNCATE spring2018_cleaned ");
			PreparedStatement stmtEmpty2 = conn.prepareStatement("TRUNCATE spring2018_lookup ");
			PreparedStatement stmtClean = conn.prepareStatement(
					"INSERT INTO spring2018_cleaned (id, Name, University, JoinYear, Rank, Subfield, Bachelors, Masters, Doctorate, PostDoc, Gender, PhotoUrl, Sources) "
					+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
			PreparedStatement stmtLook = conn.prepareStatement(
					"INSERT INTO spring2018_lookup (id, Name, University, JoinYear, Rank, Subfield, Bachelors, Masters, Doctorate, PostDoc, Gender, PhotoUrl, Sources) "
					+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
			) {
				
				// Autocommit is true by default,
	   			// so setting it to false as we are manually committing later
	   			conn.setAutoCommit(false);
	   			/*
	   			stmtEmpty1.addBatch("SET FOREIGN_KEY_CHECKS = 0");
	   			stmtEmpty2.addBatch("SET FOREIGN_KEY_CHECKS = 0");
	   			stmtEmpty1.execute();
	   			stmtEmpty2.execute();
	   			stmtEmpty1.addBatch("SET FOREIGN_KEY_CHECKS = 1");
	   			stmtEmpty2.addBatch("SET FOREIGN_KEY_CHECKS = 1");
	   			*/
				ResultSet rsSpring2018 = stmtSpring2018.executeQuery();
				
				while(rsSpring2018.next()) {
					String profName = rsSpring2018.getString("Name");
					profName = profName.trim();
					String profNameClean = cleanName(profName, true);
					String profNameLook = cleanNameLookup(profNameClean).trim();
					
					Integer i = rsSpring2018.getInt("id");
					String university = rsSpring2018.getString(3);
					String joinYear   = rsSpring2018.getString(4);
					String rank       = rsSpring2018.getString(5);
					String subfield   = rsSpring2018.getString(6);
					String bachelors  = rsSpring2018.getString(7);
					String masters    = rsSpring2018.getString(8);
					String doctorate  = rsSpring2018.getString(9);
					String postDoc    = rsSpring2018.getString(10);
					String gender     = rsSpring2018.getString(11);
					String photoUrl   = rsSpring2018.getString(12);
					String sources    = "";
					try {
						sources = rsSpring2018.getString(13);
					} catch (Exception e) {
						System.out.println("source missing for - " + profNameClean + " " + university);
					}
					
					String universityLook = prepLookup(university);
					String joinYearLook   = prepLookup(joinYear);
					String rankLook       = prepLookup(rank);
					String subfieldLook   = prepLookup(subfield);
					String bachelorsLook  = prepLookup(bachelors);
					String mastersLook    = prepLookup(masters);
					String doctorateLook  = prepLookup(doctorate);
					String postDocLook    = prepLookup(postDoc);
					String genderLook     = prepLookup(gender);
					String photoUrlLook   = photoUrl.trim().toLowerCase();
					String sourcesLook    = prepLookup(sources);
					
					/////////////////////////////////////////////////
					conn.setAutoCommit(false);
					
					stmtClean.setInt(1, i);
					stmtClean.setString(2, profNameClean);
					stmtClean.setString(3, university);
					stmtClean.setString(4, joinYear);
					stmtClean.setString(5, rank);
					stmtClean.setString(6, subfield);
					stmtClean.setString(7, bachelors);
					stmtClean.setString(8, masters);
					stmtClean.setString(9, doctorate);
					stmtClean.setString(10, postDoc);
					stmtClean.setString(11, gender);
					stmtClean.setString(12, photoUrl.trim());
					stmtClean.setString(13, sources);
					stmtClean.addBatch();
					
					stmtLook.setInt(1, i);
					stmtLook.setString(2, profNameLook);
					stmtLook.setString(3, universityLook);
					stmtLook.setString(4, joinYearLook);
					stmtLook.setString(5, rankLook);
					stmtLook.setString(6, subfieldLook);
					stmtLook.setString(7, bachelorsLook);
					stmtLook.setString(8, mastersLook);
					stmtLook.setString(9, doctorateLook);
					stmtLook.setString(10, postDocLook);
					stmtLook.setString(11, genderLook);
					stmtLook.setString(12, photoUrlLook);
					stmtLook.setString(13, sourcesLook);
					stmtLook.addBatch();
					
					i++;
				}
				
				stmtClean.executeBatch(); 
				stmtLook.executeBatch();
				
				conn.commit();
				conn.setAutoCommit(true);
		} catch (SQLException | NamingException e) {
			System.out.println("ERROR pop data: " + e);
			e.printStackTrace();
			System.out.println("::::::::::::::::::::::::::::::::::");
		} 
		
		System.out.println("done populateCurData()");
	}
	
	public void writeCurData() {
		System.out.println("starting populateCurData()...");
		
		Integer i = 1;
		
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi2018)).getConnection();
			PreparedStatement stmtOrig = conn.prepareStatement(
					"INSERT INTO spring2018 (id, Name, University, JoinYear, Rank, Subfield, Bachelors, Masters, Doctorate, PostDoc, Gender, PhotoUrl, Sources) "
					+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
			PreparedStatement stmtClean = conn.prepareStatement(
					"INSERT INTO spring2018_cleaned (id, Name, University, JoinYear, Rank, Subfield, Bachelors, Masters, Doctorate, PostDoc, Gender, PhotoUrl, Sources) "
					+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
			PreparedStatement stmtLook = conn.prepareStatement(
					"INSERT INTO spring2018_lookup (id, Name, University, JoinYear, Rank, Subfield, Bachelors, Masters, Doctorate, PostDoc, Gender, PhotoUrl, Sources) "
					+ "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
			) {
				
				// Autocommit is true by default,
	   			// so setting it to false as we are manually committing later
	   			conn.setAutoCommit(false);
				
				String dir = "/Users/shaunwallace/Documents/Dev_Tools/eclipse-workspace/ajobs/src/main/java/com/ajobs/util/Validation_Aug31.csv";
				System.out.println(dir);
				CSVReader reader = new CSVReader(new FileReader(dir));
				//Read all rows at once
				List<String[]> allRows = reader.readAll();
				
				for(String[] s : allRows) {
					String profName = s[0];
					String profNameClean = cleanName(s[0], true);
					String profNameLook = cleanNameLookup(profNameClean).trim();
					
					String university = s[1].trim();
					String joinYear   = s[2].trim();
					String rank       = s[3].trim();
					String subfield   = s[4].trim();
					String bachelors  = s[5].trim();
					String masters    = s[6].trim();
					String doctorate  = s[7].trim();
					String postDoc    = s[8].trim();
					String gender     = s[9].trim();
					String photoUrl   = s[10].trim();
					String sources    = "";
					try {
						sources    = s[11].trim();
					} catch (Exception e) {
						System.out.println("source missing for - " + profNameClean + " " + university);
					}
					
					String universityLook = prepLookup(university);
					String joinYearLook   = prepLookup(joinYear);
					String rankLook       = prepLookup(rank);
					String subfieldLook   = prepLookup(subfield);
					String bachelorsLook  = prepLookup(bachelors);
					String mastersLook    = prepLookup(masters);
					String doctorateLook  = prepLookup(doctorate);
					String postDocLook    = prepLookup(postDoc);
					String genderLook     = prepLookup(gender);
					String photoUrlLook   = prepLookup(photoUrl);
					String sourcesLook    = prepLookup(sources);
					
					/////////////////////////////////////////////////
					conn.setAutoCommit(false);
					
					stmtOrig.setInt(1, i);
					stmtOrig.setString(2, profName);
					stmtOrig.setString(3, university);
					stmtOrig.setString(4, joinYear);
					stmtOrig.setString(5, rank);
					stmtOrig.setString(6, subfield);
					stmtOrig.setString(7, bachelors);
					stmtOrig.setString(8, masters);
					stmtOrig.setString(9, doctorate);
					stmtOrig.setString(10, postDoc);
					stmtOrig.setString(11, gender);
					stmtOrig.setString(12, photoUrl);
					stmtOrig.setString(13, sources);
					stmtOrig.addBatch();
					
					stmtClean.setInt(1, i);
					stmtClean.setString(2, profNameClean);
					stmtClean.setString(3, university);
					stmtClean.setString(4, joinYear);
					stmtClean.setString(5, rank);
					stmtClean.setString(6, subfield);
					stmtClean.setString(7, bachelors);
					stmtClean.setString(8, masters);
					stmtClean.setString(9, doctorate);
					stmtClean.setString(10, postDoc);
					stmtClean.setString(11, gender);
					stmtClean.setString(12, photoUrl);
					stmtClean.setString(13, sources);
					stmtClean.addBatch();
					
					stmtLook.setInt(1, i);
					stmtLook.setString(2, profNameLook);
					stmtLook.setString(3, universityLook);
					stmtLook.setString(4, joinYearLook);
					stmtLook.setString(5, rankLook);
					stmtLook.setString(6, subfieldLook);
					stmtLook.setString(7, bachelorsLook);
					stmtLook.setString(8, mastersLook);
					stmtLook.setString(9, doctorateLook);
					stmtLook.setString(10, postDocLook);
					stmtLook.setString(11, genderLook);
					stmtLook.setString(12, photoUrlLook);
					stmtLook.setString(13, sourcesLook);
					stmtLook.addBatch();
					
					i++;
				}
				
				stmtOrig.executeBatch(); 
				stmtClean.executeBatch(); 
				stmtLook.executeBatch(); 
				reader.close();
				
				conn.commit();
				conn.setAutoCommit(true);
		} catch (IOException | SQLException | NamingException e) {
			System.out.println("ERROR pop data: " + e);
			e.printStackTrace();
			System.out.println("::::::::::::::::::::::::::::::::::");
		} 
		
		System.out.println("done populateCurData()");
	}
	
	// Cleaning Functions
	private String cleanName(String val, boolean capitalize) {
		val = val.replace("Dr.", "").replace(".", "");
		if(capitalize) { val = capitalizer(val); };
		if(val.contains(",")) {
			String[] valSplit1 = val.split(",");
			val = valSplit1[1] + valSplit1[0];
		}
		
		return val;
	}
	
	private String cleanNameLookup(String val) {
		val = val.replace(".", "").trim();
		String[] valSplit1 = val.split(" ");
		
		if(valSplit1[0].length() == 1) {
			val = val.replace(" ", "");
		} else if(val.toLowerCase().contains(" van ")) {
			val = val.replace(" ", "");
		} else {
			val = valSplit1[0] + valSplit1[valSplit1.length-1];
		}
		
		return val.toLowerCase();
	}
	
	private String capitalizer(String word){
        String[] words = word.split(" ");
        StringBuilder sb = new StringBuilder();
        if (words[0].length() > 0) {
            sb.append(Character.toUpperCase(words[0].charAt(0)) + words[0].subSequence(1, words[0].length()).toString().toLowerCase());
            for (int i = 1; i < words.length; i++) {
                sb.append(" ");
                sb.append(Character.toUpperCase(words[i].charAt(0)) + words[i].subSequence(1, words[i].length()).toString().toLowerCase());
            }
        }
        return  sb.toString();
    }
	
	private String prepLookup(String val) {
		return val.replace(" ", "").replace(",","").replace(".","").replace("-","").replace(" & ","").replace(" and ","").replace(" in ","").replace("\"","").replace(" - USA","").replace(" - Canada","").replace(" (USA)","").replace(" (Canada)","").replace("{","").replace("}","").replace("n/a","").replace("N/A","").toLowerCase().trim(); 
	}
}
