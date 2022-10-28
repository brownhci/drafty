import { activeTableCellElement } from '../../../../sheet';
import { getCommentsURL, postNewCommentURL } from '../../../api/endpoints';
import {
  getIdUniqueID,
  postCommentVoteDown,
  postCommentVoteUp,
} from '../../../api/record-interactions';
import { getTableRow } from '../../../dom/sheet';

const getUniqueId = () => {
  return activeTableCellElement === null || activeTableCellElement === undefined
    ? -1
    : getIdUniqueID(activeTableCellElement);
};

interface CommentDataType {
  userVote: string;
  idComment: number;
  idInteraction: number;
  idUniqueId: number;
  comment: string;
  voteUp: number;
  voteDown: number;
  timestamp: string;
  username: string;
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const timestampToDate = (timestamp: string) => {
  return (
    monthNames[parseInt(timestamp.substring(5, 7)) - 1] +
    ' ' +
    parseInt(timestamp.substring(8, 10)).toString() +
    ', ' +
    timestamp.substring(0, 4)
  );
};

const getVotingElementIds = function (id: number) {
  const thumbsUpId = 'thumbs-up-' + id.toString();
  const upvoteId = 'upvote-' + id.toString();
  return [thumbsUpId, upvoteId];
};

const commentsDiv = document.getElementById('comments');
const commentIcon = document.getElementById('commentIcon');
const closeIcon = document.getElementById('comment-close');
const commentLabel = document.getElementById('comment-label');

//function to increment the upvote/downvote HTML
function increment(elementid: string) {
  let curNum = parseInt(document.getElementById(elementid)!.innerHTML, 10);
  curNum++;
  document.getElementById(elementid)!.innerHTML = curNum.toString();
}

function decrement(elementid: string) {
  let curNum = parseInt(document.getElementById(elementid)!.innerHTML, 10);
  curNum--;
  document.getElementById(elementid)!.innerHTML = curNum.toString();
}

const commentSelected: string = 'vote-selected';
const commentUnselected: string = 'vote';

function voteOnclick(
  button1: HTMLElement,
  // button2: HTMLElement,
  id1: string,
  commentId: number
) {
  if (button1.classList.contains(commentUnselected)) {
    button1.classList.remove(commentUnselected);
    button1.classList.add(commentSelected);
    id1.includes('upvote')
      ? postCommentVoteUp(commentId, 'voteUp')
      : postCommentVoteDown(commentId, 'voteDown');
    increment(id1);
    return;
  }

  if (button1.classList.contains(commentSelected)) {
    button1.classList.remove(commentSelected);
    button1.classList.add(commentUnselected);
    id1.includes('upvote')
      ? postCommentVoteUp(commentId, 'voteUp-deselect')
      : postCommentVoteDown(commentId, 'voteDown-deselect');
    decrement(id1);
    return;
  }
}

function createVotingFunctionality(
  id: number,
  new_comment: boolean = false,
  vote_dict?: Map<number, string>
) {
  const [thumbsUpId, upvoteId] =
    getVotingElementIds(id);
  const thumbsUpButton: HTMLElement | null = document.getElementById(thumbsUpId);

  if (vote_dict && !new_comment) {
    thumbsUpButton?.classList.add(
      vote_dict.get(id) === 'up' ? commentSelected : commentUnselected
    );
    // thumbsDownButton?.classList.add(
    //   vote_dict.get(id) === 'down' ? commentSelected : commentUnselected
    // );
  } else {
    thumbsUpButton?.classList.add(commentUnselected);
    // thumbsDownButton?.classList.add(commentUnselected);
  }

  //make this into separate function and just use for downvote also
  thumbsUpButton!.onclick = function () {
    voteOnclick(thumbsUpButton!, upvoteId, id);
  };

  // thumbsDownButton!.onclick = function () {
  //   voteOnclick(thumbsDownButton!, thumbsUpButton!, downvoteId, upvoteId, id);
  // };
}

//Looping through to add "onclick" on each thumbs up/down to increment
function handleVoteIds(ids: number[], vote_dict: Map<number, string>) {
  ids.forEach((id: number) => {
    const new_comment = false;
    createVotingFunctionality(id, new_comment, vote_dict);
  });
}

export function populateComments(uniqueId = -1) {
  const ids: number[] = [];
  const vote_dict = new Map();
  const idUniqueId = uniqueId === -1 ? getUniqueId() : uniqueId;
  fetch(getCommentsURL(idUniqueId))
    .then((response) => {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new TypeError(`Oops, we did not get JSON!`);
      }
      return response.json();
    })
    .then((data) => {
      data.length != 0
        ? data.forEach((comment: CommentDataType, key: number) => {
            const id: number = comment.idComment;
            ids.push(id);
            vote_dict.set(id, comment.userVote);
            if (key === 0) {
              document.getElementById('commentsContainer')!.innerHTML = '';
            }
            document.getElementById('commentsContainer')!.innerHTML +=
              commentHTML(
                id,
                timestampToDate(comment.timestamp),
                comment.username,
                comment.comment,
                comment.voteUp
              );
            if (key !== data.length - 1) {
              document.getElementById(
                'commentsContainer'
              )!.innerHTML += `<hr id="comments-hr">`;
            }
          })
        : (document.getElementById(
            'commentsContainer'
          )!.innerHTML = `<div id="no-comment">No note yet - be the first to add a note! :)</div>`);
      handleVoteIds(ids, vote_dict);
    })
    .catch((error) => console.error(error));
}

