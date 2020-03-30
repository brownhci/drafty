package com.ajobs.view;

import java.util.Map.Entry;

import com.ajobs.AjobsUI;
import com.ajobs.domain.Users;
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
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.Notification;
import com.vaadin.ui.Notification.Type;
import com.vaadin.ui.PasswordField;
import com.vaadin.ui.TextField;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;

@SuppressWarnings("serial")
@PreserveOnRefresh
public class LoginView extends VerticalLayout {
	
	Component loginForm = buildLoginForm();
	Component signupForm = buildSignUpForm();
	
    public LoginView() {
        setSizeFull();
        setMargin(false);
        setSpacing(false);

        //addStyleName("login-bg");
        
        toggleSignUp(false); //login form by default
    }

    private Component buildLoginForm() {
        final VerticalLayout loginPanel = new VerticalLayout();
        loginPanel.setSizeUndefined();
        loginPanel.setMargin(false);
        Responsive.makeResponsive(loginPanel);
        loginPanel.addStyleName("login-panel");

        loginPanel.addComponent(buildLabels());
        loginPanel.addComponent(buildFields());
        //loginPanel.addComponent(new CheckBox("Remember me", true));
        
        return loginPanel;
    }

    private Component buildFields() {
    	VerticalLayout fields = new VerticalLayout();
        fields.addStyleName("fields");
        
        final TextField username = new TextField("Username or Email");
        username.setIcon(VaadinIcons.USER);
        username.addStyleName(ValoTheme.TEXTFIELD_INLINE_ICON);
        username.setWidth("100%");

        final PasswordField password = new PasswordField("Password");
        new CapsLockWarning(password);
        password.setIcon(VaadinIcons.LOCK);
        password.addStyleName(ValoTheme.TEXTFIELD_INLINE_ICON);
        password.setWidth("100%");

        final Button signin = new Button("Sign In");
        signin.addStyleName(ValoTheme.BUTTON_PRIMARY);
        signin.setWidth("100%");
        signin.setIcon(VaadinIcons.SIGN_IN);
        signin.setClickShortcut(KeyCode.ENTER);
        signin.focus();
        
        final Button signup = new Button("Sign Up");
        signup.addStyleName(ValoTheme.BUTTON_QUIET);
        signup.setWidth("100%");
        signup.setIcon(VaadinIcons.USER_CARD);
        
        final Button forgot = new Button("Forgot Password?");
        forgot.addStyleName(ValoTheme.BUTTON_QUIET);
        forgot.setWidth("100%");
        forgot.setIcon(VaadinIcons.QUESTION_CIRCLE_O);
        
        fields.addComponents(username, password, signin, signup, forgot);
        
        if (Page.getCurrent().getLocation().toString().contains("http://localhost:8080")) {
        		final Button adminSignIn = new Button("ADMIN Sign-In");
        		fields.addComponent(adminSignIn);
			adminSignIn.setWidth("100%");
			adminSignIn.setIcon(VaadinIcons.SIGN_IN_ALT);
			adminSignIn.setClickShortcut(KeyCode.ENTER, null);
			adminSignIn.addClickListener(e -> initLogin("shaun_wallace@brown.edu","q1w2e3r4"));
		}
        
        signin.addClickListener(e -> {
    		boolean goodToGo = true;
        	String description = "";
        	
        	if(username.isEmpty()) {
        		goodToGo = false;
        		description += "<span>Username/Email cannot be empty.</span>";
        	}
        	
        	if(password.isEmpty()) {
        		goodToGo = false;
        		description += "<span>Password cannot be empty.</span>";
        	}
    		
        	AjobsUI.getApi().authenticate(username.getValue(), password.getValue());
        	
    		if(goodToGo) {
    			DraftyEventBus.post(new UserLoginRequestedEvent(username.getValue(), password.getValue(), false));
    		} else {
    			Notification notification = new Notification("Please Check Fields");
        		notification.setDescription(description);
	            notification.setHtmlContentAllowed(true);
	            notification.setStyleName("tray small closable login-help");
	            notification.setPosition(Position.BOTTOM_CENTER);
	            notification.setDelayMsec(20000);
	            notification.show(Page.getCurrent());
    		}
        });
        
        signup.addClickListener(e -> toggleSignUp(true));
        
        forgot.addClickListener(e -> {
	        	Notification notification = new Notification("Password Recovery");
	    		notification.setDescription("Please email Shaun at shaun_wallace@brown.edu with your email and/or username. We will get back to you soon! :)");
	        notification.setHtmlContentAllowed(true);
	        notification.setStyleName("tray small closable login-help");
	        notification.setPosition(Position.BOTTOM_CENTER);
	        notification.setDelayMsec(20000);
	        notification.show(Page.getCurrent());
        });
        
        return fields;
    }
    
