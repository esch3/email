document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

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
          display_email_list(emails);
        });
        break;
    case "inbox":   
      fetch('/emails/inbox')
        .then(response => response.json())
        .then(emails => {
          display_email_list(emails);
        });
        break;
    case "archive": 
      fetch('/emails/archive')
        .then(response => response.json())
        .then(emails => {
          display_email_list(emails);
      });
      break;
  }
}

function display_email_list(emails) {
  const user = document.querySelector('#user').textContent;
  let content = document.querySelector('#emails-view');
  content.classList.add("container");
  emails.forEach(email => {
    // container for each email
    let emailDiv = document.createElement('div');
    // Set id for each email div to the appropriate ID
    emailID = email.id;
    emailDiv.id = emailID;
    // Use bootstrap grid for display
    emailDiv.classList.add("row");
    emailDiv.style.height = "90px";
    emailDiv.style.padding = "10px";
    if (email.read == true) {
      emailDiv.style.backgroundColor = "lightgray";
    } else {
      emailDiv.style.backgroundColor = "white";
    }
    emailDiv.style.border = "1px solid black";
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
    document.getElementById(emailID).addEventListener(
      "mouseenter", function (event) {
        event.target.style.color = "orange";
      }
    )
    document.getElementById(emailID).addEventListener(
      "mouseleave", function (event) {
        event.target.style.color = "black";
      }
    )
    document.getElementById(emailID).addEventListener(
      'click',
       () => fetch(`/emails/${emailID}`)
        .then(response => response.json())
        .then(email => {
          view_email(email);
        })
       ); 
  })
}

function view_email(email) {
  console.log(email);
  let content = document.querySelector('#emails-view');
  content.innerHTML = '';
  for (const field in email) {
    let p = document.createElement('p')
    p.appendChild(document.createTextNode(field + ": " + email[field]));
    content.append(p);
  }
}