package com.ajobs.util;

import com.ajobs.domain.SuggestionTypeValues;
import com.vaadin.data.Converter;
import com.vaadin.data.Result;
import com.vaadin.data.ValueContext;

@SuppressWarnings("serial")
public abstract class SuggTypeValConverter implements Converter<SuggestionTypeValues, String> {

	@Override
	public Result<String> convertToModel(SuggestionTypeValues value, ValueContext context) {
		//System.out.println("convertToModel value = " + value.getValue());
		//System.out.println("convertToModel context = " + context);
		if (value == null) {
            return null;
        }
		
		return Result.ok(value.getValue());
	}

	@Override
	public SuggestionTypeValues convertToPresentation(String value, ValueContext context) {
		//System.out.println("convertToPresentation value = " + value);
		//System.out.println("convertToPresentation context = " + context);
		if (value == null) {
            return null;
        }
		
		return null;
	}
}