package drafty.models;

public class UriFragment {
	
	private boolean isActive = false;
	private boolean surveyActive = false;
	private boolean experimentActive = true;
	private boolean testActive = false;
	
	private String init_uri = "none";
	private String init_var = "none";
	
	
	public boolean isActive() {
		return isActive;
	}
	public void setActive(boolean isActive) {
		this.isActive = isActive;
	}
	public String getInit_uri() {
		return init_uri;
	}
	public void setInit_uri(String init_uri) {
		this.init_uri = init_uri;
	}
	public String getInit_var() {
		return init_var;
	}
	public void setInit_var(String init_var) {
		this.init_var = init_var;
	}
	public boolean isSurveyActive() {
		return surveyActive;
	}
	public void setSurveyActive(boolean surveyActive) {
		this.surveyActive = surveyActive;
	}
	public boolean isExperimentActive() {
		return experimentActive;
	}
	public void setExperimentActive(boolean experimentActive) {
		this.experimentActive = experimentActive;
	}
	public boolean isTestActive() {
		return testActive;
	}
	public void setTestActive(boolean testActive) {
		this.testActive = testActive;
	}
}
