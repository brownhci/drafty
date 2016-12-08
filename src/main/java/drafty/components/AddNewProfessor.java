package drafty.components;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.vaadin.data.fieldgroup.BeanFieldGroup;
import com.vaadin.data.util.BeanItem;
import com.vaadin.data.util.GeneratedPropertyContainer;
import com.vaadin.data.util.IndexedContainer;
import com.vaadin.data.util.filter.SimpleStringFilter;
import com.vaadin.data.validator.StringLengthValidator;
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
import com.vaadin.ui.Notification;
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
import drafty.models.ProfNameUni;
import drafty.services.NewProfessorServices;

public class AddNewProfessor {
	
	NewProfessorServices newProfServ = new NewProfessorServices();
	NewProfessor newProf = new NewProfessor();
	BeanFieldGroup<NewProfessor> binder = new BeanFieldGroup<NewProfessor>(NewProfessor.class);
	BeanItem<NewProfessor> bean = new BeanItem<NewProfessor>(newProf);
	
	HashMap<String, ProfNameUni> profs = new HashMap<String, ProfNameUni>();
	private List<String> unisUSACan = _MainUI.getApi().getUniversitiesUSACan();
	private List<String> unis = _MainUI.getApi().getUniversitiesUSACan();
	private List<String> subfields = _MainUI.getApi().getSubfields();
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window(" Add New Professor");
	VerticalLayout profModal = new VerticalLayout();
	
	//first
	HorizontalLayout nameHorzLayout = new HorizontalLayout();
	Button searchBtn = new Button("Add/Search for New Professor", e -> searchProf());
	
	//second
	HorizontalLayout btnsHorzLayout = new HorizontalLayout();
	Label searchProfLabel = new Label();
	Button addNewProfBtn = new Button("Add New (Professor Not Found)", e -> addNewProf());
	Button foundProfBtn = new Button("Close Window (Professor Found)", e -> foundProf());
	
	//third
	Label addProfLabel = new Label();
	
	//misc
	Label label_suggestions = new Label();
	Label label_hr1 = new Label("<hr>", ContentMode.HTML);
	Label label_hr2 = new Label("<hr>", ContentMode.HTML);
	Label label_hr3 = new Label("<hr>", ContentMode.HTML);
	
	
	//first
	TextField first_name = new TextField("First Name");
	TextField last_name = new TextField("Last Name");
	ComboBox university = new ComboBox("University");
	
	
	//second
	IndexedContainer container = new IndexedContainer();
	GeneratedPropertyContainer gpcontainer = new GeneratedPropertyContainer(container);
	Grid resultsGrid = new Grid();
	
	
	//third
	HorizontalLayout yearGenderHorzLayout = new HorizontalLayout();
	TextField joinYear = new TextField("Join Year");
	OptionGroup rank = new OptionGroup("Rank");
	ComboBox subfield = new ComboBox("Subfield");
	ComboBox bachelors = new ComboBox("Bachelors");
	ComboBox masters = new ComboBox("Masters");
	ComboBox doctrate = new ComboBox("Doctrate");
	ComboBox postdoc = new ComboBox("PostDoc");
	ComboBox gender = new ComboBox("Gender");
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

	private void createUI() {
		profModal.setMargin(true);
		profModal.setSpacing(true);
		
    	university.setFilteringMode(FilteringMode.CONTAINS);
    	university.addItems(unis);
	    university.setInputPrompt("Select a university ");
	    
	    nameHorzLayout.addComponents(first_name, last_name);
	    profModal.addComponents(nameHorzLayout, university, label_hr1, searchBtn);
	    
	    nameHorzLayout.setWidth("100%");
	    nameHorzLayout.setSpacing(true);
	    
	    first_name.setWidth("100%");
	    first_name.setRequired(true);
	    
	    last_name.setWidth("100%");
	    last_name.setRequired(true);
	    
	    university.setWidth("100%");
	    university.setRequired(true);
	    
	    searchBtn.setWidth("100%");
	    searchBtn.setIcon(FontAwesome.USER_PLUS);
	    
	    sub.setContent(profModal);
		sub.setModal(true);
	}
	
