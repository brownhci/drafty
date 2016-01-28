package drafty.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import org.vaadin.viritin.util.BrowserCookie;

import com.vaadin.server.Page;
import com.vaadin.server.WebBrowser;

import drafty.views._MainUI;

public class BrowserCookies {

	String DATASOURCE_CONTEXT = _MainUI.getDataProvider().getJNDI();
	
	//set Drafty cookie value
	private String cookieCheck = "brown_university_drafty_cookie";
	private String cookieValue = "0";
	private WebBrowser webBrowser = Page.getCurrent().getWebBrowser();
	private String browser = webBrowser.getBrowserApplication();
	private String browserNumber = Integer.toString(webBrowser.getBrowserMajorVersion()) + "." + Integer.toString(webBrowser.getBrowserMinorVersion());
	private String ipAddress = webBrowser.getAddress();
	private String idProfile = null;
	private String idIpAddress = null;
	
	private void detectCookie() {
		//look at viritin
		//https://github.com/viritin/viritin/blob/830c09c74f722fece45d95adde89354959e5dafa/src/test/java/org/vaadin/viritin/it/BrowserCookieTest.java
		
		//Check for Cookie
		BrowserCookie.detectCookieValue(cookieCheck, new BrowserCookie.Callback() {

            @Override
            public void onValueDetected(String value) {
            	cookieValue = value;
            	
            	System.out.println("cookieCheck " + cookieCheck + " detect cookie:  " + cookieValue + " = " + value);
            	if (cookieValue == null) {
        			System.out.println("cookie value == null : " + cookieValue);
        			
        			//no cookie detected
        			try {
        				newProfile();
        			} catch (SQLException e1) {
        				System.out.println("Profs() newProfile() error: " + e1);
        			} finally {
        				try {
            				newIp();
            			} catch (SQLException e1) {
            				System.out.println("Profs() newIp() error: " + e1);
            			}
        				
            			//sets cookie
            			setCookie();
        			}
        		} else {
        			System.out.println("else, cookie value == " + cookieValue);
        			
        			try {
        				checkProfile();
        			} catch (SQLException e1) {
        				System.out.println("Profs() checkProfile() error: " + e1);
        			} finally {
        				try {
            				checkIpAddress();
            			} catch (SQLException e1) {
            				System.out.println("Profs() checkIpAddress() error: " + e1);
            			}	
        			}
        		}
            }
        });
	}
	
	private void setCookie() {
		//look at viritin
		//https://github.com/viritin/viritin/blob/830c09c74f722fece45d95adde89354959e5dafa/src/test/java/org/vaadin/viritin/it/BrowserCookieTest.java
		
		//set cookie
		BrowserCookie.setCookie(cookieCheck, idProfile);
	}
	
	private String checkProfile() throws SQLException {
		String exists = null;
		
		//still run check to be 100% the id from the cookie is in the system
		
		try {
		      Context initialContext = new InitialContext();
		      
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "SELECT count(idProfile) as exist, idProfile FROM Profile WHERE idProfile = ? limit 1;";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, cookieValue);
		        try {
		        	ResultSet rs = stmt.executeQuery();
					while (rs.next()) {
						if(rs.getString("exist").equals("1")) {
							idProfile = rs.getString("idProfile");
							updateProfile();
						}
						exists = rs.getString("exist");
					}
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception" + ex);
	        }
			return exists;
	}
	
