package drafty.widgets;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

import com.vaadin.server.FontAwesome;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Button;
import com.vaadin.ui.ComboBox;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.CustomComponent;
import com.vaadin.ui.Label;
import com.vaadin.ui.Panel;
import com.vaadin.ui.TextField;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;

import drafty.views._MainUI;

public class DataFixComponent extends CustomComponent {

	/**
	 * 
	 */
	private static final long serialVersionUID = -126568947099417574L;
	
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window("Suggestion");
	VerticalLayout suggestionModal = new VerticalLayout();
	CssLayout panelWrap = new CssLayout();
	Panel resultsPanel = new Panel();
	VerticalLayout resultsPanelLayout = new VerticalLayout();
	
	private String person_id;
	private String origSuggestion;
	private String idSuggestion;
	private String person_name;
	private String suggestionType;
	
	Label label_suggestions = new Label();
	Label label_hr = new Label("<hr />", ContentMode.HTML);
	TextField suggestion_textbox = new TextField();
	Button submitSuggestion_button = new Button("Submit Suggestion");
	private ComboBox universities = new ComboBox();
	private ComboBox subfields = new ComboBox();
	private ComboBox rank = new ComboBox();
	
	private String newSuggestion;
	
	public DataFixComponent(String person_id, String name, String value, String suggestion_id, String column) {
		this.person_id = person_id;
		this.person_name = name;
		this.origSuggestion = value;
		this.idSuggestion = suggestion_id;
		this.suggestionType = column;
		
		//Create UI
		createUI();
		
		if (sub.getWidth() < 390) {
			sub.setWidth("420px");
		}
		UI.getCurrent().addWindow(sub);
	}

	private void createUI() {
		suggestionModal.setMargin(true);
		suggestionModal.setSpacing(true);
	    
		label_suggestions = new Label(
				"<h3 style=\"margin-top: 0px; line-height: 25px;\">Fix suggestion for <br>"  
				+ person_name + "'s " + suggestionType + ".</h3>", ContentMode.HTML);
		label_suggestions.addStyleName("padding-top-none");
	    submitSuggestion_button.setIcon(FontAwesome.FLOPPY_O);
	    submitSuggestion_button.setWidth("100%");
		submitSuggestion_button.addClickListener(e -> submitSuggestion());
	    
	    suggestionModal.addComponents(label_suggestions);
	    
	    if (suggestionType.equals("Subfield")) {
	    	List<String> fieldlist = _MainUI.getApi().getSubfields();
	    	subfields.addItems(fieldlist);
	    	suggestionModal.addComponent(subfields);
	    	subfields.setWidth("100%");
	    	subfields.setPageLength(fieldlist.size());
	    } else if (suggestionType.equals("Rank")) {
	    	rank.addItem("Full");
	    	rank.addItem("Associate");
	    	rank.addItem("Assistant");
	    	suggestionModal.addComponent(rank);
	    	rank.setWidth("100%");
	    } else if (suggestionType.equals("University")) {
	    	List<String> unis;
    		unis = _MainUI.getApi().getUniversitiesUSACan();
	    	universities.addItems(unis);
	    	suggestionModal.addComponent(universities);
	    	universities.setWidth("100%");
	    	universities.setPageLength(unis.size());
	    } else {
	    	suggestion_textbox.setValue(origSuggestion);
	    	suggestion_textbox.setWidth("100%");
	    	suggestionModal.addComponent(suggestion_textbox);
	    }
	    
	    suggestionModal.addComponents(label_hr, submitSuggestion_button);
	    suggestionModal.setComponentAlignment(submitSuggestion_button, Alignment.MIDDLE_RIGHT);
	    
		sub.setContent(suggestionModal);
		sub.setModal(true);
	}

	private void submitSuggestion() {
		if (suggestionType.equals("Subfield")) {
	    	newSuggestion = subfields.getValue().toString();
	    } else if (suggestionType.equals("Rank")) {
	    	newSuggestion = rank.getValue().toString();
	    } else if (suggestionType.equals("University")) {
	    	newSuggestion = universities.getValue().toString();
	    } else {
	    	newSuggestion = suggestion_textbox.getValue().toString();
	    }
		
		try {
			String sql =
					"UPDATE Suggestion "
					+ "SET suggestion = ? "
					+ "WHERE idSuggestion = ?";
			PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
			
			stmt.setString(1, newSuggestion);
			stmt.setString(2, idSuggestion);
			
			stmt.executeUpdate();
			
			stmt.getConnection().close();
			stmt.close();
			
		} catch (SQLException e) {
			System.out.println("ERROR DataFixComponent submitSuggestion(): " + e);
		}
	}
}
