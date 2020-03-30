package com.ajobs.component;

import java.util.Map.Entry;

import com.ajobs.AjobsUI;
import com.ajobs.domain.Users;
import com.ajobs.event.DraftyEvent.CloseOpenWindowsEvent;
import com.ajobs.event.DraftyEvent.UserLoginRequestedEvent;
import com.ajobs.event.DraftyEventBus;
import com.ajobs.util.CapsLockWarning;
import com.vaadin.annotations.PreserveOnRefresh;
import com.vaadin.event.ShortcutAction.KeyCode;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.Page;
import com.vaadin.server.Responsive;
import com.vaadin.shared.Position;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.Notification;
import com.vaadin.ui.Notification.Type;
import com.vaadin.ui.PasswordField;
import com.vaadin.ui.TextField;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;
import com.vaadin.ui.themes.ValoTheme;

@SuppressWarnings("serial")
@PreserveOnRefresh
public class SignUpWindow extends Window {
	
	public static final String ID = "signUpWindow";
	
	public SignUpWindow() {
	    setId(ID);
	    Responsive.makeResponsive(this);
	    
	    setIcon(VaadinIcons.SIGN_OUT);
        setCaption(" Sign-Up");
        setWidth(50.0f, Unit.PERCENTAGE);
        setModal(true);
        setResizable(true);
        setClosable(true);
	    
	    setContent(buildFieldsSignUp());
	}
    
    private Component buildFieldsSignUp() {
        VerticalLayout fields = new VerticalLayout();
        fields.setWidth("100%");

        final TextField username = new TextField("Username");
        username.setIcon(VaadinIcons.USER);
        username.setRequiredIndicatorVisible(true);
        username.addStyleName(ValoTheme.TEXTFIELD_INLINE_ICON);
        username.setWidth("100%");
        
        final TextField email = new TextField("Email");
        email.setIcon(VaadinIcons.ENVELOPE);
        email.setRequiredIndicatorVisible(true);
        email.addStyleName(ValoTheme.TEXTFIELD_INLINE_ICON);
        email.setWidth("100%");

        final PasswordField password = new PasswordField("Password");
        new CapsLockWarning(password);
        password.setIcon(VaadinIcons.LOCK);
        password.setRequiredIndicatorVisible(true);
        password.addStyleName(ValoTheme.TEXTFIELD_INLINE_ICON);
        password.setWidth("100%");
        password.setCaption("Password <i>(Minimum 8 characters)</i>");
        password.setCaptionAsHtml(true);
        
        final PasswordField passwordCheck = new PasswordField("Password Check");
        new CapsLockWarning(passwordCheck);
        passwordCheck.setIcon(VaadinIcons.LOCK);
        passwordCheck.setRequiredIndicatorVisible(true);
        passwordCheck.addStyleName(ValoTheme.TEXTFIELD_INLINE_ICON);
        passwordCheck.setWidth("100%");
        passwordCheck.setCaption("Password Check <i>(Please enter password again)</i>");
        passwordCheck.setCaptionAsHtml(true);

        final Button signin = new Button("Submit");
        //signin.addStyleName(ValoTheme.BUTTON_PRIMARY);
        signin.setWidth("100%");
        signin.setIcon(VaadinIcons.SIGN_IN);
        signin.setClickShortcut(KeyCode.ENTER);
        signin.focus();
        
        final Button close = new Button("Cancel");
        //close.addStyleName(ValoTheme.BUTTON_QUIET);
        close.addStyleName(ValoTheme.LABEL_LIGHT);
        close.setWidth("100%");
        close.setIcon(VaadinIcons.ARROW_CIRCLE_LEFT_O);
        close.setClickShortcut(KeyCode.ESCAPE, null);
        
        fields.addComponents(username, email, password, passwordCheck, signin, close, buildDisclaimerMsg());
        fields.setComponentAlignment(signin, Alignment.BOTTOM_LEFT);

        signin.addClickListener(e -> {
        	
	        	boolean goodToGo = true;
	        	String description = "";
	        	
	        	if(username.isEmpty()) {
	        		goodToGo = false;
	        		description += "<span>Username cannot be empty.</span><br>";
	        	}
	        	if(email.isEmpty()) {
	        		goodToGo = false;
	        		description += "<span>Email cannot be empty.</span><br>";
	        	}
	        	if(!password.getValue().equals(passwordCheck.getValue())) {
	        		goodToGo = false;
	        		description += "<span>Please check that passwords match.</span><br>";
	        	}
	        	if(password.getValue().length() < 8) {
	        		goodToGo = false;
	        		description += "<span>Password must have a minimum length of 8 characters.</span><br>";
	        	}
	        	if(checkUsername(username.getValue())) {
	        		goodToGo = false;
	        		description += "<span>Username already exists, please try another.</span><br>";
	        	}
	        	if(checkEmail(email.getValue())) {
	        		goodToGo = false;
	        		description += "<span>Email already exists, please try another.</span><br>";
	        	}
	        	
	        	if(goodToGo) {
	        		if( AjobsUI.getApi().signUp(username.getValue(), email.getValue(), password.getValue())) { //creates new user
	        			AjobsUI.getApi().authenticate(username.getValue(), password.getValue());
	        			DraftyEventBus.post(new UserLoginRequestedEvent(username.getValue(), password.getValue(), true));
	        		}
	        	} else {
	        		Notification notification = new Notification("Please Check Fields ", Type.ERROR_MESSAGE);
        			notification.setDescription(description);
	        	    notification.setHtmlContentAllowed(true);
	        	    notification.setPosition(Position.BOTTOM_CENTER);
	        	    notification.show(Page.getCurrent());
	        	}
        });
        
        close.addClickListener(e -> this.close());
        
        return fields;
    }
    
    private boolean checkUsername(String username) {
    		boolean exists = false;
    		for(Entry<Integer, Users> users : AjobsUI.getApi().getUsers().entrySet()) {
    			if(username.equals(users.getValue().getUsername())) {
    				exists = true;
    				break;
    			}
    		}
    		return exists;
    }
    
    private boolean checkEmail(String email) {
		boolean exists = false;
		for(Entry<Integer, Users> users : AjobsUI.getApi().getUsers().entrySet()) {
			if(email.equals(users.getValue().getUsername())) {
				exists = true;
				break;
			}
		}
		return exists;
    }
	
	private Label buildDisclaimerMsg() {
		Label intro = new Label();
	    intro.setCaptionAsHtml(true);
	    intro.setCaption(
		    		"<center style=\"padding-top: 1em;\"><span "
		    				+ "style=\"color: #999; text-align: center; font-size: 14px; font-style: italic; text-overflow: ellipsis; white-space: pre-wrap; \"> "
		    				+ "Academic Jobs is a community maintained dataset powered by the Drafty Platform."
		    		+ "</center></span>"
	    		);
	    return intro;
	}
	
	public static void open() {
        DraftyEventBus.post(new CloseOpenWindowsEvent());
        Window w = new SignUpWindow();
        UI.getCurrent().addWindow(w);
        w.focus();
    }
}
