from flask import render_template, request, redirect, session, jsonify
from app import app
from services import create_user, authenticate_user


@app.route("/login")
def login_page():
    return render_template("login.html")


@app.route("/api/login", methods=["POST"])
def api_login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Missing email or password"}), 400

    if authenticate_user(email, password):
        session["user"] = email
        return jsonify({
            "message": "Login successful",
            "redirect": "/"
        }), 200

    return jsonify({"message": "Invalid credentials"}), 401


@app.route("/dashboard")
def dashboard():
    if "user" not in session:
        return redirect("/login")

    return render_template("dashboard.html", user=session["user"])


@app.route("/logout")
def logout():
    session.clear()
    return redirect("/login")
from database import get_db_connection

@app.route("/users")
def all_users():
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, email FROM users")
    users = cursor.fetchall()

    conn.close()
    return {"users": [dict(user) for user in users]}
@app.route("/")
def index():
    html = render_template("index.html")
    return html
@app.route("/signup", methods=["GET"])
def signup_page():
    return render_template("signup.html")
@app.route("/api/signup", methods=["POST"])
def api_signup():
    data = request.get_json()

    fullname = data.get("fullname")
    email = data.get("email")
    password = data.get("password")

    if not fullname or not email or not password:
        return jsonify({"message": "Missing required fields"}), 400

    success = create_user(email, password)

    if not success:
        return jsonify({"message": "User already exists"}), 409

    return jsonify({"message": "Account created successfully"}), 201
# Static pages

@app.route("/about")
def about():
    return render_template("about.html")


@app.route("/course")
def course():
    return render_template("course.html")


@app.route("/playground")
def playground():
    return render_template("playground.html")


@app.route("/projects")
def projects():
    return render_template("projects.html")


@app.route("/quiz")
def quiz():
    return render_template("quiz.html")
@app.route("/lec<int:num>")
def lecture(num):
    if num < 0 or num > 9:
        return "Lecture not found", 404

    return render_template(f"lec{num}.html")
