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
  const blah = document.getElementById('foo').value;
  console.log(blah);
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
    console.log(recipients)

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

}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#emails-body').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  if (mailbox === 'inbox') {  
    
    
    fetch('/emails/inbox')
      .then(response => response.json())
      .then(emails => {
        //console.log(emails);
        emails.forEach(email => {
          const user = document.querySelector('#user').textContent;

          if (email.recipients.includes(user)) {
              setInner(email)
          }
        })
      })
    
  } else {

    // Body of email div
    document.querySelector('#emails-body').innerHTML = `<p>not inbox!</p>`;
  }
   
}

function setInner(email) {
  //document.querySelector('#emails-content').innerHTML = element.id;
  var ul = document.querySelector('#emails-content');
  for (field in email) {
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(email[field]));
    ul.appendChild(li);
    //console.log(email[field], '\n');
  }
  /*
  var ul = document.querySelector('#emails-content');
  for (var i = 0; i < element.length; i++) {
    var obj = element[i];
    console.log(obj);
    var li = document.createElement('li');
    li.appendChild(document.createTextNode(obj.title));
    ul.appendChild(li);
  }
  */
  return true;
}