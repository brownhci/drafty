package drafty.views;

import java.io.File;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.server.FileResource;
import com.vaadin.ui.Button;
import com.vaadin.ui.FormLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.Link;
import com.vaadin.ui.TextField;
import com.vaadin.ui.Upload;
import com.vaadin.ui.VerticalLayout;

import drafty.data.CSVReceiver;
import drafty.data.DataExporter;
import drafty.data.GeneralCleaner;
import drafty.services.RestfulClient;

public class SecretView extends VerticalLayout implements View {

	/**
	 * 
	 */
	private static final long serialVersionUID = -583972163808473345L;
	String DATASOURCE_CONTEXT = _MainUI.getApi().getJNDI();	
	VerticalLayout mainLayout = new VerticalLayout();
	Link link_full = null;
	
	@Override
	public void enter(ViewChangeEvent event) {
		setUpUI();
	}
	
	public void setUpUI() {
		mainLayout.setWidth("100%");
		mainLayout.addComponent(new Label("Secret View"));
		this.addComponent(mainLayout);
		
		FormLayout content = new FormLayout();
		
		CSVReceiver suggestion_receiver = new CSVReceiver("suggestion");
		Upload suggestion_upload = new Upload("Update Suggestion Table", suggestion_receiver);
		suggestion_upload.addSucceededListener(suggestion_receiver);
		content.addComponent(suggestion_upload);
		
		CSVReceiver person_receiver = new CSVReceiver("person");
		Upload person_upload = new Upload("Update Person Table", person_receiver);
		person_upload.addSucceededListener(person_receiver);
		content.addComponent(person_upload);
		
		CSVReceiver person_cleaner_receiver = new CSVReceiver("person_cleaner");
		Upload person_cleaner_upload = new Upload("Clean Duplicate People", person_cleaner_receiver);
		person_cleaner_upload.addSucceededListener(person_cleaner_receiver);
		content.addComponent(person_cleaner_upload);
		
		GeneralCleaner gc = new GeneralCleaner();
		Button genClean = new Button("General Cleaning", e -> gc.generalClean());
		
		TextField tf = new TextField();
		Button createNewStructure1 = new Button("WIP RestfulClient", e -> RestfulClient.get(tf.getValue().toString()));
		content.addComponents(genClean, tf, createNewStructure1);
		
		final Button button = new Button("Export Full Data Set");

		button.addClickListener(event -> {
			System.out.println("Clicked");
		    DataExporter exporter = new DataExporter();
		    File export = exporter.getFullCSVFile();
		    FileResource file_resource = new FileResource(export);
		    //DownloadStream stream = file_resource.getStream();
		    if (link_full != null){
		    	content.removeComponent(link_full);
		    }
		    link_full = new Link("Link to csv full", file_resource);
		    content.addComponent(link_full);
		});
		
		content.addComponent(button);
		mainLayout.addComponent(content);
	}
}
