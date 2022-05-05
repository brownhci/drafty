enum CellType {
    JoinYear = 'joinyear',
    Subfield = 'subfield',
    Bachelors = 'bachelors',
    Doctorate = 'doctorate'
}

interface HelpUsInterface {
    university: string,
    professor: string,
    emptyCell: CellType
}

const sample: HelpUsInterface = {
    university: 'Brown University',
    professor: 'Jeff Huang',
    emptyCell: CellType.Bachelors,
};

const generateSentence = (i: HelpUsInterface) => {
    return 'Do you know where ' + i.professor + ' from ' + i.university + ' got their ' + i.emptyCell + '?';
};


const helpUsModal: HTMLElement = document.getElementById('helpus-screen');
const helpUsModalClose = <HTMLButtonElement>document.getElementById('helpusModalClose');
const helpusText: HTMLElement = document.getElementById('helpus-text');


function updateHelpusHTML(sentence: string) {
    helpusText.innerHTML = sentence;
}

helpUsModalClose.addEventListener('click', function(event: MouseEvent) {
    helpUsModal.style.display = 'none';
    event.stopPropagation();
}, true);


function openModal() {
    helpUsModal.style.display = 'block';
    updateHelpusHTML(generateSentence(sample));
}

export async function activateHelpUs() {
    openModal();
}

