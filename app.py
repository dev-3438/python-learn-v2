from flask import Flask
from models import create_users_table

app = Flask(__name__)
app.secret_key = "super-secret-key"

# create table on app start
create_users_table()

import routes

if __name__ == "__main__":
    app.run(debug=True)
