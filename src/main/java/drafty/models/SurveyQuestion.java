package drafty.models;

public class SurveyQuestion {
	
	private String idSurveyQuestion;
	private String idSurvey;
	private String idPerson;
	private String idSuggestionType;
	private String idSuggestion;
	private String question;
	private String interest_score;
	private String answer;
	
	/**
	 * @param idSurveyQuestion
	 * @param idSurvey
	 * @param idPerson
	 * @param idSuggestionType
	 * @param idSuggestion
	 * @param question
	 * @param interest_score
	 * @param answer
	 */
	public SurveyQuestion(String idSurveyQuestion, String idSurvey, String idPerson, String idSuggestionType,
			String idSuggestion, String question, String interest_score, String answer) {
		super();
		this.idSurveyQuestion = idSurveyQuestion;
		this.idSurvey = idSurvey;
		this.idPerson = idPerson;
		this.idSuggestionType = idSuggestionType;
		this.idSuggestion = idSuggestion;
		this.question = question;
		this.interest_score = interest_score;
		this.answer = answer;
	}

	public String getIdSurveyQuestion() {
		return idSurveyQuestion;
	}
	public void setIdSurveyQuestion(String idSurveyQuestion) {
		this.idSurveyQuestion = idSurveyQuestion;
	}
	public String getIdSurvey() {
		return idSurvey;
	}
	public void setIdSurvey(String idSurvey) {
		this.idSurvey = idSurvey;
	}

	public String getIdPerson() {
		return idPerson;
	}

	public void setIdPerson(String idPerson) {
		this.idPerson = idPerson;
	}

	public String getIdSuggestionType() {
		return idSuggestionType;
	}

	public void setIdSuggestionType(String idSuggestionType) {
		this.idSuggestionType = idSuggestionType;
	}

	public String getIdSuggestion() {
		return idSuggestion;
	}

	public void setIdSuggestion(String idSuggestion) {
		this.idSuggestion = idSuggestion;
	}

	public String getQuestion() {
		return question;
	}

	public void setQuestion(String question) {
		this.question = question;
	}

	public String getInterest_score() {
		return interest_score;
	}

	public void setInterest_score(String interest_score) {
		this.interest_score = interest_score;
	}

	public String getAnswer() {
		return answer;
	}

	public void setAnswer(String answer) {
		this.answer = answer;
	}
}
