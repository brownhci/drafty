package test;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import com.vaadin.data.Property;
import com.vaadin.data.Property.ValueChangeEvent;
import com.vaadin.data.util.GeneratedPropertyContainer;
import com.vaadin.data.util.IndexedContainer;
import com.vaadin.data.util.filter.SimpleStringFilter;
import com.vaadin.event.FieldEvents.BlurEvent;
import com.vaadin.event.FieldEvents.BlurListener;
import com.vaadin.event.FieldEvents.TextChangeEvent;
import com.vaadin.event.FieldEvents.TextChangeListener;
import com.vaadin.event.ItemClickEvent;
import com.vaadin.event.ItemClickEvent.ItemClickListener;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.server.FontAwesome;
import com.vaadin.server.Page;
import com.vaadin.server.Resource;
import com.vaadin.server.Responsive;
import com.vaadin.server.ThemeResource;
import com.vaadin.server.WebBrowser;
import com.vaadin.shared.ui.grid.HeightMode;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Alignment;
import com.vaadin.ui.Button;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Grid.HeaderCell;
import com.vaadin.ui.Grid.HeaderRow;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.MenuBar.MenuItem;
import com.vaadin.ui.Panel;
import com.vaadin.ui.TextField;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;
import com.vaadin.ui.themes.ValoTheme;

import drafty.views._MainUI;

public class Profs_Old extends VerticalLayout implements View, Property.ValueChangeListener {
	
	private static final long serialVersionUID = -6955613369737022454L;
	
	VerticalLayout mainLayout = new VerticalLayout();
	protected final MenuBar draftyMenu = new MenuBar();
	Button info = new Button("", FontAwesome.QUESTION_CIRCLE);
	
	HorizontalLayout leftH = new HorizontalLayout();
	HorizontalLayout rightH = new HorizontalLayout();
	HorizontalLayout cookieMenu = new HorizontalLayout();
	
	Label label_headingL = new Label("<h3>Computer Science Professors</h3>", ContentMode.HTML);
	Label label_headingR = new Label("<h5>Brown University HCI Research Group</h5>", ContentMode.HTML);
	
	CssLayout panelWrap = new CssLayout();
	
	Panel resultsPanel = new Panel();
	VerticalLayout resultsPanelLayout = new VerticalLayout();
	
	IndexedContainer container = new IndexedContainer();
	Grid resultsGrid = new Grid();
	
    
	WebBrowser webBrowser = Page.getCurrent().getWebBrowser();
	String ipAddress = webBrowser.getAddress();
    
	
	@Override
	public void enter(ViewChangeEvent event) {
		populateGrid();
	}
    
