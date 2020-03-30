package com.ajobs.view.grid;

import java.util.List;

/*
 * For Vaadin8 - Lazy Loading
 * AjobsService service = new AjobsService();
 * Grid<Ajobs> grid = new Grid<>(Ajobs.class);
 * 
 * https://dzone.com/articles/lazy-loading-with-vaadin-8
 * 
 * grid.setDataProvider(
 * 		(sortOrders, offset, limit) ->
 * 			service.findAll(offset, limit).stream(),
 * 		() -> service.count()
 * );
 * 
 */
public class AjobsService {

    public List<Ajobs> findAll(int offset, int limit) {
		return null;
    }
    public int count() {
		return 0;
    }
}
