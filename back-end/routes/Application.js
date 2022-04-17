const router = require("express").Router();
const bodyParser = require("body-parser");
const mysql = require("mysql");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// specify database
const db = mysql.createConnection({
  host: "team1-db.cobd8enwsupz.us-east-1.rds.amazonaws.com",
  user: "admin",
  password: "y4PVPHuqVq52Pvp",
  database: "CPSC4910",
});

// connect to database
db.connect((error) => {
  if (error) throw error;
  console.log("Connected");
});

router.post("/createApplication", (request, response) => {
  // check if application already exists
  console.log("Hit create applicaiton");
  db.query(
    "SELECT COUNT(*) AS RowCount FROM APPLICATION WHERE UID = ? AND SID = ?;",
    [request.body.UID, request.body.SID],
    (error, result) => {
      if (error) throw error;
      if (result.RowCount >= 1) {
        response.send(false);
      } else {
        //Creates the new application
        db.query(
          "INSERT INTO APPLICATION(UID,SID,Appstatus,Appdate) VALUES(?,?,'InProgress',CURRENT_TIMESTAMP())",
          [request.body.UID, request.body.SID],
          (error, result) => {
            if (error) throw error;
            response.send(true);
          }
        );
      }
    }
  );
});

// driver delete application
router.post("/deleteapplication", (request, response) => {
  console.log("Hit delete app");
  db.query(
    "DELETE FROM APPLICATION WHERE UID = ? AND SID = ?;",
    [request.body.UID, request.body.SID],
    (error, result) => {
      if (error) throw error;
      response.send(true);
    }
  );
});

// approve application
router.post("/approveapplication", (request, response) => {
  console.log("Hit approve app");
  db.query(
    "UPDATE APPLICATION SET Appstatus = 'Approved' WHERE UID = ? AND SID = ?;",
    [response.body.UID, response.body.SID],
    (error, result) => {
      if (error) throw error;
    }
  );
  //Creates a new point and wishlist record after application approval
  db.query(
    "INSERT INTO DRIVERWISHLIST(UID,SID) VALUES(?,?);",
    [response.body.UID, response.body.SID],
    (error, result) => {
      if (error) throw error;
    }
  );
  db.query(
    "INSERT INTO POINTBALANCE(UID,SID,Amount) VALUES(?,?,0);",
    [response.body.UID, response.body.SID],
    (error, result) => {
      if (error) throw error;
    }
  );
  db.query(
    "INSERT INTO SPONSORANDDRIVER(UID,SID) VALUES(?,?);",
    [response.body.UID, response.body.SID],
    (error, result) => {
      if (error) throw error;
      response.send(true);
    }
  );
});

// reject app
router.post("/rejectapplication", (request, response) => {
  console.log("rejectapp");
  db.query(
    "UPDATE APPLICATION SET Appstatus = 'Rejected', Reason = ? WHERE UID = ? AND SID = ?;",
    [request.body.Reason, request.body.UID, request.body.SID],
    (error, result) => {
      if (error) throw error;
      response.send(true);
    }
  );
});

// read specific application
router.get("/retrieveapplication", (request, response) => {
  console.log("Hit retrieve app");

  let responseBody = {
    exists: false,
    Appstatus: "",
    Reason: "",
    UID: "",
    SID: "",
  };

  db.query(
    "SELECT * FROM APPLICATION WHERE UID = ? AND SID = ?;",
    [request.query.UID, request.query.SID],
    (error, result) => {
      if (error) {
        throw error;
      } else {
        if (result.length == 0) {
          response.send(false);
        } else {
          responseBody.exists = true;
          responseBody.Appstatus = result[0].Appstatus;
          responseBody.Reason = result[0].Reason;
          responseBody.UID = result[0].UID;
          responseBody.SID = result[0].SID;
        }

        response.send(JSON.stringify(responseBody));
      }
    }
  );
});

// read specific application
router.get("/retrievealluserapplications", (request, response) => {
  console.log("Hit get all apps");

  let responseBody = {
    Appstatus: "",
    Reason: "",
    UID: "",
    SID: "",
  };

  db.query(
    "SELECT * FROM APPLICATION WHERE UID = ?;",
    [request.query.UID],
    (error, result) => {
      if (error) {
        throw error;
      } else {
        //responsebody array
        let rbArray = Array(result.length);
        //loop through result[index]
        for (const element of result) {
          responseBody.Appstatus = element.Appstatus;
          responseBody.Reason = element.Reason;
          responseBody.UID = element.UID;
          responseBody.SID = element.SID;
          rbArray.push(responseBody);
        }

        response.send(JSON.stringify(rbArray));
      }
    }
  );
});

// read specific application
router.get("/retrieveallsponsorapplications", (request, response) => {
  console.log("Hit get all sponsor apps");
  db.query(
    "SELECT * FROM APPLICATION WHERE SID = ?;",
    [request.query.SID],
    (error, result) => {
      if (error) throw error;
      response.send(JSON.stringify(result));
    }
  );
});

module.exports = router;