	private void searchProf() {
		
		boolean uniEmpty = false;
		if(university.getValue() == null || university.getValue().toString().isEmpty()) {
			uniEmpty = true;
		}
		
		if(first_name.isEmpty() || last_name.isEmpty() || uniEmpty) {
			Notification notification = new Notification("All fields are required.", Notification.Type.WARNING_MESSAGE);
			notification.setStyleName("failure");
			notification.show(UI.getCurrent().getPage());
		} else {
			profs = newProfServ.searchForProf(newProf.getFirst_name() + " " + newProf.getLast_name());
			for (Map.Entry<String, ProfNameUni> entry : profs.entrySet()) {
				if (entry.getKey().equals("no")) {
					addNewProf();
				} else {
					profList();
				}
				break;
			}	
		}
	}
	
	private void profList() {
		profModal.removeAllComponents();
		buildGrid();
		
		searchProfLabel = new Label("Is <b>" + newProf.getFirst_name() + " " + newProf.getLast_name() 
									+ "</b> from <b>" + newProf.getUniversity() + "</b> listed below?", ContentMode.HTML);
		
		profModal.addComponents(searchProfLabel, resultsGrid, label_hr2, btnsHorzLayout);
		btnsHorzLayout.addComponents(addNewProfBtn, foundProfBtn);
		btnsHorzLayout.setSpacing(true);
		
		addNewProfBtn.setIcon(FontAwesome.USER_PLUS);
		foundProfBtn.setIcon(FontAwesome.CLOSE);
		
		btnsHorzLayout.setWidth("100%");
		addNewProfBtn.setWidth("100%");
		foundProfBtn.setWidth("100%");
		foundProfBtn.addStyleName("button-gray");
	}