    private void initLogin(String username, String password) {
		AjobsUI.getApi().authenticate(username, password);
		DraftyEventBus.post(new UserLoginRequestedEvent(username, password, false));
	}

	private void toggleSignUp(boolean active) {
	    	if(active) {
	    		removeComponent(loginForm);
	    		addComponent(signupForm);
	    		setComponentAlignment(signupForm, Alignment.MIDDLE_CENTER);
	    	} else {
	    		removeComponent(signupForm);
	    		addComponent(loginForm);
	    		setComponentAlignment(loginForm, Alignment.MIDDLE_CENTER);
	    	}
    }
    
    private Component buildLabels() {
        CssLayout labels = new CssLayout();
        labels.addStyleName("labels");

        Label welcome = new Label("Welcome to Academic Jobs");
        welcome.setSizeUndefined();
        welcome.addStyleName(ValoTheme.LABEL_H4);
        welcome.addStyleName(ValoTheme.LABEL_COLORED);
        labels.addComponent(welcome);

        Label title = new Label("AJobs");
        title.setSizeUndefined();
        title.addStyleName(ValoTheme.LABEL_H3);
        title.addStyleName(ValoTheme.LABEL_LIGHT);
        labels.addComponent(title);
        
        return labels;
    }
    
    private Component buildLabelsSignUp() {
        CssLayout labels = new CssLayout();
        labels.addStyleName("labels");

        Label welcome = new Label("Sign Up");
        welcome.setSizeUndefined();
        welcome.addStyleName(ValoTheme.LABEL_H4);
        welcome.addStyleName(ValoTheme.LABEL_COLORED);
        labels.addComponent(welcome);

        Label title = new Label("AJobs");
        title.setSizeUndefined();
        title.addStyleName(ValoTheme.LABEL_H3);
        title.addStyleName(ValoTheme.LABEL_LIGHT);
        labels.addComponent(title);
        
        return labels;
    }
    
    private Component buildFieldsSignUp() {
        VerticalLayout fields = new VerticalLayout();
        fields.addStyleName("fields");
        //fields.setMargin(false);

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
        signin.addStyleName(ValoTheme.BUTTON_PRIMARY);
        signin.setWidth("100%");
        signin.setIcon(VaadinIcons.SIGN_IN);
        signin.setClickShortcut(KeyCode.ENTER);
        signin.focus();
        
        final Button close = new Button("Back to Login");
        close.addStyleName(ValoTheme.BUTTON_QUIET);
        close.addStyleName(ValoTheme.LABEL_LIGHT);
        close.setWidth("100%");
        close.setIcon(VaadinIcons.ARROW_CIRCLE_LEFT_O);
        close.setClickShortcut(KeyCode.ESCAPE, null);
        
        fields.addComponents(username, email, password, passwordCheck, signin, close);
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
	        		if(AjobsUI.getApi().signUp(username.getValue(), email.getValue(), password.getValue())) { //creates new user
	        			initLogin(email.getValue(), password.getValue());
	        		}
	        	} else {
	        		Notification notification = new Notification("Please Check Fields ", Type.ERROR_MESSAGE);
        			notification.setDescription(description);
	        	    notification.setHtmlContentAllowed(true);
	        	    notification.setPosition(Position.BOTTOM_CENTER);
	        	    notification.show(Page.getCurrent());
	        	}
        });
        
        close.addClickListener(e -> toggleSignUp(false));
        
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
    
    private Component buildSignUpForm() {
        final VerticalLayout signupPanel = new VerticalLayout();
        signupPanel.setSizeUndefined();
        signupPanel.setMargin(false);
        Responsive.makeResponsive(signupPanel);
        signupPanel.addStyleName("login-panel");

        signupPanel.addComponent(buildLabelsSignUp());
        signupPanel.addComponent(buildFieldsSignUp());
        signupPanel.addComponent(buildFooterMsg());
        
        return signupPanel;
    }
    
    private Component buildFooterMsg() {
    		Label intro = new Label("Academic Jobs is a community maintained dataset powered by the Drafty platform.");
        intro.setCaptionAsHtml(true);
        intro.addStyleName(ValoTheme.LABEL_LIGHT);
        HorizontalLayout hrzLayout = new HorizontalLayout();
        hrzLayout.addComponent(intro);
        return hrzLayout;
    }
}
