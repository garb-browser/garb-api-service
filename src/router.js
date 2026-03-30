import { Router } from 'express';
import * as UserController from './controllers/user_controller';
import { requireAuth, requireSignin } from './services/passport';

const studyMode = process.env.STUDY_MODE === 'true';
const optionalAuth = studyMode ? (req, res, next) => next() : requireAuth;
import * as PageSessions from './controllers/pageSession_controller';

// Admin-key middleware - Bearer scheme compared case-insensitively per RFC 7235
const adminKeyAuth = (req, res, next) => {
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return res.status(403).json({ error: 'Admin access not configured' });
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer' || parts[1] !== adminKey) {
    return res.status(403).json({ error: 'Forbidden: invalid admin key' });
  }
  next();
};

const router = Router();

router.get('/', (req, res) => res.json({ message: 'welcome to the GARB back-end!' }));

router.post('/signin', requireSignin, UserController.signin);
router.post('/signup', UserController.signup);
router.post('/signin-email', UserController.signinByEmail);

router.route('/pageSessions')
  .post(optionalAuth, PageSessions.validateCreatePageSession, PageSessions.createPageSession);

router.route('/pageSessions/create')
  .post(optionalAuth, PageSessions.validateCreatePageSession, PageSessions.createPageSessionWithId);

router.route('/pageSessions/:id')
  .get(optionalAuth, PageSessions.getPageSessionById)
  .patch(optionalAuth, PageSessions.updatePageSession)
  .delete(optionalAuth, PageSessions.deletePageSession);

// Admin endpoint: requires ADMIN_KEY Bearer token
router.route('/pageSessions/user/:user')
  .get(adminKeyAuth, PageSessions.getUserSessions);

router.route('/pageSessions/:user/:url')
  .get(optionalAuth, PageSessions.getPageSessions);

export default router;
