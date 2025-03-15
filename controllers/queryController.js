const {db_query} = require("../config/db");
const db = db_query;

const executeQuery = async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: "SQL query is required." });
    }

    try {
        const [result] = await db.query(query);
        return res.json({ result }); // ✅ Send successful response
    } catch (error) {
        // console.error("Query Execution Error:", error);

        if (error.code === "ER_NO_SUCH_TABLE") {
            return res.status(400).json({ message: "Table not found. Please check your query.", error });
          }
        
          if (error.code === "ER_BAD_FIELD") {
            return res.status(400).json({ message: "Column not found. Please check your query.", error });
          }
        
          if (error.code === "ER_PARSE_ERROR") {
            return res.status(400).json({ message: "Syntax error in SQL query.", error });
          }
        
          if (error.code === "ER_DUP_ENTRY") {
            return res.status(400).json({ message: "Duplicate entry. Please check your data.", error });
          }
        
          if (error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ message: "Foreign key constraint violation. Referenced row not found.", error });
          }
        
          if (error.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({ message: "Foreign key constraint violation. Row is referenced by another table.", error });
          }
        
          if (error.code === "ER_TRUNCATED_WRONG_VALUE") {
            return res.status(400).json({ message: "Data type mismatch or incorrect value.", error });
          }
        
          if (error.code === "ER_ACCESS_DENIED_ERROR") {
            return res.status(401).json({ message: "Database access denied. Please check your credentials.", error }); //401 since it is auth related.
          }
        
          if (error.code === "ER_CON_COUNT_ERROR") {
            return res.status(500).json({ message: "Too many database connections.", error });
          }
        
          if (error.code === "ER_UNKNOWN_TABLE") {
            return res.status(400).json({ message: "Unknown table. Please check your query.", error });
          }
        
          if (error.code === "ER_NON_UNIQ_ERROR") {
            return res.status(400).json({ message: "Column ambiguous. Please specify the table.", error });
          }
        
          if (error.code === "ER_WRONG_FIELD_SPEC") {
            return res.status(400).json({ message: "Incorrect column specification.", error });
          }
        
          if (error.code === "ER_WRONG_KEY_COLUMN") {
            return res.status(400).json({ message: "Incorrect key column.", error });
          }
        
          if (error.code === "ER_DUP_KEYNAME") {
            return res.status(400).json({ message: "Duplicate key name.", error });
          }
        
          if (error.code === "ER_KEY_COLUMN_DOES_NOT_EXISTS") {
            return res.status(400).json({ message: "Key column does not exist.", error });
          }
        
          if (error.code === "ER_DATA_OUT_OF_RANGE") {
            return res.status(400).json({ message: "Data out of range for column.", error });
          }
        
          if (error.code === "ER_TRUNCATED_WRONG_VALUE_FOR_FIELD") {
            return res.status(400).json({ message: "Incorrect value for column.", error });
          }
        
          if (error.code === "CR_CONN_HOST_ERROR") {
            return res.status(500).json({ message: "Cannot connect to MySQL server.", error });
          }
        
          if (error.code === "CR_SERVER_GONE_ERROR") {
            return res.status(500).json({ message: "MySQL server has gone away.", error });
          }
        
          if (error.code === "CR_CONN_TIMEOUT") {
            return res.status(500).json({ message: "Lost connection to MySQL server during query.", error });
          }
        
          if (error.code === "ER_LOCK_WAIT_TIMEOUT") {
            return res.status(500).json({ message: "Lock wait timeout exceeded.", error });
          }
        
          if (error.code === "ER_DEADLOCK") {
            return res.status(500).json({ message: "Deadlock found when trying to get lock.", error });
          }
        
          if (error.code === "ER_CANT_CREATE_TABLE") {
            return res.status(500).json({ message: "Cannot create table.", error });
          }
        
          if (error.code === "ER_TABLE_EXISTS_ERROR") {
            return res.status(400).json({ message: "Table already exists.", error });
          }
        
          if (error.code === "ER_CANT_DROP_DB") {
            return res.status(500).json({ message: "Cannot drop database.", error });
          }
        
          if (error.code === "ER_DB_DROP_EXISTS_ERROR") {
            return res.status(400).json({ message: "Database doesn't exist.", error });
          }
        
          if (error.code === "ER_CANT_READ_DIR") {
            return res.status(500).json({ message: "Can't read directory.", error });
          }
        
          if (error.code === "ER_DUP_KEY") {
            return res.status(400).json({ message: "Duplicate key in table.", error });
          }
        
          if (error.code === "ER_GET_ERRNO") {
            return res.status(500).json({ message: "Got error from storage engine.", error });
          }
        
          if (error.code === "ER_RECORD_FILE_READ_ERROR") {
            return res.status(500).json({ message: "Can't find record.", error });
          }
        
          if (error.code === "ER_RECORD_FILE_WRITE_ERROR") {
            return res.status(500).json({ message: "Incorrect information in record.", error });
          }
        
          if (error.code === "ER_KEY_NOT_FOUND") {
            return res.status(500).json({ message: "Key file not found.", error });
          }
        
          if (error.code === "ER_OUT_OF_SORTMEMORY") {
            return res.status(500).json({ message: "Out of sort memory.", error });
          }
        
          if (error.code === "ER_FULL_TABLE") {
            return res.status(500).json({ message: "The table is full.", error });
          }
        
          if (error.code === "ER_NO_SUCH_INDEX") {
            return res.status(400).json({ message: "No such index.", error });
          }
        
          if (error.code === "ER_NET_PACKET_TOO_LARGE") {
            return res.status(500).json({ message: "Packet too large.", error });
          }
        
          if (error.code === "ER_NET_READ_INTERRUPTED" || error.code === "ER_NET_WRITE_INTERRUPTED") {
            return res.status(500).json({ message: "Network communication interrupted.", error });
          }
        
          if (error.code === "ER_TOO_MANY_DELAYED_THREADS") {
            return res.status(500).json({ message: "Too many delayed threads.", error });
          }
        
          if (error.code === "ER_OUT_OF_RESOURCES") {
            return res.status(500).json({ message: "Out of resources.", error });
          }
        
          if (error.code === "ER_TOO_MANY_USER_CONNECTIONS") {
            return res.status(500).json({ message: "Too many connections for user.", error });
          }
        
          if (error.code === "ER_TABLE_DEF_CHANGED") {
            return res.status(500).json({ message: "The table definition has changed.", error });
          }
        
          // Handle other errors or return a generic error
          return res.status(500).json({ message: "An unknown error occurred.", error });
    }
};

module.exports = { executeQuery };
