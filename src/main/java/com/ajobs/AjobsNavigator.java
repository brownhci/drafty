package com.ajobs;

import org.vaadin.googleanalytics.tracking.GoogleAnalyticsTracker;

import com.ajobs.domain.Url;
import com.ajobs.event.DraftyEvent.BrowserResizeEvent;
import com.ajobs.event.DraftyEvent.CloseOpenWindowsEvent;
import com.ajobs.event.DraftyEvent.PostViewChangeEvent;
import com.ajobs.event.DraftyEventBus;
import com.ajobs.view.DraftyViewType;
import com.vaadin.navigator.Navigator;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener;
import com.vaadin.navigator.ViewProvider;
import com.vaadin.server.Page;
import com.vaadin.server.VaadinSession;
import com.vaadin.ui.ComponentContainer;
import com.vaadin.ui.UI;

@SuppressWarnings("serial")
public class AjobsNavigator extends Navigator {

    // Provide a Google Analytics tracker id here
    private static final String TRACKER_ID = null;// "UA-658457-6";
    private GoogleAnalyticsTracker tracker;

    private static final DraftyViewType ERROR_VIEW = DraftyViewType.GRID;
    private ViewProvider errorViewProvider;

    public AjobsNavigator(final ComponentContainer container) {
        super(UI.getCurrent(), container);
        /*
        String host = getUI().getPage().getLocation().getHost();
        if (TRACKER_ID != null && host.endsWith("demo.vaadin.com")) {
            initGATracker(TRACKER_ID);
        }
        */
        initViewChangeListener();
        initViewProviders();
    }

    private void initGATracker(final String trackerId) {
        tracker = new GoogleAnalyticsTracker(trackerId, "drafty.cs.brown.edu");
        // GoogleAnalyticsTracker is an extension add-on for UI so it is
        // initialized by calling .extend(UI)
        tracker.extend(UI.getCurrent());
    }

    private void initViewChangeListener() {
        addViewChangeListener(new ViewChangeListener() {

            @Override
            public boolean beforeViewChange(final ViewChangeEvent event) {
            	//System.out.println("Navigator beforeViewChange(): " + event.getNewView().toString() + " " + event.getViewName());
                
            	// conditions in switching between the views
        		Url urlDomain = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
        		if(urlDomain.equals(null)) {
        			urlDomain = new Url();
        			//System.out.println(Page.getCurrent().getUriFragment().toString());
        		}
        		
        		urlDomain.setCurrentViewName(event.getViewName());
        		
        		try {
        			String newUrl = Page.getCurrent().getUriFragment().toString();
        			urlDomain.setFragment(newUrl);
            		VaadinSession.getCurrent().setAttribute(Url.class.getName(), urlDomain);
        		} catch(NullPointerException e) {
        			//do nothing
        		}
            		
                return true;
            }

            @Override
            public void afterViewChange(final ViewChangeEvent event) {
                readFragment(); 
            	DraftyViewType view = DraftyViewType.getByViewName(event.getViewName());
                
                // Appropriate events get fired after the view is changed.
                DraftyEventBus.post(new PostViewChangeEvent(view));
                DraftyEventBus.post(new BrowserResizeEvent());
                DraftyEventBus.post(new CloseOpenWindowsEvent());
                
                if (tracker != null) {
                    // The view change is submitted as a pageview for GA tracker
                    tracker.trackPageview("/ajobs/" + event.getViewName());
                }
            }
        });
    }
    
    private void readFragment() {
    	Url urlDomain = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
        try {
        	String newUrl = Page.getCurrent().getUriFragment().toString();
        	if(urlDomain.isActive() && urlDomain.getCurrentViewName().equals("data")) {
				newUrl += urlDomain.getSearchFragment();
				//System.out.println("newUrl = beforeViewChange " + newUrl);
			}
        	urlDomain.setFragment(newUrl);
    		Page.getCurrent().setUriFragment(newUrl, false); //rewrites whole thing if false; true = endless loop
    		//System.out.println("Navigator setUriFragment = " + Page.getCurrent().getUriFragment().toString());
        } catch(NullPointerException e) {
        	//do nothing
        }
    }
    
    private void initViewProviders() {
        // A dedicated view provider is added for each separate view type
        for (final DraftyViewType viewType : DraftyViewType.values()) {
            ViewProvider viewProvider = new ClassBasedViewProvider(viewType.getViewName(), viewType.getViewClass()) {

                // This field caches an already initialized view instance if the
                // view should be cached (stateful views).
                private View cachedInstance;

                @Override
                public View getView(final String viewName) {
                    View result = null;
                    if (viewType.getViewName().equals(viewName)) {
                        if (viewType.isStateful()) {
                            // Stateful views get lazily instantiated
                            if (cachedInstance == null) {
                                cachedInstance = super.getView(viewType.getViewName());
                            }
                            result = cachedInstance;
                        } else {
                            // Non-stateful views get instantiated every time
                            // they're navigated to
                            result = super.getView(viewType.getViewName());
                        }
                    }
                    return result;
                }
            };

            if (viewType == ERROR_VIEW) {
                errorViewProvider = viewProvider;
            }

            addProvider(viewProvider);
        }

        setErrorProvider(new ViewProvider() {
            @Override
            public String getViewName(final String viewAndParameters) {
                return ERROR_VIEW.getViewName();
            }

            @Override
            public View getView(final String viewName) {
                return errorViewProvider.getView(ERROR_VIEW.getViewName());
            }
        });
    }
}
