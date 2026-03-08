import { body, validationResult } from 'express-validator';
import PageSession from '../models/pageSession_model';

export const validateCreatePageSession = [
  body('url').notEmpty().withMessage('url is required').isURL().withMessage('url must be a valid URL'),
  body('user').notEmpty().withMessage('user is required'),
  body('timestampStart').notEmpty().withMessage('timestampStart is required'),
];

export const createPageSession = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const pageSession = new PageSession();
  pageSession.url = req.body.url;
  pageSession.title = req.body.title;
  pageSession.user = req.body.user;
  pageSession.timestampStart = req.body.timestampStart;
  pageSession.timestampEnd = req.body.timestampEnd;
  pageSession.sessionClosed = req.body.sessionClosed;
  pageSession.quadFreqs = req.body.quadFreqs;
  pageSession.save()
    .then((result) => {
      res.json({ message: 'PageSession created!' });
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

// requires the userID, to get all the pages of a certain user
// required inputs:
//  - user's username...?
export const getPageSessions = (req, res) => {
  // const currUser = User.findOne({username: req.body.username})
  var pageUrl = decodeURIComponent(req.params.url);
  PageSession.find({user: req.params.user, url: pageUrl})
    .then((result) => {
      res.json(result);
    });
};

// get a single page with its url
 export const getPageSession = (req, res) => {
   var pageUrl = decodeURIComponent(req.params.url);
   PageSession.findOne({user: req.params.user, url: pageUrl})
     .then((result) => {
       res.json(result);
     });
 };

 //export const getPageSession = (req, res) => {
 //  PageSession.findOne({ user: req.params.user })
 //    .then((result) => {
 //      res.json(result);
 //    });
 //};

export const deletePageSession = (req, res) => {
  PageSession.findByIdAndDelete(req.params.id)
    .then((result) => {
      if (!result) {
        return res.status(404).json({ error: 'PageSession not found' });
      }
      res.json({ message: 'Deleted page session!' });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};

// Update an existing page session (PATCH)
// Used to add final data after reading session ends
export const updatePageSession = (req, res) => {
  const sessionId = req.params.id;

  // Accept all fields from request body (for Technigala flexibility)
  // Exclude _id and __v to prevent MongoDB errors
  // Accept all fields, but strip Mongo operators and protected keys
  const updateFields = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (!key.startsWith('$') && key !== '_id' && key !== '__v') {
      updateFields[key] = value;
    }
  }

  PageSession.findByIdAndUpdate(sessionId, updateFields, { new: true })
    .then((result) => {
      if (!result) {
        return res.status(404).json({ error: 'PageSession not found' });
      }
      res.json({ message: 'PageSession updated!', session: result });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};

// Create page session and return the created document with _id
export const createPageSessionWithId = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const pageSession = new PageSession();
  pageSession.url = req.body.url;
  pageSession.title = req.body.title;
  pageSession.user = req.body.user;
  pageSession.timestampStart = req.body.timestampStart;
  pageSession.timestampEnd = req.body.timestampEnd;
  pageSession.sessionClosed = req.body.sessionClosed;
  pageSession.quadFreqs = req.body.quadFreqs;

  // New fields
  if (req.body.settings_snapshot) {
    pageSession.settings_snapshot = req.body.settings_snapshot;
  }

  pageSession.save()
    .then((result) => {
      // Return the created session with its _id
      res.json({
        message: 'PageSession created!',
        sessionId: result._id,
        session: result
      });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};

// Get a single page session by ID
export const getPageSessionById = (req, res) => {
  PageSession.findById(req.params.id)
    .then((result) => {
      if (!result) {
        return res.status(404).json({ error: 'PageSession not found' });
      }
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
};

// Get all sessions for a user (for data export)
export const getUserSessions = (req, res) => {
  PageSession.find({ user: req.params.user })
    .sort({ timestampStart: -1 })
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
}
