package drafty.components;

import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.OptionGroup;
import com.vaadin.ui.TextField;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;

public class SurveyComponent extends Window {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 123434026070156300L;
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window(" Brown University - HCI Research System");
	VerticalLayout welcomeModal = new VerticalLayout();
	
	Label label_suggestions = new Label();
	Label label_hr = new Label("<hr />", ContentMode.HTML);
	Label label_footer = new Label("", ContentMode.HTML);
	OptionGroup suggestions_optiongroup = new OptionGroup();
	TextField suggestion_textbox = new TextField();
	Button submitSuggestion_button = new Button("Submit Suggestion");
	Button closeExperiment_button = new Button("I do not want to help");
	
	public SurveyComponent() {
		
	}
}
