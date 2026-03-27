import { Router } from 'express';
// import * as Posts from './controllers/post_controller';
import * as UserController from './controllers/user_controller';
import { requireAuth, requireSignin } from './services/passport';

// Technigala study mode: skip auth when STUDY_MODE=true
const studyMode = process.env.STUDY_MODE === 'true';
const optionalAuth = studyMode ? (req, res, next) => next() : requireAuth;
import * as PageSessions from './controllers/pageSession_controller';


const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'welcome to the GARB back-end!' });
});

router.post('/signin', requireSignin, UserController.signin);

router.post('/signup', UserController.signup);

// Technigala: email-only sign in (no password, just look up user)
router.post('/signin-email', UserController.signinByEmail);

router.route('/pageSessions')
	.post(optionalAuth, PageSessions.validateCreatePageSession, PageSessions.createPageSession);

// New endpoint: create session and return ID for subsequent updates
router.route('/pageSessions/create')
	.post(optionalAuth, PageSessions.validateCreatePageSession, PageSessions.createPageSessionWithId);

// New endpoint: update session by ID (PATCH for partial updates)
router.route('/pageSessions/:id')
	.get(optionalAuth, PageSessions.getPageSessionById)
	.patch(optionalAuth, PageSessions.updatePageSession)
	.delete(optionalAuth, PageSessions.deletePageSession);

// New endpoint: get all sessions for a user (for data export)
router.route('/pageSessions/user/:user')
	.get(optionalAuth, PageSessions.getUserSessions);

router.post('/', function(req, res){
	var data = res.body;
	console.log("RES");
	console.log(data);
})

router.route('/pageSessions/:user/:url')
	// .get(PageSessions.getPageSession)
	.get(optionalAuth, PageSessions.getPageSessions);

//router.route('/pageSessions/:user')
//	.get(PageSessions.getPageSession);

// your routes will go here
// router.route('/posts')
//   .post(requireAuth, Posts.createPost)
//   .get(Posts.getPosts);

// router.route('/posts/:id')
//   .get(Posts.getPost)
//   .put(requireAuth, Posts.updatePost)
//   .delete(requireAuth, Posts.deletePost);


// TEMP: admin endpoint to list all sessions for Technigala data export (remove after)
router.route('/admin/sessions/all')
    .get((req, res) => {
        PageSessions.getAllSessions(req, res);
    });

export default router;
