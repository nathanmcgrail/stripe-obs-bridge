const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, { cors: { origin: "*" } });

app.use(express.json());

// Stripe sends payment data here
app.post('/stripe-webhook', (req, res) => {
  const event = req.body;

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const name = session.customer_details?.name || 'Anonymous';
    const amount = (session.amount_total / 100).toFixed(2);

    console.log(`Donation received: ${name} donated $${amount}`);

    // Broadcast instantly to StreamElements
    io.emit('stripe-donation', { name, amount });
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
