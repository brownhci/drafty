package com.ajobs.view;

import com.ajobs.AjobsNavigator;
import com.vaadin.server.Responsive;
import com.vaadin.ui.ComponentContainer;
import com.vaadin.ui.CssLayout;

@SuppressWarnings("serial")
public class MainDrafty extends CssLayout {

    ComponentContainer content = new CssLayout();
	
	CssLayout body = new CssLayout();
	CssLayout body_main = new CssLayout();
	
	
	public MainDrafty() {
        setSizeFull();
        setStyle3();

        addComponent(new DraftyMenu());
        
        content.setSizeFull();
        content.addComponents(body);
        addComponent(content);

        Responsive.makeResponsive(this, content, body, body_main);
        
        new AjobsNavigator(content);       
	}
    
    private void setStyle3() {
    	content.addStyleName("HolyGrail");
    }
}
