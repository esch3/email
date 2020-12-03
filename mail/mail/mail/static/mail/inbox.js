document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});



var to = "";
var reSubject = "";
var reBody = "";
function compose_email() {
  console.log(to);
  console.log(reSubject);
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  if (to) {
    document.querySelector('#compose-recipients').value = to;
    to = '';
  } else {
    document.querySelector('#compose-recipients').value = '';
  }
  if (reSubject) {
    document.querySelector('#compose-subject').value = "Re: " + reSubject;
    reSubject = '';
  } else {
    document.querySelector('#compose-subject').value = '';
  }
  if (reBody) {
    document.querySelector('#compose-body').value = reBody;
    reBody = '';
  } else {
    document.querySelector('#compose-body').value = '';
  }

  // get data from form fields
  document.querySelector('#compose-form').onsubmit = () => {
    
    const body = document.querySelector('#compose-body').value;
    const subject = document.querySelector('#compose-subject').value;
    const recipients = document.querySelector('#compose-recipients').value;
    
    // submit data via post
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
      .then(response => response.json())
      .then(result => {
        console.log(result);
        load_mailbox('sent');
      });
    return false;
  }
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  switch(mailbox) {
    case "sent": 
      fetch('/emails/sent')
        .then(response => response.json())
        .then(emails => {
          displayEmails(emails, 'sent');
        });
      break;
    case "inbox":   
      fetch('/emails/inbox')
        .then(response => response.json())
        .then(emails => {
          console.log('loading inbox mailbox...')
          displayEmails(emails, 'inbox');
        });
      break;
    case "archive": 
      fetch('/emails/archive')
        .then(response => response.json())
        .then(emails => {
          console.log('loading archive mailbox...');
          console.log(emails);
          displayEmails(emails, 'archive');
        });
      break;
  }
}

function displayEmails(emails, mailbox) {
  
  const user = document.querySelector('#user').textContent;
  let content = document.querySelector('#emails-view');
  let body = document.querySelector('body');
  body.style.backgroundColor = "white";
  body.style.fontFamily = "'Padauk', sans-serif";
  body.style.fontSize = "20px";
  content.classList.add("container");
  emails.forEach(email => {
    // container for each email
    let emailDiv = document.createElement('div');
    // Set id for each email div to the appropriate ID
    emailDiv.id = email.id;
    
    // Use bootstrap grid for display
    emailDiv.classList.add("row");
    emailDiv.style.height = "75px";
    emailDiv.style.padding = "10px";
    if (email.read === true) {
      emailDiv.style.backgroundColor = "rgb(220, 220, 220, 0.5)";
    } else {
      emailDiv.style.backgroundColor = "white";
    }
    emailDiv.style.border = "1px solid rgb(0,0,0,0.1)";
    let senderDiv = document.createElement('div');
    let subjectDiv = document.createElement('div');
    let senderSenderDiv = document.createElement('div');
    let senderDateDiv = document.createElement('div');
    emailDiv.classList.add("row");
    senderDiv.classList.add("col-4");
    senderSenderDiv.classList.add("row");
    senderDateDiv.classList.add("row");
    subjectDiv.classList.add("col-8");
    sender = document.createTextNode(email.sender);
    senderBold = document.createElement('b');
    senderBold.appendChild(sender);
    date = document.createTextNode(email.timestamp);
    subject = document.createTextNode(email.subject);
    senderSenderDiv.appendChild(senderBold);
    senderDateDiv.appendChild(date);
    senderDateDiv.style.fontSize = "11px";
    senderDiv.appendChild(senderSenderDiv);
    senderDiv.appendChild(senderDateDiv);
    subjectDiv.appendChild(subject);
    emailDiv.appendChild(senderDiv);
    emailDiv.appendChild(subjectDiv);
    content.appendChild(emailDiv);
    
    // Event listeners
    document.getElementById(email.id).addEventListener(
      "mouseenter", function (event) {
        event.target.style.color = "coral";
        event.target.style.cursor = "pointer";
      }
    )
    
    document.getElementById(email.id).addEventListener(
      "mouseleave", function (event) {
        event.target.style.color = "black";
        event.target.style.cursor = "pointer";
      }
    )
    
    const markAsRead = () => fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        read: true
      })
    });

    const retrieve = () => fetch(`/emails/${email.id}`)
      .then(response => response.json())
      .then(email => {
        viewEmail(email);
      });
    
    document.getElementById(email.id).addEventListener(
      'click', () => {
        markAsRead();
        retrieve();
      }); 
  })

  // refresh mailbox every 10s
  /*
  localStorage.setItem('mailbox', mailbox);
  setTimeout(function() {
    let box = localStorage.getItem('mailbox');
    load_mailbox(box);
  }, 10000);
  */
}

