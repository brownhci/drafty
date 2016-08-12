package drafty.models;

public class Profile {
	
	//set Drafty cookie value
	private String cookieCheck = "brown_university_drafty_cookie";
	private String cookieValue = "0";
	//private WebBrowser webBrowser = Page.getCurrent().getWebBrowser();
	private String browser;
	//private String browserNumber = Integer.toString(webBrowser.getBrowserMajorVersion()) + "." + Integer.toString(webBrowser.getBrowserMinorVersion());
	private String ipAddress;
	private String idProfile;
	private String idIpAddress;
	private String idExperiment;
	private Integer suggestionCount;
	private String visits;
	
	public String getCookieCheck() {
		return cookieCheck;
	}
	public void setCookieCheck(String cookieCheck) {
		this.cookieCheck = cookieCheck;
	}
	public String getCookieValue() {
		return cookieValue;
	}
	public void setCookieValue(String cookieValue) {
		this.cookieValue = cookieValue;
	}
	/*
	public WebBrowser getWebBrowser() {
		return webBrowser;
	}
	public void setWebBrowser(WebBrowser webBrowser) {
		this.webBrowser = webBrowser;
	}
	*/
	public String getBrowser() {
		return browser;
	}
	/*
	public void setBrowser() {
		String browser = "NA";
		
		if (webBrowser.isChrome()) {
			browser = "Chrome ";
		} else if (webBrowser.isAndroid()) {
			browser = "Android ";
		} else if (webBrowser.isEdge()) {
			browser = "Edge ";
		} else if (webBrowser.isFirefox()) {
			browser = "Firefox ";
		} else if (webBrowser.isIE()) {
			browser = "IE ";
		} else if (webBrowser.isIOS()) {
			browser = "IOS ";
		} else if (webBrowser.isIPad()) {
			browser = "IPad ";
		} else if (webBrowser.isIPhone()) {
			browser = "IPhone ";
		} else if (webBrowser.isOpera()) {
			browser = "Opera ";
		} else if (webBrowser.isSafari()) {
			browser = "Safari ";
		} else if (webBrowser.isWindowsPhone()) {
			browser = "WindwosPhone ";
		}
		
		this.browser = browser;
	}
	public String getBrowserNumber() {
		return browserNumber;
	}
	public void setBrowserNumber(String browserNumber) {
		this.browserNumber = browserNumber;
	}
	*/
	public String getIpAddress() {
		return ipAddress;
	}
	public void setIpAddress(String ipAddress) {
		this.ipAddress = ipAddress;
	}
	public String getIdProfile() {
		return idProfile;
	}
	public void setIdProfile(String idProfile) {
		this.idProfile = idProfile;
	}
	public String getIdIpAddress() {
		return idIpAddress;
	}
	public void setIdIpAddress(String idIpAddress) {
		this.idIpAddress = idIpAddress;
	}
	public String getIdExperiment() {
		return idExperiment;
	}
	public void setIdExperiment(String idExperiment) {
		this.idExperiment = idExperiment;
	}
	public void setBrowser(String browser) {
		this.browser = browser;
	}
	public Integer getSuggestionCount() {
		return suggestionCount;
	}
	public void setSuggestionCount(Integer suggestionCount) {
		this.suggestionCount = suggestionCount;
	}
	public void addToSuggestionCount(Integer suggestionCount) {
		this.suggestionCount += suggestionCount;
	}
	public String getVisits() {
		return visits;
	}
	public void setVisits(String visits) {
		this.visits = visits;
	}
}
