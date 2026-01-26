import PageSession from '../models/pageSession_model';
import User from '../models/user_model';

export const createPageSession = (req, res) => {
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
  Page.findOneAndRemove({ url: req.params.url })
    .then((result) => {
      res.json('Deleted page!');
    });
};

// req.body includes:
// 1. url
// 2. title
// 3. [users] array
export const updatePage = (req, res) => {
  Page.findOneAndUpdate({ url: req.body.url }, req.body)
    .then((result) => {
      res.json('Updated page!');
    });
};

// req.body includes:
// 1. url
// 2. new user's ID
export const addUserToPage = (req, res) => {
    Page.updateOne(
      { url: req.body.url },
      { $push: {users: req.body.userID} })
      .then((result) => {
        res.json('Added user to page!');
      });
};

// Update an existing page session (PATCH)
// Used to add final data after reading session ends
export const updatePageSession = (req, res) => {
  const sessionId = req.params.id;

  // Build update object from request body
  const updateFields = {};

  // Core fields
  if (req.body.timestampEnd !== undefined) updateFields.timestampEnd = req.body.timestampEnd;
  if (req.body.sessionClosed !== undefined) updateFields.sessionClosed = req.body.sessionClosed;
  if (req.body.quadFreqs !== undefined) updateFields.quadFreqs = req.body.quadFreqs;

  // Summary metrics
  if (req.body.summary !== undefined) updateFields.summary = req.body.summary;

  // Event streams (JSONL)
  if (req.body.gaze_events_jsonl !== undefined) updateFields.gaze_events_jsonl = req.body.gaze_events_jsonl;
  if (req.body.ui_events_jsonl !== undefined) updateFields.ui_events_jsonl = req.body.ui_events_jsonl;

  // Settings snapshot
  if (req.body.settings_snapshot !== undefined) updateFields.settings_snapshot = req.body.settings_snapshot;

  // Survey responses
  if (req.body.survey_responses !== undefined) updateFields.survey_responses = req.body.survey_responses;

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
