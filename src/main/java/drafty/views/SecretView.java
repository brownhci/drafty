package drafty.views;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.ui.FormLayout;
import com.vaadin.ui.Label;
import com.vaadin.ui.Upload;
import com.vaadin.ui.VerticalLayout;

import drafty.data.CSVReceiver;

public class SecretView extends VerticalLayout implements View {

	/**
	 * 
	 */
	private static final long serialVersionUID = -583972163808473345L;
	String DATASOURCE_CONTEXT = _MainUI.getDataProvider().getJNDI();	
	VerticalLayout mainLayout = new VerticalLayout();
	//ComboBox table_list = new ComboBox();
	
	@Override
	public void enter(ViewChangeEvent event) {
		mainLayout.setWidth("100%");
		mainLayout.addComponent(new Label("Secret View"));
		this.addComponent(mainLayout);
		FormLayout content = new FormLayout();
		//table_list.addItems("person","suggestion");
		
		//CSV
		CSVReceiver receiver = new CSVReceiver();
		Upload upload = new Upload("Update Suggestion Table", receiver);
		upload.addSucceededListener(receiver);
		content.addComponent(upload);
		mainLayout.addComponent(content);
	}
		
}
