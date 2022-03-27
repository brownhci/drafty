// used for how databaits were created
export const databaitCreateType = {
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
export type databaitCreateType  =  typeof databaitCreateType [ keyof typeof databaitCreateType ]

// used for how databaits were created
export const databaitCreateInteractionType = {
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
export type databaitCreateInteractionType  =  typeof databaitCreateInteractionType [ keyof typeof databaitCreateInteractionType ]

//next action after seeing a databait // tweets are implied
export const databaitAction = {
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
export type databaitAction  =  typeof databaitAction [ keyof typeof databaitAction ]