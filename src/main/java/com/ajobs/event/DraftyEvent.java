package com.ajobs.event;

import java.util.Map;

import com.ajobs.domain.Suggestion;
import com.ajobs.view.DraftyViewType;
import com.vaadin.server.Page;
import com.vaadin.shared.Position;
import com.vaadin.ui.Notification;

/*
 * Event bus events used in Drafty are listed here as inner classes.
 */
public abstract class DraftyEvent {

    public static final class UserLoginRequestedEvent {
        private final String userName, password;
        private final boolean isSignUp;

        public UserLoginRequestedEvent(final String userName, final String password, final boolean isSignUp) {
            this.userName = userName;
            this.password = password;
            this.isSignUp = isSignUp;
        }

        public String getUserName() {
            return userName;
        }

        public String getPassword() {
            return password;
        }

		public boolean isSignUp() {
			return isSignUp;
		}
    }
    
    public static final class SystemLoginRequestedEvent {
    	
    }
    
    public static final class UserLoginSuccesfulEvent {
        
    }

    public static class BrowserResizeEvent {

    }

    public static class UserLoggedOutEvent {
    	
    }

    public static class NotificationsCountUpdatedEvent {
    
    }

    public static final class PostViewChangeEvent {
        private final DraftyViewType view;

        public PostViewChangeEvent(final DraftyViewType view) {
            this.view = view;
        }

        public DraftyViewType getView() {
            return view;
        }
    }

    public static class CloseOpenWindowsEvent {
    }

    public static class ProfileUpdatedEvent {
    }
    
    //EDITS
    public static class NewRowEvent {
    	private final Map<Integer, String> newSuggs;
    	private final Map<Integer, Integer> newSuggIds;
    	private final Integer idUniqueID;
    	
		public NewRowEvent(final Map<Integer, String> newSuggs, Map<Integer, Integer> newSuggIds, Integer idUniqueID) {
			this.newSuggs = newSuggs;
			this.newSuggIds = newSuggIds;
			this.idUniqueID = idUniqueID;
			
			Notification success = new Notification("Success, New Row Added!");
			success.setDelayMsec(2000);
			success.setStyleName("bar success small");
			success.setPosition(Position.BOTTOM_CENTER);
			success.show(Page.getCurrent());
		}
		
		public Map<Integer, String> getNewSuggs() {
			return newSuggs;
		}

		public Map<Integer, Integer> getNewSuggIds() {
			return newSuggIds;
		}
		
		public Integer getIdUniqueID() {
			return idUniqueID;
		}
    }
    
    public static class NewSuggestionEvent {
    	//nothing needed
    }
    
    public static class SideBarNewSuggestionEvent {
    	private final Suggestion newSuggestion;
    	public SideBarNewSuggestionEvent(final Suggestion newSuggestion) {
    		this.newSuggestion = newSuggestion;
    	}
		public Suggestion getNewSuggestion() {
			return newSuggestion;
		}
    }
    
    
    //INTERACTIONS
    public static final class SelectionEvent {
    	//do nothing
    }
    
    public static class SortEvent {
    	private final boolean userTriggered;
    	public SortEvent(final boolean userTriggered) {
    		this.userTriggered = userTriggered;
    	}
		public boolean isUserTriggered() {
			return userTriggered;
		}
    }
    
    public static class FilterEvent {
    	private final boolean userTriggered;
    	public FilterEvent(final boolean userTriggered) {
    		this.userTriggered = userTriggered;
    	}
		public boolean isUserTriggered() {
			return userTriggered;
		}
    }
    
    public static class CopyEvent {
		//nothing needed
    }
    
    public static class CutEvent {
		//nothing needed
    }
    
    public static class PasteEvent {
    	//nothing needed
    }
}
