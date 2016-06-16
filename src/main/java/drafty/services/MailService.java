package drafty.services;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.text.SimpleDateFormat;
import java.util.Date;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import drafty._MainUI;

import javax.annotation.Resource;
/*
import javax.mail.Address;
import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import javax.ws.rs.core.Response;
*/

public class MailService {
	
	
	//@Resource(mappedName="java:jboss/mail/gmail")
   // private Session mailSession;
	
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	public MailService() {
		 
	}
	
	public void sendMail(String email_from, String email_to, String body, String fName, String lName, String idProfile) {
		/*
		try {
        	MimeMessage m = new MimeMessage(mailSession);
            Address from = new InternetAddress(email_from);
            Address[] to = new InternetAddress[] {new InternetAddress(email_to) };
            
            String message = "Message from " + fName + " " + lName + " - " + body;
            
            m.setFrom(from);
            m.setRecipients(Message.RecipientType.TO, to);
            m.setSubject("Brown HCI - Drafty Message");
            m.setSentDate(new java.util.Date());
            m.setContent(message,"text/plain");
            Transport.send(m);
            Response.status(200).entity("Mail sent by Drafty + GMail.").build();
        }
        catch (javax.mail.MessagingException e)
        {
            e.printStackTrace();
            Response.status(200).entity("Error in Sending mail: "+ e).build();   
        }
		finally {
			//Success!
		}
		*/
	}
	
	public void updateProfile(String name, String email, String idProfile) {
		try {
		      Context initialContext = new InitialContext();
		      
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "UPDATE Profile SET date_updated = ?, name = ?, email = ? WHERE idProfile = ? ";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, new SimpleDateFormat("yyyy.MM.dd.HH.mm.ss").format(new Date()));
		        stmt.setString(2, name);
		        stmt.setString(3, email);
		        stmt.setString(4, idProfile);
		        
		        try {
			        stmt.executeUpdate();
			        
		        } catch (SQLException e) {
					System.out.println("updateProfile " + e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	      catch (Exception ex)
	      {
	      	System.out.println("Exception" + ex);
	      }
	}
	
	public void insertComment(String idProfile, String message) {
		try {
		      Context initialContext = new InitialContext();
		      
		      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
		      if (datasource != null) {
		        Connection conn = datasource.getConnection();
		        String sql = "INSERT INTO Comment VALUES(NULL, ?, ?, CURRENT_TIMESTAMP)";
		        PreparedStatement stmt = conn.prepareStatement(sql);
		        stmt.setString(1, idProfile);
		        stmt.setString(2, message);
		        
		        try {
			        stmt.executeUpdate();
			        
		        } catch (SQLException e) {
					System.out.println("insertComment " + e.getMessage());
				}
		        stmt.close();
		        conn.close();
		      }
		    }
	      catch (Exception ex)
	      {
	      	System.out.println("Exception" + ex);
	      }
	}
}