package com.ajobs.services;

public class UserSessionService {
/*	

    @Override
    public Profile authenticate(String emailORusername, String password) {
        try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
        			PreparedStatement stmt = conn.prepareStatement(
        					"SELECT *, count(*) as ct FROM Profile p "
        					+ "INNER JOIN Role r ON r.idRole = p.idRole "
        					+ "WHERE email = ? OR username = ? ");
		) {
    			stmt.setString(1, emailORusername);
    			stmt.setString(2, emailORusername);
    			
        		ResultSet rs = stmt.executeQuery();
        		
    			while(rs.next()) {
    				if(rs.getInt("ct") > 0) { //User is found, attempt password match
    					
    					Boolean match = BCrypt.checkpw(password, rs.getString("password"));
    					//System.out.println("Password Match?... " + match);
    					
    					if(match) {
    						profile.updateProfile(
    								rs.getInt("idProfile"), rs.getString("username"), rs.getString("email"), rs.getString("role"),
    								rs.getInt("idRole"), null, null, true);
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
    				} else {
    					//Password did not match
					Notification notification = new Notification("Whoops, Username / Email not found. :(");
			        notification.setDescription("<span>Please try again.</i>");
			        notification.setHtmlContentAllowed(true);
			        notification.setStyleName("tray small closable login-help");
			        notification.setPosition(Position.BOTTOM_CENTER);
			        notification.setDelayMsec(20000);
			        notification.show(Page.getCurrent());
    				}
    			}
    		} catch (SQLException | NamingException e) {
    	        logError(e);
    	    }
        
        return profile;
    }
    
    public Profile updateEditedProfileInDB(Profile editedProfile) {
    		profile.setEmail(editedProfile.getEmail());
    		profile.setUsername(editedProfile.getUsername());
    		  try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
    				  PreparedStatement stmt = conn.prepareStatement(
								"UPDATE Profile SET username = ? WHERE idProfile = ?;", Statement.RETURN_GENERATED_KEYS);
    				  PreparedStatement stmt1 = conn.prepareStatement(
    									"UPDATE Profile SET email = ? WHERE idProfile = ?;", Statement.RETURN_GENERATED_KEYS)
				) {
					stmt.setString(1, profile.getUsername());
					stmt.setInt(2, profile.getIdProfile());
					
					stmt1.setString(1, profile.getEmail());
					stmt1.setInt(2, profile.getIdProfile());
					stmt.executeUpdate();
					stmt1.executeUpdate();
				} catch (SQLException | NamingException e) {
					logError(e);
				}
    		  
    		  return profile;
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
        				int id = rs.getInt(1); 
        				profile.setIdProfile(id);
        				VaadinSession.getCurrent().setAttribute(Profile.class.getName(), profile); 
        				//updates instance of Profile in the Session
        				
        				Users user = new Users(username, email, 0, 0, 0);
        				users.put(id, user);
        			}
        		} catch (SQLException | NamingException e) {
        	        logError(e);
        	        dbErrorMessage();
        	    }
    		}
    		
    		return success;
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
    
    public void insertSession(Profile profile) {
	    	try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
	    			PreparedStatement stmt = conn.prepareStatement(
	    										"INSERT INTO Session (idSession, idProfile, start, end) "
	    										+ "VALUES (NULL, ?, ?, ?);", Statement.RETURN_GENERATED_KEYS)
		) {
			stmt.setNull(1, 1); //1 means true; we are setting to null
			stmt.setString(2, profile.getSessionStart());
			stmt.setNull(3, 1);
	    		
			stmt.executeUpdate();
			ResultSet rs = stmt.getGeneratedKeys();
			while (rs.next()) {
				int id = rs.getInt(1); 
				profile.setIdSession(id);
				this.profile = profile;
				VaadinSession.getCurrent().setAttribute(Profile.class.getName(), profile); 
				//updates instance of Profile in the Session
				//AjobsSessionListener
			}
		} catch (SQLException | NamingException e) {
	        logError(e);
	    }
    }
    
    public void loginUpdateSession(Profile profile) { //run after login
	    	try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
	    			PreparedStatement stmt = conn.prepareStatement(
	    										"UPDATE Session SET idProfile = ? WHERE idSession = ?;", Statement.RETURN_GENERATED_KEYS)
		) {
	    		stmt.setInt(1, profile.getIdProfile());
			stmt.setInt(2, profile.getIdSession());
	    		
			stmt.executeUpdate();
		} catch (SQLException | NamingException e) {
	        logError(e);
	    }
    }
    
    public void endUpdateSession(Profile profile) { //run after session ended
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
*/
}
