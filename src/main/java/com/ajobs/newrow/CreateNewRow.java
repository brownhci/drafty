package com.ajobs.newrow;

import com.ajobs.domain.Url;
import com.vaadin.server.VaadinSession;

public class CreateNewRow {
	
	public CreateNewRow(String msg) {
		Url urlSession = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
		String datasource = urlSession.getDataset().getJNDI();
		
		System.out.println("Create New Row Called: " + msg + ", datasource = " + datasource);
		
		if(datasource.equals(Url.Dataset.AJOBS.getJNDI())) {
			AjobsNewRowWindow.open(msg);
		} else if(datasource.equals(Url.Dataset.PROFS.getJNDI())) {
			ProfsNewRowWindow.open(msg);
		}
	}
}
