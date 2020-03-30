package com.ajobs.component;

import java.util.Map.Entry;

import com.ajobs.AjobsUI;
import com.ajobs.domain.Profile;
import com.ajobs.domain.Users;
import com.ajobs.event.DraftyEvent.CloseOpenWindowsEvent;
import com.ajobs.event.DraftyEvent.ProfileUpdatedEvent;
import com.ajobs.event.DraftyEventBus;
import com.vaadin.annotations.PropertyId;
import com.vaadin.event.ShortcutAction.KeyCode;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.FontAwesome;
import com.vaadin.server.Page;
import com.vaadin.server.Responsive;
import com.vaadin.server.VaadinSession;
import com.vaadin.shared.Position;
import com.vaadin.shared.ui.MarginInfo;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Button;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.Button.ClickListener;
import com.vaadin.ui.Component;
import com.vaadin.ui.FormLayout;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Notification;
import com.vaadin.ui.Notification.Type;
import com.vaadin.ui.TabSheet;
import com.vaadin.ui.TextField;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;
import com.vaadin.ui.themes.ValoTheme;

@SuppressWarnings("serial")
public class ProfilePreferencesWindow extends Window {

    public static final String ID = "profilepreferenceswindow";

    /*
     * Fields for editing the User object are defined here as class members.
     * They are later bound to a FieldGroup by calling
     * fieldGroup.bindMemberFields(this). The Fields' values don't need to be
     * explicitly set, calling fieldGroup.setItemDataSource(user) synchronizes
     * the fields with the user object.
     */
    @PropertyId("username")
    private TextField usernameField;
    @PropertyId("email")
    private TextField emailField;

    private ProfilePreferencesWindow(final Profile user, final boolean preferencesTabOpen) {
        addStyleName("profile-window");
        setId(ID);
        Responsive.makeResponsive(this);

        setModal(true);
        setResizable(false);
        setClosable(true);
        setHeight(30.0f, Unit.PERCENTAGE);
        setWidth(60.0f, Unit.PERCENTAGE);

        VerticalLayout content = new VerticalLayout();
        content.setSizeFull();
        content.setMargin(new MarginInfo(true, false, false, false));
        content.setSpacing(false);
        setContent(content);

        TabSheet detailsWrapper = new TabSheet();
        detailsWrapper.setSizeFull();
        detailsWrapper.addStyleName(ValoTheme.TABSHEET_PADDED_TABBAR);
        detailsWrapper.addStyleName(ValoTheme.TABSHEET_ICONS_ON_TOP);
        detailsWrapper.addStyleName(ValoTheme.TABSHEET_CENTERED_TABS);
        content.addComponent(detailsWrapper);
        content.setExpandRatio(detailsWrapper, 1f);

        detailsWrapper.addComponent(buildProfileTab());

        content.addComponent(buildFooter());
    }

    private Component buildProfileTab() {
        HorizontalLayout root = new HorizontalLayout();
        root.setCaption("Edit Profile");
        root.setIcon(FontAwesome.USER);
        root.setWidth(100.0f, Unit.PERCENTAGE);
        root.setMargin(true);
        root.addStyleName("profile-form");

        FormLayout details = new FormLayout();
        details.addStyleName(ValoTheme.FORMLAYOUT_LIGHT);
        root.addComponent(details);
        root.setExpandRatio(details, 1);

        usernameField = new TextField("User Name");
        usernameField.setRequiredIndicatorVisible(true);
        usernameField.setValue(AjobsUI.getApi().getProfileSession().getUsername());
        usernameField.setWidth("100%");
        usernameField.setResponsive(true);
        details.addComponent(usernameField);

        emailField = new TextField("Email");
        emailField.setRequiredIndicatorVisible(true);
        emailField.setValue(AjobsUI.getApi().getProfileSession().getEmail());
        emailField.setWidth("100%");
        emailField.setResponsive(true);
        details.addComponent(emailField);

        return root;
    }

