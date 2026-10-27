const Ticket = require('../models/Ticket');

async function listTickets(req, res) {
  const { category } = req.query;
  const filter = { active: true };
  if (category && category !== 'all') filter.category = category;
  const tickets = await Ticket.find(filter).sort({ price: 1 });
  res.json({ tickets });
}

module.exports = { listTickets };
