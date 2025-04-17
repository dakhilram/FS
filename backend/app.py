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
#from sklearn.preprocessing import MinMaxScaler, LabelEncoder
from sklearn.model_selection import train_test_split
import seaborn as sns
from fpdf import FPDF
from sklearn.cluster import KMeans, DBSCAN
from collections import Counter
#from sklearn.ensemble import RandomForestClassifier
#from sklearn.metrics import accuracy_score
from xgboost import XGBClassifier
from imblearn.over_sampling import SMOTE
import folium
#from tensorflow.keras.models import Sequential
#from tensorflow.keras.layers import LSTM, Dense, Conv1D, Flatten
#from sklearn.ensemble import RandomForestRegressor
#from statsmodels.tsa.arima.model import ARIMA
#import hashlib
import jwt
import datetime as dt
#from datetime import datetime
from flask_mail import Mail, Message
import traceback
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr
from joblib import load


# ✅ Load environment variables
load_dotenv()

# ✅ Initialize Flask app
app = Flask(__name__)

# Load the weather-based wildfire risk model
WILDFIRE_WEATHER_MODEL = load("models/weather_wildfire_model.pkl")

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
    "postgresql://akhil:YvMTFxMVgulJjudfvZ6ovc5XJwZE9G0k@dpg-cukit5a3esus73asth4g-a.oregon-postgres.render.com/foresight_db_uyxi?sslmode=require"
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
    zipcode = db.Column(db.String(10))  # ✅ Used for daily alert location

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

@app.route("/update-zipcode", methods=["POST"])
def update_zipcode():
    data = request.json
    email = data.get("email")
    zipcode = data.get("zipcode")

    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({"message": "User not found"}), 404

    user.zipcode = zipcode
    db.session.commit()
    return jsonify({"message": "ZIP code updated"}), 200


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

# Configure Flask-Mail using environment variables
app.config["MAIL_SERVER"] = os.getenv("SMTP_SERVER")
app.config["MAIL_PORT"] = int(os.getenv("SMTP_PORT"))
app.config["MAIL_USE_TLS"] = True
app.config["MAIL_USERNAME"] = os.getenv("SMTP_USERNAME")
app.config["MAIL_PASSWORD"] = os.getenv("SMTP_PASSWORD")

mail = Mail(app)
app.config["SECRET_KEY"] = os.getenv("JWT_SECRET", "your_default_secret")


@app.route('/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get("email")

    if not email:
        return jsonify({"message": "Email is required"}), 400

    # Generate JWT Token valid for 1 hour
    token = jwt.encode(
        {"email": email, "exp": dt.datetime.utcnow() + dt.timedelta(hours=1)},
        app.config["SECRET_KEY"], 
        algorithm="HS256"
    )

    reset_link = f"https://dakhilram.github.io/FS/#/reset-password/{token}"

    try:
        msg = Message("Password Reset Request", sender=app.config["MAIL_USERNAME"], recipients=[email])
        msg.body = f"This link is only valid for 1 hour. Click the link to reset your password: {reset_link}"
        mail.send(msg)
        return jsonify({"message": "Reset link sent to email."}), 200
    except Exception as e:
        return jsonify({"message": "Email sending failed.", "error": str(e)}), 500


@app.route('/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    token = data.get("token")
    new_password = data.get("password")

    if not token or not new_password:
        return jsonify({"message": "Invalid request"}), 400

    try:
        decoded = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])
        email = decoded["email"]

        # Hash the new password before storing it
        hashed_password = generate_password_hash(new_password, method='pbkdf2:sha256')

        # Update password in database
        user = User.query.filter_by(email=email).first()
        if user:
            user.password = hashed_password
            db.session.commit()
            return jsonify({"message": "Password updated successfully."}), 200
        else:
            return jsonify({"message": "User not found."}), 404
    except jwt.ExpiredSignatureError:
        return jsonify({"message": "Reset link expired."}), 400
    except jwt.InvalidTokenError:
        return jsonify({"message": "Invalid token."}), 400


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
        "isVerified": user.is_verified,
        "zipcode": user.zipcode
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
#OPENWEATHER_API_KEY = "9d5acc1d1bff9b8ef76a089b7f0b7a60"