    private Component buildFooter() {
        HorizontalLayout footer = new HorizontalLayout();
        footer.addStyleName(ValoTheme.WINDOW_BOTTOM_TOOLBAR);
        footer.setWidth(100.0f, Unit.PERCENTAGE);
        footer.setSpacing(false);
        
        Button close = new Button("Close");
        close.addStyleName(ValoTheme.BUTTON_QUIET);
        close.addStyleName(ValoTheme.LABEL_LIGHT);
        close.setIcon(VaadinIcons.ARROW_CIRCLE_LEFT_O);
        close.setClickShortcut(KeyCode.ESCAPE, null);
        
        Button ok = new Button("OK");
        //ok.addStyleName(ValoTheme.BUTTON_PRIMARY);
        ok.addClickListener(new ClickListener() {
            @Override
            public void buttonClick(ClickEvent event) {
            		String description = "";
                try {
                    
                  	boolean goodToGo = true;
		    	        	
		    	        if(usernameField.isEmpty()) {
		    	        		goodToGo = false;
		    	        		description += "<span>Username cannot be empty.</span>";
		    	        	}
		    	        	if(emailField.isEmpty()) {
		    	        		goodToGo = false;
		    	        		description += "<span>Email cannot be empty.</span>";
		    	        	}
		    	        	
		    	        	if(checkUsername(usernameField.getValue().toString())) {
		    	        		goodToGo = false;
		    	        		description += "<span>Username is taken by another user, please try another.</span>";
		    	        	}
		    	        	if(checkEmail(emailField.getValue().toString())) {
		    	        		goodToGo = false;
		    	        		description += "<span>Email is taken by another user, please try another.</span>";
		    	        	}
                    
		    	        	if(goodToGo) { 

	                    Notification success = new Notification("Profile updated successfully");
	                    success.setDelayMsec(20000);
	                    success.setStyleName("bar success small");
	                    success.setPosition(Position.BOTTOM_CENTER);
	                    success.show(Page.getCurrent());
	                    Profile currProfile =  (Profile) VaadinSession.getCurrent().getAttribute(Profile.class.getName());
	                    currProfile.setEmail(emailField.getValue());
	                    currProfile.setUsername(usernameField.getValue());
	                    VaadinSession.getCurrent().setAttribute(Profile.class.getName(), currProfile);
	                    
	                    // AjobsMenu listens to this, updates new user in settings menu
	                    DraftyEventBus.post(new ProfileUpdatedEvent()); 
	                    
	                    // Updated user should also be persisted in database.
	                    AjobsUI.getApi().updateEditedProfileInDB(currProfile);
	                     
	                    close();
		    	        	} else {
		    	        		Notification notification = new Notification("Please Check Fields");
		    	        		notification.setDescription(description);
		    	            notification.setHtmlContentAllowed(true);
		    	            notification.setStyleName("tray small closable login-help");
		    	            notification.setPosition(Position.BOTTOM_CENTER);
		    	            notification.setDelayMsec(20000);
		    	            notification.show(Page.getCurrent());
		    	        	}
                } catch (Exception e) {
                		Notification.show("Error while updating profile!", Type.ERROR_MESSAGE);
                    AjobsUI.getApi().logError(e);
                }
            }
        });
        
        close.addClickListener(e -> {
        		usernameField.setValue("");
        		emailField.setValue("");
        		close();
        });

        footer.addComponent(close);
        ok.focus();
        footer.addComponent(ok);
        footer.setComponentAlignment(ok, Alignment.TOP_RIGHT);

        return footer;
    }

    private boolean checkUsername(String username) {
		boolean exists = false;
		if(!username.equals(AjobsUI.getApi().getProfileSession().getUsername())) {
			for(Entry<Integer, Users> users : AjobsUI.getApi().getUsers().entrySet()) {
				if(username.equals(users.getValue().getUsername())) {
					exists = true;
					break;
				}
			}
		}
		return exists;
    }

	private boolean checkEmail(String email) {
		boolean exists = false;
		if(!email.equals(AjobsUI.getApi().getProfileSession().getEmail())) {
			for(Entry<Integer, Users> users : AjobsUI.getApi().getUsers().entrySet()) {
				if(email.equals(users.getValue().getUsername())) {
					exists = true;
					break;
				}
			}
		}
		return exists;
	}
    
    public static void open(final Profile user, final boolean preferencesTabActive) {
        DraftyEventBus.post(new CloseOpenWindowsEvent());
        Window w = new ProfilePreferencesWindow(user, preferencesTabActive);
        UI.getCurrent().addWindow(w);
        w.focus();
    }
}
