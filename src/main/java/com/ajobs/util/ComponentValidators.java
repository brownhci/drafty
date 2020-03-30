package com.ajobs.util;

import com.vaadin.data.validator.RegexpValidator;
import com.vaadin.data.validator.StringLengthValidator;


public class ComponentValidators {

	public StringLengthValidator checkLength(Integer min, Integer max) {
		return new StringLengthValidator(" must be between " + min +" and " + max + " characters long", min, max);
	}
	
	public RegexpValidator checkOtherSuggestions() {
		// sw input is good if it does not contain Other Suggestions
		return new RegexpValidator("(Other Suggestions) not valid entry", "^((?!Other Suggestions).)*$", false);
	}
	
	public RegexpValidator checkEmail() {
		// add checks for parenthesis, and asterics,
		String errorMessage = "Please enter a valid email";
		String regexp = "@";
		boolean checkComplete = false; // does substring search
		return new RegexpValidator(errorMessage, regexp, checkComplete);
	}
}
