package drafty.components;

import com.vaadin.server.FontAwesome;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Label;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;

import drafty._MainUI;
import drafty.models.Mode;

public class MaintenanceWindow extends Window {
	/**
	 * 
	 */
	private static final long serialVersionUID = 123787026070156372L;
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window(" Brown University - HCI Research System");
	VerticalLayout welcomeModal = new VerticalLayout();
	
	Label body = new Label();
	
	public MaintenanceWindow() {
		sub.setImmediate(true);
		
		sub.setWidth("680px");
		sub.setIcon(FontAwesome.UNIVERSITY);
		_MainUI.getApi().getActiveMode().setActiveMode(Mode.MENU); 
		
		createUI();
		
		UI.getCurrent().addWindow(sub);
		UI.getCurrent().setFocusedComponent(sub);
	}
	
	private void createUI() {
		welcomeModal.setMargin(true);
		welcomeModal.setSpacing(true);
		
		String caption = 
				"<h2>Welcome to Drafty</h2>"
				+ "Drafty is a crowdsourced dataset of over 3600 Computer Science Professors from Top US and Canadian Schools. "
				+ "<h3 style='display: block; text-align: center;'><b><span class=\"v-icon FontAwesome\"></span> The system is down for maintenance. It will be back Feb 28th.<br> Thank you for your patience!</b></h3>";
		
		body = new Label(caption, ContentMode.HTML);
		body.setCaptionAsHtml(true);
		body.setWidth("100%");
		//body.setCaption(caption);
		
		String footer = 
				"<hr><i><span style='color: rgb(153, 153, 153); display: block; text-align: center;'>"
				+ "Brown University - Computer Science - Human Computer Interaction Research Group"
				+ "</span></i><hr>";
		Label label_footer = new Label(footer, ContentMode.HTML);
		
		welcomeModal.addComponents(body, label_footer);
		
		sub.setContent(welcomeModal);
		sub.setModal(true);
	}
}
