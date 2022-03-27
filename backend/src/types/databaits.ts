// used for how databaits were created
export const DatabaitCreateType = {
    modal_like: 1,
    modal_random: 2,
    right_click: 3,
    edit: 4,
    new_row: 5,
    delete_row: 6,
    navbar_menu: 7,
    welcome_modal: 8,
    system_random: 9,
    system_recent_edit: 10

} as const;

/* TS magic to allow flexible lookup */
export type DatabaitCreateType  =  typeof DatabaitCreateType [ keyof typeof DatabaitCreateType ]

// used for how databaits were created
export const InteractionTypeDatabaitCreate = {
    modal_like: 31,
    modal_random: 32,
    right_click: 26,
    edit: 27,
    new_row: 28,
    delete_row: 29,
    navbar_menu: 30,
    welcome_modal: 33,
    select_databait_value_search: 35
} as const;

/* TS magic to allow flexible lookup */
export type InteractionTypeDatabaitCreate  =  typeof InteractionTypeDatabaitCreate [ keyof typeof InteractionTypeDatabaitCreate ]

//next action after seeing a databait // tweets are implied
export const DatabaitAction = {
    modal_like: 1,
    modal_random: 2,
    right_click: 3,
    edit: 4,
    new_row: 5,
    delete_row: 6,
    navbar_menu: 7,
    window_closed: 8,
    select_value_search: 9
} as const;

/* TS magic to allow flexible lookup */
export type DatabaitAction  =  typeof DatabaitAction [ keyof typeof DatabaitAction ]