package com.ajobs.newrow;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Set;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;

import com.ajobs.AjobsUI;
import com.ajobs.domain.SuggestionType;
import com.ajobs.event.DraftyEvent.CloseOpenWindowsEvent;
import com.ajobs.event.DraftyEvent.NewRowEvent;
import com.ajobs.event.DraftyEventBus;
import com.vaadin.annotations.PropertyId;
import com.vaadin.data.BeanValidationBinder;
import com.vaadin.data.validator.EmailValidator;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.server.Page;
import com.vaadin.server.Responsive;
import com.vaadin.shared.Position;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.shared.ui.MarginInfo;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Button;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.Button.ClickListener;
import com.vaadin.ui.CheckBox;
import com.vaadin.ui.ComboBox;
import com.vaadin.ui.Component;
import com.vaadin.ui.FormLayout;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.Notification;
import com.vaadin.ui.Notification.Type;
import com.vaadin.ui.RadioButtonGroup;
import com.vaadin.ui.TabSheet;
import com.vaadin.ui.TextField;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;
import com.vaadin.ui.themes.ValoTheme;

@SuppressWarnings("serial")
public class AjobsNewRowWindow extends Window {

    public static final String ID = "ajobsnewrowwindow";
    private NewRowService newRowService = new NewRowService();
    
    // Binder takes care of binding Vaadin fields defined as Java member
 	// fields in this class to properties in the Order bean
    private BeanValidationBinder<AjobsNewRow> binder;
    private AjobsNewRow newRow = new AjobsNewRow();
    private Map<Integer, String> newSuggs = new HashMap<Integer, String>();
    private Map<Integer, Integer> newSuggIds = new HashMap<Integer, Integer>();
    
	private Label msg = new Label();
	FormLayout details = new FormLayout();
    
	private List<String> requiredFields = new ArrayList<>();
	
    /*
     * Fields for editing the User object are defined here as class members.
     * They are later bound to a FieldGroup by calling
     * fieldGroup.bindMemberFields(this). The Fields' values don't need to be
     * explicitly set, calling fieldGroup.setItemDataSource(user) synchronizes
     * the fields with the user object.
     */
    @PropertyId("PrivateStatus")
    private ComboBox<String> PrivateStatus = new ComboBox<>("Your Status");
    @PropertyId("University")
    private ComboBox<String> University = new ComboBox<>("University");
    @PropertyId("Field")
    private ComboBox<String> Field = new ComboBox<>("Field");
    //@PropertyId("Classification")
    //private ComboBox<String> Classification = new ComboBox<>("Classification"); //no free text
    @PropertyId("Status")
    private RadioButtonGroup<String> Status = new RadioButtonGroup<>("Position Status");
    @PropertyId("Position_Type")
    private ComboBox<String> Position_Type = new ComboBox<>("Position Type"); //no free text
    @PropertyId("Subfield")
    private ComboBox<String> Subfield = new ComboBox<>("Subfield");
    @PropertyId("AdditionalInformation")
    private TextField AdditionalInformation = new TextField("Additional Information");

    @PropertyId("Deadline")   
    //private DateField Deadline = new DateField("Deadline");
    private TextField Deadline = new TextField("Deadline");
    @PropertyId("OpenDeadline")
    private CheckBox openUntilFilled = new CheckBox("Open until filled");
    
