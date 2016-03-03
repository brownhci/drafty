package drafty.views;

import com.vaadin.navigator.View;
import com.vaadin.navigator.ViewChangeListener.ViewChangeEvent;
import com.vaadin.ui.Button;
import com.vaadin.ui.VerticalLayout;

public class SecretView extends VerticalLayout implements View {

	/**
	 * 
	 */
	private static final long serialVersionUID = -583972163808473345L;
	String DATASOURCE_CONTEXT = _MainUI.getDataProvider().getJNDI();
	
	VerticalLayout mainLayout = new VerticalLayout();
	Button test_button = new Button("I am a button in the super secret place");
	
	@Override
	public void enter(ViewChangeEvent event) {
		System.out.println("Entered Secret View");
		this.addComponent(mainLayout);
		mainLayout.addComponent(test_button);
	}
}
