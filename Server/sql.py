import mysql.connector
import bcrypt

# Connect to the database
conn = mysql.connector.connect(
    host="localhost",
    port=3307,
    user="root",
    password="01000726806ZXcv",
    database="ems_db"
)
cursor = conn.cursor()

# Fetch all employees from the database
cursor.execute("SELECT * FROM employees")
employees = cursor.fetchall()  # Fetch all rows from the last executed statement

password_txt = "1234"
password = password_txt.encode('utf-8')
print(password)

for employee in employees:
    emp_id = employee[0]  # Assuming emp_id is the first column
    try:
        emp_password = bcrypt.hashpw(password, bcrypt.gensalt())
        if bcrypt.checkpw(password, emp_password):
            print("Password matches")
        else:
            print("Password does not match")
        print(f"Hashed password: {emp_password}")
    except Exception as e:
        print(f"Error: {e}")
    cursor.execute(
        'UPDATE employees SET emp_password = %s WHERE emp_id = %s',
        (emp_password, emp_id)
    )

print(employees[-1])

# Commit changes and close connection
conn.commit()
cursor.close()
conn.close()

print("Updated passwords for employees in the 'employees' table.")
