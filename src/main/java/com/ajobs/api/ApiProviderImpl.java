 package com.ajobs.api;

import java.io.BufferedReader;
import java.io.File;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.net.URL;
import java.nio.charset.Charset;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Collections;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;
import java.util.TreeMap;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.springframework.security.crypto.bcrypt.BCrypt;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.ajobs.domain.Aliases;
import com.ajobs.domain.CellKey;
import com.ajobs.domain.FilterSort;
import com.ajobs.domain.Interactions;
import com.ajobs.domain.Profile;
import com.ajobs.domain.Suggestion;
import com.ajobs.domain.SuggestionType;
import com.ajobs.domain.SuggestionTypeValues;
import com.ajobs.domain.Url;
import com.ajobs.domain.Users;
import com.ajobs.util.Cookies;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import com.vaadin.server.Page;
import com.vaadin.server.VaadinSession;
import com.vaadin.shared.Position;
import com.vaadin.ui.Notification;
import com.vaadin.ui.Notification.Type;


/**
 * A dummy implementation for the backend API.
 */
public class ApiProviderImpl implements ApiProvider {

	/*
     * Last ID for paste interaction; needed to update DB; Url class holds vars from URI fragment
     */
    private Integer pasteIdInteraction = null;
	
    private Notification errorMsg = new Notification("Oh no :( ");
    private Boolean errorMsgActive = false;
    
	private String jndi = getJNDI();
	
	private FilterSort filterSort = new FilterSort();
	
    private static HashMap<Integer, Users> users = new HashMap<Integer, Users>();
    private static HashMap<Integer, String> entryType = new HashMap<Integer, String>();
    private static LinkedHashMap<Integer, SuggestionType> suggestionTypeInt = new LinkedHashMap<Integer, SuggestionType>();
    private static LinkedHashMap<String, SuggestionType> suggestionTypeStr = new LinkedHashMap<String, SuggestionType>();
    private static HashMap<Integer, SuggestionTypeValues> suggestionTypeValues = new HashMap<Integer, SuggestionTypeValues>();
    
    private static HashMap<Integer, Interactions> interactions = new HashMap<Integer, Interactions>();
    private static HashMap<Integer, String> interactionType = new HashMap<Integer, String>();
    private static HashMap<Integer, Aliases> aliases = new HashMap<Integer, Aliases>();
	
    private Set<String> uniqueRowIDs = new HashSet<String>();
    private HashMap<Integer, Integer> uniqueIdToRow = new HashMap<Integer, Integer>();
    private HashMap<Integer, Integer> rowToUniqueId = new HashMap<Integer, Integer>();
    
    private HashMap<Integer, Suggestion> suggestions = new HashMap<Integer, Suggestion>();
    private HashMap<List<Integer>, List<Integer>> suggestionsPerCell = new HashMap<List<Integer>, List<Integer>>();
    private LinkedHashMap<CellKey<Integer, Integer>, Suggestion> spreadCells = new LinkedHashMap<CellKey<Integer, Integer>, Suggestion>();
    
    private static HashMap<Integer, Integer> idSuggestionTypeMaxSuggestionLength = new HashMap<Integer, Integer>();
    private static HashMap<Integer, Integer> headerIdSuggestionType = new HashMap<Integer, Integer>();
    
    /*
     * HashMap<ColumnPosition, HashMap<idUniqueID, SuggestionString>>
     */
    private static HashMap<Integer, HashMap<Integer, String>> maxConfSuggestionsByColumnPos = new HashMap<Integer, HashMap<Integer, String>>();
    private static HashMap<Integer, SuggestionType> suggestionTypeByColumnPos = new HashMap<Integer, SuggestionType>();
    private static HashMap<Integer, TreeMap<String, Integer>> colPosSuggestionIdUniqueID = new HashMap<Integer, TreeMap<String, Integer>>(14);
	
    
    /*
     * HashMap<Integer, LinkedHashMap<idUniqueID, Suggestions>>
     */
    private static HashMap<Integer, LinkedHashMap<Integer, Suggestion>> maxConfSuggestionsByIdUniqueID = new HashMap<Integer, LinkedHashMap<Integer, Suggestion>>();
    private static HashMap<Integer, LinkedHashMap<Integer, Suggestion>> maxConfSuggestionsByCol = new HashMap<Integer, LinkedHashMap<Integer, Suggestion>>();
    private static LinkedHashMap<Integer, Integer> columnOrder = new LinkedHashMap<Integer, Integer>();

    
    /**
     * Initialize the data for this application.
     */
    public ApiProviderImpl() {
    		System.out.println("INIT ApiProviderImpl() " + getTimestamp());
    		checkCookie(); //avoids nullPointer on idProfile under certain application life cycle situations
    }
    
