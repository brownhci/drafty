package drafty.services;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.NavigableMap;
import java.util.Random;
import java.util.TreeMap;

import drafty._MainUI;
import drafty.models.InteractionWeights;
import drafty.models.Professors;
import drafty.models.UserInterest;

public class UserStudyService {
	
	/**
	 * The basic premise of this class is upon loading the page, it queries the
	 * database  to  calculate your history of interactions. Each tracked interaction
	 * is added to a hashmap based on weight of interaction. These can then be dynamically 
	 * added to as the user interacts with the database. 
	 * 
	 * When the program decides to ask a question, the getInterestedField() method can 
	 * be called. This works out a likelihood for each prof to be selected based on how 
	 * much they match the user profile. Profs that do no match the user profile at all
	 * are added to the _noInterestList, which is randomised when the program calls getNoInterest().
	 * 
	 * TO DO: make it so the db is not queried every time a user filters something
	 * TO DO: integrate domain matching
	 * 
	 */
	
	//weights
	private int _click = InteractionWeights.click;
	private int _dclick = 1; //dclick weight is in addition to click weight
	private int _clickRow = 1;
	
	private int _val = InteractionWeights.validation;
	//sugg is in addition to val weight
	private int _sugg = InteractionWeights.sugestion;
	
	private int _filter = InteractionWeights.filter;
	private int _bfilter = InteractionWeights.filterBlur;
	
	
	//cumulative probability of professor matches in navigable map	
	private NavigableMap<Integer, Integer> _probabilityNM;
	
	//list of professor IDs that do not match user profile
	private ArrayList<Integer> _noInterestList;
	
	//specific interests
	private HashMap<String, Integer> _profInterest;
	private HashMap<String, Integer> _uniInterest;
	private HashMap<String, Integer> _fieldInterest;
	private HashMap<String, Integer> _bachInterest;
	private HashMap<String, Integer> _mastInterest;
	private HashMap<String, Integer> _doctInterest;
	private HashMap<String, Integer> _postDocInterest;
	
	List<String> suggTypes = new ArrayList<String>();
	
	//variables and external classes
	private UserBehaviorService _ub = new UserBehaviorService();
	private UserInterest _model = new UserInterest();
	private int _totalScore;

	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	private String highProf;
	private String highField;
	private String highUni;
	
	public UserStudyService() {
		System.out.println("CREATE UserStudyService");
		
		//reset score
		_totalScore = 0;
		
		//initialising prof score hashmap
		
		//initialise prof probability navmap
		_probabilityNM = new TreeMap<Integer, Integer>();
		_noInterestList = new ArrayList<Integer>();
		
		//initialise hashmaps
		_profInterest = new HashMap<String, Integer>();
		_uniInterest = new HashMap<String, Integer>();
		_fieldInterest = new HashMap<String, Integer>();
		_bachInterest = new HashMap<String, Integer>();
		_mastInterest = new HashMap<String, Integer>();
		_doctInterest = new HashMap<String, Integer>();
		_postDocInterest = new HashMap<String, Integer>();

		suggTypes.add("ProfName");
		suggTypes.add("University");
		suggTypes.add("Subfield");
		suggTypes.add("Bachelors");
		suggTypes.add("Masters");
		suggTypes.add("Doctorate");
		suggTypes.add("PostDoc");
		
		//generate individual interests updates hashmaps

		this.genUserInt(_profInterest, "1");
		this.genUserInt(_uniInterest, "2");
		this.genUserInt(_fieldInterest, "9");
		this.genUserInt(_bachInterest, "3");
		this.genUserInt(_mastInterest, "4");
		this.genUserInt(_doctInterest, "5"); 
		this.genUserInt(_postDocInterest, "6");
		
		//add clicks to hm's for entire row of click, not just specific suggestion type
		this.genUserIntClicks("0", _click);
		this.genUserIntClicks("1", _dclick);
		
		this.printInterest();
	}
	
