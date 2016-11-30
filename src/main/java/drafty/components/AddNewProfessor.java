package drafty.components;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.vaadin.data.fieldgroup.BeanFieldGroup;
import com.vaadin.data.util.BeanItem;
import com.vaadin.data.util.GeneratedPropertyContainer;
import com.vaadin.data.util.IndexedContainer;
import com.vaadin.data.util.filter.SimpleStringFilter;
import com.vaadin.server.FontAwesome;
import com.vaadin.shared.ui.combobox.FilteringMode;
import com.vaadin.shared.ui.grid.HeightMode;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.ComboBox;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Grid.HeaderCell;
import com.vaadin.ui.Grid.HeaderRow;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.OptionGroup;
import com.vaadin.ui.TextField;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;
import com.vaadin.ui.Window.CloseEvent;
import com.vaadin.ui.themes.ValoTheme;

import drafty._MainUI;
import drafty.models.Mode;
import drafty.models.NewProfessor;
import drafty.services.NewProfessorServices;

public class AddNewProfessor {
	
	NewProfessorServices newPorfService = new NewProfessorServices();
	NewProfessor newProf = new NewProfessor();
	BeanFieldGroup<NewProfessor> binder = new BeanFieldGroup<NewProfessor>(NewProfessor.class);
	BeanItem<NewProfessor> bean = new BeanItem<NewProfessor>(newProf);
	
	private List<String> unisUSACan = _MainUI.getApi().getUniversitiesUSACan();
	private List<String> unis = _MainUI.getApi().getUniversitiesUSACan();
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window(" Add New Professor");
	VerticalLayout profModal = new VerticalLayout();
	
	//first
	HorizontalLayout nameHorzLayout = new HorizontalLayout();
	Button search_button = new Button("Add/Search for New Professor", e -> searchProf());
	
	//second
	HorizontalLayout btnsHorzLayout = new HorizontalLayout();
	Label searchProfLabel = new Label();
	Button addNewProf = new Button("Add New (Professor Not Found)", e -> addNewProf());
	Button foundProf = new Button("Close Window (Professor Found)", e -> foundProf());
	
	//third

	
	//misc
	Label label_suggestions = new Label();
	Label label_hr = new Label("<hr />", ContentMode.HTML);
	
	
	//first
	TextField first_name = new TextField("First Name");
	TextField last_name = new TextField("Last Name");
	ComboBox university = new ComboBox("University");
	
	
	//second
	IndexedContainer container = new IndexedContainer();
	GeneratedPropertyContainer gpcontainer = new GeneratedPropertyContainer(container);
	Grid resultsGrid = new Grid();
	
	
	//third
	HorizontalLayout yearRankHorzLayout = new HorizontalLayout();
	TextField joinYear = new TextField("Join Year");
	ComboBox rank = new ComboBox("Rank");
	ComboBox bachelors = new ComboBox("Bachelors");
	ComboBox masters = new ComboBox("Masters");
	ComboBox doctoral = new ComboBox("Doctoral");
	ComboBox postdoc = new ComboBox("PostDoc");
	OptionGroup gender = new OptionGroup("Gender");
	TextField sourceUrl = new TextField("Source URL");
	TextField photoUrl = new TextField("Photo URL");
	Button submitNewProf = new Button("Submit New Professor", e -> submitNewProf());
	
	public AddNewProfessor() {
		sub.setImmediate(true);
		sub.addCloseListener(e -> closeListener(e));
		
		sub.setWidth("640px");
		sub.setResizable(false);
		sub.setIcon(FontAwesome.USER_PLUS);
		_MainUI.getApi().getActiveMode().setActiveMode(Mode.SUGGESTION);
		
		//UI creation
		addListeners();
		addValidators();
		createUI();
		
		UI.getCurrent().addWindow(sub);
		UI.getCurrent().setFocusedComponent(sub);	    
	}

	private void addListeners() {
		first_name.addValueChangeListener((e) -> {
			newProf.setFirst_name(first_name.getValue());
		});
		last_name.addValueChangeListener((e) -> {
			newProf.setLast_name(last_name.getValue());
		});
		university.addValueChangeListener((e) -> {
			newProf.setUniversity(university.getValue().toString());
		});
	}

	private void submitNewProf() {
		
	}

