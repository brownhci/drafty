package com.ajobs.component;

import com.ajobs.AjobsUI;
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
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.Notification;
import com.vaadin.ui.PasswordField;
import com.vaadin.ui.TextField;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;
import com.vaadin.ui.themes.ValoTheme;

@SuppressWarnings("serial")
@PreserveOnRefresh
public class SignInWindow extends Window {
	
	public static final String ID = "signInWindow";
	
    public SignInWindow() {
        setId(ID);
        Responsive.makeResponsive(this);
        
        setIcon(VaadinIcons.SIGN_IN);
        setCaption(" Sign-In");
        setWidth(50.0f, Unit.PERCENTAGE);
        setModal(true);
        setResizable(true);
        setClosable(true);

        setContent(buildFields());
    }

    private Component buildFields() {

    	VerticalLayout fields = new VerticalLayout();
        fields.setWidth("100%");
    	
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
        //signin.addStyleName(ValoTheme.BUTTON_PRIMARY);
        signin.setWidth("100%");
        signin.setIcon(VaadinIcons.SIGN_IN);
        signin.setClickShortcut(KeyCode.ENTER);
        signin.focus();
        
        final Button forgot = new Button("Forgot Password?");
        //forgot.addStyleName(ValoTheme.BUTTON_QUIET);
        forgot.setWidth("100%");
        forgot.setIcon(VaadinIcons.QUESTION_CIRCLE_O);
        
        fields.addComponents(username, password, signin, forgot);
        
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
	        	
        		if(goodToGo) {
        			if(AjobsUI.getApi().authenticate(username.getValue(), password.getValue())) {
            			DraftyEventBus.post(new UserLoginRequestedEvent(username.getValue(), password.getValue(), false));
            			this.close();
        			}
        		} else {
        			Notification notification = new Notification("Please Check Fields");
	        		notification.setDescription(description);
		            notification.setHtmlContentAllowed(true);
		            notification.setStyleName("tray closable login-help");
		            notification.setPosition(Position.BOTTOM_CENTER);
		            notification.setDelayMsec(20000);
		            notification.show(Page.getCurrent());
        		}
        });
        
        forgot.addClickListener(e -> {
	        	Notification notification = new Notification("Password Recovery");
	    		notification.setDescription("Please email Shaun at shaun_wallace@brown.edu with your email and/or username. We will get back to you soon! :)");
		        notification.setHtmlContentAllowed(true);
		        notification.setStyleName("tray closable login-help");
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
    
    public static void open() {
        DraftyEventBus.post(new CloseOpenWindowsEvent());
        Window w = new SignInWindow();
        UI.getCurrent().addWindow(w);
        w.focus();
    }
}
