package com.ajobs.util;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.Random;

import javax.naming.InitialContext;
import javax.servlet.http.Cookie;
import javax.sql.DataSource;

import com.ajobs.domain.Profile;
import com.ajobs.domain.Url;
import com.vaadin.server.Page;
import com.vaadin.server.VaadinService;
import com.vaadin.server.VaadinSession;
import com.vaadin.shared.Position;
import com.vaadin.ui.Notification;
import com.vaadin.ui.Notification.Type;

public class Cookies {

    final static String COOKIE_NAME = getCookieName(); //datasource name + idProfile
	
	public static void readSetCookie() {
		System.out.println("COOKIE :: readSetCookie()");
		// See if name cookie is already set
		System.out.println("COOKIE :: cookie name = " + COOKIE_NAME);
	    Cookie cookieValue = getCookieByName(COOKIE_NAME);
	
	    if (cookieValue != null) {
	      boolean isLogout = false;
	      String[] parsedCookie = cookieValue.getValue().split("|logout");
	      String oldCookieValue = parsedCookie[0];
	      if(parsedCookie.length > 1) {
	    	  isLogout = true;
	      }
	      
	      try {
	    	Integer idProfile = null;
	    	if(oldCookieValue.equals("testCookie")) {
	    		idProfile = 1; //shaun's profile for testing
	    	} else {
	    		idProfile = Integer.valueOf(oldCookieValue); 
	    	} 
	    	updateSessionIdProfile(idProfile, false, isLogout);
	      } catch (Exception e) {
			System.out.println("ERROR: readSetCookie(): " + e);
	      }
	      
	      System.out.println("COOKIE :: Existing cookie value " + oldCookieValue);
	      
	      setNewCookie(oldCookieValue); // this way we erase the |logout flag
	      
	    } else {
	    	System.out.println("COOKIE :: cookie is NULL :: isNewUser");
	    	
	    	// Create a new cookie
	    	Integer cookieProfileId = insertNewProfile();
	    	System.out.println("COOKIE :: cookieProfileId = " + cookieProfileId);
	    	if(cookieProfileId != null) {
	    		setNewCookie(cookieProfileId.toString());
		    	updateSessionIdProfile(cookieProfileId, true, false);
		    	System.out.println("New cookie; stored name " + cookieProfileId + " in cookie");
	    	} else {
	    		System.out.println("COOKIE :: updateSessionIdProfile(3)");
		    	updateSessionIdProfile(3, true, false); //3 is just a catch all for cookie values
	    	}
	    }
    }
	
	public static void setNewCookie(String newCookieValue) {
		Cookie cookieValue = new Cookie(COOKIE_NAME, newCookieValue);
    	cookieValue.setComment("Cookie for storing allowing users to login in Drafty - Brown University - Computer Science - HCI Research Group ");
    	setNewCookie(cookieValue);
	}

	public static void setNewCookie(Cookie cookieValue) {
		//cookieValue.setMaxAge(120000); // Make cookie expire in x
		cookieValue.setPath(VaadinService.getCurrentRequest().getContextPath()); // Set the cookie path.
		VaadinService.getCurrentResponse().addCookie(cookieValue); // Save cookie
	}
    
	private static void updateSessionIdProfile(Integer value, boolean isNewUser, boolean isLogout) {
		//System.out.println("COOKIE :: setting idProfile = " + value.toString());
		Profile profile = (Profile) VaadinSession.getCurrent().getAttribute(Profile.class.getName());
		profile.setIdProfile(value);
		if(isNewUser) {
			profile.setNewUser(true);
		} else if(!isLogout) {
			preAuthenticate();
		}
		VaadinSession.getCurrent().setAttribute(Profile.class.getName(), profile);
	}

