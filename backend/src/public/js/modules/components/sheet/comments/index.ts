import { activeTableCellElement } from '../../../../sheet';
import { getCommentsURL } from '../../../api/endpoints';
import { getIdUniqueID, postCommentVoteDown, postCommentVoteUp, postNewComment } from '../../../api/record-interactions';
import { getTableRow } from '../../../dom/sheet';


const getUniqueId = () => {
  return activeTableCellElement === null || activeTableCellElement === undefined ? -1 : getIdUniqueID(activeTableCellElement);
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

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const timestampToDate = (timestamp: string) => {
  return monthNames[parseInt(timestamp.substring(6,7)) - 1] + ' ' + parseInt(timestamp.substring(8,10)).toString() + ', ' + timestamp.substring(0,4);
};

const commentsDiv = document.getElementById('comments');
const commentIcon = document.getElementById('commentIcon');
const closeIcon = document.getElementById('comment-close');
const commentLabel = document.getElementById('comment-label');

export function activateCommentIcon() {
  commentIcon.style.display = 'flex';
  commentsDiv.style.display = 'none';
}

//function to increment the upvote/downvote HTML
function increment(elementid: string) {
  let curNum = parseInt(document.getElementById(elementid)?.innerHTML, 10);
  curNum++;
  document.getElementById(elementid).innerHTML = curNum.toString();
}

function decrement(elementid: string) {
  let curNum = parseInt(document.getElementById(elementid)?.innerHTML, 10);
  curNum--;
  document.getElementById(elementid).innerHTML = curNum.toString();
}

const commentSelected: string = 'vote-selected';
const commentUnselected: string = 'vote';

function voteOnclick (button1: HTMLElement, button2: HTMLElement, id1: string, id2: string, commentId: number){
  if (button1.classList.contains(commentUnselected)) {
    button1.classList.remove(commentUnselected);
    button1.classList.add(commentSelected);
    id1.includes('upvote') ? postCommentVoteUp(commentId, 'voteUp') : postCommentVoteDown(commentId, 'voteDown');
    increment(id1);
    if (button2.classList.contains(commentSelected)){
      button2.classList.remove(commentSelected);
      button2.classList.add(commentUnselected);
      decrement(id2);
      id1.includes('upvote') ? postCommentVoteUp(commentId, 'voteDown-deselect') : postCommentVoteDown(commentId, 'voteUp-deselect');
    }
    return;
  }

  if (button1.classList.contains(commentSelected)) {
    button1.classList.remove(commentSelected);
    button1.classList.add(commentUnselected);
    id1.includes('upvote') ? postCommentVoteUp(commentId, 'voteUp-deselect') : postCommentVoteDown(commentId, 'voteDown-deselect');
    decrement(id1);
    return;
  }
}


//Looping through to add "onclick" on each thumbs up/down to increment
function handleVoteIds(ids: number[], vote_dict: Map<number, string>) {
  ids.forEach((i: number) => {
    const thumbsUpId = 'thumbs-up-' + i.toString();
    const thumbsDownId = 'thumbs-down-' + i.toString();
    const upvoteId = 'upvote-' + i.toString();
    const downvoteId = 'downvote-' + i.toString();
    const thumbsUpButton: HTMLElement = document.getElementById(thumbsUpId);
    const thumbsDownButton: HTMLElement = document.getElementById(thumbsDownId);

    thumbsUpButton.classList.add(vote_dict.get(i) === 'up' ? commentSelected: commentUnselected);
    thumbsDownButton.classList.add(vote_dict.get(i) === 'down' ? commentSelected: commentUnselected);
  
    //make this into separate function and just use for downvote also
    thumbsUpButton.onclick = function() {
      voteOnclick (thumbsUpButton, thumbsDownButton, upvoteId, downvoteId, i);
    };
  
    thumbsDownButton.onclick = function() {
      voteOnclick (thumbsDownButton, thumbsUpButton, downvoteId, upvoteId, i);
    };
  });
}

function popupulateComments() {
  const ids: number[] = [];
  const vote_dict = new Map();
  const idUniqueId = getUniqueId();
  fetch(getCommentsURL(idUniqueId))
  .then(response => {
     const contentType = response.headers.get('content-type');
     if (!contentType || !contentType.includes('application/json')) {
       throw new TypeError(`Oops, we did not get JSON!`);
     }
     return response.json();
  }).then(data => {
    data.length != 0 ? 
    data.forEach((comment: CommentDataType, key: number) => {
      const id: number = comment.idComment;
      ids.push(id);
      vote_dict.set(id, comment.userVote);
      // vote_dict[id] = comment.userVote;
      if (key === 0) {document.getElementById('commentsContainer').innerHTML = null;}
      document.getElementById('commentsContainer').innerHTML += commentHTML(id, timestampToDate(comment.timestamp), comment.username, comment.comment, comment.voteUp, comment.voteDown);
      if (key !== data.length - 1) {
        document.getElementById('commentsContainer').innerHTML += `<hr id="comments-hr">`;
      }
    }) : document.getElementById('commentsContainer').innerHTML = `<div id="no-comment">no comments yet - be the first to write a comment! :)</div>`;
    handleVoteIds(ids, vote_dict);
    console.log(data);
  }).catch(error => console.error(error));
}

export function activateCommentSection() {
  popupulateComments();
  commentIcon.style.display = 'none';
  commentsDiv.style.display = 'flex';
}

export function changeCommentLabel() {
  const fullNameCell: string = getTableRow(activeTableCellElement).getElementsByTagName('*')[0].innerHTML;
  const profName: string = fullNameCell.includes('<') ? fullNameCell.slice(0, fullNameCell.indexOf('<') - 1) : fullNameCell;
  commentLabel.innerHTML = 'Comments for ' + profName;
}

commentsDiv.style.display = 'none';
commentIcon.style.display = 'none';

commentIcon.onclick = function () {
  activateCommentSection();
};

closeIcon.onclick = function () {
  activateCommentIcon();
};

//html element for each comment
const commentHTML = function (id: number, date: string, author: string, content: string, numUpvote: number, numDownvote: number)  {
  const thumbsUpId = 'thumbs-up-' + id.toString();
  const thumbsDownId = 'thumbs-down-' + id.toString();
  const upvoteId = 'upvote-' + id.toString();
  const downvoteId = 'downvote-' + id.toString();
  return `
  <div id="commentContainer">
    <div id="contentContainer">
      <div id="info">
        <div>${date}</div>
        ・
        <div id="author">${author ? author:'anonymous user'}</div>
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
      <div id="wrapper">
        <i class="fa fa-thumbs-down" id=${thumbsDownId}></i>
        <div class="numVote" id=${downvoteId}>${numDownvote}</div>
      </div>
    </div>
  </div>
  `;
};

//logic to add new comment post
document.getElementById('comment-button').onclick = function () {
  const content: string = (<HTMLInputElement>(
    document.getElementById('newCommentTextbox')
  )).value;
  postNewComment(getUniqueId(), content);
  const commentsContainer = document.getElementById('commentsContainer');
  commentsContainer.innerHTML = commentHTML(10, 'today', 'kaki', content, 0, 0) + 
  `<hr id="comments-hr">` + commentsContainer.innerHTML;
  (<HTMLInputElement>document.getElementById('newCommentTextbox')).value = '';
};
