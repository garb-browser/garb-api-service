import mongoose, { Schema } from 'mongoose';

// PageSession schema for storing reading session data
const PageSchema = new Schema({
  // === CORE FIELDS (existing) ===
  url: String,
  title: String,
  user: String,
  timestampStart: Date,
  timestampEnd: Date,
  sessionClosed: Boolean,
  quadFreqs: [[]],

  // === RESEARCH DATA LOGGING (new) ===

  // Session summary metrics
  summary: {
    // Core gaze metrics
    total_gaze_samples: { type: Number, default: 0 },
    total_fixations: { type: Number, default: 0 },
    avg_fixation_duration_ms: { type: Number, default: 0 },
    total_saccades: { type: Number, default: 0 },
    avg_saccade_speed: { type: Number, default: 0 },
    avg_saccade_amplitude_px: { type: Number, default: 0 },

    // Reading metrics
    total_lines_read: { type: Number, default: 0 },
    total_words_read: { type: Number, default: 0 },
    reading_speed_wpm: { type: Number, default: 0 },
    time_on_text_ms: { type: Number, default: 0 },
    time_off_text_ms: { type: Number, default: 0 },

    // Event counts
    tracking_lost_count: { type: Number, default: 0 },
    line_switch_count: { type: Number, default: 0 },
    scroll_count: { type: Number, default: 0 },
    manual_nudge_count: { type: Number, default: 0 },

    // Data quality metrics (for research paper reporting)
    data_quality: {
      data_loss_ratio: { type: Number, default: 0 },
      precision_rms_px: { type: Number, default: 0 },
      blink_count: { type: Number, default: 0 },
      data_gap_count: { type: Number, default: 0 },
      sampling_rate_nominal_hz: { type: Number, default: 60 },
      sampling_rate_actual_hz: { type: Number, default: 0 },
      expected_samples: { type: Number, default: 0 },
      actual_samples: { type: Number, default: 0 },
    },

    // Regression metrics (backward line movements)
    regressions: {
      count: { type: Number, default: 0 },
      total_lines: { type: Number, default: 0 },
      avg_distance: { type: Number, default: 0 },
    },
  },

  // JSONL event streams (compressed strings)
  gaze_events_jsonl: { type: String, default: '' },
  ui_events_jsonl: { type: String, default: '' },

  // Settings snapshot at session start
  settings_snapshot: {
    sensitivity: { type: Number, default: 4 },
    lock_time_ms: { type: Number, default: 250 },
    highlight_opacity: { type: Number, default: 0.25 },
    auto_scroll: { type: Boolean, default: false },
    theme: { type: String, default: 'gray' },
    font: { type: String, default: 'serif' },
    font_size: { type: String, default: 'medium' },
    gaze_y_offset: { type: Number, default: 40 },
    gaze_x_offset: { type: Number, default: 0 },
  },

  // === DEVICE & ENVIRONMENT METADATA (for research paper) ===
  device_metadata: {
    // Screen info
    screen_width: { type: Number, default: null },
    screen_height: { type: Number, default: null },
    screen_color_depth: { type: Number, default: null },
    device_pixel_ratio: { type: Number, default: null },

    // Viewport info
    viewport_width: { type: Number, default: null },
    viewport_height: { type: Number, default: null },

    // Browser info
    user_agent: { type: String, default: null },
    platform: { type: String, default: null },

    // Eye tracker info
    eye_tracker_model: { type: String, default: 'Tobii Eye Tracker 5' },
    nominal_sampling_rate: { type: Number, default: 60 },

    // Calibration method
    calibration_method: { type: String, default: 'Tobii native 9-point' },
  },

  // === PROCESSING METHODS DOCUMENTATION (for research paper) ===
  processing_methods: {
    smoothing: { type: String, default: 'EMA (alpha=0.3, adaptive based on velocity)' },
    fixation_detection: { type: String, default: 'I-VT (velocity threshold 30px/sample, min duration 100ms)' },
    saccade_detection: { type: String, default: 'Velocity threshold (800px/sec, 50ms freeze period)' },
    line_lock: { type: String, default: 'Hysteresis (time=250ms, margin=40px)' },
    aoi_definition: { type: String, default: 'DOM line bounding boxes from .garb-line elements' },
    confidence_calculation: { type: String, default: 'Velocity + spatial consistency based (0-1 scale)' },
    tracking_lost_threshold: { type: String, default: '2000ms without valid gaze on text' },
    blink_detection: { type: String, default: 'Data gaps 100-500ms classified as blinks' },
  },

  // === SUBJECTIVE MEASURES (surveys) ===
  survey_responses: {
    // NASA-TLX (0-100 scales)
    nasa_tlx: {
      mental_demand: { type: Number, default: null },
      physical_demand: { type: Number, default: null },
      temporal_demand: { type: Number, default: null },
      performance: { type: Number, default: null },
      effort: { type: Number, default: null },
      frustration: { type: Number, default: null },
      raw_score: { type: Number, default: null },
    },
    // SUS (1-5 Likert, 10 items)
    sus: {
      responses: { type: [Number], default: [] },
      score: { type: Number, default: null },
    },
    // Custom GARB scale (1-7 Likert)
    custom_garb: {
      helped_keep_place: { type: Number, default: null },
      reduced_rereading: { type: Number, default: null },
      felt_natural: { type: Number, default: null },
      tracking_accuracy: { type: Number, default: null },
      would_use_again: { type: Number, default: null },
    },
    // Completion timestamp
    survey_completed_at: { type: Date, default: null },
  },

}, {
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
  timestamps: true,
});

// create PostModel class from schema
const PageModel = mongoose.model('PageSession', PageSchema);

export default PageModel;


/*

Example User:

{
    _id: 1,
    email: 'John@gmail.com',
    password: 'password123',
    name: 'John Smith',
}

Example PageSessions:

{
    _id: 4,
    url: 'https://en.wikipedia.org/wiki/Dartmouth_College',
    title: 'Dartmouth College',
    users: 'userID',
    timestampStart: '',
    timestampEnd: '',
    sessionClosed: '',
    quadFreqs: [ [] [] [] [], [] [] [] [], ... ],   //only for the current session
}

Start event (timestamps)
Last event (timestamps)
sessionClosed (Boolean)
   - Frontend (close tab, navigate away)
   - Timeout

On start of new session:
  - Make sure all old sessions have been closed

const usersCollection = db.users;
const pagesCollection = db.pages;

// Find all pages read/used by a user
const currUser = usersCollection.findOne({username: "JohnSmith"});
const pagesReadByJohn = pagesCollection.find({ _id: { $in: currUser.pages } }).toArray();

// Find all users who have read/used a page
const currPage = pagesCollection.findOne({url: "https://en.wikipedia.org/wiki/Dartmouth_College"});
const usersWhoReadThisPage = usersCollection.find({ _id: { $in: currPage.users } }).toArray();

*/