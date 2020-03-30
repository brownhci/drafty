package com.ajobs;

import javax.servlet.ServletException;
import javax.servlet.annotation.WebServlet;

import com.vaadin.annotations.VaadinServletConfiguration;
import com.vaadin.annotations.Widgetset;
import com.vaadin.server.VaadinServlet;

@SuppressWarnings("serial")
@WebServlet(value = {"/*", "/ajobs/*", "/VAADIN/*"}, asyncSupported = true)
@VaadinServletConfiguration(productionMode = true, ui = AjobsUI.class, closeIdleSessions = true, widgetset="com.ajobs.AjobsWidgetset")
@Widgetset("com.vaadin.v7.Vaadin7WidgetSet")
public class AjobsServlet extends VaadinServlet {
	
    @Override
    protected final void servletInitialized() throws ServletException {
    	System.out.println("Servlet INIT AjobsServlet");
    		
        super.servletInitialized();
        getService().addSessionInitListener(e -> new AjobsSessionListener().sessionInit(e));
        getService().addSessionDestroyListener(e -> new AjobsSessionListener().sessionDestroy(e));
    }
}