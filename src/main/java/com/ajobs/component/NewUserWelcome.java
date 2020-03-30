package com.ajobs.component;

import com.ajobs.event.DraftyEvent.CloseOpenWindowsEvent;
import com.ajobs.event.DraftyEventBus;
import com.vaadin.annotations.PreserveOnRefresh;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.Responsive;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.Component;
import com.vaadin.ui.Label;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;

@SuppressWarnings("serial")
@PreserveOnRefresh
public class NewUserWelcome extends Window {
	
	public static final String ID = "NewUserWelcome";
	
	public NewUserWelcome() {
	    setId(ID);
	    Responsive.makeResponsive(this);
	    
	    setIcon(VaadinIcons.CLUSTER);
        setCaption(" Welcome");
        setWidth(50.0f, Unit.PERCENTAGE);
        setModal(true);
        setResizable(true);
        setClosable(true);
	    
	    setContent(buildNewUserWelcome());
	}
    
    private Component buildNewUserWelcome() {
    	VerticalLayout welcomeModal = new VerticalLayout();
    	Label body = new Label();
    	Button proceed = new Button("Proceed to Drafty");
    	
    	welcomeModal.setMargin(true);
		welcomeModal.setSpacing(true);
		
		String caption = 
				"<h2 style='margin-top: .5em;'>Welcome to Drafty</h2>"
				+ "<span style='display: block; text-align: center;'>Drafty is a user-centric platform to edit and maintain structured datasets. "
				+ "<br><i>All interactions are captured and used anonymously for studies. Cookies are used to track user profiles.</i></span>"
				+ "<h3 style='display: block; text-align: center;'><b><span class=\"v-icon FontAwesome\"></span> To edit data double-click a cell to open the inline-editor.<br>Click the dropdowns in the inline-editor<br> to see suggested values from other users.</b></h3>";
		
		String footer = "<h4 style='color: rgb(153, 153, 153); display: block; text-align: center; margin-top: 2em;'><hr><i>Brown University - Computer Science - Human Computer Interaction Research Group</i><hr></h4>";
		
		body = new Label(caption + footer, ContentMode.HTML);
		body.setCaptionAsHtml(true);
		body.setWidth("100%");
		//body.setCaption(caption);
		
		proceed.setWidth("100%");
		proceed.setIcon(VaadinIcons.THUMBS_UP_O);
		proceed.addClickListener(e -> this.close()); //sw - closes modal window
		
		welcomeModal.addComponents(body, proceed);
    	
    	return welcomeModal;
    }
	
	public static void open() {
        DraftyEventBus.post(new CloseOpenWindowsEvent());
        Window w = new NewUserWelcome();
        UI.getCurrent().addWindow(w);
        w.focus();
    }
}
