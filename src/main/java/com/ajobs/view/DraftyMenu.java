package com.ajobs.view;

import com.ajobs.AjobsUI;
import com.ajobs.component.ProfilePreferencesWindow;
import com.ajobs.component.SignInWindow;
import com.ajobs.component.SignUpWindow;
import com.ajobs.domain.Profile;
import com.ajobs.domain.Url;
import com.ajobs.event.DraftyEvent.PostViewChangeEvent;
import com.ajobs.event.DraftyEvent.ProfileUpdatedEvent;
import com.ajobs.event.DraftyEvent.UserLoggedOutEvent;
import com.ajobs.event.DraftyEventBus;
import com.google.common.eventbus.Subscribe;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.Page;
import com.vaadin.server.Responsive;
import com.vaadin.server.VaadinSession;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.CustomComponent;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.MenuBar.Command;
import com.vaadin.ui.MenuBar.MenuItem;
import com.vaadin.ui.UI;

@SuppressWarnings("serial")
public class DraftyMenu extends CustomComponent {
	
	//private static final String STYLE_VISIBLE = "valo-menu-visible";
	
    private CssLayout menuLayout = new CssLayout();
    private CssLayout menuMidLayout = new CssLayout();
	
    private Button menuWindow = new Button();
    private Button signInBtn = new DraftyMenuWindowButton(VaadinIcons.SIGN_IN, "Sign-In");
    private Button signUpBtn = new DraftyMenuWindowButton(VaadinIcons.SIGN_IN_ALT, "Sign-Up");
    private Button editProfileBtn = new DraftyMenuWindowButton(VaadinIcons.USER, "Edit Profile");
    private Button signOutBtn = new DraftyMenuWindowButton(VaadinIcons.SIGN_OUT, "Sign-Out");

    private MenuBar userMenuBar = new MenuBar();
    private MenuItem userMenu;
    
	public DraftyMenu() {
        // There's only one Menu component per UI so this doesn't need to be
        // unregistered from the UI-scoped DashboardEventBus.
        DraftyEventBus.register(this);

        setCompositionRoot(buildContent());
    }
	
	private Component buildContent() {
		menuLayout.addStyleName("HolyGrail-header");
		menuLayout.setWidth("100%");
		Responsive.makeResponsive(menuWindow, menuMidLayout, menuLayout);
		
		buildTitle();
		buildMenuItems();
		buildUserMenu();
		
		return menuLayout;
    }

	private void buildTitle() {
        //Label logo = new Label("Academic <strong>Jobs</strong>", ContentMode.HTML);
        //logo.addStyleName("HolyGrail-header-title");
		Url urlSession = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
        String headerMsg = urlSession.getDataset().getHeaderMsg();
		menuWindow.setCaptionAsHtml(true);
		menuWindow.setCaption("<a href=\" # \" style=\"text-decoration: none; color: #fff; \" > <strong>Drafty Platform</strong>   <span style=\"font-size: 20px\">" + headerMsg + "</span></a>");
		menuWindow.removeStyleNames("v-button");
		menuWindow.setPrimaryStyleName("HolyGrail-header-title");
		menuWindow.addStyleName("HolyGrail-header-title");
		//menuWindow.setIcon(VaadinIcons.AUTOMATION);
		//menuWindow.setIcon(VaadinIcons.CHART_GRID);
		menuWindow.setIcon(VaadinIcons.CLUSTER);
		menuWindow.setWidth("100%");
		menuWindow.addClickListener(e -> {
			UI.getCurrent().getNavigator().navigateTo("data");
		});
        menuLayout.addComponent(menuWindow);
    }
	
	private Profile getCurrentUser() {
        return (Profile) VaadinSession.getCurrent().getAttribute(Profile.class.getName());
    }
	
