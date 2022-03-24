import { activeTableCellElement } from '../../../../sheet';
import { getCommentsURL } from '../../../api/endpoints';
import { getIdUniqueID, postCommentVoteDown, postCommentVoteUp, postNewComment } from '../../../api/record-interactions';
import { getTableRow } from '../../../dom/sheet';


const getUniqueId = () => {
  return activeTableCellElement === null || activeTableCellElement === undefined ? -1 : getIdUniqueID(activeTableCellElement);
};

interface CommentDataType {
  idComment: number;
  idInteraction: number;
  idUniqueId: number;
  comment: string;
  voteUp: number;
  voteDown: number;
  timestamp: string;
  username: string;
}

interface ProfComment {
  id: number;
  author: string;
  content: string;
  upvote: number;
  downvote: number;
  timestamp: string;
}

const comment1: ProfComment = {
  id: 1,
  author: 'kaki',
  content: 'first comment - is he coming to Brown!?',
  upvote: 2,
  downvote: 1,
  timestamp: 'January 28, 2021'
};
const comment2: ProfComment = {
  id: 2,
  author: 'shaun',
  content: 'good prof!',
  upvote: 3,
  downvote: 0,
  timestamp: 'January 1, 2022'
};
const comment3: ProfComment = {
  id: 3,
  author: 'shaun',
  content:
    'this is some really long comment where I test whether this can handle long comments',
  upvote: 3,
  downvote: 0,
  timestamp: 'February 1, 2022'
};
const comment4: ProfComment = {
  id: 4,
  author: 'jeff',
  content: 'he might retire soon.',
  upvote: 5,
  downvote: 0,
  timestamp: 'February 2, 2022'
};

const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];

const timestampToDate = (timestamp: string) => {
  return monthNames[parseInt(timestamp.substring(6,7))] + ' ' + parseInt(timestamp.substring(8,10)).toString() + ', ' + timestamp.substring(0,4);
};

const commentData: ProfComment[] = [comment4, comment3, comment2, comment1];

const commentsDiv = document.getElementById('comments');
const commentIcon = document.getElementById('commentIcon');
const closeIcon = document.getElementById('comment-close');
const commentLabel = document.getElementById('comment-label');

export function activateCommentIcon() {
  commentIcon.style.display = 'flex';
  commentsDiv.style.display = 'none';
}

