import logo from './logo.svg';
import './App.css';
import { useState } from 'react';

const GQL_SERVER = process.env.REACT_APP_GQL_SERVER

function App() {

  const [ticketId, setTicketId] = useState(undefined)
  const [sendEmail, setSendEmail] = useState(false)
  const [email, setEmail] = useState(undefined)
  const [invalidateExisting, setInvalidateExisting] = useState(false)
  const [qrCodeUri, setQrCodeUri] = useState(undefined)
  const [sentEmail, setSentEmail] = useState(false)

  const handleClick = (event) => {
    event.preventDefault()
    console.log('ticketId', ticketId || 'missing')
    console.log('sendEmail', sendEmail || 'missing')
    console.log('email', email || 'missing')
    console.log('invalidateExisting', invalidateExisting || 'missing')
    const params = { id: ticketId, invalidateExisting }

    if (email) {
      params.email = email
    }

    console.log('params', params)
    fetch(GQL_SERVER, {
      method: 'post',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer t1'
      },
      body: JSON.stringify({
        query: `query TicketQrCode($id: String!, $email: String, $invalidateExisting: Boolean, ) {
          ticketQrCode(_id: $id, email: $email, invalidateExisting: $invalidateExisting) {
            qrCodeUri
            sentEmail
          }
        }`,
        variables: params
      })
    })
      .then((response) => response.json())
      .then(({data}) => {
        // Inside the data you can find the qrCode uri
        setQrCodeUri(data.ticketQrCode.qrCodeUri)
        setSentEmail(data.ticketQrCode.sentEmail || false)
      })
      .catch((err) => {
        // Handle any error
        console.error(err)
      });
  }
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        
        <form>
          <div>
            <span>Ticket ID </span>
            <input type="text" value={ticketId} onChange={(event)=> setTicketId(event.target.value)}/>
          </div>
          <div>
            <input type="checkbox" value={sendEmail} onChange={(event)=> setSendEmail(event.target.checked)}/>
            <span> Send Email?</span>
          </div>
          {sendEmail ? <div>
            <span>Email </span>
            <input type="text" value={email} onChange={(event)=> setEmail(event.target.value)}/>
          </div> : null}
          <div>
            <input type="checkbox" value={invalidateExisting} onChange={(event)=> setInvalidateExisting(event.target.checked)} />
            <span>Invalidate Existing Tickets?</span>
            <div className="tooltip">This will generate a new QR code, so that existing tickets are no longer valid.  You may want to do this if you lost your ticket or it has been compromised.</div>
          </div>
          <button onClick={handleClick}>Submit</button>
      </form>
      <div>Response</div>
      {sentEmail ? `Sent QR Code ticket via email to ${sentEmail}`: 'Did not send QR code ticket via email'}
      {qrCodeUri ? <img alt="qr-code" src={qrCodeUri} /> : undefined}
      </header>
    </div>
  );
}

export default App;
