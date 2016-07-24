package drafty.event;

import drafty.test.DraftyViewType;


/*
 * Event bus events used in Drafty are listed here as inner classes.
 */
public abstract class DraftyEvent {
	
    public static class BrowserResizeEvent {

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
    
    public static final class expPopUpEvent {
    	public expPopUpEvent() {
    		
    	}
    }

    //to find page loaded
    public static class ProfsPageLoadEvent {
    	private final String pageLoad;

        public ProfsPageLoadEvent(String pageLoad) {
            this.pageLoad = pageLoad;
        }

        public String getPageLoad() {
            return pageLoad;
        }
    }
}