function popupulateComments() {
  const idUniqueId = getUniqueId();
  fetch(getCommentsURL(idUniqueId))
  .then(response => {
     const contentType = response.headers.get('content-type');
     if (!contentType || !contentType.includes('application/json')) {
       throw new TypeError(`Oops, we did not get JSON!`);
     }
     return response.json();
  }).then(data => {
    data.forEach((comment: CommentDataType, key: number) => {
      // const numUpvote = comment.upvote;
      // const numDownvote = comment.downvote;
      if (key === 0) {document.getElementById('commentsContainer').innerHTML = null;}
    
      document.getElementById('commentsContainer').innerHTML += commentHTML(key, timestampToDate(comment.timestamp), comment.username, comment.comment, comment.voteUp, comment.voteDown);
      if (key !== commentData.length - 1) {
        document.getElementById('commentsContainer').innerHTML += `<hr id="comments-hr">`;
      }
      const thumbsUpId = 'thumbs-up-' + key.toString();
      const thumbsDownId = 'thumbs-down-' + key.toString();
      const upvoteId = 'upvote-' + key.toString();
      const downvoteId = 'downvote-' + key.toString();
      const thumbsUpButton: HTMLElement = document.getElementById(thumbsUpId);
      const thumbsDownButton: HTMLElement = document.getElementById(thumbsDownId);
    
      thumbsUpButton.classList.add(commentUnselected);
      thumbsDownButton.classList.add(commentUnselected);
    
      //make this into separate function and just use for downvote also
      thumbsUpButton.onclick = function() {
        voteOnclick (thumbsUpButton, thumbsDownButton, upvoteId, downvoteId, commentData[key].id);
      };
    
      thumbsDownButton.onclick = function() {
        voteOnclick (thumbsDownButton, thumbsUpButton, downvoteId, upvoteId, commentData[key].id);
      };
    });
    
    /* DO SOMETHING HERE :) */
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
  <div id="commentContainer"}>
    <div id="contentContainer">
      <div id="info">
        <div>${date}</div>
        ・
        <div id="author">${author}</div>
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

//Displaying each comment
// commentData.forEach((comment, key) => {
//   const numUpvote = comment.upvote;
//   const numDownvote = comment.downvote;

//   document.getElementById('commentsContainer').innerHTML += commentHTML(key, comment.timestamp, comment.author, comment.content, numUpvote, numDownvote);
//   if (key !== commentData.length - 1) {
//     document.getElementById('commentsContainer').innerHTML += `<hr id="comments-hr">`;
//   }
//   const thumbsUpId = 'thumbs-up-' + key.toString();
//   const thumbsDownId = 'thumbs-down-' + key.toString();
//   const upvoteId = 'upvote-' + key.toString();
//   const downvoteId = 'downvote-' + key.toString();
//   const thumbsUpButton: HTMLElement = document.getElementById(thumbsUpId);
//   const thumbsDownButton: HTMLElement = document.getElementById(thumbsDownId);

//   thumbsUpButton.classList.add(commentUnselected);
//   thumbsDownButton.classList.add(commentUnselected);

//   //make this into separate function and just use for downvote also
//   thumbsUpButton.onclick = function() {
//     voteOnclick (thumbsUpButton, thumbsDownButton, upvoteId, downvoteId, commentData[key].id);
//   };

//   thumbsDownButton.onclick = function() {
//     voteOnclick (thumbsDownButton, thumbsUpButton, downvoteId, upvoteId, commentData[key].id);
//   };
// });

//function to increment the upvote/downvote HTML
function increment(elementid: string, commentId: number) {
  let curNum = parseInt(document.getElementById(elementid)?.innerHTML, 10);
  curNum++;
  document.getElementById(elementid).innerHTML = curNum.toString();
  elementid.includes('upvote') ? postCommentVoteUp(commentId, '1') : postCommentVoteDown(commentId, '1');
}

function decrement(elementid: string, commentId: number) {
  let curNum = parseInt(document.getElementById(elementid)?.innerHTML, 10);
  curNum--;
  document.getElementById(elementid).innerHTML = curNum.toString();
  elementid.includes('upvote') ? postCommentVoteUp(commentId, '-1') : postCommentVoteDown(commentId, '-1');
}

const commentSelected: string = 'vote-selected';
const commentUnselected: string = 'vote';

function voteOnclick (button1: HTMLElement, button2: HTMLElement, id1: string, id2: string, commentId: number){
  if (button1.classList.contains(commentUnselected)) {
    button1.classList.remove(commentUnselected);
    button1.classList.add(commentSelected);
    increment(id1, commentId);
    id1.includes('upvote') ? postCommentVoteUp(commentId, '1') : postCommentVoteDown(commentId, '1');
    if (button2.classList.contains(commentSelected)){
      button2.classList.remove(commentSelected);
      button2.classList.add(commentUnselected);
      decrement(id2, commentId);
    }
    return;
  }

  if (button1.classList.contains(commentSelected)) {
    button1.classList.remove(commentSelected);
    button1.classList.add(commentUnselected);
    decrement(id1, commentId);
    return;
  }
}

//Looping through to add "onclick" on each thumbs up/down to increment
// for (let i = 0; i < commentData.length; i++) {
//   const thumbsUpId = 'thumbs-up-' + i.toString();
//   const thumbsDownId = 'thumbs-down-' + i.toString();
//   const upvoteId = 'upvote-' + i.toString();
//   const downvoteId = 'downvote-' + i.toString();
//   const thumbsUpButton: HTMLElement = document.getElementById(thumbsUpId);
//   const thumbsDownButton: HTMLElement = document.getElementById(thumbsDownId);

//   thumbsUpButton.classList.add(commentUnselected);
//   thumbsDownButton.classList.add(commentUnselected);

//   //make this into separate function and just use for downvote also
//   thumbsUpButton.onclick = function() {
//     voteOnclick (thumbsUpButton, thumbsDownButton, upvoteId, downvoteId, commentData[i].id);
//   };

//   thumbsDownButton.onclick = function() {
//     voteOnclick (thumbsDownButton, thumbsUpButton, downvoteId, upvoteId, commentData[i].id);
//   };
// }

// for (let i = 0; i < commentData.length; i++) {
//   const thumbsUpId = 'thumbs-up-' + i.toString();
//   const thumbsDownId = 'thumbs-down-' + i.toString();
//   const upvoteId = 'upvote-' + i.toString();
//   const downvoteId = 'downvote-' + i.toString();
//   const thumbsUpButton: HTMLElement = document.getElementById(thumbsUpId);
//   const thumbsDownButton: HTMLElement = document.getElementById(thumbsDownId);

//   thumbsUpButton.classList.add(commentUnselected);
//   thumbsDownButton.classList.add(commentUnselected);

//   //make this into separate function and just use for downvote also
//   thumbsUpButton.onclick = function() {
//     voteOnclick (thumbsUpButton, thumbsDownButton, upvoteId, downvoteId, commentData[i].id);
//   };

//   thumbsDownButton.onclick = function() {
//     voteOnclick (thumbsDownButton, thumbsUpButton, downvoteId, upvoteId, commentData[i].id);
//   };
// }