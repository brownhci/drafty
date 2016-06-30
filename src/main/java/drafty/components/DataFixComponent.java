package drafty.components;

import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.util.List;

import com.vaadin.server.FontAwesome;
import com.vaadin.server.Page;
import com.vaadin.shared.ui.combobox.FilteringMode;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Button;
import com.vaadin.ui.ComboBox;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.CustomComponent;
import com.vaadin.ui.Label;
import com.vaadin.ui.Notification;
import com.vaadin.ui.Panel;
import com.vaadin.ui.TextField;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;

import drafty._MainUI;

public class DataFixComponent extends CustomComponent {

	/**
	 * 
	 */
	private static final long serialVersionUID = -126568947099417574L;
	
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window("ADMIN Data Fix");
	VerticalLayout suggestionModal = new VerticalLayout();
	CssLayout panelWrap = new CssLayout();
	Panel resultsPanel = new Panel();
	VerticalLayout resultsPanelLayout = new VerticalLayout();
	
	private String person_id = _MainUI.getApi().getCellSelection().getPerson_id();
	private String origSuggestion = _MainUI.getApi().getCellSelection().getOrigSuggestion();
	private String idSuggestion = _MainUI.getApi().getCellSelection().getOrigSuggestionId();
	private String person_name = _MainUI.getApi().getCellSelection().getPerson_name();
	private String suggestionType  = _MainUI.getApi().getCellSelection().getOrigSuggestionTypeId();
	
	Label label_suggestions = new Label("<h3 style=\"margin-top: 0px; line-height: 25px;\">Fix suggestion for "  + person_name + "'s " + suggestionType + ":</h3>", ContentMode.HTML);
	Label label_hr = new Label("<hr />", ContentMode.HTML);
	Label label_hr2 = new Label("<hr />", ContentMode.HTML);
	Label label_hr3 = new Label("<hr />", ContentMode.HTML);
	TextField suggestion_textbox = new TextField();
	Button submitSuggestion = new Button("Submit Fix", e -> submitSuggestion());
	
	Label label_dup_del = new Label("<h3 style=\"margin-bottom: -20px; line-height: 25px;\">Duplicate Row/Professor Fix: </h3>", ContentMode.HTML);
	ComboBox professors = new ComboBox("",_MainUI.getApi().getAllActiveProfessors());
	Button submitDuplicate = new Button("Convert Duplicate", e -> submitDuplicate());
	Button submitDeactivate = new Button("Deactivate Person", e -> submitDeactivate());
	
	private ComboBox universities = new ComboBox();
	private ComboBox subfields = new ComboBox();
	private ComboBox rank = new ComboBox();
	
	private String newSuggestion;
	
	public DataFixComponent() {
		System.out.println("DF: idSuggestion = " + idSuggestion + " - " + origSuggestion);
		
		
		
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
	    
		label_suggestions.addStyleName("padding-top-none");
	    submitSuggestion.setIcon(FontAwesome.FLOPPY_O);
	    submitSuggestion.setWidth("100%");
	    
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
	    	rank.setNullSelectionAllowed(false);
	    	rank.setValue(_MainUI.getApi().getCellSelection().getOrigSuggestion());
	    	suggestionModal.addComponent(rank);
	    	rank.setWidth("100%");
	    } else if (suggestionType.equals("University")) {
	    	List<String> unis;
    		unis = _MainUI.getApi().getUniversitiesUSACan();
	    	universities.addItems(unis);
	    	suggestionModal.addComponent(universities);
	    	universities.setWidth("100%");
	    	universities.setFilteringMode(FilteringMode.CONTAINS);
	    	universities.setPageLength(unis.size());
	    } else {
	    	suggestion_textbox.setValue(origSuggestion);
	    	suggestion_textbox.setWidth("100%");
	    	suggestionModal.addComponent(suggestion_textbox);
	    }
	    
	    suggestionModal.addComponents(submitSuggestion);
	    suggestionModal.setComponentAlignment(submitSuggestion, Alignment.MIDDLE_RIGHT);
	    
