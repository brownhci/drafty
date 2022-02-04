const editHistoryTable: HTMLTableElement = document.getElementById('table-edit-history') as HTMLTableElement;

const offset = new Date().getTimezoneOffset(); // 

function cleanDateNumber(val: number, month: boolean = false) {
    let converted = val;
    if (month) {
        converted++;
    }
    if (converted >= 10) {
        return converted;
    } else {
        return `0${converted}`;
    }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function convertDay(val: number) {
    if (val >= 10) {
        return val;
    } else {
        return `0${val}`;
    }
}

function convertDateToLocalTimezone(date: string) {
    try {
        const myDate = new Date(date);
        const convertedDate = new Date(myDate.getTime() - offset * 60000);
        const dateLocalTimezone = convertedDate.getFullYear() + '-' + 
                                cleanDateNumber(convertedDate.getMonth(), true) + '-' + 
                                cleanDateNumber(convertedDate.getDate())  + ' ' + 
                                cleanDateNumber(convertedDate.getHours()) + ':' + 
                                cleanDateNumber(convertedDate.getMinutes());
        return dateLocalTimezone;
    } catch (error) {
        // firefox mobile has error on date/time conversion
        return date;   
    }
}


for (let i = 1; i < editHistoryTable.rows.length; i++) {
    const row: HTMLTableRowElement = editHistoryTable.rows[i];
    const cellDate = row.cells[0].innerHTML.trim();
    const newDate = convertDateToLocalTimezone(cellDate);
    row.cells[0].innerHTML = newDate;
}
