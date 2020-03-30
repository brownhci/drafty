package com.ajobs.component;

import com.vaadin.ui.CssLayout;

public class SearchBarOld extends CssLayout {
	
	/*
	 
	private static final long serialVersionUID = -8635637832611358469L;
	
	InteractionService intService = new InteractionService();
	
	//private HorizontalLayout hrz = new HorizontalLayout();
	
	private ComboBox<String> searchCol = new ComboBox<String>();
    private ComboBox<String> searchOp = new ComboBox<String>();
    private TextField searchText = new TextField();
    private Button searchClear = new Button();
    
    private Registration searchColListener;
    private Registration searchOpListener;
    private Registration searchTextListener;
    private Registration searchClearListener;

	public SearchBarOld() {
		setPrimaryStyleName("HolyGrail-search");
        
		searchCol.addStyleName("HolyGrail-search-item");
		searchCol.setWidth("100%");
		searchCol.setItems(AjobsUI.getApi().getHeaders());
		searchCol.setSelectedItem(getDefaultSelection());
		searchCol.setEmptySelectionAllowed(false);

		searchClear.setStyleName(ValoTheme.BUTTON_BORDERLESS);
		searchClear.setStyleName("HolyGrail-search-clear");
		
		CssLayout searchLayout = new CssLayout(searchText, searchClear);
        searchLayout.setStyleName(ValoTheme.LAYOUT_COMPONENT_GROUP);
        searchLayout.addStyleName("HolyGrail-search-item");
        searchLayout.addStyleName("HolyGrail-search-box");
        searchLayout.setWidth("100%");
        
		searchText.setWidth("100%");
		searchText.setIcon(VaadinIcons.SEARCH);
		searchText.addStyleName(ValoTheme.TEXTFIELD_INLINE_ICON);
		searchText.setPlaceholder("Search by Column");
        searchText.setValueChangeMode(ValueChangeMode.LAZY); //mimics partial-search from Drafty 1.0

        //searchClear.setWidth("15%");
        searchClear.setIcon(VaadinIcons.CLOSE_SMALL);
        searchClear.setDescription("Clear search parameters.");
        
        addListeners(); // for other components
        
        addComponents(searchLayout, searchCol, buidAddNewRow());
    }
    
	private String getDefaultSelection() {
		String selection = AjobsUI.getApi().getHeaders().get(0);
		try {
			for(String h : AjobsUI.getApi().getHeaders()) {
				SuggestionType st = AjobsUI.getApi().getSuggestionTypeStr().get(h);
				if(!st.getIsPrivate()) {
					selection = h;
					break;
				}
			}
		} catch (Exception e) {
			//AjobsUI.getApi().logError(e);
		}
		return selection;
	}

	private Button buidAddNewRow() {
		Button newRowButton = new Button("Add New Job");
        newRowButton.setIcon(VaadinIcons.PLUS_SQUARE_LEFT_O);
        //newRowButton.addStyleName(ValoTheme.BUTTON_PRIMARY);
        newRowButton.addStyleName("HolyGrail-search-item");
        newRowButton.addStyleName("HolyGrail-search-new-row");
        newRowButton.addStyleName("new-row");
        newRowButton.setWidth("100%");
        newRowButton.addClickListener(e -> AjobsNewRowWindow.open(""));
        return newRowButton;
	}
	
    private void addListeners() {
		searchColListener   = searchCol.addSelectionListener(e -> runSearch(false));
		searchOpListener    = searchText.addValueChangeListener(e -> partialSearch(e));
		searchTextListener  = searchText.addBlurListener(e -> completeSearch(e));
		searchClearListener = searchClear.addClickListener(e -> clearParams());
    }
    
    private void removeListeners() {
    	searchColListener.remove();
		searchOpListener.remove();
		searchTextListener.remove();
	}
    
	private void clearParams() {
		//removeListeners();
		searchText.setValue("");
		//addListeners();
	}

	private void completeSearch(BlurEvent e) {
		runSearch(false);
	}

	private void partialSearch(ValueChangeEvent<String> e) {
		runSearch(true);
	}
	
	private void runSearch(boolean isPartial) {
		String colName = searchCol.getValue().toString();
		Integer idSuggestionType = 1;
		for(Entry<String, SuggestionType> e : AjobsUI.getApi().getSuggestionTypeStr().entrySet()) {
			SuggestionType st = e.getValue();
			
			if(st.getName().equals(colName)) {
				idSuggestionType = st.getIdSuggestionType();
			}
		}
		
		//AjobsUI.getApi().getFilterSort().setIdSuggestionTypeToFilter(idSuggestionType);
		String valSearch = searchText.getValue();
		//AjobsUI.getApi().getFilterSort().setValueToSearch(valSearch);
		
		boolean isUserTriggered = false;
		boolean runSort = true;
		if(AjobsUI.getApi().runFilterSort(isUserTriggered, runSort)) {
			DraftyEventBus.post(new FilterEvent(false));
		} else {
			Notification error = new Notification("Oh no!, there was an error. :(  We are working hard to solve it.");
			error.setDelayMsec(20000);
			error.setStyleName("bar error small");
			error.setPosition(Position.BOTTOM_CENTER);
			error.show(Page.getCurrent());
		}
		
		intService.insertSearch(isPartial, idSuggestionType, valSearch);
		updateUriFragment(idSuggestionType.toString(), valSearch);
	}
	
	private void updateUriFragment(String column, String value) { //column should be idSuggestionType
		try {
			String newUriFragment = "?" + column + "?" + value;
			//System.out.println("NEW URI FRAGMENT = " + newUriFragment);
    		Page.getCurrent().setUriFragment(newUriFragment, false); //rewrites whole thing if false; true = endless loop
        } catch(NullPointerException e) {
        	//print nothing
        }
	}
	
	public void setSearchParams() {
		removeListeners();
		
		String searchVal = AjobsUI.getApi().getFilterSort().getValueToSearch();
        if(AjobsUI.getApi().isStringNull(searchVal)) {
        		searchText.setValue("");
        } else {
        		searchText.setValue(searchVal);
        }
        
        Integer idSuggestionTypeToSearch = AjobsUI.getApi().getFilterSort().getIdSuggestionTypeToFilter();
        if(idSuggestionTypeToSearch == null) {
        	searchCol.setSelectedItem(getDefaultSelection());
	    } else {
	    	searchCol.setSelectedItem(AjobsUI.getApi().getSuggestionTypeInt().get(idSuggestionTypeToSearch).getName());
	    }
        
        addListeners();
        runSearch(false); //isFull
        
        //System.out.println("SearchBar :: setSearchParams() = " + idSuggestionTypeToSearch + " " + searchVal);
		
	}
	*/
}