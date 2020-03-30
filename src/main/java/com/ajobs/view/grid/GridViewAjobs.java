package com.ajobs.view.grid;

import java.net.URLDecoder;
import java.util.Date;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Map.Entry;
import java.util.Optional;
import java.util.Set;

import com.ajobs.AjobsUI;
import com.ajobs.domain.Profile;
import com.ajobs.domain.Sort;
import com.ajobs.domain.SuggestionType;
import com.ajobs.domain.Url;
import com.ajobs.event.DraftyEvent.CloseOpenWindowsEvent;
import com.ajobs.event.DraftyEvent.NewRowEvent;
import com.ajobs.event.DraftyEvent.UserLoginRequestedEvent;
import com.ajobs.event.DraftyEventBus;
import com.ajobs.newrow.AjobsNewRowWindow;
import com.ajobs.services.InteractionService;
import com.ajobs.util.ComponentValidators;
import com.google.common.eventbus.Subscribe;
import com.vaadin.data.Binder;
import com.vaadin.data.HasValue.ValueChangeEvent;
import com.vaadin.data.provider.GridSortOrder;
import com.vaadin.data.provider.ListDataProvider;
import com.vaadin.event.FieldEvents.BlurEvent;
import com.vaadin.icons.VaadinIcons;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.server.Page;
import com.vaadin.server.Page.BrowserWindowResizeEvent;
import com.vaadin.server.Responsive;
import com.vaadin.server.VaadinSession;
import com.vaadin.shared.ui.ContentMode;
import com.vaadin.shared.ui.ValueChangeMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.ComboBox;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Grid.Column;
import com.vaadin.ui.Grid.SelectionMode;
import com.vaadin.ui.Label;
import com.vaadin.ui.TextField;
import com.vaadin.ui.components.grid.HeaderCell;
import com.vaadin.ui.components.grid.HeaderRow;
import com.vaadin.ui.themes.ValoTheme;

public class GridViewAjobs extends CssLayout implements View {
	private Profile profile = AjobsUI.getApi().getProfileSession();
	
	private CssLayout body = new CssLayout();
	private CssLayout body_main = new CssLayout();

	private CssLayout gridOptions = new CssLayout();
	private Button clearSearchBoxes = new Button();
	private Button addNewRow = new Button();
	
	private Grid<Ajobs> grid = new Grid<Ajobs>();
	private ListDataProvider<Ajobs> dataProvider;
	private Binder<Ajobs> binder = grid.getEditor().getBinder();
	private HeaderRow filteringHeader;
	
	private ComboBox<String> myStatusEditField = new ComboBox<>();
	private ComboBox<String> universityEditField = new ComboBox<>();
	private ComboBox<String> fieldEditField = new ComboBox<>();
	private ComboBox<String> classificationEditField = new ComboBox<>();
	private ComboBox<String> subfieldEditField = new ComboBox<>();
	private TextField additionalInfoEditField = new TextField();
	private ComboBox<String> positionTypeEditField = new ComboBox<>();
	private ComboBox<String> positionStatusEditField = new ComboBox<>();
	private ComboBox<String> deadlineEditField = new ComboBox<>();
	private TextField myNotesEditField = new TextField();
	private ComboBox<String> linkToApplyEditField = new ComboBox<>();
	private ComboBox<String> whoIsInterviewingEditField = new ComboBox<>();
	private ComboBox<String> createdByEditField = new ComboBox<>(); //auto-generated
	private ComboBox<String> searchChairEditField = new ComboBox<>();
	private ComboBox<String> searchEmailEditField = new ComboBox<>();
	
	private Map<Integer, Integer> currentRowIds = new HashMap<Integer, Integer>();
	private Map<Integer, String> currentRowValues = new HashMap<Integer, String>(); // idSuggestionType, Suggestion Value
	private Map<String, String> idSuggestionTypeSortDirection = new HashMap<String, String>();
	private Map<Integer, String> idSuggestionTypeValueSearched = new HashMap<Integer, String>();
	
	private GridService gridService = new GridService();
	private ComponentValidators compValidators = new ComponentValidators();
	private InteractionService interactionService = new InteractionService();
	private Date oldClickDate = new Date();
	private Integer oldClickIdSuggestion = -1;
	private boolean isClearSearch = false;
	private Integer isSearchFromUrl = 0;
	
	// sw - holds all search fields
	private Map<Integer, TextField> searchFields = new HashMap<Integer, TextField>(AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().keySet().size());
	
