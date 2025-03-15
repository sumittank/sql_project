const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    // console.log("Auth Header:", authHeader);

    if ((!authHeader) || (!authHeader.startsWith("Bearer "))) {
        return res.status(403).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("Token verification failed:", err);
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = decoded; // Attach user data to request
        // console.log("Decoded User:", req.user);
        next();
    });
};

module.exports = { verifyToken };
