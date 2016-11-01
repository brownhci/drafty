package drafty.components;

import java.util.List;

import com.vaadin.data.fieldgroup.BeanFieldGroup;
import com.vaadin.data.util.BeanItem;
import com.vaadin.server.FontAwesome;
import com.vaadin.shared.ui.combobox.FilteringMode;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.ComboBox;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.Panel;
import com.vaadin.ui.TextField;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;
import com.vaadin.ui.Window.CloseEvent;

import drafty._MainUI;
import drafty.models.Mode;
import drafty.models.NewProfessor;

public class AddNewProfessor {

	// Create a sub-window and add it to the main window
	final Window sub = new Window(" Add New Professor");
	VerticalLayout addNewProfModal = new VerticalLayout();
	Panel resultsPanel = new Panel();
	VerticalLayout resultsPanelLayout = new VerticalLayout();
	
	Label label_suggestions = new Label();
	Label label_hr = new Label("<hr />", ContentMode.HTML);
	
	NewProfessor newProf = new NewProfessor();
	BeanFieldGroup<NewProfessor> binder = new BeanFieldGroup<NewProfessor>(NewProfessor.class);
	BeanItem<NewProfessor> bean = new BeanItem<NewProfessor>(newProf);
	
	Button search_button = new Button("Add New Professor");
	
	HorizontalLayout nameHorzLayout = new HorizontalLayout();
	TextField first_name = new TextField("First Name");
	TextField last_name = new TextField("Last Name");
	
	ComboBox university = new ComboBox("University");
	
	
	public AddNewProfessor() {
		sub.setImmediate(true);
		sub.addCloseListener(e -> closeListener(e));
		
		sub.setWidth("640px");
		sub.setResizable(false);
		sub.setIcon(FontAwesome.USER_PLUS);
		_MainUI.getApi().getActiveMode().setActiveMode(Mode.SUGGESTION);
		
		//UI creation
		addValidators();
		createUI();
		
		UI.getCurrent().addWindow(sub);
		UI.getCurrent().setFocusedComponent(sub);	    
	}

	private void closeListener(CloseEvent e) {
		_MainUI.getApi().getActiveMode().setActiveMode(Mode.NORMAL);
	}

	private void createUI() {
		addNewProfModal.setMargin(true);
		addNewProfModal.setSpacing(true);
		
    	university.setFilteringMode(FilteringMode.CONTAINS);
    	List<String> unis = _MainUI.getApi().getUniversitiesUSACan();
    	university.addItems(unis);
	    university.setInputPrompt("Select a university ");
	    
	    nameHorzLayout.addComponents(first_name, last_name);
	    addNewProfModal.addComponents(nameHorzLayout, university, search_button);
	    
	    nameHorzLayout.setWidth("100%");
	    nameHorzLayout.setSpacing(true);
	    
	    first_name.setWidth("100%");
	    
	    last_name.setWidth("100%");
	    
	    university.setWidth("100%");
	    
	    search_button.setWidth("100%");
	    search_button.setIcon(FontAwesome.USER_PLUS);
	    
	    sub.setContent(addNewProfModal);
		sub.setModal(true);
	}

	private void addValidators() {
		// bind all required items to binder (for a new event)
	    binder.setItemDataSource(bean);
	    binder.bind(first_name, "first_name");
	    binder.bind(last_name, "last_name");
	    
	    // enable live validation
	    _MainUI.getApi().liveValidateAll(binder);
	}
}