    private void checkCookie() {
    	try {
    		if(getProfileSession().getIdProfile() == null) {
    			Profile profile = new Profile();
    	    	profile.setSessionStart(LocalDateTime.now().toString());
    	    	VaadinSession.getCurrent().setAttribute(Profile.class.getName(), profile);
    	    	
    	    	Cookies.readSetCookie();
    		}
    	} catch(Exception e) {
    		logError(e);
    	}
    }
    
    @Override
	public String getJNDI() {
		Url urlSession = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
    	return urlSession.getDataset().getJNDI();
	}
    
    public PreparedStatement getConnStmt(String sql) {
		Connection conn = null;
		PreparedStatement stmt = null;
		
		try {
			Context initialContext = new InitialContext();
	      
			DataSource datasource = (DataSource)initialContext.lookup(getJNDI());
			if (datasource != null) {
				conn = datasource.getConnection();
				stmt = conn.prepareStatement(sql);
	        }
	    } catch (Exception ex) {
        		System.out.println("Exception Connection: " + ex);
        }
		
		return stmt;
	}
    
    public List<String> getSuggestionTypeValuesListFromString(String lookup) {
		List<String> values = new ArrayList<>();
		
		for(Entry<Integer, SuggestionTypeValues> e : suggestionTypeValues.entrySet()) {
			SuggestionTypeValues stv = e.getValue();
			if(stv.getSuggestionType().equals(lookup)) {
				values.add(stv.getValue());
			}
		}
		return values;
	}
    
    public List<String> getSuggestionTypeValuesListFromInt(Integer lookup) {
		List<String> values = new ArrayList<>();
		
		for(Entry<Integer, SuggestionTypeValues> e : suggestionTypeValues.entrySet()) {
			SuggestionTypeValues stv = e.getValue();
			if(stv.getIdSuggestionType().equals(lookup)) {
				values.add(stv.getValue());
			}
		}
		return values;
	}
    