	@SuppressWarnings("serial")
	public Profs_Old() {
		
		//menu
		mainLayout.addComponent(draftyMenu);
		draftyMenu.setWidth("100%");
		draftyMenu.addStyleName("draftymenu");
		Responsive.makeResponsive(draftyMenu);
		MenuItem draftyLogo = draftyMenu.addItem("Drafty", (Resource) new ThemeResource("img/main-navbar-logo.png"), new MenuBar.Command() {
			
			@Override
			public void menuSelected(MenuItem selectedItem) {
				//nothing
			}
		});
		draftyLogo.setStyleName("draftylogo v-menubar-menuitem-draftydesktop");
		
		
		container.addContainerProperty("id", String.class, null);
		container.addContainerProperty("name", String.class, null);
		container.addContainerProperty("university", String.class, null);
		container.addContainerProperty("joinyear", String.class, null);
		container.addContainerProperty("rank", String.class, null);
		container.addContainerProperty("subfield", String.class, null);
		container.addContainerProperty("bachelors", String.class, null);
		container.addContainerProperty("masters", String.class, null);
		container.addContainerProperty("doctorate", String.class, null);
		container.addContainerProperty("postdoc", String.class, null);
		container.addContainerProperty("gender", String.class, null);
		container.addContainerProperty("photourl", String.class, null);
		container.addContainerProperty("sources", String.class, null);
		
		GeneratedPropertyContainer gpcontainer = new GeneratedPropertyContainer(container);
		
		resultsGrid.setContainerDataSource(gpcontainer);
		resultsGrid.setSelectionMode(Grid.SelectionMode.NONE);
		
		//Gets designated column value from row selection 
		resultsGrid.addItemClickListener(new ItemClickListener() {
            @Override
            public void itemClick(ItemClickEvent e) {
                if (e.isDoubleClick()) {
	                personSelect(
						(String) e.getItem().getItemProperty("id").getValue(), 
						(String) e.getItem().getItemProperty("name").getValue(), 
						container.getContainerProperty(e.getItemId(), e.getPropertyId()).getValue().toString(),
						e.getPropertyId().toString()
					);
                } 
            }
        });	
		
		setSpacing(false);
		setMargin(false);
		
		// main layout wrapper
		mainLayout.setWidth("100%");
		this.addComponent(mainLayout);
		mainLayout.addStyleName("main-wrap");
		Responsive.makeResponsive(mainLayout);
		
		// main heading above panel
		leftH.addComponent(label_headingL);
		leftH.addStyleName("horizontal-wrap");
		Responsive.makeResponsive(leftH);
		rightH.addComponent(label_headingR);
		rightH.addStyleName("horizontal-wrap");
		Responsive.makeResponsive(rightH);
		cookieMenu.addComponents(leftH, rightH);
		mainLayout.addComponent(cookieMenu);
		cookieMenu.addStyleName("main-heading");
		cookieMenu.setWidth("100%");
		cookieMenu.setComponentAlignment(leftH, Alignment.MIDDLE_LEFT);
		cookieMenu.setComponentAlignment(rightH, Alignment.MIDDLE_RIGHT);
		
		// panel & panelLayout
		mainLayout.addComponent(panelWrap);
		panelWrap.setWidth("100%");
		panelWrap.addStyleName("panelWrap");
		Responsive.makeResponsive(panelWrap);
		panelWrap.addStyleName("panel-padding");
		
		//results panel from search
		panelWrap.addComponent(resultsPanel);
		resultsPanel.setWidth("100%");
		resultsPanel.setContent(resultsPanelLayout);
		resultsPanelLayout.setMargin(true);
		resultsPanelLayout.setSpacing(true);
		resultsPanel.addStyleName("panel-full-responsive");
		resultsPanel.addStyleName("panel-bottom-spacing");
		
		//resultsPanelLayout.addComponent(suggestionMode);
		//resultsPanelLayout.setComponentAlignment(suggestionMode, Alignment.TOP_RIGHT);
		
		resultsPanelLayout.addComponent(resultsGrid);
		resultsGrid.setWidth("100%");
	    //resultsGrid.setHeightMode(HeightMode.ROW);
	    //resultsGrid.setHeightByRows(15);
	    resultsGrid.setHeightMode(HeightMode.CSS);
		resultsGrid.setHeight((Page.getCurrent().getWebBrowser().getScreenHeight() - 340), Unit.PIXELS);
	    
	    //Set Column header names
	    resultsGrid.getColumn("id").setHeaderCaption("ID").setWidth(80);
		resultsGrid.getColumn("name").setHeaderCaption("Name").setExpandRatio(0);
		resultsGrid.getColumn("university").setHeaderCaption("University");
		resultsGrid.getColumn("bachelors").setHeaderCaption("Bachelors").setExpandRatio(0);
		resultsGrid.getColumn("masters").setHeaderCaption("Masters");
		resultsGrid.getColumn("doctorate").setHeaderCaption("Doctorate");
		resultsGrid.getColumn("postdoc").setHeaderCaption("PostDoc");
		resultsGrid.getColumn("joinyear").setHeaderCaption("Join Year").setWidth(80);
		resultsGrid.getColumn("rank").setHeaderCaption("Rank").setWidth(110);
		resultsGrid.getColumn("subfield").setHeaderCaption("Subfield");
		resultsGrid.getColumn("gender").setHeaderCaption("Gender").setWidth(100);
		resultsGrid.getColumn("photourl").setHeaderCaption("PhotoUrl");
		resultsGrid.getColumn("sources").setHeaderCaption("Sources");
		
	    //adds filters to grid
		addFilters();
		
		populateGrid();
		
		resultsGrid.removeColumn("id");
	}
	
	public void personSelect(String person_id, String name, String value, String column) {
			//Notification.show(person_id + " " + name + ": " + value);
			// Create a sub-window and add it to the main window
			Window sub = new Window("Suggestion / Validation Example");
			sub.setWidth("40%");
			sub.setHeight("30%");
			VerticalLayout vl = new VerticalLayout();
			vl.setMargin(true);
			vl.setSpacing(true);
			vl.addComponent(new Label(person_id + " " + name));
			vl.addComponent(new Label(value));
			sub.setContent(vl);
			sub.setModal(true);
			UI.getCurrent().addWindow(sub);
	}
	
	public void updatePerson() {
		
	}
	
