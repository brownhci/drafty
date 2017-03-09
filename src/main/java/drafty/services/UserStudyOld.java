package drafty.services;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
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

public class UserStudyOld {
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
	
	//variables and external classes
	private UserBehaviorService _ub = new UserBehaviorService();
	private UserInterest _model = new UserInterest();
	private int _totalScore;

	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	public UserStudyOld() {
		System.out.println("CREATE UserStudy OLD");
		
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
		
		/*
		if(flag = true) { //avoids null pointer exception
			//add rows interest; other 3 are not added because they would the user model to show interest in almost every prof
			this.addToHM(_profInterest, profs, _clickRow);
			this.addToHM(_uniInterest, unis, _clickRow);
			this.addToHM(_fieldInterest, fields, _clickRow);
			this.addToHM(_bachInterest, bach, _clickRow);
			this.addToHM(_mastInterest, mast, _clickRow);
			this.addToHM(_doctInterest, doct, _clickRow);
			this.addToHM(_postDocInterest, postdoc, _clickRow);	
		}
		*/
	}
	
	public void genUserInt(HashMap<String, Integer> hm, String suggType) {
		
		//adding to  hashmap based on single clicks
		//List<String> clickList = db.getClickTypes("0", suggType);
		//this.addToHM(hm, clickList, _click);
		
		//adding to hashmap based on double clicks
		//List<String> dclickList = db.getClickTypes("1", suggType);
		//this.addToHM(hm, dclickList, _dclick);
		
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
		
		System.out.println("recording click " + doubleClick + " for field " + cell_value);
		
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
		
		String sugg_type = Integer.toString(randCol);
		
		System.out.println("ask about professor with id number " + randProf + " and named " + profs.getProfName(randProf) + " about sugg type " + sugg_type + " which is " + _model.getSuggType(sugg_type));
		
		reco[0] = String.valueOf(randProf); //prof id
		reco[1] = profs.getProfName(randProf); //prof name
		reco[2] =  _model.getSuggType(Integer.toString(randCol)); //column type name
		
		return reco;
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
	
	//BLANK
	//TO BE CALLED FOR THE INTEREST
	public String[] getInterestedFieldBlank() {
		Professors profs = _MainUI.getApi().getProfessors();
		this.createIntHM(profs, 0);
		
		String reco[] = new String[3];
		
		if (_totalScore == 0) {
			reco[0] = "noScore";
			System.out.println("ERROR: user has no interests; _totalScore = 0");
			return reco;
		}
		
		Integer randProf = _probabilityNM.higherEntry((int) (Math.random()*_totalScore)).getValue();
		String suggTypeID = null;
		
		int flag = 0;
		Integer blankSuggs = generateBlankSuggestions();
		while(flag <= blankSuggs) {
			suggTypeID = checkBlankSuggestions(randProf);
			if(suggTypeID.equals("no match")) {
				randProf = _probabilityNM.higherEntry((int) (Math.random()*_totalScore)).getValue();
			} else {
				System.out.println("RandProf = " + randProf);
				break;
			}
			flag++;
		}
		
		if(flag > blankSuggs) {
			reco[0] = "noScore";
			System.out.println("ERROR: user has no matching blank interests");
			return reco;
		}
		
		//calculate which column to ask on
		Integer randCol = _MainUI.getApi().getRandom(2, 10); //get random 2-10
		
		//String sugg_type = Integer.toString(randCol);
		String sugg_type = _model.getSuggType(suggTypeID);
		
		System.out.println("interested professor (with blank cell) with id number " + randProf + " and named " + profs.getProfName(randProf) + " about sugg type " + sugg_type);
		
		reco[0] = String.valueOf(randProf); //prof id
		reco[1] = profs.getProfName(randProf); //prof name
		reco[2] =  sugg_type; //column type name
		//reco[2] =  _model.getSuggType(Integer.toString(randCol)); //column type name
		
		return reco;
	}
	
	//GET SOMETHING THEY HAVE NO INTEREST IN
	public String[] getNoInterestBlank() {
		Professors profs = _MainUI.getApi().getProfessors();
		String reco[] = new String[3];
		
		Integer randProf = getRandProfNoInterest();
		
		String suggTypeID = null;
		
		int flag = 0;
		Integer blankSuggs = generateBlankSuggestions();
		while(flag <= blankSuggs) {
			suggTypeID = checkBlankSuggestions(randProf);
			if(suggTypeID.equals("no match")) {
				randProf = _probabilityNM.higherEntry((int) (Math.random()*_totalScore)).getValue();
			} else {
				break;
			}
			flag++;
		}
		
		if(flag > blankSuggs) {
			reco[0] = "noScore";
			System.out.println("ERROR: user has no matching blank interests");
			return reco;
		}
		
		//calculate which column to ask on
		Integer randCol = _MainUI.getApi().getRandom(2, 10); //get random 2-10
		
		//String sugg_type = Integer.toString(randCol);
		String sugg_type = _model.getSuggType(suggTypeID);
		
		System.out.println("uninterested professor (with blank cell) with id number " + randProf + " and named " + profs.getProfName(randProf) + " about sugg type " + sugg_type);
		
		reco[0] = String.valueOf(randProf); //prof id
		reco[1] = profs.getProfName(randProf); //prof name
		reco[2] =  sugg_type; //column type name
		//reco[2] =  _model.getSuggType(Integer.toString(randCol)); //column type name
		
		return reco;
	}
	
	private Integer getRandProfInterest() {
		
		this.createIntHM(_MainUI.getApi().getProfessors(), 0);
		
		if (_totalScore == 0) {
			return -1;
		}
		
		return _probabilityNM.higherEntry((int) (Math.random()*_totalScore)).getValue();
	}
	
	private Integer getRandProfNoInterest() {
		int noInt = 0;
		
		//update profile interest
		this.createIntHM(_MainUI.getApi().getProfessors(), noInt);
		
		//if they have some interest in everything, for now, abort
		while (_noInterestList.isEmpty()) {
			if (noInt == 0) {
				noInt = 1;
			} else {
				noInt = noInt*2;
			}
			this.createIntHM(_MainUI.getApi().getProfessors(), noInt);
		}
		
		//randomise which entry to ask about
		return new Random().nextInt(_noInterestList.size());
	}
	
	private Map<String, String> blankSuggestions = new HashMap<String, String>();
	
	public Integer generateBlankSuggestions() {
		Integer blankSuggs = 0;
		
		try {
			String sql = "SELECT idSuggestionType, idPerson, idSuggestion, count(*) as cnt "
						+ "FROM Suggestion "
						+ "WHERE suggestion = '' AND idSuggestionType != 11  AND idSuggestionType != 12 "
						+ "GROUP BY idSuggestionType "
						+ "GROUP BY idSuggestion ORDER BY RAND() ";
			
			sql = "select o.idPerson AS idPerson,o.idSuggestionType AS idSuggestionType, o.idSuggestion, count(*) as cnt "
				+ "from (Suggestion o left join drafty.Suggestion b on "
				+ "(((o.idPerson = b.idPerson) and (o.confidence < b.confidence) and (o.idSuggestionType = b.idSuggestionType)))) "
				+ "WHERE o.suggestion = '' AND o.idSuggestionType < 11 "
				+ "GROUP BY o.idSuggestion ORDER BY RAND()";
			
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);

        	ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				if(rs.getInt("cnt") > 0) { //makes sure it is truly a blank cell
					blankSuggestions.put(rs.getString("idSuggestionType") + "||" + rs.getString("idSuggestion"), rs.getString("idPerson"));
					blankSuggs++;
				}
			}
	        
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR generateBlankSuggestions(): " + e);
		}
		