	private void buildGrid() {
		container.addContainerProperty("name", String.class, null);
		container.addContainerProperty("university", String.class, null);
		
		gpcontainer = new GeneratedPropertyContainer(container);
		
		resultsGrid.setContainerDataSource(gpcontainer);
		resultsGrid.setSelectionMode(Grid.SelectionMode.NONE);
		resultsGrid.setWidth("100%");
		resultsGrid.setHeightMode(HeightMode.ROW);
		resultsGrid.setHeightByRows(8);
		
		//Set Column header names
		resultsGrid.getColumn("name").setHeaderCaption("Professor Full Name").setWidth(200);
		resultsGrid.getColumn("university").setHeaderCaption("University");
		
		for (Map.Entry<String, ProfNameUni> entry : profs.entrySet()) {
			resultsGrid.addRow(entry.getValue().getName(), entry.getValue().getUniversity());
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

		int y = 40;
		int x = sub.getPositionX();
		sub.setPosition(x, y);
		
		addProfLabel = new Label("Please add information for <b>" + newProf.getFirst_name() + " " + newProf.getLast_name() 
								+ "</b> from <b>" + newProf.getUniversity() + "</b>.", ContentMode.HTML);
		
		String infoString = "<hr><span style=\"color: rgb(153, 153, 153); display: block; text-align: center;\">*This information is usually found on their homepage, bio, or department directory.</span><hr>";
		Label infoText = new Label(infoString, ContentMode.HTML);
		
		profModal.addComponents(addProfLabel, infoText, rank, yearGenderHorzLayout, subfield, bachelors, masters, doctrate, postdoc, sourceUrl, photoUrl, label_hr3, submitNewProf);
		
		university.setFilteringMode(FilteringMode.CONTAINS);
    	university.addItems(unisUSACan);
	    university.setInputPrompt("Select a university ");
		
		yearGenderHorzLayout.addComponents(joinYear, gender);
		yearGenderHorzLayout.setSpacing(true);
		yearGenderHorzLayout.setWidth("100%");
		
		rank.setWidth("100%");
		rank.addStyleName("v-select-optiongroup-horizontal");
		rank.setRequired(true);
		rank.addItem("Full");
		rank.addItem("Associate");
		rank.addItem("Assistant");
		
		joinYear.setWidth("100%");
		joinYear.addValueChangeListener((e) -> {
			joinYear.addValidator(new StringLengthValidator("Must be valid 4 digit year.", 4, 4, false));
		});
		
		subfield.setWidth("100%");
		subfield.addItems(subfields);
		subfield.setFilteringMode(FilteringMode.CONTAINS);
		
		bachelors.setWidth("100%");
		masters.setWidth("100%");
		doctrate.setWidth("100%");
		postdoc.setWidth("100%");
		bachelors.addItems(unis);
		masters.addItems(unis);
		doctrate.addItems(unis);
		postdoc.addItems(unis);
		bachelors.setFilteringMode(FilteringMode.CONTAINS);
		masters.setFilteringMode(FilteringMode.CONTAINS);
		doctrate.setFilteringMode(FilteringMode.CONTAINS);
		postdoc.setFilteringMode(FilteringMode.CONTAINS);
		
		gender.setWidth("100%");
		gender.addStyleName("v-select-optiongroup-horizontal");
		gender.addItem("Male");
		gender.addItem("Female");
		
		sourceUrl.setWidth("100%");
		photoUrl.setWidth("100%");
		submitNewProf.setWidth("100%");
		submitNewProf.setIcon(FontAwesome.FLOPPY_O);
	}

	private void closeListener(CloseEvent e) {
		_MainUI.getApi().getActiveMode().setActiveMode(Mode.NORMAL);
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

	private void submitNewProf() {
		if(rank.isEmpty()) {
			Notification notification = new Notification("Rank is required.", Notification.Type.WARNING_MESSAGE);
			notification.setStyleName("failure");
			notification.show(UI.getCurrent().getPage());
		} else {
			dataBind();
			
			newProf.setPerson_id(newProfServ.insertNewProf(newProf.getFullName()));
			
			if(newProfServ.insertNewSuggestions(newProf) && newProfServ.insertNewValidations(newProf.getPerson_id()) && newProfServ.insertNewValidationSuggestions(newProf.getPerson_id())) {
				System.out.println("Add new Professor Success");
				Notification notification = new Notification("Success " + newProf.getFirst_name() + " " + newProf.getLast_name() + " Added.", Notification.Type.ERROR_MESSAGE);
				notification.setStyleName("success");
				notification.setHtmlContentAllowed(true);
				notification.setIcon(FontAwesome.THUMBS_O_UP);
				notification.setDelayMsec(1750);
				notification.show(UI.getCurrent().getPage());
				
				sub.close();
			} else {
				System.out.println("Add new Professor Error");
				Notification notification = new Notification("Sorry there appears to be something wrong.  Please try again. ", Notification.Type.ERROR_MESSAGE);
				notification.setStyleName("success");
				notification.setHtmlContentAllowed(true);
				notification.setIcon(FontAwesome.FROWN_O);
				notification.setDelayMsec(1750);
				notification.show(UI.getCurrent().getPage());
			}
		}
	}
	
	private void dataBind() {
		
		//rank is required
		newProf.setRank(rank.getValue().toString());
		
		if(joinYear.getValue() == null || joinYear.getValue().toString().isEmpty()) {
			newProf.setJoin_year("");
		} else {
			newProf.setJoin_year(joinYear.getValue());
		}
		
		if(gender.getValue() == null || gender.getValue().toString().isEmpty()) {
			newProf.setGender("");
		} else {
			newProf.setGender(gender.getValue().toString());
		}
		
		if(subfield.getValue() == null || subfield.getValue().toString().isEmpty()) {
			newProf.setSubfield("");
		} else {
			newProf.setSubfield(subfield.getValue().toString());
		}
		
		if(bachelors.getValue() == null || bachelors.getValue().toString().isEmpty()) {
			newProf.setBachelors("");
		} else {
			newProf.setBachelors(bachelors.getValue().toString());
		}
		
		if(masters.getValue() == null || masters.getValue().toString().isEmpty()) {
			newProf.setMasters("");
		} else {
			newProf.setMasters(masters.getValue().toString());
		}
		
		if(doctrate.getValue() == null || doctrate.getValue().toString().isEmpty()) {
			newProf.setDoctorate("");
		} else {
			newProf.setDoctorate(doctrate.getValue().toString());
		}
		
		if(postdoc.getValue() == null || postdoc.getValue().toString().isEmpty()) {
			newProf.setPostdoc("");
		} else {
			newProf.setPostdoc(postdoc.getValue().toString());
		}
		
		if(sourceUrl.getValue() == null || sourceUrl.getValue().toString().isEmpty()) {
			newProf.setSource("");
		} else {
			newProf.setSource(sourceUrl.getValue().toString());
		}
		if(photoUrl.getValue() == null || photoUrl.getValue().toString().isEmpty()) {
			newProf.setPhotoURL("");
		} else {
			newProf.setPhotoURL(photoUrl.getValue().toString());
		}
	}
}
