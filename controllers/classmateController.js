const {db} = require("../config/db");

// 🚀 Fetch Ranked Classmates with Detailed Stats  
const getRankedClassmates = async (req, res) => {
    const { email } = req.query;

    if (!email) return res.status(400).json({ message: "Email is required" });

    try {
        // 🎯 Fetch current student's metadata  
        const [userResult] = await db.query(
            "SELECT Name, EnrollmentNo, Session, Branch, Year, Semester, Class FROM all_users WHERE Email = ? AND Status = 'active'",
            [email]
        );

        if (userResult.length === 0) return res.status(404).json({ message: "User not found or inactive" });

        const { Name, EnrollmentNo, Session, Branch, Year, Semester, Class } = userResult[0];

        // 🎯 Fetch classmates with the same metadata  
        const [classmates] = await db.query(
            "SELECT Name, EnrollmentNo, Email FROM all_users WHERE Session = ? AND Branch = ? AND Year = ? AND Semester = ? AND Class = ? AND Status = 'active'",
            [Session, Branch, Year, Semester, Class]
        );

        if (classmates.length === 0) return res.json([]);

        // 🎯 Fetch analytics data for each classmate  
        const rankedStudents = await Promise.all(
            classmates.map(async (student) => {
                const [analytics] = await db.query(
                    "SELECT attemptedQuestions, viewedQueries, viewedQuestions FROM student_analytics WHERE email = ?",
                    [student.Email]
                );

                if (analytics.length === 0) {
                    return { 
                        name: student.Name, 
                        enrollment: student.EnrollmentNo,
                        email: student.Email, 
                        weightedAccuracy: 0, 
                        solvedAfterViewing: 0, 
                        solvedWithoutViewing: 0, 
                        onlyViewed: 0 ,
                        allViewedQuestions : 0
                    };
                }

                // console.log(analytics[0].viewedQuestions)
                const attemptedQuestions = JSON.parse(analytics[0].attemptedQuestions || "[]");
                const viewedQueries = JSON.parse(analytics[0].viewedQueries || "[]");
                const viewedQuestions = JSON.parse(analytics[0].viewedQuestions || "[]");

                const solvedAfterViewing = attemptedQuestions.filter(q => viewedQueries.includes(q)).length;
                const solvedWithoutViewing = attemptedQuestions.filter(q => !viewedQueries.includes(q)).length;
                const onlyViewed = viewedQueries.filter(q => !attemptedQuestions.includes(q)).length;
                const allViewedQuestions = viewedQuestions.length

                const totalAttempted = attemptedQuestions.length;

                // 🔥 Calculate Weighted Accuracy  
                const weightedAccuracy = totalAttempted > 0
                    ? ((solvedWithoutViewing + (solvedAfterViewing * 0.5)) / totalAttempted) * 100
                    : 0;

                return {
                    name: student.Name,
                    enrollment: student.EnrollmentNo,
                    email: student.Email,
                    weightedAccuracy,
                    solvedAfterViewing,
                    solvedWithoutViewing,
                    onlyViewed,
                    allViewedQuestions
                    
                };
            })
        );

        // 🎯 Sort by Weighted Accuracy (Descending Order)  
        rankedStudents.sort((a, b) => b.weightedAccuracy - a.weightedAccuracy);

        res.json(rankedStudents);
    } catch (error) {
        // console.error("❌ Error fetching ranked classmates:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

module.exports = { getRankedClassmates };
