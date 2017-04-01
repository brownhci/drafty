package drafty.components;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

import javax.naming.InitialContext;
import javax.sql.DataSource;

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

public class SurveyComponent extends Window {
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 123434026070156300L;
	
	// Create a sub-window and add it to the main window
	final Window sub = new Window(" User Study - Survey");
	VerticalLayout surveyModal = new VerticalLayout();
	
	private String survey_id;
	private static String ds = _MainUI.getApi().getJNDI();
	
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
	Map<Integer, Survey> surveyTemp = new HashMap<Integer, Survey>();
	Map<Integer, Survey> survey = new HashMap<Integer, Survey>();
	Random r = new Random();
	
	public SurveyComponent() {
		createSurveyId();
		
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
		
		proceedButton.addClickListener(e -> insertSurveyQuestion());
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
		System.out.println("START SURVEY: " + _MainUI.getApi().getIdProfile() + " " + survey_id);
		surveyTemp.put(1, new Survey("PROF", "LOW", surveyTemp));
		surveyTemp.put(2, new Survey("PROF", "HIGH", surveyTemp));
		surveyTemp.put(3, new Survey("PROF", "MID", surveyTemp));
		surveyTemp.put(4, new Survey("PROF", "RAND", surveyTemp));
		surveyTemp.put(5, new Survey("FIELD", "LOW", surveyTemp));
		surveyTemp.put(6, new Survey("FIELD", "HIGH", surveyTemp));
		surveyTemp.put(7, new Survey("FIELD", "MID", surveyTemp));
		surveyTemp.put(8, new Survey("FIELD", "RAND", surveyTemp));
		surveyTemp.put(9, new Survey("UNI", "LOW", surveyTemp));
		surveyTemp.put(10, new Survey("UNI", "HIGH", surveyTemp));
		surveyTemp.put(11, new Survey("UNI", "MID", surveyTemp));
		surveyTemp.put(12, new Survey("UNI", "RAND", surveyTemp));
		
		int ct = 1;
		List<Integer> keys = new ArrayList<Integer>(surveyTemp.keySet());
		//Collections.shuffle(keys);
		for (Object o : keys) {
		    // Access keys/values in a random order
			surveyTemp.get(o).setAsked(true);
	    	survey.put(ct, surveyTemp.get(o));
	    	double score = Double.parseDouble(surveyTemp.get(o).getNum()) / Double.parseDouble(surveyTemp.get(o).getDen());
	    	System.out.println("QUESTION ASK: " + surveyTemp.get(o).getQuestionType() + " " + surveyTemp.get(o).getScoreType() + " - " + surveyTemp.get(o).getQuestion() + " ::: " + surveyTemp.get(o).getNum() + " / " + surveyTemp.get(o).getDen() + " = " + surveyTemp.get(o).getScore() + " vs " + score);
	    	ct++;
		}
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
			//label_sugg = new Label(quesToAsk + "<b>" + testQ.get(question-1) + "</b>?", ContentMode.HTML);
			label_sugg = new Label(quesToAsk + "<b>" + survey.get(question).getQuestion() + "</b>?", ContentMode.HTML);
			
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
		
		label_sugg = new Label("Thank you for completing the survey.  You are done!<br><br> Your confirmation number is <b>" + survey_id + "</b>.", ContentMode.HTML);
		
		label_footer = new Label("<hr><span style=\"color: rgb(153, 153, 153); display: block; text-align: center;\"> Seriously thank you :)</span>", ContentMode.HTML);
		
		surveyModal.addComponents(label_sugg, label_footer);
	}
	
	private void createSurveyId() {
		try (Connection conn = ((DataSource) new InitialContext().lookup(ds)).getConnection();
			PreparedStatement stmt = conn.prepareStatement(
					"INSERT INTO Survey (idSurvey, idProfile, startTime, count, score, count_tot, score_tot) "
				+ "VALUES (NULL, ?, CURRENT_TIMESTAMP, ?, ?, ?, ?)", Statement.RETURN_GENERATED_KEYS)) {
	    
	        stmt.setString(1, _MainUI.getApi().getProfile().getIdProfile());
	        stmt.setInt(2, _MainUI.getApi().getInteractionCount());
	        stmt.setInt(3, _MainUI.getApi().getInteractionScore());
	        stmt.setInt(4, _MainUI.getApi().getInteractionCountTot());
	        stmt.setInt(5, _MainUI.getApi().getInteractionScoreTot());
	        
        	stmt.executeUpdate();
			ResultSet rs = stmt.getGeneratedKeys();
			
			while (rs.next()) {
				survey_id = rs.getString("GENERATED_KEY");
			}
		} catch (Exception e) {
			System.out.println("ERROR create Survey ID: " + e);
		}
	}
	
	private void insertSurveyQuestion() {
		try {
			String sql = 
					"INSERT INTO SurveyQuestion (idSurveyQuestion, idSurvey, suggestionType, question, score_num, score_den, answer) "
					+ "VALUES (NULL, ?, ?, ?, ?, ?, ?);";
	        PreparedStatement stmt =  _MainUI.getApi().getConnStmt(sql);

	        String test = answer.getValue().toString();	        
	        Integer answer = 3;
	        if (test.equals("Not at all interested")) {
	        	answer = 0;
	        } else if(test.equals("Somewhat interested")) {
	        	answer = 1;
	        } else if(test.equals("Interested")) {
	        	answer = 2;
	        } 
	        
	        stmt.setString(1, survey_id);
	        stmt.setString(2, survey.get(question).getQuestionType());
	        stmt.setString(3, survey.get(question).getQuestion());
	        stmt.setString(4, survey.get(question).getNum());
	        stmt.setString(5, survey.get(question).getDen());
	        stmt.setString(6, answer.toString());
	        
        	stmt.executeUpdate();

	        stmt.close();
	        stmt.getConnection().close();
		} catch (SQLException e) {
			System.out.println("ERROR updateExperimentProfile(): " + e);
		} finally {
			refreshUI();
		}
	}
}