@app.route('/weather', methods=['GET'])
def get_weather():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    city = request.args.get('q')
    zipcode = request.args.get('zip')
    units = request.args.get('units', 'metric')

    # ✅ Step 1: Use lat/lon directly if present
    if lat and lon:
        try:
            lat = float(lat)
            lon = float(lon)
        except ValueError:
            return jsonify({"error": "Invalid coordinates"}), 400
        location_name = "Your Location"

    # ✅ Step 2: Use city or ZIP to geocode
    elif city or zipcode:
        if zipcode:
            geo_url = f"http://api.openweathermap.org/geo/1.0/zip?zip={zipcode},US&appid={OPENWEATHER_API_KEY}"
        else:
            geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city}&limit=1&appid={OPENWEATHER_API_KEY}"

        geo_response = requests.get(geo_url)
        if geo_response.status_code != 200:
            return jsonify({"error": "Failed to get coordinates"}), geo_response.status_code

        geo_data = geo_response.json()
        if not geo_data:
            return jsonify({"error": "Invalid location"}), 400

        if zipcode:
            lat = geo_data['lat']
            lon = geo_data['lon']
            location_name = geo_data.get('name', zipcode)
        else:
            lat = geo_data[0]['lat']
            lon = geo_data[0]['lon']
            location_name = geo_data[0].get('name', city)

    else:
        return jsonify({"error": "City, ZIP code, or coordinates are required"}), 400

    # ✅ Step 3: Fetch from One Call API 3.0
    one_call_url = (
        f"https://api.openweathermap.org/data/3.0/onecall?"
        f"lat={lat}&lon={lon}&exclude=minutely"
        f"&units={units}&appid={OPENWEATHER_API_KEY}"
    )

    weather_response = requests.get(one_call_url)
    if weather_response.status_code != 200:
        return jsonify({"error": "Failed to fetch weather data"}), weather_response.status_code

    weather_data = weather_response.json()
    weather_data["location"] = {
        "name": location_name,
        "lat": lat,
        "lon": lon
    }

    return jsonify(weather_data)



@app.route('/generate-alert-email', methods=['POST'])
def generate_alert_email():
    try:
        data = request.get_json()
        lat = data.get("lat")
        lon = data.get("lon")
        email = data.get("email")
        force_send = data.get("forceSend", False)  # ✅ Support force sending even if no alerts

        if not lat or not lon or not email:
            return jsonify({"error": "Missing lat, lon or email"}), 400

        # Fetch weather
        url = (
            f"https://api.openweathermap.org/data/3.0/onecall"
            f"?lat={lat}&lon={lon}&exclude=minutely"
            f"&appid={OPENWEATHER_API_KEY}&units=metric"
        )
        response = requests.get(url)
        if response.status_code != 200:
            return jsonify({"error": "Failed to fetch weather data"}), 500

        weather_data = response.json()
        alerts = weather_data.get("alerts", [])

        # Handle no alerts scenario
        if not alerts and not force_send:
            return jsonify({"alertAvailable": False}), 200

        # Build email body
        if not alerts and force_send:
            body = "<h2>📬 No Active Weather Alerts</h2><p>There are currently no alerts, but this is your requested weather notification from Foresight.</p>"
        else:
            body = "<h2>🚨 Active Weather Alerts</h2>"
            for i, alert in enumerate(alerts):
                body += f"""
                <hr>
                <h3>🔔 Alert #{i + 1}: {alert['event']}</h3>
                <p><strong>From:</strong> {dt.datetime.utcfromtimestamp(alert['start']).strftime('%Y-%m-%d %H:%M UTC')}</p>
                <p><strong>To:</strong> {dt.datetime.utcfromtimestamp(alert['end']).strftime('%Y-%m-%d %H:%M UTC')}</p>
                <p><strong>Issued by:</strong> {alert['sender_name']}</p>
                <p><strong>Description:</strong></p>
                <pre>{alert['description']}</pre>
                """

        # Prepare email
        msg = MIMEMultipart()
        msg["From"] = SMTP_USERNAME
        msg["To"] = email
        msg["Subject"] = "Weather Alert Summary"  # no emojis in headers

        msg.attach(MIMEText(body, "html", "utf-8"))

        # Send email
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, email, msg.as_string().encode("utf-8"))  # UTF-8 safe

        return jsonify({
            "message": "Email sent successfully.",
            "alertAvailable": bool(alerts)
        }), 200

    except Exception as e:
        print("Error in generate-alert-email:", str(e))
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# ✅ Fetch WIldFire Data
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
BASE_URL = "https://fs-51ng.onrender.com"  # Update with your actual Render backend URL

