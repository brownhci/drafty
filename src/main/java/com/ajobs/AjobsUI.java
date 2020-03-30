package com.ajobs;

import java.util.Locale;

import com.ajobs.api.ApiNew;
import com.ajobs.api.ApiNewImpl;
import com.ajobs.api.ApiProvider;
import com.ajobs.api.ApiProviderImpl;
import com.ajobs.component.NewUserWelcome;
import com.ajobs.event.DraftyEvent.BrowserResizeEvent;
import com.ajobs.event.DraftyEvent.CloseOpenWindowsEvent;
import com.ajobs.event.DraftyEvent.UserLoggedOutEvent;
import com.ajobs.event.DraftyEvent.UserLoginRequestedEvent;
import com.ajobs.event.DraftyEvent.UserLoginSuccesfulEvent;
import com.ajobs.event.DraftyEventBus;
import com.ajobs.util.Cookies;
import com.ajobs.util.UriFragmentReader;
import com.ajobs.view.MainDrafty;
import com.google.common.eventbus.Subscribe;
import com.vaadin.annotations.Theme;
import com.vaadin.annotations.Title;
import com.vaadin.annotations.Widgetset;
import com.vaadin.server.Page;
import com.vaadin.server.Page.BrowserWindowResizeEvent;
import com.vaadin.server.Page.BrowserWindowResizeListener;
import com.vaadin.server.Responsive;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinSession;
import com.vaadin.ui.UI;
import com.vaadin.ui.Window;

@Theme("dashboard")
@Widgetset("com.ajobs.AjobsWidgetSet")
@Title("Drafty")
@SuppressWarnings("serial")
public final class AjobsUI extends UI {

    /*
     * This field stores an access to the dummy backend layer. In real
     * applications you most likely gain access to your beans trough lookup or
     * injection; and not in the UI but somewhere closer to where they're
     * actually accessed.
     */
    private final ApiProvider api = new ApiProviderImpl();
    private final ApiNew apiNew = new ApiNewImpl();
    private final DraftyEventBus eventbus = new DraftyEventBus();
    
    @Override
    protected void init(final VaadinRequest request) {
        setLocale(Locale.US);
        System.out.println("-----------INIT-----------VaadinRequest");
        DraftyEventBus.register(this);
        Responsive.makeResponsive(this);
        //addStyleName(ValoTheme.UI_WITH_MENU);
        
        new UriFragmentReader().readUriVars();
        
        System.out.println("### init(final VaadinRequest request) - getApi().insertSession() ###");
        getApi().insertSession();
        
        updateContent();
        
        if(AjobsUI.getApi().getProfileSession().isNewUser()) {
        	NewUserWelcome.open();
        } else {
            getApi().welcomeMessage();
        }
        
        // Some views need to be aware of browser resize events so a
        // BrowserResizeEvent gets fired to the event bus on every occasion.
        Page.getCurrent().addBrowserWindowResizeListener(
            new BrowserWindowResizeListener() {
                @Override
                public void browserWindowResized(
            		final BrowserWindowResizeEvent event) {
            			DraftyEventBus.post(new BrowserResizeEvent());
            		}
            });
    }
    
    /**
     * Updates the correct content for this UI based on the current user status.
     * If the user is logged in with appropriate privileges, main view is shown.
     * Otherwise login view is shown.
     */
    private void updateContent() {
    	//only call 1; causes view to be loaded twice
        setContent(new MainDrafty());
        getNavigator().navigateTo(getNavigator().getState()); // can cause null pointers
    }

    @Subscribe
    public void userLoginRequested(final UserLoginRequestedEvent event) {
        if(getApi().authenticate(event.getUserName(), event.getPassword())) {
        	getApi().updateSession();
        	//getApi().initDataModels(); // sw - not needed anymore
        	DraftyEventBus.post(new UserLoginSuccesfulEvent());
        	updateContent();
	    }
    }

    @Subscribe
    public void userLoggedOut(final UserLoggedOutEvent event) {
    	System.out.println("userLoggedOut event -> AjobsUI");
    	
    	Cookies.userLoggedOutSetFlagInCookie();
    	
        // When the user logs out, current VaadinSession gets closed and the
        // page gets reloaded on the login screen. This doesn't invalidate the current HttpSession.
        VaadinSession.getCurrent().close();
        Page.getCurrent().reload();
    }

    @Subscribe
    public void closeOpenWindows(final CloseOpenWindowsEvent event) {
        for (Window window : getWindows()) {
            window.close();
        }
    }

    /**
     * @return An instance for accessing the global services layers.
     */
    public static ApiProvider getApi() {
        return ((AjobsUI) getCurrent()).api;
    }

    public static ApiNew getApiNew() {
        return ((AjobsUI) getCurrent()).apiNew;
    }
    
    public static DraftyEventBus getEventbus() {
        return ((AjobsUI) getCurrent()).eventbus;
    }
}