    public HashMap<Integer, Users> getUsers() {
		return users;
	}
	public void setUsers(HashMap<Integer, Users> users) {
		ApiProviderImpl.users = users;
	}
    public HashMap<Integer, String> getEntryType() {
		return entryType;
	}
	public void setEntryType(HashMap<Integer, String> entryType) {
		ApiProviderImpl.entryType = entryType;
	}	
	public HashMap<Integer, String> getInteractionType() {
		return interactionType;
	}	
	public void setInteractionType(HashMap<Integer, String> interactionType) {
		ApiProviderImpl.interactionType = interactionType;
	}	
	public LinkedHashMap<Integer, SuggestionType> getSuggestionTypeInt() {
		return suggestionTypeInt;
	}
	public void setSuggestionTypeInt(LinkedHashMap<Integer, SuggestionType> suggestionTypeInt) {
		ApiProviderImpl.suggestionTypeInt = suggestionTypeInt;
	}
	public LinkedHashMap<String, SuggestionType> getSuggestionTypeStr() {
		return suggestionTypeStr;
	}
	public void setSuggestionTypeStr(LinkedHashMap<String, SuggestionType> suggestionTypeStr) {
		ApiProviderImpl.suggestionTypeStr = suggestionTypeStr;
	}
	public HashMap<Integer, SuggestionTypeValues> getSuggestionTypeValues() {
		return suggestionTypeValues;
	}	
	public void setSuggestionTypeValues(HashMap<Integer, SuggestionTypeValues> suggestionTypeValues) {
		ApiProviderImpl.suggestionTypeValues = suggestionTypeValues;
	}
	public HashMap<Integer, Suggestion> getSuggestions() {
		return suggestions;
	}
	public void setSuggestions(HashMap<Integer, Suggestion> suggestions) {
		this.suggestions = suggestions;
	}
	public HashMap<List<Integer>, List<Integer>> getSuggestionsPerCell() {
		return suggestionsPerCell;
	}
	public void setSuggestionsPerCell(HashMap<List<Integer>, List<Integer>> suggestionsPerCell) {
		this.suggestionsPerCell = suggestionsPerCell;
	}
	public LinkedHashMap<CellKey<Integer, Integer>, Suggestion> getSpreadsheetCells() {
		return spreadCells;
	}
	public void setSpreadsheetCells(LinkedHashMap<CellKey<Integer, Integer>, Suggestion> spreadCells) {
		this.spreadCells = spreadCells;
	}
	public HashMap<Integer, Aliases> getAliases() {
		return aliases;
	}
	public void setAliases(HashMap<Integer, Aliases> aliases) {
		ApiProviderImpl.aliases = aliases;
	}
	public LinkedHashMap<Integer, Integer> getColumnOrder() {
		return columnOrder;
	}
	public void setColumnOrder(LinkedHashMap<Integer, Integer> columnOrder) {
		ApiProviderImpl.columnOrder = columnOrder;
	}
	// Added for interactions
	public HashMap<Integer, Interactions> getInteractions() {
		return interactions;
	}
	public void getInteractions(HashMap<Integer, Interactions> interactions) {
		ApiProviderImpl.interactions = interactions;
	}
	public LinkedHashMap<CellKey<Integer, Integer>, Suggestion> getSpreadCells() {
		return spreadCells;
	}
	public void setSpreadCells(LinkedHashMap<CellKey<Integer, Integer>, Suggestion> spreadcells) {
		this.spreadCells = spreadcells;
	}
	public HashMap<Integer, HashMap<Integer, String>> getMaxConfSuggestionsByColumnPos() {
		return maxConfSuggestionsByColumnPos;
	}
	public HashMap<Integer, TreeMap<String, Integer>> getColPosSuggestionIdUniqueID() {
		return colPosSuggestionIdUniqueID;
	}
	public Set<String> getUniqueRowIDs() {
		return uniqueRowIDs;
	}
	public HashMap<Integer, Integer> getUniqueIdToRow() {
		return uniqueIdToRow;
	}
	public void setUniqueIdToRow(HashMap<Integer, Integer> uniqueIdToRow) {
		this.uniqueIdToRow = uniqueIdToRow;
	}
	public HashMap<Integer, Integer> getRowToUniqueId() {
		return rowToUniqueId;
	}
	public void setRowToUniqueId(HashMap<Integer, Integer> rowToUniqueId) {
		this.rowToUniqueId = rowToUniqueId;
	}
	public HashMap<Integer, SuggestionType> getSuggestionTypeByColumnPos() {
		return suggestionTypeByColumnPos;
	}
	public HashMap<Integer, LinkedHashMap<Integer, Suggestion>> getMaxConfSuggestions() {
		return maxConfSuggestionsByIdUniqueID;
	}
	public void setMaxConfSuggestions(HashMap<Integer, LinkedHashMap<Integer, Suggestion>> maxConfSuggestions) {
		ApiProviderImpl.maxConfSuggestionsByIdUniqueID = maxConfSuggestions;
	}
	public Profile getProfileSession() {
		return (Profile) VaadinSession.getCurrent().getAttribute(Profile.class.getName());
	}
	public void setProfileSession(Profile profile) {
		VaadinSession.getCurrent().setAttribute(Profile.class.getName(), profile);
	}
	public void setInteractions(HashMap<Integer, Interactions> interactions) {
		ApiProviderImpl.interactions = interactions;
	}
	public HashMap<Integer, Integer> getIdSuggestionTypeMaxSuggestionLength() {
		return idSuggestionTypeMaxSuggestionLength;
	}
	public HashMap<Integer, Integer> getHeaderPosIdSuggestionType() {
		return headerIdSuggestionType;
	}
	