    @PropertyId("Link_to_Apply")
    private TextField Link_to_Apply = new TextField("Link to Apply");
    @PropertyId("SearchChair_Name")
    private TextField SearchChair_Name = new TextField("SearchChair Name");
    @PropertyId("SearchChair_Email")
    private TextField SearchChair_Email = new TextField("SearchChair Email");
    @PropertyId("Notes")
    private TextField Notes = new TextField("Your Notes");
	@PropertyId("WhoIsInterviewing")
    private TextField WhoIsInterviewing = new TextField("Who is Interviewing?");
	
	
    private AjobsNewRowWindow(String msg) {
		this.msg.setEnabled(false);
		if(msg.length() > 0) {
			this.msg.setValue(msg);
			this.msg.setEnabled(true);
		}
    		
        addStyleName("profile-window");
        setId(ID);
        Responsive.makeResponsive(this);

        setModal(true);
        setResizable(true);
        setClosable(true);
        setResponsive(true);
        setHeight((float) (Page.getCurrent().getBrowserWindowHeight() - 40.0), Unit.PIXELS);
        setHeight("100%");
        
        VerticalLayout content = new VerticalLayout();
        content.setSizeFull();
        content.setMargin(new MarginInfo(true, false, false, false));
        content.setSpacing(false);
        setContent(content);

        TabSheet tabs = new TabSheet();
        tabs.setSizeFull();
        tabs.addStyleName(ValoTheme.TABSHEET_PADDED_TABBAR);
        tabs.addStyleName(ValoTheme.TABSHEET_ICONS_ON_TOP);
        tabs.addStyleName(ValoTheme.TABSHEET_CENTERED_TABS);
        content.addComponent(tabs);
        content.setExpandRatio(tabs, 1f);

        tabs.addComponent(buildNewRowTab());
        //tabs.addComponent(buildDupRowCheckTab());
        //tabs.getTab(1).setEnabled(false);
        //tabs.setSelectedTab(0);

        content.addComponent(buildFooter());
        binder = new BeanValidationBinder<>(AjobsNewRow.class);
        
        binder.bind(University, AjobsNewRow::getUniversity, AjobsNewRow::setUniversity);
        binder.bind(Field, AjobsNewRow::getField, AjobsNewRow::setField);
        binder.bind(Subfield, AjobsNewRow::getSubfield, AjobsNewRow::setSubfield);
        binder.bind(AdditionalInformation, AjobsNewRow::getAdditionalInformation, AjobsNewRow::setAdditionalInformation);
        //binder.bind(Classification, AjobsNewRow::getClassification, AjobsNewRow::setClassification);
        binder.bind(Status, AjobsNewRow::getStatus, AjobsNewRow::setStatus);
        binder.bind(Position_Type, AjobsNewRow::getPostion_Type, AjobsNewRow::setPosition_Type);
        
        // SW - Only textfields work without creating way too much boiler code
        binder.bind(Deadline, AjobsNewRow::getDeadline, AjobsNewRow::setDeadline);
        binder.bind(Link_to_Apply, AjobsNewRow::getLink_to_Apply, AjobsNewRow::setLink_to_Apply);
        binder.bind(SearchChair_Name, AjobsNewRow::getSearchChair_Name, AjobsNewRow::setSearchChair_Name);
        binder.forField(SearchChair_Email) 
        		.withValidator(new EmailValidator("Please enter a valid email address"))
        		.bind(AjobsNewRow::getSearchChair_Email, AjobsNewRow::setSearchChair_Email);
        binder.bind(WhoIsInterviewing, AjobsNewRow::getWhoIsInterviewing, AjobsNewRow::setWhoIsInterviewing);
        binder.bind(Notes, AjobsNewRow::getNotes, AjobsNewRow::setNotes);
        //
        binder.setBean(newRow);
    }
    
    private Component buildDupRowCheckTab() {
        VerticalLayout root = new VerticalLayout();
        root.setCaption("Duplicate Row Check");
        root.setIcon(VaadinIcons.COGS);
        root.setSpacing(true);
        root.setMargin(true);
        root.setSizeFull();

        Label message = new Label("You look good to go :)");
        message.setSizeUndefined();
        message.addStyleName(ValoTheme.LABEL_LIGHT);
        root.addComponent(message);
        root.setComponentAlignment(message, Alignment.MIDDLE_CENTER);

        return root;
    }

