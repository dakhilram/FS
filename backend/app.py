from flask import Flask, request, jsonify, send_file, render_template
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.utils import secure_filename
from flask_migrate import Migrate
from dotenv import load_dotenv
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import requests
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import seaborn as sns
from fpdf import FPDF
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
import xgboost as xgb


# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Flask app
app = Flask(__name__)

# ✅ Allow CORS for GitHub Pages & Local Development
allowed_origins = [
    "https://dakhilram.github.io",  # Frontend hosted on GitHub Pages
    "https://fs-51ng.onrender.com", # Render.com for backend
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
    msg["From"] = sender_email
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
        msg["To"] = "foresight.usa.noreply@gmail.com" 
        msg["Subject"] = f"Contact Form: {subject}"
        
        msg.attach(MIMEText(f"From: {user_email}\n\n{message_body}", "plain"))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, "foresight.usa.noreply@gmail.com", msg.as_string())

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

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY")
@app.route('/weather', methods=['GET'])
def get_weather():
    city = request.args.get('q')  # Get city name
    zipcode = request.args.get('zip')  # Get ZIP code
    
    if not city and not zipcode:
        return jsonify({"error": "City or ZIP code is required"}), 400

    if zipcode:
        url = f"http://api.openweathermap.org/data/2.5/weather?zip={zipcode},US&appid={OPENWEATHER_API_KEY}&units=metric"
    else:
        url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={OPENWEATHER_API_KEY}&units=metric"

    response = requests.get(url)
    data = response.json()

    if response.status_code != 200:
        return jsonify({"error": data.get("message", "Failed to fetch weather data")}), response.status_code

    return jsonify(data)

# ✅ Fetch WIldFire Data
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

