package com.ajobs.util;

import com.ajobs.domain.Url;
import com.vaadin.server.Page;
import com.vaadin.server.VaadinRequest;
import com.vaadin.server.VaadinSession;

public class UriFragmentReader {

	public void readDatasource() {
		String datasource = VaadinRequest.getCurrent().getContextPath().split("/")[1];
		System.out.println(" :::: UriFRagmentReader: readDatasource() = " + datasource);
		Url urlDomain = new Url();
        urlDomain.setDataset(datasource);
	    VaadinSession.getCurrent().setAttribute(Url.class.getName(), urlDomain);
	}
	
	public void readUriVars() {
		Url urlDomain = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
        String url = Page.getCurrent().getLocation().toString();
        System.out.println(" :::: START URI Fragment Reader, url = " + url);
        
        String urlFragment = "";
        if(url.contains("?-?")) {
        	urlFragment = url.split("\\?\\-")[1];
        	urlDomain.setActive(true);
        }
        
        System.out.println(" :::: END URI Fragment Reader, fragment = " + urlFragment + " " + urlDomain.isActive());
        
        urlDomain.setSearchFragment(urlFragment);
        VaadinSession.getCurrent().setAttribute(Url.class.getName(), urlDomain);
	}
	
    public void readFragment() {
    	String fragment = Page.getCurrent().getUriFragment();
        System.out.println("readFragment() = " + fragment);
        Page.getCurrent().setUriFragment(fragment, false);
    };
}