	public GridViewAjobs() {	
		System.out.println("Start GridView()");
		
		setSizeFull();
        DraftyEventBus.register(this);
        
        body.setSizeFull();
        body_main.setSizeFull();
        
        grid = new Grid<Ajobs>();
		binder = grid.getEditor().getBinder();
		
		Responsive.makeResponsive(body, body_main, grid);
        
        body.addComponents(body_main);
        body_main.addComponents(buildGridOptions(), buildGrid());
        addComponent(body);
        
        body.addStyleName("HolyGrail-body");
		body_main.addStyleName("HolyGrail-content");
       
		addListeners();
		grid.setSortOrder(GridSortOrder.asc(grid.getColumn("2")).thenAsc(grid.getColumn("1"))); // default sort
	}
	
	@Override
	public void enter(ViewChangeEvent event) {
		//System.out.println("Enter Grid View : " + event.getOldView());
		
        //For Spreadsheet Auto Scroll -> Hidden Div Fix
  		Page.getCurrent().addBrowserWindowResizeListener(e -> BrowserResize(e));
  		setGridHeightOffset();
  		
  		if(event.getOldView() == null) {
  			runSearchFromUrl();
  			createInlineEditor("1");
  		}
	}
	
	private void runSearchFromUrl() {
		try {
			isSearchFromUrl = 1;
			Url urlSession = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
			String fragment = urlSession.getSearchFragment();
			
			fragment = URLDecoder.decode(fragment, "UTF-8");
			//System.out.println("runSearchFromUrl() - replace - fragment = " + fragment);
			fragment = fragment.replace("?-", "");
			//System.out.println("runSearchFromUrl() - replace - fragment = " + fragment);
			
			if(urlSession.isActive()) {
				for(String search : fragment.split("\\?")) {
					if(!AjobsUI.getApiNew().isStringNull(search)) {
						System.out.println("runSearchFromUrl() - search parameter = " + search);
						Integer idSuggestionType = Integer.valueOf(search.split("\\~")[0]);
						String searchValue = search.split("\\~")[1];
						
						if(isColActive(idSuggestionType)) {
							String newSearchValue = searchValue.replaceAll("\\%20", " ");
							idSuggestionTypeValueSearched.put(idSuggestionType, newSearchValue);
							searchFields.get(idSuggestionType).setValue(newSearchValue);
							
							lastSearchIdSuggestionType = idSuggestionType;
							lastSearchVal = searchValue;
						}
					}
				}
			}
			isSearchFromUrl = 0;
		} catch (Exception e) {
			AjobsUI.getApiNew().logError(e);
		} 
	}
	
	private void addListeners() {
		// All the open sub-windows should be closed whenever the root layout gets clicked.
        body.addLayoutClickListener(e -> {
        	DraftyEventBus.post(new CloseOpenWindowsEvent());
        });
        
        body_main.addLayoutClickListener(e -> {
        	DraftyEventBus.post(new CloseOpenWindowsEvent());
        });
        
        //
        clearSearchBoxes.addClickListener(e -> clearSearch(e));
        
        addNewRow.addClickListener(e -> AjobsNewRowWindow.open(""));
        
        //
        grid.getEditor().addOpenListener(e -> {
			//System.out.println("OPEN: " + e.getBean().getIdUniqueID());
        	//System.out.println("grid.getEditor().addOpenListener subfield = " + e.getBean().getSubfield());
			createInlineEditor(e.getBean().getIdUniqueID());
		});
        
		grid.getEditor().addSaveListener(e -> {
			//System.out.println("SAVE: " + e.getBean().getIdUniqueID() + " " + grid.getEditor().getBinder().isValid());
			// get all editor components?
			if(grid.getEditor().getBinder().isValid()) {
				editorSave(Integer.valueOf(e.getBean().getIdUniqueID()));
			}
		});
		
		grid.getEditor().addCancelListener(e -> {
			//System.out.println("CANCEL: " + e.getBean().getIdUniqueID() + " " + grid.getEditor().getBinder().isValid());
		});
        
  		//
  		grid.addItemClickListener(event -> {
  			Integer idUniqueID = Integer.valueOf(event.getItem().getIdUniqueID());
  			Integer idSuggestionType = Integer.valueOf(event.getColumn().getId());
  			Integer idSuggestion = gridService.getIdSuggestion(idUniqueID, idSuggestionType, event.getItem().getSuggestion(idSuggestionType));
  			
  			//System.out.println("Grid ClickListener: idUniqueID = " + idUniqueID + ", idSuggestionType = " + idSuggestionType + ", idSuggestion = " + idSuggestion);
  			//System.out.println("DoubleClick? " + event.getMouseEventDetails().isDoubleClick()); //always false :/
  			
  			currentRowIds = event.getItem().getIdSuggestions();
  			for(Integer idSuggestionTypeAPI : AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().keySet()) {
  				if(isColActive(idSuggestionTypeAPI)) {
  					//System.out.println("currentRowValues += " + idSuggestionTypeAPI + " :: " + event.getItem().getSuggestion(idSuggestionTypeAPI));
  					currentRowValues.put(idSuggestionTypeAPI, event.getItem().getSuggestion(idSuggestionTypeAPI));
  				}
  			}
  			
  			Date newClickDate = new Date();
  			if(idSuggestion > 0) { // -1 is check
  				if(isDoubleClick(newClickDate, idSuggestion)) {
  					interactionService.insertDoubleClick(idSuggestion, event.getItem().getRowValues());
  				} else {
  					interactionService.insertClick(idSuggestion, event.getItem().getRowValues());
  				}
  			}
		});
  		
  		grid.addSortListener(event -> {
  			if(event.isUserOriginated()) {
  				List<GridSortOrder<Ajobs>> sortOrder = grid.getSortOrder();
  				Map<String, Sort> sorts = new HashMap<String, Sort>();
  				
  				Integer isMulti = 0;
  				if(sortOrder.size() > 1) {
  					isMulti = 1;
  				}
  				
  				String idSuggestionTypeTrigger = sortOrder.get((sortOrder.size()-1)).getSorted().getId();
  				
  	  			for(GridSortOrder<Ajobs> s : sortOrder) {
  	  				String idSuggestionType = s.getSorted().getId();
  	  			
  	  				Integer isAsc = 0;
  	  				if(s.getDirection().toString().equals("ASCENDING")) {
  	  				isAsc = 1;
  	  				}
  	  				
  	  				Integer isTrigger = 0;
  	  				if(idSuggestionType.equals(idSuggestionTypeTrigger)) {
  	  					isTrigger = 1;
  	  				}
  	  				
  	  				Sort sort = new Sort(idSuggestionType, isAsc, isTrigger, isMulti);
  	  				sorts.put(idSuggestionType, sort);
  	  			}
  	  			interactionService.insertSort(sorts);
  			}
  		});
	}
	
