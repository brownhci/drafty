package drafty.views;

import java.util.Locale;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;

import com.google.common.eventbus.Subscribe;
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
import com.vaadin.spring.annotation.SpringUI;
import com.vaadin.ui.UI;
import com.vaadin.ui.Window;

import drafty.event.DraftyEvent.BrowserResizeEvent;
import drafty.event.DraftyEvent.CloseOpenWindowsEvent;
import com.vaadin.server.Page.BrowserWindowResizeEvent;
import com.vaadin.server.Page.BrowserWindowResizeListener;

import drafty.data.DataProvider;
import drafty.data.DataProviderImpl;
import drafty.event.DraftyEventBus;

@Viewport("width=device-width, initial-scale=1.0")
@SuppressWarnings("serial")
@Title("Drafty")
@Theme("ICERMvalo")
@SpringUI
public class _MainUI extends UI {

	/*
     * This field stores an access to the dummy backend layer. In real
     * applications you most likely gain access to your beans trough lookup or
     * injection; and not in the UI but somewhere closer to where they're
     * actually accessed.
     */
    private final DataProvider dataProvider = new DataProviderImpl();
	private final DraftyEventBus draftyEventbus = new DraftyEventBus();
	
	public Navigator navigator = new Navigator(this, this);;
	
	@WebServlet(value = {"/*", "/Drafty/*", "/professors/*", "/VAADIN/*"}, asyncSupported = true)
	//@WebServlet(value = "/*", asyncSupported = true)
	@VaadinServletConfiguration(productionMode = false, ui = _MainUI.class)
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
	    }

	    @Override
	    public void sessionDestroy(SessionDestroyEvent event) {
	        // Do session end stuff here
	    }
	}
	
	@Override
	protected void init(VaadinRequest request) {
		setLocale(Locale.US);
		DraftyEventBus.register(this);
		Responsive.makeResponsive(this);
		
		
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
		
		
		if(Page.getCurrent().getWebBrowser().isTooOldToFunctionProperly()) {
			//too old won't work with Vaadin
		} else {
			navigator.addView("professors", new Profs());
			navigator.addView("secretview", new SecretView());
			navigator.navigateTo("professors");
		}
	}

	@Subscribe
    public void closeOpenWindows(final CloseOpenWindowsEvent event) {
        for (Window window : getWindows()) {
            window.close();
        }
    }
	
	/**
     * @return An instance for accessing the (dummy) services layer.
     */
    public static DataProvider getDataProvider() {
        return ((_MainUI) getCurrent()).dataProvider;
    }

	public static DraftyEventBus getDraftyEventbus() {
		return ((_MainUI) getCurrent()).draftyEventbus;
	}
}
