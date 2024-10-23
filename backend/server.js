import express from "express";
import oracleDB from "oracledb";
import cors from "cors";

const app = express();
app.use(cors());

async function connectToOracleDB() {
  let connection;

  try {
    connection = await oracleDB.getConnection({
      user: "hr",
      password: "hr",
      connectString: "localhost:1521",
    });

    console.log("successfully connected to oracle DB 11g");
    return connection;
  } catch (err) {
    console.error("error occured while connecting to oracle DB ", err.message);
    throw err;
  }
}

app.get("/", async (req, res) => {
  res.json({ message: "hello from overflowstackdeveloper" });
});

app.get("/allemployees", async (req, res) => {
  let connection;
  try {
    connection = await connectToOracleDB();
    console.log(connection);

    const result = await connection.execute(
      `select first_name, last_name
            from employees`
    );

    res.json(result.rows);
  } catch (err) {
    console.error("error fetching employees details: ", err.message);
    res.status(500).send("error fetching employees details");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.log("error closing connection ", err.message);
      }
    }
  }
});

app.get("/employees/:id", async (req, res) => {
  const employeeId = req.params.id;
  let connection;

  try {
    connection = await connectToOracleDB();

    const result = await connection.execute(
      `select first_name, last_name, department_id
      from employees
      where employee_id = :id`,
      [employeeId]
    );

    if (result.rows.length === 0) {
      return res.status(404).send("employee not found");
    }

    res.json({
      firstName: result.rows[0][0],
      lastName: result.rows[0][1],
      departmentId: result.rows[0][2],
    });
  } catch (err) {
    console.error("error fetching meployee details: ", err.message);
    res.status(500).send("error fetching employee details");
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error("error closing connection: ", err.message);
      }
    }
  }
});

app.listen(3000, () => {
  console.log(`server running on port 3000 http://localhost:3000`);
});
