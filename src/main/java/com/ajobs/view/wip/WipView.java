package com.ajobs.view.wip;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import javax.validation.constraints.Max;
import javax.validation.constraints.NotNull;

import com.ajobs.component.SearchBarOld;
import com.ajobs.event.DraftyEvent.CloseOpenWindowsEvent;
import com.ajobs.event.DraftyEventBus;
import com.ajobs.util.DataImportSpring2018;
import com.ajobs.util.clean.PopulateNewEmptyFields;
import com.ajobs.util.clean.PopulatePrivateFields;
import com.ajobs.util.clean.ProfDbMigrate;
import com.vaadin.data.Binder;
import com.vaadin.data.ValidationResult;
import com.vaadin.data.Validator;
import com.vaadin.data.ValueContext;
import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.server.Responsive;
import com.vaadin.ui.Button;
import com.vaadin.ui.ComboBox;
import com.vaadin.ui.Component;
import com.vaadin.ui.Grid;
import com.vaadin.ui.Grid.SelectionMode;
import com.vaadin.ui.HorizontalLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.NativeSelect;
import com.vaadin.ui.Panel;
import com.vaadin.ui.TextField;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.themes.ValoTheme;

@SuppressWarnings("serial")
public class WipView extends Panel implements View {
	
	private Label titleLabel;
    private final VerticalLayout root;
    private Button insertEmptyFields = new Button("Insert Missing Empty Suggestions for CS Profs");
    
    private PopulateNewEmptyFields popNewEmptyFields = new PopulateNewEmptyFields();
    private DataImportSpring2018 spring2018 = new DataImportSpring2018();
    
    
    @Override
	public void enter(ViewChangeEvent event) {
		
	}	
    
	public WipView() {
		addStyleName(ValoTheme.PANEL_BORDERLESS);
        setSizeFull();
        DraftyEventBus.register(this);

        root = new VerticalLayout();
        root.setSizeFull();
        root.setSpacing(false);
        root.addStyleName("spreadsheet-view");
        setContent(root);
        Responsive.makeResponsive(root);
        
        SearchBarOld sb = new SearchBarOld();
        root.addComponent(sb);
        
        root.addComponent(buildHeader());
        
        Component content = buildContent();
        Component content2 = buildContent2();
        root.addComponents(content, content2);
        root.setExpandRatio(content, 1);
        
        // All the open sub-windows should be closed whenever the root layout
        // gets clicked.
        root.addLayoutClickListener(e -> {
        		DraftyEventBus.post(new CloseOpenWindowsEvent());
        });
	}

	private Component buildHeader() {
        HorizontalLayout header = new HorizontalLayout();
        header.addStyleName("viewheader");

        titleLabel = new Label("AJobs");
        titleLabel.setSizeUndefined();
        titleLabel.addStyleName(ValoTheme.LABEL_H1);
        titleLabel.addStyleName(ValoTheme.LABEL_NO_MARGIN);
        header.addComponent(titleLabel);

        //newjobButton = buildNewJobsButton();
        //Component edit = buildEditButton();
        
        Button profDbRunMigrate = new Button("Spring 2018 - Write to DB", e -> spring2018.writeCurDataFromDB());
        Button profDbMatch2018Data = new Button("Spring 2018 - Run Matching", e -> spring2018.runDataMatch());
        insertEmptyFields.addClickListener(e -> popNewEmptyFields.profsInsertEmptyFieldsForSuggestionType());
        
        HorizontalLayout tools = new HorizontalLayout(insertEmptyFields, profDbRunMigrate, profDbMatch2018Data);
        tools.addStyleName("toolbar");
        header.addComponent(tools);

        return header;
    }
	
	private class Todo {
		@NotNull
		private String task;
		@Max(4)
		private String done;
		private String number;
		public Todo(String task, String done, String number) {
			super();
			this.task = task;
			this.done = done;
			this.number = number;
		}
		private String getTask() {
			return task;
		}
		private void setTask(String task) {
			this.task = task;
		}
		private String getDone() {
			return done;
		}
		private void setDone(String done) {
			this.done = done;
		}
		private String getNumber() {
			return number;
		}
		private void setNumber(String number) {
			this.number = number;
		}
	}
	

