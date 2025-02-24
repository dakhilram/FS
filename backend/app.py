from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from flask_migrate import Migrate
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import requests

# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Flask app
app = Flask(__name__)

# ✅ Allow CORS for GitHub Pages & Local Development
allowed_origins = [
    "https://dakhilram.github.io",  # Frontend hosted on GitHub Pages
    "http://localhost:5173"  # Local development (Vite)
]
CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=True)

# ✅ Handle CORS for preflight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({"message": "Preflight request successful"})
        response.headers["Access-Control-Allow-Origin"] = request.headers.get("Origin", "*")
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response, 200

# ✅ Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    "DATABASE_URL",
    "postgresql://akhil:YvMTFxMVgulJjudfvZ6ovc5XJwZE9G0k@dpg-cukit5a3esus73asth4g-a.oregon-postgres.render.com/foresight_db_uyxi"
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# ✅ Initialize database
db = SQLAlchemy(app)
migrate = Migrate(app, db)

# ✅ Gmail SMTP Configuration
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USERNAME = os.getenv("SMTP_USERNAME")  # Your Gmail address
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")  # Your App Password

def send_contact_email(subject, message, sender_email):
    msg = MIMEMultipart()
    msg["From"] = SMTP_USERNAME
    msg["To"] = SMTP_USERNAME  # Send the message to your own admin email
    msg["Subject"] = f"New Contact Form Submission: {subject}"

    body = f"""
    <h3>New Contact Form Message</h3>
    <p><strong>From:</strong> {sender_email}</p>
    <p><strong>Subject:</strong> {subject}</p>
    <p>{message}</p>
    """

    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure connection
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, SMTP_USERNAME, msg.as_string())

        print(f"✅ Contact message sent successfully!")
        return True
    except Exception as e:
        print(f"❌ Failed to send contact message: {e}")
        return False

@app.route('/contact', methods=['POST'])
def contact():
    data = request.json
    user_email = data.get('email')
    subject = data.get('subject')
    message_body = data.get('message')

    if not user_email or not subject or not message_body:
        return jsonify({"error": "All fields are required"}), 400

    try:
        msg = MIMEMultipart()
        msg["From"] = SMTP_USERNAME
        msg["To"] = "your-email@example.com"  # Replace with the receiver's email
        msg["Subject"] = f"Contact Form: {subject}"
        
        msg.attach(MIMEText(f"From: {user_email}\n\n{message_body}", "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, "your-email@example.com", msg.as_string())

        return jsonify({"message": "Message sent successfully!"}), 200

    except Exception as e:
        print("Email send error:", str(e))
        return jsonify({"error": "Failed to send message"}), 500

# ✅ User Model with `is_verified` field
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(255), nullable=False)
    is_verified = db.Column(db.Boolean, default=False)  # ✅ Email verification status

# ✅ Create tables
with app.app_context():
    db.create_all()

# ✅ Function to Send Email Verification via Gmail SMTP
def send_verification_email(email):
    verification_link = f"https://dakhilram.github.io/FS/#/verify-email?email={email}"

    msg = MIMEMultipart()
    msg["From"] = SMTP_USERNAME
    msg["To"] = email
    msg["Subject"] = "Verify Your Email - Foresight"

    body = f"""
    <h2>Verify Your Email</h2>
    <p>Click the link below to verify your email:</p>
    <a href="{verification_link}" style="display: inline-block; padding: 10px 15px; color: white; background-color: blue; text-decoration: none; border-radius: 5px;">Verify Email</a>
    """
    msg.attach(MIMEText(body, "html"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Secure connection
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, email, msg.as_string())

        print(f"✅ Verification email sent to {email}")

    except Exception as e:
        print(f"❌ Failed to send email: {e}")

# ✅ Signup Route (Now sends verification email)
@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'All fields are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email is already registered'}), 400

    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')
    new_user = User(username=username, email=email, password=hashed_password, is_verified=False)

    db.session.add(new_user)
    db.session.commit()

    send_verification_email(email)  # ✅ Send verification email

    return jsonify({'message': 'User registered successfully! Please verify your email.'}), 201

# ✅ Email Verification Route
@app.route('/verify-email', methods=['GET'])
def verify_email():
    email = request.args.get('email')
    user = User.query.filter_by(email=email).first()

    if user:
        user.is_verified = True
        db.session.commit()
        return jsonify({'message': 'Email verified successfully!'}), 200
    else:
        return jsonify({'message': 'Invalid verification link'}), 400

# ✅ Login Route (Prevents unverified users from logging in)
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    if not user.is_verified:
        return jsonify({"message": "Please verify your email before logging in."}), 403

    if check_password_hash(user.password, password):
        return jsonify({"message": "Login successful", "username": user.username}), 200
    else:
        return jsonify({"message": "Invalid password"}), 401

# ✅ Fetch User Details API
@app.route('/user-details', methods=['GET'])
def user_details():
    username = request.args.get("username")
    user = User.query.filter_by(username=username).first()

    if not user:
        return jsonify({"message": "User not found"}), 404

    return jsonify({
        "username": user.username,
        "email": user.email,
        "isVerified": user.is_verified
    }), 200

# ✅ Resend Email Verification API
@app.route('/resend-verification', methods=['POST'])
def resend_verification():
    data = request.json
    email = data.get("email")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    send_verification_email(email)
    return jsonify({"message": "Verification email resent!"}), 200

# ✅ Change Password API
@app.route('/change-password', methods=['POST'])
def change_password():
    data = request.json
    email = data.get("email")
    current_password = data.get("currentPassword")
    new_password = data.get("newPassword")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user.password, current_password):
        return jsonify({"message": "Current password is incorrect"}), 401

    user.password = generate_password_hash(new_password, method='pbkdf2:sha256')
    db.session.commit()

    return jsonify({"message": "Password updated successfully"}), 200

# ✅ Delete Account API
@app.route('/delete-account', methods=['POST'])
def delete_account():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not check_password_hash(user.password, password):
        return jsonify({"message": "Incorrect password"}), 401

    db.session.delete(user)
    db.session.commit()

    return jsonify({"message": "Account deleted successfully"}), 200

API_KEY = os.getenv("OPENWEATHER_API_KEY")
@app.route('/weather-alerts', methods=['GET'])
def get_weather_alerts():
    city = request.args.get("city", "Houston")  # Default to Houston
    url = f"https://api.openweathermap.org/data/2.5/weather?q={city}&appid={API_KEY}&units=metric"

    try:
        response = requests.get(url)
        data = response.json()
        
        if response.status_code != 200:
            return jsonify({"error": data.get("message", "Failed to fetch data")}), response.status_code

        weather_info = {
            "city": data["name"],
            "temperature": data["main"]["temp"],
            "humidity": data["main"]["humidity"],
            "weather": data["weather"][0]["description"],
            "wind_speed": data["wind"]["speed"],
            "icon": data["weather"][0]["icon"]
        }
        return jsonify(weather_info), 200
    except Exception as e:
        return jsonify({"error": "Failed to fetch weather data", "details": str(e)}), 500

# ✅ Health Check Route
@app.route('/')
def home():
    return "Flask Backend Running!"

# ✅ Run the Flask app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
