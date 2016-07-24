package drafty.components;

import java.sql.PreparedStatement;
import java.sql.SQLException;

import com.vaadin.server.FontAwesome;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Button;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.Notification;
import com.vaadin.ui.Panel;
import com.vaadin.ui.TextField;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;
import com.vaadin.ui.Window.CloseEvent;

import drafty._MainUI;
import drafty.models.Mode;

public class NameEditComponent {
String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window("Edit Name");
	VerticalLayout suggestionModal = new VerticalLayout();
	CssLayout panelWrap = new CssLayout();
	Panel resultsPanel = new Panel();
	VerticalLayout resultsPanelLayout = new VerticalLayout();
	
	private String person_id = _MainUI.getApi().getCellSelection().getPerson_id();
	private String origSuggestion = _MainUI.getApi().getCellSelection().getOrigSuggestion();
	private String idSuggestion = _MainUI.getApi().getCellSelection().getOrigSuggestionId();
	private String person_name = _MainUI.getApi().getCellSelection().getPerson_name();
	private String suggestionType  = _MainUI.getApi().getCellSelection().getOrigSuggestionTypeId();
	
	Label label_suggestions = new Label();
	Label label_hr = new Label("<hr />", ContentMode.HTML);
	TextField new_name_textbox = new TextField();
	Button submitSuggestion_button = new Button("Submit Edit");
	
	private String newSuggestion;
	
	public NameEditComponent() {
		
		//Create UI
		createUI();
		
		sub.addCloseListener(e -> closeListener(e));
		
		if (sub.getWidth() < 390) {
			sub.setWidth("420px");
		}
		UI.getCurrent().addWindow(sub);
	}

	private void closeListener(CloseEvent e) {
		_MainUI.getApi().getActiveMode().setActiveMode(Mode.NORMAL);
	}
	
	private void createUI() {
		suggestionModal.setMargin(true);
		suggestionModal.setSpacing(true);
	    
		label_suggestions = new Label(
				"<h3 style=\"margin-top: 0px; line-height: 25px;\">Make an edit to <br>"  
				+ person_name + "'s full name.</h3>", ContentMode.HTML);
		label_suggestions.addStyleName("padding-top-none");
	    submitSuggestion_button.setIcon(FontAwesome.FLOPPY_O);
	    submitSuggestion_button.setWidth("100%");
		submitSuggestion_button.addClickListener(e -> submitSuggestion());
	    
	    suggestionModal.addComponents(label_suggestions);
	    
	    new_name_textbox.setValue(origSuggestion);
	    new_name_textbox.setWidth("100%");
	    suggestionModal.addComponent(new_name_textbox);
	 
	    
	    suggestionModal.addComponents(label_hr, submitSuggestion_button);
	    suggestionModal.setComponentAlignment(submitSuggestion_button, Alignment.MIDDLE_RIGHT);
	    
		sub.setContent(suggestionModal);
		sub.setModal(true);
	}

	private void submitSuggestion() {
		newSuggestion = new_name_textbox.getValue().toString();
		boolean success = false;
		
		try {
			String sql =
					"INSERT INTO PersonNameChange (idPersonNameChange, idPerson, old, new, dateChange) "
					+ "VALUES (NULL, ?, ?, ?, CURRENT_TIMESTAMP)";
			PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
			
			stmt.setString(1, person_id);
			stmt.setString(2, origSuggestion);
			stmt.setString(3, newSuggestion);
			
			stmt.executeUpdate();
			
			stmt.getConnection().close();
			stmt.close();
			success = true;
		} catch (SQLException e) {
			System.out.println("ERROR NameComponent submitSuggestion() 2: " + e);
		}
		
		if(success) {
			try {
				String sql =
						"UPDATE Person "
						+ "SET name = ? "
						+ "WHERE idPerson = ?";
				PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
				
				stmt.setString(1, newSuggestion);
				stmt.setString(2, person_id);
				
				stmt.executeUpdate();
				
				stmt.getConnection().close();
				stmt.close();
				
			} catch (SQLException e) {
				System.out.println("ERROR NameComponent submitSuggestion() 1: " + e);
				success = false;
			}	
		}
		
		if(success) {
			Notification.show("Success!  Thank you.  Please refresh the page to see changes. :)");
			//close modal window
			sub.close();
		} else {
			Notification.show("Oops!  There appears to be an error. :(  We will be at work fixing it! ");
		}
	}
}
