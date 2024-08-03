import mysql.connector
import random
import string
import bcrypt
from faker import Faker

# Initialize Faker and connect to the database
fake = Faker()
conn = mysql.connector.connect(
    host="localhost",
    port=3307,
    user="root",
    password="01000726806ZXcv",
    database="ems_db"
)
cursor = conn.cursor()
password = "1234".encode('utf-8')



'''
# Define positions and team sizes
positions = {
    'Front-End Developer': 5,
    'Back-End Developer': 10,
    'Full-Stack Developer': 10,
    'UI/UX Designer': 5,
    'Data Scientist': 5,
    'Software Engineer': 20
}
assigned = set()
'''

# Fetch all employees from the database
cursor.execute("SELECT * FROM employees")
employees = cursor.fetchall()  # Fetch all rows from the last executed statement
print(employees)
'''
# Process each employee
for employee in employees:
    emp_id = employee[0]  # Assuming emp_id is the first column
    emp_position = employee[-1]  # Adjust index based on actual column position in 'employees' table
    print("emp_position",emp_position)
    
    # Check if the position has been assigned
    if emp_position not in assigned:
        # Randomize access and insert into 'perms' table
        random_access = random.choice(['read', 'edit', 'none'])
        cursor.execute(
            "INSERT INTO perms (emp_id, access) VALUES (%s, %s)",
            (emp_id, random_access)
        )
        # Add the position to the assigned set
        assigned.add(emp_position)
    else:
        # The position has already been assigned; do not randomize access
        print(f"Position '{emp_position}' already assigned, skipping randomization for emp_id {emp_id}.")
    
'''
'''
for employee in employees:
    emp_id = employee[0]  # Assuming emp_id is the first column
    first_name, last_name = employee[1].split(" ", 1)
    random_number = ''.join(random.choices(string.digits, k=4))
    emp_email = f"{first_name.lower()}.{last_name.lower()}{random_number}@gmail.com"
    cursor.execute('UPDATE employees SET emp_email = %s WHERE emp_id = %s',
        (emp_email, emp_id))

    '''
for employee in employees:
    emp_id = employee[0]  # Assuming emp_id is the first column
    try:
        emp_password =bcrypt.hashpw(password, bcrypt.gensalt(rounds=10))
        print(f"Hashed password: {emp_password}")
    except Exception as e:
        print(f"Error: {e}")
    cursor.execute(
        'UPDATE employees SET emp_password = %s WHERE emp_id = %s',
        (emp_password, emp_id)
    )

    
# Commit changes and close connection
conn.commit()
cursor.close()
conn.close()

print("Inserted 3000 employees into the 'employees' table.")
