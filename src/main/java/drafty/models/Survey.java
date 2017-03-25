package drafty.models;

import drafty._MainUI;
import drafty.services.UserStudyService;

public class Survey {
	
	private String questionType;
	private String scoreType;
	private String question;
	private String score;
	private boolean asked;
	
	
	/**
	 * @param questionType
	 * @param scoreType
	 * @param question
	 * @return 
	 */
	public void SurveyFull(String questionType, String scoreType, String question, String score, boolean asked) {
		this.questionType = questionType;
		this.scoreType = scoreType;
		this.question = question;
		this.score = score;
		this.asked = asked;
	}
	
	public Survey(String questionType, String scoreType) {
		super();
		this.questionType = questionType;
		this.scoreType = scoreType;
		String[] result = _MainUI.getApi().getUserStudyService().getQuestionScore(questionType, scoreType);
		this.question = result[0];
		this.score = result[1];
		this.asked = false;
	}
	
	public String getQuestionType() {
		return questionType;
	}
	public void setQuestionType(String questionType) {
		this.questionType = questionType;
	}
	public String getScoreType() {
		return scoreType;
	}
	public void setScoreType(String scoreType) {
		this.scoreType = scoreType;
	}
	public String getQuestion() {
		return question;
	}
	public void setQuestion(String question) {
		this.question = question;
	}
	public String getScore() {
		return score;
	}
	public void setScore(String score) {
		this.score = score;
	}
	public boolean isAsked() {
		return asked;
	}
	public void setAsked(boolean asked) {
		this.asked = asked;
	}
}
