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
import folium
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dense, Conv1D, Flatten
from sklearn.ensemble import RandomForestRegressor
from statsmodels.tsa.arima.model import ARIMA

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
BASE_URL = "https://fs-51ng.onrender.com"  # Update with your actual Render backend URL

ALLOWED_EXTENSIONS = {"csv"}

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/predict-wildfire", methods=["POST"])
def predict_wildfire():
    """Handles wildfire file uploads and runs the prediction model."""

    # ✅ Step 1: Check if a file is uploaded
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "" or not file.filename.endswith(".csv"):
        return jsonify({"error": "Invalid file format"}), 400

    # ✅ Step 2: Save File Securely
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # ✅ Step 3: Load Dataset
    try:
        data = pd.read_csv(file_path)
    except Exception as e:
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
        data = data.dropna(subset=["latitude", "longitude"])  
        kmeans = KMeans(n_clusters=5, random_state=42, n_init=10)
        data["fire_cluster"] = kmeans.fit_predict(data[["latitude", "longitude"]])

    # ✅ Step 6: Prepare Data for Model Training
    if "confidence" not in data.columns:
        return jsonify({"error": "Dataset is missing the 'confidence' column."}), 400

    X_rf = data.select_dtypes(include=[np.number]).drop(columns=["confidence"], errors="ignore")
    y_rf = data["confidence"]

    # ✅ Step 7: Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(X_rf, y_rf, test_size=0.2, random_state=42)

    # ✅ Step 8: Train Random Forest Model
    rf_model = RandomForestClassifier(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)

    # ✅ Step 9: Simulate Future Predictions
    future_data = X_test.copy()
    future_data["predicted_confidence"] = rf_model.predict(future_data)

    # ✅ Step 10: Save Predictions to CSV
    future_predictions_file = os.path.join(UPLOAD_FOLDER, "future_wildfire_predictions.csv")
    future_data.to_csv(future_predictions_file, index=False)

    # ✅ Step 11: Generate Graphs & PDF Report
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", style="B", size=20)
    pdf.cell(0, 150, "Wildfire Future Prediction Report", ln=True, align="C")

    # 📊 1. Wildfire Prone Areas (K-Means Clustering)
    if "fire_cluster" in data.columns:
        plt.figure(figsize=(10, 6))
        sns.scatterplot(x=data["longitude"], y=data["latitude"], hue=data["fire_cluster"], palette="coolwarm")
        plt.xlabel("Longitude")
        plt.ylabel("Latitude")
        plt.title("Wildfire Prone Areas (K-Means Clustering)")
        plt.savefig("fire_clusters.png")
        pdf.add_page()
        pdf.image("fire_clusters.png", x=10, y=30, w=180)
        pdf.set_font("Arial", size=10)
        pdf.ln(120)
        pdf.multi_cell(0, 10, "This visualization displays wildfire-prone areas based on K-Means clustering. "
                       "Each color represents a different cluster, helping in identifying high-risk wildfire zones.")

    # 📊 2. Feature Importance
    feature_importance = pd.Series(rf_model.feature_importances_, index=X_rf.columns).sort_values(ascending=False)
    plt.figure(figsize=(10, 5))
    sns.barplot(x=feature_importance.values, y=feature_importance.index, palette="viridis")
    plt.xlabel("Feature Importance")
    plt.ylabel("Features")
    plt.title("Important Factors Influencing Wildfire Occurrence")
    plt.savefig("feature_importance.png")
    pdf.add_page()
    pdf.image("feature_importance.png", x=10, y=30, w=180)
    pdf.set_font("Arial", size=10)
    pdf.ln(110)
    pdf.multi_cell(0, 10, "This bar chart represents the key factors influencing wildfire occurrences. "
                       "Higher values indicate that a feature plays a more significant role in predicting wildfires.")

    # 📊 3. Predictions Distribution
    plt.figure(figsize=(8, 5))
    sns.histplot(future_data["predicted_confidence"], bins=3, kde=True, color="red")
    plt.xlabel("Predicted Fire Confidence Level")
    plt.ylabel("Count")
    plt.title("Future Wildfire Predictions Distribution")
    plt.savefig("prediction_distribution.png")
    pdf.add_page()
    pdf.image("prediction_distribution.png", x=10, y=30, w=180)
    pdf.set_font("Arial", size=10)
    pdf.ln(140)
    pdf.multi_cell(0, 10, "This histogram shows the predicted confidence levels of future wildfires. "
                       "Higher confidence values indicate a higher likelihood of a wildfire occurring in that area.")

    # 📊 4. Top 5 Wildfire-Prone Areas (Before Prediction)
    plt.figure(figsize=(10, 5))
    top5_before = data["fire_cluster"].value_counts().nlargest(5)
    sns.barplot(x=top5_before.index, y=top5_before.values, palette="Blues")
    plt.xlabel("Cluster ID (Before Prediction)")
    plt.ylabel("Number of Wildfires")
    plt.title("Top 5 Wildfire-Prone Areas (Before Prediction)")
    plt.savefig("top5_before.png")
    pdf.add_page()
    pdf.image("top5_before.png", x=10, y=30, w=180)
    pdf.set_font("Arial", size=10)
    pdf.ln(110)
    pdf.multi_cell(0, 10, "This bar chart highlights the top 5 locations most affected by wildfires before prediction. "
                       "These areas had the highest number of wildfire occurrences in the dataset.")

    # 📊 5. Top 5 Wildfire-Prone Areas (After Prediction)
    plt.figure(figsize=(10, 5))
    top5_after = future_data["predicted_confidence"].value_counts().nlargest(5)
    sns.barplot(x=top5_after.index, y=top5_after.values, palette="Oranges")
    plt.xlabel("Predicted Fire Confidence Level")
    plt.ylabel("Count")
    plt.title("Top 5 Wildfire-Prone Areas (After Prediction)")
    plt.savefig("top5_after.png")
    pdf.add_page()
    pdf.image("top5_after.png", x=10, y=30, w=180)
    pdf.set_font("Arial", size=10)
    pdf.ln(110)
    pdf.multi_cell(0, 10, "This chart displays the predicted top 5 locations where wildfires are most likely to occur. "
                       "These areas require higher monitoring and preparedness efforts to prevent future disasters.")
    
    # ✅ Save the Wildfire Prediction Map in the Uploads Directory
    map_file = os.path.join(UPLOAD_FOLDER, "wildfire_predictions_map.html")