	public void genUserIntClicks(String clickType, Integer weight) {
		
		List<String[]> clickList = _ub.getClickRow(clickType);
		String suggType;
		String[] vals;
		boolean flag = false; //ignore warning, this var is used
		
		List<String> profs = new ArrayList<String>();
		List<String> unis = new ArrayList<String>();
		List<String> fields = new ArrayList<String>();
		List<String> bach = new ArrayList<String>();
		List<String> mast = new ArrayList<String>();
		List<String> doct = new ArrayList<String>();
		List<String> postdoc = new ArrayList<String>();
		
		List<String> currSuggestion = new ArrayList<String>();
		for (String[] row : clickList){
			suggType = row[0];
			currSuggestion.add(row[2]);
			this.addToHM(this.getSuggMap(suggType), currSuggestion, weight);
			currSuggestion.clear();
			
			//SW check for null value first, avoids null pointer exception
			if(row[1] != null && !row[1].isEmpty()) {
				vals = row[1].split("\\|"); //SW row[1] from doubleClick contains a String[] of all row values 
				
				profs.add(vals[0]);  //0 = professor name
				unis.add(vals[1]);   //1 = university
				fields.add(vals[4]); //4 = subfield
				bach.add(vals[5]);   //5 = bachelors
				mast.add(vals[6]);
				doct.add(vals[7]);
				postdoc.add(vals[8]);
				flag = true;
			}
		}
	}
	
	public void genUserInt(HashMap<String, Integer> hm, String suggType) {
		
		//adding to hashmap based on filtering
		List<String> filterList = _ub.getFilterTypes("0", suggType);
		this.addToHM(hm, filterList, _filter);
		
		//adding to hashmap based on blur filtering
		List<String> bfilterList = _ub.getFilterTypes("1", suggType);
		this.addToHM(hm, bfilterList, _bfilter);
				
		//adding to hashmap based on validation_suggestion not chosen
		List<String> suggList = _ub.getSuggTypes(suggType, "1");
		this.addToHM(hm, suggList, _sugg);
		
		//adding to hashmap based on validation_suggestion chosen
		List<String> valList = _ub.getSuggTypes(suggType, "0");
		this.addToHM(hm, valList, _val);
	}
	
	//add to hashmap
	public void addToHM(HashMap<String, Integer> hm, List<String> list, int weight) {
		
		for (String key: list) {
			if (key != "") {
				if (!hm.containsKey(key)) {
					hm.put(key, weight);
				} else {
					int prev = hm.get(key);
					hm.remove(key, prev);
					hm.put(key, prev + weight);
				}
			}
		}
	}
	

	//add to priority queue
	public List<String> convertToPQ(HashMap<String, Integer> hm) {
		
		List<String> list = new ArrayList<String>();
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
		return list;
	}
	
	//called when a user clicks on something

	public void recordClick(String cell_id, String cell_full_name, String cell_value, String cell_column, boolean doubleClick, String rowValues) {
		
		//System.out.println("recording click " + doubleClick + " for field " + cell_value);
		
		String[] vals;
		vals = rowValues.split("\\|");
		
		List<String> prof = new ArrayList<String>();
		prof.add(vals[0]);
		this.addToHM(_profInterest, prof, _clickRow);
		
		List<String> uni = new ArrayList<String>();
		uni.add(vals[1]);
		this.addToHM(_uniInterest, uni, _clickRow);
		
		List<String> field = new ArrayList<String>();
		field.add(vals[2]);
		this.addToHM(_fieldInterest, field, _clickRow);
		
		
		//Are these necessary? (col & row)
		//List<String> col = new ArrayList<String>();
		//col.add(_model.getSuggNum(cell_column));
		//List<String> row = new ArrayList<String>();
		//row.add(cell_id);
		
		
		List<String> spec = new ArrayList<String>();
		spec.add(cell_value);
				
		//add to corresponding type hashmap
		if(doubleClick) {
			this.addToHM(this.getHashMap(cell_column), spec, _dclick);
		} else {
			this.addToHM(this.getHashMap(cell_column), spec, _click);
		}
		
		//this.printInterest();
	}
	
	//called when a user makes a suggestion
	public void recordSugg(String cell_id, String cell_full_name, String cell_value, String newSuggestion, String cell_column) {
		
		List<String> col = new ArrayList<String>();
		col.add(_model.getSuggNum(cell_column));
		
		//SW 1.1 - why is this being done? It is not added anywhere 
		//Tracing the code you are using the user's profile_id not the Person ID related to the professor
		List<String> row = new ArrayList<String>();
		row.add(cell_id);
		
		List<String> spec = new ArrayList<String>();
		spec.add(cell_value);
		spec.add(newSuggestion);
		
		//add to corresponding type hashmap
		this.addToHM(this.getHashMap(cell_column), spec, _sugg);
		
		this.printInterest();
	}
	