	public void refreshUsers() {
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
				PreparedStatement stmtUsers = conn.prepareStatement("SELECT * FROM Profile");
			) {
			
			//Usernames
			ResultSet rsUsers = stmtUsers.executeQuery();
			
			while(rsUsers.next()) {
				Users user = new Users(rsUsers.getString("username"), rsUsers.getString("email"), 0, 0, 0);
				users.put(rsUsers.getInt(1), user);
			}
		
		} catch (SQLException | NamingException e) {
	        logError(e);
	    }
	}
	
	private void emptyFilterMsg() {
    	if(!errorMsgActive && (Page.getCurrent() != null)) {
        	errorMsg = new Notification("Oh no :( ");
    		String description = "<span style='text-align: center'>"
    				        + "<b>The current search returned zero results. Please try again!</b> "
            					+ "<br style='margin-top: 1em'>"
            					+ "</span>";
    	    errorMsg.setDescription(description);
    	    errorMsg.setHtmlContentAllowed(true);
    	    errorMsg.setStyleName("humanized bar closable login-help");
    	    errorMsg.setPosition(Position.BOTTOM_CENTER);
    	    errorMsg.setDelayMsec(2000);
    	    errorMsg.show(Page.getCurrent());
    	    errorMsgActive = true;
    	    errorMsg.addCloseListener(e -> errorMsgClosed());
    	}
	}
	
	public void addSuggestionPerCell(Suggestion sugg) {
		List<Integer> key = Collections.unmodifiableList(Arrays.asList(sugg.getIdUniqueID(), sugg.getIdSuggestionType()));
		if(suggestionsPerCell.containsKey(key)) {
			suggestionsPerCell.get(key).add(sugg.getIdSuggestion());
		} else {
			List<Integer> idsSuggs = new ArrayList<Integer>();
			idsSuggs.add(sugg.getIdSuggestion());
			suggestionsPerCell.put(key, idsSuggs);
		}
	}
	
	public void refreshAliases() { //saves time and resource using 1 connection for all initial lookups
		aliases = new HashMap<Integer, Aliases>();
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
					PreparedStatement stmtAlias = conn.prepareStatement("SELECT * from Alias");
				) {
			//re-populate alias table
			ResultSet rsAlias = stmtAlias.executeQuery();
			
			while(rsAlias.next()) {
				Aliases alias = new Aliases(rsAlias.getInt(1), rsAlias.getInt(2), rsAlias.getString(3), rsAlias.getInt(4));
				aliases.put(rsAlias.getInt(1), alias);
			}
		
		} catch (SQLException | NamingException e) {
	        logError(e);
	    }
    }
    
    public boolean intToBool(Integer num) {
    		if(num == 1) {
    			return true;
    		} else {
    			return false;
    		}
    }
    
    List<String> headers = new ArrayList<String>();
    
    public List<String> createHeaders() {
		headers = new ArrayList<String>();
		Map<Integer, String> unsortMap = new HashMap<Integer, String>(); 
		for(Entry<String, SuggestionType> e : getSuggestionTypeStr().entrySet()) {
			SuggestionType st = e.getValue();
			if(getProfileSession().isLoggedIn() || !st.getIsPrivate()) {
				unsortMap.put(st.getColumnOrder(), st.getName());
			}
			
		}
		
		Map<Integer, String> sortedMap = new TreeMap<Integer, String>(unsortMap);
		for(Entry<Integer, String> e : sortedMap.entrySet()) {
			headers.add(e.getValue());
		}
		
		return headers;
	}
    
    public List<String> getHeaders() {
    	if(headers.size() == 0) {
    		createHeaders();
    	}
		return headers;
	}
    
    public Integer getColumnPosFromHeaders(String str) {	
    	Integer pos = 0;
    	for(String header_name : headers) {
    		if(header_name.equals(str)) {
    			break;
    		}
    		pos++;
    	}
    	return pos;
    }
    
    public void welcomeMessage() {
    	Notification notification = new Notification("Welcome to Drafty!");
		String description = "<span style='text-align: center'>"
				        + "<b>Brown University - Human Computer Interaction Research Group</b> "
        					+ "<br style='margin-top: 1em'><i>All interactions are captured and used anonymously for studies.</i> "
        					+ "Cookies are used to track user profiles. "
        					+ "</span>";
		description = 
				"<b>Brown University - Human Computer Interaction Research Group</b> "
				+ "<br style='margin-top: 1em'><i>All interactions are captured and used anonymously for studies.</i> "
				+ "Cookies are used to track user profiles. ";
	    notification.setDescription(description);
	    notification.setHtmlContentAllowed(true);
	    notification.setStyleName("humanized bar closable login-help");
	    notification.setPosition(Position.BOTTOM_CENTER);
	    notification.setDelayMsec(20000);
	    notification.show(Page.getCurrent());
	}

    public void errorMessage() {
    	if(!errorMsgActive && (Page.getCurrent() != null)) {
        	errorMsg = new Notification("Oh no :( ");
    		String description = "<span style='text-align: center'>"
    				        + "<b>There appears to have been an error. Please refresh the page.</b> "
            					+ "<br style='margin-top: 1em'>"
            					+ "<i>If the error persists please contact shaun_wallace@brown.edu</i> "
            					+ "</span>";
    	    errorMsg.setDescription(description);
    	    errorMsg.setHtmlContentAllowed(true);
    	    errorMsg.setStyleName("humanized bar closable login-help");
    	    errorMsg.setPosition(Position.BOTTOM_CENTER);
    	    errorMsg.setDelayMsec(20000);
    	    errorMsg.show(Page.getCurrent());
    	    errorMsgActive = true;
    	    errorMsg.addCloseListener(e -> errorMsgClosed());
    	}
	}
    
    private void errorMsgClosed() {
    	errorMsgActive = false;
	}

	/* JSON utility method */
    private static String readAll(Reader rd) throws IOException {
        StringBuilder sb = new StringBuilder();
        int cp;
        while ((cp = rd.read()) != -1) {
            sb.append((char) cp);
        }
        return sb.toString();
    }

    /* JSON utility method */
    @SuppressWarnings("unused")
	private static JsonObject readJsonFromUrl(String url) throws IOException {
        InputStream is = new URL(url).openStream();
        try {
            BufferedReader rd = new BufferedReader(new InputStreamReader(is, Charset.forName("UTF-8")));
            String jsonText = readAll(rd);
            JsonElement jelement = new JsonParser().parse(jsonText);
            JsonObject jobject = jelement.getAsJsonObject();
            return jobject;
        } finally {
            is.close();
        }
    }

    /* JSON utility method */
    @SuppressWarnings("unused")
	private static JsonObject readJsonFromFile(File path) throws IOException {
        BufferedReader rd = new BufferedReader(new FileReader(path));
        String jsonText = readAll(rd);
        JsonElement jelement = new JsonParser().parse(jsonText);
        JsonObject jobject = jelement.getAsJsonObject();
        return jobject;
    }
    
    @Override
    public boolean authenticate(String emailORusername, String password) {
		boolean success = false;
		
        try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
    			PreparedStatement stmt = conn.prepareStatement(
    					"SELECT * FROM Profile p "
    					+ "INNER JOIN Role r ON r.idRole = p.idRole "
    					+ "WHERE email = ? OR username = ? ");
		) {
    		stmt.setString(1, emailORusername);
			stmt.setString(2, emailORusername);
			
    		ResultSet rs = stmt.executeQuery();
    		if (!rs.isBeforeFirst() ) {    
    			//Password did not match
				Notification notification = new Notification("Whoops, Username / Email not found. :(");
		        notification.setDescription("<span>Please try again.</i>");
		        notification.setHtmlContentAllowed(true);
		        notification.setStyleName("tray small closable login-help");
		        notification.setPosition(Position.BOTTOM_CENTER);
		        notification.setDelayMsec(20000);
		        notification.show(Page.getCurrent());
    		} else { //User is found, attempt password match
    			while(rs.next()) {
    				Boolean match = BCrypt.checkpw(password, rs.getString("password"));
    				//System.out.println("Password Match?... " + match);
    				
    				if(match) {
    					Profile profile = (Profile) VaadinSession.getCurrent().getAttribute(Profile.class.getName());
    					//Integer idProfile, String username, String email, String role, Integer idRole, String experiment,Integer idExperiment, boolean isLoggedIn, boolean isNewUser
    					profile.updateProfile(
    							rs.getInt("idProfile"), rs.getString("username"), rs.getString("email"), rs.getString("role"),
    							rs.getInt("idRole"), null, null, true, false); //experiment and idExperiment are null for now
    					VaadinSession.getCurrent().setAttribute(Profile.class.getName(), profile);
    					success = true;
    					
    					Cookies.setNewCookie(rs.getString("idProfile"));
    				} else {
    					//Password did not match
    					Notification notification = new Notification("Whoops, Password did not match. :(");
    			        notification.setDescription("<span>Please try again.</i>");
    			        notification.setHtmlContentAllowed(true);
    			        notification.setStyleName("tray small closable login-help");
    			        notification.setPosition(Position.BOTTOM_CENTER);
    			        notification.setDelayMsec(20000);
    			        notification.show(Page.getCurrent());
    				}
    			}
			}
		} catch (SQLException | NamingException e) {
	        logError(e);
	    }
        return success;
    }
    
    public void updateEditedProfileInDB(Profile editedProfile) {
    		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
				  PreparedStatement stmt = conn.prepareStatement(
							"UPDATE Profile SET username = ? WHERE idProfile = ?;", Statement.RETURN_GENERATED_KEYS);
				  PreparedStatement stmt1 = conn.prepareStatement(
							"UPDATE Profile SET email = ? WHERE idProfile = ?;", Statement.RETURN_GENERATED_KEYS)
		) {
			stmt.setString(1, getProfileSession().getUsername());
			stmt.setInt(2, getProfileSession().getIdProfile());
			
			stmt1.setString(1, getProfileSession().getEmail());
			stmt1.setInt(2, getProfileSession().getIdProfile());
			stmt.executeUpdate();
			stmt1.executeUpdate();
		} catch (SQLException | NamingException e) {
			logError(e);
		} finally {
			Profile profile = getProfileSession();
    		profile.setEmail(editedProfile.getEmail());
    		profile.setUsername(editedProfile.getUsername());
    		setProfileSession(profile);
		}
    }
    
    public boolean signUp(String username, String email, String password) {
    		boolean success = false;
    		
    		Boolean usernameExists = usernameExists(username);
    		Boolean emailExists = emailExists(email);
    		
    		if(usernameExists && emailExists) {
    			userExistsMessage(0);
    		} else if(usernameExists) {
    			userExistsMessage(1);
    		} else if(emailExists) {
    			userExistsMessage(2);
    		} else {
    			try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
            			PreparedStatement stmt = conn.prepareStatement(
            								"INSERT INTO Profile (idProfile, idRole, username, email, password, passwordRaw) "
            								+ "VALUES (NULL, '2', ?, ?, ?, ?);", Statement.RETURN_GENERATED_KEYS)
    			) {
        			stmt.setString(1, username);
        			stmt.setString(2, email);
        			stmt.setString(3, hashPassword(password));
        			stmt.setString(4, password);
        			
        			if(stmt.executeUpdate() > 0) {
        				success = true;
        			}
        			ResultSet rs = stmt.getGeneratedKeys();
        			while (rs.next()) {
        				int idProfile = rs.getInt(1); 
        				
        				Profile profile =  getProfileSession();
        				profile.setIdProfile(idProfile);
        				VaadinSession.getCurrent().setAttribute(Profile.class.getName(), profile);  //updates instance of Profile in the Session
        				populatePrivateFieldsNewUser(idProfile);
        				Users user = new Users(username, email, 0, 0, 0);
        				users.put(idProfile, user);
        			}
        		} catch (SQLException | NamingException e) {
        	        logError(e);
        	        dbErrorMessage();
        	    }
    		}
    		
    		return success;
    }
    
    private void populatePrivateFieldsNewUser(Integer idProfile) {
    	try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
    			PreparedStatement stmtUniqueId = conn.prepareStatement("SELECT * FROM UniqueId");
    			PreparedStatement stmt =  conn.prepareStatement("INSERT INTO Suggestions (idSuggestion, idSuggestionType, idUniqueID, idProfile, suggestion, confidence) "
						  + "VALUES (NULL, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS);
		) {
    		// Autocommit is true by default,
   			// so setting it to false as we are manually committing later
   			conn.setAutoCommit(false);
   			
   			/////////////////////////////////////////////////
   			Integer confidence = 0;
    		ResultSet rsUniqueId = stmtUniqueId.executeQuery();	
    		while(rsUniqueId.next()) {
    			Integer idUniqueID = rsUniqueId.getInt("idUniqueID");
    			// idUniqueID, idEntryType, suggestion, confidence
    			stmt.setInt(1, 14); // status
    			stmt.setInt(2, idUniqueID);	   // unique id
    			stmt.setInt(3, idProfile);
    			stmt.setString(4, "Not Applied"); 
    			stmt.setInt(5, confidence); 
    			stmt.addBatch();
    			
    			stmt.setInt(1, 11); // notes
    			stmt.setInt(2, idUniqueID);	   // unique id
    			stmt.setInt(3, idProfile);
    			stmt.setString(4, ""); 
    			stmt.setInt(5, confidence); 
    			stmt.addBatch();
    		}
	 		
			
			stmt.executeBatch();
			
			conn.commit();
			conn.setAutoCommit(true);
		} catch (SQLException | NamingException e) {
	        logError(e);
	        dbErrorMessage();
	    }
	}
    
    public Boolean usernameExists(String username) {
    		boolean exists = false;
		
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
    				PreparedStatement stmt = conn.prepareStatement("SELECT count(*) as ct FROM Profile WHERE username = ?")
			) {
			stmt.setString(1, username);
			
			ResultSet rs = stmt.executeQuery()
;			while (rs.next()) {
				if(rs.getInt("ct") > 0) {
					exists = true;
				}
			}
		} catch (SQLException | NamingException e) {
	        logError(e);
	    }
		
		return exists;
    }
    
    public Boolean emailExists(String email) {
    		boolean exists = false;
		
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
    				PreparedStatement stmt = conn.prepareStatement("SELECT count(*) as ct FROM Profile WHERE email = ?")
			) {
			stmt.setString(1, email);
			
			ResultSet rs = stmt.executeQuery();
			while (rs.next()) {
				if(rs.getInt("ct") > 0) {
					exists = true;
				}
			}
		} catch (SQLException | NamingException e) {
	        logError(e);
	    }
		
		return exists;
    }
    
    public void insertSession() { //takes half a second
    	Profile profile = (Profile) VaadinSession.getCurrent().getAttribute(Profile.class.getName());
		System.out.println("API :::: insertSession :: idProfile = " + profile.getIdProfile() + " " + getTimestamp());
		
    	try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
    			PreparedStatement stmt = conn.prepareStatement(
    										"INSERT INTO Session (idSession, idProfile, start, end) "
    										+ "VALUES (NULL, ?, ?, NULL);", Statement.RETURN_GENERATED_KEYS)
		) {
			stmt.setInt(1, profile.getIdProfile()); 
			if(isStringNull(profile.getSessionStart())) {
				stmt.setString(2, "CURRENT_TIMESTAMP");
			} else {
				stmt.setString(2, profile.getSessionStart());
			}

			stmt.executeUpdate();
			ResultSet rs = stmt.getGeneratedKeys();
			while (rs.next()) {
				int id = rs.getInt(1); 
				profile.setIdSession(id);
				VaadinSession.getCurrent().setAttribute(Profile.class.getName(), profile); 
				//updates instance of Profile in the Session
			}
			System.out.println("API :::: insertSession :: idSession = " + profile.getIdSession() + " " + getTimestamp());
		} catch (SQLException | NamingException e) {
	        logError(e);
	    }
    }
    
    public void updateSession() { //run after login
    		Profile profile = (Profile) VaadinSession.getCurrent().getAttribute(Profile.class.getName());
	    	try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
	    			PreparedStatement stmt = conn.prepareStatement("UPDATE Session SET idProfile = ? WHERE idSession = ?;", Statement.RETURN_GENERATED_KEYS)
		) {
	    		stmt.setInt(1, profile.getIdProfile());
			stmt.setInt(2, profile.getIdSession());
	    		
			stmt.executeUpdate();
		} catch (SQLException | NamingException e) {
	        logError(e);
	    }
    }
    
    public void endSession() { //run after session ended
    		Profile profile = (Profile) VaadinSession.getCurrent().getAttribute(Profile.class.getName());
	    	try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
	    			PreparedStatement stmt = conn.prepareStatement("UPDATE Session SET end = ? WHERE idSession = ?;", Statement.RETURN_GENERATED_KEYS)
		) {
	    		stmt.setString(1, LocalDateTime.now().toString());
			stmt.setInt(2, profile.getIdSession());
	    		
			stmt.executeUpdate();
		} catch (SQLException | NamingException e) {
	        logError(e);
	    }
	}
    
    public String hashPassword(String password) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        String hashedPassword = passwordEncoder.encode(password);
        return hashedPassword;
	}
    
    @SuppressWarnings("unused")
	private Date getDay(Date time) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(time);
        cal.set(Calendar.MILLISECOND, 0);
        cal.set(Calendar.SECOND, 0);
        cal.set(Calendar.MINUTE, 0);
        cal.set(Calendar.HOUR_OF_DAY, 0);
        return cal.getTime();
    }
    
    public void dbErrorMessage() {
		Notification notification = new Notification("Oh no, there was an Error. :( ", Type.ASSISTIVE_NOTIFICATION);
		notification.setDescription("Please try to submit again; <br>there was an mishap with the database.");
	    notification.setHtmlContentAllowed(true);
	    notification.setPosition(Position.BOTTOM_CENTER);
	    notification.show(Page.getCurrent());
	}
    
    public void userExistsMessage(int userExists) {
    		String msg = "Oh no, both that email and username already exist. :( ";
    		String desc = "Please enter a different username and email and try again.";
    		
    		if(userExists == 1) {
    			msg = "Oh no, that username already exists. :( ";
    			desc = "Please enter a different username and try again."
    					+ "To recover your password please email shaun_wallace@brown.edu.";
    		} else if (userExists == 2) {
    			msg = "Oh no, the email already exists. :( ";
    			desc = "Please enter a different email and try again."
    					+ "To recover your password please email shaun_wallace@brown.edu.";
    		}
    		
		Notification notification = new Notification(msg, Type.ASSISTIVE_NOTIFICATION);
		notification.setDescription(desc);
	    notification.setHtmlContentAllowed(true);
	    notification.setPosition(Position.BOTTOM_CENTER);
	    notification.show(Page.getCurrent());
	}
    
    public boolean deleteFromDB(String tableName, String idName, String id) {
    		boolean success = true;
    		try (Connection conn = ((DataSource) new InitialContext().lookup(getJNDI())).getConnection();
			 PreparedStatement stmt = conn.prepareStatement("DELETE FROM " + tableName + " WHERE " + idName + " = " + id)
		) {
    			stmt.executeUpdate();
    		} catch (SQLException | NamingException e) {
    	        logError(e);
    	        success = false;
    	    }
    		return success;
    }
    
    public boolean updateSuggestionsInDB(Map<Integer, String> bestMatchSuggs) {
    		boolean success = true;
		try (Connection conn = ((DataSource) new InitialContext().lookup(getJNDI())).getConnection();
		 PreparedStatement stmt = conn.prepareStatement("UPDATE Suggestions SET suggestion = ? WHERE idSuggestion = ?;", Statement.RETURN_GENERATED_KEYS)
		) {
			for (Map.Entry<Integer, String> entry : bestMatchSuggs.entrySet()) {
				int suggestionID = entry.getKey();
				String sugg = entry.getValue();
				stmt.setString(1, sugg);
				stmt.setInt(2, suggestionID);
				stmt.executeUpdate();
			}
		} catch (SQLException | NamingException e) {
	        logError(e);
	        success = false;
	    }
		return success;
    }
    
	@Override
	public void logError(Exception e) {
		System.out.println("********** LOGGED ERROR START");
		System.out.println("Error Message: " + e.getMessage() + " |");
		System.out.println("Stack Trace: ");
		e.printStackTrace();
		System.out.println("********** LOGGED ERROR END");
		errorMessage();
	}
	
	@Override
	public boolean isStringNull(String str) {
		if(str != null && !str.isEmpty()) { 
			return false;
		} else {
			return true;
		}
	}

	private Timestamp getTimestamp() {
		Date date = new Date();
		return new Timestamp(date.getTime());
	}
}
