package drafty.models;

import java.util.Map;

import drafty.services.UserStudyService;

public class Survey {
	
	private String questionType;
	private String scoreType;
	private String question;
	private String score;
	private String val;
	private String tot;
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
	
	public Survey(String questionType, String scoreType, Map<Integer, Survey> survey) {
		super();
		this.questionType = questionType;
		this.scoreType = scoreType;
		UserStudyService uss = new UserStudyService();
		String[] result = uss.getQuestionScore(questionType, scoreType, survey);
		this.question = result[0];
		this.score = result[1];
		this.val = result[2];
		this.tot = result[3];
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
	public String getNum() {
		return val;
	}
	public void setNum(String val) {
		this.val = val;
	}
	public String getDen() {
		return tot;
	}
	public void setDen(String tot) {
		this.tot = tot;
	}
}