	//called when a user validates an existing suggestion
	public void recordVal(String cell_id, String cell_full_name, String cell_value, String cell_column) {
		
		List<String> col = new ArrayList<String>();
		col.add(_model.getSuggNum(cell_column));
		
		//SW m1 - why is this being done? It is not added anywhere 
		//Tracing the code you are using the user's profile_id not the Person ID related to the professor
		List<String> row = new ArrayList<String>();
		row.add(cell_id);
		
		List<String> spec = new ArrayList<String>();
		spec.add(cell_value);
		
		//add to corresponding type hashmap
		this.addToHM(this.getHashMap(cell_column), spec, _sugg);
		
		//this.printInterest();
	}
	
	public void recordFilter(String blur, String filter, String column, List<String> filterList) {
		
		//System.out.println("blur is " + blur + " and filterList is " + filterList);
		
		HashMap<String, Integer> hm = this.getSuggMap(column);
		if (blur.equals("0")) {
			this.addToHM(hm, filterList, _filter);
		} else {
			this.addToHM(hm, filterList, _bfilter);
		}	
	}
		
	//gets the correct hashmap for suggestion column
	private HashMap<String, Integer> getHashMap(String sugg_type) {
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
			case "Subfield":
				return _fieldInterest;
			default:
				return _profInterest;
		}
	}
	
	private HashMap<String, Integer> getSuggMap(String sugg_type) {
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
			default:
				return _fieldInterest;
		}
	}
	
	public String[] getQuestionScore(String questionType, String scoreType) {
		String[] result = new String[] {"", ""};
		
		if(questionType.equals("PROF")) {
			result = getProf(scoreType);
		} else if(questionType.equals("FIELD")) {
			result = getField(scoreType);
		} else if(questionType.equals("UNI")) {
			result = getUni(scoreType);
		} 
		
		return result;
	}
	
	public String[] getProf(String type) {
		String[] result = new String[] {"", ""};
		
		HashMap<String, Integer> uniInterest = buildProfInterest();
		
		if(type.equals("LOW")) {
			
		} else if(type.equals("HIGH")) {
			Integer max = 0;
			for (Map.Entry<String, Integer> e : uniInterest.entrySet()) {
				if(e.getValue() > max) {
					result[0] = e.getKey();
					highUni = e.getKey();
					double score = e.getValue() / sumMap(uniInterest);
					result[1] = Double.toString(score);
					break;
				}
			}
		} else if(type.equals("MID")) {
			for (Map.Entry<String, Integer> e : uniInterest.entrySet()) {
				double score = e.getValue() / sumMap(uniInterest);
				if(score > 0.5 && e.getKey() != highUni) {
					result[0] = e.getKey();
					result[1] = Double.toString(score);
					break;
				}
			}
		} else if(type.equals("RAND")) {
			Integer count = 0;
			for (Map.Entry<String, Integer> e : uniInterest.entrySet()) {
				if(e.getValue() != 0) {
					count++;
				}
			}
			Integer check = (count / uniInterest.size()) * uniInterest.size();
			
			boolean flag = true;
			while(flag) {
				for (Map.Entry<String, Integer> e : uniInterest.entrySet()) {
					if(e.getValue() == 0 && genRandNum(uniInterest.size()) < check) {
						double score = e.getValue() / sumMap(uniInterest);
						result[0] = e.getKey();
						result[1] = Double.toString(score);
						flag = false;
					} else if(genRandNum(uniInterest.size()) > check) {
						double score = e.getValue() / sumMap(uniInterest);
						result[0] = e.getKey();
						result[1] = Double.toString(score);
						flag = false;
					}
				}	
			}
		} 
		
		return result;
	}
	
	public String[] getField(String type) {
		
		String[] result = new String[] {"", ""};
		
		HashMap<String, Integer> fieldInterest = buildFieldInterest();
		
		if(type.equals("LOW")) {
			for (Map.Entry<String, Integer> e : fieldInterest.entrySet()) {
				if(e.getValue() == 0) {
					result[0] = e.getKey();
					double score = e.getValue() / sumMap(fieldInterest);
					result[1] = Double.toString(score);
					break;
				}
			}
		} else if(type.equals("HIGH")) {
			Integer max = 0;
			for (Map.Entry<String, Integer> e : fieldInterest.entrySet()) {
				if(e.getValue() > max) {
					result[0] = e.getKey();
					highUni = e.getKey();
					double score = e.getValue() / sumMap(fieldInterest);
					result[1] = Double.toString(score);
					break;
				}
			}
		} else if(type.equals("MID")) {
			List<Integer> vals = new ArrayList<Integer>();
			for (Map.Entry<String, Integer> e : fieldInterest.entrySet()) {
				if(e.getValue() > 0) {
					vals.add(e.getValue());
				}
			}
			Collections.sort(vals);
			Integer valCheck = vals.get((int) (0.5*vals.size()));
			for (Map.Entry<String, Integer> e : fieldInterest.entrySet()) {
				if(e.getValue() == valCheck) {
					double score = e.getValue() / sumMap(fieldInterest);
					result[0] = e.getKey();
					result[1] = Double.toString(score);
					break;
				}
			}
		} else if(type.equals("RAND")) {
			
			Integer count = 0;
			for (Map.Entry<String, Integer> e : fieldInterest.entrySet()) {
				if(e.getValue() != 0) {
					count++;
				}
			}
			Integer check = (count / fieldInterest.size()) * fieldInterest.size();
			
			boolean flag = true;
			while(flag) {
				for (Map.Entry<String, Integer> e : fieldInterest.entrySet()) {
					if(e.getValue() == 0 && genRandNum(fieldInterest.size()) < check) {
						double score = e.getValue() / sumMap(fieldInterest);
						result[0] = e.getKey();
						result[1] = Double.toString(score);
						flag = false;
					} else if(genRandNum(fieldInterest.size()) > check) {
						double score = e.getValue() / sumMap(fieldInterest);
						result[0] = e.getKey();
						result[1] = Double.toString(score);
						flag = false;
					}
				}	
			}
		} 
		
		return result; 
	}
	
	public String genRandomFromMap(HashMap<String, Integer> map) {
		Random generator = new Random();
		Object[] values = map.values().toArray();
		String randomValue = (String) values[generator.nextInt(values.length)];
		
		return randomValue;
	}
	
	public Integer genRandNum(Integer max) {
		Integer min = 1; 
		return new Random().nextInt((max - min) + 1) + min;
	}
	
	public String[] getUni(String type) {
		
		String[] result = new String[] {"", ""};
		
		HashMap<String, Integer> uniInterest = buildUniInterest();
		
		if(type.equals("LOW")) {
			for (Map.Entry<String, Integer> e : uniInterest.entrySet()) {
				if(e.getValue() == 0) {
					result[0] = e.getKey();
					double score = e.getValue() / sumMap(uniInterest);
					result[1] = Double.toString(score);
					break;
				}
			}
		} else if(type.equals("HIGH")) {
			Integer max = 0;
			for (Map.Entry<String, Integer> e : uniInterest.entrySet()) {
				if(e.getValue() > max) {
					result[0] = e.getKey();
					highUni = e.getKey();
					double score = e.getValue() / sumMap(uniInterest);
					result[1] = Double.toString(score);
					break;
				}
			}
		} else if(type.equals("MID")) {
			List<Integer> vals = new ArrayList<Integer>();
			for (Map.Entry<String, Integer> e : uniInterest.entrySet()) {
				if(e.getValue() > 0) {
					vals.add(e.getValue());
				}
			}
			Collections.sort(vals);
			Integer valCheck = vals.get((int) (0.5*vals.size()));
			for (Map.Entry<String, Integer> e : uniInterest.entrySet()) {
				if(e.getValue() == valCheck) {
					double score = e.getValue() / sumMap(uniInterest);
					result[0] = e.getKey();
					result[1] = Double.toString(score);
					break;
				}
			}
		} else if(type.equals("RAND")) {
			for (Map.Entry<String, Integer> e : uniInterest.entrySet()) {
				double score = e.getValue() / sumMap(uniInterest);
				if(score > 0 && score < 0.5 && e.getKey() != highUni) {
					result[0] = e.getKey();
					result[1] = Double.toString(score);
					break;
				}
			}
		} 
		
		return result;
	}
	
	public HashMap<String, Integer> buildFieldInterest() {
		HashMap<String, Integer> fieldInterest = new HashMap<String, Integer>();
		
		try {
			String sql = 
					"SELECT * FROM SubfieldName ORDER BY RAND() ";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        
        	ResultSet rs = stmt.executeQuery();
	        
        	while(rs.next()) {
        		
        		String field = rs.getString("name");
        		fieldInterest.put(field, sumMapVal(_fieldInterest, field));
        	}
        	
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR updateExperimentProfile(): " + e);
		}
		
		return fieldInterest;
	}
	
	public HashMap<String, Integer> buildUniInterest() {
		HashMap<String, Integer> uniInterest = new HashMap<String, Integer>();
		
		try {
			String sql = 
					"SELECT DISTINCT suggestion FROM Suggestion "
					+ "WHERE idSuggestionType >= 2 AND idSuggestionType <= 6 "
					+ "AND suggestion IS NOT NULL AND CHAR_LENGTH(suggestion) > 5 ORDER BY RAND() ";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        
        	ResultSet rs = stmt.executeQuery();
	        
        	while(rs.next()) {
        		
        		String uni = rs.getString("suggestion");
        		Integer uniNum = sumMapVal(_uniInterest, uni) + sumMapVal(_bachInterest, uni) + sumMapVal(_mastInterest, uni) + sumMapVal(_doctInterest, uni) + sumMapVal(_postDocInterest, uni);
        		uniInterest.put(uni, uniNum);
        	}
        	
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR updateExperimentProfile(): " + e);
		}
		
		return uniInterest;
	}
	
	public HashMap<String, Integer> buildProfInterest() {
		HashMap<String, Integer> profInterest = new HashMap<String, Integer>();
		
		Professors profs = _MainUI.getApi().getProfessors();
		this.createIntHM(profs, 0);
		
		for (Map.Entry<String, Integer> e : _profInterest.entrySet()) {
			System.out.println("PROF: " + e.getKey() + " - " + e.getValue());
			profInterest.put(e.getKey(), e.getValue());
		}
		
		return profInterest;
	}
	
	//TO BE CALLED FOR THE INTEREST
	public String[] getInterestedField() {
		Professors profs = _MainUI.getApi().getProfessors();
		this.createIntHM(profs, 0);
		
		String reco[] = new String[3];
		
		if (_totalScore == 0) {
			reco[0] = "noScore";
			System.out.println("ERROR: user has no interests; _totalScore = 0");
			return reco;
		}
		
		int randProf = _probabilityNM.higherEntry((int) (Math.random()*_totalScore)).getValue();
		
		//calculate which column to ask on
		int randCol = _MainUI.getApi().getRandom(2, 10); //get random 2-10
		System.out.println("suggType Size: " + suggTypes.size());
		int randType = _MainUI.getApi().getRandom(0, suggTypes.size()); //get random
		
		String sugg_type = Integer.toString(randCol);
		System.out.println(sugg_type);
		System.out.println("ask about professor with id number " + randProf + " and named " + profs.getProfName(randProf) + " about sugg type " + sugg_type + " which is " + _model.getSuggType(sugg_type));
		
		reco[0] = String.valueOf(randProf); //prof id
		reco[1] = profs.getProfName(randProf); //prof name
		reco[2] =  _model.getSuggType(Integer.toString(randCol)); //column type name
		
		System.out.println("Array[]: " + reco[0] + " " + reco[1] + " " + reco[2]);
		
		return reco;
	}
	
	private Integer sumMap(HashMap<String, Integer> map) {
		Integer tot = 0;
		for (Integer i : map.values()) {
		    tot += i;
		}
		return tot;
	}
	
	private Integer sumMapVal(HashMap<String, Integer> map, String key) {
		Integer val = 0;	
		if(map.get(key) != null) {
			val = map.get(key);
		}
		return val;
	}
	
	//GET SOMETHING THEY HAVE NO INTEREST IN
	public String[] getNoInterest() {
		Professors profs = _MainUI.getApi().getProfessors();
		String reco[] = new String[3];
		
		int noInt = 0;
		
		//update profile interest
		this.createIntHM(profs, noInt);
		
		//if they have some interest in everything, for now, abort
		while (_noInterestList.isEmpty()) {
			if (noInt == 0) {
				noInt = 1;
			} else {
				noInt = noInt*2;
			}
			this.createIntHM(profs, noInt);
		}
		
		//randomise which entry to ask about
		//int rand = (int) (Math.random()*_noInterestList.size());
		int rand = new Random().nextInt(_noInterestList.size());
		
		//randomise which col to ask about
		int randProf = _noInterestList.get(rand);
		int randCol = _MainUI.getApi().getRandom(2, 10); //get random 2-10
		
		//return corresponding cell
		System.out.println("current uninterested cell is person " + randProf + " named " + profs.getProfName(randProf) +  " sugg type " + randCol + " which is " + _model.getSuggType(Integer.toString(randCol)));
		
		reco[0] = String.valueOf(randProf); //prof ID
		reco[1] = profs.getProfName(randProf); //prof name
		reco[2] =  _model.getSuggType(Integer.toString(randCol)); //column type name
		
		return reco;
	}
	
	public void createIntHM(Professors profs, int noInt) {
		
		_totalScore = 0;
		
		for (int key = 1; key < profs.getMaxProf(); key++) {
			
			if (profs.profExists(key)) {
			
			    double score = 0;
			    
			    //for each hashmap, check if it matches with the item property
			    //DOES NOT INCLUDE RANK OR GENDER
			    score += this.compareToGrid(_profInterest, profs.getProfName(key));
			    score += this.compareToGrid(_uniInterest, profs.getProfUni(key));
			    score += this.compareToGrid(_fieldInterest, profs.getProfField(key));
			    score += this.compareToGrid(_bachInterest, profs.getProfBach(key));
			    score += this.compareToGrid(_mastInterest, profs.getProfMast(key));
			    score += this.compareToGrid(_doctInterest, profs.getProfDoct(key));
			    score += this.compareToGrid(_postDocInterest, profs.getProfPostDoc(key));
			    //_domainInterest
			    			    
			    //update totalscore
			    _totalScore += score;
			    
			    //if profile matches professor, add them to the interest navmap
				if (score >= noInt) {
				    _probabilityNM.put( _totalScore, key);
				} else {
					//otherwise, they have no interest and the professor can be added to the no interest list
					_noInterestList.add(key);
				}
			}
		}
	}
	
	//compares current entry that shows up in grid to see if it matches the user's profile
	public double compareToGrid(HashMap<String, Integer> hm, String toCompare) {
		double toReturn = 0;
		for (String key: hm.keySet()) {
			if (toCompare.equals(key)) {
				toReturn = (double) hm.get(key);
				break;
			}
		}
		return toReturn;
	}
	
	public void printInterest() {
		if (!_profInterest.isEmpty()) {
			System.out.println("prof interest hm is " + _profInterest);
		} else {
			System.out.println("no profs");
		}
		
		if (!_uniInterest.isEmpty()) {
			System.out.println("uni interest hm is " + _uniInterest);
		} else {
			System.out.println("no uni");
		}

		if (!_fieldInterest.isEmpty()) {
			System.out.println("field interest hm is " + _fieldInterest);
		} else {
			System.out.println("no field");
		}

		if (!_bachInterest.isEmpty()) {
			System.out.println("bach interest hm is " + _bachInterest);
		} else {
			System.out.println("no bach");
		}
		
		if (!_mastInterest.isEmpty()) {
			System.out.println("mast interest hm is " + _mastInterest);
		} else {
			System.out.println("no mast");
		}
		
		if (!_doctInterest.isEmpty()) {
			System.out.println("doct interest hm is " + _doctInterest);
		} else {
			System.out.println("no doct");
		}
		
		if (!_postDocInterest.isEmpty()) {
			System.out.println("postdoc interest hm is " + _postDocInterest);
		} else {
			System.out.println("no postdoc");
		}
	}	
}