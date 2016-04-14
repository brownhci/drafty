package drafty.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import drafty.views._MainUI;

public class UserInterestService {
	
	/**
	 * The basic premise of this class is upon loading the page, it queries the
	 * database  to  calculate your history of interactions. Each tracked interaction
	 * is added to a hashmap based on weight of interaction. These can then be dynamically 
	 * added to as the user interacts with the database. When the program decides to ask a
	 * question, the getMostInterested() function can be called. This turns the pertinent hashmap
	 * into a list and returns the first item.
	 * 
	 * TO DO: make it so the db is not queried every time a user filters something
	 * TO DO: make this run in the background so it doesn't slow loading time
	 * TO DO: fine tune getMostInterested() function 
	 * 
	 */
	
	//weights
	private int _click = 1;
	//dclick weight is in addition to click weight
	private int _dclick = 1;
	
	private int _val = 3;
	//sugg is in addition to val weight
	private int _sugg = 1;
	
	private int _filter = 2;
	private int _bfilter = 3;
	
	//column
	private HashMap<String, Integer> _colInterest;
	private List<String> _finalColInterest;
	
	//specific interests
	private HashMap<String, Integer> _profInterest;
	private HashMap<String, Integer> _uniInterest;
	private HashMap<String, Integer> _yearInterest;
	private HashMap<String, Integer> _rankInterest;
	private HashMap<String, Integer> _fieldInterest;
	private HashMap<String, Integer> _bachInterest;
	private HashMap<String, Integer> _mastInterest;
	private HashMap<String, Integer> _doctInterest;
	private HashMap<String, Integer> _postDocInterest;
	private HashMap<String, Integer> _genderInterest;
	
	//global universities tracker
	private HashMap<String, Integer> _allUniInterest;
	private int _maxPerson;

	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	public UserInterestService(String user_id) {
		_maxPerson = Integer.parseInt(this.getHighestPersonNum());
		this.genUserInterest(user_id);
	}
	
	
	public void genUserInterest(String user_id) {
		//initialise total uni list & hashmap
		_allUniInterest = new HashMap<String, Integer>();
		_finalColInterest = new ArrayList<String>();
		//_finalRowInterest = new ArrayList<String>();
		
		//generate most interested overall col, row
		this.genUserIntCols(user_id);
		//this.genUserIntRow(user_id);
		
		//initialise hashmaps
		_profInterest = new HashMap<String, Integer>();
		_uniInterest = new HashMap<String, Integer>();
		_yearInterest = new HashMap<String, Integer>();
		_rankInterest = new HashMap<String, Integer>();
		_fieldInterest = new HashMap<String, Integer>();
		_bachInterest = new HashMap<String, Integer>();
		_mastInterest = new HashMap<String, Integer>();
		_doctInterest = new HashMap<String, Integer>();
		_postDocInterest = new HashMap<String, Integer>();
		_genderInterest = new HashMap<String, Integer>();

		//generate individual interests
		//updates hashmaps
		this.genUserInt(user_id, _profInterest, "1");
		this.genUserInt(user_id, _uniInterest, "2");
		this.genUserInt(user_id, _yearInterest, "7");
		this.genUserInt(user_id, _rankInterest, "8");
		this.genUserInt(user_id, _fieldInterest, "9");
		this.genUserInt(user_id, _bachInterest, "3");
		this.genUserInt(user_id, _mastInterest, "4");
		this.genUserInt(user_id, _doctInterest, "5");
		this.genUserInt(user_id, _postDocInterest, "6");
		this.genUserInt(user_id, _genderInterest, "10");
				
	}
	
	public void genUserIntCols(String user_id) {
		
		//generating column interest based on clicks
		_colInterest = new HashMap<String, Integer>();
		
		//adding to hashmap for the suggestiontypes based on single clicks
		List<String> clickList = this.getClickCol(user_id, "0");
		this.addToHM(_colInterest, clickList, _click);

		//adding to hashmap for suggestiontypes based on double clicks
		List<String> dclickList = this.getClickCol(user_id, "1");
		this.addToHM(_colInterest, dclickList, _dclick);
		
		//adding to the hashmap based on filters
		List<String> filterList = this.getFilterCol(user_id, "0");
		this.addToHM(_colInterest, filterList, _filter);
		
		//adding to the hashmap based on filters
		List<String> bfilterList = this.getFilterCol(user_id, "1");
		this.addToHM(_colInterest, bfilterList, _bfilter);
		
		//adding to hashmap based on suggestion
		List<String> suggList = this.getSuggCol(user_id, "1");
		this.addToHM(_colInterest, suggList, _sugg);
		
		//adding to hashmap based on validation
		List<String> valList = this.getSuggCol(user_id, "0");
		this.addToHM(_colInterest, valList, _val);
				
	}
	
