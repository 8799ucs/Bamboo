from flask import Flask, request, jsonify, send_from_directory, render_template
import sqlite3, qrcode, os
from flask_cors import CORS
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "static/images"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif"}
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs("qrcodes", exist_ok=True)
DB = "handmade.db"

def init_db():
    with sqlite3.connect(DB) as conn:
        conn.execute('''
            CREATE TABLE IF NOT EXISTS handmade (
                id TEXT,
                artist TEXT,
                origin TEXT,
                about TEXT,
                price REAL,
                value TEXT,
                dom TEXT,
                category TEXT,
                link TEXT
            )
        ''')

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route("/add", methods=["POST"])
def add_product():
    data = request.form

    # Log incoming data for debugging purposes
    print("Received data:", data)

    # Try to get and validate the product ID
    try:
        product_id = data.get('id')
        if not product_id:
            return jsonify({"error": "Product ID is required."}), 400
    except ValueError:
        return jsonify({"error": "Invalid product ID. Please provide a valid ID."}), 400

    try:
        price = float(data.get('price', 0))  # Ensure price is a valid float
    except ValueError:
        return jsonify({"error": "Invalid price. Please provide a valid number."}), 400

    file = request.files.get('image')
    image_filename = None
    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        image_filename = f"product_{data['artist'].replace(' ', '_')}_{filename}"
        file.save(os.path.join(app.config["UPLOAD_FOLDER"], image_filename))

    # Open database connection and execute the INSERT query
    try:
        with sqlite3.connect(DB) as conn:
            cur = conn.cursor()

            # Insert the product into the database
            cur.execute('''INSERT INTO handmade 
                            (id, artist, origin, about, price, value, dom, category, link)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''', (
                product_id, data['artist'], data['origin'], data['about'], price,
                data['value'], data['dom'], data['category'], data['link']
            ))

            # Commit the changes
            conn.commit()
            print(f"Product added with ID: {product_id}")  # Debugging line
    except sqlite3.Error as e:
        print(f"Database error: {e}")
        return jsonify({"error": "Database error, unable to store product."}), 500

    # Generate QR Code
    product_url = f"http://localhost:5000/product/{product_id}"
    qr_img = qrcode.make(product_url)
    qr_path = f"qrcodes/product_{product_id}.png"
    qr_img.save(qr_path)

    # Optionally rename image to match product ID
    if image_filename:
        new_name = f"product_{product_id}.png"
        os.rename(os.path.join(app.config["UPLOAD_FOLDER"], image_filename),
                  os.path.join(app.config["UPLOAD_FOLDER"], new_name))

    return jsonify({"success": True, "id": product_id})



@app.route("/api/product/<product_id>")
def get_product_json(product_id):
    with sqlite3.connect(DB) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT * FROM handmade WHERE id = ?", (product_id,)).fetchone()
        if row:
            return jsonify(dict(row))
        return jsonify({'error': 'Product not found'}), 404


@app.route("/products", methods=["GET"])
def get_products():
    with sqlite3.connect(DB) as conn:
        conn.row_factory = sqlite3.Row
        rows = conn.execute("SELECT * FROM handmade").fetchall()
        return jsonify([dict(row) for row in rows])

@app.route('/products/<product_id>', methods=['DELETE'])
def delete_product(product_id):
    with sqlite3.connect(DB) as conn:
        conn.execute('DELETE FROM handmade WHERE id = ?', (product_id,))
        conn.commit()
    
    qr_file = f"qrcodes/product_{product_id}.png"
    if os.path.exists(qr_file):
        os.remove(qr_file)

    return jsonify({'message': 'Product deleted successfully'}), 200

@app.route("/product/<product_id>")
def show_product(product_id):
    with sqlite3.connect(DB) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT * FROM handmade WHERE id = ?", (product_id,)).fetchone()

    if row:
        return render_template("product.html", product=dict(row))
    else:
        # Show a custom error page or return a simple message
        return render_template("404.html", message="Product not found"), 404



@app.route("/qrcodes/<filename>")
def serve_qr(filename):
    return send_from_directory("qrcodes", filename)

if __name__ == "__main__":
    init_db()
    app.run(debug=True)
