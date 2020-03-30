package com.ajobs;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import org.jsoup.nodes.Element;

import com.ajobs.domain.Profile;
import com.ajobs.domain.Url;
import com.ajobs.util.Cookies;
import com.ajobs.util.UriFragmentReader;
import com.vaadin.server.BootstrapFragmentResponse;
import com.vaadin.server.BootstrapListener;
import com.vaadin.server.BootstrapPageResponse;
import com.vaadin.server.ServiceException;
import com.vaadin.server.SessionDestroyEvent;
import com.vaadin.server.SessionDestroyListener;
import com.vaadin.server.SessionInitEvent;
import com.vaadin.server.SessionInitListener;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinSession;

@SuppressWarnings("serial")
public class AjobsSessionListener implements SessionInitListener, SessionDestroyListener {

	public String jnd2i = "java:/MySqlDS_ajobs";
	
    @Override
    public final void sessionInit(final SessionInitEvent event) throws ServiceException {
    	System.out.println("START SESSION: " + LocalDateTime.now() + " - " + ZonedDateTime.now() + " PATH=" + VaadinRequest.getCurrent().getContextPath());
    	
    	new UriFragmentReader().readDatasource();
    	
    	Profile profile = new Profile();
    	profile.setSessionStart(LocalDateTime.now().toString());
    	VaadinSession.getCurrent().setAttribute(Profile.class.getName(), profile);
    	
    	Cookies.readSetCookie();
    	
    	////////////////////////////////////
    	
        event.getSession().addBootstrapListener(new BootstrapListener() {

        @Override
        public void modifyBootstrapPage(final BootstrapPageResponse response) {
            final Element head = response.getDocument().head();
            head.appendElement("meta")
                    .attr("name", "viewport")
                    .attr("content",
                            "width=device-width, initial-scale=1, maximum-scale=1.0, user-scalable=no");
            head.appendElement("meta")
                    .attr("name", "apple-mobile-web-app-capable")
                    .attr("content", "yes");
            head.appendElement("meta")
                    .attr("name", "apple-mobile-web-app-status-bar-style")
                    .attr("content", "black-translucent");

            String contextPath = response.getRequest().getContextPath();
            head.appendElement("link")
                    .attr("rel", "apple-touch-icon")
                    .attr("href", contextPath + "/VAADIN/themes/dashboard/img/app-icon.png");
	        }
	
	        @Override
	        public void modifyBootstrapFragment(
	        		final BootstrapFragmentResponse response) {
	        }
        });
    }
    
    @Override
	public final void sessionDestroy(SessionDestroyEvent event) {
		Profile profile = (Profile) VaadinSession.getCurrent().getAttribute(Profile.class.getName());
		
		Url urlDomain = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
		String jndi = urlDomain.getDataset().getJNDI();
		
		System.out.println("STOP SESSION: " + LocalDateTime.now() + " - " + ZonedDateTime.now() + " - sessionId = " + profile.getIdSession());
		
		try (Connection conn = ((DataSource) new InitialContext().lookup(jndi)).getConnection();
    			PreparedStatement stmt = conn.prepareStatement("UPDATE Session SET end = ? WHERE idSession = ?")
		) {
			//cannot grab Profile from session, since the session has been destroyed
			stmt.setString(1, LocalDateTime.now().toString());
			stmt.setInt(2, profile.getIdSession());
			stmt.executeUpdate();
		} catch (SQLException | NamingException e) {
	        AjobsUI.getApi().logError(e);
	    }
	}
}
