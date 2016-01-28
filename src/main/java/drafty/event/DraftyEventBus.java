package drafty.event;

import com.google.common.eventbus.EventBus;
import com.google.common.eventbus.SubscriberExceptionContext;
import com.google.common.eventbus.SubscriberExceptionHandler;

import drafty.views._MainUI;

/**
 * A simple wrapper for Guava event bus. Defines static convenience methods for
 * relevant actions.
 */
public class DraftyEventBus implements SubscriberExceptionHandler {

    private final EventBus eventBus = new EventBus(this);

    public static void post(final Object event) {
        _MainUI.getDraftyEventbus().eventBus.post(event);
    }

    public static void register(final Object object) {
        _MainUI.getDraftyEventbus().eventBus.register(object);
    }

    public static void unregister(final Object object) {
        _MainUI.getDraftyEventbus().eventBus.unregister(object);
    }

    @Override
    public final void handleException(final Throwable exception,
            final SubscriberExceptionContext context) {
        exception.printStackTrace();
    }
}
