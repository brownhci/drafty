package drafty.test;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.ResultSetMetaData;
import java.sql.SQLException;

import javax.naming.Context;
import javax.naming.InitialContext;
import javax.sql.DataSource;

import com.vaadin.data.util.GeneratedPropertyContainer;
import com.vaadin.data.util.IndexedContainer;
import com.vaadin.data.util.filter.SimpleStringFilter;
import com.vaadin.event.FieldEvents.TextChangeEvent;
import com.vaadin.event.FieldEvents.TextChangeListener;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.server.Responsive;
import com.vaadin.shared.ui.grid.HeightMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.Button.ClickEvent;
import com.vaadin.ui.Button.ClickListener;
import com.vaadin.ui.CssLayout;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Grid.HeaderCell;
import com.vaadin.ui.Grid.HeaderRow;
import com.vaadin.ui.Label;
import com.vaadin.ui.MenuBar;
import com.vaadin.ui.Panel;
import com.vaadin.ui.TextArea;
import com.vaadin.ui.TextField;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;

import drafty._MainUI;

public class Test extends VerticalLayout implements View {
	
	private static final long serialVersionUID = -6955613369737022400L;
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();
	
	VerticalLayout mainLayout = new VerticalLayout();
	protected final MenuBar draftyMenu = new MenuBar();
	CssLayout panelWrap = new CssLayout();	
	Panel resultsPanel = new Panel();
	
	private TextArea sql = new TextArea();
	private Button submit = new Button("Submit");
	private Label result = new Label("Result: ");
	int flag = 0;
	
	//Results Grid
	IndexedContainer container = new IndexedContainer();
	GeneratedPropertyContainer gpcontainer = new GeneratedPropertyContainer(container);
	Grid resultsGrid = new Grid();
	
	public Test() {
		System.out.println("test");
		
		// main layout wrapper
		mainLayout.setWidth("100%");
		this.addComponent(mainLayout);
		mainLayout.addStyleName("main-wrap");
		Responsive.makeResponsive(mainLayout);
		
		// panel & panelLayout
		mainLayout.addComponent(panelWrap);
		panelWrap.setWidth("100%");
		panelWrap.setHeight("100%");
		panelWrap.addStyleName("panelWrap");
		Responsive.makeResponsive(panelWrap);
		panelWrap.addStyleName("panel-padding");
		
		panelWrap.addComponents(sql, submit, result);	
		sql.setWidth("100%");
		submit.setWidth("100%");
		result.setWidth("100%");
		
		panelWrap.setWidth("100%");
		panelWrap.setHeight("100%");
		panelWrap.addStyleName("panelWrap");
		panelWrap.addStyleName("panel-padding");
		
		submit.addClickListener(new ClickListener() {
			@Override
			public void buttonClick(ClickEvent event) { btnClick("submit"); }
		});
	}

	private void btnClick(String button) {
		if(button.equals("submit")) {
			sqlSel();
			panelWrap.addComponent(resultsGrid);
			if(flag == 0)
				addFilters();
		} else {
			panelWrap.removeComponent(resultsGrid);
		}
	}
	
	private void sqlSel() {
		
		try {
	      Context initialContext = new InitialContext();
	      DataSource datasource = (DataSource)initialContext.lookup(DATASOURCE_CONTEXT);
	      if (datasource != null) {
	        Connection conn = datasource.getConnection();
	        
	        PreparedStatement stmt = conn.prepareStatement(sql.getValue());
	        try {
	        	ResultSet rs = stmt.executeQuery();
	        	ResultSetMetaData rsmd = rs.getMetaData();

	        	Integer columnsNumber = rsmd.getColumnCount();
	        	Integer count = 1;
	        	
	        	container.removeAllItems();
	        	
	        	while (count <= columnsNumber) {
	        		container.addContainerProperty(count.toString(), String.class, null);
	        		count++;
				}
	        	
	        	gpcontainer = new GeneratedPropertyContainer(container);
				
				resultsGrid.setContainerDataSource(gpcontainer);
				resultsGrid.setSelectionMode(Grid.SelectionMode.SINGLE);
				resultsGrid.setWidth("100%");
				resultsGrid.setHeightMode(HeightMode.ROW);
				resultsGrid.setHeightByRows(8);
	        	
				while (rs.next()) {
					//result.setValue(rs.getString(1));
					if(columnsNumber == 1) {
						resultsGrid.addRow(rs.getString(1));
					} else if(columnsNumber == 2) {
						resultsGrid.addRow(rs.getString(1), rs.getString(2));
					} else if(columnsNumber == 3) {
						resultsGrid.addRow(rs.getString(1), rs.getString(2), rs.getString(3));
					} else if(columnsNumber == 4) {
						resultsGrid.addRow(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4));
					} else if(columnsNumber == 5) {
						resultsGrid.addRow(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5));
					}
					//resultsGrid.addRow(rs.getString(1), rs.getString(2), rs.getString(3), rs.getString(4), rs.getString(5), rs.getString(6));
				}
	        } catch (SQLException e) {
				System.out.println(e.getMessage());
				result.setValue("Error: " + e.getMessage());
			}
	        stmt.close();
	        conn.close();
	      }
	    }
        catch (Exception ex)
        {
        	System.out.println("Exception " + ex);
        	result.setValue("Error: " + ex.getMessage());
        }
	}
	
	public void addFilters() {
		
		flag = 1;
		
		// Create a header row to hold column filters
		HeaderRow filterRow = resultsGrid.appendHeaderRow();

		// Set up a filter for all columns
		for (final Object pid: resultsGrid.getContainerDataSource().getContainerPropertyIds()) {
		    HeaderCell cell = filterRow.getCell(pid);
		    // Have an input field to use for filter
		    final TextField filterField = new TextField();
		    filterField.setColumns(8);
		    filterField.setInputPrompt("Filter");
		    filterField.addStyleName(ValoTheme.TEXTFIELD_TINY);
		    
		    filterField.addTextChangeListener(new TextChangeListener() {
			    private static final long serialVersionUID = -448372085933722984L;		
			    String filterText;
		    
				@Override
				public void textChange(TextChangeEvent change) {
					// Can't modify filters so need to replace
			    	container.removeContainerFilters(pid);
			    	//store input
			    	filterText = change.getText();
	
					// (Re)create the filter if necessary
			        if (! change.getText().isEmpty())
			            container.addContainerFilter(new SimpleStringFilter(pid,change.getText(), true, false));
				}
		    });
		    cell.setComponent(filterField);
		}
	}
	
	@Override
	public void enter(ViewChangeEvent event) {
		
	}
}
