from flask import Flask
from auth import login

app = Flask(__name__)

@app.route("/")
def home():
    return {"message": "Secure Medical Backend Running"}

app.add_url_rule(
    "/api/login",
    "login",
    login,
    methods=["POST"]
)

if __name__ == "__main__":
    app.run(debug=True)