
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
const commentData: ProfComment[] = [comment4, comment3, comment2, comment1];


const commentsDiv = document.getElementById('comments');
const commentIcon = document.getElementById('commentIcon');
const closeIcon = document.getElementById('comment-close');


commentsDiv.style.display = 'none';
commentIcon.style.display = 'none';

commentIcon.onclick = function () {
  commentIcon.style.display = 'none';
  commentsDiv.style.display = 'flex';
};

closeIcon.onclick = function () {
  commentIcon.style.display = 'flex';
  commentsDiv.style.display = 'none';
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
  const commentsContainer = document.getElementById('commentsContainer');
  commentsContainer.innerHTML = commentHTML(10, 'today', 'kaki', content, 0, 0) + 
  `<hr id="comments-hr">` + commentsContainer.innerHTML;
  (<HTMLInputElement>document.getElementById('newCommentTextbox')).value = '';
};

//Displaying each comment
commentData.forEach((comment, key) => {
  const numUpvote = comment.upvote;
  const numDownvote = comment.downvote;

  document.getElementById('commentsContainer').innerHTML += commentHTML(key, comment.timestamp, comment.author, comment.content, numUpvote, numDownvote);
  if (key !== commentData.length - 1) {
    document.getElementById('commentsContainer').innerHTML += `<hr id="comments-hr">`;
  }
});

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

//Looping through to add "onclick" on each thumbs up/down to increment
for (let i = 0; i < commentData.length; i++) {
  const thumbsUpId = 'thumbs-up-' + i.toString();
  const thumbsDownId = 'thumbs-down-' + i.toString();
  const upvoteId = 'upvote-' + i.toString();
  const downvoteId = 'downvote-' + i.toString();
  const thumbsUpButton: HTMLElement = document.getElementById(thumbsUpId);
  const thumbsDownButton: HTMLElement = document.getElementById(thumbsDownId);

  thumbsUpButton.onclick = function () {
    if (
      thumbsUpButton.style.color === 'black' &&
      thumbsDownButton.style.color === 'blue'
    ) {
      thumbsDownButton.style.color = 'black';
      decrement(downvoteId);
      thumbsUpButton.style.color = 'blue';
      increment(upvoteId);
      return;
    }
    if (thumbsUpButton.style.color === 'blue') {
      thumbsUpButton.style.color = 'black';
      decrement(upvoteId);
      return;
    } else {
      thumbsUpButton.style.color = 'blue';
      increment(upvoteId);
    }
  };
  thumbsDownButton.onclick = function () {
    if (
      thumbsDownButton.style.color === 'black' &&
      thumbsUpButton.style.color === 'blue'
    ) {
      thumbsUpButton.style.color = 'black';
      decrement(upvoteId);
      thumbsDownButton.style.color = 'blue';
      increment(downvoteId);
      return;
    }
    if (thumbsDownButton.style.color === 'blue') {
      thumbsDownButton.style.color = 'black';
      decrement(downvoteId);
    } else {
      thumbsDownButton.style.color = 'blue';
      increment(downvoteId);
    }
  };
}