	private void clearSearch(ClickEvent e) {
		isClearSearch = true;
		dataProvider.clearFilters();
		for(TextField searchField : searchFields.values()) {
			searchField.setValue("");
		}
		interactionService.insertClearSearch();
	}

	private void editorSave(Integer idUniqueID) {
		HashMap<Integer, String> edits = new HashMap<Integer, String>();
		
		if(isColActive(14)) { edits.put(14,  switchBlankComboBox(myStatusEditField).getValue()); }
		if(isColActive(1))  { edits.put(1,   switchBlankComboBox(universityEditField).getValue()); }
		if(isColActive(2))  { edits.put(2,   switchBlankComboBox(fieldEditField).getValue()); }
		if(isColActive(3))  { edits.put(3,   switchBlankComboBox(classificationEditField).getValue()); }
		if(isColActive(6))  { edits.put(6,   switchBlankComboBox(subfieldEditField).getValue()); }
		if(isColActive(15)) { edits.put(15,  switchBlankTextField(additionalInfoEditField).getValue()); }
		if(isColActive(5))  { edits.put(5,   switchBlankComboBox(positionTypeEditField).getValue()); }
		if(isColActive(4))  { edits.put(4,   switchBlankComboBox(positionStatusEditField).getValue()); }
		if(isColActive(7))  { edits.put(7,   switchBlankComboBox(deadlineEditField).getValue()); }
		if(isColActive(11)) { edits.put(11,  switchBlankTextField(myNotesEditField).getValue()); }
		if(isColActive(8))  { edits.put(8,   switchBlankComboBox(linkToApplyEditField).getValue()); }
		if(isColActive(12)) { edits.put(12,  switchBlankComboBox(whoIsInterviewingEditField).getValue()); }
		if(isColActive(13)) { edits.put(13,  switchBlankComboBox(createdByEditField).getValue()); }
		if(isColActive(9))  { edits.put(9,   switchBlankComboBox(searchChairEditField).getValue()); }
		if(isColActive(10)) { edits.put(10,  switchBlankComboBox(searchEmailEditField).getValue()); }
		
		
		//HashMap<Integer, Integer> newEdits_idSuggestionType_idSuggestion = gridService.saveEdit(idUniqueID, edits, currentRowValues, currentRowIds);
		
		// updates id suggestions in models
		/*
		ListDataProvider<Ajobs> newDataProvider = ListDataProvider<Ajobs>;
		for(Entry<Integer, Integer> e : newEdits_idSuggestionType_idSuggestion.entrySet()) {
			Integer idSuggestionType = e.getKey();
			Integer idSuggestion = e.getValue();
			for(Ajobs ajobs : dataProvider.getItems()) {
				if(ajobs.getIdUniqueID().equals(idUniqueID)) {
					ajobs.setIdSuggestion(idSuggestionType, idSuggestion);
				}
				newDataProvider.getItems().add(e)
			}
		}
		dataProvider = newDataProvider;
		*/
		
		gridService.saveEdit(idUniqueID, edits, currentRowValues, currentRowIds);
		dataProvider = gridService.generateAjobsDataProvider();
		grid.setDataProvider(dataProvider);
		runSearchFromUrl();
	}
	
