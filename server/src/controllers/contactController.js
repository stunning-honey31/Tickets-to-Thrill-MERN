const Message = require('../models/Message');
const { vName, vEmail, vLength } = require('../utils/validators');

const SUBJECTS = ['General enquiry', 'Booking issue', 'Group booking', 'Feedback', 'Other'];

async function submitMessage(req, res) {
  const { name, email, subject, message } = req.body;
  if (!vName(name)) return res.status(400).json({ message: 'Please enter a valid name.' });
  if (!vEmail(email)) return res.status(400).json({ message: 'Please enter a valid email address.' });
  if (!SUBJECTS.includes(subject)) return res.status(400).json({ message: 'Please choose a valid subject.' });
  if (!vLength(message, 10, 2000)) return res.status(400).json({ message: 'Message must be 10-2000 characters.' });

  const doc = await Message.create({ name: name.trim(), email: email.toLowerCase(), subject, message: message.trim() });
  res.status(201).json({ message: doc });
}

module.exports = { submitMessage, SUBJECTS };