# Create Map Using Folium
    if "latitude" in future_data.columns and "longitude" in future_data.columns:
        m = folium.Map(location=[future_data["latitude"].mean(), future_data["longitude"].mean()], zoom_start=5)
        for _, row in future_data.iterrows():
            folium.CircleMarker(
            location=[row["latitude"], row["longitude"]],
            radius=5,
            color="red" if row["predicted_confidence"] > 1 else "orange",
            fill=True,
            fill_color="red" if row["predicted_confidence"] > 1 else "orange",
            fill_opacity=0.6,
            ).add_to(m)
        m.save(map_file)
    else:
        print("❌ Missing latitude/longitude data. Map cannot be generated.")


    # ✅ Set the correct URL for the downloadable map
    
    map_download_url = f"{BASE_URL}/download/wildfire_predictions_map.html"

    pdf.add_page()
    pdf.cell(200, 10, "Interactive Wildfire Prediction Map", ln=True, align="C")
    pdf.ln(10)
    pdf.multi_cell(0, 10, "This map represents the predicted locations of wildfires, color-coded based on predicted confidence levels. "
                       "Red markers indicate a high probability of fire occurrence, while orange markers indicate moderate risk.\n\n")

    pdf.set_text_color(0, 0, 255)  # Blue color for clickable link
    pdf.cell(0, 10, "Click here to download the wildfire prediction map", ln=True, link=map_download_url)
    pdf.set_text_color(0, 0, 0)  # Reset text color
    pdf_file = os.path.join(UPLOAD_FOLDER, "wildfire_future_predictions_report.pdf")
    pdf.output(pdf_file)



    return jsonify({
        "csv_file": f"{BASE_URL}/download/future_wildfire_predictions.csv",
        "pdf_file": f"{BASE_URL}/download/wildfire_future_predictions_report.pdf"
    }), 200