	private static void preAuthenticate() {
		Profile profile = (Profile) VaadinSession.getCurrent().getAttribute(Profile.class.getName());
    	try (Connection conn = ((DataSource) new InitialContext().lookup(getJNDI())).getConnection();
        		PreparedStatement stmtLookup = conn.prepareStatement(
        				"SELECT *, count(*) as ct "
					   + "FROM Profile p INNER JOIN Role r ON r.idRole = p.idRole "
					   + "WHERE idProfile = ?");
		) {
        	//first check if new user, if not try to pre-authenticate (i.e. auto-login user)
        	stmtLookup.setInt(1, profile.getIdProfile());
        	
        	ResultSet rs = stmtLookup.executeQuery();
        	while(rs.next()) {
    			if(rs.getInt("ct") > 0) { //User is found, attempt password match
    				
    				System.out.println(" :::: COOKIES :::: pre auth = " + rs.getInt("idProfile") + " " +  rs.getString("username") + " " + rs.getString("email") + " " + rs.getString("role"));
    				
    				//if no email, then user is anonymous
    				if(rs.getString("email") != null && !rs.getString("email").isEmpty()) { 
    					profile.updateProfile(
        						rs.getInt("idProfile"), rs.getString("username"), rs.getString("email"), rs.getString("role"),
        						rs.getInt("idRole"), null, null, true, false); //experiment and idExperiment are null for now
        				VaadinSession.getCurrent().setAttribute(Profile.class.getName(), profile);
    				}
    			}
        	}
    	} catch (Exception e) {
    		System.out.println("ERROR :: Cookies preAuthenticate Error: " + e);
	        //dbErrorMessage();
		}
    }
	
	
	public static void userLoggedOutSetFlagInCookie() {
		Cookie cookieValue = getCookieByName(COOKIE_NAME);
		System.out.println("UserLoggedOutEvent -> Cookies = " + cookieValue.getName() + " " + cookieValue.getValue());
		setNewCookie(cookieValue.getValue() + "|logout");
	}
	
	private static Integer insertNewProfile() {
		Integer id = null;
		try (Connection conn = ((DataSource) new InitialContext().lookup(getJNDI())).getConnection();
			PreparedStatement stmtProfile = conn.prepareStatement(
								"INSERT INTO Profile (idProfile, idRole, username, email, password, passwordRaw) "
								+ "VALUES (NULL, '2', ?, ?, ?, ?);", Statement.RETURN_GENERATED_KEYS)
		) {
			
			Random rand = new Random();
			Integer n1 = rand.nextInt(50000) + 1;
			Integer n2 = rand.nextInt(50000) * n1;
			
			//System.out.println("COOKIE :: anonymous_user" + n2);
			
			stmtProfile.setString(1, "anonymous_user" + n2);
			stmtProfile.setString(2, null);
			stmtProfile.setString(3, null);
			stmtProfile.setString(4, null);

			stmtProfile.executeUpdate();
			ResultSet rs = stmtProfile.getGeneratedKeys();
			System.out.println("COOKIE :: ResultSet rs = stmt.getGeneratedKeys() " + rs.getFetchSize());
			while (rs.next()) {
				System.out.println("COOKIE :: rs.next()");
				id = rs.getInt(1); 
				System.out.println("COOKIE :: insertNewProfile() new idProfile = " + id);
				updateSessionIdProfile(id, true, false);
			}
		} catch (Exception e) {
	        System.out.println("ERROR :: Cookies insertNewProfile Error: " + e);
	        dbErrorMessage();
	    }
		
		return id;
	}
	
	private static String getCookieName() {
		Url urlSession = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
		System.out.println("COOKIE :: getCookieName() = " + urlSession.getDataset().getDatasource() + "IdProfile");
    	return urlSession.getDataset().getDatasource() + "IdProfile";
	}
	
	private static String getJNDI() {
		Url urlSession = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
		//System.out.println("COOKIE :: getJNDI() = " + urlSession.getDataset().getJNDI());
    	return urlSession.getDataset().getJNDI();
	}
	
	private static void dbErrorMessage() {
		Notification notification = new Notification("Oh no, there was an Error. :( ", Type.ASSISTIVE_NOTIFICATION);
		notification.setDescription("Please try to submit again; <br>there was an mishap with the database.");
	    notification.setHtmlContentAllowed(true);
	    notification.setPosition(Position.BOTTOM_CENTER);
	    notification.show(Page.getCurrent());
	}
	
    private static Cookie getCookieByName(String name) {
		// Fetch all cookies from the request
		Cookie[] cookies = VaadinService.getCurrentRequest().getCookies();
		  
		if (cookies == null) {
			  return null;
		} else {
			  if (cookies.length > 0) {
		    		// Iterate to find cookie by its name
		        	  for (Cookie cookie : cookies) {
		        	    if (name.equals(cookie.getName())) {
		        	      return cookie;
		        	    }
		        	  }
		    	  }
		}
		return null;
	}
}