	private ComboBox<String> switchBlankComboBox(ComboBox<String> comp) {
		if(!comp.isEmpty()) {
			if(comp.getValue().toString().equals("[Blank]")) {
				comp.setValue("");
			}
		} else {
			comp.setValue("");
		}
		return comp;
	}
	
	private TextField switchBlankTextField(TextField comp) {
		if(!comp.isEmpty()) {
			if(comp.getValue().toString().equals("[Blank]")) {
				comp.setValue("");
			}
		} else {
			comp.setValue("");
		}
		return comp;
	}

	private CssLayout buildGridOptions() {
		gridOptions.setPrimaryStyleName("HolyGrail-search");
		gridOptions.setWidth("100%");
        gridOptions.addComponents(clearSearchBoxes, addNewRow);
        
        clearSearchBoxes.setPrimaryStyleName(".v-button-grid-options");
        clearSearchBoxes.addStyleName("HolyGrail-search-item");
        clearSearchBoxes.setWidth("100%");
        clearSearchBoxes.setIcon(VaadinIcons.ERASER);
        clearSearchBoxes.setCaption("Clear Search");
        
        addNewRow.setPrimaryStyleName(".v-button-grid-options");
        addNewRow.addStyleName("HolyGrail-search-item");
        addNewRow.setWidth("100%");
        addNewRow.setIcon(VaadinIcons.PLUS_SQUARE_LEFT_O);
        addNewRow.setCaption(AjobsUI.getApiNew().getDataset().getAddNewRowMsg());
        
        return gridOptions;
	}
	
	private Grid buildGrid() {
		grid.setId("grid");
		grid.setWidth("100%");
		grid.setSelectionMode(SelectionMode.NONE);
		
		dataProvider = gridService.generateAjobsDataProvider();
		grid.setDataProvider(dataProvider);
		
		grid.getEditor().setEnabled(true);
		Ajobs ajobs_empty_bean = new Ajobs();
		binder.setBean(ajobs_empty_bean); //sw90 - needed for java auto mapping magic
		
		grid.addColumn(Ajobs::getIdUniqueID).setId("idRow").setHidden(true);
		if(isColActive(14)) {
			grid.addColumn(Ajobs::getMyStatus).setId("14").setEditorComponent(myStatusEditField, Ajobs::setMyStatus).setWidth(220);
		}
		if(isColActive(11)) {
			grid.addColumn(Ajobs::getMyNotes).setId("11").setEditorComponent(myNotesEditField, Ajobs::setMyNotes).setMinimumWidth(280).setMaximumWidth(400);
		}
		if(isColActive(1)) {
			grid.addColumn(Ajobs::getUniversity).setId("1").setEditorComponent(universityEditField, Ajobs::setUniversity).setExpandRatio(1).setWidth(250);
		}
		if(isColActive(2)) {
			grid.addColumn(Ajobs::getField).setId("2").setEditorComponent(fieldEditField, Ajobs::setField);
		}
		if(isColActive(3)) {
			grid.addColumn(Ajobs::getClassification).setId("3");
		}
		if(isColActive(6)) {
			grid.addColumn(Ajobs::getSubfield).setId("6").setEditorComponent(subfieldEditField, Ajobs::setSubfield);
		}
		if(isColActive(5)) {
			grid.addColumn(Ajobs::getPositionType).setId("5").setEditorComponent(positionTypeEditField, Ajobs::setPositionType).setWidth(140);
		}
		if(isColActive(4)) {
			grid.addColumn(Ajobs::getPositionStatus).setId("4").setEditorComponent(positionStatusEditField, Ajobs::setPositionStatus).setWidth(150);
		}
		if(isColActive(7)) {
			grid.addColumn(Ajobs::getDeadline).setId("7").setEditorComponent(deadlineEditField, Ajobs::setDeadline);
		}
		if(isColActive(8)) {
			grid.addColumn(Ajobs::getLinkToApply).setId("8").setEditorComponent(linkToApplyEditField, Ajobs::setLinkToApply).setWidth(240);
		}
		if(isColActive(15)) {
			grid.addColumn(Ajobs::getAdditionalInfo).setId("15").setEditorComponent(additionalInfoEditField, Ajobs::setAdditionalInfo).setMinimumWidth(280).setMaximumWidth(400);
		}
		if(isColActive(12)) {
			grid.addColumn(Ajobs::getWhoIsInterviewing).setId("12").setEditorComponent(whoIsInterviewingEditField, Ajobs::setWhoIsInterviewing);
		}
		if(isColActive(13)) {
			grid.addColumn(Ajobs::getCreatedBy).setId("13");
		}
		if(isColActive(9)) {
			grid.addColumn(Ajobs::getSearchChair).setId("9").setEditorComponent(searchChairEditField, Ajobs::setSearchChair).setCaption("Search Chair");
		}
		if(isColActive(10)) {
			grid.addColumn(Ajobs::getSearchEmail).setId("10").setEditorComponent(searchEmailEditField, Ajobs::setSearchEmail);
		}
		
		//update headers?
		for(Column<Ajobs, ?> col : grid.getColumns()) {
			if(!col.getId().equals("idRow")) {
				Integer idSuggestionType = Integer.valueOf(col.getId());
				SuggestionType suggestionType = AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType);
				Profile user = AjobsUI.getApi().getProfileSession();
				col.setHidden(!suggestionType.getIsActive());
				if(user.isLoggedIn() && suggestionType.getIsPrivate()) {
					String headerTitle = "<span class=\"v-icon Vaadin-Icons\"></span> " + user.getUsername() + "'s " + suggestionType.getName().replaceAll("_", "%20");
					
					HeaderCell cell = grid.getHeaderRow(0).getCell(idSuggestionType.toString());
					Label headerLabel = new Label(headerTitle, ContentMode.HTML);
					headerLabel.setDescription("Only <b>you</b> can view and edit this column.", ContentMode.HTML);
					cell.setComponent(headerLabel);
				} else {
					col.setCaption(suggestionType.getName().replaceAll("_", "%20"));
				}
				//col.setEditable(suggestionType.getIsEditable());
			}
		}
		
