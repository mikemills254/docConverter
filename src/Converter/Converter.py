from flask import Flask, request, jsonify, send_file, send_from_directory
from flask_cors import CORS, cross_origin
from pdf2docx import Converter
import os

app = Flask(__name__)
CORS(app, resources={r'/*': {'origins': 'http://localhost:5173'}})

#global variables
UPLOADS_DIR = 'Uploads'
CONVERTED_DIR = 'Converted'
file_locations = []
docx_locations = []

if not os.path.exists(UPLOADS_DIR):
    os.makedirs(UPLOADS_DIR)

if not os.path.exists(CONVERTED_DIR):
    os.makedirs(CONVERTED_DIR)

#function to handle pdf fileUpload
#returns message if successful upload of pdf files
@app.route('/uploadFile', methods=['POST'])
def handle_file_upload():
    try:
        uploaded_files = request.files.getlist('files')
        
        for file in uploaded_files:
            if file.filename != '':
                pdf_file_location = os.path.join(UPLOADS_DIR, file.filename)
                file.save(pdf_file_location)
                file_locations.append(pdf_file_location)
                print('Uploaded file', file.filename)

        convert_to_docx()
        return jsonify({"message": "Files uploaded and conversion started."}), 200

    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({"error": "An error has occurred uploading the files"})

#converts uploaded pdf files to docx
#returns array of docx file locations
def convert_to_docx():
    global docx_locations

    for pdf_file_location in file_locations:
        pdf_filename = os.path.basename(pdf_file_location)
        docx_filename = os.path.splitext(pdf_filename)[0] + '.docx'
        docx_file_location = os.path.join(CONVERTED_DIR, docx_filename)

        cv = Converter(pdf_file_location)
        cv.convert(docx_file_location, start=0, end=None)
        cv.close()

        docx_locations.append(docx_file_location)

    print('Successfully converted files to docx')
    print('Docx file locations', docx_locations)
    return docx_locations


@app.route('/downloadLinks', methods=['GET'])
def handle_generate_links():
    try:
        if not docx_locations:
            return jsonify({"message": "No files have been uploaded yet."}), 200

        file_info = [{"filename": os.path.basename(loc), "location": loc} for loc in docx_locations]

        return jsonify({"file_info": file_info}), 200

    except Exception as e:
        print(f'Error: {str(e)}')
        return jsonify({"error": "An error has occurred generating file information"})


if __name__ == '__main__':
    app.run(debug=True)
