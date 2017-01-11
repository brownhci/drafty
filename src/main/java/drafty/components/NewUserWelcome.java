package drafty.components;

import com.vaadin.server.FontAwesome;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.Label;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;

import drafty._MainUI;
import drafty.models.Mode;

public class NewUserWelcome extends Window {
	
		/**
	 * 
	 */
	private static final long serialVersionUID = 123787026070156372L;
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window(" Brown University - HCI Research System");
	VerticalLayout welcomeModal = new VerticalLayout();
	
	Label body = new Label();
	Button proceed = new Button("Proceed to Drafty");
	
	public NewUserWelcome() {
		sub.setImmediate(true);
		sub.addCloseListener(e -> closeListener(e));

		
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
				+ "<i>All interactions are captured and used anonymously for studies.</i> "
				+ "<h3 style='display: block; text-align: center;'><b><span class=\"v-icon FontAwesome\"></span> To fix a piece of data double-click on a cell.</b></h3>";
		
		body = new Label(caption, ContentMode.HTML);
		body.setCaptionAsHtml(true);
		body.setWidth("100%");
		//body.setCaption(caption);
		
		String footer = 
				"<hr><i><span style='color: rgb(153, 153, 153); display: block; text-align: center;'>"
				+ "Brown University - Computer Science - Human Computer Interaction Research Group"
				+ "</span></i><hr>";
		Label label_footer = new Label(footer, ContentMode.HTML);
		
		proceed.setWidth("100%");
		proceed.setIcon(FontAwesome.THUMBS_O_UP);
		proceed.addClickListener(e -> proceedClick(e));
		
		welcomeModal.addComponents(body, label_footer, proceed);
		
		sub.setContent(welcomeModal);
		sub.setModal(true);
	}

	private void proceedClick(ClickEvent e) {
		sub.close();
	}

	private void closeListener(CloseEvent e) {
		_MainUI.getApi().getActiveMode().setActiveMode(Mode.NORMAL);
	}
}
