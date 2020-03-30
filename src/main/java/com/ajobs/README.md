# package

com.ajobs

## AjobsNavigator.java

This class extends vaadin Navigator and is responsible for navigating between
various views within AjobsUI. It also adds GoogleAnalyticsTracker extension 
add-on for UI.

## AJobsServlet.java

Extends VaadinServlet.
Responsible for initialization and destroying a session listener.

## AjobsSessionListener.java

Extends vaadin's SessionInitListener, SessionDestroyListener.
Responsible for initialization and destroying a session.

## AjobsUI.java

Extends vaadin UI.
Manages user login and logout.
Helps to access global service layer like Api and Eventbus.


## OptimizedConnectorBundleLoaderFactory.java
Handles EAGER Vs DEFERRED LoadStyle of various UI components.