		return blankSuggs;
	}
	
	public String checkBlankSuggestions(Integer randProf) {
		String idSuggestionType = "no match";
		Integer postDocCheck = 3;
		Integer postDocCount = 0;
		
		for (Map.Entry<String, String> entry : blankSuggestions.entrySet()) {
			if(entry.getValue().equals(randProf.toString())) {
				String[] split = entry.getKey().split("||");
				
				//System.out.println(postDocCount + " > " + postDocCheck + ", idSuggType = " + split[0]);
				
				if(!split[0].equals("6")) {
					if(split[0].equals("1")) {
						idSuggestionType = "10"; //Gender
					} else {
						idSuggestionType = split[0];
					}
				} else if(postDocCount > postDocCheck) { //will trigger on 4th PostDoc match
					if(split[0].equals("1")) {
						idSuggestionType = "10"; //Gender
					} else {
						idSuggestionType = split[0];
					}
				} 
				
				postDocCount++; 
				
				//System.out.println("EXPLODE: " + split[0] +  ", length = " + entry.getKey().length() + ", " + entry.getKey());
			}
		}
		
		return idSuggestionType;
	}
	
	public String[] getConflictedSuggestions(boolean getInterest) {
		String idSuggestionType = "no match";
		HashMap<String, String> conflicted = new HashMap<String, String>();
		String reco[] = new String[3];
		
		String sql = "SELECT * FROM " 
					+ "( "
						+ "SELECT count(*) ct, idSuggestionType, idPerson "
						+ "FROM Suggestion s "
						+ "WHERE idSuggestionType <= 10 "
						+ "GROUP BY idPerson, idSuggestionType "
					+ ") as rs "
					+ "WHERE ct > 1 "
					+ "ORDER BY rand()";
		
		try (PreparedStatement stmt = _MainUI.getApi().getStmt(sql)) {
			ResultSet rs = stmt.executeQuery();
			
			while (rs.next()) {
				conflicted.put(rs.getString("idPerson") + "_" + rs.getString("idSuggestionType"), rs.getString("idSuggestionType"));
			}
		} catch (Exception e) {
			_MainUI.getApi().logError(e);
		}
		
		Integer randProf;
		int size;
		if(getInterest) {
			randProf = getRandProfInterest();
			size = _probabilityNM.size();
		} else {
			randProf = getRandProfNoInterest();
			size = _noInterestList.size();
		}
		
		int count = 0;
		while(count < size) { //loop through all entries
			for (Map.Entry<String, String> entry : conflicted.entrySet()) {
				String vals[] = entry.getKey().split("_");
				
				if(randProf.toString().equals(vals[0])) {
					System.out.println("Key : " + entry.getKey() + " : " + randProf.toString() + " = " + vals[0]);
					idSuggestionType = entry.getValue();
					break;
				}
			}
			
			if(!idSuggestionType.equals("no match")) {
				break;
			} else {
				if(getInterest) {
					randProf = getRandProfInterest();
				} else {
					randProf = getRandProfNoInterest();
				}
			}
			count++;
		}
		
		reco[0] = randProf.toString(); //prof id
		reco[1] = _MainUI.getApi().getProfessors().getProfName(randProf); //prof name
		reco[2] = _model.getSuggType(idSuggestionType); //column type name
		
		System.out.println("CONFLICTED FIELD! " + idSuggestionType);
		
		return reco;
	}
	
	public String getBlankSuggestion(String randProf) {
		String idSuggestionType = "no match";
		
		try {
			String sql = "SELECT count(*) as cnt, idSuggestionType "
						+ "WHERE idPerson = ? "
						+ "AND suggestion = '' AND idSuggestionType != 11  AND idSuggestionType != 12 "
						+ "ORDER BY RAND()";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
	        stmt.setString(1, randProf);

        	ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				idSuggestionType = rs.getString("idSuggestionType");
				break;
			}
	        
	        stmt.getConnection().close();
	        stmt.close();
		} catch (SQLException e) {
			System.out.println("ERROR getSuggestionWithMaxConf(): " + e);
		}
		
		return idSuggestionType;
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
