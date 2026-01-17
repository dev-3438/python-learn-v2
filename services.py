from werkzeug.security import generate_password_hash, check_password_hash
from database import get_db_connection

def create_user(email, password):
    conn = get_db_connection()
    cursor = conn.cursor()

    hashed_password = generate_password_hash(password)

    try:
        cursor.execute(
            "INSERT INTO users (email, password) VALUES (?, ?)",
            (email, hashed_password)
        )
        conn.commit()
        return True
    except:
        return False
    finally:
        conn.close()





def authenticate_user(email, password):
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    )

    user = cursor.fetchone()
    conn.close()

    if user and check_password_hash(user["password"], password):
        return True

    return False