ALLOWED_EXTENSIONS = {"csv"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/predict-wildfire", methods=["POST"])
def predict_wildfire():
    """Handles wildfire file uploads and runs the prediction model."""
    
    # ✅ Step 1: Check if a file is uploaded
    if "file" not in request.files:
        print("❌ No file uploaded")
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "" or not file.filename.endswith(".csv"):
        print("❌ Invalid file format")
        return jsonify({"error": "Invalid file format"}), 400

    # ✅ Step 2: Save File Securely
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)
    print(f"✅ File saved: {file_path}")

    # ✅ Step 3: Load Dataset
    try:
        data = pd.read_csv(file_path)
    except Exception as e:
        print(f"❌ Error loading CSV: {e}")
        return jsonify({"error": "Invalid CSV format"}), 400

    # ✅ Step 4: Encode Categorical Features
    categorical_cols = ["satellite", "instrument", "confidence", "version", "daynight"]
    label_encoders = {}

    for col in categorical_cols:
        if col in data.columns:
            le = LabelEncoder()
            data[col] = le.fit_transform(data[col])
            label_encoders[col] = le

    # ✅ Step 5: Apply K-Means Clustering (if location data is available)
    if "latitude" in data.columns and "longitude" in data.columns:
        data = data.dropna(subset=["latitude", "longitude"])  # Drop missing locations
        kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
        data["fire_cluster"] = kmeans.fit_predict(data[["latitude", "longitude"]])
        print("✅ K-Means Clustering Applied Successfully!")

    # ✅ Step 6: Drop Unnecessary Columns & Ensure Numeric Data
    columns_to_drop = ["acq_date", "date"]
    data = data.drop(columns=[col for col in columns_to_drop if col in data.columns], errors="ignore")
    
    if "confidence" not in data.columns:
        print("❌ Missing 'confidence' column in dataset!")
        return jsonify({"error": "Dataset is missing the 'confidence' column."}), 400

    # ✅ Step 7: Prepare Data for Model Training
    X_rf = data.select_dtypes(include=[np.number]).drop(columns=["confidence"], errors="ignore")
    y_rf = data["confidence"]

    # ✅ Step 8: Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(X_rf, y_rf, test_size=0.2, random_state=42)

    # ✅ Step 9: Train Random Forest Model
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)

    # ✅ Step 10: Predict Wildfire Confidence
    rf_predictions = rf_model.predict(X_test)
    rf_accuracy = accuracy_score(y_test, rf_predictions)
    print(f"✅ Model trained successfully! Accuracy: {rf_accuracy:.2f}")

    # ✅ Step 11: Simulate Future Environmental Conditions for Prediction
    future_data = X_test.copy()
    future_data["bright_ti4"] = np.random.uniform(0.3, 0.9, size=len(future_data))
    future_data["bright_ti5"] = np.random.uniform(0.3, 0.9, size=len(future_data))
    future_data["scan"] = np.random.uniform(0.1, 1.0, size=len(future_data))
    future_data["track"] = np.random.uniform(0.1, 1.0, size=len(future_data))

    # Predict future fire occurrences
    future_predictions = rf_model.predict(future_data)
    future_data["predicted_confidence"] = future_predictions

    # ✅ Step 12: Save Predictions to CSV
    future_predictions_file = os.path.join(UPLOAD_FOLDER, "future_wildfire_predictions.csv")
    future_data.to_csv(future_predictions_file, index=False)

    # ✅ Step 13: Generate Graphs & PDF Report
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", style="B", size=20)
    pdf.cell(0, 150, "Wildfire Future Prediction Report", ln=True, align="C")

    # 📊 Fire Clusters Visualization
    if "fire_cluster" in data.columns:
        plt.figure(figsize=(10, 6))
        sns.scatterplot(x=data["longitude"], y=data["latitude"], hue=data["fire_cluster"], palette="coolwarm")
        plt.xlabel("Longitude")
        plt.ylabel("Latitude")
        plt.title("Wildfire Prone Areas (K-Means Clustering)")
        plt.savefig("fire_clusters.png")
        pdf.add_page()
        pdf.image("fire_clusters.png", x=10, y=30, w=180)

    # 📊 Feature Importance
    feature_importance = pd.Series(rf_model.feature_importances_, index=X_rf.columns).sort_values(ascending=False)
    plt.figure(figsize=(10, 5))
    sns.barplot(x=feature_importance.values, y=feature_importance.index, palette="viridis")
    plt.xlabel("Feature Importance")
    plt.ylabel("Features")
    plt.title("Important Factors Influencing Wildfire Occurrence")
    plt.savefig("feature_importance.png")
    pdf.add_page()
    pdf.image("feature_importance.png", x=10, y=30, w=180)

    # 📊 Predictions Distribution
    plt.figure(figsize=(8, 5))
    sns.histplot(future_data["predicted_confidence"], bins=3, kde=True, color="red")
    plt.xlabel("Predicted Fire Confidence Level")
    plt.ylabel("Count")
    plt.title("Future Wildfire Predictions Distribution")
    plt.savefig("prediction_distribution.png")
    pdf.add_page()
    pdf.image("prediction_distribution.png", x=10, y=30, w=180)

    # ✅ Step 14: Save PDF Report
    pdf_file = os.path.join(UPLOAD_FOLDER, "wildfire_future_predictions_report.pdf")
    pdf.output(pdf_file)

    print("✅ Prediction & Report Generated Successfully!")

    BASE_URL = "https://fs-51ng.onrender.com"  # Replace with your actual Render backend URL

    return jsonify({
        "csv_file": f"{BASE_URL}/download/future_wildfire_predictions.csv",
        "pdf_file": f"{BASE_URL}/download/wildfire_future_predictions_report.pdf"
    }), 200

@app.route("/predict-earthquake", methods=["POST"])
def predict_earthquake():
    """Handles Earthquake Prediction Model"""
    return jsonify({"csv_file": "/download/earthquake_predictions.csv", "pdf_file": "/download/earthquake_report.pdf"}), 200

@app.route("/predict-tornado", methods=["POST"])
def predict_tornado():
    """Handles Tornado Prediction Model"""
    return jsonify({"csv_file": "/download/tornado_predictions.csv", "pdf_file": "/download/tornado_report.pdf"}), 200

@app.route("/predict-hurricane", methods=["POST"])
def predict_hurricane():
    """Handles Hurricane Prediction Model"""
    return jsonify({"csv_file": "/download/hurricane_predictions.csv", "pdf_file": "/download/hurricane_report.pdf"}), 200



@app.route("/download/<filename>")
def download_file(filename):
    """Serves generated files for download."""
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    
    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return jsonify({"error": "File not found"}), 404

    print(f"✅ File served: {file_path}")
    return send_file(file_path, as_attachment=True)



# ✅ Health Check Route
@app.route('/')
def home():
    return "Flask Backend Running!"

# ✅ Run the Flask app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
