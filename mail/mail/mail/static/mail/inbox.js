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
      });

    return false;
  }
  load_mailbox('sent');
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // User's Sent mailbox
  if (mailbox === 'sent') {
    document.querySelector('#emails-view').innerHTML = `<h1>Sent mail</h1>`;
    fetch('/emails/sent')
      .then(response => response.json())
      .then(emails => {
        const user = document.querySelector('#user').textContent;
        let content = document.querySelector('#emails-view');

        emails.forEach(email => {
          summary = [
            email.sender,
            email.subject,
            email.timestamp,
            email.read
          ];
          for (const field of summary) {
            let p = document.createElement('p');
            p.appendChild(document.createTextNode(field));
            content.appendChild(p);
          }
          let hr = document.createElement('hr');
          content.appendChild(hr);
        })
      })
  }
  
  // User's Inbox
  else if (mailbox === 'inbox') {  
    
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
        const user = document.querySelector('#user').textContent;
        let content = document.querySelector('#emails-view');
        
        emails.forEach(email => {
          
          if (email.recipients.includes(user)) {
            summary = [
              email.sender, 
              email.subject, 
              email.timestamp,
              email.read
            ];
            for (const field of summary) {
              console.log(field)
              let p = document.createElement('p');
              
              p.appendChild(document.createTextNode(field));
              content.appendChild(p);
            }
            let hr = document.createElement('hr');
            content.appendChild(hr);
          }
        })
      })
    
  } else {

    // Body of email div
    document.querySelector('#emails-body').innerHTML = `<p>default</p>`;
  }
   
}