		createFilters();
		
		return grid;
	}

	private void createInlineEditor(String idUniqueID) {
		//System.out.println("createInlineEditor from " + idUniqueID);
		gridService.getAllSuggestionsPerRow(idUniqueID);
		//https://www.gikacoustics.com/product/impression-6inch-bass-trap-diffusor-absorber/
		
		binder = new Binder<Ajobs>();
		grid.getEditor().setBinder(binder);
		
		if(isColActive(14)) {
			myStatusEditField = setComboBox(myStatusEditField, idUniqueID, 14);
			binder.forField(myStatusEditField).bind(Ajobs::getMyStatus, Ajobs::setMyStatus);
		}
		if(isColActive(1)) {
			universityEditField = setComboBox(universityEditField, idUniqueID, 1);
			binder.forField(universityEditField)
				.withValidator(compValidators.checkOtherSuggestions())
				.withValidator(compValidators.checkLength(3, 750))
				.bind(Ajobs::getUniversity, Ajobs::setUniversity);
		}
		if(isColActive(2)) {	
			fieldEditField = setComboBox(fieldEditField, idUniqueID, 2);
			binder.forField(fieldEditField)
				.withValidator(compValidators.checkOtherSuggestions())
				.withValidator(compValidators.checkLength(2, 500))
				.bind(Ajobs::getField, Ajobs::setField);
		}
		if(isColActive(6)) {	
			subfieldEditField = setComboBox(subfieldEditField, idUniqueID, 6);
			// sw the validator is causing errors after
			binder.forField(subfieldEditField)
				.withValidator(compValidators.checkLength(0, 500))
				.withValidator(compValidators.checkOtherSuggestions())
				.bind(Ajobs::getSubfield, Ajobs::setSubfield);
			//new RegexpValidator("^\\p{Alpha}+ \\p{Alpha}+$","Need first and last name")
		}
		if(isColActive(15)) {
			binder.forField(additionalInfoEditField)
				.withValidator(compValidators.checkOtherSuggestions())
				.bind(Ajobs::getAdditionalInfo, Ajobs::setAdditionalInfo);
		}
		if(isColActive(5)) {
			positionTypeEditField = setComboBox(positionTypeEditField, idUniqueID, 5);
			binder.forField(positionTypeEditField)
				.bind(Ajobs::getPositionType, Ajobs::setPositionType);
		}
		if(isColActive(4)) {
			positionStatusEditField = setComboBox(positionStatusEditField, idUniqueID, 4);
			binder.forField(positionStatusEditField)
				.withValidator(compValidators.checkOtherSuggestions())
				.bind(Ajobs::getPositionStatus, Ajobs::setPositionStatus);
		}
		if(isColActive(7)) {
			deadlineEditField = setComboBox(deadlineEditField, idUniqueID, 7);
			binder.forField(deadlineEditField)
				.withValidator(compValidators.checkLength(0, 500))
				.withValidator(compValidators.checkOtherSuggestions())
				.bind(Ajobs::getDeadline, Ajobs::setDeadline);
		}
		if(isColActive(11)) {
			binder.forField(myNotesEditField)
				.withValidator(compValidators.checkLength(0, 1500))
				.withValidator(compValidators.checkOtherSuggestions())
				.bind(Ajobs::getMyNotes, Ajobs::setMyNotes);
		}
		if(isColActive(8)) {
			linkToApplyEditField = setComboBox(linkToApplyEditField, idUniqueID, 8);
			binder.forField(linkToApplyEditField)
				.withValidator(compValidators.checkLength(1, 1500))
				.withValidator(compValidators.checkOtherSuggestions())
				.bind(Ajobs::getLinkToApply, Ajobs::setLinkToApply);
		}
		if(isColActive(12)) {
			whoIsInterviewingEditField = setComboBox(whoIsInterviewingEditField, idUniqueID, 12);
			binder.forField(whoIsInterviewingEditField)
				.withValidator(compValidators.checkLength(0, 1500))
				.withValidator(compValidators.checkOtherSuggestions())
				.bind(Ajobs::getWhoIsInterviewing, Ajobs::setWhoIsInterviewing);
		}
		if(isColActive(13)) {
			// not editable
		}
		if(isColActive(9)) {
			searchChairEditField = setComboBox(searchChairEditField, idUniqueID, 9);
			binder.forField(searchChairEditField)
				.withValidator(compValidators.checkLength(0, 500))
				.withValidator(compValidators.checkOtherSuggestions())
				.bind(Ajobs::getSearchChair, Ajobs::setSearchChair);
		}
		if(isColActive(10)) {
			searchEmailEditField = setComboBox(searchEmailEditField, idUniqueID, 10);
			binder.forField(searchEmailEditField)
				.withValidator(compValidators.checkLength(0, 500))
				.withValidator(compValidators.checkOtherSuggestions())
				.bind(Ajobs::getSearchEmail, Ajobs::setSearchEmail);
		}
	}
	
	private boolean isColActive(Integer idSuggestionType) {
		SuggestionType suggType = AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType);
		
		if(!suggType.getIsActive()) {
			//System.out.println("isColActive = " + idSuggestionType + " false - !suggType.getIsActive()"); 
			return false;
		} else if(suggType.getIsPrivate() && !profile.isLoggedIn()) {
			//System.out.println("isColActive = " + idSuggestionType + " false - suggType.getIsPrivate() && !profile.isLoggedIn()");
			return false;
		} else {
			//System.out.println("isColActive = " + idSuggestionType + " true");
			return true;
		}
	}
	
	private void createFilters() {
        filteringHeader = grid.appendHeaderRow();
        
        for(Entry<Integer, SuggestionType> st : AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().entrySet()) {
        	Integer idSuggestionType = st.getKey();
        	if(isColActive(idSuggestionType)) {
        		TextField searchField = getColumnFilterField();
        		searchFields.put(idSuggestionType, searchField);
        		addSearchField(idSuggestionType, searchFields.get(idSuggestionType));
        	}
        }
	}
	
	private void searchCompleteListener(Integer idSuggestionType, BlurEvent e) {
		//System.out.println("Search Blur Event: " + idSuggestionType + " :: " + lastSearchIdSuggestionType);
		if(idSuggestionType.equals(lastSearchIdSuggestionType)) {
			interactionService.updatePartialSearch();
		}
	}
	
	private void searchListener(Integer idSuggestionType, ValueChangeEvent<String> e) {
		//System.out.println("SearchListener() " + AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType).getName() + " " + e);
		String searchVal = e.getValue().toString();
		lastSearchVal = searchVal;
		
		if(e.isUserOriginated()) {
			lastSearchIdSuggestionType = idSuggestionType;
		}
		
		if(AjobsUI.getApi().isStringNull(searchVal)) {
			idSuggestionTypeValueSearched.remove(idSuggestionType);
		} else { // is not null
			idSuggestionTypeValueSearched.put(idSuggestionType, searchVal);
		}
		
		//System.out.println("SearchListener: isUserOriginated? " + e.isUserOriginated() + ", idSuggestionType = " + idSuggestionType + ", search value =  " + e.getValue().toString() + ", size of active search fields " + idSuggestionTypeValueSearched.size());
		if(e.isUserOriginated() && idSuggestionTypeValueSearched.size() == 0) { //means user manually cleared everything
			// clear search -  was clicked
			interactionService.insertClearSearch();
		} else if(!isClearSearch) {
			interactionService.insertSearch(idSuggestionType, searchVal, isSearchFromUrl, idSuggestionTypeValueSearched);
		}
		
		filterGrid();
	}
	
	private void filterGrid() {
		dataProvider.clearFilters();
		boolean isSearchUrlActive = false;
		String newUriFragment = "?-";
		for(Entry<Integer, String> entry : idSuggestionTypeValueSearched.entrySet()) {
			Integer idSuggestionType = entry.getKey();
			String searchValue = entry.getValue();
			
			if(!searchValue.isEmpty()) {
				newUriFragment += "?" + idSuggestionType + "~" + searchValue;
			}
			
			searchFields.get(idSuggestionType).setValue(searchValue);
			isSearchUrlActive = true;
			
			try {
    			if(!searchValue.isEmpty()) {
    				if(idSuggestionType == 14 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getMyStatus, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 1 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getUniversity, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 2 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getField, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 3 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getClassification, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 6 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getSubfield, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 15 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getAdditionalInfo, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 5 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getPositionType, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 4 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getPositionStatus, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 7 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getDeadline, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 11 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getMyNotes, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 8 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getLinkToApply, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 12 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getWhoIsInterviewing, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 13 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getCreatedBy, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 9 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getSearchChair, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		} else if(idSuggestionType == 10 && isColActive(idSuggestionType)) {
            			dataProvider.addFilter(Ajobs::getSearchEmail, v -> searchLogicStr(searchValue, v, idSuggestionType));
            		}
    			}
			} catch (Exception e2) {
				//do nothing
			}
		}
		
		//System.out.println("new uri fragment = " + newUriFragment);
		Page.getCurrent().setUriFragment(newUriFragment, false);
		
		Url urlDomain = (Url) VaadinSession.getCurrent().getAttribute(Url.class.getName());
		urlDomain.setActive(isSearchUrlActive);
		urlDomain.setSearchFragment(newUriFragment);
        VaadinSession.getCurrent().setAttribute(Url.class.getName(), urlDomain);
        
        // update search entry for values currently shown on grid
        Set<String> matchedVals = new HashSet<String>();
        String matchedValues = "";
        if(isClearSearch) {
        	matchedValues = "|*|clear_search|*|";
        } else {
        	for(Ajobs row : dataProvider.getItems()) {
    			String rowVal = row.getSuggestion(lastSearchIdSuggestionType);
    			//System.out.println("rowVal = " + rowVal + ", from lastSearchIdSuggestionType = " + lastSearchIdSuggestionType);
    			//System.out.println("lastSearchVal = " + lastSearchVal);
    			if(!AjobsUI.getApiNew().isStringNull(rowVal)) {
    				if(rowVal.contains(lastSearchVal)) {
    					if(!matchedVals.contains(rowVal)) {
    						matchedValues += rowVal + "|";
    						matchedVals.add(rowVal);
    					}
    				}
    			}
    		}
        }
		interactionService.updateSearchMatchedValues(matchedValues);
		isClearSearch = false;
	}
	
	private String lastSearchVal = "";
	private Integer lastSearchIdSuggestionType = -1;
	private void addSearchField(Integer idSuggestionType, TextField field) {
		try {
			filteringHeader.getCell(idSuggestionType.toString()).setComponent(field);
			field.setValueChangeMode(ValueChangeMode.LAZY);
			field.setId(idSuggestionType.toString());
			field.addBlurListener(e -> searchCompleteListener(idSuggestionType, e));
			field.addValueChangeListener(e -> searchListener(idSuggestionType, e));
		} catch (Exception e) {
			//ignore
		}
	}
	
	private boolean searchLogicStr(String event, String val, Integer idSuggestionType) {
		//System.out.println("searchLogicStr - event = " + event + ", val = " + val + ", from idSuggestionType = " + idSuggestionType);
		try {
			String valLower = val.toLowerCase(Locale.ENGLISH);
	        String filterLower = event.toLowerCase(Locale.ENGLISH);
	        //System.out.println("SEARCH :: valLower = " + valLower + ", filterLower = " + filterLower);
	        if (valLower == null || valLower.isEmpty()) { 
				if(filterLower.equals("null") || filterLower.equals("empty")) {
		        	return true;
		        } else {
		        	return false;
		        }
			} else {
				if(filterLower.equals("not null") || filterLower.equals("not empty")) {
		        	if(valLower.length() > 0) {
		        		return true; 
		        	} else {
		        		return false;
		        	}
		        } else {
		        	return valLower.contains(filterLower);
		        }
			}
		} catch (Exception e) {
			return false;
		}
	}
	
	private TextField getColumnFilterField() {
        TextField filter = new TextField();
        filter.setWidth("100%");
        filter.addStyleName(ValoTheme.TEXTFIELD_TINY);
        filter.setPlaceholder("Search");
        return filter;
    }
	
	private ComboBox<String> setComboBox(ComboBox<String> comp, String idUniqueID, Integer idSuggestionType) {
		Set<String> suggestedValues = gridService.getSuggestionTypeValuesList(idSuggestionType);
		comp.setItems(suggestedValues);
		
		SuggestionType suggType = AjobsUI.getApiNew().getIdSuggestionType_SuggestionType().get(idSuggestionType);
		//comp.setEmptySelectionAllowed(suggType.getCanBeBlank()); //handled in service
		comp.setEmptySelectionAllowed(false);
		
		// Allow adding new items and add handling for new items
		if(suggType.allowNew()) {
			comp.setNewItemProvider(inputString -> {
				Set<String> vals = gridService.getSuggestionTypeValuesList(idSuggestionType);
				vals.add(inputString);
	
			    // Update combobox content
			    comp.setItems(vals);
			    comp.setSelectedItem(inputString);
	
			    return Optional.of(inputString);
			});
		}
		
		comp.setValue(currentRowValues.get(idSuggestionType)); // sw - sets default value 
		//System.out.println("setComboBox() # of suggested values = " + suggestedValues.size() + ",  idSuggestionType = " + idSuggestionType);
		//System.out.println("set value in comboBox = " + idSuggestionType + " :: " + currentRowValues.get(idSuggestionType));
		
		return comp;
	}
	
	private boolean isDoubleClick(Date newClickDate, Integer idSuggestion) {
		boolean isDblClick = false;
	    long diffInMillies = newClickDate.getTime() - oldClickDate.getTime();
	    
	    if(diffInMillies < 500 && (oldClickIdSuggestion == idSuggestion)) {
	    	isDblClick = true;
	    }
	    
	    oldClickDate = newClickDate;
	    oldClickIdSuggestion = idSuggestion;
	    
	    return isDblClick;
	}
	
	private void setGridHeightOffset() {
		Integer browserHeight = Page.getCurrent().getBrowserWindowHeight();
		Integer browserWidth = Page.getCurrent().getBrowserWindowWidth();
		boolean isAdmin = false;
		Integer idRole = AjobsUI.getApi().getProfileSession().getIdRole();
		if(idRole != null && idRole == 1) { 
			isAdmin = true; 
		};
		
		Integer headerOffset = 58;
		
		// if not logged in
		if(!AjobsUI.getApi().getProfileSession().isLoggedIn()) {
			if(browserWidth <= 351) {
				headerOffset = 192;
			} else if(browserWidth <= 385) {
				headerOffset = 151;
			} else if(browserWidth <= 999) {
				headerOffset = 128;
			}
		} else {
			if(isAdmin) {
				if(browserWidth <= 351) {
					headerOffset = 192;
				} else if(browserWidth <= 580) {
					headerOffset = 155;
				} else if(browserWidth <= 767) {
					headerOffset = 128;
				} else if(browserWidth <= 1054) {
					headerOffset = 82;
				}
			} else {
				if(browserWidth <= 351) {
					headerOffset = 192;
				} else if(browserWidth <= 418) {
					headerOffset = 155;
				} else if(browserWidth <= 767) {
					headerOffset = 128;
				}
			}
		}
		
		Integer gridOptionsHeight = 39;
		if(browserWidth <= 999) {
			gridOptionsHeight = 74;
		}
		
		grid.setHeight((browserHeight - gridOptionsHeight - headerOffset), Unit.PIXELS);
		//System.out.println("grid height = " + grid.getHeight());
		//System.out.println("browserWidth = " + browserWidth +", browserHeight = " + browserHeight + ", gridOptionsHeight = " + gridOptionsHeight + ", headerOffset = " + headerOffset);
	}
	
	private void BrowserResize(BrowserWindowResizeEvent e) {
		setGridHeightOffset();
	}
	
	@Subscribe
	public void newRowAdded(final NewRowEvent event) {
		Ajobs ajobs = new Ajobs();
		ajobs.setIdUniqueID(event.getIdUniqueID().toString());
		
		for(Entry<Integer, String> entry : event.getNewSuggs().entrySet()) {
			Integer idSuggestionType = entry.getKey();
			String suggestion = entry.getValue();
			Integer idSuggestion = event.getNewSuggIds().get(idSuggestionType);
			
			ajobs.addNewField(suggestion, idSuggestionType);
			ajobs.setIdSuggestion(idSuggestionType, idSuggestion);
		}
		
        dataProvider.getItems().add(ajobs);
        dataProvider.refreshAll();
    }
	
	@Subscribe
	public void newLogin(final UserLoginRequestedEvent event) {
		if(event.isSignUp()) {
			dataProvider = gridService.generateAjobsDataProvider();
			grid.setDataProvider(dataProvider);
			runSearchFromUrl();
		}
    }
}