	private void searchProf() {
		profModal.removeAllComponents();
		buildGrid();
		
		searchProfLabel = new Label("Is <b>" + newProf.getFirst_name() + " " + newProf.getLast_name() 
									+ "</b> from <b>" + newProf.getUniversity() + "</b> listed below?", ContentMode.HTML);
		
		profModal.addComponents(searchProfLabel, resultsGrid, btnsHorzLayout);
		btnsHorzLayout.addComponents(addNewProf, foundProf);
		btnsHorzLayout.setSpacing(true);
		
		addNewProf.setIcon(FontAwesome.USER_PLUS);
		foundProf.setIcon(FontAwesome.CLOSE);
		
		btnsHorzLayout.setWidth("100%");
		addNewProf.setWidth("100%");
		foundProf.setWidth("100%");
	}

	private void buildGrid() {
		container.addContainerProperty("name", String.class, null);
		container.addContainerProperty("university", String.class, null);
		
		gpcontainer = new GeneratedPropertyContainer(container);
		
		resultsGrid.setContainerDataSource(gpcontainer);
		resultsGrid.setSelectionMode(Grid.SelectionMode.SINGLE);
		resultsGrid.setWidth("100%");
		resultsGrid.setHeightMode(HeightMode.ROW);
		resultsGrid.setHeightByRows(8);
		
		//Set Column header names
		resultsGrid.getColumn("name").setHeaderCaption("Professor Full Name").setWidth(200);
		resultsGrid.getColumn("university").setHeaderCaption("University");
		
		HashMap<String, String> profs = newPorfService.searchForProf(newProf.getFirst_name() + " " + newProf.getLast_name());
		for (Map.Entry<String, String> entry : profs.entrySet()) {
			resultsGrid.addRow(entry.getKey(), entry.getValue());
		}
		
        //Add Filters
		//addFilters();
	}

	private void addFilters() {
		HeaderRow filterRow = resultsGrid.appendHeaderRow();
		
		for (Object pid: resultsGrid.getContainerDataSource().getContainerPropertyIds()) {
		    HeaderCell cell = filterRow.getCell(pid);
			TextField filterField = new TextField();
			
			if(pid.equals("name")) {
				filterField.setWidth("200px");
			} 	
			
		    filterField.setInputPrompt("Filter");
		    filterField.addStyleName(ValoTheme.TEXTFIELD_TINY);
		    
		    filterField.addTextChangeListener(change -> {
		    	container.removeContainerFilters(pid);
		        if (! change.getText().isEmpty())
		            container.addContainerFilter(new SimpleStringFilter(pid,change.getText(), true, false));
		    });
		    
			cell.setComponent(filterField);
		}
	}

	private void foundProf() {
		sub.close();
	}

	private void addNewProf() {
		profModal.removeAllComponents();
		profModal.addComponents(yearRankHorzLayout, bachelors, masters, doctoral, postdoc, gender, sourceUrl, photoUrl, submitNewProf);
		
		university.setFilteringMode(FilteringMode.CONTAINS);
    	university.addItems(unisUSACan);
	    university.setInputPrompt("Select a university ");
		
		yearRankHorzLayout.addComponents(joinYear, rank);
		yearRankHorzLayout.setSpacing(true);
		yearRankHorzLayout.setWidth("100%");
		
		joinYear.setWidth("100%");
		rank.setWidth("100%");
		rank.setRequired(true);
		bachelors.setWidth("100%");
		masters.setWidth("100%");
		doctoral.setWidth("100%");
		postdoc.setWidth("100%");
		gender.setWidth("100%");
		gender.addItem("Male");
		gender.addItem("Female");
		sourceUrl.setWidth("100%");
		photoUrl.setWidth("100%");
		submitNewProf.setWidth("100%");
	}

	private void closeListener(CloseEvent e) {
		_MainUI.getApi().getActiveMode().setActiveMode(Mode.NORMAL);
	}

	private void createUI() {
		profModal.setMargin(true);
		profModal.setSpacing(true);
		
    	university.setFilteringMode(FilteringMode.CONTAINS);
    	university.addItems(unis);
	    university.setInputPrompt("Select a university ");
	    
	    nameHorzLayout.addComponents(first_name, last_name);
	    profModal.addComponents(nameHorzLayout, university, search_button);
	    
	    nameHorzLayout.setWidth("100%");
	    nameHorzLayout.setSpacing(true);
	    
	    first_name.setWidth("100%");
	    
	    last_name.setWidth("100%");
	    
	    university.setWidth("100%");
	    
	    search_button.setWidth("100%");
	    search_button.setIcon(FontAwesome.USER_PLUS);
	    
	    sub.setContent(profModal);
		sub.setModal(true);
	}

	private void addValidators() {
		// bind all required items to binder (for a new event)
	    binder.setItemDataSource(bean);
	    binder.bind(first_name, "first_name");
	    binder.bind(last_name, "last_name");
	    binder.bind(university, "university");
	    
	    // enable live validation
	    _MainUI.getApi().liveValidateAll(binder);
	}
}