ALLOWED_EXTENSIONS = {"csv"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/predict-wildfire", methods=["POST"])
def predict_wildfire():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "" or not file.filename.endswith(".csv"):
        return jsonify({"error": "Invalid file format"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    try:
        df = pd.read_csv(file_path)

        df.drop(columns=['Unnamed: 0'], inplace=True, errors='ignore')
        df['datetime'] = pd.to_datetime(df['acq_date'] + ' ' + df['acq_time'].astype(str).str.zfill(4), format='%Y-%m-%d %H%M')
        df['confidence'] = df['confidence'].map({'low': 0, 'nominal': 1, 'high': 2})
        df['confidence'] = df['confidence'].fillna(df['frp'].apply(lambda x: 2 if x > 50 else (1 if x > 20 else 0)))
        df['risk_level'] = df.apply(lambda row: 2 if row['confidence'] == 2 and row['frp'] > 50 else (1 if row['confidence'] == 1 else 0), axis=1)
        df['daynight'] = df['daynight'].map({'D': 0, 'N': 1})

        def assign_risk(row):
            if row['frp'] > 50 and row['bright_ti4'] > 340:
                return 2
            elif row['frp'] > 20 and row['bright_ti4'] > 320:
                return 1
            else:
                return 0

        df['risk_level'] = df.apply(assign_risk, axis=1)

        df['intensity_ratio'] = df['bright_ti4'] / df['bright_ti5']
        features = ['bright_ti4', 'bright_ti5', 'latitude', 'longitude', 'daynight', 'intensity_ratio']
        X = df[features]
        y = df['risk_level']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)

        df['temp_diff'] = df['bright_ti4'] - df['bright_ti5']
        df['lat_long_interaction'] = df['latitude'] * df['longitude']
        features.extend(['temp_diff', 'lat_long_interaction'])

        smote = SMOTE(sampling_strategy='auto', random_state=42)
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

        kmeans = KMeans(n_clusters=5, random_state=42)
        df['fire_zone'] = kmeans.fit_predict(df[['latitude', 'longitude']])
        dbscan = DBSCAN(eps=0.5, min_samples=5)
        df['fire_zone'] = dbscan.fit_predict(df[['latitude', 'longitude']])
        df['fire_zone'] = np.where(df['fire_zone'] == -1, 0, df['fire_zone'])
        features.append('fire_zone')

        class_counts = Counter(y_train_resampled)
        smote = SMOTE(sampling_strategy={1: int(class_counts[0] * 0.8)}, random_state=42)
        X_train_resampled, y_train_resampled = smote.fit_resample(X_train, y_train)

        df['fire_intensity_ratio'] = df['frp'] / (df['bright_ti4'] + df['bright_ti5'])
        df['temp_variation'] = abs(df['bright_ti4'] - df['bright_ti5'])
        df['fire_energy'] = df['frp'] * df['bright_ti4']
        features.extend(['fire_intensity_ratio', 'temp_variation', 'fire_energy'])

        model = XGBClassifier(n_estimators=200, max_depth=8, learning_rate=0.1, objective='multi:softmax', eval_metric='mlogloss', random_state=42)
        model.fit(X_train_resampled, y_train_resampled)

        y_pred_probs = model.predict_proba(X_test)
        y_pred_adjusted = np.argmax(y_pred_probs, axis=1)
        y_pred_adjusted[(y_pred_probs[:,1] > 0.35)] = 1
        y_pred_adjusted[(y_pred_probs[:,2] > 0.4)] = 2

        y_pred = model.predict(X_test)
        df_predictions = X_test.copy()
        df_predictions['Predicted_Risk_Level'] = y_pred
        df_predictions.to_csv(os.path.join(UPLOAD_FOLDER, "wildfire_predictions.csv"), index=False)

        # === Graphs Generation ===
        graph_paths = []

        plt.figure(figsize=(8, 5))
        sns.countplot(x=df['risk_level'], palette='coolwarm')
        plt.title("Class Distribution of Wildfire Risk Levels")
        graph_path1 = os.path.join(UPLOAD_FOLDER, "graph1_class_distribution.png")
        plt.savefig(graph_path1)
        graph_paths.append(graph_path1)
        plt.close()

        plt.figure(figsize=(8, 5))
        sns.scatterplot(data=df, x='bright_ti4', y='frp', hue='risk_level', alpha=0.6, palette='coolwarm')
        plt.title("Fire Radiative Power (FRP) vs. Brightness Temperature")
        graph_path2 = os.path.join(UPLOAD_FOLDER, "graph2_frp_vs_brightness.png")
        plt.savefig(graph_path2)
        graph_paths.append(graph_path2)
        plt.close()

        plt.figure(figsize=(10, 6))
        sns.kdeplot(x=df['longitude'], y=df['latitude'], cmap="Reds", fill=True, levels=50)
        plt.title("Wildfire Occurrences Heatmap (Latitude vs. Longitude)")
        graph_path3 = os.path.join(UPLOAD_FOLDER, "graph3_fire_heatmap.png")
        plt.savefig(graph_path3)
        graph_paths.append(graph_path3)
        plt.close()

        plt.figure(figsize=(10, 6))
        sns.heatmap(df.corr(numeric_only=True), annot=True, cmap="coolwarm", fmt=".2f")
        plt.title("Feature Correlation Heatmap")
        graph_path4 = os.path.join(UPLOAD_FOLDER, "graph4_feature_correlation.png")
        plt.savefig(graph_path4)
        graph_paths.append(graph_path4)
        plt.close()

        plt.figure(figsize=(8, 5))
        sns.boxplot(x=df['risk_level'], y=df['frp'], palette='coolwarm')
        plt.title("Fire Intensity (FRP) Distribution Across Risk Levels")
        graph_path5 = os.path.join(UPLOAD_FOLDER, "graph5_frp_vs_risk.png")
        plt.savefig(graph_path5)
        graph_paths.append(graph_path5)
        plt.close()

        # === Historical Map ===
        risk_colors = {0: "green", 1: "orange", 2: "red"}
        map_center = [df["latitude"].mean(), df["longitude"].mean()]
        wildfire_map = folium.Map(location=map_center, zoom_start=5)
        for _, row in df.iterrows():
            folium.CircleMarker(
                location=[row["latitude"], row["longitude"]],
                radius=5,
                color=risk_colors[row['risk_level']],
                fill=True,
                fill_color=risk_colors[row['risk_level']],
                fill_opacity=0.7
            ).add_to(wildfire_map)
        wildfire_map_path = os.path.join(UPLOAD_FOLDER, "wildfire_map.html")
        wildfire_map.save(wildfire_map_path)

        # === Future Predictions & Map ===
        future_days = 30
        future_dates = pd.date_range(start=dt.datetime.today(), periods=future_days, freq='D')
        future_data = []

        for date in future_dates:
            for _ in range(50):
                random_fire = df.sample(1).iloc[0]
                new_entry = {
                    'date': date,
                    'latitude': random_fire['latitude'] + np.random.uniform(-0.1, 0.1),
                    'longitude': random_fire['longitude'] + np.random.uniform(-0.1, 0.1),
                    'bright_ti4': random_fire['bright_ti4'] + np.random.uniform(-5, 5),
                    'bright_ti5': random_fire['bright_ti5'] + np.random.uniform(-5, 5),
                    'frp': random_fire['frp'] + np.random.uniform(-10, 10),
                    'daynight': 0
                }
                future_data.append(new_entry)

        df_future = pd.DataFrame(future_data)
        df_future['intensity_ratio'] = df_future['bright_ti4'] / df_future['bright_ti5']
        X_future = df_future[['bright_ti4', 'bright_ti5', 'latitude', 'longitude', 'daynight', 'intensity_ratio']]
        df_future['predicted_risk_level'] = model.predict(X_future)

        future_map = folium.Map(location=[df_future["latitude"].mean(), df_future["longitude"].mean()], zoom_start=5)
        for _, row in df_future.iterrows():
            risk_level = row["predicted_risk_level"]
            popup_text = f"""
            <b>Date:</b> {row['date']}<br>
            <b>Latitude:</b> {row['latitude']}<br>
            <b>Longitude:</b> {row['longitude']}<br>
            <b>Predicted Risk Level:</b> {risk_level}
            """

            folium.CircleMarker(
                location=[row["latitude"], row["longitude"]],
                radius=5,
                color=risk_colors[row['predicted_risk_level']],
                fill=True,
                fill_color=risk_colors[row['predicted_risk_level']],
                fill_opacity=0.7,
                popup=folium.Popup(popup_text, max_width=300)
            ).add_to(future_map)
        future_map_path = os.path.join(UPLOAD_FOLDER, "future_wildfire_map.html")
        future_map.save(future_map_path)

        df_future.to_csv(os.path.join(UPLOAD_FOLDER, "future_wildfire_predictions.csv"), index=False)

        # === PDF Report ===
        pdf = FPDF()
        pdf.add_page()

# Get page height for positioning
        page_height = pdf.h

# 1️⃣ Project Title at 40% from top
        pdf.set_y(page_height * 0.3)

        pdf.set_font("Arial", style='B', size=45)
        pdf.cell(0, 12, "ForeSight", ln=True, align='C')

# Tagline just below
        pdf.set_font("Arial",style='I', size=14)
        pdf.cell(0, 10, "Predicting disasters ahead", ln=True, align='C')

# 2️⃣ Wildfire Report at 60% from top
        pdf.set_y(page_height * 0.6)

        pdf.set_font("Arial", style='B', size=30)
        pdf.cell(0, 10, "Wildfire Prediction Report", ln=True, align='C')

        descriptions = [
    ("Class Distribution of Wildfire Risk Levels",
     "This bar chart represents the distribution of wildfire risk levels categorized as low (0), moderate (1), and high (2). "
     "The data indicates that low-risk wildfires are the most common, followed by moderate and high-risk incidents. "
     "This imbalance suggests that most fire events in the dataset are not severe, though significant occurrences of moderate and high-risk fires still exist. "
     "The imbalance in risk levels can impact predictive modeling, requiring techniques like SMOTE to ensure better class representation. "
     "The fire radiative power (FRP) and brightness temperatures likely play a crucial role in determining risk levels. "
     "The importance of high-risk wildfires lies in their potential to cause severe environmental and economic damage. Understanding this distribution helps in designing appropriate mitigation and response strategies. "
     "The dataset's risk level classification is essential for forecasting fire-prone areas and preparing for potential fire outbreaks. Such data-driven insights assist in wildfire management, resource allocation, and emergency response."),

    ("Fire Radiative Power (FRP) vs. Brightness Temperature",
     "This scatter plot examines the relationship between fire radiative power (FRP) and brightness temperature (Ti4), with wildfire risk levels represented using different colors. "
     "Higher brightness temperatures generally correlate with higher FRP values, indicating more intense fire events. High-risk wildfires (risk level 2) appear more frequently in regions with FRP above 50, confirming the importance of fire intensity in risk assessment. "
     "Some moderate-risk wildfires (risk level 1) overlap with low-risk cases, suggesting a continuum in fire intensity rather than distinct separations. Temperature anomalies in satellite imagery provide an early warning system for detecting active fire zones. "
     "This graph emphasizes the usefulness of remote sensing in fire detection by linking temperature variations to fire intensity. The concentration of high-risk cases in specific temperature ranges can help calibrate threshold values for predictive models. "
     "This relationship also validates the use of brightness temperature as a key predictive feature in machine learning models."),

    ("Wildfire Occurrences Heatmap (Latitude vs. Longitude)",
     "This heatmap visualizes the spatial distribution of wildfire occurrences, highlighting areas with the most frequent fire events. The darker red regions indicate high-density wildfire zones, suggesting repeated fire activity in those locations. Geographic clustering of wildfires may be influenced by factors like dry climate, vegetation type, and human activities."
     " Such visualizations help in identifying high-risk wildfire-prone areas and prioritizing resource allocation for fire prevention. "
     " The concentration of fire hotspots suggests that certain regions experience frequent and recurring wildfires, likely due to weather patterns or topography. This heatmap can guide the development of preventive measures and real-time monitoring systems in high-risk zones."
     "Wildfire intensity may also vary by geographical regions, necessitating different firefighting strategies. Identifying these trends can aid policymakers in formulating better land management and conservation strategies."
     " This heatmap serves as a vital tool in disaster preparedness and early intervention planning."),

    ("Feature Correlation Heatmap",
     "This heatmap displays the correlation between different numerical features in the dataset, helping to identify strong relationships between variables. Fire Radiative Power (FRP) and brightness temperature (Ti4 & Ti5) show a strong positive correlation, confirming their significance in wildfire intensity. "
     "Features with high correlation may indicate redundancy, which is essential when selecting the best predictors for machine learning models. The presence of spatial interaction terms like latitude and longitude provides insight into geographical dependencies in wildfire spread. High correlations between temperature variables suggest that extreme temperature shifts are a key indicator of wildfire activity. "
     "Some variables may have low correlations with wildfire intensity, suggesting they contribute minimally to risk assessment. Understanding these relationships helps in feature selection and model optimization. "
     "This heatmap serves as a diagnostic tool for detecting multicollinearity, which can affect model accuracy. Data scientists use such heatmaps to refine predictive algorithms and improve model performance."),

    ("Fire Intensity (FRP) Distribution Across Risk Levels",
     "This boxplot illustrates how fire radiative power (FRP) varies across different risk levels, giving insight into wildfire intensity. The median FRP increases with higher risk levels, confirming that high-risk wildfires tend to have significantly greater intensity. The presence of outliers in high-risk cases suggests extreme fire events with exceptionally high FRP values. Moderate-risk wildfires display a wider range of FRP values, indicating variability in their intensity. Low-risk cases generally have lower and less variable FRP, which is expected given their classification. The boxplot helps in detecting thresholds for risk categorization, which can aid in wildfire prediction. Understanding fire intensity variations helps in refining machine learning classification boundaries for risk levels. This visualization also validates the importance of FRP as a key determinant in wildfire severity assessment. The overlap between moderate and high-risk cases suggests the need for additional factors in classification. These findings help in developing more accurate models for wildfire risk prediction.")
]

        for i, path in enumerate(graph_paths):
            pdf.add_page()
            pdf.set_font("Arial", style='B', size=12)
            pdf.cell(0, 10, f"Graph {i+1}", ln=True)
            pdf.set_font("Arial", size=10)
            pdf.cell(0, 10, f"Graph {i+1}: {descriptions[i][0]}", ln=True)
            pdf.multi_cell(0, 5, descriptions[i][1])
            pdf.image(path, w=180)

        pdf.add_page()
        pdf.set_font("Arial", style='B', size=12)
        pdf.cell(0, 10, "Interactive Map: Historical", ln=True)
        pdf.ln(10)
        pdf.set_font("Arial", size=10)
        pdf.multi_cell(0, 8, "This map shows past wildfire occurrences and their respective risk levels based on the given dataset.\nClick the link below to open the interactive version in a browser.")
        pdf.ln(5)
        pdf.set_text_color(0, 0, 255)
        pdf.cell(0, 10, "Click to view Wildfire Map", ln=True, link=f"{BASE_URL}/download/wildfire_map.html")
        pdf.set_text_color(0, 0, 0)

        pdf.add_page()
        pdf.set_font("Arial", style='B', size=12)
        pdf.cell(0, 10, "Interactive Map: Future", ln=True)
        pdf.ln(10)
        pdf.set_font("Arial", size=10)
        pdf.multi_cell(0, 8, "This map visualizes predicted wildfire risk zones for the next 30 days.\nClick the link below to open the interactive version in a browser.")
        pdf.ln(5)
        pdf.set_text_color(0, 0, 255)
        pdf.cell(0, 10, "Click to view Future Wildfire Map", ln=True, link=f"{BASE_URL}/download/future_wildfire_map.html")
        pdf.set_text_color(0, 0, 0)

        pdf.output(os.path.join(UPLOAD_FOLDER, "wildfire_report.pdf"))
    except Exception as e:
        traceback.print_exc()  # ⬅️ Add this line to print full error in logs
        return jsonify({"error": str(e)}), 500


    return jsonify({
            "csv_file": f"{BASE_URL}/download/future_wildfire_predictions.csv",
            "pdf_file": f"{BASE_URL}/download/wildfire_report.pdf",
    }), 200




@app.route("/download/<filename>")
def download_file(filename):
    """Serves generated files for download."""
    file_path = os.path.join(UPLOAD_FOLDER, filename)

    if not os.path.exists(file_path):
        print(f"❌ File not found: {file_path}")
        return jsonify({"error": "File not found"}), 404

    print(f"✅ File served: {file_path}")
    return send_file(file_path, as_attachment=True)  # Allow downloading HTML files

from joblib import load
TORNADO_MODEL = load("models/tornado_model.pkl")

def predict_tornado_risk(weather):
    df = pd.DataFrame([{
        "temp": weather.get("temp", 0),
        "humidity": weather.get("humidity", 100),
        "wind_speed": weather.get("wind_speed", 0),
        "pressure": weather.get("pressure", 1013),
        "clouds": weather.get("clouds", 0),
        "uvi": weather.get("uvi", 0)
    }])
    prediction = TORNADO_MODEL.predict(df)[0]
    return int(prediction)

from sqlalchemy.orm import scoped_session, sessionmaker

def send_tornado_risk_alerts():
    with app.app_context():
        Session = scoped_session(sessionmaker(bind=db.engine))
        session = Session()

        try:
            users = session.query(User).filter(User.zipcode.isnot(None), User.zipcode != "").all()

            for user in users:
                try:
                    geo_url = f"http://api.openweathermap.org/geo/1.0/zip?zip={user.zipcode},US&appid={OPENWEATHER_API_KEY}"
                    geo_response = requests.get(geo_url)
                    geo_data = geo_response.json()

                    if geo_response.status_code != 200 or 'lat' not in geo_data:
                        print(f"❌ Invalid ZIP for {user.email}")
                        continue

                    lat = geo_data['lat']
                    lon = geo_data['lon']

                    weather_url = (
                        f"https://api.openweathermap.org/data/3.0/onecall"
                        f"?lat={lat}&lon={lon}&exclude=minutely"
                        f"&appid={OPENWEATHER_API_KEY}&units=metric"
                    )
                    weather_response = requests.get(weather_url)
                    weather = weather_response.json().get("current", {})
                    weather["pressure"] = weather_response.json().get("pressure", 1013)
                    tornado_risk = predict_tornado_risk(weather) #2
                    print(f"📍 {user.email} | ZIP: {user.zipcode} | Tornado Risk: {tornado_risk}")
                    if tornado_risk >= 1:
                        subject = "🌪️ Tornado Risk Alert - Foresight"
                        risk_text = ["Low", "Moderate", "High"][tornado_risk]
                        body = f"""
                        <h2>Tornado Risk Level: {risk_text}</h2>
                        <p>Current weather conditions suggest a <strong>{risk_text}</strong> tornado risk in your area (ZIP code: <strong>{user.zipcode}</strong>).</p>
                        <p>Please stay alert and monitor local emergency instructions.</p>
                        <p>– Foresight Team</p>
                        """

                        msg = MIMEMultipart()
                        msg["From"] = SMTP_USERNAME
                        msg["To"] = user.email
                        msg["Subject"] = subject
                        msg.attach(MIMEText(body, "html", "utf-8"))

                        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                            server.starttls()
                            server.login(SMTP_USERNAME, SMTP_PASSWORD)
                            server.sendmail(SMTP_USERNAME, user.email, msg.as_string().encode("utf-8"))

                        print(f"✅ Tornado alert sent to {user.email}")
                except Exception as e:
                    print(f"❌ Error in tornado alert for {user.email}: {str(e)}")
        finally:
            session.close()

from joblib import load
HURRICANE_MODEL = load("models/hurricane_model.pkl")

def predict_hurricane_risk(weather):
    df = pd.DataFrame([{
        "temp": weather.get("temp", 0),
        "humidity": weather.get("humidity", 100),
        "wind_speed": weather.get("wind_speed", 0),
        "pressure": weather.get("pressure", 1013),
        "clouds": weather.get("clouds", 0),
        "uvi": weather.get("uvi", 0)
    }])
    prediction = HURRICANE_MODEL.predict(df)[0]
    return int(prediction)

def send_hurricane_risk_alerts():
    with app.app_context():
        Session = scoped_session(sessionmaker(bind=db.engine))
        session = Session()

        try:
            users = session.query(User).filter(User.zipcode.isnot(None), User.zipcode != "").all()

            for user in users:
                try:
                # Get location
                    geo_url = f"http://api.openweathermap.org/geo/1.0/zip?zip={user.zipcode},US&appid={OPENWEATHER_API_KEY}"
                    geo_response = requests.get(geo_url)
                    geo_data = geo_response.json()

                    if geo_response.status_code != 200 or 'lat' not in geo_data:
                        print(f"❌ Invalid ZIP for {user.email}")
                        continue

                    lat = geo_data['lat']
                    lon = geo_data['lon']

                    # Get weather data
                    weather_url = (
                        f"https://api.openweathermap.org/data/3.0/onecall"
                        f"?lat={lat}&lon={lon}&exclude=minutely"
                        f"&appid={OPENWEATHER_API_KEY}&units=metric"
                    )
                    weather_response = requests.get(weather_url)
                    weather = weather_response.json().get("current", {})
                    weather["pressure"] = weather_response.json().get("pressure", 1013)

                    hurricane_risk = predict_hurricane_risk(weather)
                    print(f"📍 {user.email} | ZIP: {user.zipcode} | Hurricane Risk: {hurricane_risk}")

                    if hurricane_risk >= 1:
                        subject = "🌀 Hurricane Risk Alert - Foresight"
                        risk_text = ["Low", "Moderate", "High"][hurricane_risk]
                        body = f"""
                        <h2>Hurricane Risk Level: {risk_text}</h2>
                        <p>Current weather conditions suggest a <strong>{risk_text}</strong> hurricane risk in your area (ZIP code: <strong>{user.zipcode}</strong>).</p>
                        <p>Please stay alert and monitor local emergency updates.</p>
                        <p>– Foresight Team</p>
                        """

                        msg = MIMEMultipart()
                        msg["From"] = SMTP_USERNAME
                        msg["To"] = user.email
                        msg["Subject"] = subject
                        msg.attach(MIMEText(body, "html", "utf-8"))

                        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                            server.starttls()
                            server.login(SMTP_USERNAME, SMTP_PASSWORD)
                            server.sendmail(SMTP_USERNAME, user.email, msg.as_string().encode("utf-8"))

                        print(f"✅ Hurricane alert sent to {user.email}")

                except Exception as e:
                    print(f"❌ Error in hurricane alert for {user.email}: {str(e)}")
        finally:
            session.close()


def send_wildfire_risk_alerts():
    with app.app_context():
        Session = scoped_session(sessionmaker(bind=db.engine))
        session = Session()

        try:
            users = session.query(User).filter(User.zipcode.isnot(None), User.zipcode != "").all()

            for user in users:
                try:
                    geo_url = f"http://api.openweathermap.org/geo/1.0/zip?zip={user.zipcode},US&appid={OPENWEATHER_API_KEY}"
                    geo_response = requests.get(geo_url)
                    geo_data = geo_response.json()

                    if geo_response.status_code != 200 or 'lat' not in geo_data:
                        print(f"❌ Invalid ZIP for {user.email}")
                        continue

                    lat = geo_data['lat']
                    lon = geo_data['lon']

                    weather_url = (
                        f"https://api.openweathermap.org/data/3.0/onecall"
                        f"?lat={lat}&lon={lon}&exclude=minutely"
                        f"&appid={OPENWEATHER_API_KEY}&units=metric"
                    )
                    weather_response = requests.get(weather_url)
                    weather = weather_response.json().get("current", {})

                    wildfire_risk = predict_weather_wildfire_risk(weather)
                    print(f"📍 {user.email} | ZIP: {user.zipcode} | Wildfire Risk: {wildfire_risk}")

                    if wildfire_risk >= 1:
                        send_wildfire_email(user.email, wildfire_risk, user.zipcode)

                except Exception as e:
                    print(f"❌ Error in wildfire alert for {user.email}: {str(e)}")

        finally:
            session.close()

def predict_weather_wildfire_risk(weather):
    df = pd.DataFrame([{
        "temp": weather.get("temp", 0),
        "humidity": weather.get("humidity", 100),
        "wind_speed": weather.get("wind_speed", 0),
        "clouds": weather.get("clouds", 0),
        "uvi": weather.get("uvi", 0)
    }])
    prediction = WILDFIRE_WEATHER_MODEL.predict(df)[0]
    return int(prediction)  # risk level: 0, 1, 2

def send_wildfire_email(recipient_email, risk_level, zipcode):
    risk_text = ["Low", "Moderate", "High"][risk_level]

    subject = f"🔥 Wildfire Risk Alert for ZIP {zipcode}"
    body = f"""
    <h2>Wildfire Risk Level: {risk_text}</h2>
    <p>Our system predicts a <strong>{risk_text}</strong> wildfire risk in your area (ZIP code: <strong>{zipcode}</strong>).</p>
    <p>Please stay alert and take precautions if necessary.</p>
    <p>– Foresight Team</p>
    """

    msg = MIMEMultipart()
    msg["From"] = SMTP_USERNAME
    msg["To"] = recipient_email
    msg["Subject"] = subject
    msg.attach(MIMEText(body, "html", "utf-8"))

    try:
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.sendmail(SMTP_USERNAME, recipient_email, msg.as_string().encode("utf-8"))
        print(f"✅ Wildfire alert sent to {recipient_email}")
    except Exception as e:
        print(f"❌ Failed to send wildfire email to {recipient_email}: {e}")


from apscheduler.schedulers.background import BackgroundScheduler
from app import db

def send_daily_alert_emails():
    with app.app_context():
        users = db.session.query(User).filter(User.zipcode.isnot(None), User.zipcode != "").all()
        for user in users:
            try:
                geo_url = f"http://api.openweathermap.org/geo/1.0/zip?zip={user.zipcode},US&appid={OPENWEATHER_API_KEY}"
                geo_response = requests.get(geo_url)
                geo_data = geo_response.json()

                if geo_response.status_code != 200 or 'lat' not in geo_data:
                    print(f"❌ Invalid ZIP for {user.email}")
                    continue

                lat = geo_data['lat']
                lon = geo_data['lon']

                # 📨 Reuse the logic from /generate-alert-email
                url = (
                    f"https://api.openweathermap.org/data/3.0/onecall"
                    f"?lat={lat}&lon={lon}&exclude=minutely"
                    f"&appid={OPENWEATHER_API_KEY}&units=metric"
                )
                weather_response = requests.get(url)
                weather_data = weather_response.json()
                alerts = weather_data.get("alerts", [])
                #weather = weather_response.json().get("current", {})
                #wildfire_risk = predict_weather_wildfire_risk(weather)

                #if wildfire_risk >= 1:
    # Moderate or High Risk
                 #   send_wildfire_email(user.email, wildfire_risk, user.zipcode)


                # Construct body
                if not alerts:
                    body = "<h2>📬 No Active Weather Alerts</h2><p>This is your daily forecast update from Foresight.</p>"
                else:
                    body = "<h2>🚨 Active Weather Alerts</h2>"
                    for i, alert in enumerate(alerts):
                        body += f"""
                            <hr>
                            <h3>🔔 Alert #{i + 1}: {alert['event']}</h3>
                            <p><strong>From:</strong> {dt.datetime.utcfromtimestamp(alert['start']).strftime('%Y-%m-%d %H:%M UTC')}</p>
                            <p><strong>To:</strong> {dt.datetime.utcfromtimestamp(alert['end']).strftime('%Y-%m-%d %H:%M UTC')}</p>
                            <p><strong>Issued by:</strong> {alert['sender_name']}</p>
                            <p><strong>Description:</strong></p>
                            <pre>{alert['description']}</pre>
                        """

                msg = MIMEMultipart()
                msg["From"] = SMTP_USERNAME
                msg["To"] = user.email
                msg["Subject"] = "Daily Weather Alert - Foresight"
                msg.attach(MIMEText(body, "html", "utf-8"))

                with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                    server.starttls()
                    server.login(SMTP_USERNAME, SMTP_PASSWORD)
                    server.sendmail(SMTP_USERNAME, user.email, msg.as_string().encode("utf-8"))

                print(f"✅ Sent alert to {user.email}")

            except Exception as e:
                print(f"❌ Error for {user.email}: {str(e)}")


# ⏰ Schedule it to run every day at 12:00 AM
from pytz import timezone

central = timezone("US/Central")
scheduler = BackgroundScheduler(timezone=central)
#scheduler.add_job(send_daily_alert_emails, "interval", minutes=1)  # For testing, run every minute
scheduler.add_job(send_daily_alert_emails, "cron", hour=0, minute=0)
# Wildfire alerts at 8 AM and 6 PM
scheduler.add_job(send_wildfire_risk_alerts, "cron", hour=8, minute=0)
scheduler.add_job(send_wildfire_risk_alerts, "cron", hour=23, minute=20)
# Tornado alerts at 9 AM and 8 PM
scheduler.add_job(send_tornado_risk_alerts, "cron", hour=9, minute=0)
scheduler.add_job(send_tornado_risk_alerts, "cron", hour=23, minute=15)
# Hurricane alerts at 10 AM and 7 PM
scheduler.add_job(send_hurricane_risk_alerts, "cron", hour=10, minute=0)
scheduler.add_job(send_hurricane_risk_alerts, "cron", hour=23, minute=30)


#scheduler.start()


@app.route('/manual-daily-alerts')
def run_manual_alerts():
    return "🚫 This endpoint has been disabled", 403
    #send_daily_alert_emails()
    #return "✅ Manual daily alerts triggered!", 200

    #Wildfire risk alerts
    #send_wildfire_risk_alerts()  # 👈 call it manually
    #return "✅ Wildfire alerts triggered manually", 200
    
    # Hurricane risk alerts
    #send_hurricane_risk_alerts()
    #return "✅ Hurricane alerts manually triggered", 200

    #Tornado risk alerts
    #send_tornado_risk_alerts()
    #return "✅ Tornado alerts manually triggered", 200

# ✅ Health Check Route
@app.route('/')
def home():
    return "Flask Backend Running!"

import scheduler_init

# ✅ Run the Flask app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)