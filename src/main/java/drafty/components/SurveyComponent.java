package drafty.components;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.vaadin.server.FontAwesome;
import com.vaadin.shared.ui.label.ContentMode;
import com.vaadin.ui.Button;
import com.vaadin.ui.Label;
import com.vaadin.ui.OptionGroup;
import com.vaadin.ui.UI;
import com.vaadin.ui.VerticalLayout;
import com.vaadin.ui.Window;

import drafty._MainUI;
import drafty.models.LikertOptions;
import drafty.models.Survey;
import drafty.services.UserStudyService;

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
	Integer question_total = 12;
	
	Map<String, Integer> progress = new HashMap<String, Integer>();
	
	String quesToAsk = "How Interested are you in ";
	String extra = "I do not know";
	LikertOptions opt5 = new LikertOptions("Not at all interested", "Somewhat interested", "Interested", "", "", extra, false, 3);
	
	List<String> testQ = new ArrayList<String>();
	Map<Integer, Survey> survey = new HashMap<Integer, Survey>();
	Random r = new Random();
	
	public SurveyComponent() {
		sub.setContent(surveyModal);
		sub.setModal(true);
		sub.setImmediate(true);
		sub.setWidth("680px");
		//sub.setHeight("600px");
		sub.setIcon(FontAwesome.USER);
		
		surveyModal.setMargin(true);
		surveyModal.setSpacing(true);
		
		answer.addItems(opt5.toList());
		answer.addValueChangeListener(e -> answerValChange());
		
		proceedButton.addClickListener(e -> refreshUI());
		proceedButton.setIcon(FontAwesome.ARROW_RIGHT);
		proceedButton.setWidth("100%");
		
		label_footer = new Label("<hr><span style=\"color: rgb(153, 153, 153); display: block; text-align: center;\"> " + question + " / " + question_total + " questions completed.</span>", ContentMode.HTML);
		
		surveyModal.addComponents(label_sugg, label_hr, answer, proceedButton, label_footer);
		
		
		testQ.add("Human Computer Interaction");
		testQ.add("Jeff Bigham from Carnegie Mellon University");
		testQ.add("University of Michigan");
		testQ.add("University of Texas - Austin");
		testQ.add("Randy Billingsly from Virginia Tech");
		testQ.add("University of Washington");
		testQ.add("Toronto University");
		testQ.add("Machine Learning");
		testQ.add("Databases");
		testQ.add("Brown University");
		testQ.add("Programming Languages");
		
		buildQuestions();
		
		refreshUI();
		
		UI.getCurrent().addWindow(sub);
		UI.getCurrent().setFocusedComponent(sub);
	}
	
	private void answerValChange() {
		proceedButton.setEnabled(true);
	}
	
	private void buildQuestions() {
		survey.put(1, new Survey("PROF", "LOW"));
		survey.put(2, new Survey("PROF", "MID"));
		survey.put(3, new Survey("PROF", "HIGH"));
		survey.put(4, new Survey("PROF", "RAND"));
		survey.put(5, new Survey("FIELD", "LOW"));
		survey.put(6, new Survey("FIELD", "MID"));
		survey.put(7, new Survey("FIELD", "HIGH"));
		survey.put(8, new Survey("FIELD", "RAND"));
		survey.put(9, new Survey("UNI", "LOW"));
		survey.put(10, new Survey("UNI", "MID"));
		survey.put(11, new Survey("UNI", "HIGH"));
		survey.put(12, new Survey("UNI", "RAND"));
	}
	
	public Survey getNewSurvey() {
		boolean flag = true;
		Survey s = null;
		while(flag) {
			int key = r.nextInt((survey.size() - 1) + 1) + 1;
			if(!survey.get(key).isAsked()) {
				survey.get(key).setAsked(true);
				s = survey.get(key);
				flag = false;
			}
		}
		
		return s;
	}
	
	public void refreshUI() {
		surveyModal.removeAllComponents();
		question++;
		
		if(question <= question_total) {
			label_sugg = new Label(quesToAsk + "<b>" + testQ.get(question-1) + "</b>?", ContentMode.HTML);
			
			answer.clear();
			proceedButton.setEnabled(false);
			
			label_footer = new Label("<hr><span style=\"color: rgb(153, 153, 153); display: block; text-align: center;\"> " + question + " / " + question_total + " questions completed</span>", ContentMode.HTML);
			
			surveyModal.addComponents(label_sugg, label_hr, answer, proceedButton, label_footer);
		} else {
			surveyComplete();
		}
	}
	
	public void surveyComplete() {
		surveyModal.removeAllComponents();
		question++;
		
		label_sugg = new Label("Thank you for completing the survey.  You are done!<br><br> Your confirmation number is <b>39</b>.", ContentMode.HTML);
		
		label_footer = new Label("<hr><span style=\"color: rgb(153, 153, 153); display: block; text-align: center;\"> Seriously thank you :)</span>", ContentMode.HTML);
		
		surveyModal.addComponents(label_sugg, label_footer);
	}
}