export function activateCommentSection(uniqueId = -1) {
  populateComments(uniqueId);
  commentIcon!.style.display = 'none';
  commentsDiv!.style.display = 'flex';
  document.getElementById('newCommentTextbox')!.focus();
}

export function activateCommentIcon() {
  commentIcon!.style.display = 'flex';
  commentsDiv!.style.display = 'none';
  activeTableCellElement.focus();
}

export function changeCommentLabel(element = activeTableCellElement) {
  const fullNameCell: string | null = getTableRow(element).getElementsByTagName('*')[0].textContent;
  commentLabel!.innerHTML = 'Notes about Professor ' + fullNameCell;
}

commentIcon!.onclick = function () {
  activateCommentSection();
};

closeIcon!.onclick = function () {
  activateCommentIcon();
};

//html element for each comment
const commentHTML = function (
  id: number,
  date: string,
  author: string,
  content: string,
  numUpvote: number,
) {
  const [thumbsUpId, upvoteId] =
    getVotingElementIds(id);
  return `
  <div id="commentContainer">
    <div id="contentContainer">
      <div id="info">
        <div>${date}</div>
        ・
        <div id="author">${author ? author : 'anonymous'}</div>
      </div>
      <div id="content">
        <p>${content}</p>
      </div>
    </div>
    <div id="rating">
      <div id="wrapper">
        <i class="fa fa-thumbs-up" id="${thumbsUpId}"></i>
        <div class="numVote" id=${upvoteId}>${numUpvote}</div>
      </div>
    </div>
  </div>
  `;
};

commentIcon!.style.display = 'none';
commentsDiv!.style.display = 'none';

function postNewComment(idrow: string | number, comment: string) {
  const tableCellInputFormCSRFInput: HTMLInputElement = document.querySelector(
    'input[name=\'_csrf\']'
  )!;
  let url = '';
  //const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
  const urlRegex = /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_.~#?&=]*)$/;
  if (comment.includes('https://')) {
      const idx = comment.indexOf('https://');
      const substring = comment.substring(idx);
      url = substring.replace(/\n/g, ' ').split(' ')[0];
      let tag = '';
      if (urlRegex.test(url)) {
        tag = '<a href=' + url + '>' + url + '</a>';
        comment = comment.replace(url, tag);
      }
  }
  const bodyData = {
    idrow: idrow,
    comment: comment,
    _csrf: tableCellInputFormCSRFInput.value,
  };
  const options = {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(bodyData),
  };
  fetch(postNewCommentURL(), options)
    .then((response) => {
      return response.json();
    })
    .then(() => {
      populateComments();
    })
    .catch((error) => {
      // TODO: in the future,
      // consider how we should communicate to the user there was an error
      console.error(error);
    });
}

//logic to add new comment post
document.getElementById('comment-button')!.onclick = function () {
  const content: string = (<HTMLInputElement>(
    document.getElementById('newCommentTextbox')
  )).value;
  postNewComment(getUniqueId(), content);
  (<HTMLInputElement>document.getElementById('newCommentTextbox')).value = '';
};

//esc closes comment section
document.addEventListener('keydown', (evt) => {
  if (evt.key === 'Escape' && commentsDiv!.style.display === 'flex') {
    activateCommentIcon();
  }
});