    private Component buildNewRowTab() {
    	VerticalLayout rootVert = new VerticalLayout();
        HorizontalLayout rootHorz = new HorizontalLayout();
        rootHorz.setCaption("Add New Job");
        rootHorz.setIcon(VaadinIcons.FILE_ADD);
        rootHorz.setWidth(100.0f, Unit.PERCENTAGE);
        rootHorz.setMargin(true);
        rootHorz.addStyleName("profile-form");

        details.addStyleName(ValoTheme.FORMLAYOUT_LIGHT);
        rootHorz.addComponent(details);
        rootHorz.setExpandRatio(details, 1);
        
        University.setTextInputAllowed(true);
        
        msg.setWidth("100%");
		msg.setContentMode(ContentMode.HTML);
        
		if(msg.isEnabled()) {
			details.addComponent(msg);
		}	
		
        details.addComponents(
        	setComboBox(University, 1, true),
	        setComboBox(Field, 2, true),
			setComboBox(Subfield, 6, false),
			setTextField(AdditionalInformation, "Any additional info about job", false),
			setComboBox(Position_Type, 5, true),
			setRadioButtonGroup(Status, 4, true, false),
			setTextField(Deadline, "Month Day, Year; Open until Filled; etc...", true),
			setTextField(Link_to_Apply, "https://", true),
			//setComboBox(Classification, "Classification", false),
			setTextField(WhoIsInterviewing, "FirstName LastName, etc..", false),
			setTextField(SearchChair_Name, "", false),
			setTextField(SearchChair_Email, "", false)
		);
		
        
        Label personalMsg = new Label();
        personalMsg.setCaptionAsHtml(true);
        personalMsg.setCaption(
        		"<i>* The information entered for \"Your Status\" and \"Your Notes\" will only be visible to you when you log-in. <br> "
        		+ "These fields will allow to track your current status with a position and/or any notes you want to make. <i>"
        				);
        
        PrivateStatus = setComboBox(PrivateStatus, 14, true); //Private_Status = SuggestionType name
        Notes = setTextField(Notes, "Your private notes...", false);
        if(AjobsUI.getApi().getProfileSession().isLoggedIn()) {
			details.addComponents(PrivateStatus, Notes);
			PrivateStatus.setSelectedItem("Not Applicable");
    	}
        
        rootVert.addComponents(rootHorz, personalMsg);
        
        return rootHorz;
    }
    
    private ComboBox<String> setComboBox(ComboBox<String> comp, Integer idSuggestionType, boolean required) {
    	SuggestionType suggType = AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType);
    	
		Set<String> values = AjobsUI.getApiNew().getIdSuggestionType_Values().get(idSuggestionType);
		List<String> sortedValues = new ArrayList<String>(values);
		Collections.sort(sortedValues);
		comp.setItems(sortedValues);
		
		comp.setWidth("100%");
		comp.setResponsive(true);
		
		if(suggType.getMakesRowUnique()) { required = true; } // sw - fail safe
		
		if(required) {
			comp.setRequiredIndicatorVisible(true);
			requiredFields.add(comp.getCaption());
		}
		
		comp.setEmptySelectionAllowed(suggType.getCanBeBlank());
		
		if(suggType.allowNew()) {
			comp.setNewItemHandler(inputString -> {
    			Set<String> vals = AjobsUI.getApiNew().getIdSuggestionType_Values().get(idSuggestionType);
    			vals.add(inputString);
    			comp.setItems(vals);
    			comp.setSelectedItem(inputString);
    		});
		}
		
		comp.setValue("");
		