	    //
	    submitDuplicate.setIcon(FontAwesome.REFRESH);
	    submitDuplicate.setWidth("100%");
		submitDuplicate.setResponsive(true);
		professors.setWidth("100%");
		professors.setInputPrompt("Select Actual Professor");
		professors.setFilteringMode(FilteringMode.CONTAINS);
		professors.setNullSelectionAllowed(false);
		//professors.addStyleName("margin-top-normal");
		suggestionModal.addComponents(label_hr3, label_dup_del, professors, submitDuplicate);
	    suggestionModal.setComponentAlignment(submitDuplicate, Alignment.MIDDLE_RIGHT);
	    
	    //
		submitDeactivate.setIcon(FontAwesome.BOMB);
		submitDeactivate.setWidth("100%");
		submitDeactivate.setResponsive(true);
		submitDeactivate.addStyleName("button-gray");
		suggestionModal.addComponents(label_hr2, submitDeactivate);
	    suggestionModal.setComponentAlignment(submitDeactivate, Alignment.MIDDLE_RIGHT);
	    
	    
	    //
	    sub.setContent(suggestionModal);
		sub.setModal(true);
	}

	private void submitSuggestion() {
		boolean success = false;
		
		if (suggestionType.equals("Subfield")) {
	    	newSuggestion = subfields.getValue().toString();
	    } else if (suggestionType.equals("Rank")) {
	    	if(rank.getValue().toString() == null) {
	    		newSuggestion = "";
	    	} else {
		    	newSuggestion = rank.getValue().toString();
	    	}
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
			
			System.out.println("submitSuggestion(): " + idSuggestion + " - " + newSuggestion);
			
			stmt.executeUpdate();
			
			System.out.println("submitSuggestion(): DONE");
			
			stmt.getConnection().close();
			stmt.close();
			success = true;
			
		} catch (SQLException e) {
			System.out.println("ERROR DataFixComponent submitSuggestion(): " + e);
		}
		
		if(success) {
			//close modal window
			sub.close();
			
			Notification notify = new Notification("Success", "You have helped save the world.");
			notify.setDelayMsec(1000);
			notify.setIcon(FontAwesome.THUMBS_UP);
			notify.show(Page.getCurrent());
		} else {
			Notification notify = new Notification("Oops!  There appears to be an error.", "We, possibly you, will be at work fixing it! ");
			notify.setDelayMsec(1000);
			notify.setIcon(FontAwesome.FROWN_O);
			notify.setStyleName("error");
			notify.show(Page.getCurrent());
		}
	}
	
	private void submitDeactivate() {
		boolean success = false;
		
		try {
			String sql =
					"UPDATE Person "
					+ "SET status = ? "
					+ "WHERE idPerson = ?";
			PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
			
			stmt.setString(1, "0");
			stmt.setString(2, _MainUI.getApi().getCellSelection().getPerson_id());
			
			stmt.executeUpdate();
			
			stmt.getConnection().close();
			stmt.close();
			success = true;
			
		} catch (SQLException e) {
			System.out.println("ERROR DataFixComponent submitDeactivate(): " + e);
		}
		
		if(success) {
			//close modal window
			sub.close();
			
			Notification notify = new Notification("Success", "The selected professor has been updated in the system.");
			notify.setDelayMsec(1000);
			notify.setIcon(FontAwesome.THUMBS_UP);
			notify.show(Page.getCurrent());
		} else {
			Notification notify = new Notification("Oops!  There appears to be an error.", "We, possibly you, will be at work fixing it! ");
			notify.setDelayMsec(1000);
			notify.setIcon(FontAwesome.FROWN_O);
			notify.setStyleName("error");
			notify.show(Page.getCurrent());
		}
	}
	
	private void submitDuplicate() {
		
		String idProfessorNew = _MainUI.getApi().getIdProfessor(professors.getValue().toString());
		
		try {
			String sql =
					"UPDATE Suggestion "
					+ "SET idPerson = ? "
					+ "WHERE idPerson = ?";
			PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);
			
			stmt.setString(1, idProfessorNew);
			stmt.setString(2, _MainUI.getApi().getCellSelection().getPerson_id());
			
			stmt.executeUpdate();
			
			stmt.getConnection().close();
			stmt.close();
			
			//Deactivate old user
			submitDeactivate();
			
		} catch (SQLException e) {
			System.out.println("ERROR DataFixComponent submitDeactivate(): " + e);
		}
	}
}