@app.route("/predict-earthquake", methods=["POST"])
def predict_earthquake():
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
    except Exception:
        return jsonify({"error": "Invalid CSV format"}), 400

    if "date_time" in df.columns:
        df["date_time"] = pd.to_datetime(df["date_time"], errors="coerce")
    else:
        return jsonify({"error": "Dataset must contain a 'date_time' column."}), 400

    required_columns = ["latitude", "longitude", "magnitude", "depth"]
    df_clean = df.dropna(subset=required_columns)
    df_clean[["magnitude", "depth", "latitude", "longitude"]] = MinMaxScaler().fit_transform(df_clean[["magnitude", "depth", "latitude", "longitude"]])
    
    time_steps = 15
    features = ["magnitude", "depth"]
    X, y = [], []
    for i in range(len(df_clean[features]) - time_steps):
        X.append(df_clean[features].values[i:i + time_steps])
        y.append(df_clean[features].values[i + time_steps])
    X, y = np.array(X), np.array(y)

    model = Sequential([
        LSTM(50, return_sequences=True, input_shape=(X.shape[1], X.shape[2])),
        LSTM(50, return_sequences=False),
        Dense(25),
        Dense(1)
    ])
    model.compile(optimizer='adam', loss='mse')
    model.fit(X, y, epochs=10, batch_size=16)

    future_steps = 50
    X_future = df_clean[features].values[-time_steps:].reshape(1, time_steps, len(features))
    predictions = []
    for _ in range(future_steps):
        pred = model.predict(X_future)
        predictions.append(pred[0][0])
        new_value = np.array([[pred[0][0], 0]]).reshape(1, 1, 2)
        X_future = np.append(X_future[:, 1:, :], new_value, axis=1)

    spatial_features = df_clean[['latitude', 'longitude']].values.reshape(-1, 2, 1)
    cnn_model = Sequential([
        Conv1D(filters=64, kernel_size=2, activation='relu', input_shape=(2, 1)),
        Flatten(),
        Dense(50, activation='relu'),
        Dense(2)
    ])
    cnn_model.compile(optimizer='adam', loss='mse')
    cnn_model.fit(spatial_features, df_clean[['latitude', 'longitude']].values, epochs=10, batch_size=16)

    future_locations = cnn_model.predict(spatial_features[-future_steps:])
    forecast_dates = pd.date_range(start=df_clean["date_time"].max(), periods=future_steps, freq='M')
    forecast_filename = os.path.join(UPLOAD_FOLDER, "earthquake_forecast.csv")
    forecast_df = pd.DataFrame({
        'Date': forecast_dates,
        'Predicted Magnitude': predictions,
        'Latitude': future_locations[:, 0],
        'Longitude': future_locations[:, 1]
    })
    forecast_df.to_csv(forecast_filename, index=False)

    # ✅ Generate Graphs
    # Earthquake Occurrences Over Time
    plt.figure(figsize=(12, 6))
    df_clean.set_index("date_time").resample("M").size().plot(kind="line", marker="o", color="blue")
    plt.title("Earthquake Occurrences Over Time")
    plt.xlabel("Year")
    plt.ylabel("Number of Earthquakes")
    plt.grid(True)
    plt.savefig("earthquake_occurrences.png")
    
    # Earthquake Magnitude Distribution Heatmap
    plt.figure(figsize=(10, 6))
    scatter = plt.scatter(df_clean['longitude'], df_clean['latitude'], c=df_clean['magnitude'],
                           s=df_clean['magnitude'] * 20, cmap='coolwarm', alpha=0.6, edgecolor="k")
    plt.title('Earthquake Magnitude Distribution')
    plt.xlabel('Longitude')
    plt.ylabel('Latitude')
    plt.colorbar(scatter, label='Magnitude')
    plt.savefig("magnitude_distribution.png")
    
    # Top 10 Most Affected Locations
    df_clean['location'] = df_clean['latitude'].astype(str) + ", " + df_clean['longitude'].astype(str)
    top_locations = df_clean['location'].value_counts().head(10)
    plt.figure(figsize=(12, 6))
    sns.barplot(x=top_locations.values, y=top_locations.index, palette="viridis")
    plt.xlabel("Number of Earthquakes")
    plt.ylabel("Location (Lat, Long)")
    plt.title("Top 10 Most Affected Locations")
    plt.grid(axis='x')
    plt.savefig("top_10_affected.png")
    
    # Earthquake Activity Over Years
    df_clean['year'] = df_clean['date_time'].dt.year
    earthquakes_per_year = df_clean.groupby('year').size()
    plt.figure(figsize=(12, 6))
    earthquakes_per_year.plot(kind='bar', color='coral', edgecolor='black')
    plt.xlabel("Year")
    plt.ylabel("Number of Earthquakes")
    plt.title("Earthquake Occurrences Per Year")
    plt.grid(axis='y')
    plt.savefig("earthquake_per_year.png")
    
    # ✅ Save Graphs into the PDF
    pdf_filename = os.path.join(UPLOAD_FOLDER, "earthquake_report.pdf")
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", style="B", size=20)
    pdf.cell(0, 150, "Earthquake Forecasting Report", ln=True, align="C")
    
    graphs = ["earthquake_occurrences.png", "magnitude_distribution.png", "top_10_affected.png", "earthquake_per_year.png"]
    descriptions = [
        "This graph shows the number of earthquakes occurring over time, revealing patterns and trends.",
        "This scatter plot represents earthquake magnitudes at different locations, with color indicating intensity.",
        "This bar chart displays the top 10 locations most affected by earthquakes based on historical data.",
        "This bar chart shows earthquake occurrences per year, helping to understand yearly variations."
    ]
    
    for i, graph in enumerate(graphs):
        if os.path.exists(graph):
            pdf.add_page()
            pdf.image(graph, x=10, y=30, w=180)
            pdf.set_font("Arial", size=10)
            pdf.ln(110)
            pdf.multi_cell(0, 10, descriptions[i])
    
    pdf.output(pdf_filename)

    if not os.path.exists(forecast_filename) or not os.path.exists(pdf_filename):
        return jsonify({"error": "Generated report files not found."}), 500

    return jsonify({
        "csv_file": f"{BASE_URL}/download/earthquake_forecast.csv",
        "pdf_file": f"{BASE_URL}/download/earthquake_report.pdf"
    }), 200