	public void genUserInt(String user_id, HashMap<String, Integer> hm, String suggType) {

		//adding to hashmap based on single clicks
		List<String> clickList = this.getClickTypes(user_id, "0", suggType);
		this.addToHM(hm, clickList, _click);
		
		//adding to hashmap based on double clicks
		List<String> dclickList = this.getClickTypes(user_id, "1", suggType);
		this.addToHM(hm, dclickList, _dclick);
		
		//adding to hashmap based on filtering
		List<String> filterList = this.getFilterTypes(user_id, "0", suggType);
		this.addToHM(hm, filterList, _filter);
		
		//adding to hashmap based on blur filtering
		List<String> bfilterList = this.getFilterTypes(user_id, "1", suggType);
		this.addToHM(hm, bfilterList, _bfilter);
		
		//adding to hashmap based on suggestion
		List<String> suggList = this.getSuggTypes(user_id, suggType, "1");
		this.addToHM(hm, suggList, _sugg);
		
		//adding to hashmap based on validation
		List<String> valList = this.getSuggTypes(user_id, suggType, "0");
		this.addToHM(hm, valList, _val);
		
		//if suggtype corresponds to a university, add to total uni list
		if (suggType.equals("2") || suggType.equals("3") || suggType.equals("4") || suggType.equals("5") || suggType.equals("6")) {
			this.addToHM(_allUniInterest, clickList, _click);
			this.addToHM(_allUniInterest, dclickList, _dclick);
			this.addToHM(_allUniInterest, filterList, _filter);
			this.addToHM(_allUniInterest, bfilterList, _bfilter);
			this.addToHM(_allUniInterest, suggList, _sugg);
			this.addToHM(_allUniInterest, valList, _val);
		}
	}
	
	//add to hashmap
	public void addToHM(HashMap<String, Integer> hm, List<String> list, int weight) {
		for (String key: list) {
			if (!hm.containsKey(key)) {
				hm.put(key, weight);
			}
			else {
				int prev = hm.get(key);
				hm.remove(key, prev);
				hm.put(key, prev + weight);
			}
		}
	}
	
	//add to priority queue
	public void addToPQ(List<String> list, HashMap<String, Integer> hm) {
		for (String key: hm.keySet()) {
			if (list.isEmpty()) {
				list.add(key);
			}
			else {
				for (int i = 0; i < list.size(); i++) {
					String comp = list.get(i);
					if (hm.get(comp) <= hm.get(key)) {
						list.add(i, key);
						break;
					}
				}
			}
		}
	}
	
