package drafty.components;

import com.vaadin.server.FontAwesome;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.OptionGroup;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;

public class SurveyComponent extends Window {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 123434026070156300L;
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window(" User Study - Survey");
	VerticalLayout surveyModal = new VerticalLayout();
	
	Label label_sugg = new Label();
	Label label_hr = new Label("<hr />", ContentMode.HTML);
	Label label_footer = new Label("", ContentMode.HTML);

	OptionGroup answer = new OptionGroup();
	
	Button proceedButton = new Button(" Next Question");
	
	Integer question = 0;
	Integer question_total = 10;
	
	public SurveyComponent() {
		sub.setContent(surveyModal);
		sub.setModal(true);
		sub.setImmediate(true);
		sub.setWidth("760px");
		//sub.setHeight("600px");
		sub.setIcon(FontAwesome.USER);
		
		surveyModal.setMargin(true);
		surveyModal.setSpacing(true);
		
		label_sugg = new Label("Thank you for using Drafty.<br>  "
				+ "Please answer a few questions to complete the final part of the study.  Press the blue button to proceed.", ContentMode.HTML);
		
		proceedButton.addClickListener(e -> refreshUI());
		proceedButton.setIcon(FontAwesome.ARROW_RIGHT);
		proceedButton.setWidth("100%");
		
		label_footer = new Label("<hr><span style=\"color: rgb(153, 153, 153); display: block; text-align: center;\"> " + question + " / " + question_total + " questions completed.</span>", ContentMode.HTML);
		
		surveyModal.addComponents(label_sugg, label_hr, answer, proceedButton, label_footer);
		
		UI.getCurrent().addWindow(sub);
		UI.getCurrent().setFocusedComponent(sub);
	}
	
	public void refreshUI() {
		surveyModal.removeAllComponents();
		question++;
		
		if(question <= question_total) {
			label_sugg = new Label("What is your interest level in...", ContentMode.HTML);
			
			answer.addItems("1 - Very Low", "2 - Low", "3 - Neutral", "4 - High", "5 - Very High");
			
			label_footer = new Label("<hr><span style=\"color: rgb(153, 153, 153); display: block; text-align: center;\"> " + question + " / " + question_total + " question completed</span>", ContentMode.HTML);
			
			surveyModal.addComponents(label_sugg, label_hr, answer, proceedButton, label_footer);
		} else {
			surveyComplete();
		}
	}
	
	public void surveyComplete() {
		surveyModal.removeAllComponents();
		question++;
		
		label_sugg = new Label("Thank you for completing the survey.  You are done!", ContentMode.HTML);
		
		label_footer = new Label("<hr><span style=\"color: rgb(153, 153, 153); display: block; text-align: center;\"> Seriously thank you :)</span>", ContentMode.HTML);
		
		surveyModal.addComponents(label_sugg, label_footer);
	}
}
