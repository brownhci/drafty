package com.ajobs.newrow;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.time.LocalDate;
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
public class ProfsNewRowWindow extends Window {
	
	// Binder takes care of binding Vaadin fields defined as Java member
 	// fields in this class to properties in the Order bean
    private BeanValidationBinder<ProfsNewRow> binder;
    private ProfsNewRow newRow = new ProfsNewRow();
    private Map<Integer, String> newSuggs = new HashMap<Integer, String>();
    private Map<Integer, Integer> newSuggIds = new HashMap<Integer, Integer>();
    
	private Label msg = new Label();
	private FormLayout details = new FormLayout();
    
	private List<String> requiredFields = new ArrayList<>();
	
	@PropertyId("FullName")   
    private TextField FullName = new TextField("Full Name");
	@PropertyId("University")
    private ComboBox<String> University = new ComboBox<>("University");
	
	@PropertyId("JoinYear")
    private TextField JoinYear = new TextField("Join Year");
	@PropertyId("Rank")
    private ComboBox<String> Rank = new ComboBox<>("Rank");
	@PropertyId("Subfield")
    private ComboBox<String> Subfield = new ComboBox<>("Subfield");
	
	@PropertyId("Bachelors")
    private ComboBox<String> Bachelors = new ComboBox<>("Bachelors");
	@PropertyId("Masters")
    private ComboBox<String> Masters = new ComboBox<>("Masters");
	@PropertyId("Doctorate")
    private ComboBox<String> Doctorate = new ComboBox<>("Doctorate");
	@PropertyId("PostDoc")
    private ComboBox<String> PostDoc = new ComboBox<>("PostDoc");
	
	@PropertyId("Gender")
    private RadioButtonGroup<String> Gender = new RadioButtonGroup<>("Gender");
	
	@PropertyId("PhotoUrl")
    private TextField PhotoUrl = new TextField("PhotoUrl");
	@PropertyId("Sources")
    private TextField Sources = new TextField("Sources");
	
	
	private ProfsNewRowWindow(String msg) {
		this.msg.setEnabled(false);
		if(msg.length() > 0) {
			this.msg.setValue(msg);
			this.msg.setEnabled(true);
		}
    		
        addStyleName("profile-window");
        Responsive.makeResponsive(this);

        setModal(true);
        setResizable(true);
        setClosable(true);
        setHeight(100.0f, Unit.PERCENTAGE);

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
        binder = new BeanValidationBinder<>(ProfsNewRow.class);
		
        binder.bind(FullName, ProfsNewRow::getFullName, ProfsNewRow::setFullName);
        binder.bind(University, ProfsNewRow::getUniversity, ProfsNewRow::setUniversity);
        binder.bind(JoinYear, ProfsNewRow::getJoinYear, ProfsNewRow::setJoinYear);
        binder.bind(Rank, ProfsNewRow::getRank, ProfsNewRow::setRank);
        binder.bind(Subfield, ProfsNewRow::getSubfield, ProfsNewRow::setSubfield);
        binder.bind(Bachelors, ProfsNewRow::getBachelors, ProfsNewRow::setBachelors);
        binder.bind(Masters, ProfsNewRow::getMasters, ProfsNewRow::setMasters);
        binder.bind(Doctorate, ProfsNewRow::getDoctorate, ProfsNewRow::setDoctorate);
        binder.bind(PostDoc, ProfsNewRow::getPostDoc, ProfsNewRow::setPostDoc);
        binder.bind(Gender, ProfsNewRow::getGender, ProfsNewRow::setGender);
        binder.bind(PhotoUrl, ProfsNewRow::getPhotoUrl, ProfsNewRow::setPhotoUrl);
        binder.bind(Sources, ProfsNewRow::getSources, ProfsNewRow::setSources);
        
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
        HorizontalLayout root = new HorizontalLayout();
        root.setCaption("Add New Row");
        root.setIcon(VaadinIcons.FILE_ADD);
        root.setWidth(100.0f, Unit.PERCENTAGE);
        root.setMargin(true);
        root.addStyleName("profile-form");

        details.addStyleName(ValoTheme.FORMLAYOUT_LIGHT);
        root.addComponent(details);
        root.setExpandRatio(details, 1);
        
        University.setTextInputAllowed(true);
        
        msg.setWidth("100%");
		msg.setContentMode(ContentMode.HTML);
        
		if(msg.isEnabled()) {
			details.addComponent(msg);
		}	
		
        details.addComponents(
        	setTextField(FullName, "Professor's Full Name", true),
        	setComboBox(University, 2, true),
        	setTextField(JoinYear, "4-digit year", false),
        	setComboBox(Rank, 8, true),
        	setComboBox(Subfield, 9, true),
        	setComboBox(Bachelors, 3, false),
        	setComboBox(Masters, 4, false),
        	setComboBox(Doctorate, 5, false),
        	setComboBox(PostDoc, 6, false),
        	setRadioButtonGroup(Gender, 10, false, false),
        	setTextField(PhotoUrl, "Photo Url", false),
        	setTextField(Sources, "Source Url", false)
		);
		
        return root;
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

        Button submit = new Button("Add New Row");
        submit.setIcon(VaadinIcons.PLUS_SQUARE_LEFT_O);
        //submit.addStyleName(ValoTheme.BUTTON_PRIMARY);
        submit.addClickListener(new ClickListener() {
            @Override
            public void buttonClick(ClickEvent event) {
            		String errorMsg = "";

	        		if(FullName.isEmpty()) {
        	    		errorMsg += "FullName cannot be empty.<br>";
        	    	}
            		if(University.isEmpty()) {
        	    		errorMsg += "University cannot be empty.<br>";
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
                        	AjobsUI.getApi().logError(e);
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
			
			setSuggestions(1, FullName.getValue());
			setSuggestions(2, University.getValue());
			setSuggestions(3, Bachelors.getValue());
			setSuggestions(4, Masters.getValue());
			setSuggestions(5, Doctorate.getValue());
			setSuggestions(6, PostDoc.getValue());
			setSuggestions(7, JoinYear.getValue().toString());
			setSuggestions(8, Rank.getValue());
			setSuggestions(9, Subfield.getValue());
			setSuggestions(10, Gender.getValue().toString());
			setSuggestions(11, PhotoUrl.getValue());
			setSuggestions(12, Sources.getValue());
			
			// inferred
			setSuggestions(13, AjobsUI.getApi().getProfileSession().getIdProfile().toString()); // last updated by
			LocalDate currentDate = LocalDate.now();
			setSuggestions(14, currentDate.toString()); // date last updated
			
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
        Window w = new ProfsNewRowWindow(msg);
        UI.getCurrent().addWindow(w);
        w.focus();
    }
}