function viewEmail(email) {
  let content = document.querySelector('#emails-view');
  content.innerHTML = '';
  
  content.classList.add("container");
  
  // subject
  subjectDiv = document.createElement('div');
  subjectDiv.classList.add("row");
  subjectDiv.style.height = "100px";
  subjectDiv.style.backgroundColor = "pink";
  let h1 = document.createElement('h1')
  h1.appendChild(document.createTextNode(email.subject));
  subjectDiv.appendChild(h1);
  // sender date
  senderDiv = document.createElement('div');
  senderDiv.classList.add("row");
  senderDiv.style.height = "50px";
  senderDiv.style.backgroundColor = "blue";
  var from = document.createElement('h4');
  from.style.display = "inline";
  var when = document.createElement('p');
  when.style.fontSize = "12px";
  when.style.display = "inline";
  from.innerHTML = `${email.sender}`;
  when.innerHTML = ` sent on ${email.timestamp} ...`;
  from.append(when);
  senderDiv.appendChild(from);
  // recipients
  recipientsDiv = document.createElement('div');
  recipientsDiv.classList.add("row");
  recipientsDiv.style.height = "100px";
  recipientsDiv.style.backgroundColor = "pink";
  var p = document.createElement('p');
  p.appendChild(document.createTextNode("recipients: " + email.recipients));
  recipientsDiv.appendChild(p);
  // body
  bodyDiv = document.createElement('div');
  bodyDiv.classList.add("row");
  //bodyDiv.style.height = "400px";
  bodyDiv.style.backgroundColor = "blue";
  var p = document.createElement('p');
  p.appendChild(document.createTextNode(email.body));
  bodyDiv.appendChild(p);

  content.appendChild(subjectDiv);
  content.appendChild(senderDiv);
  content.appendChild(recipientsDiv);
  content.appendChild(bodyDiv);
  
  let children = content.children;
  for (var i = 0; i < children.length; i++) {
    children[i].style.backgroundColor = "rgb(220, 220, 220, 0.5)";
    children[i].style.padding = "20px";
  }
  
  content.style.marginTop = "25px";
  

  let archiveButton = document.createElement("input");
  archiveButton.type = "button";
  archiveButton.value = "Archive";
  archiveButton.classList.add("btn", "btn-sm", "btn-outline-primary");
  const archive = () => fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  });
  
  let unarchiveButton = document.createElement("input");
  unarchiveButton.type = "button";
  unarchiveButton.value = "Unarchive";
  unarchiveButton.classList.add("btn", "btn-sm", "btn-outline-primary");
  const unarchive = () => fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  });

  let replyButton = document.createElement("input");
  replyButton.type = "button";
  replyButton.value = "Reply";
  replyButton.classList.add("btn", "btn-sm", "btn-outline-primary");
  replyButton.onclick = function () {
    to = email.sender;
    reSubject = email.subject;
    reBody = "On " + email.timestamp + " " + email.sender + " wrote: " + email.body;
    compose_email();
  }
  // which button to display based on whether or not email is archived
  archived = email.archived;
  var buttonDiv = document.createElement('div');
  buttonDiv.classList.add("row", "justify-content-around");
  buttonDivCol1 = document.createElement('div');
  buttonDivCol1.classList.add('col-4');
  buttonDivCol2 = document.createElement('div');
  buttonDivCol2.classList.add("col-4");
  if (archived) {
    buttonDivCol1.appendChild(unarchiveButton);
    
  } else if (!archived) {
    buttonDivCol1.appendChild(archiveButton);
    
  }

  buttonDivCol2.appendChild(replyButton);
  buttonDiv.appendChild(buttonDivCol2);
  buttonDiv.appendChild(buttonDivCol1);
  buttonDiv.style.marginTop = "25px";
  content.append(buttonDiv);

  const load = function() {
    load_mailbox('inbox');
  }
  archiveButton.onclick = function() {
    archive();
    archiveButton.disabled = true;
    setTimeout(load, 200);
    
  };
  unarchiveButton.onclick = function() {
    unarchive();
    unarchiveButton.disabled = true;
    setTimeout(load, 200);
    
  };
  
  
}