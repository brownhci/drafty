package drafty.components;

import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.OptionGroup;
import com.vaadin.ui.TextField;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;

public class UserStudyComponent extends Window {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 123434026070156300L;
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window(" Brown University - HCI Research System");
	VerticalLayout surveyModal = new VerticalLayout();
	
	Label label_suggestions = new Label();
	Label label_hr = new Label("<hr />", ContentMode.HTML);
	Label label_footer = new Label("", ContentMode.HTML);
	
	Button proceedButton = new Button("Proceed");
	
	TextField firstName = new TextField();
	TextField lastName = new TextField();
	TextField email = new TextField();
	TextField age = new TextField();
	
	TextField task1 = new TextField();
	TextField task2 = new TextField();
	TextField task3 = new TextField();

	OptionGroup occupation = new OptionGroup();
	OptionGroup subfieldPrimary = new OptionGroup();
	OptionGroup subfield2nd = new OptionGroup();
	OptionGroup subfield3rd = new OptionGroup();
	
	
	public UserStudyComponent() {
		
	}
}
