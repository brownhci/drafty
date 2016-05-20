package drafty.models;

public class InteractionWeights {
	
	public double click = 1.0;
	public double clickDouble = 3.0;
	public double filter = 1.0;
	public double filterBlur = 2.0;
	public double sorting = 1.0;
	
	public double domain = 4.0;
	
	public double sugestion = 4.0;
	public double validation = 3.0;
	public double verification_correctness = 7.0;
	
	//not implement yet:
	public double copy_paste = 5.0;
	public double scrolling = 2.0;
	public double dwell_time = 2.0;
	public double highlight_duration = 2.0;
	
	public InteractionWeights(double click, double clickDouble, double filter, double filterBlur, double sorting,
			double domain, double sugestion, double validation, double verification_correctness, double copy_paste,
			double scrolling, double dwell_time, double highlight_duration) {
		super();
		this.click = click;
		this.clickDouble = clickDouble;
		this.filter = filter;
		this.filterBlur = filterBlur;
		this.sorting = sorting;
		this.domain = domain;
		this.sugestion = sugestion;
		this.validation = validation;
		this.verification_correctness = verification_correctness;
		this.copy_paste = copy_paste;
		this.scrolling = scrolling;
		this.dwell_time = dwell_time;
		this.highlight_duration = highlight_duration;
	}



	public double getClick() {
		return click;
	}



	public void setClick(double click) {
		this.click = click;
	}



	public double getClickDouble() {
		return clickDouble;
	}



	public void setClickDouble(double clickDouble) {
		this.clickDouble = clickDouble;
	}



	public double getFilter() {
		return filter;
	}



	public void setFilter(double filter) {
		this.filter = filter;
	}



	public double getFilterBlur() {
		return filterBlur;
	}



	public void setFilterBlur(double filterBlur) {
		this.filterBlur = filterBlur;
	}



	public double getSorting() {
		return sorting;
	}



	public void setSorting(double sorting) {
		this.sorting = sorting;
	}



	public double getDomain() {
		return domain;
	}



	public void setDomain(double domain) {
		this.domain = domain;
	}



	public double getSugestion() {
		return sugestion;
	}



	public void setSugestion(double sugestion) {
		this.sugestion = sugestion;
	}



	public double getValidation() {
		return validation;
	}



	public void setValidation(double validation) {
		this.validation = validation;
	}



	public double getVerification_correctness() {
		return verification_correctness;
	}



	public void setVerification_correctness(double verification_correctness) {
		this.verification_correctness = verification_correctness;
	}



	public double getCopy_paste() {
		return copy_paste;
	}



	public void setCopy_paste(double copy_paste) {
		this.copy_paste = copy_paste;
	}



	public double getScrolling() {
		return scrolling;
	}



	public void setScrolling(double scrolling) {
		this.scrolling = scrolling;
	}



	public double getDwell_time() {
		return dwell_time;
	}



	public void setDwell_time(double dwell_time) {
		this.dwell_time = dwell_time;
	}



	public double getHighlight_duration() {
		return highlight_duration;
	}



	public void setHighlight_duration(double highlight_duration) {
		this.highlight_duration = highlight_duration;
	}
}