@app.route("/predict-tornado", methods=["POST"])
def predict_tornado():
    """Handles tornado file uploads and runs the prediction model."""

    # ✅ Step 1: Check if a file is uploaded
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "" or not file.filename.endswith(".csv"):
        return jsonify({"error": "Invalid file format"}), 400

    # ✅ Step 2: Save File Securely
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # ✅ Step 3: Load Dataset
    try:
        data = pd.read_csv(file_path)
    except Exception as e:
        return jsonify({"error": "Invalid CSV format"}), 400

    # ✅ Step 4: Ensure Required Columns Exist
    required_columns = ['yr', 'mo', 'dy', 'slat', 'slon', 'elat', 'elon', 'len', 'wid', 'mag', 'loss', 'closs', 'inj', 'fat', 'st']
    missing_columns = [col for col in required_columns if col not in data.columns]
    if missing_columns:
        return jsonify({"error": f"Missing required columns: {missing_columns}"}), 400

    # ✅ Step 5: Data Preprocessing
    data = data[required_columns].dropna()
    scaler = MinMaxScaler()
    numeric_cols = ['len', 'wid', 'mag', 'loss', 'closs', 'inj', 'fat']
    data[numeric_cols] = scaler.fit_transform(data[numeric_cols])

    # ✅ Step 6: Tornado Yearly Occurrences
    tornado_yearly = data.groupby('yr').size()

    # ✅ Step 7: ARIMA Forecasting for Next 10 Years
    forecast_generated = False
    if len(tornado_yearly) > 10:
        model_arima = ARIMA(tornado_yearly, order=(5,1,0))
        model_arima_fit = model_arima.fit()
        forecast_years = 10
        future_years = list(range(tornado_yearly.index[-1] + 1, tornado_yearly.index[-1] + 1 + forecast_years))
        forecast_arima = model_arima_fit.forecast(steps=forecast_years)

        plt.figure(figsize=(10, 5))
        plt.plot(tornado_yearly.index, tornado_yearly.values, label="Actual Tornado Occurrences", marker='o', linestyle='-')
        plt.plot(future_years, forecast_arima, label="Forecasted Tornado Occurrences", marker='o', linestyle='--', color='red')
        plt.xlabel("Year")
        plt.ylabel("Number of Tornadoes")
        plt.title("Tornado Occurrence Forecast (Next 10 Years)")
        plt.legend()
        plt.grid(True)
        plt.savefig("tornado_forecast.png")
        plt.close()
        forecast_generated = True

    # ✅ Step 8: Generate Interactive Tornado Map
    map_file = os.path.join(UPLOAD_FOLDER, "tornado_map.html")
    tornado_map = folium.Map(location=[38.0, -97.0], zoom_start=5)
    for _, row in data.iterrows():
        folium.Marker(
            location=[row['slat'], row['slon']],
            popup=f"Magnitude: {row['mag']} | Width: {row['wid']}m | Length: {row['len']}km",
            icon=folium.Icon(color='red', icon='cloud')
        ).add_to(tornado_map)
    tornado_map.save(map_file)

    # ✅ Step 9: Generate PDF Report
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", "B", 16)
    pdf.cell(200, 10, "Tornado Prediction Report", ln=True, align="C")
    pdf.ln(10)
    
    if forecast_generated:
        pdf.set_font("Arial", "B", 12)
        pdf.cell(0, 10, "Future Tornado Occurrences Forecast", ln=True, align="L")
        pdf.ln(5)
        pdf.set_font("Arial", "", 10)
        pdf.multi_cell(0, 10, "This forecast predicts tornado occurrences for the next 10 years using an ARIMA model.")
        pdf.ln(5)
        pdf.image("tornado_forecast.png", x=10, y=None, w=180)
        pdf.ln(10)
    
    # ✅ Add Interactive Map Link to PDF
    pdf.add_page()
    pdf.cell(200, 10, "Interactive Tornado Prediction Map", ln=True, align="C")
    pdf.ln(10)
    pdf.multi_cell(0, 10, "This map shows the locations of tornadoes based on recorded data.")
    pdf.set_text_color(0, 0, 255)
    pdf.cell(0, 10, "Click here to view the interactive tornado prediction map", ln=True, link=f"{BASE_URL}/download/tornado_map.html")
    pdf.set_text_color(0, 0, 0)
    
    pdf_file = os.path.join(UPLOAD_FOLDER, "tornado_report.pdf")
    pdf.output(pdf_file)

    # ✅ Step 10: Return JSON Response with File URLs
    return jsonify({
        "csv_file": f"{BASE_URL}/download/future_tornado_predictions.csv",
        "pdf_file": f"{BASE_URL}/download/tornado_report.pdf"
    }), 200

