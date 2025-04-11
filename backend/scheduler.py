# scheduler.py

from app import app, db, User, OPENWEATHER_API_KEY, SMTP_USERNAME, SMTP_PASSWORD, SMTP_SERVER, SMTP_PORT
import datetime
import requests
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import smtplib
from apscheduler.schedulers.blocking import BlockingScheduler

def send_daily_alert_emails():
    with app.app_context():
        users = User.query.filter(User.zipcode.isnot(None)).all()
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

                url = (
                    f"https://api.openweathermap.org/data/3.0/onecall"
                    f"?lat={lat}&lon={lon}&exclude=minutely"
                    f"&appid={OPENWEATHER_API_KEY}&units=metric"
                )
                weather_response = requests.get(url)
                weather_data = weather_response.json()
                alerts = weather_data.get("alerts", [])

                if not alerts:
                    body = "<h2>📬 No Active Weather Alerts</h2><p>This is your daily forecast update from Foresight.</p>"
                else:
                    body = "<h2>🚨 Active Weather Alerts</h2>"
                    for i, alert in enumerate(alerts):
                        body += f"""
                            <hr>
                            <h3>🔔 Alert #{i + 1}: {alert['event']}</h3>
                            <p><strong>From:</strong> {datetime.datetime.utcfromtimestamp(alert['start']).strftime('%Y-%m-%d %H:%M UTC')}</p>
                            <p><strong>To:</strong> {datetime.datetime.utcfromtimestamp(alert['end']).strftime('%Y-%m-%d %H:%M UTC')}</p>
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

# ⏰ Schedule it
scheduler = BlockingScheduler()
scheduler.add_job(send_daily_alert_emails, "cron", hour=0, minute=0)  # UTC midnight
print("⏰ Scheduler started...")
scheduler.start()