	private void buildUserMenu() {
		final Profile user = getCurrentUser();
        if(user.isLoggedIn()) {
        	menuMidLayout.removeComponent(signInBtn);
        	menuMidLayout.removeComponent(signUpBtn);
        	
        	editProfileBtn.addClickListener(e ->  ProfilePreferencesWindow.open(user, false));
        	signOutBtn.addClickListener(e ->  DraftyEventBus.post(new UserLoggedOutEvent()));
        	menuMidLayout.addComponents(editProfileBtn, signOutBtn);
        	
        	//menuMidLayout.addComponent(buildUserMenuLoggedIn());
        } else {
        	//menuMidLayout.removeComponent(userMenuBar);
        	
        	menuMidLayout.removeComponent(editProfileBtn);
        	menuMidLayout.removeComponent(signOutBtn);
        	
    		signInBtn.addClickListener(e -> SignInWindow.open());
    		signUpBtn.addClickListener(e -> SignUpWindow.open());
    		menuMidLayout.addComponents(signInBtn, signUpBtn);
        }
	}
	
	@SuppressWarnings("unused")
	private Component buildUserMenuLoggedIn() {
        final Profile user = getCurrentUser();
        
        userMenu = userMenuBar.addItem("", VaadinIcons.USER, null);
        updateUserName(null);
        
        userMenuBar.setPrimaryStyleName("HolyGrail-user-menu-item");
        
        userMenu.addItem("Edit Profile", new Command() {
            @Override
            public void menuSelected(final MenuItem selectedItem) {
                ProfilePreferencesWindow.open(user, false);
            }
        });
        userMenu.addSeparator();
        userMenu.addItem("Sign Out", new Command() {
            @Override
            public void menuSelected(final MenuItem selectedItem) {
                DraftyEventBus.post(new UserLoggedOutEvent());
            }
        });
        return userMenuBar;
    }

    private void buildMenuItems() {
		menuMidLayout.addStyleName("HolyGrail-header-actions");
		menuMidLayout.setWidth("100%");
    	
        for (final DraftyViewType view : DraftyViewType.values()) {
            Component menuItemComponent = new DraftyMenuItemButton(view);
            Responsive.makeResponsive(menuItemComponent);
            
            if (!view.isAdmin()){
	    			menuMidLayout.addComponent(menuItemComponent);
	    		} else if(AjobsUI.getApi().getProfileSession().isLoggedIn()) {
            		if(AjobsUI.getApi().getProfileSession().getIdRole() == 1) {
            			menuMidLayout.addComponent(menuItemComponent);
            		} 
            	}
        }
        menuLayout.addComponent(menuMidLayout);
    }
	
	@Subscribe
    public void postViewChange(final PostViewChangeEvent event) {
        // After a successful view change the menu can be hidden in mobile view.
        //getCompositionRoot().removeStyleName(STYLE_VISIBLE);
    }
	
	@Subscribe
    public void updateUserName(final ProfileUpdatedEvent event) {
        Profile user = getCurrentUser();
        userMenu.setText(user.getUsername());
    }
	
	public final class DraftyMenuWindowButton extends Button {
		
		public DraftyMenuWindowButton(VaadinIcons icon, String caption) {
			setPrimaryStyleName("HolyGrail-menu-item");
	        //addStyleName("HolyGrail-menu-item");
	        setIcon(icon);
	        setCaption(caption);
		}
    }
	
    public final class DraftyMenuItemButton extends Button {

        private static final String STYLE_SELECTED = "selected";

        private final DraftyViewType view;

        public DraftyMenuItemButton(final DraftyViewType view) {
            this.view = view;
            setPrimaryStyleName("HolyGrail-menu-item");
            //addStyleName("HolyGrail-menu-item");
            setIcon(view.getIcon());
            setCaption(view.getViewName().substring(0, 1).toUpperCase() + view.getViewName().substring(1));
            DraftyEventBus.register(this);
            addClickListener(new ClickListener() {
                @Override
                public void buttonClick(final ClickEvent event) {
                    UI.getCurrent().getNavigator().navigateTo(view.getViewName());
                }
            });
        }
        
        @Subscribe
        public void postViewChange(final PostViewChangeEvent event) {
            removeStyleName(STYLE_SELECTED);
            if (event.getView() == view) {
                addStyleName(STYLE_SELECTED);
            }
        }
    }
}