	public List<String> getClickCol(String user_id, String dclick) {
		
		//col sort interest
		List<String> colList = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT idSuggestionType FROM Click WHERE idProfile = (?) AND doubleclick = (?)";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, user_id);
		        stmt.setString(2,  dclick);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						colList.add(rs.getString("idSuggestionType"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception personSelect() get suggestion " + ex);
	        }
		return colList;
	}
	
	public List<String> getSuggCol(String user_id, String val) {
		
		//col sort interest
		List<String> colList = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * FROM Validation "
		        	+ "INNER JOIN Validation_Suggestion ON Validation.idValidation = Validation_Suggestion.idValidation "
		        	+ "INNER JOIN Suggestion ON Suggestion.idSuggestion = Validation_Suggestion.idSuggestion "
		        	+ "WHERE Validation.idProfile = (?) AND Suggestion.idSuggestionType = (?)";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, user_id);
		        stmt.setString(2,  val);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						colList.add(rs.getString("idSuggestionType"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception personSelect() get suggestion " + ex);
	        }
		return colList;
	}

	public List<String> getFilterCol(String user_id, String val) {
		
		//col sort interest
		List<String> colList = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * FROM `Filter` "
		        		+ "WHERE filter != '' AND idProfile = (?) AND blur = (?)";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, user_id);
		        stmt.setString(2,  val);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						colList.add(rs.getString("idSuggestionType"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception personSelect() get suggestion " + ex);
	        }
		return colList;
	}

	public List<String> getClickRow(String user_id, String dclick) {
	
		//col sort interest
		List<String> rowList = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * FROM Click "
		        		+ "INNER JOIN Suggestion ON Click.idSuggestion = Suggestion.idSuggestion "
		        		+ "WHERE Click.idProfile = (?) AND Click.doubleclick = (?) ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, user_id);
		        stmt.setString(2,  dclick);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						rowList.add(rs.getString("idPerson"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception personSelect() get suggestion " + ex);
	        }
		return rowList;
	}
	
	public List<String> getSuggRow(String user_id, String val) {
		
		//row sort interest
		List<String> rowList = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * FROM Click "
		        		+ "INNER JOIN Suggestion ON Click.idSuggestion = Suggestion.idSuggestion "
		        		+ "WHERE Click.idProfile = (?) AND Click.doubleclick = (?) ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, user_id);
		        stmt.setString(2, val);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						rowList.add(rs.getString("idPerson"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception personSelect() get suggestion " + ex);
	        }
		return rowList;
	}
	
	public List<String> getFilterRow(String user_id, String val) {
		//uni sort interest
				List<String> finalList = new ArrayList<String>();
				List<String> idList = this.getSeparateFilterList(user_id, val, null);

				//for each individual filter, retreive the results that would have come up
				for (int i = 0; i < idList.size(); i++) {
					try {
				      Context initialContext = new InitialContext();
				      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
				      if (datasource != null) {
				        Connection conn = datasource.getConnection();
				        
				        String sql = "SELECT DISTINCT idPerson "
				        		+ "FROM Suggestion "
				        		+ "INNER JOIN Filter ON Suggestion.suggestion LIKE CONCAT('%', (?), '%') "
				        		+ "WHERE Filter.idProfile = (?) AND Filter.blur = (?) AND Filter.filter != '' ";
				        PreparedStatement stmt = conn.prepareStatement(sql);
				        stmt.setString(1, idList.get(i));
				        stmt.setString(2, user_id);
				        stmt.setString(3, val);
				        try {
				        	ResultSet rs = stmt.executeQuery();
							while (rs.next()) {
								finalList.add(rs.getString("suggestion"));
							}
				        } catch (SQLException e) {
							System.out.println(e.getMessage());
						}
				        stmt.close();
				        conn.close();
				      }
				    }
			        catch (Exception ex)
			        {
			        	System.out.println("Exception getFilterTypes() get suggestion " + ex);
			        }
				}
				return finalList;
	}
	
	public List<String> getClickTypes(String user_id, String dclick, String sugg_id) {
		
		//uni sort interest
		List<String> uniList = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * "
		        		+ "FROM Click "
		        		+ "INNER JOIN Suggestion ON Suggestion.idSuggestion = Click.idSuggestion "
		        		+ "WHERE Click.idProfile = (?) AND Click.idSuggestionType = (?) AND doubleclick = (?) ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, user_id);
		        stmt.setString(2, sugg_id);
		        stmt.setString(3, dclick);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						uniList.add(rs.getString("suggestion"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception getClickType() get suggestion " + ex);
	        }
		return uniList;
	}
	
	public List<String> getSuggTypes(String user_id, String sugg_id, String val) {
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
		        	+ "WHERE Validation.idProfile = (?) AND Validation_Suggestion.chosen = (?)";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, user_id);
		        stmt.setString(2, val);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						uniList.add(rs.getString("idPerson"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception getClickType() get suggestion " + ex);
	        }
		return uniList;
	}
	
	public List<String> getFilterTypes(String user_id, String bfilter, String sugg_id) {
		
		//uni sort interest
		List<String> finalList = new ArrayList<String>();
		List<String> idList = this.getSeparateFilterList(user_id, bfilter, sugg_id);

		//for each individual filter, retreive the results that would have come up
		for (int i = 0; i < idList.size(); i++) {
			try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        
		        String sql = "SELECT DISTINCT suggestion "
		        		+ "FROM Suggestion "
		        		+ "INNER JOIN Filter ON Suggestion.suggestion LIKE CONCAT('%', (?), '%') "
		        		+ "WHERE Filter.idProfile = (?) AND Suggestion.idSuggestionType = (?) AND Filter.blur = (?) AND Filter.filter != '' ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, idList.get(i));
		        stmt.setString(2, user_id);
		        stmt.setString(3, sugg_id);
		        stmt.setString(4, bfilter);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						finalList.add(rs.getString("suggestion"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception getFilterTypes() get suggestion " + ex);
	        }
		}
		return finalList;
	}
	
	public List<String> getSeparateFilterList(String user_id, String bfilter, String sugg_id) {
		
		List<String> dateList = new ArrayList<String>();
		List<String> rawIDList = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        
		        PreparedStatement stmt;
		        if (bfilter != null) {
		        	String sql = " SELECT * FROM `Filter` "
		        			+ "WHERE idProfile = (?) AND idSuggestionType = (?) AND filter != '' AND blur = (?)";
		        
			        stmt = conn.prepareStatement(sql);
			        stmt.setString(1, user_id);
			        stmt.setString(2, sugg_id);
			        stmt.setString(3, bfilter);
		        }
		        else {
		        	String sql = " SELECT * FROM `Filter` "
		        			+ "WHERE idProfile = (?) AND blur = (?) AND filter != ''";
		        
			        stmt = conn.prepareStatement(sql);
			        stmt.setString(1, user_id);
			        stmt.setString(2, sugg_id);
		        }
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						rawIDList.add(rs.getString("filter"));
						dateList.add(rs.getString("date"));
					}
					
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception getFilterTypes1() get suggestion " + ex);
	        }
		
		List<String> idList = new ArrayList<String>();
		if (!rawIDList.isEmpty()) {
			String startID = rawIDList.get(0);
			String startDate = dateList.get(0);
			idList.add(startID);
			//redact seconds so that count is reset every minute
			startDate = startDate.substring(0, startDate.length()-5);

			for (int i = 0; i < rawIDList.size(); i++) {
				String endDate = dateList.get(i);
				endDate = endDate.substring(0, endDate.length()-5);
				//if start and end date are more than a minute apart, add the filter id
				if (!startDate.equals(endDate)) {
					idList.add(rawIDList.get(i));
					startDate = endDate;
					startID = rawIDList.get(i);
				}
				//if current filter is different to previous filter, add filter id
				else if (!startID.equalsIgnoreCase(rawIDList.get(i))) {
					idList.add(rawIDList.get(i));
					startID = rawIDList.get(i);
					startDate = endDate;
				}
			}
		}
		
		return idList;
	}
	
	//called when a user clicks on something
	public void recordClick(String cell_id, String cell_full_name, String cell_value, String cell_column, String user_id, boolean doubleClick) {
		
		List<String> col = new ArrayList<String>();
		col.add(this.getSuggNum(cell_column));
		
		List<String> row = new ArrayList<String>();
		row.add(cell_id);
		
		List<String> spec = new ArrayList<String>();
		spec.add(cell_value);
		
		//add to column hashmap
		this.addToHM(_colInterest, col, _click);
		
		//add to corresponding type hashmap
		if(doubleClick) {
			this.addToHM(this.getHashMap(cell_column), spec, _dclick);
		} else {
			this.addToHM(this.getHashMap(cell_column), spec, _click);
		}
		
	}
	
	//called when a user makes a suggestion
	public void recordSugg(String cell_id, String cell_full_name, String cell_value, String cell_column, String user_id) {
		
		List<String> col = new ArrayList<String>();
		col.add(this.getSuggNum(cell_column));
		
		List<String> row = new ArrayList<String>();
		row.add(cell_id);
		
		List<String> spec = new ArrayList<String>();
		spec.add(cell_value);
		
		//add to column hashmap
		this.addToHM(_colInterest, col, _sugg);
		
		//add to corresponding type hashmap
		this.addToHM(this.getHashMap(cell_column), spec, _sugg);
		
	}
	
	//called when a user validates an existing suggestion
	public void recordVal(String cell_id, String cell_full_name, String cell_value, String cell_column, String user_id) {
		
		List<String> col = new ArrayList<String>();
		col.add(this.getSuggNum(cell_column));
		
		List<String> row = new ArrayList<String>();
		row.add(cell_id);
		
		List<String> spec = new ArrayList<String>();
		spec.add(cell_value);
		
		//add to column hashmap
		this.addToHM(_colInterest, col, _sugg);
		
		//add to corresponding type hashmap
		this.addToHM(this.getHashMap(cell_column), spec, _sugg);
		
	}
	
	//called when a user applies a filter
	public void recordFilter(String blur, String filter, String column, String idProfile) {
		//need to adjust this to not query the database each time
		
		List<String> filterList = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        
		        String sql = "SELECT DISTINCT suggestion "
		        		+ "FROM Suggestion "
		        		+ "INNER JOIN Filter ON Suggestion.suggestion LIKE CONCAT('%', (?), '%') "
		        		+ "WHERE Filter.idProfile = (?) AND Suggestion.idSuggestionType = (?) AND Filter.blur = (?) AND Filter.filter != '' ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, filter);
		        stmt.setString(2, idProfile);
		        stmt.setString(3, column);
		        stmt.setString(4, blur);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						filterList.add(rs.getString("suggestion"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception getFilterTypes() get suggestion " + ex);
	        }
		
		int weight;
		if (Integer.parseInt(blur) == 0) {
			weight = _filter;
		}
		else {
			weight = _bfilter;
		}
		
		List<String> col = new ArrayList<String>();
		col.add(column);
		
		List<String> spec = new ArrayList<String>();
		spec.add(column);
		
		//add to column hashmap
		this.addToHM(_colInterest, col, weight);
		
		//add to corresponding type hashmap
		this.addToHM(this.getHashMap(column), spec, weight);
		
	}
	
	//gets the correct hashmap for suggestion column
	public HashMap<String, Integer> getHashMap(String sugg_type) {
		switch(sugg_type) {
			case "University":
				return _uniInterest;
			case "Bachelors":
				return _bachInterest;
			case "Masters":
				return _mastInterest;
			case "Doctorate":
				return _doctInterest;
			case "PostDoc":
				return _postDocInterest;
			case "Join Year":
				 return _yearInterest;
			case "Rank":
				return _rankInterest;
			case "Subfield":
				return _fieldInterest;
			default:
				return _genderInterest;
		}
	}
	
	public String getSuggType(String sugg_type) {
		switch(sugg_type) {
			case "2":
				return "University";
			case "3":
				return "Bachelors";
			case "4":
				return "Masters";
			case "5":
				return "Doctorate";
			case "6":
				return "PostDoc";
			case "7":
				 return "Join Year";
			case "8":
				return "Rank";
			case "9":
				return "Subfield";
			default:
				return "Gender";
		}
	}
	
	public String getSuggNum(String sugg) {
		switch(sugg) {
			case "University":
				return "2";
			case "Bachelors":
				return "3";
			case "Masters":
				return "4";
			case "Doctorate":
				return "5";
			case "PostDoc":
				return "6";
			case "JoinYear":
				 return "7";
			case "Rank":
				return "8";
			case "Subfield":
				return "9";
			default:
				return "10";
		}
	}
	
	public HashMap<String, Integer> getSuggMap(String sugg_type) {
		switch(sugg_type) {
			case "2":
				return _uniInterest;
			case "3":
				return _bachInterest;
			case "4":
				return _mastInterest;
			case "5":
				return _doctInterest;
			case "6":
				return _postDocInterest;
			case "7":
				 return _yearInterest;
			case "8":
				return _rankInterest;
			case "9":
				return _fieldInterest;
			default:
				return _genderInterest;
		}
	}
	
	public String getProfName(String prof_id) {
		List<String> prof = new ArrayList<String>();
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * FROM Person "
		        	+ "WHERE idPerson = (?)";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, prof_id);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						prof.add(rs.getString("name"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
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
	
	public void getMostInterestedSuggType() {
		
		this.addToPQ(_finalColInterest, _colInterest);
		
		if (!_finalColInterest.isEmpty()) {
			System.out.println("choose sugg type " + _finalColInterest.get(0));
		}
		
	}
	
	//whenever we need to get the interest for a specific suggestion
	public void getInterest(String sugg_type) {
		List<String> interestList = new ArrayList<String>();
		HashMap<String, Integer> hm = this.getSuggMap(sugg_type);
		this.addToPQ(interestList, hm);
		
		String sugg = this.getSuggType(sugg_type);
		if (!interestList.isEmpty()) {
			System.out.println("most interested " + sugg + " is " + interestList.get(0));
		}
	}
	
	//if we need to get something they have never made a suggestion or validation for
	public void getNoInterest(String user_id) {
		//randomise person
		int randPerson = (int) (Math.random() * _maxPerson);
		//randomise col (not including photo url or sources)
		int randCol = (int) (Math.random()*10);
		//make sure the column is not name
		while (randCol == 1) {
			randCol = (int) (Math.random()*10);
		}
		//check that this cell is not in their interests
		while (this.checkNoInterest(user_id, randCol, randPerson)) {
			randPerson = (int) (Math.random() * _maxPerson);
			//randomise col (not including photo url or sources)
			randCol = (int) (Math.random()*10);
			//make sure the column is not name
			while (randCol == 1) {
				randCol = (int) (Math.random()*10);
			}
		}
		
		//return corresponding cell
		System.out.println("current uninterested cell is person " + randPerson + " column " + randCol);
	}
	
	public boolean checkNoInterest(String user_id, int randCol, int randPerson) {
		
		List<String> row = new ArrayList<String>();
		List<String> col = new ArrayList<String>();
		
		String rCol = Integer.toString(randCol);
		String rPerson = Integer.toString(randPerson);
		
		try {
		      Context initialContext = new InitialContext();
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT * FROM `Suggestion` WHERE idProfile = (?) ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, user_id);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						row.add(rs.getString("idPerson"));
						col.add(rs.getString("idSuggestionType"));
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
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
					System.out.println(e.getMessage());
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