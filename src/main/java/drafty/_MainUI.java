package drafty;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.Locale;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;

import com.google.common.eventbus.Subscribe;
import com.vaadin.annotations.Push;
import com.vaadin.annotations.Theme;
import com.vaadin.annotations.Title;
import com.vaadin.annotations.VaadinServletConfiguration;
import com.vaadin.annotations.Viewport;
import com.vaadin.navigator.Navigator;
import com.vaadin.server.Page;
import com.vaadin.server.Responsive;
import com.vaadin.server.ServiceException;
import com.vaadin.server.SessionDestroyEvent;
import com.vaadin.server.SessionDestroyListener;
import com.vaadin.server.SessionInitEvent;
import com.vaadin.server.SessionInitListener;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinServlet;
import com.vaadin.shared.communication.PushMode;
import com.vaadin.ui.UI;
import com.vaadin.ui.Window;

import drafty.api.ApiProvider;
import drafty.api.ApiProviderImpl;
import drafty.event.DraftyEvent.CloseOpenWindowsEvent;
import drafty.event.DraftyEvent.expPopUpEvent;
import drafty.event.DraftyEventBus;
import drafty.experiments.MySub;
import drafty.views.Profs;
import drafty.views.SecretView;

@Viewport("width=device-width, initial-scale=1.0")
@SuppressWarnings("serial")
@Title("Drafty")
@Theme("ICERMvalo")
@Push(PushMode.MANUAL)
public class _MainUI extends UI {

	/*
     * This field stores an access to the dummy backend layer. In real
     * applications you most likely gain access to your beans trough lookup or
     * injection; and not in the UI but somewhere closer to where they're
     * actually accessed.
     */
    private final ApiProvider dataProvider = new ApiProviderImpl();
	private final DraftyEventBus draftyEventbus = new DraftyEventBus();
	
	public Navigator navigator = new Navigator(this, this);;
	
	@Subscribe
    public void expPopUp(final expPopUpEvent event) {
		System.out.println("EventBus");
        //new FeederThread().start();
    }
	
	public class FeederThread extends Thread {
        int count = 0;

        @Override
        public void run() {
            try {
                // Update the data for a while
                while (count < 2) {
                    Thread.sleep(1000);

                    access(new Runnable() {
                        @Override
                        public void run() {
                            System.out.println("Thread OUT " + count);
                            count++;
                        }
                    });
                }

                // Inform that we have stopped running
                access(new Runnable() {
                	
					@Override
                    public void run() {
                    	System.out.println("Thread PUSH");
            		    

            			MySub sub = new MySub();
                    	
            		    // Add it to the root component
            		    UI.getCurrent().addWindow(sub);
            		    UI.getCurrent().setFocusedComponent(sub);
                    }
                });
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }
	
	
	@WebServlet(value = {"/*", "/Drafty/*", "/professors/*", "/VAADIN/*"}, asyncSupported = true)
	@VaadinServletConfiguration(productionMode = true, ui = _MainUI.class, closeIdleSessions = true, widgetset="drafty.MyAppWidgetset")
	public static class Servlet extends VaadinServlet implements SessionInitListener, SessionDestroyListener {
		@Override
	    protected void servletInitialized() throws ServletException {
	        super.servletInitialized();
	        getService().addSessionInitListener(this);
	        getService().addSessionDestroyListener(this);
	    }
		
	    @Override
	    public void sessionInit(SessionInitEvent event)
	            throws ServiceException {
	        // Do session start stuff here
	    	System.out.println("START SESSION: " + LocalDateTime.now() + " - " + ZonedDateTime.now());
	    }

	    @Override
	    public void sessionDestroy(SessionDestroyEvent event) {
	        // Do session end stuff here
	    	System.out.println("STOP SESSION: " + LocalDateTime.now() + " - " + ZonedDateTime.now());
	    }
	}
	
	@Override
	protected void init(VaadinRequest request) {
		
		setLocale(Locale.US);
		DraftyEventBus.register(this);
		Responsive.makeResponsive(this);
		
		if(Page.getCurrent().getWebBrowser().isTooOldToFunctionProperly()) {
			//too old won't work with Vaadin
		} else {
			navigator.addView("professors", new Profs());
			navigator.addView("secretview", new SecretView());
			navigator.navigateTo("professors");
			//navigator.navigateTo("secretview");
		}
		
		//new FeederThread().start();
	}

	@Subscribe
    public void closeOpenWindows(final CloseOpenWindowsEvent event) {
        for (Window window : getWindows()) {
        	System.out.println("STOP SESSION close window: " + LocalDateTime.now() + " - " + ZonedDateTime.now());
            window.close();
        }
    }
	
	/**
     * @return An instance for accessing the global API services layer.
     */
    public static ApiProvider getApi() {
        return ((_MainUI) getCurrent()).dataProvider;
    }

	public static DraftyEventBus getDraftyEventbus() {
		return ((_MainUI) getCurrent()).draftyEventbus;
	}
}