	private String checkIpAddress() throws SQLException {
		String exists = null;
			
		//popgrid -> rest of info; not totally great implementation but it works
		//populateGrid("> 32");	
		//resultsGrid.sort("University");
		
		try {
	      Context initialContext = new InitialContext();
	      
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null) {
	        Connection conn = datasource.getConnection();
	        String sql = "SELECT count(ip) as exist, idIpAddress FROM IpAddress WHERE idProfile = ? AND ip = ? limit 1;";
	        PreparedStatement stmt = conn.prepareStatement(sql);
	        stmt.setString(1, idProfile);
	        stmt.setString(2, ipAddress);
	        System.out.println("checkIpAddress() cookieValue " + cookieValue);
	        try {
	        	ResultSet rs = stmt.executeQuery();
				while (rs.next()) {
					if(rs.getString("exist").equals("1")) {
						idIpAddress = rs.getString("idIpAddress");
						updateIpAddress();
					} else {
						newIp();
					}
					exists = rs.getString("exist");
				}
	        } catch (SQLException e) {
				System.out.println(e.getMessage());
			}
	        conn.close();
	      }
	    }
        catch (Exception ex)
        {
        	System.out.println("Exception checkIpAddress() " + ex);
        }
		return exists;
	}
	
	private void updateProfile() throws SQLException {
		try {
		      Context initialContext = new InitialContext();
		      
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "UPDATE Profile SET date_updated = ?, logins = logins + 1 WHERE idProfile = ? ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date()));
		        stmt.setString(2, idProfile);
		        try {
			        stmt.executeUpdate();
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception Profs.java updateProfile() " + ex);
	        }
	    }
	
	private void updateIpAddress() throws SQLException {
		try {
		      Context initialContext = new InitialContext();
		      
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "UPDATE IpAddress SET date_updated = ?, logins = logins + 1, browser = ?, locale = ? WHERE idIpAddress = ?; ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date()));
		        stmt.setString(2, browser + browserNumber);
		        stmt.setString(3, webBrowser.getLocale().toString());
		        stmt.setString(4, idIpAddress);
		        
		        System.out.println("updateIpAddress() cookieValue " + cookieValue);
		        try {
			        stmt.executeUpdate();
		        } catch (SQLException e) {
					System.out.println(e.getMessage());
				}
		        conn.close();
		      }
		    }
	        catch (Exception ex)
	        {
	        	System.out.println("Exception updateIpAddress() " + ex);
	        }
	    }
	
	private void newProfile() throws SQLException {
		try {
	      Context initialContext = new InitialContext();
	      
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null) {
	        Connection conn = datasource.getConnection();
	        String sql = "INSERT INTO Profile (date_created, date_updated, logins) VALUES (?, ?, 1); ";
	        PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
	        stmt.setString(1, new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date()));
	        stmt.setString(2, new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date()));
	        try {
		        int affectedRows = stmt.executeUpdate();
		        
		        if (affectedRows == 0) {
		            throw new SQLException("Creating failed, no rows affected.");
		        }
		        try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
		            if (generatedKeys.next()) {
		        		idProfile = generatedKeys.getString(1);
		        		System.out.println("newProfile() idProfile " + idProfile);
		            }
		            else {
		                throw new SQLException("Creating failed, no ID obtained.");
		            }
		        }
	        } catch (SQLException e) {
				System.out.println(e.getMessage());
			}
	        conn.close();
	      }
	    }
        catch (Exception ex)
        {
        	System.out.println("Exception" + ex);
        }
	}
	
	private void newIp() throws SQLException {
		try {
	      Context initialContext = new InitialContext();
	      
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null) {
	        Connection conn = datasource.getConnection();
	        String sql = "INSERT INTO IpAddress (idProfile, ip, browser, locale, date_created, date_updated, logins) VALUES (?, ?, ?, ?, ?, ?, 1); ";
	        PreparedStatement stmt = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS);
	        //System.out.println("newIp() idProfile " + idProfile);
	        stmt.setString(1, idProfile);
	        stmt.setString(2, ipAddress);
	        stmt.setString(3, webBrowser.getLocale().toString());
	        stmt.setString(4, browser + browserNumber);
	        stmt.setString(5, new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date()));
	        stmt.setString(6, new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date()));
	        try {
		        int affectedRows = stmt.executeUpdate();
		        
		        if (affectedRows == 0) {
		            throw new SQLException("Creating failed, no rows affected.");
		        }
		        try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
		            if (generatedKeys.next()) {
		        		idIpAddress = generatedKeys.getString(1);
		            }
		            else {
		                throw new SQLException("Creating failed, no ID obtained.");
		            }
		        }
	        } catch (SQLException e) {
				System.out.println("newIp() error: " + e.getMessage());
			}
	        conn.close();
	      }
	    }
        catch (Exception ex)
        {
        	System.out.println("Exception" + ex);
        }
	}
}
