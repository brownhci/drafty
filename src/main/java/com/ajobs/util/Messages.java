package com.ajobs.util;

import com.vaadin.server.Page;
import com.vaadin.shared.Position;
import com.vaadin.ui.Notification;
import com.vaadin.ui.Notification.Type;

public class Messages {

	private Notification errorMsg = new Notification("Oh no :( ");
    private Boolean errorMsgActive = false;
	
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
	
	 public void dbErrorMessage() {
		Notification notification = new Notification("Oh no, there was an Error. :( ", Type.ASSISTIVE_NOTIFICATION);
		notification.setDescription("Please try to submit again; <br>there was an mishap with the database.");
	    notification.setHtmlContentAllowed(true);
	    notification.setPosition(Position.BOTTOM_CENTER);
	    notification.show(Page.getCurrent());
	}
    
	private void passwordDidNotMatch() {
		//Password did not match
		Notification notification = new Notification("Whoops, Password did not match. :(");
        notification.setDescription("<span>Please try again.</i>");
        notification.setHtmlContentAllowed(true);
        notification.setStyleName("tray small closable login-help");
        notification.setPosition(Position.BOTTOM_CENTER);
        notification.setDelayMsec(20000);
        notification.show(Page.getCurrent());
	}
	
	private void usernameEmailNotFound() {
		//Password did not match
		Notification notification = new Notification("Whoops, Username / Email not found. :(");
	    notification.setDescription("<span>Please try again.</i>");
	    notification.setHtmlContentAllowed(true);
	    notification.setStyleName("tray small closable login-help");
	    notification.setPosition(Position.BOTTOM_CENTER);
	    notification.setDelayMsec(20000);
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
	/* sw - not needed, UI makes this obvious
	private void sortSuccessMsg(Integer cellColPos) {
		Notification success = new Notification("Sorted by: " + AjobsUI.getApi().getHeaders().get(cellColPos));
		success.setDelayMsec(1000);
		success.setStyleName("bar success small");
		success.setPosition(Position.BOTTOM_CENTER);
		success.show(Page.getCurrent());
	}
	*/
	
	public void emptyFilterMsg() {
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
	
    private void errorMsgClosed() {
    	errorMsgActive = false;
	}
}
