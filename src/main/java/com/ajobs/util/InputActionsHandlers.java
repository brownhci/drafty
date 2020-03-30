package com.ajobs.util;

import com.ajobs.services.InteractionService;

public class InputActionsHandlers {
	
	private InteractionService intService = new InteractionService();
	
	/*
	public Spreadsheet registerActions(Spreadsheet spread) {
		spread.addActionHandler(new Handler() {
			
			// SW - current issue; can't paste to actual clipboard for use outside of AJobs
		    Action action_copy = new ShortcutAction("Copy", ShortcutAction.KeyCode.C, new int[] { ShortcutAction.ModifierKey.META });
		    Action action_paste = new ShortcutAction("Paste", ShortcutAction.KeyCode.V, new int[] { ShortcutAction.ModifierKey.META });
		    
			private static final long serialVersionUID = 1L;
			
			// Have the C key modified with Alt cause an event
		    Action action_sort_asc = new ShortcutAction("Sort ASC", ShortcutAction.KeyCode.A, new int[] { ShortcutAction.ModifierKey.CTRL });
		    Action action_sort_desc = new ShortcutAction("Sort DESC", ShortcutAction.KeyCode.S, new int[] { ShortcutAction.ModifierKey.CTRL });
			
		    //right click action_copy, action_paste; not implemented yet; can't push code to clipboard
            private Action[] actions = new Action[] { action_sort_asc, action_sort_desc};

            @Override
            public void handleAction(Action action, Object sender, Object target) {	
        		if(action == action_copy) {
        			System.out.println("action_copy");
        		}
        		
        		if(action == action_paste) {
        			System.out.println("action_paste");
        		}
            }

            @Override
            public Action[] getActions(Object target, Object sender) {
                return actions;
            }
        });
		
		return spread;
	}
	*/
}