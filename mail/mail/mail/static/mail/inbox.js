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
          displayEmails(emails);
        });
      break;
    case "inbox":   
      fetch('/emails/inbox')
        .then(response => response.json())
        .then(emails => {
          console.log('loading inbox mailbox...')
          displayEmails(emails);
        });
      break;
    case "archive": 
      fetch('/emails/archive')
        .then(response => response.json())
        .then(emails => {
          console.log('loading archive mailbox...');
          console.log(emails);
          displayEmails(emails);
        });
      break;
  }
}

function displayEmails(emails) {
  const user = document.querySelector('#user').textContent;
  let content = document.querySelector('#emails-view');
  
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
  return 0;
}

function viewEmail(email) {
  let content = document.querySelector('#emails-view');
  content.innerHTML = '';
  
  for (const field in email) {
    let p = document.createElement('p')
    p.appendChild(document.createTextNode(field + ": " + email[field]));
    content.appendChild(p);
  }

  let archiveButton = document.createElement("input");
  archiveButton.type = "button";
  archiveButton.value = "Archive";
  const archive = () => fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: true
    })
  });
  
  let unarchiveButton = document.createElement("input");
  unarchiveButton.type = "button";
  unarchiveButton.value = "Unarchive";
  const unarchive = () => fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: false
    })
  });
  // which button to display based on whether or not email is archived
  archived = email.archived;
  if (archived) {
    content.append(unarchiveButton);
  } else if (!archived) {
    content.append(archiveButton);
  }
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
  let replyButton = document.createElement("input");
  replyButton.type = "button";
  replyButton.value = "Reply";
  replyButton.onclick = function() {
    to = email.sender;
    reSubject = email.subject;
    reBody = "On " + email.timestamp + " " + email.sender + " wrote: " + email.body; 
    compose_email();
  }
  content.append(replyButton);
}