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

# ✅ Health Check Route
@app.route('/')
def home():
    return "Flask Backend Running!"

# ✅ Run the Flask app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
