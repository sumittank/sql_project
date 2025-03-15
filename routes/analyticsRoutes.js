const express = require("express");
const router = express.Router();
const { trackExpectedQueryClick, trackSuccessfulQuery, getUserAnalytics , updateUserAnalytics, recordQuestionAttempt,
    getStudentAnalytics,getAttemptedQuestions,
    getStudentAnalyticsQueryView , 
    updateAttemptedQuestions, trackQueryView ,getViewQuestions,getStudentAnalyticsAll} = require("../controllers/analyticsController");

// Route to track expected query button clicks
router.post("/track-expected-click", trackExpectedQueryClick);

// Route to track successful query execution
router.post("/track-successful-query", trackSuccessfulQuery);

// Route to get user analytics by email
router.get("/user/:email", getUserAnalytics);

router.post('/api/analytics', updateUserAnalytics);



// Route to track unique question attempt
router.post("/attempt", recordQuestionAttempt);

// Route to get user analytics
router.get("/user/:email", getStudentAnalytics);





router.post("/update-attempts",updateAttemptedQuestions);
router.post("/track-query-view",trackQueryView);
router.get("/get-attempts",getAttemptedQuestions);
router.get("/get-all-query-view",getStudentAnalyticsQueryView);
router.post("/update-viewed-questions", getViewQuestions);

router.get("/student-analytics", getStudentAnalyticsAll);



module.exports = router;
