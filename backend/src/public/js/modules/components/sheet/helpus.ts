const helpUsModal: HTMLElement = document.getElementById('helpus-screen');
// const loadingHTML: string = `Creating something awesome...`;
// const helpUsText: HTMLElement = document.getElementById('helpus-text');


function openModal() {
    // helpUsText.innerHTML = loadingHTML;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    // activateKeyListener();
    helpUsModal.style.display = 'block';
}

export async function activateHelpUs(tableCellElement: HTMLTableCellElement) {
    // const baseUrl: urlBase = { idInteractionType: idInteractionType, idDatabaitCreateType: idDatabaitCreateType, idSession: await getIdSession()};
    // resetContributionMessageHTML();
    openModal();
}

