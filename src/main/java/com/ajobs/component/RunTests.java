package com.ajobs.component;

import java.sql.Timestamp;
import java.util.Date;

import com.ajobs.domain.Profile;
import com.ajobs.domain.Url;
import com.vaadin.server.VaadinSession;

public class RunTests {
	
	private Date date = new Date();
	
	public RunTests(String msg) {
		// run tests
		System.out.println("#########################################################################");
		System.out.println("### Run Tests ### " + msg);
		System.out.println(new Timestamp(date.getTime()));
		if(VaadinSession.getCurrent().getAttribute(Profile.class.getName()) != null) {
			System.out.println(VaadinSession.getCurrent().getAttribute(Profile.class.getName()).toString());
		}
		if(VaadinSession.getCurrent().getAttribute(Url.class.getName()) != null) {
			System.out.println(VaadinSession.getCurrent().getAttribute(Url.class.getName()).toString());
		}
		
		System.out.println("#########################################################################");
	}
}