	public void addFilters() {
		// Create a header row to hold column filters
		HeaderRow filterRow = resultsGrid.appendHeaderRow();

		// Set up a filter for all columns
		for (Object pid: resultsGrid.getContainerDataSource().getContainerPropertyIds()) {
		    HeaderCell cell = filterRow.getCell(pid);
		    
		    // Have an input field to use for filter
		    final TextField filterField = new TextField();
		    if(pid.equals("id") || pid.equals("joinyear")) {
			    filterField.setColumns(4);
		    } else if (pid.equals("rank") || pid.equals("gender")) {
			    filterField.setColumns(6);
		    } else {
			    filterField.setColumns(10);
		    }
		    filterField.setInputPrompt("Filter");
		    filterField.addStyleName(ValoTheme.TEXTFIELD_TINY);
		    
		    
		    // Update filter When the filter input is changed
			/*    	
		    filterField.addTextChangeListener(change -> {
		        // Can't modify filters so need to replace
		    	container.removeContainerFilters(pid);
		    	Notification.show("Filter Activate: " + pid + " - " + change.getText());
		    	
			    filterField.addBlurListener(e -> {
			    	Notification.show("Filter Blur: " + pid + " - " + change.getText());
			    });
			    
		        // (Re)create the filter if necessary
		        if (! change.getText().isEmpty())
		            container.addContainerFilter(new SimpleStringFilter(pid,change.getText(), true, false));
		    });
		    */
		    cell.setComponent(filterField);
		} 
	}
	
	public void populateGrid() {
		System.out.println("Pop grid ");
		
    	//clears grid data from grid datasource
		resultsGrid.getContainerDataSource().removeAllItems();
    	
		String DATASOURCE_CONTEXT = _MainUI.getDataProvider().getJNDI();
	    
	    try {
	      Context initialContext = new InitialContext();
	      
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null) {
	        Connection conn = datasource.getConnection();
	        String sql = "SELECT * FROM _View_CSV_Name ";
	        PreparedStatement stmt = conn.prepareStatement(sql);
	        try {
	        	String personId = "";
	        	String typeId = "";
	        	String personIdSt = "1"; //for first record
	        	String typeIdSt = "2"; //always have a university
	        	
	        	String Full_Name = "Chitta Baral";
	        	String University = "";
	        	String Bachelors = "";
	        	String Masters = "";
	        	String Doctorate = "";
	        	String PostDoc = "";
	        	String Gender = "";
	        	String Rank = "";
	        	String JoinYear = "";
	        	String Subfield = "";
	        	String PhotoUrl = "";
	        	String Sources = "";
	        	
				ResultSet rs = stmt.executeQuery();
				while (rs.next()) {
					personId = rs.getString("idPerson");
					typeId = rs.getString("idSuggestionType");
					
					if(personId.equals(personIdSt)) {
						if(typeId.equals("2")) { //
							University = rs.getString("suggestion");
						} else if(typeId.equals("3")) { //
							Bachelors = rs.getString("suggestion");
						} else if(typeId.equals("4")) { //
							Masters = rs.getString("suggestion");
						} else if(typeId.equals("5")) { //
							Doctorate = rs.getString("suggestion");
						} else if(typeId.equals("6")) { //
							PostDoc = rs.getString("suggestion");
						} else if(typeId.equals("7")) { //
							JoinYear = rs.getString("suggestion");
						} else if(typeId.equals("8")) { //
							Rank = rs.getString("suggestion");
						} else if(typeId.equals("9")) { //
							Subfield = rs.getString("suggestion");
						} else if(typeId.equals("10")) { //
							Gender = rs.getString("suggestion");
						} else if(typeId.equals("11")) { //
							PhotoUrl = rs.getString("suggestion");
						} else if(typeId.equals("12")) { //
							Sources = rs.getString("suggestion");
						} else {
							System.out.println(typeId + " " + Full_Name + " " + rs.getString("suggestion"));
						}
					} else {
						resultsGrid.addRow(personIdSt, Full_Name, University, JoinYear, Rank, Subfield, Bachelors, Masters, Doctorate, Gender, PostDoc, PhotoUrl, Sources);
						//clears variables
						Full_Name = rs.getString("name"); //always the same
			        	University = rs.getString("suggestion"); //skipped due to logic
			        	Bachelors = "";
			        	Masters = "";
			        	Doctorate = "";
			        	PostDoc = "";
			        	Gender = "";
			        	Rank = "";
			        	JoinYear = "";
			        	Subfield = "";
			        	PhotoUrl = "";
			        	Sources = "";
					}
					
					personIdSt = personId;
					typeIdSt = typeId;
				}
			} catch (SQLException e) {
				System.out.println(e.getMessage());
			}
	        conn.close();
	      }
	    }
        catch (Exception ex)
        {
        	System.out.println("Exception" + ex);
        }
    }
	
	@Override
	public void valueChange(ValueChangeEvent event) {
		// TODO Auto-generated method stub
		
	}	
}