@app.route("/predict-hurricane", methods=["POST"])
def predict_hurricane():
    """Handles hurricane file uploads and runs the prediction model."""

    # ✅ Step 1: Check if a file is uploaded
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    if file.filename == "" or not file.filename.endswith(".csv"):
        return jsonify({"error": "Invalid file format"}), 400

    # ✅ Step 2: Save File Securely
    filename = secure_filename(file.filename)
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(file_path)

    # ✅ Step 3: Load Dataset
    try:
        data = pd.read_csv(file_path)
    except Exception as e:
        return jsonify({"error": "Invalid CSV format"}), 400

    # ✅ Step 4: Encode Categorical Features
    categorical_cols = ["Name", "Areas affected"]
    label_encoders = {}

    for col in categorical_cols:
        if col in data.columns:
            le = LabelEncoder()
            data[col] = le.fit_transform(data[col])
            label_encoders[col] = le

    # ✅ Step 5: Drop Unnecessary Columns and Normalize
    columns_to_drop = ["Start Date", "End Date"]
    X = data.drop(columns=[col for col in columns_to_drop if col in data.columns], errors="ignore")
    X = X.dropna()

    scaler = MinMaxScaler()
    X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

    # ✅ Step 6: Define Target Variable
    if "Category" not in data.columns:
        return jsonify({"error": "Dataset is missing the 'Category' column."}), 400

    y = data["Category"]

    # ✅ Step 7: Train-Test Split
    X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

    # ✅ Step 8: Train Random Forest Model
    rf_model = RandomForestRegressor(n_estimators=100, random_state=42)
    rf_model.fit(X_train, y_train)

    # ✅ Step 9: Simulate Future Predictions
    future_data = X_test.copy()
    future_data["Wind speed"] = np.random.uniform(50, 200, size=len(future_data))
    future_data["Pressure"] = np.random.uniform(900, 1020, size=len(future_data))
    future_data["Latitude"] = np.random.uniform(15.0, 45.0, size=len(future_data))
    future_data["Longitude"] = np.random.uniform(-100.0, -60.0, size=len(future_data))

    # ✅ Step 10: Predict Hurricane Categories
    future_predictions = rf_model.predict(future_data[X_train.columns])
    future_data["predicted_category"] = future_predictions

    # ✅ Step 11: Save Predictions to CSV
    future_predictions_file = os.path.join(UPLOAD_FOLDER, "future_hurricane_predictions.csv")
    future_data.to_csv(future_predictions_file, index=False)

    # ✅ Step 12: Generate Interactive Map
    map_file = os.path.join(UPLOAD_FOLDER, "hurricane_predictions_map.html")
    if "Latitude" in future_data.columns and "Longitude" in future_data.columns:
        hurricane_map = folium.Map(location=[30.0, -85.0], zoom_start=4)
        for _, row in future_data.iterrows():
            color = "red" if row["predicted_category"] >= 4 else \
                    "orange" if row["predicted_category"] >= 3 else \
                    "yellow" if row["predicted_category"] >= 2 else "green"
            folium.CircleMarker(
                location=[row["Latitude"], row["Longitude"]],
                radius=max(5, row["predicted_category"] * 3),
                color=color,
                fill=True,
                fill_color=color,
                fill_opacity=0.7,
                popup=f"Predicted Category: {row['predicted_category']:.1f}"
            ).add_to(hurricane_map)
        hurricane_map.save(map_file)

    # ✅ Step 13: Generate PDF Report
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", style="B", size=20)
    pdf.cell(0, 150, "Hurricane Future Prediction Report", ln=True, align="C")

    # 📊 Add Graphs to PDF
    graphs = [
        ("Feature Importance", "feature_importance.png", "This chart shows the most influential factors in predicting hurricanes."),
        ("Future Predictions Distribution", "prediction_distribution.png", "This histogram shows the spread of predicted hurricane categories."),
        ("Wind Speed vs Pressure", "wind_vs_pressure.png", "A scatter plot highlighting how pressure and wind speed correlate with hurricane intensity."),
        ("Top 5 Affected Regions", "top5_affected_before.png", "This bar chart displays the most hurricane-prone areas based on historical data."),
        ("Predicted Hurricane Categories", "predicted_categories.png", "A count plot showing the predicted distribution of hurricane categories."),
    ]

    for title, img, description in graphs:
        plt.figure(figsize=(10, 5))
        if title == "Feature Importance":
            feature_importance = pd.Series(rf_model.feature_importances_, index=X.columns).sort_values(ascending=False)
            sns.barplot(x=feature_importance.values, y=feature_importance.index, palette="viridis")
        elif title == "Future Predictions Distribution":
            sns.histplot(future_data["predicted_category"], bins=5, kde=True, color="red")
        elif title == "Wind Speed vs Pressure":
            sns.scatterplot(x=future_data["Pressure"], y=future_data["Wind speed"], hue=future_data["predicted_category"], palette="coolwarm")
        elif title == "Top 5 Affected Regions":
            top5_affected_before = data["Areas affected"].value_counts().nlargest(5)
            sns.barplot(x=top5_affected_before.index, y=top5_affected_before.values, palette="Blues")
        elif title == "Predicted Hurricane Categories":
            sns.countplot(x=future_data["predicted_category"], palette="Oranges")

        plt.xlabel("Feature" if title == "Feature Importance" else "")
        plt.ylabel("Importance Score" if title == "Feature Importance" else "Count")
        plt.title(title)
        plt.xticks(rotation=45 if title == "Top 5 Affected Regions" else 0)
        plt.savefig(img)
        pdf.add_page()
        pdf.image(img, x=10, y=30, w=180)
        pdf.ln(110)
        pdf.multi_cell(0, 10, description)

    # 📊 Add Interactive Map Link to PDF
    pdf.add_page()
    pdf.cell(200, 10, "Interactive Hurricane Prediction Map", ln=True, align="C")
    pdf.ln(10)
    pdf.multi_cell(0, 10, "This map represents predicted hurricane locations, color-coded by severity:\n"
                        "Green (Category <2), Yellow (2-3), Orange (3-4), Red (>=4).")
    pdf.set_text_color(0, 0, 255)
    pdf.cell(0, 10, "Click here to view the interactive hurricane prediction map", ln=True, link=f"{BASE_URL}/download/hurricane_predictions_map.html")
    pdf.set_text_color(0, 0, 0)

    pdf_file = os.path.join(UPLOAD_FOLDER, "hurricane_future_predictions_report.pdf")
    pdf.output(pdf_file)

    # ✅ Step 14: Return JSON Response with File URLs
    return jsonify({
        "csv_file": f"{BASE_URL}/download/future_hurricane_predictions.csv",
        "pdf_file": f"{BASE_URL}/download/hurricane_future_predictions_report.pdf"
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



# ✅ Health Check Route
@app.route('/')
def home():
    return "Flask Backend Running!"

# ✅ Run the Flask app
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5000, debug=True)