		return comp;
    }
    

    private RadioButtonGroup<String> setRadioButtonGroup(RadioButtonGroup<String> comp, Integer idSuggestionType, boolean required, boolean horizontal) {
    	SuggestionType suggType = AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType);
    	
    	comp.setItems(AjobsUI.getApiNew().getIdSuggestionType_Values().get(idSuggestionType));
		
    	/*
    	if(suggType.getIdSuggestionType().equals(4)) {
    		comp.setSelectedItem("Open");
    	}
    	*/
    	
		comp.setWidth("100%");
		comp.setResponsive(true);
		if(suggType.getMakesRowUnique()) { required = true; } // sw - fail safe
		if(required) {
			comp.setRequiredIndicatorVisible(true);
			requiredFields.add(comp.getCaption());
		}
		if(horizontal) {
			comp.addStyleName(ValoTheme.OPTIONGROUP_HORIZONTAL);
		}
		return comp;
    }
    
    private TextField setTextField(TextField comp, String placeholder, boolean required) {
		comp.setWidth("100%");
		comp.setResponsive(true);
		comp.setPlaceholder(placeholder);
		if(required) {
			comp.setRequiredIndicatorVisible(true);
			requiredFields.add(comp.getCaption());
		}
		return comp;
    }
    
    private Component buildFooter() {
        HorizontalLayout footer = new HorizontalLayout();
        footer.addStyleName(ValoTheme.WINDOW_BOTTOM_TOOLBAR);
        footer.setWidth(100.0f, Unit.PERCENTAGE);
        footer.setSpacing(false);

        Button submit = new Button("Submit New Job");
        submit.setIcon(VaadinIcons.PLUS_SQUARE_LEFT_O);
        //submit.addStyleName(ValoTheme.BUTTON_PRIMARY);
        submit.addClickListener(new ClickListener() {
            @Override
            public void buttonClick(ClickEvent event) {
            		String errorMsg = "";
            		
            		if(University.isEmpty()) {
        	    		errorMsg += "University cannot be empty.<br>";
        	    	}
	        		if(Field.isEmpty()) {
        	    		errorMsg += "Field cannot be empty.<br>";
        	    	}
	        		if(Status.isEmpty()) {
        	    		errorMsg += "Status cannot be empty.<br>";
        	    	}
	        		if(Position_Type.isEmpty()) {
        	    		errorMsg += "Position Type cannot be empty.<br>";
        	    	}
	        		if(Deadline.isEmpty() && (openUntilFilled.getValue() == false) ) {
        	    		errorMsg += "Deadline cannot be empty.<br>";
        	    	}
	        		if(Link_to_Apply.isEmpty()) {
        	    		errorMsg += "Link to Apply cannot be empty.<br>";
        	    	}
	        		if(!SearchChair_Email.isEmpty() && !SearchChair_Email.getValue().contains("@")) {
	        			errorMsg += "SearchChair Email must be a valid email.";
	        		}
	        		if(AjobsUI.getApi().getProfileSession().isLoggedIn() && PrivateStatus.isEmpty()) {
	        			errorMsg += "Your status cannot be empty.";
	            	}
            		
	        		if(errorMsg.length() > 0) {
	        			Notification notification = new Notification("Oh no, there was an Error :( <br> Please try again. ", Type.ERROR_MESSAGE);
	        			notification.setDescription(errorMsg);
		        	    notification.setHtmlContentAllowed(true);
		        	    notification.setPosition(Position.BOTTOM_CENTER);
		        	    notification.show(Page.getCurrent());
            		} else {
            			try {
                    		//binder.validate();
                    		//binder.writeBean(newRow);
                        
            				newRow.setUniversity(University.getValue().toString());
            				
            				Integer idUniqueID = addNewRow();
            				if(idUniqueID > -1) {
                				DraftyEventBus.post(new NewRowEvent(newSuggs, newSuggIds, idUniqueID));
                				close();
            				} else {
            					AjobsUI.getApi().dbErrorMessage();
            				}
            				
                    } catch (Exception e) {
                        	AjobsUI.getApiNew().logError(e);
                    }
            	}
            }
        });
        submit.focus();
        footer.addComponent(submit);
        footer.setComponentAlignment(submit, Alignment.TOP_RIGHT);
        return footer;
    }
    
    private Integer addNewRow() {
		Integer idUniqueID = -1;
		try (Connection conn = ((DataSource) new InitialContext().lookup(AjobsUI.getApi().getJNDI())).getConnection();
			 PreparedStatement stmtIntD = conn.prepareStatement("INSERT INTO Interaction (idInteraction, idSession, idInteractionType) VALUES (null, ?, ?)", Statement.RETURN_GENERATED_KEYS);
			 PreparedStatement stmtID = conn.prepareStatement("INSERT INTO UniqueId (idUniqueID) VALUES (NULL)", Statement.RETURN_GENERATED_KEYS);
			 PreparedStatement stmtS = conn.prepareStatement("INSERT INTO Suggestions "
			 												+ "(idSuggestion, idSuggestionType, idUniqueID, suggestion, confidence, idProfile) "
			 												+ "VALUES (NULL, ?, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS);
			 PreparedStatement stmtEdit = conn.prepareStatement("INSERT INTO Edit (idInteraction, idSuggestion, idEntryType, chosen, new) VALUES (?, ?, ?, 1, 1);");
			 PreparedStatement stmtNewSuggs = conn.prepareStatement("SELECT * FROM Suggestions WHERE idUniqueID = ?;")
		) {
			// Autocommit is true by default,
			// so setting it to false as we are manually committing later
			conn.setAutoCommit(false);
			stmtID.executeUpdate();
			ResultSet rsID = stmtID.getGeneratedKeys();
			while (rsID.next()) { idUniqueID = rsID.getInt(1); }
			
			/////////////////////////////////////////////////
			
			stmtIntD.setInt(1, AjobsUI.getApi().getProfileSession().getIdSession());
	        stmtIntD.setInt(2, 5); //newRecord idInteractionType = 5
			stmtIntD.executeUpdate();
			
			/////////////////////////////////////////////////
			
			newSuggs = new HashMap<Integer, String>();
			newSuggIds = new HashMap<Integer, Integer>();
			
			setSuggestions(1, University.getValue());
			setSuggestions(2, Field.getValue());
			setSuggestions(3, ""); //newSuggs.put(3, Classification.getValue().trim()); //idSuggestionType, suggested value
			setSuggestions(4, Status.getValue());
			setSuggestions(5, Position_Type.getValue());
			setSuggestions(6, Subfield.getValue());
			setSuggestions(15, AdditionalInformation.getValue());
			setSuggestions(7, Deadline.getValue().toString());
			setSuggestions(8, Link_to_Apply.getValue());
			setSuggestions(9, SearchChair_Name.getValue());
			setSuggestions(10, SearchChair_Email.getValue());
			setSuggestions(11, Notes.getValue());
			setSuggestions(12, WhoIsInterviewing.getValue());
			setSuggestions(13, AjobsUI.getApi().getProfileSession().getIdProfile().toString());
			setSuggestions(14, PrivateStatus.getValue()); 
			
			//Prevents NullPointers on PageReload
			if(AjobsUI.getApi().isStringNull(Notes.getValue())) {
				newSuggs.put(11, ""); 
			}
			
			for(Entry<Integer, String> e : newSuggs.entrySet() ) {
				Integer idSuggestionType = e.getKey();
				System.out.println(idSuggestionType + " " + e.getValue());
				
				int confidence = 0;
				String newSuggestion = e.getValue();
				if(e.getValue() != null && !e.getValue().isEmpty()) {
					confidence = 10;
				} else {
					newSuggestion = "";
				}
				
				stmtS.setInt(1, idSuggestionType); 	//idSuggestionType
    			stmtS.setInt(2, idUniqueID);	    //idUniqueID
    			stmtS.setString(3, newSuggestion);
    			stmtS.setInt(4, confidence);
    			stmtS.setInt(5, AjobsUI.getApi().getProfileSession().getIdProfile());
    			
    			stmtS.executeUpdate();
    			
    			ResultSet rsS = stmtS.getGeneratedKeys();
    			while (rsS.next()) {
    				Integer idSuggestion = rsS.getInt(1);
    				
    				stmtEdit.setInt(1, idUniqueID); //idInteraction
    				stmtEdit.setInt(2, idSuggestion); //idSuggestion
    				stmtEdit.setInt(3, 1); //idEntryType - new row
    				stmtEdit.addBatch();
    				
    				newSuggIds.put(idSuggestionType, idSuggestion);
    			}
			}
			
			stmtEdit.executeBatch();
			
			/////////////////////////////////////////////////

			conn.commit();
			conn.setAutoCommit(true);
		} catch (SQLException | NamingException e) {
			AjobsUI.getApi().logError(e);
	        AjobsUI.getApi().deleteFromDB("uniqueid", "idUniqueID", idUniqueID.toString());
	        idUniqueID = -1;
	    }
		
		return idUniqueID;
    }
    
    private void setSuggestions(Integer idSuggestion, String val) {
    	String suggestion = "";
    	if(!AjobsUI.getApiNew().isStringNull(val)) {
    		suggestion = val.trim();
    	}
    	newSuggs.put(idSuggestion, suggestion);
    }
    
    public static void open(String msg) {
        DraftyEventBus.post(new CloseOpenWindowsEvent());
        Window w = new AjobsNewRowWindow(msg);
        UI.getCurrent().addWindow(w);
        w.focus();
    }
}
