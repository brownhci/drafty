package com.ajobs.util;

import com.vaadin.server.AbstractExtension;
import com.vaadin.ui.PasswordField;

public class CapsLockWarning extends AbstractExtension {

	private static final long serialVersionUID = -4127632758599797288L;

	// You could pass it in the constructor
    public CapsLockWarning(PasswordField field) {
        super.extend(field);
    }

    // Or in an extend() method
    public void extend(PasswordField field) {
        super.extend(field);
    }
}