	Grid<Todo> grid = new Grid<Todo>(Todo.class);
	Binder<Todo> binder = grid.getEditor().getBinder();
	private Component buildContent() {
		grid.setSelectionMode(SelectionMode.NONE);
		
		Validator<? super Todo> beforeConversion2 = new Validator<Todo> ( ) {
    		@Override
    		public ValidationResult apply(Todo todo, ValueContext context) {
    			System.out.println("beforeConversion2 val = " + todo.task);
    			System.out.println("beforeConversion2 val = " + todo.done);
    			System.out.println("beforeConversion2 val = " + todo.number);
    			System.out.println("");
    			
    			if(todo.task.isEmpty()) {
                   return  ValidationResult.error ( "zomg turrible errorz" );
               } else {
                   return  ValidationResult.ok () ;
               }
    		}
        };
    	
    	Validator<String> beforeConversion = new Validator < String > ( ) {
            @Override
            public ValidationResult apply (String s, ValueContext valueContext) {
            	System.out.println("beforeConversion: " + s);
            	System.out.println("beforeConversion: " + valueContext.getComponent().toString());
            	System.out.println("beforeConversion: " + valueContext.getComponent().get().getId());
            	
               if(s.length ()!= 4) {
                   return  ValidationResult.error ( "Year must consist of 4 digits" );
               } else {
                   return  ValidationResult.ok () ;
               }
            }
        };
		
		VerticalLayout vLay = new VerticalLayout();
		
		List<Todo> items = Arrays.asList(new Todo("Done task", "true", "11"), new Todo("Not done", "false", "22"));

		grid.setItems(items);
		
		TextField taskField = new TextField();
		//Binding<Todo, String> taskBinding = binder.withValidator(beforeConversion2).bind(taskField, Todo::getTask, Todo::setTask);
		Todo todo = new Todo(null, null, null);
		binder.setBean(todo);
		
		TextField doneField = new TextField();
		
		TextField caloriesTextField = new TextField();
		caloriesTextField.setId("caloriesTextField");
		binder.forField(caloriesTextField).withValidator(beforeConversion).bind(Todo::getNumber, Todo::setNumber);
		
		
		//grid.addColumn(Todo::getTask).setId("1").setEditorComponent(taskField, Todo::setTask).setEditorBinding(taskBinding).setExpandRatio(1);
		grid.addColumn(Todo::getTask).setId("1").setEditorComponent(taskField, Todo::setTask).setExpandRatio(1);
		grid.addColumn(Todo::getDone).setId("2").setEditorComponent(doneField, Todo::setDone).setExpandRatio(1);
		grid.addColumn(Todo::getNumber).setId("3").setEditorComponent(caloriesTextField, Todo::setDone).setExpandRatio(1);
		
		grid.getEditor().setEnabled(true);
        vLay.addComponents(grid);
        
        return grid;
	}
	
	Grid<Todo> grid2 = new Grid<Todo>(Todo.class);
	Binder<Todo> binder2 = grid.getEditor().getBinder();
	private Component buildContent2() {
		grid2.setSelectionMode(SelectionMode.NONE);
		
		VerticalLayout vLay = new VerticalLayout();
		
		List<Todo> items = Arrays.asList(new Todo("Done task", "true", "11"), new Todo("Not done", "false", "22"), new Todo("Not done yet", "true maybe", "33"));

		grid2.setItems(items);
		
		NativeSelect<String> taskField = new NativeSelect<String>();
		
		
		//Binding<Todo, String> taskBinding = binder.withValidator(beforeConversion2).bind(taskField, Todo::getTask, Todo::setTask);
		Todo todo = new Todo(null, null, null);
		binder2.setBean(todo);
		
		NativeSelect<String> doneField = new NativeSelect<String>();
		
		TextField caloriesTextField = new TextField();
		caloriesTextField.setId("caloriesTextField");

		//grid2.addColumn(Todo::getTask).setId("1").setEditorComponent(taskField, Todo::setTask).setEditorBinding(taskBinding).setExpandRatio(1);
		grid2.addColumn(Todo::getTask).setId("1").setEditorComponent(taskField, Todo::setTask).setExpandRatio(1);
		grid2.addColumn(Todo::getDone).setId("2").setEditorComponent(doneField, Todo::setDone).setExpandRatio(1);
		grid2.addColumn(Todo::getNumber).setId("3").setEditorComponent(caloriesTextField, Todo::setDone).setExpandRatio(1);
		
		List<String> tasks = new ArrayList<>();
		tasks.add("laundry");
		tasks.add("laundry and stairs");
		tasks.add("Make New Suggestion");
		grid2.addComponentColumn(e -> {
			ComboBox<String> selField = new ComboBox<>();
			selField.setItems(tasks);
			selField.addValueChangeListener(e2 -> {
				if(e2.getValue().equals("Make New Suggestion")) {
					
				}
				grid2.getEditor().editRow(2);
			});
			return selField;
		});
		
		grid2.getEditor().setEnabled(true);
        vLay.addComponents(grid2);
        
        return grid2;
	}
}
