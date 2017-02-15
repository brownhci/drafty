package drafty.models;

public class SurveyInteractions {
	
	static class Score {
		private Integer score;
		
		
		enum suggTypeEnum {
			PROFNAME("ProfName"), 
			UNIV("Univesity"), 
			SUBFIELD("Subfield");
			
			private String type;
			
			private suggTypeEnum(String type) {
				this.type = type;
			}

			public String getType() {
				return type;
			}

			public void setType(String type) {
				this.type = type;
			}
		};
		private String suggType;
		private String suggestion;
		private Integer click;
		private Integer dblClick;
		private Integer filter;
		private Integer filtBlur;
		private Integer validation;
		private Integer validationComp;
		
		
		
		public String getSuggType() {
			return suggType;
		}
		public void setSuggType(String suggType) {
			this.suggType = suggType;
		}
		
		/**
		 * @param score
		 * @param suggestion
		 * @param click
		 * @param dblClick
		 * @param filter
		 * @param filtBlur
		 * @param validation
		 * @param validationComp
		 */
		public Score(Integer score, String suggestion, Integer click, Integer dblClick, Integer filter,
				Integer filtBlur, Integer validation, Integer validationComp) {
			super();
			this.score = score;
			this.suggestion = suggestion;
			this.click = click;
			this.dblClick = dblClick;
			this.filter = filter;
			this.filtBlur = filtBlur;
			this.validation = validation;
			this.validationComp = validationComp;
		}
		public Integer getScore() {
			return score;
		}		public void setScore(Integer score) {
			this.score = score;
		}
		public String getSuggestion() {
			return suggestion;
		}
		public void setSuggestion(String suggestion) {
			this.suggestion = suggestion;
		}
		public Integer getClick() {
			return click;
		}
		public void setClick(Integer click) {
			this.click = click;
		}
		public Integer getDblClick() {
			return dblClick;
		}
		public void setDblClick(Integer dblClick) {
			this.dblClick = dblClick;
		}
		public Integer getFilter() {
			return filter;
		}
		public void setFilter(Integer filter) {
			this.filter = filter;
		}
		public Integer getFiltBlur() {
			return filtBlur;
		}
		public void setFiltBlur(Integer filtBlur) {
			this.filtBlur = filtBlur;
		}
		public Integer getValidation() {
			return validation;
		}
		public void setValidation(Integer validation) {
			this.validation = validation;
		}
		public Integer getValidationComp() {
			return validationComp;
		}
		public void setValidationComp(Integer validationComp) {
			this.validationComp = validationComp;
		}	
	}
	
	
	
}
