const pg = require('pg')
const express = require('express')
const client = new pg.Client(process.env.DATABASE_URL || 'postgres://localhost/the_acme_hr_db')
const app = express()

app.use(express.json());

app.use(require('morgan')('dev'));



// Create Employee - C
app.post('/api/employees', async (req, res, next) => {
  try {
    const SQL = `
        INSERT INTO employee(name)
        VALUES($1)
        RETURNING *
      `
    const response = await client.query(SQL, [req.body.txt])
    res.send(response.rows[0])
  } catch (ex) {
    next(ex)
  }
})

// Read Employee - R
app.get('/api/employees', async (req, res, next) => {
  try {
    const SQL = `
        SELECT * from employee ORDER BY created_at DESC;
      `
    const response = await client.query(SQL)
    res.send(response.rows)
  } catch (ex) {
    next(ex)
  }
})

// Update Employee - U
app.put('/api/employees/:id', async (req, res, next) => {
  try {
    const SQL = `
        UPDATE employee
        SET name=$1, department_id=$2, updated_at= now()
        WHERE id=$3 RETURNING *
      `
    const response = await client.query(SQL, [req.body.name, req.body.department_id, req.params.id])
    res.send(response.rows[0])
  } catch (ex) {
    next(ex)
  }
})

// Delete Employee - D
app.delete('/api/employees/:id', async (req, res, next) => {
  try {
    const SQL = `
        DELETE from employee
        WHERE id = $1
      `
    const response = await client.query(SQL, [req.params.id])
    res.sendStatus(204)
  } catch (ex) {
    next(ex)
  }
})


const init = async () => {
  await client.connect();
  console.log('connected to database');
  let SQLDept = `DROP TABLE IF EXISTS employee; 
  DROP TABLE IF EXISTS dept;

`;
  await client.query(SQLDept);
  let SQL = `CREATE TABLE dept(
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL
);
CREATE TABLE employee(
id SERIAL PRIMARY KEY,
name VARCHAR(255) NOT NULL,
created_at TIMESTAMP DEFAULT now(),
updated_at TIMESTAMP DEFAULT now(),
department_id INTEGER REFERENCES dept(id)
);
`;
  await client.query(SQL);


  console.log('tables created');
  SQL = `
INSERT INTO dept(name) VALUES('Chemistry');
INSERT INTO employee(name, department_id) VALUES('Adam', 1);
INSERT INTO employee(name, department_id) VALUES('Sheyla', 1);
INSERT INTO employee(name, department_id) VALUES('Cohen', 1);
 `;
  await client.query(SQL);
  console.log('data seeded')
  const port = process.env.PORT || 3000
  app.listen(port, () => console.log(`listening on port ${port}`))
};

init();